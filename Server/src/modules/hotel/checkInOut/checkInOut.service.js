import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const generateStayRef = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `STY-${Date.now().toString().slice(-6)}${randHex}`;
};

export const checkIn = async (hotelContext, checkInData) => {
  const Reservation = await getModel(hotelContext, "Reservation");
  const ReservationRoom = await getModel(hotelContext, "ReservationRoom");
  const Guest = await getModel(hotelContext, "Guest");
  const Room = await getModel(hotelContext, "Room");
  const Stay = await getModel(hotelContext, "Stay");
  const StayRoom = await getModel(hotelContext, "StayRoom");

  const { reservation_id, room_id, primary_guest_id, total_guests = 1, notes } = checkInData;

  if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
  }

  // 1. Cross-tenant & existence check for Reservation
  const reservation = await Reservation.findOne({ _id: reservation_id, hotelId: hotelContext });
  if (!reservation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found in this hotel");
  }

  if (reservation.status === "IN_HOUSE") {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Guest is already checked in for this reservation");
  }

  if (reservation.status === "CANCELLED" || reservation.status === "CHECKED_OUT") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot check in a reservation with status ${reservation.status}`);
  }

  // 2. Guest verification
  const targetGuestId = primary_guest_id || reservation.primary_guest_id;
  const guest = await Guest.findOne({ _id: targetGuestId, hotelId: hotelContext });
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Primary guest not found in this hotel");
  }

  // 3. Room assignment verification
  let targetRoomId = room_id;
  if (!targetRoomId) {
    const resRoom = await ReservationRoom.findOne({ reservation_id: reservation._id, hotelId: hotelContext });
    if (resRoom && resRoom.room_id) {
      targetRoomId = resRoom.room_id;
    }
  }

  if (!targetRoomId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No physical room assigned for check-in. Please select a room.");
  }

  if (!mongoose.Types.ObjectId.isValid(targetRoomId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Room ID format");
  }

  const room = await Room.findOne({ _id: targetRoomId, hotelId: hotelContext });
  if (!room) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
  }

  if (room.status === "OCCUPIED" || room.status === "OUT_OF_ORDER" || room.status === "MAINTENANCE") {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Room ${room.room_number} is currently ${room.status} and cannot be checked in`);
  }

  const stay_ref = generateStayRef();
  const checkInTime = new Date();

  // Compare-and-set claims serialize concurrent requests on standalone MongoDB too.
  const originalReservationStatus = reservation.status;
  const originalRoomStatus = room.status;
  const claimedReservation = await Reservation.findOneAndUpdate(
    { _id: reservation._id, hotelId: hotelContext, status: originalReservationStatus },
    { $set: { status: 'IN_HOUSE' } },
    { returnDocument: 'after' }
  );
  if (!claimedReservation) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Reservation changed during check-in; please refresh');
  }
  let claimedRoom;
  let stay;
  try {
    claimedRoom = await Room.findOneAndUpdate(
      { _id: room._id, hotelId: hotelContext, status: originalRoomStatus },
      { $set: { status: 'OCCUPIED' } },
      { returnDocument: 'after' }
    );
    if (!claimedRoom) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Room is no longer available for check-in');
    }
    stay = await Stay.create({
      hotelId: hotelContext, stay_ref, reservation_id: reservation._id,
      primary_guest_id: guest._id, status: 'CHECKED_IN', actual_check_in: checkInTime,
      total_guests, notes,
    });
    const stayRoom = await StayRoom.create({
      hotelId: hotelContext, stay_id: stay._id, room_id: room._id, guest_id: guest._id,
      check_in_time: checkInTime, status: 'OCCUPIED',
    });
    return { stay, stayRoom, room: claimedRoom, reservation: claimedReservation };
  } catch (error) {
    if (stay) {
      await StayRoom.deleteMany({ hotelId: hotelContext, stay_id: stay._id });
      await Stay.deleteOne({ hotelId: hotelContext, _id: stay._id });
    }
    if (claimedRoom) {
      await Room.updateOne({ _id: room._id, hotelId: hotelContext, status: 'OCCUPIED' },
        { $set: { status: originalRoomStatus } });
    }
    await Reservation.updateOne({ _id: reservation._id, hotelId: hotelContext, status: 'IN_HOUSE' },
      { $set: { status: originalReservationStatus } });
    throw error;
  }

};

export const checkOut = async (hotelContext, checkOutData) => {
  const Reservation = await getModel(hotelContext, "Reservation");
  const Room = await getModel(hotelContext, "Room");
  const Stay = await getModel(hotelContext, "Stay");
  const StayRoom = await getModel(hotelContext, "StayRoom");

  const { stay_id, reservation_id, notes } = checkOutData;

  let stay = null;
  if (stay_id) {
    if (!mongoose.Types.ObjectId.isValid(stay_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Stay ID format");
    }
    stay = await Stay.findOne({ _id: stay_id, hotelId: hotelContext });
  } else if (reservation_id) {
    if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    stay = await Stay.findOne({ reservation_id, hotelId: hotelContext, status: "CHECKED_IN" });
  }

  if (!stay) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Active stay record not found for check-out");
  }

  if (stay.status === "CHECKED_OUT") {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Guest is already checked out");
  }

  const checkOutTime = new Date();

  // 1. Update stay & stay room
  stay.status = "CHECKED_OUT";
  stay.actual_check_out = checkOutTime;
  if (notes) stay.notes = (stay.notes ? `${stay.notes}; ` : "") + notes;
  await stay.save();

  const stayRooms = await StayRoom.find({ stay_id: stay._id, hotelId: hotelContext, status: "OCCUPIED" });
  for (const sr of stayRooms) {
    sr.status = "VACATED";
    sr.check_out_time = checkOutTime;
    await sr.save();

    // Mark room as available and dirty for housekeeping
    const room = await Room.findOne({ _id: sr.room_id, hotelId: hotelContext });
    if (room) {
      room.status = "AVAILABLE";
      room.housekeeping_status = "DIRTY";
      await room.save();
    }
  }

  // 2. Update reservation status
  const reservation = await Reservation.findOne({ _id: stay.reservation_id, hotelId: hotelContext });
  if (reservation) {
    reservation.status = "CHECKED_OUT";
    await reservation.save();
  }

  return {
    stay,
    reservation,
  };
};

export const getStays = async (hotelContext, query = {}) => {
  const Stay = await getModel(hotelContext, "Stay");

  const filter = { hotelId: hotelContext };
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

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const stays = await Stay.find(filter)
    .populate("primary_guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref expected_check_in expected_check_out")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Stay.countDocuments(filter);

  return {
    stays,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getStayById = async (hotelContext, stayId) => {
  if (!mongoose.Types.ObjectId.isValid(stayId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Stay ID format");
  }

  const Stay = await getModel(hotelContext, "Stay");
  const StayRoom = await getModel(hotelContext, "StayRoom");

  const stay = await Stay.findOne({ _id: stayId, hotelId: hotelContext })
    .populate("primary_guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref expected_check_in expected_check_out");

  if (!stay) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Stay record not found");
  }

  const rooms = await StayRoom.find({ stay_id: stay._id, hotelId: hotelContext }).populate("room_id", "room_number status floor housekeeping_status");

  return {
    ...stay.toObject(),
    rooms,
  };
};
