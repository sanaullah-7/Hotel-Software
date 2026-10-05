import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "IN_HOUSE"];

const generateBookingRef = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `RES-${Date.now().toString().slice(-6)}${randHex}`;
};

/**
 * Check room availability for a date range (checkIn to checkOut).
 * Overlap formula: existing.expected_check_in < checkOut AND existing.expected_check_out > checkIn
 */
export const checkAvailability = async (tenantConn, { check_in, check_out, room_type_id }) => {
  const checkIn = new Date(check_in);
  const checkOut = new Date(check_out);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid date range: check_out must be after check_in");
  }

  const RoomType = await getModel(tenantConn, "RoomType");
  const Room = await getModel(tenantConn, "Room");
  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");

  // Get room types filter
  const roomTypeFilter = room_type_id ? { _id: room_type_id } : {};
  const roomTypes = await RoomType.find(roomTypeFilter);

  if (room_type_id && roomTypes.length === 0) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room type not found in this hotel");
  }

  const results = [];

  for (const rt of roomTypes) {
    // Total physical rooms for this room type
    const totalRooms = await Room.countDocuments({ room_type_id: rt._id, status: { $ne: "OUT_OF_ORDER" } });

    // Active reservations overlapping this date range
    const activeReservations = await Reservation.find({
      status: { $in: ACTIVE_STATUSES },
      expected_check_in: { $lt: checkOut },
      expected_check_out: { $gt: checkIn },
    }).select("_id");

    const activeResIds = activeReservations.map((r) => r._id);

    // Count rooms booked for this room type in overlapping active reservations
    const bookedRoomsCount = await ReservationRoom.countDocuments({
      reservation_id: { $in: activeResIds },
      room_type_id: rt._id,
    });

    const availableCount = Math.max(0, totalRooms - bookedRoomsCount);

    results.push({
      room_type_id: rt._id,
      room_type_name: rt.name,
      room_type_code: rt.code,
      total_rooms: totalRooms,
      booked_rooms: bookedRoomsCount,
      available_rooms: availableCount,
      is_available: availableCount > 0,
    });
  }

  return results;
};

export const createReservation = async (tenantConn, reservationData) => {
  const Guest = await getModel(tenantConn, "Guest");
  const RoomType = await getModel(tenantConn, "RoomType");
  const Room = await getModel(tenantConn, "Room");
  const RatePlan = await getModel(tenantConn, "RatePlan");
  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");

  const {
    primary_guest_id,
    group_id,
    expected_check_in,
    expected_check_out,
    adults = 1,
    children = 0,
    special_requests,
    room_type_id,
    room_id,
    rate_plan_id,
  } = reservationData;

  const checkIn = new Date(expected_check_in);
  const checkOut = new Date(expected_check_out);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid reservation dates: check_out must be strictly after check_in");
  }

  // 1. Cross-tenant verification for Guest
  if (!mongoose.Types.ObjectId.isValid(primary_guest_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }
  const guest = await Guest.findById(primary_guest_id);
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found in this hotel");
  }

  // 2. Validate RoomType if provided
  let targetRoomType = null;
  if (room_type_id) {
    if (!mongoose.Types.ObjectId.isValid(room_type_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid RoomType ID format");
    }
    targetRoomType = await RoomType.findById(room_type_id);
    if (!targetRoomType) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "RoomType not found in this hotel");
    }
  }

  // 3. Validate Room if provided
  let targetRoom = null;
  if (room_id) {
    if (!mongoose.Types.ObjectId.isValid(room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
    }
    targetRoom = await Room.findById(room_id);
    if (!targetRoom) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
    }

    if (targetRoomType && targetRoom.room_type_id.toString() !== targetRoomType._id.toString()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Room does not belong to the specified RoomType");
    }

    if (!targetRoomType) {
      targetRoomType = await RoomType.findById(targetRoom.room_type_id);
    }
  }

  // 4. Double booking & Overlap check
  // Find active reservations overlapping requested dates
  const overlappingReservations = await Reservation.find({
    status: { $in: ACTIVE_STATUSES },
    expected_check_in: { $lt: checkOut },
    expected_check_out: { $gt: checkIn },
  }).select("_id");

  const overlappingIds = overlappingReservations.map((r) => r._id);

  let lockedRoom = null;
  if (targetRoom) {
    lockedRoom = await Room.findOneAndUpdate(
      {
        _id: targetRoom._id,
        active_bookings: {
          $not: {
            $elemMatch: {
              check_in: { $lt: checkOut },
              check_out: { $gt: checkIn },
            },
          },
        },
      },
      {
        $push: {
          active_bookings: {
            check_in: checkIn,
            check_out: checkOut,
          },
        },
      },
      { new: true }
    );
    if (!lockedRoom) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Room is already booked for the selected dates");
    }
  }
  let targetRatePlan = null;
  if (rate_plan_id) {
    if (!mongoose.Types.ObjectId.isValid(rate_plan_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid RatePlan ID format");
    }
    targetRatePlan = await RatePlan.findById(rate_plan_id);
    if (!targetRatePlan) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "RatePlan not found in this hotel");
    }
  }

  const booking_ref = generateBookingRef();

  try {
    const newRes = await Reservation.create({
      booking_ref,
      group_id: group_id || null,
      primary_guest_id,
      status: "CONFIRMED",
      expected_check_in: checkIn,
      expected_check_out: checkOut,
      adults,
      children,
      special_requests,
    });

    if (lockedRoom && newRes) {
      await Room.updateOne(
        { _id: lockedRoom._id, "active_bookings.check_in": checkIn, "active_bookings.check_out": checkOut },
        { $set: { "active_bookings.$.reservation_id": newRes._id } }
      );
    }

    let resRoom = null;
    if (targetRoomType) {
      const fallbackRatePlan = targetRatePlan ? targetRatePlan._id : (await RatePlan.findOne({}))?._id || newRes._id;
      resRoom = await ReservationRoom.create({
        reservation_id: newRes._id,
        room_type_id: targetRoomType._id,
        room_id: targetRoom ? targetRoom._id : null,
        rate_plan_id: fallbackRatePlan,
        adults,
        children,
      });
    }

    return {
      reservation: newRes,
      room_details: resRoom,
    };
  } catch (err) {
    console.error("[RESERVATION CREATE ERROR]", err);
    if (err.code === 11000) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Duplicate booking reference generated, please try again");
    }
    throw err;
  }
};

