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

export const checkIn = async (tenantConn, checkInData) => {
  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const Guest = await getModel(tenantConn, "Guest");
  const Room = await getModel(tenantConn, "Room");
  const Stay = await getModel(tenantConn, "Stay");
  const StayRoom = await getModel(tenantConn, "StayRoom");

  const { reservation_id, room_id, primary_guest_id, total_guests = 1, notes } = checkInData;

  if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
  }

  // 1. Cross-tenant & existence check for Reservation
  const reservation = await Reservation.findById(reservation_id);
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
  const guest = await Guest.findById(targetGuestId);
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Primary guest not found in this hotel");
  }

  // 3. Room assignment verification
  let targetRoomId = room_id;
  if (!targetRoomId) {
    const resRoom = await ReservationRoom.findOne({ reservation_id: reservation._id });
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

  const room = await Room.findById(targetRoomId);
  if (!room) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Room not found in this hotel");
  }

  if (room.status === "OCCUPIED" || room.status === "OUT_OF_ORDER" || room.status === "MAINTENANCE") {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Room ${room.room_number} is currently ${room.status} and cannot be checked in`);
  }

  const stay_ref = generateStayRef();
  const checkInTime = new Date();

  // 4. Perform check-in state transitions
  const stay = await Stay.create({
    stay_ref,
    reservation_id: reservation._id,
    primary_guest_id: guest._id,
    status: "CHECKED_IN",
    actual_check_in: checkInTime,
    total_guests,
    notes,
  });

  const stayRoom = await StayRoom.create({
    stay_id: stay._id,
    room_id: room._id,
    guest_id: guest._id,
    check_in_time: checkInTime,
    status: "OCCUPIED",
  });

  // Update room and reservation statuses
  room.status = "OCCUPIED";
  await room.save();

  reservation.status = "IN_HOUSE";
  await reservation.save();

  return {
    stay,
    stayRoom,
    room,
    reservation,
  };
};

export const checkOut = async (tenantConn, checkOutData) => {
  const Reservation = await getModel(tenantConn, "Reservation");
  const Room = await getModel(tenantConn, "Room");
  const Stay = await getModel(tenantConn, "Stay");
  const StayRoom = await getModel(tenantConn, "StayRoom");

  const { stay_id, reservation_id, notes } = checkOutData;

  let stay = null;
  if (stay_id) {
    if (!mongoose.Types.ObjectId.isValid(stay_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Stay ID format");
    }
    stay = await Stay.findById(stay_id);
  } else if (reservation_id) {
    if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    stay = await Stay.findOne({ reservation_id, status: "CHECKED_IN" });
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

  const stayRooms = await StayRoom.find({ stay_id: stay._id, status: "OCCUPIED" });
  for (const sr of stayRooms) {
    sr.status = "VACATED";
    sr.check_out_time = checkOutTime;
    await sr.save();

    // Mark room as available and dirty for housekeeping
    const room = await Room.findById(sr.room_id);
    if (room) {
      room.status = "AVAILABLE";
      room.housekeeping_status = "DIRTY";
      await room.save();
    }
  }

  // 2. Update reservation status
  const reservation = await Reservation.findById(stay.reservation_id);
  if (reservation) {
    reservation.status = "CHECKED_OUT";
    await reservation.save();
  }

  return {
    stay,
    reservation,
  };
};

export const getStays = async (tenantConn, query = {}) => {
  const Stay = await getModel(tenantConn, "Stay");

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

export const getStayById = async (tenantConn, stayId) => {
  if (!mongoose.Types.ObjectId.isValid(stayId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Stay ID format");
  }

  const Stay = await getModel(tenantConn, "Stay");
  const StayRoom = await getModel(tenantConn, "StayRoom");

  const stay = await Stay.findById(stayId)
    .populate("primary_guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref expected_check_in expected_check_out");

  if (!stay) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Stay record not found");
  }

  const rooms = await StayRoom.find({ stay_id: stay._id }).populate("room_id", "room_number status floor housekeeping_status");

  return {
    ...stay.toObject(),
    rooms,
  };
};
