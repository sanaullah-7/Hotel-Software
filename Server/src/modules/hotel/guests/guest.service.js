import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, escapeRegex, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const IDENTITY_FIELDS = ["passport_number", "national_id"];
const isEmpty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/**
 * Identity documents sit behind a SPARSE unique index. Sparse only skips documents where the
 * field is ABSENT - an empty string or explicit null WOULD be indexed and the second guest with
 * "" would collide. So empty identity values are always stored as ABSENT.
 */
const splitIdentity = (data) => {
  const set = { ...data };
  const unset = [];
  for (const f of IDENTITY_FIELDS) {
    if (f in set && isEmpty(set[f])) {
      delete set[f];
      unset.push(f);
    }
  }
  return { set, unset };
};

// Server-controlled / protected fields can never be set from a request body.
const PROTECTED = ["_id", "hotelId", "tenantId", "ownerId", "accountId", "created_at", "updated_at", "__v"];
const stripProtected = (data) => {
  const clean = { ...data };
  for (const k of PROTECTED) delete clean[k];
  return clean;
};

const duplicateMessage = (err) => {
  const key = Object.keys(err?.keyPattern || {})[0];
  if (key === "passport_number") return "Guest with this passport number already exists in this hotel";
  if (key === "national_id") return "Guest with this national ID already exists in this hotel";
  if (key === "guest_ref") return "Guest reference already exists";
  return "Duplicate guest already exists";
};

export const createGuest = async (tenantConn, guestData) => {
  const Guest = await getModel(tenantConn, "Guest");

  const { set: data } = splitIdentity(stripProtected(guestData));
  if (typeof data.date_of_birth === "string" && data.date_of_birth === "") delete data.date_of_birth;
  if (data.date_of_birth === null) delete data.date_of_birth;
  for (const f of ["email", "phone", "address", "city", "country", "nationality", "notes"]) {
    if (data[f] === null || data[f] === "") delete data[f];
  }

  if (!data.guest_ref) {
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    data.guest_ref = `GST-${Date.now().toString().slice(-6)}${randomHex}`;
  }

  // Friendly pre-checks. The UNIQUE indexes are the real (race-proof) guarantee below.
  const dupChecks = [];
  if (data.guest_ref) dupChecks.push({ guest_ref: data.guest_ref });
  if (data.passport_number) dupChecks.push({ passport_number: data.passport_number.toUpperCase() });
  if (data.national_id) dupChecks.push({ national_id: data.national_id.toUpperCase() });
  if (dupChecks.length) {
    const existing = await Guest.findOne({ $or: dupChecks });
    if (existing) {
      if (data.passport_number && existing.passport_number === data.passport_number.toUpperCase()) {
        throw new ApiError(HTTP_STATUS.CONFLICT, "Guest with this passport number already exists in this hotel");
      }
      if (data.national_id && existing.national_id === data.national_id.toUpperCase()) {
        throw new ApiError(HTTP_STATUS.CONFLICT, "Guest with this national ID already exists in this hotel");
      }
      throw new ApiError(HTTP_STATUS.CONFLICT, "Guest reference already exists");
    }
  }

  try {
    return await Guest.create(data);
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(HTTP_STATUS.CONFLICT, duplicateMessage(err));
    }
    throw err;
  }
};

export const getGuests = async (tenantConn, query = {}) => {
  const Guest = await getModel(tenantConn, "Guest");

  const filter = {};
  const search = asString(query.search);
  if (search) {
    const searchRegex = new RegExp(escapeRegex(search.slice(0, 100)), "i");
    filter.$or = [
      { first_name: searchRegex },
      { last_name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { guest_ref: searchRegex },
      { passport_number: searchRegex },
      { national_id: searchRegex },
    ];
  }

  const vip = asString(query.vip_status);
  if (vip !== undefined) {
    if (vip !== "true" && vip !== "false") {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "vip_status must be true or false");
    }
    filter.vip_status = vip === "true";
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const guests = await Guest.find(filter).sort({ created_at: -1, _id: -1 }).skip(skip).limit(limit);
  const total = await Guest.countDocuments(filter);

  return {
    guests,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getGuestById = async (tenantConn, guestId) => {
  if (!mongoose.Types.ObjectId.isValid(guestId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }

  const Guest = await getModel(tenantConn, "Guest");
  const guest = await Guest.findById(guestId);

  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found");
  }

  return guest;
};

export const updateGuest = async (tenantConn, guestId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(guestId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }

  const Guest = await getModel(tenantConn, "Guest");

  // guest_ref is immutable; protected fields are stripped.
  const cleaned = stripProtected(updateData);
  delete cleaned.guest_ref;
  const { set, unset } = splitIdentity(cleaned);

  // Empty optional values clear the field instead of storing "" / null.
  for (const f of ["email", "phone", "address", "city", "country", "nationality", "notes", "date_of_birth"]) {
    if (f in set && (set[f] === null || set[f] === "")) {
      delete set[f];
      unset.push(f);
    }
  }

  const update = {};
  if (Object.keys(set).length) update.$set = set;
  if (unset.length) update.$unset = Object.fromEntries(unset.map((f) => [f, ""]));

  if (!update.$set && !update.$unset) {
    // Nothing applicable to change: just return the current document (or 404).
    return getGuestById(tenantConn, guestId);
  }

  try {
    const guest = await Guest.findByIdAndUpdate(guestId, update, { returnDocument: "after", runValidators: true });
    if (!guest) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found");
    }
    return guest;
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(HTTP_STATUS.CONFLICT, duplicateMessage(err).replace("Guest with", "Another guest with"));
    }
    throw err;
  }
};

/**
 * Delete rule: a guest that is referenced by ANY reservation, reservation group or stay is NEVER
 * hard-deleted (historical integrity). Otherwise the guest and its identity documents are removed.
 */
export const deleteGuest = async (tenantConn, guestId) => {
  if (!mongoose.Types.ObjectId.isValid(guestId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }

  const Guest = await getModel(tenantConn, "Guest");
  const guest = await Guest.findById(guestId);

  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found");
  }

  const Reservation = await getModel(tenantConn, "Reservation");
  const ReservationGroup = await getModel(tenantConn, "ReservationGroup");
  const Stay = await getModel(tenantConn, "Stay");
  const GuestDocument = await getModel(tenantConn, "GuestDocument");

  const [reservations, groups, stays] = await Promise.all([
    Reservation.countDocuments({ primary_guest_id: guest._id }),
    ReservationGroup.countDocuments({ guest_id: guest._id }),
    Stay.countDocuments({ primary_guest_id: guest._id }),
  ]);
  if (reservations > 0 || groups > 0 || stays > 0) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Cannot delete guest with existing reservations or stays"
    );
  }

  await GuestDocument.deleteMany({ guest_id: guest._id });
  await Guest.deleteOne({ _id: guest._id });
  return true;
};
