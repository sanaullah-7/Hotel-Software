import mongoose from 'mongoose';
import crypto from 'crypto';
import { getModel } from '../../../database/hotel/modelFactory.js';
import ApiError from '../../../utils/apiError.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import { parsePagination, asString } from '../../../utils/query.js';
import { createAuditLog } from '../hotelAudit/audit.service.js';
import { ROLES } from '../../../constants/roles.js';

const generateShiftNumber = () => {
  const randHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SHF-${Date.now().toString().slice(-6)}${randHex}`;
};

/**
 * Calculates authoritative financial totals for a given shift by querying
 * actual linked Payment, Refund, and Expense documents.
 */
export const calculateShiftFinancials = async (tenantConn, shiftId, openingFloat = 0) => {
  const Payment = await getModel(tenantConn, 'Payment');
  const Refund = await getModel(tenantConn, 'Refund');
  const Expense = await getModel(tenantConn, 'Expense');

  // 1. Authoritative cash and non-cash payments for this shift
  const payments = await Payment.find({
    cash_shift_id: shiftId,
    status: 'COMPLETED',
  }).lean();

  let cash_collected = 0;
  let card_total = 0;
  let bank_total = 0;
  let wallet_total = 0;
  let other_total = 0;

  for (const pay of payments) {
    const amt = Number(pay.amount) || 0;
    const method = String(pay.payment_method || '').toUpperCase();
    if (method === 'CASH') {
      cash_collected += amt;
    } else if (method === 'CREDIT_CARD') {
      card_total += amt;
    } else if (method === 'BANK_TRANSFER') {
      bank_total += amt;
    } else if (method === 'WALLET') {
      wallet_total += amt;
    } else {
      other_total += amt;
    }
  }

  // 2. Authoritative refunds associated with this shift
  const refunds = await Refund.find({
    cash_shift_id: shiftId,
    status: 'PROCESSED',
  }).lean();

  let cash_refunds = 0;
  for (const ref of refunds) {
    const refMethod = String(ref.refund_method || '').toUpperCase();
    if (refMethod === 'CASH' || !ref.refund_method) {
      cash_refunds += Number(ref.amount) || 0;
    }
  }

  // 3. Authoritative expenses (cash payouts) paid out from this shift's drawer
  const expenses = await Expense.find({
    cash_shift_id: shiftId,
    status: { $regex: /^paid$/i },
    payment_method: { $regex: /^cash$/i },
  }).lean();

  let cash_paid_out = 0;
  for (const exp of expenses) {
    cash_paid_out += Number(exp.amount) || 0;
  }

  // Round all totals to 2 decimal places to avoid floating point anomalies
  cash_collected = Number(cash_collected.toFixed(2));
  cash_refunds = Number(cash_refunds.toFixed(2));
  cash_paid_out = Number(cash_paid_out.toFixed(2));
  card_total = Number(card_total.toFixed(2));
  bank_total = Number(bank_total.toFixed(2));
  wallet_total = Number(wallet_total.toFixed(2));
  other_total = Number(other_total.toFixed(2));

  const total_collected_all_tenders = Number(
    (cash_collected + card_total + bank_total + wallet_total + other_total).toFixed(2)
  );

  // Authoritative Expected Cash Formula:
  // expected_cash = opening_float + cash_collected - cash_refunds - cash_paid_out
  const expected_cash = Number(
    (Number(openingFloat) + cash_collected - cash_refunds - cash_paid_out).toFixed(2)
  );

  return {
    cash_collected,
    cash_refunds,
    cash_paid_out,
    expected_cash,
    tender_summary: {
      cash_total: cash_collected,
      card_total,
      bank_total,
      wallet_total,
      other_total,
      total_payments_count: payments.length,
      total_collected_all_tenders,
    },
  };
};

/**
 * Open a new Cash Shift with opening float.
 */
export const openShift = async (tenantConn, shiftData, user) => {
  const CashShift = await getModel(tenantConn, 'CashShift');

  if (!user || !user.id) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required to open shift');
  }

  // Check if cashier already has an active open shift
  const existingOpen = await CashShift.findOne({
    staff_id: user.id,
    status: 'OPEN',
  });

  if (existingOpen) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Cashier already has an active open shift (${existingOpen.shift_number}). Please close it before opening a new shift.`
    );
  }

  const shift_number = generateShiftNumber();
  const opening_float = Number(Number(shiftData.opening_float).toFixed(2));

  try {
    const shift = await CashShift.create({
      shift_number,
      staff_id: user.id,
      staff_name: user.fullName || user.email || 'Cashier',
      drawer_name: (shiftData.drawer_name || 'Default Drawer').trim(),
      opened_at: new Date(),
      opening_float,
      expected_cash: opening_float,
      notes: (shiftData.notes || '').trim(),
      status: 'OPEN',
    });

    // Write audit entry
    try {
      await createAuditLog(
        tenantConn,
        {
          module: 'Financials',
          action: 'SHIFT_OPEN',
          recordId: String(shift._id),
          description: `Cash shift ${shift.shift_number} opened with float ${shift.opening_float}`,
          importance: 'Normal',
        },
        user
      );
    } catch {
      // Non-blocking audit log catch
    }

    // Blind count sanitization for ordinary cashier
    const isPrivileged = user.role === ROLES.HOTEL_ADMIN || user.role === ROLES.PLATFORM_ADMIN;
    const safeShift = shift.toObject();
    if (!isPrivileged) {
      delete safeShift.expected_cash;
      delete safeShift.tender_summary;
    }

    return safeShift;
  } catch (err) {
    // MongoDB duplicate key error from unique partial index { staff_id: 1, status: 'OPEN' }
    if (err.code === 11000) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        'Cashier already has an active open shift.'
      );
    }
    throw err;
  }
};

