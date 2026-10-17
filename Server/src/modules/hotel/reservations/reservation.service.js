import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { withTransaction } from "../../../database/transaction.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";
import { getOrCreateFolioForReservation } from "../folios/folio.service.js";

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

  let {
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

  if (!room_type_id && !room_id) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Either room_type_id or room_id is required to create a reservation");
  }

  // 1. Cross-tenant verification for Guest
  let guest = null;
  if (primary_guest_id && mongoose.Types.ObjectId.isValid(primary_guest_id)) {
    guest = await Guest.findById(primary_guest_id);
  }

  // Fallback 1: Lookup by email or phone in this hotel
  const searchEmail = (reservationData.guest_email || reservationData.email)?.trim()?.toLowerCase();
  const searchPhone = (reservationData.guest_phone || reservationData.phone)?.trim();

  if (!guest && searchEmail) {
    guest = await Guest.findOne({ email: searchEmail });
  }
  if (!guest && searchPhone) {
    guest = await Guest.findOne({ phone: searchPhone });
  }

  // Fallback 2: Auto-create guest in this hotel if guest details are present
  if (!guest && (reservationData.first_name || reservationData.guest_name || searchEmail)) {
    const rawName = (reservationData.guest_name || `${reservationData.first_name || ''} ${reservationData.last_name || ''}`).trim();
    const parts = rawName.split(/\s+/);
    const firstName = reservationData.first_name || parts[0] || "Guest";
    const lastName = reservationData.last_name || parts.slice(1).join(" ") || "User";
    guest = await Guest.create({
      first_name: firstName,
      last_name: lastName,
      email: searchEmail || `${Date.now()}@guest.com`,
      phone: searchPhone || "03000000000",
      nationality: reservationData.nationality || null,
      national_id: reservationData.national_id || reservationData.idNumber || null,
    });
  }

  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found in this hotel");
  }
  primary_guest_id = guest._id;

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

    if (targetRoom.status === "OUT_OF_ORDER") {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Room is out of order and unavailable for reservation");
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

  const reservationId = new mongoose.Types.ObjectId();
  const lockEntryId = new mongoose.Types.ObjectId();

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
            _id: lockEntryId,
            reservation_id: reservationId,
            check_in: checkIn,
            check_out: checkOut,
          },
        },
      },
      { returnDocument: "after" }
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
  let newRes = null;
  let resRoom = null;

  try {
    newRes = await Reservation.create({
      _id: reservationId,
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

    // Auto-generate Folio, Room Rate GuestCharge, and Invoice
    let initialFolio = null;
    try {
      const msPerDay = 1000 * 60 * 60 * 24;
      const stayNights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay));
      const unitPrice = targetRoomType?.base_price ? Number(targetRoomType.base_price) : 0;
      const totalRoomCharge = unitPrice * stayNights;

      initialFolio = await getOrCreateFolioForReservation(tenantConn, newRes._id);

      if (initialFolio && totalRoomCharge > 0) {
        const Folio = await getModel(tenantConn, "Folio");
        const GuestCharge = await getModel(tenantConn, "GuestCharge");
        const Invoice = await getModel(tenantConn, "Invoice");
        const Payment = await getModel(tenantConn, "Payment");

        const chargeDescription = `Room Accommodation: ${targetRoomType?.name || 'Standard'} (${stayNights} Night${stayNights > 1 ? 's' : ''})`;
        const roomCharge = await GuestCharge.create({
          folio_id: initialFolio._id,
          guest_id: newRes.primary_guest_id,
          reservation_id: newRes._id,
          charge_type: "ROOM_RATE",
          item_name: `Room Charge - ${targetRoomType?.name || 'Standard'}`,
          quantity: stayNights,
          unit_price: unitPrice,
          description: chargeDescription,
          amount: totalRoomCharge,
          notes: `Auto-generated room charge for booking ref ${newRes.booking_ref}`,
          date: new Date(),
          is_voided: false,
        });

        await Folio.findByIdAndUpdate(initialFolio._id, { $inc: { balance: totalRoomCharge } });

        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        const newInvoice = await Invoice.create({
          invoice_number: invoiceNumber,
          folio_id: initialFolio._id,
          guest_id: newRes.primary_guest_id,
          total_amount: totalRoomCharge,
          tax_total: 0,
          amount_paid: 0,
          status: "UNPAID",
          line_items: [
            {
              charge_id: roomCharge._id,
              description: chargeDescription,
              amount: totalRoomCharge,
              tax_amount: 0,
            },
          ],
        });
        roomCharge.invoice_id = newInvoice._id;
        await roomCharge.save();

        const isPaid = reservationData.payment === 'Paid' || 
                       reservationData.payment === 'PAID' || 
                       reservationData.payment_status === 'Paid' || 
                       reservationData.payment_status === 'PAID';
        if (isPaid) {
          const paymentRef = `PAY-${Date.now().toString().slice(-6)}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
          await Payment.create({
            payment_ref: paymentRef,
            invoice_id: newInvoice._id,
            folio_id: initialFolio._id,
            guest_id: newRes.primary_guest_id,
            amount: totalRoomCharge,
            payment_method: reservationData.payment_method || reservationData.paymentMethod || "Cash",
            date: new Date(),
            status: "COMPLETED",
            refunded_amount: 0,
          });
          await Folio.findByIdAndUpdate(initialFolio._id, { $inc: { balance: -totalRoomCharge } });
          newInvoice.amount_paid = totalRoomCharge;
          newInvoice.status = "PAID";
          await newInvoice.save();
        }
      }
    } catch (billingErr) {
      console.warn("[AUTO_BILLING_INIT_WARN]", billingErr.message);
    }

    return {
      reservation: newRes,
      room_details: resRoom,
      folio: initialFolio,
    };
  } catch (err) {
    console.error("[RESERVATION CREATE ERROR]", err);
    if (lockedRoom) {
      try {
        await Room.updateOne(
          { _id: lockedRoom._id },
          {
            $pull: {
              active_bookings: {
                _id: lockEntryId,
              },
            },
          }
        );
      } catch (cleanupErr) {
        console.error("[RESERVATION LOCK CLEANUP ERROR]", cleanupErr);
      }
    }
    if (newRes && newRes._id) {
      try {
        await Reservation.findByIdAndDelete(reservationId);
      } catch (orphanErr) {
        console.error("[ORPHAN RESERVATION CLEANUP ERROR]", orphanErr);
      }
    }
    if (resRoom && resRoom._id) {
      try {
        await ReservationRoom.findByIdAndDelete(resRoom._id);
      } catch (orphanRoomErr) {
        console.error("[ORPHAN RESERVATION ROOM CLEANUP ERROR]", orphanRoomErr);
      }
    }
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
    .populate("primary_guest_id", "first_name last_name email phone guest_ref avatar")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const resIds = reservations.map((r) => r._id);
  const Folio = await getModel(tenantConn, "Folio");
  const openFolios = await Folio.find({
    reservation_id: { $in: resIds },
    status: "OPEN",
  }).select("reservation_id balance");

  const folioMap = {};
  openFolios.forEach((f) => {
    if (f.reservation_id) {
      folioMap[f.reservation_id.toString()] = Number(f.balance || 0);
    }
  });

  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const resRooms = await ReservationRoom.find({ reservation_id: { $in: resIds } })
    .populate("room_type_id", "name code base_price")
    .populate("room_id", "room_number floor status housekeeping_status");
  const roomPriceMap = {};
  const resRoomMap = {};
  resRooms.forEach((rr) => {
    if (rr.reservation_id) {
      const resIdStr = rr.reservation_id.toString();
      const price = Number(rr.room_type_id?.base_price || 0);
      roomPriceMap[resIdStr] = (roomPriceMap[resIdStr] || 0) + price;
      if (!resRoomMap[resIdStr]) resRoomMap[resIdStr] = [];
      resRoomMap[resIdStr].push(rr.toObject ? rr.toObject() : rr);
    }
  });

  const enrichedReservations = reservations.map((r) => {
    const obj = r.toObject ? r.toObject() : { ...r };
    const resIdStr = r._id.toString();
    const roomsList = resRoomMap[resIdStr] || [];
    obj.rooms = roomsList;
    if (roomsList.length > 0) {
      const firstRoom = roomsList[0];
      obj.room_id = firstRoom.room_id?._id || firstRoom.room_id;
      obj.room_number = firstRoom.room_id?.room_number || null;
      obj.room_type = firstRoom.room_type_id?.name || null;
      obj.room_type_id = firstRoom.room_type_id?._id || firstRoom.room_type_id;
    }
    const balance = folioMap[resIdStr];
    if (balance !== undefined) {
      obj.folio_balance = balance;
      obj.dues = balance;
    } else {
      const nights = Math.max(1, Math.round(((new Date(r.expected_check_out)) - (new Date(r.expected_check_in))) / (1000 * 60 * 60 * 24)));
      const baseRoomRate = (roomPriceMap[resIdStr] || 0) * nights;
      obj.folio_balance = baseRoomRate;
      obj.dues = baseRoomRate;
    }
    return obj;
  });

  const total = await Reservation.countDocuments(filter);

  return {
    reservations: enrichedReservations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getReservationById = async (tenantConn, reservationId) => {
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
  }

  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const Folio = await getModel(tenantConn, "Folio");

  const reservation = await Reservation.findById(reservationId).populate(
    "primary_guest_id",
    "first_name last_name email phone guest_ref avatar"
  );

  if (!reservation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found");
  }

  const openFolio = await Folio.findOne({
    reservation_id: reservation._id,
    status: "OPEN",
  }).select("balance");
  let folio_balance = openFolio ? Number(openFolio.balance || 0) : 0;

  const rooms = await ReservationRoom.find({ reservation_id: reservation._id })
    .populate("room_type_id", "name code capacity base_price")
    .populate("room_id", "room_number status floor");

  if (!openFolio && !["CHECKED_OUT", "CANCELLED"].includes(reservation.status)) {
    const nights = Math.max(1, Math.round(((new Date(reservation.expected_check_out)) - (new Date(reservation.expected_check_in))) / (1000 * 60 * 60 * 24)));
    const totalRate = rooms.reduce((sum, r) => sum + Number(r.room_type_id?.base_price || 0), 0) * nights;
    if (totalRate > 0) {
      folio_balance = totalRate;
    }
  }

  return {
    ...reservation.toObject(),
    folio_balance,
    dues: folio_balance,
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

export const reassignRoom = async (tenantConn, reservationId, reassignData) => {
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
  }

  const { room_id: destRoomId, reservation_room_id } = reassignData;

  if (!destRoomId || !mongoose.Types.ObjectId.isValid(destRoomId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid destination Room ID format");
  }

  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const Room = await getModel(tenantConn, "Room");

  // 1. Validate reservation existence and lifecycle eligibility
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found in this hotel");
  }

  if (reservation.status === "IN_HOUSE") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Reservation is currently checked in. Use active-stay room transfer for in-house guests."
    );
  }

  if (["CANCELLED", "CHECKED_OUT", "NO_SHOW"].includes(reservation.status)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Cannot reassign room for reservation with status ${reservation.status}`
    );
  }

  // 2. Identify target ReservationRoom assignment
  const query = { reservation_id: reservation._id };
  if (reservation_room_id) {
    if (!mongoose.Types.ObjectId.isValid(reservation_room_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid ReservationRoom ID format");
    }
    query._id = reservation_room_id;
  }

  const resRoom = await ReservationRoom.findOne(query);
  if (!resRoom) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation room assignment record not found");
  }

  const sourceRoomId = resRoom.room_id ? resRoom.room_id.toString() : null;
  if (sourceRoomId && sourceRoomId === destRoomId.toString()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Destination room cannot be the same as current assigned room");
  }

  // 3. Validate Destination Room existence & operational status
  const destRoom = await Room.findById(destRoomId);
  if (!destRoom) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Destination room not found in this hotel");
  }

  if (destRoom.status === "OUT_OF_ORDER") {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Room ${destRoom.room_number} is out of order and unavailable for reassignment`
    );
  }

  const checkIn = new Date(reservation.expected_check_in);
  const checkOut = new Date(reservation.expected_check_out);

  // 4. Exact Source Lock Identification & Validation
  let sourceRoom = null;
  let sourceLockEntry = null;
  let sourceLockId = null;

  if (sourceRoomId) {
    sourceRoom = await Room.findById(sourceRoomId);
    if (!sourceRoom) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Currently assigned source room not found in this hotel");
    }

    const matchingLocks = (sourceRoom.active_bookings || []).filter(
      (b) => b.reservation_id && b.reservation_id.toString() === reservation._id.toString()
    );

    if (matchingLocks.length === 0) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Source room booking lock not found for this reservation");
    }

    const dateMatchingLocks = matchingLocks.filter(
      (b) =>
        new Date(b.check_in).getTime() === checkIn.getTime() &&
        new Date(b.check_out).getTime() === checkOut.getTime()
    );

    if (dateMatchingLocks.length > 1) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Ambiguous source room booking lock for this reservation");
    }

    if (dateMatchingLocks.length === 0) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Source room booking lock with matching dates not found for this reservation"
      );
    }

    sourceLockEntry = dateMatchingLocks[0];
    sourceLockId = sourceLockEntry._id;
  }

  // Session / transaction support with fallback
  let session = null;
  try {
    session = await tenantConn.startSession();
  } catch {
    session = null;
  }

  const executeReassign = async (sess) => {
    // 5. Atomic conditional lock acquisition on destination room
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
        `Room ${destRoom.room_number} is already booked for the selected dates`
      );
    }

    // 6. Update assignment and release source lock with identity-specific rollback
    const oldSourceRoomId = resRoom.room_id;
    const oldSourceRoomTypeId = resRoom.room_type_id;
    let sourceLockReleased = false;

    try {
      resRoom.room_id = destRoom._id;
      if (destRoom.room_type_id) {
        resRoom.room_type_id = destRoom.room_type_id;
      }
      await resRoom.save({ session: sess || null });

      // Release source room lock ONLY by its unique _id
      if (sourceRoom && sourceLockId) {
        const pullRes = await Room.updateOne(
          { _id: sourceRoom._id },
          { $pull: { active_bookings: { _id: sourceLockId } } },
          { session: sess || null }
        );
        if (pullRes.modifiedCount === 0) {
          throw new ApiError(HTTP_STATUS.CONFLICT, "Failed to release source room booking lock");
        }
        sourceLockReleased = true;
      }
    } catch (err) {
      // Compensating rollback for standalone / non-transaction executions
      let compensationFailure = null;
      try {
        // A. Release destination lock by unique _id
        await Room.updateOne(
          { _id: destRoom._id },
          { $pull: { active_bookings: { _id: destLockId } } }
        );
        // B. Revert ReservationRoom assignment
        resRoom.room_id = oldSourceRoomId;
        resRoom.room_type_id = oldSourceRoomTypeId;
        await resRoom.save();
        // C. Restore source room lock if it was released
        if (sourceLockReleased && sourceRoom && sourceLockEntry) {
          await Room.updateOne(
            { _id: sourceRoom._id, "active_bookings._id": { $ne: sourceLockId } },
            { $push: { active_bookings: sourceLockEntry } }
          );
        }
      } catch (cleanupErr) {
        compensationFailure = cleanupErr;
        console.error("[REASSIGN ROOM ROLLBACK ERROR]", cleanupErr);
      }
      if (compensationFailure) {
        throw new ApiError(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          `Reassignment failed and compensation encountered errors: ${err.message}. Manual review required.`
        );
      }
      throw err;
    }

    return getReservationById(tenantConn, reservation._id);
  };

  if (session) {
    try {
      let result;
      await session.withTransaction(async (sess) => {
        result = await executeReassign(sess);
      });
      return result;
    } catch (err) {
      if (
        err.name === "MongoServerError" &&
        (err.message.includes("Transaction numbers are only allowed") ||
          err.message.includes("Standalone"))
      ) {
        // Fallback exclusively for standalone Mongo deployments without replica sets
        return await executeReassign(null);
      }
      throw err;
    } finally {
      await session.endSession().catch(() => {});
    }
  }

  return await executeReassign(null);
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

const generateGroupRef = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `GRP-${Date.now().toString().slice(-6)}${randHex}`;
};

export const getGroupReservations = async (tenantConn, query = {}) => {
  const ReservationGroup = await getModel(tenantConn, "ReservationGroup");

  const filter = {};
  const status = asString(query.status);
  if (status) {
    filter.status = status.toUpperCase();
  }

  const search = asString(query.search);
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const groups = await ReservationGroup.find(filter)
    .populate("guest_id", "first_name last_name email phone")
    .sort({ created_at: -1, _id: -1 });

  return groups;
};

export const getGroupReservationById = async (tenantConn, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Group Reservation ID format");
  }

  const ReservationGroup = await getModel(tenantConn, "ReservationGroup");
  const group = await ReservationGroup.findById(id).populate(
    "guest_id",
    "first_name last_name email phone"
  );

  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Group Reservation not found");
  }

  return group;
};

export const createGroupReservation = async (tenantConn, data) => {
  const Guest = await getModel(tenantConn, "Guest");
  const ReservationGroup = await getModel(tenantConn, "ReservationGroup");

  let guestId = data.guest_id;
  if (!guestId || !mongoose.Types.ObjectId.isValid(guestId)) {
    const contactName = (data.contact_person || data.contactPerson || "Group Contact").trim();
    const parts = contactName.split(/\s+/);
    const firstName = parts[0] || "Group";
    const lastName = parts.slice(1).join(" ") || "Contact";
    const email = data.email || `group_${Date.now()}@hotel.com`;
    const phone = data.phone || "";

    let guest = await Guest.findOne({
      $or: [{ email: email.toLowerCase() }, { first_name: firstName, last_name: lastName }],
    });

    if (!guest) {
      const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
      const guest_ref = `GST-${Date.now().toString().slice(-6)}${randomHex}`;
      guest = await Guest.create({
        guest_ref,
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone,
      });
    }
    guestId = guest._id;
  }

  const group_ref = generateGroupRef();
  const rawStatus = (data.status || "PENDING").toUpperCase();
  const status = ["CONFIRMED", "CANCELLED", "PENDING"].includes(rawStatus) ? rawStatus : "PENDING";

  const newGroup = await ReservationGroup.create({
    group_ref,
    guest_id: guestId,
    name: data.name || data.groupName || "Untitled Group",
    contact_person: data.contact_person || data.contactPerson || "",
    email: data.email || "",
    phone: data.phone || "",
    company_name: data.company_name || "",
    billing_instructions: data.billing_instructions || "",
    notes: data.notes || data.specialRequests || "",
    status,
    expected_check_in: data.expected_check_in || data.checkIn ? new Date(data.expected_check_in || data.checkIn) : null,
    expected_check_out: data.expected_check_out || data.checkOut ? new Date(data.expected_check_out || data.checkOut) : null,
    rooms_count: Number(data.rooms_count || data.rooms || 1),
    total_guests: Number(data.total_guests || data.guests || 1),
    room_types: data.room_types || data.roomTypes || "",
    total_price: Number(data.total_price || data.totalPrice || 0),
  });

  return getGroupReservationById(tenantConn, newGroup._id);
};

export const updateGroupReservation = async (tenantConn, id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Group Reservation ID format");
  }

  const ReservationGroup = await getModel(tenantConn, "ReservationGroup");
  const Guest = await getModel(tenantConn, "Guest");

  const group = await ReservationGroup.findById(id);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Group Reservation not found");
  }

  if (data.name !== undefined) group.name = data.name;
  if (data.contact_person !== undefined) group.contact_person = data.contact_person;
  if (data.email !== undefined) group.email = data.email;
  if (data.phone !== undefined) group.phone = data.phone;
  if (data.company_name !== undefined) group.company_name = data.company_name;
  if (data.billing_instructions !== undefined) group.billing_instructions = data.billing_instructions;
  if (data.notes !== undefined) group.notes = data.notes;
  if (data.status !== undefined) {
    const rawStatus = data.status.toUpperCase();
    if (["PENDING", "CONFIRMED", "CANCELLED"].includes(rawStatus)) {
      group.status = rawStatus;
    }
  }
  if (data.expected_check_in || data.checkIn) {
    group.expected_check_in = new Date(data.expected_check_in || data.checkIn);
  }
  if (data.expected_check_out || data.checkOut) {
    group.expected_check_out = new Date(data.expected_check_out || data.checkOut);
  }
  if (data.rooms_count !== undefined || data.rooms !== undefined) {
    group.rooms_count = Number(data.rooms_count ?? data.rooms);
  }
  if (data.total_guests !== undefined || data.guests !== undefined) {
    group.total_guests = Number(data.total_guests ?? data.guests);
  }
  if (data.room_types !== undefined || data.roomTypes !== undefined) {
    group.room_types = data.room_types ?? data.roomTypes;
  }
  if (data.total_price !== undefined || data.totalPrice !== undefined) {
    group.total_price = Number(data.total_price ?? data.totalPrice);
  }

  if (data.contact_person || data.contactPerson || data.email || data.phone) {
    if (group.guest_id) {
      const guest = await Guest.findById(group.guest_id);
      if (guest) {
        if (data.contact_person || data.contactPerson) {
          const parts = (data.contact_person || data.contactPerson).trim().split(/\s+/);
          guest.first_name = parts[0] || guest.first_name;
          guest.last_name = parts.slice(1).join(" ") || guest.last_name;
        }
        if (data.email) guest.email = data.email.toLowerCase();
        if (data.phone) guest.phone = data.phone;
        await guest.save();
      }
    }
  }

  await group.save();
  return getGroupReservationById(tenantConn, id);
};

export const cancelGroupReservation = async (tenantConn, id, cancellation_reason) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Group Reservation ID format");
  }

  const ReservationGroup = await getModel(tenantConn, "ReservationGroup");
  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationRoom = await getModel(tenantConn, "ReservationRoom");
  const Room = await getModel(tenantConn, "Room");

  const group = await ReservationGroup.findById(id);
  if (!group) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Group Reservation not found");
  }

  if (group.status === "CANCELLED") {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Group reservation is already cancelled");
  }

  // Inspect child reservations
  const childReservations = await Reservation.find({ group_id: group._id });

  // Enforce operational stay guard:
  // Reject cancellation if any child reservation has entered an active or completed stay state
  const hasInHouse = childReservations.some((r) => r.status === "IN_HOUSE");
  if (hasInHouse) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cannot cancel group reservation with active in-house reservations");
  }

  const hasCheckedOut = childReservations.some((r) => r.status === "CHECKED_OUT");
  if (hasCheckedOut) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cannot cancel group reservation with completed/checked-out stays");
  }

  await withTransaction(tenantConn, async (session) => {
    const opts = session ? { session } : {};

    // Fresh query inside transaction callback to ensure consistency on standalone MongoDB fallback
    const activeChildren = await Reservation.find({
      group_id: group._id,
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    for (const child of activeChildren) {
      child.status = "CANCELLED";
      child.cancellation_reason = cancellation_reason || `Group reservation ${group.group_ref} cancelled`;
      await child.save(opts);

      const resRoom = await ReservationRoom.findOne({ reservation_id: child._id });
      if (resRoom && resRoom.room_id) {
        await Room.updateOne(
          { _id: resRoom.room_id },
          { $pull: { active_bookings: { reservation_id: child._id } } },
          opts
        );
      }
    }

    group.status = "CANCELLED";
    group.cancellation_reason = cancellation_reason || "Cancelled by guest/staff";
    await group.save(opts);
  });

  return getGroupReservationById(tenantConn, id);
};

export const deleteGroupReservation = async (tenantConn, id) => {
  // Physical deletion is strictly prohibited for ReservationGroup.
  // Delegate safely to cancelGroupReservation to preserve document retention and audit trail.
  return cancelGroupReservation(tenantConn, id, "Cancelled via deleteGroupReservation");
};

