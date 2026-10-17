/**
 * Returns current date in local YYYY-MM-DD format (avoids UTC timezone shift)
 */
export const getLocalTodayDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const attendanceAdapter = {
  /**
   * Format a Date/ISO string to HH:MM (e.g. "10:30")
   */
  formatTimeToHHMM(timeVal) {
    if (!timeVal) return '';
    try {
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) {
        if (typeof timeVal === 'string' && /^\d{2}:\d{2}$/.test(timeVal)) return timeVal;
        return '';
      }
      const hrs = String(d.getUTCHours()).padStart(2, '0');
      const mins = String(d.getUTCMinutes()).padStart(2, '0');
      return `${hrs}:${mins}`;
    } catch {
      return '';
    }
  },

  /**
   * Adapts a canonical backend AttendanceRecord to UI Today's Attendance table shape
   */
  toTodayAttendanceUI(backendRecord) {
    if (!backendRecord) return null;

    const id = (backendRecord._id || backendRecord.id || '').toString();
    const emp = backendRecord.employee_id || {};
    const empId = emp.employee_ref || (emp._id ? `EMP-${emp._id.toString().slice(-4).toUpperCase()}` : 'EMP-000');
    const firstName = emp.first_name || '';
    const lastName = emp.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || emp.name || 'Staff Member';

    const avatar = emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5d5fef&color=fff`;

    // Times
    const firstIn = backendRecord.clock_in_time
      ? attendanceAdapter.formatTimeToHHMM(backendRecord.clock_in_time)
      : '';
    const lastOut = backendRecord.clock_out_time
      ? attendanceAdapter.formatTimeToHHMM(backendRecord.clock_out_time)
      : '';

    // Status: UI expects lowercase ('present', 'absent', 'on_leave', etc.)
    const rawStatus = (backendRecord.status || 'PRESENT').toUpperCase();
    let status = 'present';
    if (rawStatus === 'ABSENT') status = 'absent';
    else if (rawStatus === 'ON_LEAVE' || rawStatus === 'LEAVE') status = 'on_leave';
    else if (rawStatus === 'HALF_DAY') status = 'half_day';
    else if (rawStatus === 'LATE') status = 'late';
    else if (rawStatus === 'HOLIDAY') status = 'holiday';
    else if (rawStatus === 'WEEKEND') status = 'weekend';

    const isNonWorking = status === 'absent' || status === 'on_leave';

    // Break duration
    const breakTime = backendRecord.break_time || (isNonWorking ? '00:00' : '01:00');

    // Total hours: fallback to calculated or 00:00, never arbitrary 08:00
    let totalHours = backendRecord.total_hours;
    if (!totalHours || isNonWorking) {
      totalHours = isNonWorking ? '00:00' : '00:00';
    }

    return {
      id,
      _id: id,
      employeeId: (emp._id || emp.id || '').toString(),
      empId,
      name: fullName,
      avatar,
      shift: backendRecord.shift || 'Day Shift',
      firstIn: firstIn || (isNonWorking ? '-' : ''),
      breakTime,
      breakFrom: backendRecord.break_from || '',
      breakTo: backendRecord.break_to || '',
      lastOut: lastOut || (isNonWorking ? '-' : ''),
      totalHours,
      status,
      rawStatus,
      date: backendRecord.date,
      notes: backendRecord.notes || '',
      createdAt: backendRecord.created_at,
      updatedAt: backendRecord.updated_at,
    };
  },

  /**
   * Adapts array of backend records
   */
  toTodayAttendanceListUI(backendList) {
    if (!Array.isArray(backendList)) return [];
    return backendList.map(rec => attendanceAdapter.toTodayAttendanceUI(rec)).filter(Boolean);
  },

  /**
   * Normalizes form data into canonical backend payload
   */
  toAttendanceBackendPayload(formData, dateStr) {
    if (!formData) return {};

    const targetDate = dateStr || getLocalTodayDateString();

    const rawStatus = (formData.status || 'present').toUpperCase();
    let status = 'PRESENT';
    if (rawStatus === 'ABSENT') status = 'ABSENT';
    else if (rawStatus === 'ON_LEAVE' || rawStatus === 'LEAVE') status = 'ON_LEAVE';
    else if (rawStatus === 'HALF_DAY') status = 'HALF_DAY';
    else if (rawStatus === 'LATE') status = 'LATE';
    else if (rawStatus === 'HOLIDAY') status = 'HOLIDAY';
    else if (rawStatus === 'WEEKEND') status = 'WEEKEND';

    const isNonWorking = status === 'ABSENT' || status === 'ON_LEAVE';

    let clockIn = null;
    let clockOut = null;

    if (!isNonWorking && formData.firstIn) {
      clockIn = new Date(`${targetDate}T${formData.firstIn}:00.000Z`).toISOString();
    }
    if (!isNonWorking && formData.lastOut) {
      clockOut = new Date(`${targetDate}T${formData.lastOut}:00.000Z`).toISOString();
    }

    // Dynamic canonical total_hours calculation
    let calculatedTotal = formData.totalHours;
    if (isNonWorking) {
      calculatedTotal = '00:00';
    } else if (formData.firstIn && formData.lastOut) {
      const [inH, inM] = formData.firstIn.split(':').map(Number);
      const [outH, outM] = formData.lastOut.split(':').map(Number);
      let diff = (outH * 60 + outM) - (inH * 60 + inM);
      if (diff < 0) diff += 24 * 60;

      let brkMins = 0;
      if (formData.breakTime && formData.breakTime !== '00:00') {
        const [bH, bM] = formData.breakTime.split(':').map(Number);
        brkMins = (bH || 0) * 60 + (bM || 0);
      }
      const net = diff <= brkMins ? diff : Math.max(0, diff - brkMins);
      const h = Math.floor(net / 60);
      const m = net % 60;
      calculatedTotal = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    const payload = {
      employee_id: (formData.employee_id || formData.employeeId || '').toString(),
      date: new Date(`${targetDate}T00:00:00.000Z`).toISOString(),
      shift: formData.shift || 'Day Shift',
      status,
      break_time: isNonWorking ? '00:00' : (formData.breakTime || '01:00'),
      total_hours: isNonWorking ? '00:00' : (calculatedTotal || '00:00'),
      notes: formData.notes || '',
    };

    if (clockIn) payload.clock_in_time = clockIn;
    if (clockOut) payload.clock_out_time = clockOut;

    return payload;
  },

  /**
   * Maps backend enum to matrix symbol
   */
  backendStatusToMatrixSymbol(status) {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PRESENT':
      case 'HALF_DAY':
        return 'P';
      case 'LATE':
        return 'LT';
      case 'ABSENT':
        return 'A';
      case 'ON_LEAVE':
      case 'LEAVE':
        return 'L';
      case 'HOLIDAY':
        return 'H';
      case 'WEEKEND':
        return 'W';
      default:
        return 'P';
    }
  },

  /**
   * Builds the full month matrix for Attendance Sheet from canonical records
   */
  toMatrixUI(employees, attendanceRecords, year, monthIndex) {
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const matrix = {};

    // Map existing records by employeeId -> day
    const recordsByEmpDay = {};
    if (Array.isArray(attendanceRecords)) {
      attendanceRecords.forEach((rec) => {
        const empId = (rec.employee_id?._id || rec.employee_id || '').toString();
        if (!empId) return;
        const d = new Date(rec.date);
        const dayNumber = d.getUTCDate();
        if (!recordsByEmpDay[empId]) recordsByEmpDay[empId] = {};
        recordsByEmpDay[empId][dayNumber] = rec;
      });
    }

    const empList = Array.isArray(employees) ? employees : [];
    empList.forEach((emp) => {
      const eId = (emp._id || emp.id || '').toString();
      matrix[eId] = {};

      for (let day = 1; day <= totalDays; day++) {
        // If there's an existing canonical record for this day:
        if (recordsByEmpDay[eId] && recordsByEmpDay[eId][day]) {
          const rec = recordsByEmpDay[eId][day];
          matrix[eId][day] = attendanceAdapter.backendStatusToMatrixSymbol(rec.status);
        } else {
          // No canonical record for this day: leave blank (never fabricate attendance)
          matrix[eId][day] = '';
        }
      }
    });

    return matrix;
  }
};

export default attendanceAdapter;
