import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert
} from '@mui/material';

// Icons
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

// Initial staff list matching Luxuria Admin Template
const initialStaffRoster = [
  {
    id: 1,
    empId: 'EMP-001',
    name: 'Jacob Ryan',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [5, 18],
    holidays: [14],
  },
  {
    id: 2,
    empId: 'EMP-002',
    name: 'Angelica Ramos',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [12, 13, 27],
    holidays: [14],
  },
  {
    id: 3,
    empId: 'EMP-003',
    name: 'Jens Brincker',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [9],
    holidays: [14],
  },
  {
    id: 4,
    empId: 'EMP-004',
    name: 'Mark Hay',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [2, 19, 20],
    holidays: [14],
  },
  {
    id: 5,
    empId: 'EMP-005',
    name: 'Cara Stevens',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [22],
    holidays: [14],
  },
  {
    id: 6,
    empId: 'EMP-006',
    name: 'John Doe',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [6, 7],
    holidays: [14],
  },
  {
    id: 7,
    empId: 'EMP-007',
    name: 'Ashton Cox',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [15, 16],
    holidays: [14],
  },
  {
    id: 8,
    empId: 'EMP-008',
    name: 'Sarah Connor',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [11],
    holidays: [14],
  },
  {
    id: 9,
    empId: 'EMP-009',
    name: 'Michael Scott',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [3, 24],
    holidays: [14],
  },
  {
    id: 10,
    empId: 'EMP-010',
    name: 'Dwight Schrute',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [],
    holidays: [14],
  },
  {
    id: 11,
    empId: 'EMP-011',
    name: 'Emily Watson',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [8, 25],
    holidays: [14],
  },
  {
    id: 12,
    empId: 'EMP-012',
    name: 'Robert Brown',
    role: 'Hotel Staff',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    online: true,
    leaveDays: [17],
    holidays: [14],
  }
];

const monthsList = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const yearsList = [2026, 2025, 2024, 2023, 2022];

