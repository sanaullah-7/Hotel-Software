import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import ApiError from "../../../utils/apiError.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import { parsePagination } from "../../../utils/query.js";
import crypto from "crypto";

const generateExpenseRef = () => {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `EXP-${randNum}`;
};

/**
 * Aggregates all hotel expenses and capital investments across:
 * 1. Direct Expense records (utilities, maintenance, supplies, etc.)
 * 2. Staff Payroll & Salaries (disbursed salaries from PayrollItem where status is PAID)
 * 3. Inventory & Stock Purchases (stock movements and inventory acquisition cost)
 */
export const getUnifiedExpenses = async (tenantConn) => {
  const Expense = await getModel(tenantConn, "Expense");
  const PayrollItem = await getModel(tenantConn, "PayrollItem").catch(() => null);
  const InventoryMovement = await getModel(tenantConn, "InventoryMovement").catch(() => null);
  const InventoryItem = await getModel(tenantConn, "InventoryItem").catch(() => null);

  const [directExpenses, payrollItems, inventoryMovements, inventoryItems] = await Promise.all([
    Expense.find({}).lean().catch(() => []),
    PayrollItem
      ? PayrollItem.find({ status: { $in: ["PAID", "paid"] } })
          .populate({ path: "employee_id", populate: { path: "department_id" } })
          .lean()
          .catch(() => [])
      : Promise.resolve([]),
    InventoryMovement
      ? InventoryMovement.find({ movement_type: { $in: ["PURCHASE", "purchase"] } })
          .populate("item_id")
          .lean()
          .catch(() => [])
      : Promise.resolve([]),
    InventoryItem ? InventoryItem.find({}).lean().catch(() => []) : Promise.resolve([]),
  ]);

  const unified = [];

  // 1. Direct operational expenses
  directExpenses.forEach((e) => {
    unified.push({
      ...e,
      id: e._id,
      amount: Number(e.amount || 0),
      date: e.date || e.created_at || new Date(),
      status: e.status || "Paid",
      is_system_generated: false,
    });
  });

  // 2. Disbursed staff payroll / salaries
  payrollItems.forEach((pi) => {
    const emp = pi.employee_id;
    const empName = emp
      ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || emp.name || "Employee"
      : "Employee";
    const deptName = emp?.department_id?.name || "Hotel Staff";
    const amount = Number(pi.paid_amount || pi.net_pay || pi.base_salary || 0);

    if (amount > 0) {
      const pDate = pi.payment_date || pi.created_at || new Date();
      unified.push({
        _id: pi._id,
        id: pi._id,
        expense_ref: `PAY-${String(pi._id).slice(-6).toUpperCase()}`,
        invoiceNo: `PAY-${String(pi._id).slice(-6).toUpperCase()}`,
        description: `Staff Salary - ${empName} (${deptName})`,
        expense: `Staff Salary - ${empName} (${deptName})`,
        category: "Salaries",
        amount,
        currency: "USD",
        date: pDate,
        created_at: pi.created_at || pDate,
        expense_by: "HR & Payroll",
        paid_to: empName,
        payment_method: pi.payment_method || "Direct Bank",
        status: "Paid",
        is_system_generated: true,
      });
    }
  });

  // 3. Inventory stock purchases
  const coveredItemIds = new Set();
  inventoryMovements.forEach((im) => {
    const item = im.item_id;
    if (item && item._id) coveredItemIds.add(String(item._id));
    const unitCost = Number(item?.unit_cost || 0);
    const qty = Number(im.quantity || 0);
    const amount = +(qty * unitCost).toFixed(2);

    if (amount > 0) {
      const mDate = im.date || im.created_at || new Date();
      unified.push({
        _id: im._id,
        id: im._id,
        expense_ref: `STK-${String(im._id).slice(-6).toUpperCase()}`,
        invoiceNo: `STK-${String(im._id).slice(-6).toUpperCase()}`,
        description: `Stock Purchase - ${item?.name || "Inventory Item"} (${qty} ${item?.unit || "units"})`,
        expense: `Stock Purchase - ${item?.name || "Inventory Item"} (${qty} ${item?.unit || "units"})`,
        category: "Inventory",
        amount,
        currency: "USD",
        date: mDate,
        created_at: im.created_at || mDate,
        expense_by: "Procurement",
        paid_to: item?.supplier || "Vendor",
        payment_method: "Invoice",
        status: "Paid",
        is_system_generated: true,
      });
    }
  });

  // Fallback for inventory items with initial stock that did not have an explicit movement
  inventoryItems.forEach((item) => {
    if (!coveredItemIds.has(String(item._id))) {
      const qty = Number(item.quantity || 0);
      const unitCost = Number(item.unit_cost || 0);
      const amount = +(qty * unitCost).toFixed(2);

      if (amount > 0) {
        const iDate = item.created_at || new Date();
        unified.push({
          _id: item._id,
          id: item._id,
          expense_ref: `STK-${String(item._id).slice(-6).toUpperCase()}`,
          invoiceNo: `STK-${String(item._id).slice(-6).toUpperCase()}`,
          description: `Stock Purchase - ${item.name} (${qty} ${item.unit || "units"})`,
          expense: `Stock Purchase - ${item.name} (${qty} ${item.unit || "units"})`,
          category: "Inventory",
          amount,
          currency: "USD",
          date: iDate,
          created_at: item.created_at || iDate,
          expense_by: "Procurement",
          paid_to: item.supplier || "Vendor",
          payment_method: "Invoice",
          status: "Paid",
          is_system_generated: true,
        });
      }
    }
  });

  return unified;
};

