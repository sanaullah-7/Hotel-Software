import React from 'react';
import {
 MenuItem,
 Tooltip,
 Select,
 FormControl,
 InputLabel,
 Snackbar,
 Alert
} from '@mui/material';

// Icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';

import { monthsList, yearsList } from'./constants';
import { useAttendanceSheet } from'./useAttendanceSheet';

export default function AttendanceSheet() {
 const {
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
 handleExportCSV,
 loading,
 error,
 loadSheetData
 } = useAttendanceSheet();

 return (
 <div className="p-0 w-full">
  {error && (
   <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs text-red-700">
    <span>{error}</span>
    <button
     onClick={() => loadSheetData(appliedYear, appliedMonth)}
     className="px-2.5 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700 cursor-pointer text-xs"
    >
     Retry
    </button>
   </div>
  )}
  {loading && !error && (
   <div className="mb-2 p-2 bg-blue-50/70 border border-blue-100 rounded text-center text-xs text-blue-700 font-medium">
    Loading attendance sheet records from server...
   </div>
  )}

 {/* 2. Top 4 Metric Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1 mb-2">
 {/* Present Card */}
 <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
 <div>
 <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{stats.present}</div>
 <div className="text-[13px] text-gray-500 font-medium">Present</div>
 </div>
 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
 <CheckCircleOutlinedIcon sx={{ fontSize: 18 }} />
 </div>
 </div>

 {/* Absent Card */}
 <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
 <div>
 <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{stats.absent}</div>
 <div className="text-[13px] text-gray-500 font-medium">Absent</div>
 </div>
 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-50 text-rose-600">
 <PersonOffOutlinedIcon sx={{ fontSize: 18 }} />
 </div>
 </div>

 {/* Leave Card */}
 <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
 <div>
 <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{stats.leave}</div>
 <div className="text-[13px] text-gray-500 font-medium">Leave</div>
 </div>
 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
 <EventBusyOutlinedIcon sx={{ fontSize: 18 }} />
 </div>
 </div>

 {/* Late Card */}
 <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
 <div>
 <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{stats.late || 0}</div>
 <div className="text-[13px] text-gray-500 font-medium">Late</div>
 </div>
 <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
 <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />
 </div>
 </div>
 </div>

 {/* 3. Year & Month Filter Controls Card */}
 <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2.5 sm:p-3 mb-2">
 <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
 {/* Year Select */}
 <div className="flex-1">
 <FormControl fullWidth size="small">
 <InputLabel id="year-select-label" sx={{ fontSize:'0.875rem' }}>
 Year *
 </InputLabel>
 <Select
 labelId="year-select-label"
 value={selectedYear}
 label="Year *"
 onChange={(e) => setSelectedYear(e.target.value)}
 startAdornment={
 <CalendarTodayIcon
 sx={{ fontSize: 18, color:'#94a3b8', marginRight:'8px' }}
 />
 }
 sx={{
 borderRadius:'8px',
 fontSize:'0.875rem','& .MuiOutlinedInput-notchedOutline': {
 borderColor:'#e2e8f0'
 },'&:hover .MuiOutlinedInput-notchedOutline': {
 borderColor:'#cbd5e1'
 },'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
 borderColor:'#5d5fef'
 }
 }}
 >
 {yearsList.map((yr) => (
 <MenuItem key={yr} value={yr} sx={{ fontSize:'0.875rem' }}>
 {yr}
 </MenuItem>
 ))}
 </Select>
 </FormControl>
 </div>

 {/* Month Select */}
 <div className="flex-1">
 <FormControl fullWidth size="small">
 <InputLabel id="month-select-label" sx={{ fontSize:'0.875rem' }}>
 Month *
 </InputLabel>
 <Select
 labelId="month-select-label"
 value={selectedMonth}
 label="Month *"
 onChange={(e) => setSelectedMonth(e.target.value)}
 startAdornment={
 <DateRangeIcon
 sx={{ fontSize: 18, color:'#94a3b8', marginRight:'8px' }}
 />
 }
 sx={{
 borderRadius:'8px',
 fontSize:'0.875rem','& .MuiOutlinedInput-notchedOutline': {
 borderColor:'#e2e8f0'
 },'&:hover .MuiOutlinedInput-notchedOutline': {
 borderColor:'#cbd5e1'
 },'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
 borderColor:'#5d5fef'
 }
 }}
 >
 {monthsList.map((m) => (
 <MenuItem key={m} value={m} sx={{ fontSize:'0.875rem' }}>
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
 className="w-full md:w-auto h-[40px] px-6 rounded-lg bg-[#5d5fef] hover:bg-[#4d4fd9] active:bg-[#4345c2] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
 >
 <FlashOnIcon sx={{ fontSize: 18 }} />
 <span>Update Sheet</span>
 </button>
 </div>
 </div>
 </div>

 {/* 4. Main Attendance Sheet Grid & Legend Card */}
 <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 mb-2">
 {/* Top Header Bar inside Card: Month Badge & Legend */}
 <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
 {/* Dynamic Month Pill */}
 <div className="flex items-center gap-3 flex-wrap">
 <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#5d5fef]/10 text-[#5d5fef] font-semibold text-xs sm:text-sm">
 <InfoOutlinedIcon sx={{ fontSize: 16 }} />
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
 className="pl-8 pr-3 py-1 text-xs sm:text-sm rounded-md border border-slate-200 focus:outline-none focus:border-[#5d5fef] text-slate-700 w-36 sm:w-48 placeholder-slate-400 transition-all"
 />
 <SearchIcon
 sx={{
 position:'absolute',
 left: 8,
 top:'50%',
 transform:'translateY(-50%)',
 fontSize: 16,
 color:'#94a3b8'
 }}
 />
 </div>
 </div>

 {/* Legend Items & Export */}
 <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs sm:text-sm">
 {/* Legend P */}
 <div className="flex items-center gap-1.5">
 <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
 P
 </span>
 <span className="text-slate-600 font-medium">Present</span>
 </div>

 {/* Legend A */}
 <div className="flex items-center gap-1.5">
 <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center">
 A
 </span>
 <span className="text-slate-600 font-medium">Absent</span>
 </div>

 {/* Legend LT */}
 <div className="flex items-center gap-1.5">
 <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[8.5px] tracking-tighter flex items-center justify-center">
 LT
 </span>
 <span className="text-slate-600 font-medium">Late</span>
 </div>

 {/* Legend L */}
 <div className="flex items-center gap-1.5">
 <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
 L
 </span>
 <span className="text-slate-600 font-medium">Leave</span>
 </div>

 {/* Export Action */}
 <Tooltip title="Export to CSV">
 <button
 onClick={handleExportCSV}
 className="ml-auto lg:ml-2 p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#5d5fef] hover:border-[#5d5fef] transition-colors cursor-pointer"
 >
 <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
 </button>
 </Tooltip>
 </div>
 </div>

 {/* 5. Horizontal Calendar Matrix Table */}
 <div className="mt-4 rounded-lg border border-slate-200 overflow-x-auto">
 <table className="w-full border-collapse text-left min-w-[880px]">
 <thead>
 <tr className="bg-slate-50/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider select-none">
 {/* Fixed Employee Column */}
 <th
 scope="col"
 className="py-2 px-3 sticky left-0 z-20 bg-slate-50 border-r border-b border-slate-200 min-w-[150px] max-w-[170px] shadow-[2px_0_5px_rgba(0,0,0,0.02)]"
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
 className={`py-2 px-0.5 text-center font-bold text-[10px] border-r border-b border-slate-200 w-[24px] min-w-[22px] max-w-[26px] ${
 isWeekend ?'bg-slate-100/70 text-slate-700' :'text-slate-600'
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
 className="py-12 text-center text-slate-400 font-medium text-sm"
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
 e.target.src =`https://ui-avatars.com/api/?name=${encodeURIComponent(
 staff.name
 )}&background=5d5fef&color=fff`;
 }}
 />
 {staff.online && (
 <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white" />
 )}
 </div>

 {/* Name & Role */}
 <div className="min-w-0 flex-1">
 <p className="text-xs font-semibold text-slate-800 truncate hover:text-[#5d5fef] transition-colors cursor-pointer">
 {staff.name}
 </p>
 <p className="text-[10px] text-slate-400 font-normal leading-tight truncate">
 {staff.role}
 </p>
 </div>
 </div>
 </td>

 {/* Day Matrix Badges (1 to 28/29/30/31) */}
 {daysArray.map((day) => {
 const status = attendanceData[staff.id]?.[day] ||'';

 let badgeClass ='';
 let statusText ='';

 if (status === 'P') {
 badgeClass = 'bg-emerald-100 text-emerald-700';
 statusText = 'Present';
 } else if (status === 'LT') {
 badgeClass = 'bg-amber-100 text-amber-700 text-[8.5px] tracking-tighter';
 statusText = 'Late (Present)';
 } else if (status === 'A') {
 badgeClass = 'bg-rose-100 text-rose-700';
 statusText = 'Absent';
 } else if (status === 'L') {
 badgeClass = 'bg-blue-100 text-blue-700';
 statusText = 'Leave';
 } else if (status === 'H') {
 badgeClass = 'bg-amber-100 text-amber-700';
 statusText = 'Holiday';
 } else if (status === 'W') {
 badgeClass = 'bg-slate-100 text-slate-600';
 statusText = 'Weekend';
 } else {
 badgeClass = 'bg-slate-50 text-slate-300 border border-dashed border-slate-200';
 statusText = 'Not recorded';
 }

 return (
 <td
 key={day}
 className="py-1 px-0.5 text-center border-r border-slate-200/80 align-middle w-[24px] min-w-[22px] max-w-[26px]"
 >
 <Tooltip
 title={`${staff.name} - Day ${day}: ${statusText}`}
 arrow
 >
 <span
 className={`w-5 h-5 rounded-full font-bold text-[10px] inline-flex items-center justify-center select-none shadow-2xs ${badgeClass}`}
 >
 {status || '-'}
 </span>
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
 <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
 <span>Showing {filteredStaff.length} employee records for {appliedMonth} {appliedYear}</span>
 <span className="italic">Tip: Records are synchronized automatically from Today's Attendance</span>
 </div>
 </div>

 {/* Snackbar Alert */}
 <Snackbar
 open={toast.open}
 autoHideDuration={3000}
 onClose={() => setToast({ ...toast, open: false })}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 >
 <Alert
 onClose={() => setToast({ ...toast, open: false })}
 severity={toast.severity}
 variant="filled"
 sx={{ width:'100%', borderRadius:'8px' }}
 >
 {toast.message}
 </Alert>
 </Snackbar>
 </div>
 );
}