export default function AttendanceSheet() {
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

  return (
    <div className="p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden">

      {/* 2. Top 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1 mb-2">
        {/* Present Card */}
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{stats.present}</div>
            <div className="text-[11px] text-gray-500 font-medium">Present</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-green-50 text-green-600">
            <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
        </div>

        {/* Leave Card */}
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{stats.leave}</div>
            <div className="text-[11px] text-gray-500 font-medium">Leave</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-600">
            <EventBusyOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
        </div>

        {/* Holiday Card */}
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{stats.holiday}</div>
            <div className="text-[11px] text-gray-500 font-medium">Holiday</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-yellow-50 text-yellow-600">
            <CelebrationOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
        </div>

        {/* Weekend Days Card */}
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{stats.weekend}</div>
            <div className="text-[11px] text-gray-500 font-medium">Weekend Days</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
            <WeekendOutlinedIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* 3. Year & Month Filter Controls Card */}
      <div className="bg-white rounded-[6px] border border-gray-100 shadow-sm p-2.5 sm:p-3 mb-2">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Year Select */}
          <div className="flex-1">
            <FormControl fullWidth size="small">
              <InputLabel id="year-select-label" sx={{ fontSize: '0.8125rem' }}>
                Year *
              </InputLabel>
              <Select
                labelId="year-select-label"
                value={selectedYear}
                label="Year *"
                onChange={(e) => setSelectedYear(e.target.value)}
                startAdornment={
                  <CalendarTodayIcon
                    sx={{ fontSize: 16, color: '#94a3b8', marginRight: '6px' }}
                  />
                }
                sx={{
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  height: '32px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cbd5e1'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#5d5fef'
                  }
                }}
              >
                {yearsList.map((yr) => (
                  <MenuItem key={yr} value={yr} sx={{ fontSize: '0.8125rem' }}>
                    {yr}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Month Select */}
          <div className="flex-1">
            <FormControl fullWidth size="small">
              <InputLabel id="month-select-label" sx={{ fontSize: '0.8125rem' }}>
                Month *
              </InputLabel>
              <Select
                labelId="month-select-label"
                value={selectedMonth}
                label="Month *"
                onChange={(e) => setSelectedMonth(e.target.value)}
                startAdornment={
                  <DateRangeIcon
                    sx={{ fontSize: 16, color: '#94a3b8', marginRight: '6px' }}
                  />
                }
                sx={{
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  height: '32px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e2e8f0'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cbd5e1'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#5d5fef'
                  }
                }}
              >
                {monthsList.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontSize: '0.8125rem' }}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Update Sheet Action Button */}
          <div className="w-full md:w-auto">
            <button
              onClick={handleUpdateSheet}
              className="w-full md:w-auto h-[32px] px-4 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <FlashOnIcon sx={{ fontSize: 16 }} />
              <span>Update Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Attendance Sheet Grid & Legend Card */}
      <div className="bg-white rounded-[6px] border border-gray-100 shadow-sm p-2 sm:p-2.5 mb-2">
        {/* Top Header Bar inside Card: Month Badge & Legend */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100">
          {/* Dynamic Month Pill */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#D0FAE5] text-[#218E6C] font-semibold text-xs">
              <InfoOutlinedIcon sx={{ fontSize: 14 }} />
              <span>
                {appliedMonth} {appliedYear}
              </span>
            </div>

            {/* Quick Search Staff Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search staff..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:border-[#5d5fef] text-slate-700 w-32 sm:w-44 placeholder-slate-400 transition-all h-[28px]"
              />
              <SearchIcon
                sx={{
                  position: 'absolute',
                  left: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 14,
                  color: '#94a3b8'
                }}
              />
            </div>
          </div>

          {/* Legend Items & Export */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap text-xs">
            {/* Legend P */}
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[9px] flex items-center justify-center">
                P
              </span>
              <span className="text-slate-600 font-medium text-[11px]">Present</span>
            </div>

            {/* Legend L */}
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold text-[9px] flex items-center justify-center">
                L
              </span>
              <span className="text-slate-600 font-medium text-[11px]">Leave</span>
            </div>

            {/* Legend H */}
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 font-bold text-[9px] flex items-center justify-center">
                H
              </span>
              <span className="text-slate-600 font-medium text-[11px]">Holiday</span>
            </div>

            {/* Legend W */}
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center">
                W
              </span>
              <span className="text-slate-600 font-medium text-[11px]">Weekend</span>
            </div>

            {/* Export Action */}
            <Tooltip title="Export to CSV">
              <button
                onClick={handleExportCSV}
                className="ml-auto lg:ml-1 p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#5d5fef] hover:border-[#5d5fef] transition-colors cursor-pointer h-[26px] w-[26px] flex items-center justify-center"
              >
                <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* 5. Horizontal Calendar Matrix Table */}
        <div className="attendance-sheet-scroll mt-2 rounded border border-slate-200 overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider select-none">
                {/* Fixed Employee Column */}
                <th
                  scope="col"
                  className="py-2 px-3 sticky left-0 z-20 bg-slate-50 border-r border-b border-slate-200 min-w-[190px] max-w-[220px] shadow-[2px_0_5px_rgba(0,0,0,0.02)]"
                >
                  Employee Detail
                </th>

                {/* Day Columns 1 to 28/29/30/31 */}
                {daysArray.map((day) => {
                  const dateObj = new Date(appliedYear, monthIndex, day);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  return (
                    <th
                      key={day}
                      scope="col"
                      className={`py-1.5 px-0.5 text-center font-bold text-[11px] border-r border-b border-slate-200 min-w-[30px] max-w-[36px] ${
                        isWeekend ? 'bg-slate-100/70 text-slate-700' : 'text-slate-600'
                      }`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td
                    colSpan={daysArray.length + 1}
                    className="py-8 text-center text-slate-400 font-medium text-xs"
                  >
                    No staff found matching "{searchEmployee}"
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Employee Profile Cell (Sticky Left) */}
                    <td className="py-1.5 px-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50/90 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-colors">
                      <div className="flex items-center gap-2">
                        {/* Avatar with Online Green Dot */}
                        <div className="relative shrink-0">
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-100 shadow-xs"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                staff.name
                              )}&background=5d5fef&color=fff`;
                            }}
                          />
                          {staff.online && (
                            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1.5 ring-white" />
                          )}
                        </div>

                        {/* Name & Role */}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 truncate hover:text-[#5d5fef] transition-colors cursor-pointer">
                            {staff.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-normal leading-tight">
                            {staff.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Day Matrix Badges (1 to 28/29/30/31) */}
                    {daysArray.map((day) => {
                      const status = attendanceData[staff.id]?.[day] || 'P';

                      let badgeClass = '';
                      let statusText = '';

                      if (status === 'P') {
                        badgeClass = 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
                        statusText = 'Present';
                      } else if (status === 'L') {
                        badgeClass = 'bg-rose-100 text-rose-700 hover:bg-rose-200';
                        statusText = 'Leave';
                      } else if (status === 'H') {
                        badgeClass = 'bg-amber-100 text-amber-700 hover:bg-amber-200';
                        statusText = 'Holiday';
                      } else {
                        badgeClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                        statusText = 'Weekend';
                      }

                      return (
                        <td
                          key={day}
                          className="py-1 px-0.5 text-center border-r border-slate-200/80 align-middle"
                        >
                          <Tooltip
                            title={`${staff.name} - Day ${day}: ${statusText} (Click to toggle)`}
                            arrow
                          >
                            <button
                              onClick={() => handleCellClick(staff.id, day)}
                              className={`w-5 h-5 rounded-full font-bold text-[10px] inline-flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer select-none shadow-2xs ${badgeClass}`}
                            >
                              {status}
                            </button>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info note */}
        <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1.5">
          <span>Showing {filteredStaff.length} employee records for {appliedMonth} {appliedYear}</span>
          <span className="italic">Tip: Click on any day badge to cycle status (P → L → H → W)</span>
        </div>
      </div>

      {/* Snackbar Alert */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '8px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
