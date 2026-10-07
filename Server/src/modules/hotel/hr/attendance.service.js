import { getModel } from '../../../database/hotel/modelFactory.js';
import { HTTP_STATUS } from '../../../constants/httpStatusCodes.js';
import ApiError from '../../../utils/apiError.js';

/**
 * Normalizes any date to UTC midnight for single-record-per-day consistency
 */
export function normalizeAttendanceDate(inputDate) {
  if (!inputDate) return null;
  const d = new Date(inputDate);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Asserts referenced employee exists in the authenticated tenant
 */
async function assertEmployeeInTenant(hotelContext, employeeId) {
  const Employee = await getModel(hotelContext, 'Employee');
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Referenced employee does not exist in this hotel');
  }
  return employee;
}

/**
 * Validates clock in / clock out time ordering
 */
function validateClockTimes(clockIn, clockOut) {
  if (clockIn && clockOut) {
    const inDate = new Date(clockIn);
    const outDate = new Date(clockOut);
    if (outDate < inDate) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Clock out time cannot be earlier than clock in time');
    }
  }
}

/**
 * Calculates total hours string formatted as HH:MM
 */
function computeTotalHours(clockIn, clockOut, breakTime = '01:00') {
  if (!clockIn || !clockOut) return null;
  try {
    const inDate = new Date(clockIn);
    const outDate = new Date(clockOut);
    const diffMs = outDate.getTime() - inDate.getTime();
    if (diffMs <= 0) return '00:00';

    let breakMins = 60;
    if (breakTime) {
      const parts = breakTime.split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        breakMins = parts[0] * 60 + parts[1];
      }
    }

    const totalMins = Math.floor(diffMs / (1000 * 60));
    const netMins = Math.max(0, totalMins - breakMins);
    const hrs = Math.floor(netMins / 60);
    const mins = netMins % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  } catch {
    return null;
  }
}

/**
 * Create a new attendance record
 */
export async function createAttendance(hotelContext, payload) {
  const AttendanceRecord = await getModel(hotelContext, 'AttendanceRecord');
  await assertEmployeeInTenant(hotelContext, payload.employee_id);

  const normalizedDate = normalizeAttendanceDate(payload.date);
  if (!normalizedDate) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid attendance date');
  }

  // Validate times
  validateClockTimes(payload.clock_in_time, payload.clock_out_time);

  // Check duplicate
  const existing = await AttendanceRecord.findOne({
    employee_id: payload.employee_id,
    date: normalizedDate,
  });
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Attendance already recorded for this employee on this date');
  }

  // Auto-calculate total hours if not provided
  let totalHours = payload.total_hours;
  if (!totalHours && payload.clock_in_time && payload.clock_out_time) {
    totalHours = computeTotalHours(payload.clock_in_time, payload.clock_out_time, payload.break_time);
  }

  try {
    const record = await AttendanceRecord.create({
      employee_id: payload.employee_id,
      date: normalizedDate,
      clock_in_time: payload.clock_in_time || null,
      clock_out_time: payload.clock_out_time || null,
      status: (payload.status || 'PRESENT').toUpperCase(),
      shift: payload.shift || 'Day Shift',
      break_time: payload.break_time || '01:00',
      total_hours: totalHours || '08:00',
      notes: payload.notes || '',
    });

    return await AttendanceRecord.findById(record._id).populate({
      path: 'employee_id',
      select: 'first_name last_name employee_ref job_title department_id avatar',
      populate: { path: 'department_id', select: 'name code' },
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Attendance already recorded for this employee on this date');
    }
    throw err;
  }
}

/**
 * List attendance records with filtering
 */
export async function getAttendance(hotelContext, query = {}) {
  const AttendanceRecord = await getModel(hotelContext, 'AttendanceRecord');
  const filter = {};

  if (query.employee_id) {
    filter.employee_id = query.employee_id;
  }

  if (query.status) {
    filter.status = query.status.toUpperCase();
  }

  if (query.shift) {
    filter.shift = query.shift;
  }

  // Exact date filtering
  if (query.date) {
    const startOfDay = normalizeAttendanceDate(query.date);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  } else if (query.start_date || query.end_date) {
    filter.date = {};
    if (query.start_date) {
      filter.date.$gte = normalizeAttendanceDate(query.start_date);
    }
    if (query.end_date) {
      const endNorm = normalizeAttendanceDate(query.end_date);
      filter.date.$lte = new Date(endNorm.getTime() + 24 * 60 * 60 * 1000 - 1);
    }
  }

  let records = await AttendanceRecord.find(filter)
    .populate({
      path: 'employee_id',
      select: 'first_name last_name employee_ref job_title department_id avatar',
      populate: { path: 'department_id', select: 'name code' },
    })
    .sort({ date: -1, created_at: -1 });

  // Optional in-memory search across employee details
  if (query.search && query.search.trim()) {
    const term = query.search.trim().toLowerCase();
    records = records.filter((rec) => {
      const emp = rec.employee_id;
      if (!emp) return false;
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
      const ref = (emp.employee_ref || '').toLowerCase();
      const job = (emp.job_title || '').toLowerCase();
      return fullName.includes(term) || ref.includes(term) || job.includes(term);
    });
  }

  return records;
}

/**
 * Get attendance record by ID
 */
export async function getAttendanceById(hotelContext, id) {
  const AttendanceRecord = await getModel(hotelContext, 'AttendanceRecord');
  const record = await AttendanceRecord.findById(id).populate({
    path: 'employee_id',
    select: 'first_name last_name employee_ref job_title department_id avatar',
    populate: { path: 'department_id', select: 'name code' },
  });

  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Attendance record not found');
  }

  return record;
}

/**
 * Update attendance record
 */
export async function updateAttendance(hotelContext, id, payload) {
  const AttendanceRecord = await getModel(hotelContext, 'AttendanceRecord');
  const record = await AttendanceRecord.findById(id);

  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Attendance record not found');
  }

  const newClockIn = payload.clock_in_time !== undefined ? payload.clock_in_time : record.clock_in_time;
  const newClockOut = payload.clock_out_time !== undefined ? payload.clock_out_time : record.clock_out_time;
  validateClockTimes(newClockIn, newClockOut);

  if (payload.status) record.status = payload.status.toUpperCase();
  if (payload.shift) record.shift = payload.shift;
  if (payload.clock_in_time !== undefined) record.clock_in_time = payload.clock_in_time;
  if (payload.clock_out_time !== undefined) record.clock_out_time = payload.clock_out_time;
  if (payload.break_time !== undefined) record.break_time = payload.break_time;
  if (payload.notes !== undefined) record.notes = payload.notes;

  if (payload.total_hours !== undefined) {
    record.total_hours = payload.total_hours;
  } else if (newClockIn && newClockOut) {
    record.total_hours = computeTotalHours(newClockIn, newClockOut, record.break_time) || record.total_hours;
  }

  await record.save();

  return await AttendanceRecord.findById(id).populate({
    path: 'employee_id',
    select: 'first_name last_name employee_ref job_title department_id avatar',
    populate: { path: 'department_id', select: 'name code' },
  });
}

/**
 * Delete attendance record
 */
export async function deleteAttendance(hotelContext, id) {
  const AttendanceRecord = await getModel(hotelContext, 'AttendanceRecord');
  const record = await AttendanceRecord.findByIdAndDelete(id);

  if (!record) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Attendance record not found');
  }

  return { message: 'Attendance record deleted successfully' };
}
