import crypto from 'crypto';
import mongoose from 'mongoose';
import { getModel } from '../../../database/hotel/modelFactory.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import ApiError from '../../../utils/apiError.js';
import { ROLES } from '../../../constants/roles.js';
import { parsePagination, objectIdQuery, asString } from '../../../utils/query.js';

export const assertEmployeeInTenant = async (hotelContext, employeeId) => {
  const Employee = await getModel(hotelContext, 'Employee');
  const emp = await Employee.findById(employeeId);
  if (!emp) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Referenced employee does not exist in this hotel');
  }
  return emp;
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid date format');
  }
  if (end < start) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'End date cannot be before start date');
  }
  return { start, end };
};

export const validateRunStatusTransition = (currentStatus, targetStatus, role) => {
  if (!targetStatus || currentStatus === targetStatus) return;

  if (currentStatus === 'COMPLETED') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot modify a completed payroll run');
  }

  // Admin-only transitions
  if (['APPROVED', 'COMPLETED', 'FAILED'].includes(targetStatus)) {
    if (![ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN].includes(role)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Only administrators can update payroll run lifecycle state');
    }
  }

  const allowedTransitions = {
    DRAFT: ['PROCESSING', 'APPROVED', 'FAILED'],
    PROCESSING: ['APPROVED', 'COMPLETED', 'FAILED'],
    APPROVED: ['COMPLETED', 'FAILED'],
    FAILED: ['DRAFT', 'PROCESSING'], // Failed runs can be retried or reset
    COMPLETED: [], // Terminal, strictly immutable
  };

  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid payroll run status transition from ${currentStatus} to ${targetStatus}`
    );
  }
};

const recalculateRunTotal = async (PayrollItem, PayrollRun, runId) => {
  const items = await PayrollItem.find({ run_id: runId });
  const total = items.reduce((sum, item) => sum + (Number(item.net_pay) || 0), 0);
  await PayrollRun.findByIdAndUpdate(runId, { total_amount: Math.round(total * 100) / 100 });
  return total;
};

export const createPayrollRun = async (hotelContext, data, user) => {
  const PayrollRun = await getModel(hotelContext, 'PayrollRun');
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');
  const Employee = await getModel(hotelContext, 'Employee');

  const { start, end } = validateDateRange(data.period_start, data.period_end);

  // Generate run_ref if not provided
  let runRef = data.run_ref?.trim();
  if (!runRef) {
    const yearMonth = start.toISOString().slice(0, 7).replace('-', '');
    const randSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    runRef = `PAY-${yearMonth}-${randSuffix}`;
  }

  // Check unique run_ref
  const existing = await PayrollRun.findOne({ run_ref: runRef });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Payroll run with reference '${runRef}' already exists`);
  }

  const run = await PayrollRun.create({
    run_ref: runRef,
    period_start: start,
    period_end: end,
    process_date: data.process_date ? new Date(data.process_date) : new Date(),
    status: data.status || 'DRAFT',
    total_amount: 0,
    processed_by: user?._id || user?.id,
    notes: data.notes || '',
  });

  // Auto-generate snapshot items for all active employees if requested
  if (data.auto_generate_items !== false) {
    const employees = await Employee.find({ status: { $ne: 'TERMINATED' } });
    if (employees.length > 0) {
      const itemsToInsert = employees.map((emp) => {
        const baseSalary = typeof emp.salary === 'number' && !isNaN(emp.salary) ? emp.salary : 0;
        return {
          run_id: run._id,
          employee_id: emp._id,
          base_salary: baseSalary, // SNAPSHOT of current employee salary
          bonuses: 0,
          deductions: 0,
          net_pay: baseSalary,
          status: 'PENDING',
        };
      });

      await PayrollItem.insertMany(itemsToInsert);
      await recalculateRunTotal(PayrollItem, PayrollRun, run._id);
    }
  }

  return await PayrollRun.findById(run._id).populate('processed_by');
};

export const getPayrollRuns = async (hotelContext, queryParams = {}) => {
  const PayrollRun = await getModel(hotelContext, 'PayrollRun');
  const { page, limit, skip } = parsePagination(queryParams);

  const filter = {};
  if (queryParams.status) {
    filter.status = asString(queryParams.status).toUpperCase();
  }
  if (queryParams.period_start) {
    filter.period_start = { $gte: new Date(queryParams.period_start) };
  }
  if (queryParams.period_end) {
    filter.period_end = { $lte: new Date(queryParams.period_end) };
  }
  if (queryParams.search) {
    filter.run_ref = { $regex: asString(queryParams.search), $options: 'i' };
  }

  const runs = await PayrollRun.find(filter)
    .populate('processed_by', 'first_name last_name email employee_ref')
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PayrollRun.countDocuments(filter);
  return { runs, page, limit, total };
};