/**
 * List expenses with search, category/status filters, date ranges, and pagination across all unified hotel expenses.
 */
export const getExpenses = async (tenantConn, query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const allExpenses = await getUnifiedExpenses(tenantConn);

  let filtered = allExpenses;

  if (query.category && query.category !== "all" && query.category !== "All") {
    const rx = new RegExp(`^${query.category.trim()}$`, "i");
    filtered = filtered.filter((e) => rx.test(e.category || ""));
  }

  if (query.status && query.status !== "all" && query.status !== "All") {
    const rx = new RegExp(`^${query.status.trim()}$`, "i");
    filtered = filtered.filter((e) => rx.test(e.status || ""));
  }

  if (query.startDate || query.endDate) {
    if (query.startDate) {
      const start = new Date(query.startDate);
      filtered = filtered.filter((e) => new Date(e.date) >= start);
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => new Date(e.date) <= end);
    }
  }

  if (query.search && query.search.trim()) {
    const rx = new RegExp(query.search.trim(), "i");
    filtered = filtered.filter(
      (e) =>
        rx.test(e.expense_ref || "") ||
        rx.test(e.description || "") ||
        rx.test(e.expense || "") ||
        rx.test(e.category || "") ||
        rx.test(e.expense_by || "") ||
        rx.test(e.paid_to || "") ||
        rx.test(e.payment_method || "")
    );
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    expenses: paginated,
  };
};

/**
 * Fetch a single expense by MongoDB ID or expense_ref
 */
export const getExpenseById = async (tenantConn, id) => {
  const Expense = await getModel(tenantConn, "Expense");

  let expense;
  if (mongoose.Types.ObjectId.isValid(id)) {
    expense = await Expense.findById(id).lean();
  }
  if (!expense) {
    expense = await Expense.findOne({ expense_ref: id }).lean();
  }

  if (!expense) {
    const all = await getUnifiedExpenses(tenantConn);
    expense = all.find(
      (e) => String(e._id) === String(id) || String(e.expense_ref) === String(id)
    );
  }

  if (!expense) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `Expense '${id}' not found`);
  }

  return expense;
};

/**
 * Create a new expense record in database
 */
export const createExpense = async (tenantConn, data) => {
  const Expense = await getModel(tenantConn, "Expense");

  const expenseRef = (data.expense_ref || data.invoiceNo || "").trim() || generateExpenseRef();

  // Check unique ref
  const existing = await Expense.findOne({ expense_ref: expenseRef });
  const finalRef = existing ? `${expenseRef}-${Date.now().toString().slice(-4)}` : expenseRef;

  const description = (data.description || data.expense || "General Expense").trim();
  const category = (data.category || "General").trim();
  const amount = Number(data.amount) || 0;
  const currency = (data.currency || "USD").trim();
  const expenseDate = data.date ? new Date(data.date) : new Date();
  const expenseBy = (data.expense_by || data.expenseBy || "Admin").trim();
  const paymentMethod = (data.payment_method || data.paymentMode || "Cash").trim();
  const status = (data.status || "Paid").trim();
  const paidTo = (data.paid_to || data.paidTo || "").trim();
  const receiptUrl = data.receipt_url || "";
  const cashShiftId = data.cash_shift_id || null;
  const staffId = data.staff_id || null;

  const newDoc = new Expense({
    expense_ref: finalRef,
    category,
    description,
    amount,
    currency,
    date: expenseDate,
    expense_by: expenseBy,
    payment_method: paymentMethod,
    status,
    paid_to: paidTo,
    receipt_url: receiptUrl,
    cash_shift_id: cashShiftId,
    staff_id: staffId,
  });

  const isCashExpense = String(paymentMethod).toLowerCase() === 'cash';
  const isPaidExpense = String(status).toLowerCase() === 'paid';

  let shiftIncremented = false;
  if (cashShiftId && isCashExpense && isPaidExpense) {
    if (!mongoose.Types.ObjectId.isValid(cashShiftId)) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid Cash Shift ID format");
    }
    const CashShift = await getModel(tenantConn, 'CashShift');
    const updatedShift = await CashShift.findOneAndUpdate(
      { _id: cashShiftId, status: 'OPEN' },
      { $inc: { cash_paid_out: amount } }
    );
    if (!updatedShift) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Cannot record cash expense: the cash shift is closed or currently closing."
      );
    }
    shiftIncremented = true;
  }

  try {
    await newDoc.save();
    return newDoc.toObject();
  } catch (err) {
    if (shiftIncremented) {
      const CashShift = await getModel(tenantConn, 'CashShift');
      await CashShift.findByIdAndUpdate(cashShiftId, { $inc: { cash_paid_out: -amount } });
    }
    throw err;
  }
};