/**
 * Retrieves the current active drawer shift for the authenticated cashier.
 * Strictly enforces BLIND COUNTING for ordinary cashiers (concealing expected cash).
 */
export const getActiveShift = async (tenantConn, user, isPrivileged = false) => {
  const CashShift = await getModel(tenantConn, 'CashShift');

  if (!user || !user.id) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
  }

  const shift = await CashShift.findOne({
    staff_id: user.id,
    status: 'OPEN',
  }).lean();

  if (!shift) {
    return null;
  }

  // Blind Cash Counting: hide expected amounts and totals from regular cashier
  if (!isPrivileged) {
    delete shift.expected_cash;
    delete shift.cash_collected;
    delete shift.cash_paid_out;
    delete shift.cash_refunds;
    delete shift.actual_counted_cash;
    delete shift.discrepancy_amount;
    delete shift.tender_summary;
  } else {
    // If privileged manager is viewing, calculate live movements
    const financials = await calculateShiftFinancials(tenantConn, shift._id, shift.opening_float);
    Object.assign(shift, financials);
  }

  return shift;
};

/**
 * Performs blind cash count, calculates variance, generates immutable shift report (Z-Report).
 */
export const closeShift = async (tenantConn, closeData, user) => {
  const CashShift = await getModel(tenantConn, 'CashShift');

  if (!user || !user.id) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required to close shift');
  }

  let targetShift = null;

  if (closeData.shift_id) {
    if (!mongoose.Types.ObjectId.isValid(closeData.shift_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid Shift ID format');
    }
    targetShift = await CashShift.findById(closeData.shift_id);
    if (!targetShift) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Shift not found');
    }
    // Only the shift owner or a manager/admin can close this shift
    const isOwner = String(targetShift.staff_id) === String(user.id);
    const isManager = user.role === ROLES.HOTEL_ADMIN || user.role === ROLES.PLATFORM_ADMIN;
    if (!isOwner && !isManager) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You are not authorized to close another cashier’s shift');
    }
  } else {
    targetShift = await CashShift.findOne({
      staff_id: user.id,
      status: 'OPEN',
    });
  }

  if (!targetShift) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'No active open shift found to close');
  }

  if (targetShift.status === 'CLOSED') {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Shift is already closed');
  }

  // 1. ATOMIC TWO-PHASE LOCK: Transition shift from OPEN to CLOSING
  // This immediately prevents any concurrent cash payment, refund, or payout from binding to this shift!
  const shiftLock = await CashShift.findOneAndUpdate(
    { _id: targetShift._id, status: 'OPEN' },
    { $set: { status: 'CLOSING' } },
    { returnDocument: 'after' }
  );

  if (!shiftLock) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Shift is already closed or in the process of closing');
  }

  // 2. Authoritative Server-side Financial Calculations
  let cash_collected, cash_refunds, cash_paid_out, expected_cash, tender_summary;
  try {
    let financials = await calculateShiftFinancials(tenantConn, targetShift._id, targetShift.opening_float);

    // Concurrency drain: if any concurrent movement incremented an operational counter
    // right before CLOSING was set, allow a brief moment (up to 150ms) for its document to commit
    let retries = 3;
    while (
      retries > 0 &&
      (financials.cash_collected < shiftLock.cash_collected ||
       financials.cash_refunds < shiftLock.cash_refunds ||
       financials.cash_paid_out < shiftLock.cash_paid_out)
    ) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      financials = await calculateShiftFinancials(tenantConn, targetShift._id, targetShift.opening_float);
      retries--;
    }

    cash_collected = financials.cash_collected;
    cash_refunds = financials.cash_refunds;
    cash_paid_out = financials.cash_paid_out;
    expected_cash = financials.expected_cash;
    tender_summary = financials.tender_summary;
  } catch (err) {
    await CashShift.findByIdAndUpdate(targetShift._id, { $set: { status: 'OPEN' } });
    throw err;
  }

  const actual_counted_cash = Number(Number(closeData.actual_counted_cash).toFixed(2));
  const discrepancy_amount = Number((actual_counted_cash - expected_cash).toFixed(2));

  // 3. Finalize Shift from CLOSING to CLOSED
  const closedShift = await CashShift.findOneAndUpdate(
    { _id: targetShift._id, status: 'CLOSING' },
    {
      $set: {
        status: 'CLOSED',
        closed_at: new Date(),
        closed_by: user.id,
        closed_by_name: user.fullName || user.email || 'Admin',
        cash_collected,
        cash_refunds,
        cash_paid_out,
        expected_cash,
        actual_counted_cash,
        discrepancy_amount,
        notes: closeData.notes !== undefined ? closeData.notes.trim() : targetShift.notes,
        tender_summary,
      },
    },
    { returnDocument: 'after' }
  );

  if (!closedShift) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Shift was already closed concurrently');
  }

  // 3. Structured Audit Logging
  try {
    await createAuditLog(
      tenantConn,
      {
        module: 'Financials',
        action: 'SHIFT_CLOSED',
        recordId: String(closedShift._id),
        description: `Shift ${closedShift.shift_number} closed by ${user.fullName || user.email}. Expected: ${expected_cash}, Counted: ${actual_counted_cash}, Discrepancy: ${discrepancy_amount}`,
        importance: discrepancy_amount !== 0 ? 'Important' : 'Normal',
        previous_value: { status: 'OPEN', opening_float: targetShift.opening_float },
        new_value: {
          status: 'CLOSED',
          expected_cash,
          actual_counted_cash,
          discrepancy_amount,
          closed_at: closedShift.closed_at,
        },
      },
      user
    );
  } catch {
    // Non-blocking audit log catch
  }

  return closedShift;
};