export const getPayrollRunById = async (hotelContext, runId) => {
  const PayrollRun = await getModel(hotelContext, 'PayrollRun');
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');

  const run = await PayrollRun.findById(runId).populate('processed_by', 'first_name last_name email employee_ref');
  if (!run) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payroll run not found');
  }

  const items = await PayrollItem.find({ run_id: runId })
    .populate({
      path: 'employee_id',
      populate: { path: 'department_id' },
    })
    .sort({ created_at: 1 });

  return { run, items };
};

export const updatePayrollRun = async (hotelContext, runId, updateData, userRole) => {
  const PayrollRun = await getModel(hotelContext, 'PayrollRun');
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');

  const run = await PayrollRun.findById(runId);
  if (!run) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payroll run not found');
  }

  if (run.status === 'COMPLETED') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot modify a completed payroll run');
  }

  if (updateData.status) {
    validateRunStatusTransition(run.status, updateData.status, userRole);
    run.status = updateData.status;

    // If marked as COMPLETED, also mark all items as PAID if they were PENDING
    if (updateData.status === 'COMPLETED') {
      await PayrollItem.updateMany(
        { run_id: runId, status: 'PENDING' },
        { status: 'PAID' }
      );
    }
  }

  if (updateData.notes !== undefined) run.notes = updateData.notes;
  if (updateData.process_date) run.process_date = new Date(updateData.process_date);

  await run.save();
  return await PayrollRun.findById(runId).populate('processed_by', 'first_name last_name email employee_ref');
};

export const deletePayrollRun = async (hotelContext, runId) => {
  const PayrollRun = await getModel(hotelContext, 'PayrollRun');
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');

  const run = await PayrollRun.findById(runId);
  if (!run) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payroll run not found');
  }

  if (run.status !== 'DRAFT') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Only DRAFT payroll runs can be deleted');
  }

  await PayrollItem.deleteMany({ run_id: runId });
  await PayrollRun.findByIdAndDelete(runId);

  return { message: 'Payroll run deleted successfully' };
};

// ----------------- Payroll Items -----------------

export const createPayrollItem = async (hotelContext, runId, itemData) => {
  const PayrollRun = await getModel(hotelContext, 'PayrollRun');
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');

  const run = await PayrollRun.findById(runId);
  if (!run) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payroll run not found');
  }

  if (run.status === 'COMPLETED') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot add items to a completed payroll run');
  }

  // Cross-tenant protection: verify employee belongs to this hotel
  const emp = await assertEmployeeInTenant(hotelContext, itemData.employee_id);

  // Duplicate protection: verify employee is not already in this run
  const existing = await PayrollItem.findOne({ run_id: runId, employee_id: emp._id });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Employee already has a payroll item in this run');
  }

  // Snapshot employee salary if base_salary not explicitly provided
  const baseSalary =
    itemData.base_salary !== undefined ? Number(itemData.base_salary) : Number(emp.salary) || 0;
  const bonuses = Number(itemData.bonuses) || 0;
  const deductions = Number(itemData.deductions) || 0;
  const netPay = baseSalary + bonuses - deductions;

  const item = await PayrollItem.create({
    run_id: runId,
    employee_id: emp._id,
    base_salary: baseSalary,
    bonuses,
    deductions,
    net_pay: netPay,
    status: itemData.status || 'PENDING',
  });

  await recalculateRunTotal(PayrollItem, PayrollRun, runId);

  return await PayrollItem.findById(item._id).populate({
    path: 'employee_id',
    populate: { path: 'department_id' },
  });
};

