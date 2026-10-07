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

    // Status: UI expects lowercase ('present', 'absent', etc.)
    const rawStatus = (backendRecord.status || 'PRESENT').toUpperCase();
    let status = 'present';
    if (rawStatus === 'ABSENT') status = 'absent';
    else if (rawStatus === 'ON_LEAVE') status = 'on_leave';
    else if (rawStatus === 'HALF_DAY') status = 'half_day';
    else if (rawStatus === 'LATE') status = 'late';
    else if (rawStatus === 'HOLIDAY') status = 'holiday';
    else if (rawStatus === 'WEEKEND') status = 'weekend';

    return {
      id,
      _id: id,
      employeeId: (emp._id || emp.id || '').toString(),
      empId,
      name: fullName,
      avatar,
      shift: backendRecord.shift || 'Day Shift',
      firstIn: firstIn || '10:30',
      breakTime: backendRecord.break_time || '01:00',
      lastOut: lastOut || '19:30',
      totalHours: backendRecord.total_hours || '08:00',
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

    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    const rawStatus = (formData.status || 'present').toUpperCase();
    let status = 'PRESENT';
    if (rawStatus === 'ABSENT') status = 'ABSENT';
    else if (rawStatus === 'ON_LEAVE') status = 'ON_LEAVE';
    else if (rawStatus === 'HALF_DAY') status = 'HALF_DAY';
    else if (rawStatus === 'LATE') status = 'LATE';
    else if (rawStatus === 'HOLIDAY') status = 'HOLIDAY';
    else if (rawStatus === 'WEEKEND') status = 'WEEKEND';

    let clockIn = null;
    let clockOut = null;

    if (formData.firstIn) {
      clockIn = new Date(`${targetDate}T${formData.firstIn}:00.000Z`).toISOString();
    }
    if (formData.lastOut) {
      clockOut = new Date(`${targetDate}T${formData.lastOut}:00.000Z`).toISOString();
    }

    const payload = {
      employee_id: (formData.employee_id || formData.employeeId || '').toString(),
      date: new Date(`${targetDate}T00:00:00.000Z`).toISOString(),
      shift: formData.shift || 'Day Shift',
      status,
      break_time: formData.breakTime || '01:00',
      total_hours: formData.totalHours || '08:00',
      notes: formData.notes || '',
    };

    if (clockIn) payload.clock_in_time = clockIn;
    if (clockOut) payload.clock_out_time = clockOut;

    return payload;
  },

  /**
   * Maps status letter ('P' | 'A' | 'L' | 'H' | 'W') to backend enum
   */
  matrixSymbolToBackendStatus(symbol) {
    switch (symbol) {
      case 'P': return 'PRESENT';
      case 'A': return 'ABSENT';
      case 'L': return 'ON_LEAVE';
      case 'H': return 'HOLIDAY';
      case 'W': return 'WEEKEND';
      default: return 'PRESENT';
    }
  },

  /**
   * Maps backend enum to matrix symbol
   */
  backendStatusToMatrixSymbol(status) {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PRESENT':
      case 'LATE':
      case 'HALF_DAY':
        return 'P';
      case 'ABSENT':
        return 'A';
      case 'ON_LEAVE':
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