export const getReservations = async (tenantConn, query = {}) => {
  const Reservation = await getModel(tenantConn, "Reservation");
  const Guest = await getModel(tenantConn, "Guest");

  const filter = {};

  const status = asString(query.status);
  if (status) {
    filter.status = status.toUpperCase();
  }

  const guestId = asString(query.primary_guest_id);
  if (guestId) {
    if (!mongoose.Types.ObjectId.isValid(guestId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
    }
    filter.primary_guest_id = guestId;
  }

  const checkIn = asString(query.check_in);
  if (checkIn) {
    filter.expected_check_in = { $gte: new Date(checkIn) };
  }

  const checkOut = asString(query.check_out);
  if (checkOut) {
    filter.expected_check_out = { $lte: new Date(checkOut) };
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const reservations = await Reservation.find(filter)
    .populate("primary_guest_id", "first_name last_name email phone guest_ref")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Reservation.countDocuments(filter);

  return {
    reservations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getReservationById = async (tenantConn, reservationId) => {
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
  }

  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");

  const reservation = await Reservation.findById(reservationId).populate(
    "primary_guest_id",
    "first_name last_name email phone guest_ref"
  );

  if (!reservation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found");
  }

  const rooms = await ReservationRoom.find({ reservation_id: reservation._id })
    .populate("room_type_id", "name code capacity base_price")
    .populate("room_id", "room_number status floor");

  return {
    ...reservation.toObject(),
    rooms,
  };
};

export const updateReservation = async (tenantConn, reservationId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
  }

  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const Room = await getModel(tenantConn, "Room");

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found");
  }

  if (["CANCELLED", "CHECKED_OUT"].includes(reservation.status) && updateData.status && updateData.status !== reservation.status) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot modify a reservation with status ${reservation.status}`);
  }

  if (updateData.status) {
    reservation.status = updateData.status;
  }
  if (updateData.special_requests !== undefined) {
    reservation.special_requests = updateData.special_requests;
  }
  if (updateData.cancellation_reason) {
    reservation.cancellation_reason = updateData.cancellation_reason;
  }

  if (updateData.expected_check_in || updateData.expected_check_out) {
    const newCheckIn = updateData.expected_check_in ? new Date(updateData.expected_check_in) : reservation.expected_check_in;
    const newCheckOut = updateData.expected_check_out ? new Date(updateData.expected_check_out) : reservation.expected_check_out;

    if (newCheckOut <= newCheckIn) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "expected_check_out must be strictly after expected_check_in");
    }

    const resRoom = await ReservationRoom.findOne({ reservation_id: reservation._id });
    if (resRoom && resRoom.room_id) {
      // Re-check overlap on room excluding this reservation
      const conflict = await Room.findOne({
        _id: resRoom.room_id,
        active_bookings: {
          $elemMatch: {
            reservation_id: { $ne: reservation._id },
            check_in: { $lt: newCheckOut },
            check_out: { $gt: newCheckIn },
          },
        },
      });
      if (conflict) {
        throw new ApiError(HTTP_STATUS.CONFLICT, "Room is already booked for the updated dates");
      }

      // Update room active_bookings entry
      await Room.updateOne(
        { _id: resRoom.room_id, "active_bookings.reservation_id": reservation._id },
        { $set: { "active_bookings.$.check_in": newCheckIn, "active_bookings.$.check_out": newCheckOut } }
      );
    }

    reservation.expected_check_in = newCheckIn;
    reservation.expected_check_out = newCheckOut;
  }

  await reservation.save();
  return getReservationById(tenantConn, reservationId);
};

export const cancelReservation = async (tenantConn, reservationId, cancellation_reason) => {
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
  }

  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const Room = await getModel(tenantConn, "Room");

  const reservation = await Reservation.findById(reservationId);

  if (!reservation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found");
  }

  if (reservation.status === "CANCELLED") {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Reservation is already cancelled");
  }

  if (reservation.status === "CHECKED_OUT" || reservation.status === "IN_HOUSE") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot cancel a reservation with status ${reservation.status}`);
  }

  reservation.status = "CANCELLED";
  reservation.cancellation_reason = cancellation_reason || "Cancelled by guest/staff";
  await reservation.save();

  // Release room booking from Room active_bookings
  const resRoom = await ReservationRoom.findOne({ reservation_id: reservation._id });
  if (resRoom && resRoom.room_id) {
    await Room.updateOne(
      { _id: resRoom.room_id },
      { $pull: { active_bookings: { reservation_id: reservation._id } } }
    );
  }

  return reservation;
};