export const getPayrollItems = async (hotelContext, queryParams = {}) => {
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');
  const { page, limit, skip } = parsePagination(queryParams);

  const filter = {};
  if (queryParams.run_id) filter.run_id = queryParams.run_id;
  if (queryParams.employee_id) filter.employee_id = queryParams.employee_id;
  if (queryParams.status) filter.status = asString(queryParams.status).toUpperCase();

  const items = await PayrollItem.find(filter)
    .populate({
      path: 'employee_id',
      populate: { path: 'department_id' },
    })
    .populate('run_id')
    .sort({ created_at: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PayrollItem.countDocuments(filter);
  return { items, page, limit, total };
};

export const getPayrollItemById = async (hotelContext, itemId) => {
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');

  const item = await PayrollItem.findById(itemId)
    .populate({
      path: 'employee_id',
      populate: { path: 'department_id' },
    })
    .populate('run_id');

  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payroll item not found');
  }

  return item;
};

export const updatePayrollItem = async (hotelContext, itemId, updateData) => {
  const PayrollRun = await getModel(hotelContext, 'PayrollRun');
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');

  const item = await PayrollItem.findById(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payroll item not found');
  }

  const run = await PayrollRun.findById(item.run_id);
  if (run && run.status === 'COMPLETED') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot modify items in a completed payroll run');
  }

  if (updateData.base_salary !== undefined) item.base_salary = Number(updateData.base_salary);
  if (updateData.bonuses !== undefined) item.bonuses = Number(updateData.bonuses);
  if (updateData.deductions !== undefined) item.deductions = Number(updateData.deductions);
  if (updateData.status) item.status = updateData.status;

  item.net_pay = item.base_salary + item.bonuses - item.deductions;
  await item.save();

  if (run) {
    await recalculateRunTotal(PayrollItem, PayrollRun, run._id);
  }

  return await PayrollItem.findById(itemId).populate({
    path: 'employee_id',
    populate: { path: 'department_id' },
  });
};

export const deletePayrollItem = async (hotelContext, itemId) => {
  const PayrollRun = await getModel(hotelContext, 'PayrollRun');
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');

  const item = await PayrollItem.findById(itemId);
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Payroll item not found');
  }

  const run = await PayrollRun.findById(item.run_id);
  if (run && run.status === 'COMPLETED') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Cannot delete items from a completed payroll run');
  }

  await PayrollItem.findByIdAndDelete(itemId);

  if (run) {
    await recalculateRunTotal(PayrollItem, PayrollRun, run._id);
  }

  return { message: 'Payroll item deleted successfully' };
};

// ----------------- Employee Salary Roster (Frontend Aggregation) -----------------

export const getEmployeeSalaryRoster = async (hotelContext, queryParams = {}) => {
  const Employee = await getModel(hotelContext, 'Employee');
  const PayrollItem = await getModel(hotelContext, 'PayrollItem');

  const filter = { status: { $ne: 'TERMINATED' } };
  if (queryParams.department_id) {
    filter.department_id = queryParams.department_id;
  }

  const employees = await Employee.find(filter)
    .populate('department_id')
    .sort({ created_at: -1 });

  // Get the latest payroll item for each employee
  const employeeIds = employees.map((e) => e._id);
  const latestItems = await PayrollItem.find({ employee_id: { $in: employeeIds } })
    .populate('run_id')
    .sort({ created_at: -1 });

  const latestItemMap = new Map();
  for (const item of latestItems) {
    const empIdStr = item.employee_id.toString();
    if (!latestItemMap.has(empIdStr)) {
      latestItemMap.set(empIdStr, item);
    }
  }

  const roster = employees.map((emp) => {
    const latestItem = latestItemMap.get(emp._id.toString());
    const baseSalary = typeof emp.salary === 'number' && !isNaN(emp.salary) ? emp.salary : 0;
    const bonus = latestItem ? latestItem.bonuses : 0;
    const deductions = latestItem ? latestItem.deductions : 0;
    const netSalary = latestItem ? latestItem.net_pay : baseSalary + bonus - deductions;
    const paymentStatus = latestItem ? latestItem.status : 'PENDING';

    return {
      id: emp._id.toString(),
      employee_id: emp._id.toString(),
      payroll_item_id: latestItem?._id?.toString() || null,
      empId: emp.employee_ref,
      name: `${emp.first_name} ${emp.last_name}`.trim(),
      email: emp.email,
      department: emp.department_id?.name || 'Unassigned',
      department_id: emp.department_id?._id?.toString() || null,
      role: emp.job_title || 'Staff',
      salary: baseSalary,
      bonus,
      deductions,
      netSalary,
      paymentStatus: paymentStatus === 'PAID' ? 'Paid' : 'Pending',
      paymentDate: latestItem?.run_id?.process_date || null,
      avatar: emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.first_name + ' ' + emp.last_name)}&background=5d5fef&color=fff`,
    };
  });

  return roster;
};

export const updateEmployeeSalaryReference = async (hotelContext, employeeId, salaryAmount) => {
  const Employee = await getModel(hotelContext, 'Employee');
  const emp = await Employee.findById(employeeId);
  if (!emp) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Employee not found');
  }

  emp.salary = Number(salaryAmount);
  await emp.save();

  return await Employee.findById(employeeId).populate('department_id');
};
