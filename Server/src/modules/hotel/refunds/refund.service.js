import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { ROLES } from "../../../constants/roles.js";
import { asString, parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const generateRefundRef = () => {
  const randHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `REF-${Date.now().toString().slice(-6)}${randHex}`;
};

export const createRefund = async (tenantConn, refundData, reqUser = null) => {
  const Payment = await getModel(tenantConn, "Payment");
  const Refund = await getModel(tenantConn, "Refund");
  const Invoice = await getModel(tenantConn, "Invoice");
  const Folio = await getModel(tenantConn, "Folio");
  const CashShift = await getModel(tenantConn, "CashShift");

  const { payment_id, amount, reason, cash_shift_id } = refundData;

  // 1. Validate Payment ID format
  if (!mongoose.Types.ObjectId.isValid(payment_id)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Payment ID format");
  }

  // Session / transaction support with fallback
  let session = null;
  try {
    session = await tenantConn.startSession();
  } catch {
    session = null;
  }

  const executeRefundWorkflow = async (sess) => {
    // 2. Pre-check payment existence & baseline status
    const currentPayment = await Payment.findById(payment_id).session(sess || null);
    if (!currentPayment) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Payment not found in this hotel");
    }

    if (currentPayment.status === "FAILED") {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cannot refund a failed payment");
    }

    if (currentPayment.status === "REFUNDED") {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Payment has already been fully refunded");
    }

    if (currentPayment.status !== "COMPLETED") {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Cannot refund payment with status ${currentPayment.status}`);
    }

    // 3. ATOMIC RACE-SAFE CONDITIONAL UPDATE
    // Guarantees document-level lock and race-safety:
    // (refunded_amount + amount) <= payment.amount
    const updatedPayment = await Payment.findOneAndUpdate(
      {
        _id: currentPayment._id,
        status: "COMPLETED",
        $expr: {
          $lte: [
            { $add: [{ $ifNull: ["$refunded_amount", 0] }, amount] },
            "$amount",
          ],
        },
      },
      {
        $inc: { refunded_amount: amount },
      },
      { returnDocument: "after", session: sess || null }
    );

    if (!updatedPayment) {
      // Race or balance breach occurred
      const latestPayment = await Payment.findById(payment_id).session(sess || null);
      const curRefunded = Number(latestPayment?.refunded_amount || 0);
      const remainingRefundable = Math.max(0, (latestPayment?.amount || 0) - curRefunded);
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        `Refund amount (${amount}) exceeds refundable payment balance (${remainingRefundable})`
      );
    }

    // 4. Update Payment status if fully refunded
    if (updatedPayment.refunded_amount >= updatedPayment.amount) {
      updatedPayment.status = "REFUNDED";
      await updatedPayment.save({ session: sess || null });
    }

    // 5. Shift & Cash Attribution for Cash Refunds
    let activeShiftId = cash_shift_id || null;
    const specifiedRefundMethod = refundData.refund_method ? String(refundData.refund_method).toUpperCase() : "ORIGINAL_METHOD";

    // A refund affects the cash drawer ONLY when physical cash actually leaves the drawer:
    // (1) Explicit refund_method is CASH, OR
    // (2) refund_method is ORIGINAL_METHOD and the original payment method was CASH.
    const isPhysicalCashPayout =
      specifiedRefundMethod === "CASH" ||
      (specifiedRefundMethod === "ORIGINAL_METHOD" && String(updatedPayment.payment_method || "").toUpperCase() === "CASH");

    if (isPhysicalCashPayout && !activeShiftId && reqUser?.id) {
      const activeShift = await CashShift.findOne({ staff_id: reqUser.id, status: "OPEN" }).session(sess || null);
      if (activeShift) {
        activeShiftId = activeShift._id;
      } else if (reqUser.role === ROLES.HOTEL_USER) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "No active cash shift found. An active cash drawer shift is required to issue cash refunds."
        );
      }
    }

    if (activeShiftId && isPhysicalCashPayout) {
      if (!mongoose.Types.ObjectId.isValid(activeShiftId)) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Cash Shift ID format");
      }
      const updatedShift = await CashShift.findOneAndUpdate(
        { _id: activeShiftId, status: "OPEN" },
        { $inc: { cash_refunds: amount } },
        { session: sess || null }
      );
      if (!updatedShift) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "Cannot issue cash refund: the cash shift is closed or currently closing."
        );
      }
    }

    // 5b. Create Refund ledger record
    const refund_ref = generateRefundRef();
    const effectiveRefundMethod = specifiedRefundMethod === "ORIGINAL_METHOD" ? (updatedPayment.payment_method || "OTHER") : specifiedRefundMethod;

    const createdRefunds = await Refund.create(
      [
        {
          refund_ref,
          payment_id: updatedPayment._id,
          amount,
          reason,
          date: new Date(),
          status: "PROCESSED",
          refund_method: effectiveRefundMethod,
          cash_shift_id: isPhysicalCashPayout ? activeShiftId : null,
          staff_id: reqUser?.id || null,
        },
      ],
      { session: sess || null }
    );
    const refund = createdRefunds[0];

    // 6. Accounting: If payment is attached to invoice, reduce invoice amount_paid and adjust status
    if (updatedPayment.invoice_id) {
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        updatedPayment.invoice_id,
        { $inc: { amount_paid: -amount } },
        { returnDocument: "after", session: sess || null }
      );

      if (updatedInvoice) {
        if (updatedInvoice.amount_paid <= 0) {
          updatedInvoice.status = "UNPAID";
          updatedInvoice.amount_paid = 0;
        } else if (updatedInvoice.amount_paid < updatedInvoice.total_amount) {
          updatedInvoice.status = "PARTIALLY_PAID";
        }
        await updatedInvoice.save({ session: sess || null });
      }
    }

    // 7. Accounting: Increment Folio balance by refunded amount
    if (updatedPayment.folio_id) {
      await Folio.findByIdAndUpdate(
        updatedPayment.folio_id,
        { $inc: { balance: amount } },
        { session: sess || null }
      );
    }

    return refund;
  };

  let refundRecord = null;
  if (session) {
    try {
      await session.withTransaction(async (sess) => {
        refundRecord = await executeRefundWorkflow(sess);
      });
    } catch (err) {
      if (
        err.name === "MongoServerError" &&
        (err.message.includes("retryable writes") ||
          err.message.includes("Transaction numbers are only allowed") ||
          err.message.includes("Standalone"))
      ) {
        // Fallback for standalone Mongo deployments without replica sets
        refundRecord = await executeRefundWorkflow(null);
      } else {
        throw err;
      }
    } finally {
      await session.endSession().catch(() => {});
    }
  } else {
    refundRecord = await executeRefundWorkflow(null);
  }

  return await Refund.findById(refundRecord._id).populate({
    path: "payment_id",
    populate: [
      { path: "guest_id", select: "first_name last_name email phone guest_ref" },
      { path: "invoice_id", select: "invoice_number total_amount amount_paid status" },
      { path: "folio_id", select: "folio_ref balance status" },
    ],
  });
};

export const getRefunds = async (tenantConn, query = {}) => {
  const Refund = await getModel(tenantConn, "Refund");
  const Payment = await getModel(tenantConn, "Payment");

  const filter = {};

  const paymentId = asString(query.payment_id);
  if (paymentId) {
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Payment ID format");
    }
    filter.payment_id = paymentId;
  }

  const status = asString(query.status);
  if (status) {
    filter.status = status.toUpperCase();
  }

  const { page, limit, skip } = parsePagination(query, { defaultLimit: 50 });

  const refunds = await Refund.find(filter)
    .populate({
      path: "payment_id",
      populate: [
        { path: "guest_id", select: "first_name last_name email phone guest_ref" },
        { path: "invoice_id", select: "invoice_number total_amount amount_paid status" },
        { path: "folio_id", select: "folio_ref balance status" },
      ],
    })
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Refund.countDocuments(filter);

  return {
    refunds,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

export const getRefundById = async (tenantConn, refundId) => {
  if (!mongoose.Types.ObjectId.isValid(refundId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Refund ID format");
  }

  const Refund = await getModel(tenantConn, "Refund");
  const refund = await Refund.findById(refundId).populate({
    path: "payment_id",
    populate: [
      { path: "guest_id", select: "first_name last_name email phone guest_ref" },
      { path: "invoice_id", select: "invoice_number total_amount amount_paid status" },
      { path: "folio_id", select: "folio_ref balance status" },
    ],
  });

  if (!refund) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Refund not found");
  }

  return refund;
};
