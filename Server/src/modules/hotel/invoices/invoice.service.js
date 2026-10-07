import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { getOrCreateFolioForReservation } from "../folios/folio.service.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const generateInvoiceNumber = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `INV-${Date.now().toString().slice(-6)}${randHex}`;
};

export const createInvoice = async (tenantConn, invoiceData) => {
  const Folio = await getModel(tenantConn, "Folio");
  const Guest = await getModel(tenantConn, "Guest");
  const Reservation = await getModel(tenantConn, "Reservation");
  const Invoice = await getModel(tenantConn, "Invoice");

  let { folio_id, reservation_id, guest_id, due_date, line_items } = invoiceData;

  // 1. Resolve Folio
  let folio = null;
  if (folio_id) {
    if (!mongoose.Types.ObjectId.isValid(folio_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
    }
    folio = await Folio.findById(folio_id);
    if (!folio) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Folio not found in this hotel");
    }
  } else if (reservation_id) {
    if (!mongoose.Types.ObjectId.isValid(reservation_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    const reservation = await Reservation.findById(reservation_id);
    if (!reservation) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Reservation not found in this hotel");
    }
    folio = await getOrCreateFolioForReservation(tenantConn, reservation._id);
    folio_id = folio._id;
  }

  // 2. Resolve Guest
  const targetGuestId = guest_id || (folio ? folio.guest_id : null);
  if (!targetGuestId || !mongoose.Types.ObjectId.isValid(targetGuestId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }
  const guest = await Guest.findById(targetGuestId);
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found in this hotel");
  }

  if (folio && folio.guest_id && String(folio.guest_id) !== String(guest._id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Provided guest_id does not match the folio guest");
  }

  // 3. Calculate totals
  let total_amount = 0;
  let tax_total = 0;

  for (const item of line_items) {
    total_amount += Number(item.amount) + Number(item.tax_amount || 0);
    tax_total += Number(item.tax_amount || 0);
  }

  const invoice_number = generateInvoiceNumber();

  const invoice = await Invoice.create({
    invoice_number,
    folio_id: folio._id,
    guest_id: guest._id,
    due_date: due_date || null,
    total_amount,
    tax_total,
    amount_paid: 0,
    status: "UNPAID",
    line_items,
  });

  // Update folio balance atomically
  await Folio.findByIdAndUpdate(folio._id, { $inc: { balance: total_amount } });

  return await Invoice.findById(invoice._id)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate({
      path: "folio_id",
      select: "folio_ref balance status reservation_id stay_id",
      populate: {
        path: "reservation_id",
        select: "booking_ref status expected_check_in expected_check_out",
      },
    });
};

export const getInvoices = async (tenantConn, query = {}) => {
  const Invoice = await getModel(tenantConn, "Invoice");
  const Folio = await getModel(tenantConn, "Folio");

  const filter = {};
  const status = asString(query.status);
  if (status) {
    filter.status = status.toUpperCase();
  }

  const guestId = asString(query.guest_id);
  if (guestId) {
    if (!mongoose.Types.ObjectId.isValid(guestId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
    }
    filter.guest_id = guestId;
  }

  const folioId = asString(query.folio_id);
  if (folioId) {
    if (!mongoose.Types.ObjectId.isValid(folioId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
    }
    filter.folio_id = folioId;
  }

  const reservationId = asString(query.reservation_id);
  if (reservationId) {
    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Reservation ID format");
    }
    const matchingFolios = await Folio.find({ reservation_id: reservationId }).select("_id");
    const matchingFolioIds = matchingFolios.map((f) => f._id);
    filter.folio_id = { $in: matchingFolioIds };
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const invoices = await Invoice.find(filter)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate({
      path: "folio_id",
      select: "folio_ref balance status reservation_id stay_id",
      populate: {
        path: "reservation_id",
        select: "booking_ref status expected_check_in expected_check_out",
      },
    })
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Invoice.countDocuments(filter);

  return {
    invoices,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getInvoiceById = async (tenantConn, invoiceId) => {
  if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Invoice ID format");
  }

  const Invoice = await getModel(tenantConn, "Invoice");
  const invoice = await Invoice.findById(invoiceId)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate({
      path: "folio_id",
      select: "folio_ref balance status reservation_id stay_id",
      populate: {
        path: "reservation_id",
        select: "booking_ref status expected_check_in expected_check_out",
      },
    });

  if (!invoice) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Invoice not found");
  }

  return invoice;
};
