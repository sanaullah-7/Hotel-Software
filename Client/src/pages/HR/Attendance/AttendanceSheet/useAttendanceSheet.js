import { useState, useMemo, useEffect, useCallback } from 'react';
import { monthsList } from './constants';
import staffService from '../../../../features/staff/services/staffService';
import attendanceService from '../../../../features/staff/services/attendanceService';
import attendanceAdapter from '../../../../features/staff/adapters/attendanceAdapter';

export function useAttendanceSheet() {
  const currentYear = new Date().getFullYear();
  const currentMonthName = monthsList[new Date().getMonth()];

  // Filter States
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [searchEmployee, setSearchEmployee] = useState('');

  // Applied sheet parameters (updated on "Update Sheet" button click)
  const [appliedYear, setAppliedYear] = useState(currentYear);
  const [appliedMonth, setAppliedMonth] = useState(currentMonthName);

  // Canonical data states
  const [staffList, setStaffList] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast / Notification
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Compute days in month
  const monthIndex = monthsList.indexOf(appliedMonth) >= 0 ? monthsList.indexOf(appliedMonth) : 0;
  const totalDays = new Date(appliedYear, monthIndex + 1, 0).getDate(); // 28 - 31
  const daysArray = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);

  // Load canonical employees and attendance records from server
  const loadSheetData = useCallback(async (year, monthName) => {
    try {
      setLoading(true);
      setError(null);

      const mIdx = monthsList.indexOf(monthName) >= 0 ? monthsList.indexOf(monthName) : 0;
      const numDays = new Date(year, mIdx + 1, 0).getDate();
      const monthStr = String(mIdx + 1).padStart(2, '0');
      const startDate = `${year}-${monthStr}-01`;
      const endDate = `${year}-${monthStr}-${String(numDays).padStart(2, '0')}`;

      const [empsRes, attRes] = await Promise.all([
        staffService.getEmployees({ limit: 200 }),
        attendanceService.getAttendance({ start_date: startDate, end_date: endDate }),
      ]);

      const emps = empsRes?.data?.data || empsRes?.data || [];
      const records = attRes?.data?.data || attRes?.data || [];

      setStaffList(Array.isArray(emps) ? emps : []);

      // Build attendance matrix
      const matrix = attendanceAdapter.toMatrixUI(emps, records, year, mIdx);
      setAttendanceData(matrix);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load attendance sheet from server';
      console.error('Error fetching attendance sheet:', err);
      setError(msg);
      setToast({
        open: true,
        message: msg,
        severity: 'error',
      });
      setStaffList([]);
      setAttendanceData({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize or reload matrix when appliedYear or appliedMonth changes
  useEffect(() => {
    loadSheetData(appliedYear, appliedMonth);
  }, [appliedYear, appliedMonth, loadSheetData]);

  // Apply filters button handler
  const handleUpdateSheet = () => {
    setAppliedYear(selectedYear);
    setAppliedMonth(selectedMonth);
  };

  // Filtered staff list for table display
  const filteredStaff = useMemo(() => {
    const list = Array.isArray(staffList) ? staffList : [];
    return list
      .map((emp) => {
        const id = (emp._id || emp.id || '').toString();
        const empId = emp.employee_ref || (emp._id ? `EMP-${emp._id.slice(-4).toUpperCase()}` : 'EMP-000');
        const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Staff Member';
        const role = emp.job_title || 'Hotel Staff';
        const avatar =
          emp.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5d5fef&color=fff`;
        const online = (emp.status || '').toUpperCase() === 'ACTIVE';

        return {
          id,
          empId,
          name: fullName,
          role,
          avatar,
          online,
        };
      })
      .filter((staff) => {
        if (!searchEmployee.trim()) return true;
        const q = searchEmployee.toLowerCase();
        return (
          staff.name.toLowerCase().includes(q) ||
          staff.empId.toLowerCase().includes(q) ||
          staff.role.toLowerCase().includes(q)
        );
      });
  }, [staffList, searchEmployee]);

  // Dynamic 4-card Metric Summary Statistics
  const stats = useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;

    Object.values(attendanceData).forEach((empDays) => {
      Object.values(empDays || {}).forEach((symbol) => {
        if (symbol === 'P') {
          present++;
        } else if (symbol === 'LT') {
          present++;
          late++;
        } else if (symbol === 'A') {
          absent++;
        } else if (symbol === 'L') {
          leave++;
        }
      });
    });

    return {
      present,
      late,
      absent,
      leave,
      totalStaff: filteredStaff.length,
    };
  }, [attendanceData, filteredStaff]);

  // CSV Export
  const handleExportCSV = () => {
    try {
      const headers = ['Employee ID', 'Name', 'Role', ...daysArray.map((d) => `Day ${d}`)];
      const rows = filteredStaff.map((staff) => {
        const empDays = attendanceData[staff.id] || {};
        const dayCols = daysArray.map((d) => empDays[d] || '-');
        return [staff.empId, staff.name, staff.role, ...dayCols];
      });

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Attendance_Sheet_${appliedMonth}_${appliedYear}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({
        open: true,
        message: `Exported attendance sheet for ${appliedMonth} ${appliedYear}!`,
        severity: 'success',
      });
    } catch {
      setToast({
        open: true,
        message: 'Failed to export CSV',
        severity: 'error',
      });
    }
  };

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    searchEmployee,
    setSearchEmployee,
    appliedYear,
    appliedMonth,
    attendanceData,
    loading,
    error,
    toast,
    setToast,
    monthIndex,
    daysArray,
    stats,
    filteredStaff,
    handleUpdateSheet,
    handleExportCSV,
    loadSheetData,
  };
}
