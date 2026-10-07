import mongoose from "mongoose";
import { getModel } from "../../../database/hotel/modelFactory.js";
import { HTTP_STATUS } from "../../../constants/httpStatusCodes.js";
import ApiError from "../../../utils/apiError.js";
import { ROLES } from "../../../constants/roles.js";
import { parsePagination, objectIdQuery, asString, escapeRegex } from "../../../utils/query.js";

const assertEmployeeInTenant = async (hotelContext, employeeId) => {
  const Employee = await getModel(hotelContext, "Employee");
  const emp = await Employee.findById(employeeId);
  if (!emp) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Referenced employee does not exist in this hotel");
  }
  return emp;
};

const assertApproverInTenant = async (hotelContext, approverId) => {
  if (!approverId) return null;
  const Employee = await getModel(hotelContext, "Employee");
  const approver = await Employee.findById(approverId);
  if (!approver) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Referenced approver does not exist in this hotel");
  }
  return approver;
};

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid date format");
  }
  if (end < start) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "End date cannot be before start date");
  }
  const diffTime = end.getTime() - start.getTime();
  const calculatedDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return { start, end, calculatedDays };
};

const validateStatusTransition = (currentStatus, targetStatus, role) => {
  if (!targetStatus || currentStatus === targetStatus) return;

  // Terminal state protections
  if (currentStatus === "REJECTED") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cannot modify a rejected leave request");
  }
  if (currentStatus === "CANCELLED") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cannot modify a cancelled leave request");
  }

  // Admin-only transitions (Approval / Rejection)
  if (["APPROVED", "REJECTED"].includes(targetStatus)) {
    if (![ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN].includes(role)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Only hotel administrators can approve or reject leave requests");
    }
  }
};

export const createLeaveRequest = async (hotelContext, data, userRole) => {
  const LeaveRequest = await getModel(hotelContext, "LeaveRequest");

  // Validate dates
  const { start, end, calculatedDays } = validateDateRange(data.start_date, data.end_date);
  const days = data.days || calculatedDays;

  // Validate target employee belongs to this hotel tenant
  await assertEmployeeInTenant(hotelContext, data.employee_id);

  // If approver specified, validate approver belongs to this hotel tenant
  if (data.approved_by) {
    await assertApproverInTenant(hotelContext, data.approved_by);
  }

  // If status is APPROVED or REJECTED upon creation, require admin role
  const targetStatus = (data.status || "PENDING").toUpperCase();
  if (["APPROVED", "REJECTED"].includes(targetStatus)) {
    if (![ROLES.HOTEL_ADMIN, ROLES.PLATFORM_ADMIN].includes(userRole)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "Only hotel administrators can create pre-approved/rejected leave requests");
    }
  }

  const payload = {
    ...data,
    start_date: start,
    end_date: end,
    days,
    status: targetStatus,
  };

  const leaveDoc = await LeaveRequest.create(payload);
  const populated = await LeaveRequest.findById(leaveDoc._id)
    .populate({
      path: "employee_id",
      populate: { path: "department_id" },
    })
    .populate("approved_by");

  return populated;
};

export const getLeaveRequests = async (hotelContext, query) => {
  const LeaveRequest = await getModel(hotelContext, "LeaveRequest");
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  const status = asString(query.status);
  if (status) {
    filter.status = status.toUpperCase();
  }

  const leaveType = asString(query.leave_type);
  if (leaveType) {
    filter.leave_type = leaveType.toUpperCase();
  }

  const employeeId = objectIdQuery(query.employee_id, "employee_id");
  if (employeeId) {
    filter.employee_id = employeeId;
  }

  const search = asString(query.search);
  if (search) {
    filter.reason = { $regex: escapeRegex(search), $options: "i" };
  }

  const [leaveRequests, total] = await Promise.all([
    LeaveRequest.find(filter)
      .populate({
        path: "employee_id",
        populate: { path: "department_id" },
      })
      .populate("approved_by")
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1, _id: -1 }),
    LeaveRequest.countDocuments(filter),
  ]);

  return { leaveRequests, total, page, limit };
};

export const getLeaveRequestById = async (hotelContext, id) => {
  const LeaveRequest = await getModel(hotelContext, "LeaveRequest");
  const leave = await LeaveRequest.findById(id)
    .populate({
      path: "employee_id",
      populate: { path: "department_id" },
    })
    .populate("approved_by");

  if (!leave) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Leave request not found");
  }

  return leave;
};

export const updateLeaveRequest = async (hotelContext, id, data, userRole) => {
  const LeaveRequest = await getModel(hotelContext, "LeaveRequest");

  const existing = await LeaveRequest.findById(id);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Leave request not found");
  }

  // If status is changing, validate lifecycle transition
  if (data.status) {
    const targetStatus = data.status.toUpperCase();
    validateStatusTransition(existing.status, targetStatus, userRole);
    data.status = targetStatus;
  }

  // If dates are changing, validate range and recalculate days
  if (data.start_date || data.end_date) {
    const startInput = data.start_date || existing.start_date;
    const endInput = data.end_date || existing.end_date;
    const { start, end, calculatedDays } = validateDateRange(startInput, endInput);
    data.start_date = start;
    data.end_date = end;
    if (!data.days) {
      data.days = calculatedDays;
    }
  }

  // If employee changing, assert exists in tenant
  if (data.employee_id) {
    await assertEmployeeInTenant(hotelContext, data.employee_id);
  }

  // If approver changing, assert exists in tenant
  if (data.approved_by) {
    await assertApproverInTenant(hotelContext, data.approved_by);
  }

  const updated = await LeaveRequest.findByIdAndUpdate(
    id,
    data,
    { returnDocument: "after", runValidators: true }
  )
    .populate({
      path: "employee_id",
      populate: { path: "department_id" },
    })
    .populate("approved_by");

  return updated;
};

export const deleteLeaveRequest = async (hotelContext, id) => {
  const LeaveRequest = await getModel(hotelContext, "LeaveRequest");
  const deleted = await LeaveRequest.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Leave request not found");
  }
  return deleted;
};