/**
 * Update an existing expense record
 */
export const updateExpense = async (tenantConn, id, data) => {
  const Expense = await getModel(tenantConn, "Expense");

  let query = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    query = { _id: id };
  } else {
    query = { expense_ref: id };
  }

  const existing = await Expense.findOne(query);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `Expense '${id}' not found`);
  }

  if (data.description !== undefined || data.expense !== undefined) {
    existing.description = (data.description || data.expense || "").trim();
  }
  if (data.category !== undefined) {
    existing.category = data.category.trim() || existing.category;
  }
  if (data.amount !== undefined) {
    existing.amount = Number(data.amount) >= 0 ? Number(data.amount) : existing.amount;
  }
  if (data.currency !== undefined) {
    existing.currency = data.currency.trim() || existing.currency;
  }
  if (data.date !== undefined && data.date) {
    existing.date = new Date(data.date);
  }
  if (data.expense_by !== undefined || data.expenseBy !== undefined) {
    existing.expense_by = (data.expense_by || data.expenseBy || "").trim();
  }
  if (data.payment_method !== undefined || data.paymentMode !== undefined) {
    existing.payment_method = (data.payment_method || data.paymentMode || "").trim();
  }
  if (data.status !== undefined) {
    existing.status = data.status.trim() || existing.status;
  }
  if (data.paid_to !== undefined || data.paidTo !== undefined) {
    existing.paid_to = (data.paid_to || data.paidTo || "").trim();
  }
  if (data.receipt_url !== undefined) {
    existing.receipt_url = data.receipt_url;
  }

  await existing.save();
  return existing.toObject();
};

/**
 * Delete a single expense
 */
export const deleteExpense = async (tenantConn, id) => {
  const Expense = await getModel(tenantConn, "Expense");

  let query = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    query = { _id: id };
  } else {
    query = { expense_ref: id };
  }

  const deleted = await Expense.findOneAndDelete(query);
  if (!deleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, `Expense '${id}' not found`);
  }

  return { message: "Expense deleted successfully", id: deleted._id, expense_ref: deleted.expense_ref };
};

/**
 * Bulk delete expenses
 */
export const bulkDeleteExpenses = async (tenantConn, ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "No expense IDs provided for deletion");
  }

  const Expense = await getModel(tenantConn, "Expense");

  const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const stringRefs = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));

  const deleteFilter = {
    $or: [
      { _id: { $in: objectIds } },
      { expense_ref: { $in: ids } },
    ],
  };

  const result = await Expense.deleteMany(deleteFilter);

  return {
    deletedCount: result.deletedCount,
    message: `${result.deletedCount} expense record(s) deleted successfully`,
  };
};

/**
 * High-level financial summary of all expenses
 */
export const getExpenseSummary = async (tenantConn) => {
  const allExpenses = await getUnifiedExpenses(tenantConn);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonthExpenses = allExpenses.filter((e) => {
    const d = e.date ? new Date(e.date) : null;
    return d && d >= startOfMonth;
  });

  const totalAmount = allExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const monthAmount = thisMonthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const paidCount = allExpenses.filter((e) => (e.status || "").toLowerCase() === "paid").length;
  const pendingCount = allExpenses.filter((e) => (e.status || "").toLowerCase() === "pending").length;

  return {
    totalAmount,
    monthAmount,
    totalCount: allExpenses.length,
    paidCount,
    pendingCount,
  };
};
