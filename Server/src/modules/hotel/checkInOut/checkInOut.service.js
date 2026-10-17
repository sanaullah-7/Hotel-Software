import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { ROLES } from "../../../constants/roles.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";
import * as alertService from "../alerts/operationsAlert.service.js";

const generateStayRef = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `STY-${Date.now().toString().slice(-6)}${randHex}`;
};

export const checkIn = async (tenantConn, checkInData, currentUser = null) => {
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

  // Cleanliness Gate: Front Desk cannot check in dirty rooms without manager override
  const cleanStatuses = ['CLEAN', 'INSPECTED', 'INSPECTING'];
  const isDirty = room.housekeeping_status && !cleanStatuses.includes(room.housekeeping_status);
  if (isDirty) {
    const isOverrideRequested = Boolean(checkInData.manager_override || checkInData.override_cleanliness);
    if (!isOverrideRequested) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Room ${room.room_number} is currently ${room.housekeeping_status} and cannot be assigned without manager override`
      );
    }
    // Cleanliness override requires MANAGER/HOTEL_ADMIN or PLATFORM_ADMIN authority
    const isAuthorizedManager = currentUser && (currentUser.role === ROLES.HOTEL_ADMIN || currentUser.role === ROLES.PLATFORM_ADMIN);
    if (!isAuthorizedManager) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        `Cleanliness override for room ${room.room_number} requires manager authorization`
      );
    }
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

  // Professional Alert Hook: VIP Guest Check-In Alert
  if (guest?.vip_status) {
    try {
      const vipName = `${guest.first_name || ""} ${guest.last_name || ""}`.trim() || "VIP Guest";
      await alertService.createAlert(
        tenantConn,
        {
          title: `VIP Guest In-House: ${vipName}`,
          message: `VIP Guest ${vipName} has checked into Room ${room.room_number}. Ensure executive amenities and VIP hospitality protocol are active.`,
          department: "VIP_ARRIVALS",
          severity: "HIGH",
          location: `Room ${room.room_number}`,
          guest_name: vipName,
          action_required: "Provide VIP concierge support and executive welcome",
          reported_by: currentUser?.fullName || "Front Desk (Check-In)",
        },
        currentUser
      );
    } catch (vipErr) {
      console.warn("[CheckIn] VIP alert failed:", vipErr.message);
    }
  }

  return {
    stay,
    stayRoom,
    room,
    reservation,
  };
};

export const checkOut = async (tenantConn, checkOutData, currentUser = null) => {
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

      // Check for Rush Room (Same-day upcoming reservation for this room)
      let isRushRoom = false;
      let nextReservation = null;
      try {
        const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const upcomingResRooms = await ReservationRoom.find({ room_id: room._id });
        if (upcomingResRooms && upcomingResRooms.length > 0) {
          const resIds = upcomingResRooms.map((rr) => rr.reservation_id);
          nextReservation = await Reservation.findOne({
            _id: { $in: resIds },
            status: { $in: ["CONFIRMED", "PENDING"] },
            expected_check_in: { $gte: startOfToday, $lte: endOfToday },
          }).populate("primary_guest_id", "first_name last_name vip_status");

          if (nextReservation) {
            isRushRoom = true;
          }
        }
      } catch (rushErr) {
        console.warn("[CheckOut] Could not check rush reservation:", rushErr.message);
      }

      // Production Hook: Auto-create pending cleaning task for dirty room
      try {
        const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");
        const existingTask = await HousekeepingTask.findOne({
          room_id: room._id,
          is_deleted: false,
          status: { $in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
        });
        if (!existingTask) {
          await HousekeepingTask.create({
            room_id: room._id,
            task_type: "CLEANING",
            priority: isRushRoom ? "CRITICAL" : "HIGH",
            status: "PENDING",
            notes: isRushRoom
              ? `RUSH TURNAROUND: Incoming guest scheduled today (${nextReservation?.booking_ref || "Same-day booking"})`
              : "Checkout cleaning",
            scheduled_at: new Date(),
          });
        } else if (isRushRoom && existingTask.priority !== "CRITICAL") {
          existingTask.priority = "CRITICAL";
          existingTask.notes = `RUSH TURNAROUND: Incoming guest scheduled today (${nextReservation?.booking_ref || "Same-day booking"})`;
          await existingTask.save();
        }
      } catch (hkErr) {
        console.warn("[CheckOut] Could not auto-generate cleaning task:", hkErr.message);
      }

      // Professional Alert Hook 1: RUSH ROOM Turnover Alert
      if (isRushRoom && nextReservation) {
        try {
          const nextGuestName = nextReservation.primary_guest_id
            ? `${nextReservation.primary_guest_id.first_name || ""} ${nextReservation.primary_guest_id.last_name || ""}`.trim()
            : "Incoming Guest";
          await alertService.createAlert(
            tenantConn,
            {
              title: `Room ${room.room_number} - RUSH TURNAROUND (Incoming Guest Today)`,
              message: `Room ${room.room_number} vacated. Next guest ${nextGuestName} (${nextReservation.booking_ref}) is arriving today. Immediate turnaround cleaning and inspection required.`,
              department: "HOUSEKEEPING",
              severity: "CRITICAL",
              location: `Room ${room.room_number}`,
              guest_name: nextGuestName,
              action_required: "Expedite cleaning & supervisor inspection for same-day arrival",
              reported_by: currentUser?.fullName || "Front Office (Checkout Automated)",
            },
            currentUser
          );
        } catch (alertErr) {
          console.warn("[CheckOut] Failed to create Rush Room alert:", alertErr.message);
        }
      }

      // Professional Alert Hook 2: VIP Incoming Guest Alert
      if (nextReservation?.primary_guest_id?.vip_status) {
        try {
          const vipName =
            `${nextReservation.primary_guest_id.first_name || ""} ${nextReservation.primary_guest_id.last_name || ""}`.trim() ||
            "VIP Guest";
          await alertService.createAlert(
            tenantConn,
            {
              title: `VIP Arrival Today: ${vipName}`,
              message: `VIP Guest ${vipName} is scheduled to check into Room ${room.room_number} today (${nextReservation.booking_ref}). Prepare VIP welcome amenities and suite inspection.`,
              department: "VIP_ARRIVALS",
              severity: "CRITICAL",
              location: `Room ${room.room_number}`,
              guest_name: vipName,
              action_required: "Arrange VIP greeting, amenities setup, and manager inspection",
              reported_by: currentUser?.fullName || "Front Office (VIP Dispatch)",
            },
            currentUser
          );
        } catch (vipErr) {
          console.warn("[CheckOut] Failed to create VIP arrival alert:", vipErr.message);
        }
      }

      // Professional Alert Hook 3: Damage / Missing Item Alert
      const hasDamage =
        checkOutData?.damage_reported?.has_damage ||
        (checkOutData?.notes && checkOutData.notes.includes("Damage Added:"));
      if (hasDamage) {
        try {
          const itemName = checkOutData?.damage_reported?.item_name || "Room Item";
          const amount = checkOutData?.damage_reported?.amount || 0;
          const isMissing =
            checkOutData?.damage_reported?.is_missing ||
            itemName.toLowerCase().includes("missing");
          const dept = isMissing ? "HOUSEKEEPING" : "MAINTENANCE";
          await alertService.createAlert(
            tenantConn,
            {
              title: `Room ${room.room_number} - Checkout ${isMissing ? "Missing Item" : "Damage"} Reported`,
              message: `Reported during checkout inspection: ${itemName}${amount > 0 ? ` (${amount} PKR)` : ""}. Needs repair or replacement before re-assignment.`,
              department: dept,
              severity: "HIGH",
              location: `Room ${room.room_number}`,
              action_required: `Inspect, repair or replenish ${itemName} before room re-assignment`,
              reported_by: currentUser?.fullName || "Front Office (Checkout)",
            },
            currentUser
          );
        } catch (dmgAlertErr) {
          console.warn("[CheckOut] Failed to create damage alert:", dmgAlertErr.message);
        }
      }
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
  const StayRoom = await getModel(tenantConn, "StayRoom");

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

  const rawStays = await Stay.find(filter)
    .populate("primary_guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref expected_check_in expected_check_out")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const stays = rawStays;
  if (stays.length > 0) {
    const stayIds = stays.map((s) => s._id);
    const stayRooms = await StayRoom.find({
      stay_id: { $in: stayIds },
    })
      .populate("room_id", "room_number status floor housekeeping_status")
      .lean();

    const roomsByStayId = new Map();
    stayRooms.forEach((sr) => {
      const sId = sr.stay_id ? sr.stay_id.toString() : "";
      if (!roomsByStayId.has(sId)) roomsByStayId.set(sId, []);
      roomsByStayId.get(sId).push(sr);
    });

    stays.forEach((s) => {
      const sRooms = roomsByStayId.get(s._id.toString()) || [];
      s.rooms = sRooms;
      // Primary active occupied room
      const activeRoom = sRooms.find((sr) => sr.status === "OCCUPIED") || sRooms[0];
      if (activeRoom && activeRoom.room_id) {
        s.room_id = activeRoom.room_id._id || activeRoom.room_id;
        s.room_number = activeRoom.room_id.room_number || "";
      }
    });
  }

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

export const transferRoom = async (tenantConn, stayId, transferData, currentUser = null) => {
  if (!mongoose.Types.ObjectId.isValid(stayId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Stay ID format");
  }

  const destRoomId = transferData.room_id || transferData.new_room_id;
  const requestedSourceRoomId = transferData.source_room_id;
  const stay_room_id = transferData.stay_room_id;
  const {
    reason,
    notes,
    manager_override,
    override_cleanliness,
  } = transferData;

  if (!destRoomId || !mongoose.Types.ObjectId.isValid(destRoomId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid destination Room ID format");
  }

  const Stay = await getModel(tenantConn, "Stay");
  const StayRoom = await getModel(tenantConn, "StayRoom");
  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const Room = await getModel(tenantConn, "Room");

  // 1. Verify Stay and active status
  const stay = await Stay.findById(stayId);
  if (!stay) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Stay record not found in this hotel");
  }

  if (stay.status !== "CHECKED_IN") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Cannot transfer room for stay with status ${stay.status}. Only checked-in stays can be transferred.`
    );
  }

  const reservation = await Reservation.findById(stay.reservation_id);
  if (!reservation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Associated reservation not found");
  }

  // 2. Identify the active StayRoom assignment
  const stayRoomQuery = { stay_id: stay._id, status: "OCCUPIED" };
  if (stay_room_id) {
    if (!mongoose.Types.ObjectId.isValid(stay_room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid StayRoom ID format");
    }
    stayRoomQuery._id = stay_room_id;
  } else if (requestedSourceRoomId) {
    stayRoomQuery.room_id = requestedSourceRoomId;
  }

  const currentStayRoom = await StayRoom.findOne(stayRoomQuery);
  if (!currentStayRoom) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "No active room assignment found for this stay");
  }

  const sourceRoomId = currentStayRoom.room_id.toString();
  if (sourceRoomId === destRoomId.toString()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Destination room cannot be the same as current room");
  }

  // 3. Validate Destination Room existence & operational status
  const destRoom = await Room.findById(destRoomId);
  if (!destRoom) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Destination room not found in this hotel");
  }

  if (destRoom.status === "OCCUPIED" || destRoom.status === "OUT_OF_ORDER" || destRoom.status === "MAINTENANCE") {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Room ${destRoom.room_number} is currently ${destRoom.status} and cannot be transferred into`
    );
  }

  // Cleanliness gate check (consistent with checkIn)
  const cleanStatuses = ["CLEAN", "INSPECTED", "INSPECTING"];
  const isDirty = destRoom.housekeeping_status && !cleanStatuses.includes(destRoom.housekeeping_status);
  if (isDirty) {
    const isOverrideRequested = Boolean(manager_override || override_cleanliness);
    if (!isOverrideRequested) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Room ${destRoom.room_number} is currently ${destRoom.housekeeping_status} and cannot be assigned without manager override`
      );
    }
    const isAuthorizedManager = currentUser && (currentUser.role === ROLES.HOTEL_ADMIN || currentUser.role === ROLES.PLATFORM_ADMIN);
    if (!isAuthorizedManager) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        `Cleanliness override for room ${destRoom.room_number} requires manager authorization`
      );
    }
  }

  // 4. Overlap & booking lock dates
  const checkIn = new Date(reservation.expected_check_in);
  const checkOut = new Date(reservation.expected_check_out);

  // 5. Exact Source Lock Identification & Validation
  const sourceRoom = await Room.findById(sourceRoomId);
  if (!sourceRoom) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Source room not found in this hotel");
  }

  const matchingLocks = (sourceRoom.active_bookings || []).filter(
    (b) => b.reservation_id && b.reservation_id.toString() === reservation._id.toString()
  );

  if (matchingLocks.length === 0) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Source room booking lock not found for this active stay");
  }

  let sourceLockEntry = null;
  if (matchingLocks.length === 1) {
    sourceLockEntry = matchingLocks[0];
  } else {
    const dateMatchingLocks = matchingLocks.filter(
      (b) =>
        new Date(b.check_in).getTime() === checkIn.getTime() &&
        new Date(b.check_out).getTime() === checkOut.getTime()
    );

    if (dateMatchingLocks.length === 1) {
      sourceLockEntry = dateMatchingLocks[0];
    } else if (dateMatchingLocks.length > 1) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Ambiguous source room booking lock for this active stay");
    } else {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Source room booking lock with matching dates not found for this active stay"
      );
    }
  }

  const sourceLockId = sourceLockEntry._id;

  // Session / transaction support with fallback
  let session = null;
  try {
    session = await tenantConn.startSession();
  } catch {
    session = null;
  }

  const executeTransfer = async (sess) => {
    // 6. Atomic conditional lock acquisition on destination room
    const destLockId = new mongoose.Types.ObjectId();
    const lockedDestRoom = await Room.findOneAndUpdate(
      {
        _id: destRoom._id,
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
            _id: destLockId,
            reservation_id: reservation._id,
            check_in: checkIn,
            check_out: checkOut,
          },
        },
      },
      { returnDocument: "after", session: sess || null }
    );

    if (!lockedDestRoom) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Room ${destRoom.room_number} is already booked for the occupancy dates`
      );
    }

    // 7. Transition stay assignment & rooms with compensating rollback
    const transferTime = new Date();
    const oldDestRoomStatus = destRoom.status;
    const oldSourceRoomStatus = sourceRoom.status;
    const oldSourceRoomHousekeeping = sourceRoom.housekeeping_status;

    let newStayRoom = null;
    let currentStayRoomVacated = false;
    let resRoomUpdated = false;
    let destRoomOccupied = false;
    let sourceLockReleased = false;
    let sourceRoomUpdated = false;

    try {
      // A. Vacate current StayRoom
      currentStayRoom.status = "VACATED";
      currentStayRoom.check_out_time = transferTime;
      await currentStayRoom.save({ session: sess || null });
      currentStayRoomVacated = true;

      // B. Create new StayRoom
      const createdRooms = await StayRoom.create(
        [
          {
            stay_id: stay._id,
            room_id: destRoom._id,
            guest_id: currentStayRoom.guest_id || stay.primary_guest_id,
            check_in_time: transferTime,
            status: "OCCUPIED",
          },
        ],
        { session: sess || null }
      );
      newStayRoom = createdRooms[0];

      // C. Synchronize ReservationRoom
      await ReservationRoom.updateOne(
        { reservation_id: reservation._id, room_id: sourceRoom._id },
        {
          $set: {
            room_id: destRoom._id,
            ...(destRoom.room_type_id ? { room_type_id: destRoom.room_type_id } : {}),
          },
        },
        { session: sess || null }
      );
      resRoomUpdated = true;

      // D. Update Destination Room status: OCCUPIED
      destRoom.status = "OCCUPIED";
      await destRoom.save({ session: sess || null });
      destRoomOccupied = true;

      // E. Release Source Room lock ONLY by its unique _id
      const pullRes = await Room.updateOne(
        { _id: sourceRoom._id },
        { $pull: { active_bookings: { _id: sourceLockId } } },
        { session: sess || null }
      );
      if (pullRes.modifiedCount === 0) {
        throw new ApiError(HTTP_STATUS.CONFLICT, "Failed to release source room booking lock");
      }
      sourceLockReleased = true;

      // F. Update Source Room status with canonical preservation
      // Check if another active stay is still occupying the source room
      const otherActiveStay = await StayRoom.findOne({
        room_id: sourceRoom._id,
        status: "OCCUPIED",
        _id: { $ne: currentStayRoom._id },
      }).session(sess || null);

      if (otherActiveStay) {
        sourceRoom.status = "OCCUPIED";
      } else {
        // Preserve protected operational status (OUT_OF_ORDER, MAINTENANCE)
        if (sourceRoom.status !== "OUT_OF_ORDER" && sourceRoom.status !== "MAINTENANCE") {
          sourceRoom.status = "AVAILABLE";
        }
      }
      sourceRoom.housekeeping_status = "DIRTY";
      await sourceRoom.save({ session: sess || null });
      sourceRoomUpdated = true;

      // Production Hook: Auto-create pending cleaning task for vacated transfer room
      try {
        const HousekeepingTask = await getModel(tenantConn, "HousekeepingTask");
        const existingTask = await HousekeepingTask.findOne({
          room_id: sourceRoom._id,
          is_deleted: false,
          status: { $in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
        });
        if (!existingTask) {
          await HousekeepingTask.create({
            room_id: sourceRoom._id,
            task_type: "CLEANING",
            priority: "HIGH",
            status: "PENDING",
            notes: "Transfer cleaning for vacated room",
            scheduled_at: new Date(),
          });
        }
      } catch (hkErr) {
        console.warn("[TransferRoom] Could not auto-generate cleaning task:", hkErr.message);
      }

      // G. Record transfer note on Stay
      const transferNote = `Transferred from Room ${sourceRoom?.room_number || sourceRoomId} to Room ${destRoom.room_number} on ${transferTime.toISOString()}${reason || notes ? `: ${reason || notes}` : ""}`;
      stay.notes = stay.notes ? `${stay.notes}; ${transferNote}` : transferNote;
      await stay.save({ session: sess || null });
    } catch (err) {
      // Compensating rollback for non-transaction or failed executions
      let compensationFailure = null;
      try {
        // 1. Release destination lock by unique _id
        await Room.updateOne(
          { _id: destRoom._id },
          { $pull: { active_bookings: { _id: destLockId } } }
        );
        // 2. Remove newly created StayRoom
        if (newStayRoom && newStayRoom._id) {
          await StayRoom.findByIdAndDelete(newStayRoom._id);
        }
        // 3. Revert currentStayRoom to OCCUPIED
        if (currentStayRoomVacated) {
          currentStayRoom.status = "OCCUPIED";
          currentStayRoom.check_out_time = undefined;
          await currentStayRoom.save();
        }
        // 4. Revert ReservationRoom
        if (resRoomUpdated) {
          await ReservationRoom.updateOne(
            { reservation_id: reservation._id, room_id: destRoom._id },
            { $set: { room_id: sourceRoom._id } }
          );
        }
        // 5. Revert Destination Room status
        if (destRoomOccupied) {
          destRoom.status = oldDestRoomStatus;
          await destRoom.save();
        }
        // 6. Restore source lock if released
        if (sourceLockReleased && sourceRoom && sourceLockEntry) {
          await Room.updateOne(
            { _id: sourceRoom._id, "active_bookings._id": { $ne: sourceLockId } },
            { $push: { active_bookings: sourceLockEntry } }
          );
        }
        // 7. Revert Source Room status and housekeeping if updated
        if (sourceRoomUpdated) {
          sourceRoom.status = oldSourceRoomStatus;
          sourceRoom.housekeeping_status = oldSourceRoomHousekeeping;
          await sourceRoom.save();
        }
      } catch (cleanupErr) {
        compensationFailure = cleanupErr;
        console.error("[STAY TRANSFER ROLLBACK ERROR]", cleanupErr);
      }
      if (compensationFailure) {
        throw new ApiError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          `Transfer failed and compensation encountered errors: ${err.message}. Manual review required.`
        );
      }
      throw err;
    }

    return getStayById(tenantConn, stay._id);
  };

  if (session) {
    try {
      let result;
      await session.withTransaction(async (sess) => {
        result = await executeTransfer(sess);
      });
      return result;
    } catch (err) {
      if (
        err.name === "MongoServerError" &&
        (err.message.includes("Transaction numbers are only allowed") ||
          err.message.includes("Standalone"))
      ) {
        // Fallback exclusively for standalone Mongo deployments without replica sets
        return await executeTransfer(null);
      }
      throw err;
    } finally {
      await session.endSession().catch(() => {});
    }
  }

  return await executeTransfer(null);
};

