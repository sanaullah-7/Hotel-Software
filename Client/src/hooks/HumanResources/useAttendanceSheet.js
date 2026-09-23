import { useState, useMemo, useEffect } from 'react';
import { initialStaffRoster, monthsList } from '../../utils/HumanResources/attendanceSheetConstants';

export function useAttendanceSheet() {
  // Filter States
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState('November');
  const [searchEmployee, setSearchEmployee] = useState('');

  // Applied sheet parameters (updated on "Update Sheet" button click)
  const [appliedYear, setAppliedYear] = useState(2024);
  const [appliedMonth, setAppliedMonth] = useState('November');

  // Matrix state: { [employeeId]: { [day]: 'P' | 'L' | 'H' | 'W' } }
  const [attendanceData, setAttendanceData] = useState({});

  // Toast / Notification
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Compute days in month
  const monthIndex = monthsList.indexOf(appliedMonth); // 0 - 11
  const totalDays = new Date(appliedYear, monthIndex + 1, 0).getDate(); // 28 - 31
  const daysArray = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);

  // Generate initial or updated matrix based on applied year and month
  const generateMonthMatrix = (year, monthName) => {
    const mIdx = monthsList.indexOf(monthName);
    const numDays = new Date(year, mIdx + 1, 0).getDate();
    const newMatrix = {};

    initialStaffRoster.forEach((staff) => {
      newMatrix[staff.id] = {};
      for (let d = 1; d <= numDays; d++) {
        const dateObj = new Date(year, mIdx, d);
        const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Weekend
          newMatrix[staff.id][d] = 'W';
        } else if (staff.holidays.includes(d)) {
          // Holiday
          newMatrix[staff.id][d] = 'H';
        } else if (staff.leaveDays.includes(d)) {
          // Leave
          newMatrix[staff.id][d] = 'L';
        } else {
          // Present
          newMatrix[staff.id][d] = 'P';
        }
      }
    });

    return newMatrix;
  };

  // Initialize matrix on first load
  useEffect(() => {
    setAttendanceData(generateMonthMatrix(appliedYear, appliedMonth));
  }, [appliedYear, appliedMonth]);

  // Handle "Update Sheet" click
  const handleUpdateSheet = () => {
    setAppliedYear(selectedYear);
    setAppliedMonth(selectedMonth);
    const newMatrix = generateMonthMatrix(selectedYear, selectedMonth);
    setAttendanceData(newMatrix);
    setToast({
      open: true,
      message: `Attendance sheet updated for ${selectedMonth} ${selectedYear}`,
      severity: 'success'
    });
  };

  // Toggle cell status on click: P -> L -> H -> W -> P
  const handleCellClick = (staffId, day) => {
    const currentStatus = attendanceData[staffId]?.[day] || 'P';
    const sequence = ['P', 'L', 'H', 'W'];
    const nextIndex = (sequence.indexOf(currentStatus) + 1) % sequence.length;
    const nextStatus = sequence[nextIndex];

    setAttendanceData((prev) => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [day]: nextStatus
      }
    }));
  };

  // Calculate dynamic stats across all employees
  const stats = useMemo(() => {
    let present = 0;
    let leave = 0;
    let holiday = 0;
    let weekend = 0;

    Object.values(attendanceData).forEach((staffDays) => {
      Object.values(staffDays).forEach((status) => {
        if (status === 'P') present++;
        else if (status === 'L') leave++;
        else if (status === 'H') holiday++;
        else if (status === 'W') weekend++;
      });
    });

    // If initial loading or empty, provide template benchmark numbers
    if (present === 0 && leave === 0 && holiday === 0 && weekend === 0) {
      return { present: 166, leave: 34, holiday: 30, weekend: 80 };
    }

    return { present, leave, holiday, weekend };
  }, [attendanceData]);

  // Filter staff by search input
  const filteredStaff = useMemo(() => {
    if (!searchEmployee.trim()) return initialStaffRoster;
    return initialStaffRoster.filter(
      (s) =>
        s.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
        s.empId.toLowerCase().includes(searchEmployee.toLowerCase())
    );
  }, [searchEmployee]);

  // Export Sheet to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    // Header
    const headers = ['Employee ID', 'Employee Name', 'Role', ...daysArray.map((d) => `Day ${d}`)];
    csvContent += headers.join(',') + '\r\n';

    filteredStaff.forEach((staff) => {
      const row = [
        staff.empId,
        `"${staff.name}"`,
        `"${staff.role}"`,
        ...daysArray.map((d) => attendanceData[staff.id]?.[d] || 'P')
      ];
      csvContent += row.join(',') + '\r\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Sheet_${appliedMonth}_${appliedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({
      open: true,
      message: 'Attendance Sheet exported to CSV successfully!',
      severity: 'success'
    });
  };

  return {
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    searchEmployee, setSearchEmployee,
    appliedYear, appliedMonth,
    attendanceData,
    toast, setToast,
    monthIndex,
    daysArray,
    stats,
    filteredStaff,
    handleUpdateSheet,
    handleCellClick,
    handleExportCSV
  };
}