/**
 * Fetch a specific shift by ID with authorization checks.
 */
export const getShiftById = async (tenantConn, shiftId, user) => {
  if (!mongoose.Types.ObjectId.isValid(shiftId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid Shift ID format');
  }

  const CashShift = await getModel(tenantConn, 'CashShift');
  const shift = await CashShift.findById(shiftId).lean();

  if (!shift) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Shift not found');
  }

  const isOwner = String(shift.staff_id) === String(user.id);
  const isManager = user.role === ROLES.HOTEL_ADMIN || user.role === ROLES.PLATFORM_ADMIN;

  if (!isOwner && !isManager) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Access denied to this shift');
  }

  // If still OPEN and accessed by regular cashier, conceal expected cash
  if (shift.status === 'OPEN' && !isManager) {
    delete shift.expected_cash;
    delete shift.cash_collected;
    delete shift.cash_paid_out;
    delete shift.cash_refunds;
    delete shift.actual_counted_cash;
    delete shift.discrepancy_amount;
    delete shift.tender_summary;
  }

  return shift;
};

/**
 * List shifts with filters and pagination.
 */
export const getShifts = async (tenantConn, query = {}, user) => {
  const CashShift = await getModel(tenantConn, 'CashShift');
  const { page, limit, skip } = parsePagination(query, { defaultLimit: 20 });

  const filter = {};
  const isManager = user.role === ROLES.HOTEL_ADMIN || user.role === ROLES.PLATFORM_ADMIN;

  // Regular staff can only view their own shifts
  if (!isManager) {
    filter.staff_id = user.id;
  } else if (query.staff_id) {
    if (!mongoose.Types.ObjectId.isValid(query.staff_id)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid Staff ID format');
    }
    filter.staff_id = query.staff_id;
  }

  if (query.status) {
    filter.status = asString(query.status).toUpperCase();
  }

  if (query.startDate || query.endDate) {
    filter.opened_at = {};
    if (query.startDate) filter.opened_at.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filter.opened_at.$lte = end;
    }
  }

  const [shifts, total] = await Promise.all([
    CashShift.find(filter)
      .sort({ opened_at: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CashShift.countDocuments(filter),
  ]);

  // Sanitize any OPEN shifts for regular staff
  if (!isManager) {
    for (const s of shifts) {
      if (s.status === 'OPEN') {
        delete s.expected_cash;
        delete s.cash_collected;
        delete s.cash_paid_out;
        delete s.cash_refunds;
        delete s.actual_counted_cash;
        delete s.discrepancy_amount;
        delete s.tender_summary;
      }
    }
  }

  return {
    shifts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};
