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

export const createFolio = async (tenantConn, folioData) => {
  const Guest = await getModel(tenantConn, "Guest");
  const Reservation = await getModel(tenantConn, "Reservation");
  const Stay = await getModel(tenantConn, "Stay");
  const Folio = await getModel(tenantConn, "Folio");

  const { guest_id, reservation_id, stay_id, currency = "PKR" } = folioData;

  // 1. Cross-tenant & existence check
  if (!mongoose.Types.ObjectId.isValid(guest_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }
  const guest = await Guest.findById(guest_id);
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found in this hotel");
  }

  if (reservation_id) {
    if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    const reservation = await Reservation.findById(reservation_id);
    if (!reservation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found in this hotel");
    }
  }

  if (stay_id) {
    if (!mongoose.Types.ObjectId.isValid(stay_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Stay ID format");
    }
    const stay = await Stay.findById(stay_id);
    if (!stay) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Stay not found in this hotel");
    }
  }

  const folio_ref = generateFolioRef();

  const folio = await Folio.create({
    folio_ref,
    guest_id: guest._id,
    reservation_id: reservation_id || null,
    stay_id: stay_id || null,
    status: "OPEN",
    balance: 0,
    currency,
  });

  return folio;
};

export const getFolios = async (tenantConn, query = {}) => {
  const Folio = await getModel(tenantConn, "Folio");

  const filter = {};
  const guestId = asString(query.guest_id);
  if (guestId) {
    if (!mongoose.Types.ObjectId.isValid(guestId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
    }
    filter.guest_id = guestId;
  }

  const status = asString(query.status);
  if (status) {
    filter.status = status.toUpperCase();
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const folios = await Folio.find(filter)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Folio.countDocuments(filter);

  return {
    folios,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getFolioById = async (tenantConn, folioId) => {
  if (!mongoose.Types.ObjectId.isValid(folioId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
  }

  const Folio = await getModel(tenantConn, "Folio");
  const folio = await Folio.findById(folioId).populate("guest_id", "first_name last_name email phone guest_ref");

  if (!folio) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Folio not found");
  }

  return folio;
};
