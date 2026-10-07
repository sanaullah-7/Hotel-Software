import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, escapeRegex, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const IDENTITY_FIELDS = ["passport_number", "national_id"];
const isEmpty = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

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

export const createGuest = async (hotelContext, guestData) => {
  const Guest = await getModel(hotelContext, "Guest");

  const { set: data } = splitIdentity(stripProtected(guestData));
  data.hotelId = hotelContext;

  if (typeof data.date_of_birth === "string" && data.date_of_birth === "") delete data.date_of_birth;
  if (data.date_of_birth === null) delete data.date_of_birth;
  for (const f of ["email", "phone", "address", "city", "country", "nationality", "notes"]) {
    if (data[f] === null || data[f] === "") delete data[f];
  }

  if (!data.guest_ref) {
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    data.guest_ref = `GST-${Date.now().toString().slice(-6)}${randomHex}`;
  }

  // Pre-checks scoped to hotel
  const dupChecks = [];
  if (data.guest_ref) dupChecks.push({ guest_ref: data.guest_ref });
  if (data.passport_number) dupChecks.push({ passport_number: data.passport_number.toUpperCase() });
  if (data.national_id) dupChecks.push({ national_id: data.national_id.toUpperCase() });
  if (dupChecks.length) {
    const existing = await Guest.findOne({ $or: dupChecks, hotelId: hotelContext });
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

export const getGuests = async (hotelContext, query = {}) => {
  const Guest = await getModel(hotelContext, "Guest");

  const filter = { hotelId: hotelContext };
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

export const getGuestById = async (hotelContext, guestId) => {
  if (!mongoose.Types.ObjectId.isValid(guestId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }

  const Guest = await getModel(hotelContext, "Guest");
  const guest = await Guest.findOne({ _id: guestId, hotelId: hotelContext });

  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found");
  }

  return guest;
};

export const updateGuest = async (hotelContext, guestId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(guestId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }

  const Guest = await getModel(hotelContext, "Guest");

  // guest_ref is immutable; protected fields are stripped.
  const cleaned = stripProtected(updateData);
  delete cleaned.guest_ref;
  const { set, unset } = splitIdentity(cleaned);

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
    return getGuestById(hotelContext, guestId);
  }

  try {
    const guest = await Guest.findOneAndUpdate(
      { _id: guestId, hotelId: hotelContext },
      update,
      { returnDocument: "after", runValidators: true }
    );
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

export const deleteGuest = async (hotelContext, guestId) => {
  if (!mongoose.Types.ObjectId.isValid(guestId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }

  const Guest = await getModel(hotelContext, "Guest");
  const guest = await Guest.findOne({ _id: guestId, hotelId: hotelContext });

  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found");
  }

  const Reservation = await getModel(hotelContext, "Reservation");
  const ReservationGroup = await getModel(hotelContext, "ReservationGroup");
  const Stay = await getModel(hotelContext, "Stay");
  const GuestDocument = await getModel(hotelContext, "GuestDocument");

  const [reservations, groups, stays] = await Promise.all([
    Reservation.countDocuments({ primary_guest_id: guest._id, hotelId: hotelContext }),
    ReservationGroup.countDocuments({ guest_id: guest._id, hotelId: hotelContext }),
    Stay.countDocuments({ primary_guest_id: guest._id, hotelId: hotelContext }),
  ]);
  if (reservations > 0 || groups > 0 || stays > 0) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Cannot delete guest with existing reservations or stays"
    );
  }

  await GuestDocument.deleteMany({ guest_id: guest._id, hotelId: hotelContext });
  await Guest.deleteOne({ _id: guest._id, hotelId: hotelContext });
  return true;
};

const resolveGuest = async (tenantConn, guestId) => {
  const Guest = await getModel(tenantConn, "Guest");
  let guest = null;
  if (mongoose.Types.ObjectId.isValid(guestId)) {
    guest = await Guest.findById(guestId);
  }
  if (!guest) {
    guest = await Guest.findOne({ guest_ref: guestId });
  }
  return guest;
};

export const getGuestDocuments = async (tenantConn, guestId) => {
  const guest = await resolveGuest(tenantConn, guestId);
  if (!guest) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found");

  const GuestDocument = await getModel(tenantConn, "GuestDocument");
  const docs = await GuestDocument.find({ guest_id: guest._id }).sort({ created_at: -1 });

  if (docs.length === 0 && (guest.passport_number || guest.national_id)) {
    const isPassport = Boolean(guest.passport_number);
    const initialDoc = new GuestDocument({
      guest_id: guest._id,
      form_no: `REG-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: isPassport ? 'Passport Scan' : 'National ID Document',
      document_type: isPassport ? 'Passport' : 'CNIC / National ID',
      document_number: guest.passport_number || guest.national_id,
      status: 'Signed & Verified',
      issued_country: guest.country || 'Pakistan',
    });
    const saved = await initialDoc.save();
    return [saved];
  }

  return docs;
};

export const createGuestDocument = async (tenantConn, guestId, data) => {
  const guest = await resolveGuest(tenantConn, guestId);
  if (!guest) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found");

  const GuestDocument = await getModel(tenantConn, "GuestDocument");
  const formNo = data.form_no || data.formNo || `REG-2026-${Math.floor(100 + Math.random() * 900)}`;

  const newDoc = new GuestDocument({
    guest_id: guest._id,
    form_no: formNo,
    name: data.name || 'Guest Identification Document',
    document_type: data.document_type || data.idType || data.documentType || 'Passport',
    document_number: (data.document_number || data.idNumber || '').trim(),
    document_url: data.document_url || data.documentUrl || '',
    room_number: data.room_number || data.room || '',
    status: data.status || 'Signed & Verified',
    notes: data.notes || '',
    issued_country: data.issued_country || data.country || guest.country || '',
    expiry_date: data.expiry_date || data.expiryDate || null,
  });

  return await newDoc.save();
};

export const deleteGuestDocument = async (tenantConn, guestId, docId) => {
  const GuestDocument = await getModel(tenantConn, "GuestDocument");
  const doc = await GuestDocument.findByIdAndDelete(docId);
  if (!doc) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Document not found");
  return { message: "Document deleted successfully", id: docId };
};

export const getGuestActivities = async (tenantConn, guestId) => {
  const guest = await resolveGuest(tenantConn, guestId);
  if (!guest) throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found");

  const Reservation = await getModel(tenantConn, "Reservation");
  const Stay = await getModel(tenantConn, "Stay");
  const Invoice = await getModel(tenantConn, "Invoice");
  const Complaint = await getModel(tenantConn, "Complaint");
  const GuestDocument = await getModel(tenantConn, "GuestDocument");

  const [reservations, stays, invoices, complaints, documents] = await Promise.all([
    Reservation.find({ primary_guest_id: guest._id }).sort({ created_at: -1 }),
    Stay.find({ primary_guest_id: guest._id }).sort({ created_at: -1 }),
    Invoice.find({ guest_id: guest._id }).sort({ created_at: -1 }),
    Complaint.find({ guest_id: guest._id }).sort({ created_at: -1 }),
    GuestDocument.find({ guest_id: guest._id }).sort({ created_at: -1 }),
  ]);

  const activities = [];

  activities.push({
    id: `ACT-REG-${guest._id}`,
    date: guest.created_at || new Date(),
    title: 'Guest Profile Registered',
    description: `Guest profile created for ${guest.full_name} (${guest.guest_ref}) with status: ${guest.status || 'Active'}.`,
    category: 'Profile',
    performedBy: 'Front Desk System',
  });

  reservations.forEach((r) => {
    activities.push({
      id: `ACT-RES-${r._id}`,
      date: r.created_at || r.check_in_date || new Date(),
      title: `Reservation ${r.status || 'Created'}`,
      description: `Reservation ref ${r.confirmation_code || r._id} booked. Status: ${r.status}.`,
      category: 'Reservation',
      performedBy: 'Reservation Desk',
    });
  });

  stays.forEach((s) => {
    activities.push({
      id: `ACT-STY-${s._id}`,
      date: s.actual_check_in || s.created_at || new Date(),
      title: `Guest Check-In (${s.status})`,
      description: `Stay recorded for Room ${s.room_id || 'allocated'}. Status: ${s.status}.`,
      category: 'Reservation',
      performedBy: 'Front Desk',
    });
    if (s.actual_check_out) {
      activities.push({
        id: `ACT-STYO-${s._id}`,
        date: s.actual_check_out,
        title: 'Guest Check-Out Completed',
        description: `Stay checked out successfully.`,
        category: 'Reservation',
        performedBy: 'Front Desk',
      });
    }
  });

  invoices.forEach((inv) => {
    activities.push({
      id: `ACT-INV-${inv._id}`,
      date: inv.created_at || new Date(),
      title: `Invoice Generated (${inv.invoice_number})`,
      description: `Total Amount: PKR ${Number(inv.total_amount).toLocaleString()} with status: ${inv.status}.`,
      category: 'Invoice',
      performedBy: 'Billing Engine',
    });
  });

  complaints.forEach((c) => {
    activities.push({
      id: `ACT-CMP-${c._id}`,
      date: c.created_at || new Date(),
      title: `Guest Complaint (${c.category || 'Service'})`,
      description: `Complaint [${c.severity || 'Normal'}]: ${c.description}. Status: ${c.status}.`,
      category: 'Complaint',
      performedBy: 'Operations / Guest Relations',
    });
  });

  documents.forEach((d) => {
    activities.push({
      id: `ACT-DOC-${d._id}`,
      date: d.created_at || new Date(),
      title: `Document Uploaded: ${d.name}`,
      description: `${d.document_type} (${d.document_number}) verified.`,
      category: 'Document',
      performedBy: 'Front Desk System',
    });
  });

  activities.sort((a, b) => new Date(b.date) - new Date(a.date));

  return activities;
};
