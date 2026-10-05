import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
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
  const Invoice = await getModel(tenantConn, "Invoice");

  const { folio_id, guest_id, due_date, line_items } = invoiceData;

  // 1. Cross-tenant & existence check for Folio & Guest
  if (!mongoose.Types.ObjectId.isValid(folio_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
  }
  const folio = await Folio.findById(folio_id);
  if (!folio) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Folio not found in this hotel");
  }

  if (!mongoose.Types.ObjectId.isValid(guest_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }
  const guest = await Guest.findById(guest_id);
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found in this hotel");
  }

  // 2. Calculate totals
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

  // Update folio balance
  folio.balance += total_amount;
  await folio.save();

  return invoice;
};

export const getInvoices = async (tenantConn, query = {}) => {
  const Invoice = await getModel(tenantConn, "Invoice");

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

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const invoices = await Invoice.find(filter)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("folio_id", "folio_ref balance status")
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
    .populate("folio_id", "folio_ref balance status");

  if (!invoice) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Invoice not found");
  }

  return invoice;
};
