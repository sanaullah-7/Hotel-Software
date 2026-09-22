import React from'react';
import { Link } from'react-router-dom';
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
} from'@mui/material';

// Icons
import HomeOutlinedIcon from'@mui/icons-material/HomeOutlined';
import CheckCircleOutlinedIcon from'@mui/icons-material/CheckCircleOutlined';
import EventBusyOutlinedIcon from'@mui/icons-material/EventBusyOutlined';
import CelebrationOutlinedIcon from'@mui/icons-material/CelebrationOutlined';
import WeekendOutlinedIcon from'@mui/icons-material/WeekendOutlined';
import FlashOnIcon from'@mui/icons-material/FlashOn';
import CalendarTodayIcon from'@mui/icons-material/CalendarToday';
import DateRangeIcon from'@mui/icons-material/DateRange';
import InfoOutlinedIcon from'@mui/icons-material/InfoOutlined';
import SearchIcon from'@mui/icons-material/Search';
import FileDownloadOutlinedIcon from'@mui/icons-material/FileDownloadOutlined';
import RefreshIcon from'@mui/icons-material/Refresh';

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
 handleCellClick,
 handleExportCSV
 } = useAttendanceSheet();

 return (
 <div className="p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden">

 {/* 2. Top 4 Metric Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 mb-2">
 {/* Present Card */}
 <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all hover:shadow-md">
 <div>
 <h3 className="text-xl sm:text-lg font-bold text-slate-800 leading-none">
 {stats.present}
 </h3>
 <p className="text-xs text-slate-500 font-medium mt-1">Present</p>
 </div>
 <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
 <CheckCircleOutlinedIcon sx={{ fontSize: 22 }} />
 </div>
 </div>

 {/* Leave Card */}
 <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all hover:shadow-md">
 <div>
 <h3 className="text-xl sm:text-lg font-bold text-slate-800 leading-none">
 {stats.leave}
 </h3>
 <p className="text-xs text-slate-500 font-medium mt-1">Leave</p>
 </div>
 <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
 <EventBusyOutlinedIcon sx={{ fontSize: 22 }} />
 </div>
 </div>

 {/* Holiday Card */}
 <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all hover:shadow-md">
 <div>
 <h3 className="text-xl sm:text-lg font-bold text-slate-800 leading-none">
 {stats.holiday}
 </h3>
 <p className="text-xs text-slate-500 font-medium mt-1">Holiday</p>
 </div>
 <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
 <CelebrationOutlinedIcon sx={{ fontSize: 22 }} />
 </div>
 </div>

 {/* Weekend Days Card */}
 <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-between transition-all hover:shadow-md">
 <div>
 <h3 className="text-xl sm:text-lg font-bold text-slate-800 leading-none">
 {stats.weekend}
 </h3>
 <p className="text-xs text-slate-500 font-medium mt-1">Weekend Days</p>
 </div>
 <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
 <WeekendOutlinedIcon sx={{ fontSize: 22 }} />
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

 {/* Legend L */}
 <div className="flex items-center gap-1.5">
 <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center">
 L
 </span>
 <span className="text-slate-600 font-medium">Leave</span>
 </div>

 {/* Legend H */}
 <div className="flex items-center gap-1.5">
 <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center">
 H
 </span>
 <span className="text-slate-600 font-medium">Holiday</span>
 </div>

 {/* Legend W */}
 <div className="flex items-center gap-1.5">
 <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
 W
 </span>
 <span className="text-slate-600 font-medium">Weekend</span>
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
 <div className="mt-4 rounded-lg border border-slate-200">
 <table className="w-full border-collapse text-left min-w-[900px]">
 <thead>
 <tr className="bg-slate-50/90 text-slate-500 uppercase text-[11px] font-bold tracking-wider select-none">
 {/* Fixed Employee Column */}
 <th
 scope="col"
 className="py-3 px-4 sticky left-0 z-20 bg-slate-50 border-r border-b border-slate-200 min-w-[210px] max-w-[240px] shadow-[2px_0_5px_rgba(0,0,0,0.02)]"
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
 className={`py-3 px-1 text-center font-bold text-xs border-r border-b border-slate-200 min-w-[36px] max-w-[42px] ${
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
 No staff found matching"{searchEmployee}"
 </td>
 </tr>
 ) : (
 filteredStaff.map((staff) => (
 <tr
 key={staff.id}
 className="hover:bg-slate-50/70 transition-colors group"
 >
 {/* Employee Profile Cell (Sticky Left) */}
 <td className="py-2.5 px-4 sticky left-0 z-10 bg-white group-hover:bg-slate-50/90 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)] transition-colors">
 <div className="flex items-center gap-3">
 {/* Avatar with Online Green Dot */}
 <div className="relative shrink-0">
 <img
 src={staff.avatar}
 alt={staff.name}
 className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-xs"
 onError={(e) => {
 e.target.onerror = null;
 e.target.src =`https://ui-avatars.com/api/?name=${encodeURIComponent(
 staff.name
 )}&background=5d5fef&color=fff`;
 }}
 />
 {staff.online && (
 <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
 )}
 </div>

 {/* Name & Role */}
 <div className="min-w-0 flex-1">
 <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate hover:text-[#5d5fef] transition-colors cursor-pointer">
 {staff.name}
 </p>
 <p className="text-[11px] text-slate-400 font-normal leading-tight">
 {staff.role}
 </p>
 </div>
 </div>
 </td>

 {/* Day Matrix Badges (1 to 28/29/30/31) */}
 {daysArray.map((day) => {
 const status = attendanceData[staff.id]?.[day] ||'P';

 let badgeClass ='';
 let statusText ='';

 if (status ==='P') {
 badgeClass ='bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
 statusText ='Present';
 } else if (status ==='L') {
 badgeClass ='bg-rose-100 text-rose-700 hover:bg-rose-200';
 statusText ='Leave';
 } else if (status ==='H') {
 badgeClass ='bg-amber-100 text-amber-700 hover:bg-amber-200';
 statusText ='Holiday';
 } else {
 badgeClass ='bg-slate-100 text-slate-600 hover:bg-slate-200';
 statusText ='Weekend';
 }

 return (
 <td
 key={day}
 className="py-2 px-1 text-center border-r border-slate-200/80 align-middle"
 >
 <Tooltip
 title={`${staff.name} - Day ${day}: ${statusText} (Click to toggle)`}
 arrow
 >
 <button
 onClick={() => handleCellClick(staff.id, day)}
 className={`w-6 h-6 rounded-full font-bold text-[11px] inline-flex items-center justify-center transition-transform hover:scale-115 active:scale-95 cursor-pointer select-none shadow-2xs ${badgeClass}`}
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
 <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
 <span>Showing {filteredStaff.length} employee records for {appliedMonth} {appliedYear}</span>
 <span className="italic">Tip: Click on any day badge to cycle status (P → L → H → W)</span>
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
