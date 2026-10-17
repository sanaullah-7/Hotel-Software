import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { ROLES } from "../../../constants/roles.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const generatePaymentRef = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `PAY-${Date.now().toString().slice(-6)}${randHex}`;
};

export const createPayment = async (tenantConn, paymentData, reqUser = null) => {
  const Folio = await getModel(tenantConn, "Folio");
  const Guest = await getModel(tenantConn, "Guest");
  const Invoice = await getModel(tenantConn, "Invoice");
  const Payment = await getModel(tenantConn, "Payment");
  const CashShift = await getModel(tenantConn, "CashShift");

  let { invoice_id, folio_id, guest_id, amount, payment_method, transaction_id, cash_shift_id } = paymentData;

  let invoice = null;
  if (invoice_id) {
    if (!mongoose.Types.ObjectId.isValid(invoice_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Invoice ID format");
    }
    const checkInvoice = await Invoice.findById(invoice_id);
    if (!checkInvoice) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Invoice not found in this hotel");
    }
    if (checkInvoice.status === "PAID") {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Invoice is already fully paid");
    }

    if (folio_id && String(folio_id) !== String(checkInvoice.folio_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Provided folio_id does not match the invoice folio");
    }
    if (guest_id && String(guest_id) !== String(checkInvoice.guest_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Provided guest_id does not match the invoice guest");
    }

    folio_id = checkInvoice.folio_id;
    guest_id = checkInvoice.guest_id;

    invoice = await Invoice.findOneAndUpdate(
      {
        _id: checkInvoice._id,
        status: { $ne: "PAID" },
        $expr: {
          $lte: [{ $add: ["$amount_paid", amount] }, "$total_amount"],
        },
      },
      {
        $inc: { amount_paid: amount },
      },
      { returnDocument: "after" }
    );

    if (!invoice) {
      const remainingBalance = checkInvoice.total_amount - checkInvoice.amount_paid;
      throw new ApiError(HTTP_STATUS.CONFLICT, `Payment amount (${amount}) exceeds remaining invoice balance (${remainingBalance})`);
    }

    if (invoice.amount_paid >= invoice.total_amount) {
      invoice.status = "PAID";
    } else {
      invoice.status = "PARTIALLY_PAID";
    }
    await invoice.save();
  }

  // Active Cash Shift Verification & Attribution for Cash Receipts
  const isCash = String(payment_method || "").toUpperCase() === "CASH";
  let activeShiftId = cash_shift_id || null;

  if (isCash) {
    if (activeShiftId) {
      if (!mongoose.Types.ObjectId.isValid(activeShiftId)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Cash Shift ID format");
      }
      const shift = await CashShift.findById(activeShiftId);
      if (!shift || shift.status !== "OPEN") {
        throw new ApiError(HTTP_STATUS.CONFLICT, "The specified cash shift is not open");
      }
    } else if (reqUser?.id) {
      const activeShift = await CashShift.findOne({ staff_id: reqUser.id, status: "OPEN" });
      if (activeShift) {
        activeShiftId = activeShift._id;
      } else if (reqUser.role === ROLES.HOTEL_USER) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "No active cash shift found. An active cash drawer shift is required to record cash payments."
        );
      }
    }
  } else if (!activeShiftId && reqUser?.id) {
    // Optional tender correlation for non-cash payments if cashier has an open shift
    const activeShift = await CashShift.findOne({ staff_id: reqUser.id, status: "OPEN" });
    if (activeShift) {
      activeShiftId = activeShift._id;
    }
  }

  // 1. Cross-tenant & existence checks
  if (!folio_id || !mongoose.Types.ObjectId.isValid(folio_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Folio ID format");
  }
  const folio = await Folio.findById(folio_id);
  if (!folio) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Folio not found in this hotel");
  }

  if (!guest_id && folio.guest_id) {
    guest_id = folio.guest_id;
  }

  if (!guest_id || !mongoose.Types.ObjectId.isValid(guest_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Guest ID format");
  }
  const guest = await Guest.findById(guest_id);
  if (!guest) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Guest not found in this hotel");
  }

  // Atomically bind and increment cash shift drawer ONLY while shift is OPEN
  let shiftIncremented = false;
  if (isCash && activeShiftId) {
    const updatedShift = await CashShift.findOneAndUpdate(
      { _id: activeShiftId, status: "OPEN" },
      { $inc: { cash_collected: amount } }
    );
    if (!updatedShift) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Cannot record cash payment: the cash shift is closed or currently closing."
      );
    }
    shiftIncremented = true;
  }

  const payment_ref = generatePaymentRef();

  try {
    const payment = await Payment.create({
      payment_ref,
      invoice_id: invoice ? invoice._id : null,
      folio_id: folio._id,
      guest_id: guest._id,
      amount,
      payment_method,
      transaction_id: transaction_id || null,
      date: new Date(),
      status: "COMPLETED",
      refunded_amount: 0,
      cash_shift_id: activeShiftId,
      staff_id: reqUser?.id || null,
    });

    // Update folio balance atomically
    await Folio.findByIdAndUpdate(folio._id, { $inc: { balance: -amount } });

    return payment;
  } catch (err) {
    if (shiftIncremented) {
      await CashShift.findByIdAndUpdate(activeShiftId, { $inc: { cash_collected: -amount } });
    }
    throw err;
  }
};

export const getPayments = async (tenantConn, query = {}) => {
  const Payment = await getModel(tenantConn, "Payment");

  const filter = {};
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

  const invoiceId = asString(query.invoice_id);
  if (invoiceId) {
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Invoice ID format");
    }
    filter.invoice_id = invoiceId;
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const payments = await Payment.find(filter)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("invoice_id", "invoice_number total_amount amount_paid status")
    .populate({
      path: "folio_id",
      select: "folio_ref balance reservation_id",
      populate: { path: "reservation_id", select: "booking_ref status" },
    })
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(filter);

  return {
    payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getPaymentById = async (tenantConn, paymentId) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Payment ID format");
  }

  const Payment = await getModel(tenantConn, "Payment");
  const payment = await Payment.findById(paymentId)
    .populate("guest_id", "first_name last_name email phone guest_ref")
    .populate("invoice_id", "invoice_number total_amount amount_paid status")
    .populate({
      path: "folio_id",
      select: "folio_ref balance reservation_id",
      populate: { path: "reservation_id", select: "booking_ref status" },
    });

  if (!payment) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Payment not found");
  }

  return payment;
};
