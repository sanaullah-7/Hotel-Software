import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const generateFolioRef = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `FOL-${Date.now().toString().slice(-6)}${randHex}`;
};

export const createFolio = async (hotelContext, folioData) => {
  const Guest = await getModel(hotelContext, "Guest");
  const Reservation = await getModel(hotelContext, "Reservation");
  const Stay = await getModel(hotelContext, "Stay");
  const Folio = await getModel(hotelContext, "Folio");

  const { guest_id, reservation_id, stay_id, currency = "PKR" } = folioData;

  let resolvedGuestId = guest_id;
  let reservation = null;
  let stay = null;

  // 1. Cross-tenant & existence checks
  if (reservation_id) {
    if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    reservation = await Reservation.findOne({ _id: reservation_id, hotelId: hotelContext });
    if (!reservation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found in this hotel");
    }

    // Idempotency check: if an open folio already exists for this reservation, return it
    const existingFolio = await Folio.findOne({ hotelId: hotelContext, reservation_id: reservation._id, status: "OPEN" })
      .populate("guest_id", "first_name last_name email phone guest_ref")
      .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
      .populate("stay_id", "stay_ref status");

    if (existingFolio) {
      return existingFolio;
    }

    if (!resolvedGuestId) {
      resolvedGuestId = reservation.primary_guest_id;
    }
  }

  if (stay_id) {
    if (!mongoose.Types.ObjectId.isValid(stay_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Stay ID format");
    }
    stay = await Stay.findOne({ _id: stay_id, hotelId: hotelContext });
    if (!stay) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Stay not found in this hotel");
    }
    if (!resolvedGuestId) {
      resolvedGuestId = stay.primary_guest_id;
    }
  }

  if (!resolvedGuestId || !mongoose.Types.ObjectId.isValid(resolvedGuestId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }
  const guest = await Guest.findOne({ _id: resolvedGuestId, hotelId: hotelContext });
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found in this hotel");
  }

  const folio_ref = generateFolioRef();

  try {
    const folio = await Folio.create({
      hotelId: hotelContext,
      folio_ref,
      guest_id: guest._id,
      reservation_id: reservation ? reservation._id : null,
      stay_id: stay ? stay._id : null,
      status: "OPEN",
      balance: 0,
      currency,
    });

    return await Folio.findOne({ _id: folio._id, hotelId: hotelContext })
      .populate("guest_id", "first_name last_name email phone guest_ref")
      .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
      .populate("stay_id", "stay_ref status");
  } catch (err) {
    if (err.code === 11000 && reservation?._id) {
      const existingFolio = await Folio.findOne({ hotelId: hotelContext, reservation_id: reservation._id, status: "OPEN" })
        .populate("guest_id", "first_name last_name email phone guest_ref")
        .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
        .populate("stay_id", "stay_ref status");
      if (existingFolio) {
        return existingFolio;
      }
    }
    throw err;
  }
};

export const getOrCreateFolioForReservation = async (hotelContext, reservationId, options = {}) => {
  if (!mongoose.Types.ObjectId.isValid(reservationId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
  }
  const Reservation = await getModel(hotelContext, "Reservation");
  const Folio = await getModel(hotelContext, "Folio");

  const reservation = await Reservation.findOne({ _id: reservationId, hotelId: hotelContext });
  if (!reservation) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found in this hotel");
  }

  let folio = await Folio.findOne({ hotelId: hotelContext, reservation_id: reservation._id, status: "OPEN" })
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
    .populate("stay_id", "stay_ref status");

  if (!folio) {
    const folio_ref = generateFolioRef();
    try {
      const created = await Folio.create({
        hotelId: hotelContext,
        folio_ref,
        guest_id: reservation.primary_guest_id,
        reservation_id: reservation._id,
        stay_id: null,
        status: "OPEN",
        balance: 0,
        currency: options.currency || "PKR",
      });

      folio = await Folio.findOne({ _id: created._id, hotelId: hotelContext })
        .populate("guest_id", "first_name last_name email phone guest_ref")
        .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
        .populate("stay_id", "stay_ref status");
    } catch (err) {
      if (err.code === 11000) {
        folio = await Folio.findOne({ hotelId: hotelContext, reservation_id: reservation._id, status: "OPEN" })
          .populate("guest_id", "first_name last_name email phone guest_ref")
          .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
          .populate("stay_id", "stay_ref status");
        if (folio) {
          return folio;
        }
      }
      throw err;
    }
  }

  return folio;
};

export const getFolios = async (hotelContext, query = {}) => {
  const Folio = await getModel(hotelContext, "Folio");

  const filter = { hotelId: hotelContext };
  const guestId = asString(query.guest_id);
  if (guestId) {
    if (!mongoose.Types.ObjectId.isValid(guestId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
    }
    filter.guest_id = guestId;
  }

  const reservationId = asString(query.reservation_id);
  if (reservationId) {
    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    filter.reservation_id = reservationId;
  }

  const status = asString(query.status);
  if (status) {
    filter.status = status.toUpperCase();
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const folios = await Folio.find(filter)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
    .populate("stay_id", "stay_ref status")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Folio.countDocuments(filter);

  return {
    folios,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getFolioById = async (hotelContext, folioId) => {
  if (!mongoose.Types.ObjectId.isValid(folioId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
  }

  const Folio = await getModel(hotelContext, "Folio");
  const folio = await Folio.findOne({ _id: folioId, hotelId: hotelContext })
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("reservation_id", "booking_ref status expected_check_in expected_check_out primary_guest_id")
    .populate("stay_id", "stay_ref status");

  if (!folio) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Folio not found");
  }

  return folio;
};

export const recalculateFolioBalance = async (hotelContext, folioId) => {
  if (!mongoose.Types.ObjectId.isValid(folioId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
  }

  const Folio = await getModel(hotelContext, "Folio");
  const Invoice = await getModel(hotelContext, "Invoice");
  const Payment = await getModel(hotelContext, "Payment");

  const folio = await Folio.findOne({ _id: folioId, hotelId: hotelContext });
  if (!folio) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Folio not found");
  }

  const invoices = await Invoice.find({ hotelId: hotelContext, folio_id: folio._id, status: { $ne: "VOIDED" } });
  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + Math.max(0, Number(inv.total_amount || 0) - Number(inv.amount_paid || 0)),
    0
  );

  const unallocatedPayments = await Payment.find({
    hotelId: hotelContext,
    folio_id: folio._id,
    invoice_id: null,
    status: "COMPLETED",
  });
  const unallocatedTotal = unallocatedPayments.reduce((sum, pay) => sum + Number(pay.amount || 0), 0);

  const newBalance = Math.max(0, totalOutstanding - unallocatedTotal);
  folio.balance = newBalance;
  await folio.save();

  return folio;
};
