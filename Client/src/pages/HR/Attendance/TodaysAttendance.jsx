import React, { useState, useMemo } from'react';
import { Link } from'react-router-dom';
import {
 IconButton,
 Tooltip,
 Checkbox,
 Dialog,
 DialogContent,
 TextField,
 MenuItem,
 Popover,
 FormControlLabel,
 Snackbar,
 Alert
} from'@mui/material';

// Material Icons
import HomeOutlinedIcon from'@mui/icons-material/HomeOutlined';
import SearchIcon from'@mui/icons-material/Search';
import FilterListIcon from'@mui/icons-material/FilterList';
import AddCircleOutlineOutlinedIcon from'@mui/icons-material/AddCircleOutlineOutlined';
import RefreshIcon from'@mui/icons-material/Refresh';
import TableChartOutlinedIcon from'@mui/icons-material/TableChartOutlined';
import PictureAsPdfIcon from'@mui/icons-material/PictureAsPdf';
import ScheduleIcon from'@mui/icons-material/Schedule';
import EditOutlinedIcon from'@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from'@mui/icons-material/DeleteOutlined';
import CloseIcon from'@mui/icons-material/Close';
import ChevronLeftIcon from'@mui/icons-material/ChevronLeft';
import ChevronRightIcon from'@mui/icons-material/ChevronRight';
import ArrowUpwardIcon from'@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from'@mui/icons-material/ArrowDownward';
import WarningAmberOutlinedIcon from'@mui/icons-material/WarningAmberOutlined';
import PeopleOutlinedIcon from'@mui/icons-material/PeopleOutlined';
import HowToRegOutlinedIcon from'@mui/icons-material/HowToRegOutlined';
import PersonOffOutlinedIcon from'@mui/icons-material/PersonOffOutlined';
import PercentOutlinedIcon from'@mui/icons-material/PercentOutlined';
import WbSunnyOutlinedIcon from'@mui/icons-material/WbSunnyOutlined';
import NightsStayOutlinedIcon from'@mui/icons-material/NightsStayOutlined';

// PDF Export Dependencies
import jsPDF from'jspdf';
import autoTable from'jspdf-autotable';

// Initial dataset matching Luxuria template exactly
const initialAttendanceRecords = [
 {
 id: 1,
 empId:'EMP-101',
 name:'Joseph Nye',
 avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:28',
 breakTime:'01:00',
 lastOut:'19:32',
 totalHours:'08:02',
 status:'absent',
 shift:'Night Shift'
 },
 {
 id: 2,
 empId:'EMP-102',
 name:'John Deo',
 avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:30',
 breakTime:'01:15',
 lastOut:'19:37',
 totalHours:'08:02',
 status:'present',
 shift:'Night Shift'
 },
 {
 id: 3,
 empId:'EMP-103',
 name:'Sarah Smith',
 avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:30',
 breakTime:'01:10',
 lastOut:'19:37',
 totalHours:'08:10',
 status:'absent',
 shift:'Day Shift'
 },
 {
 id: 4,
 empId:'EMP-104',
 name:'Brian Shelley',
 avatar:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:30',
 breakTime:'01:07',
 lastOut:'19:38',
 totalHours:'08:10',
 status:'absent',
 shift:'Day Shift'
 },
 {
 id: 5,
 empId:'EMP-105',
 name:'Sarah Smith',
 avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:32',
 breakTime:'01:00',
 lastOut:'19:30',
 totalHours:'08:10',
 status:'absent',
 shift:'Day Shift'
 },
 {
 id: 6,
 empId:'EMP-106',
 name:'Marie Brown',
 avatar:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:32',
 breakTime:'01:05',
 lastOut:'19:40',
 totalHours:'08:00',
 status:'absent',
 shift:'Day Shift'
 },
 {
 id: 7,
 empId:'EMP-107',
 name:'Barbara Garcia',
 avatar:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:33',
 breakTime:'01:15',
 lastOut:'19:30',
 totalHours:'08:01',
 status:'present',
 shift:'Night Shift'
 },
 {
 id: 8,
 empId:'EMP-108',
 name:'Shelia Ostrowski',
 avatar:'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:38',
 breakTime:'01:07',
 lastOut:'19:40',
 totalHours:'08:00',
 status:'present',
 shift:'Night Shift'
 },
 {
 id: 9,
 empId:'EMP-109',
 name:'Ricardo Watson',
 avatar:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:38',
 breakTime:'01:15',
 lastOut:'19:37',
 totalHours:'08:00',
 status:'present',
 shift:'Night Shift'
 },
 {
 id: 10,
 empId:'EMP-110',
 name:'Kara Thomas',
 avatar:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:40',
 breakTime:'01:07',
 lastOut:'19:30',
 totalHours:'08:12',
 status:'present',
 shift:'Day Shift'
 },
 {
 id: 11,
 empId:'EMP-111',
 name:'Ashton Cox',
 avatar:'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:42',
 breakTime:'01:00',
 lastOut:'19:35',
 totalHours:'08:15',
 status:'present',
 shift:'Day Shift'
 },
 {
 id: 12,
 empId:'EMP-112',
 name:'Angelica Ramos',
 avatar:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:45',
 breakTime:'01:00',
 lastOut:'19:45',
 totalHours:'08:00',
 status:'present',
 shift:'Night Shift'
 },
 {
 id: 13,
 empId:'EMP-113',
 name:'Jens Brincker',
 avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
 firstIn:'10:50',
 breakTime:'01:10',
 lastOut:'19:40',
 totalHours:'08:00',
 status:'present',
 shift:'Day Shift'
 }
];

export default function TodaysAttendance() {
 // Main Data State
 const [attendanceList, setAttendanceList] = useState(initialAttendanceRecords);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedIds, setSelectedIds] = useState([]);
 const [isRefreshing, setIsRefreshing] = useState(false);

 // Sorting State
 const [sortField, setSortField] = useState('firstIn');
 const [sortOrder, setSortOrder] = useState('asc'); //'asc' |'desc'

 // Pagination State
 const [page, setPage] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(10);

 // Column Visibility State
 const [visibleColumns, setVisibleColumns] = useState({
 name: true,
 firstIn: true,
 breakTime: true,
 lastOut: true,
 totalHours: true,
 status: true,
 shift: true,
 actions: true
 });

 // Filter Popover State
 const [filterAnchorEl, setFilterAnchorEl] = useState(null);
 const [columnAnchorEl, setColumnAnchorEl] = useState(null);
 const [statusFilter, setStatusFilter] = useState('All');
 const [shiftFilter, setShiftFilter] = useState('All');

 // Modal Dialogs State
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [selectedRecord, setSelectedRecord] = useState(null);

 // Form State for Add / Edit
 const [formData, setFormData] = useState({
 name:'',
 shift:'Day Shift',
 firstIn:'10:30',
 breakTime:'01:00',
 lastOut:'19:30',
 totalHours:'08:00',
 status:'present',
 avatar:''
 });

 // Notification Toast State
 const [toast, setToast] = useState({ open: false, message:'', severity:'success' });

 // Calculate dynamic total hours on time change
 const calculateTotalHours = (firstIn, lastOut, breakTime) => {
 if (!firstIn || !lastOut) return'08:00';
 try {
 const [inH, inM] = firstIn.split(':').map(Number);
 const [outH, outM] = lastOut.split(':').map(Number);
 const [brkH, brkM] = (breakTime ||'01:00').split(':').map(Number);

 const inMinutes = inH * 60 + inM;
 const outMinutes = outH * 60 + outM;
 const brkMinutes = brkH * 60 + brkM;

 let diffMinutes = outMinutes - inMinutes - brkMinutes;
 if (diffMinutes < 0) diffMinutes += 24 * 60; // Crosses midnight

 const hours = Math.floor(diffMinutes / 60);
 const mins = diffMinutes % 60;
 return`${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
 } catch {
 return'08:00';
 }
 };

 // Sorting Handler
 const handleSort = (field) => {
 if (sortField === field) {
 setSortOrder(sortOrder ==='asc' ?'desc' :'asc');
 } else {
 setSortField(field);
 setSortOrder('asc');
 }
 };

 // Filter & Search Logic
 const filteredRecords = useMemo(() => {
 return attendanceList.filter((item) => {
 // Search Match
 const matchesSearch =
 item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.shift.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.status.toLowerCase().includes(searchQuery.toLowerCase());

 // Filter Match
 const matchesStatus =
 statusFilter ==='All' || item.status.toLowerCase() === statusFilter.toLowerCase();
 const matchesShift = shiftFilter ==='All' || item.shift === shiftFilter;

 return matchesSearch && matchesStatus && matchesShift;
 });
 }, [attendanceList, searchQuery, statusFilter, shiftFilter]);

 // Sorted Records
 const sortedRecords = useMemo(() => {
 const list = [...filteredRecords];
 if (!sortField) return list;

 return list.sort((a, b) => {
 let aVal = a[sortField] ||'';
 let bVal = b[sortField] ||'';

 if (typeof aVal ==='string') aVal = aVal.toLowerCase();
 if (typeof bVal ==='string') bVal = bVal.toLowerCase();

 if (aVal < bVal) return sortOrder ==='asc' ? -1 : 1;
 if (aVal > bVal) return sortOrder ==='asc' ? 1 : -1;
 return 0;
 });
 }, [filteredRecords, sortField, sortOrder]);

 // Paginated Records
 const paginatedRecords = useMemo(() => {
 const start = page * rowsPerPage;
 return sortedRecords.slice(start, start + rowsPerPage);
 }, [sortedRecords, page, rowsPerPage]);

 // Selection Logic
 const handleSelectAll = (e) => {
 if (e.target.checked) {
 const allPageIds = paginatedRecords.map((r) => r.id);
 setSelectedIds(Array.from(new Set([...selectedIds, ...allPageIds])));
 } else {
 const pageIdSet = new Set(paginatedRecords.map((r) => r.id));
 setSelectedIds(selectedIds.filter((id) => !pageIdSet.has(id)));
 }
 };

 const handleSelectRow = (id) => {
 if (selectedIds.includes(id)) {
 setSelectedIds(selectedIds.filter((item) => item !== id));
 } else {
 setSelectedIds([...selectedIds, id]);
 }
 };

 const isAllSelected =
 paginatedRecords.length > 0 && paginatedRecords.every((r) => selectedIds.includes(r.id));
 const isSomeSelected =
 paginatedRecords.some((r) => selectedIds.includes(r.id)) && !isAllSelected;

 // Refresh Action
 const handleRefresh = () => {
 setIsRefreshing(true);
 setTimeout(() => {
 setAttendanceList(initialAttendanceRecords);
 setIsRefreshing(false);
 setToast({
 open: true,
 message:"Today's attendance refreshed successfully!",
 severity:'success'
 });
 }, 400);
 };

 // PDF Export Action
 const handleExportPDF = () => {
 const doc = new jsPDF();
 doc.setFontSize(16);
 doc.setTextColor(30, 41, 59);
 doc.text("Today's Attendance Report", 14, 18);

 doc.setFontSize(10);
 doc.setTextColor(100, 116, 139);
 doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 25);

 const tableData = sortedRecords.map((item) => [
 item.name,
 item.firstIn,
 item.breakTime,
 item.lastOut,
 item.totalHours,
 item.status.toUpperCase(),
 item.shift
 ]);

 autoTable(doc, {
 startY: 30,
 head: [['Employee Name','First In','Break','Last Out','Total Hours','Status','Shift']],
 body: tableData,
 theme:'grid',
 headStyles: {
 fillColor: [93, 95, 239],
 textColor: [255, 255, 255],
 fontStyle:'bold'
 },
 styles: {
 fontSize: 9,
 cellPadding: 3
 }
 });

 doc.save(`Todays_Attendance_${new Date().toISOString().split('T')[0]}.pdf`);
 setToast({
 open: true,
 message:'PDF report generated and downloaded successfully!',
 severity:'success'
 });
 };

 // Open Add Modal
 const handleOpenAddModal = () => {
 setFormData({
 name:'',
 shift:'Day Shift',
 firstIn:'10:30',
 breakTime:'01:00',
 lastOut:'19:30',
 totalHours:'08:00',
 status:'present',
 avatar:'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
 });
 setIsAddModalOpen(true);
 };

 // Save New Attendance
 const handleSaveNewAttendance = (e) => {
 e.preventDefault();
 if (!formData.name.trim()) return;

 const total = calculateTotalHours(formData.firstIn, formData.lastOut, formData.breakTime);
 const newRecord = {
 id: Date.now(),
 empId:`EMP-${Math.floor(100 + Math.random() * 900)}`,
 name: formData.name,
 avatar:
 formData.avatar ||`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=5d5fef&color=fff`,
 firstIn: formData.firstIn,
 breakTime: formData.breakTime,
 lastOut: formData.lastOut,
 totalHours: total,
 status: formData.status,
 shift: formData.shift
 };

 setAttendanceList([newRecord, ...attendanceList]);
 setIsAddModalOpen(false);
 setToast({
 open: true,
 message:`Attendance added for ${formData.name}!`,
 severity:'success'
 });
 };

 // Open Edit Modal
 const handleOpenEditModal = (record) => {
 setSelectedRecord(record);
 setFormData({
 name: record.name,
 shift: record.shift,
 firstIn: record.firstIn,
 breakTime: record.breakTime,
 lastOut: record.lastOut,
 totalHours: record.totalHours,
 status: record.status,
 avatar: record.avatar
 });
 setIsEditModalOpen(true);
 };

 // Save Edit Attendance
 const handleSaveEditAttendance = (e) => {
 e.preventDefault();
 if (!selectedRecord) return;

 const total = calculateTotalHours(formData.firstIn, formData.lastOut, formData.breakTime);
 setAttendanceList(
 attendanceList.map((item) =>
 item.id === selectedRecord.id
 ? {
 ...item,
 name: formData.name,
 shift: formData.shift,
 firstIn: formData.firstIn,
 breakTime: formData.breakTime,
 lastOut: formData.lastOut,
 totalHours: total,
 status: formData.status
 }
 : item
 )
 );

 setIsEditModalOpen(false);
 setToast({
 open: true,
 message:`Attendance updated for ${formData.name}!`,
 severity:'success'
 });
 };

 // Open Delete Dialog
 const handleOpenDeleteDialog = (record) => {
 setSelectedRecord(record);
 setIsDeleteDialogOpen(true);
 };

 // Confirm Delete
 const handleConfirmDelete = () => {
 if (!selectedRecord) return;
 setAttendanceList(attendanceList.filter((item) => item.id !== selectedRecord.id));
 setSelectedIds(selectedIds.filter((id) => id !== selectedRecord.id));
 setIsDeleteDialogOpen(false);
 setToast({
 open: true,
 message:`Attendance record for ${selectedRecord.name} deleted!`,
 severity:'success'
 });
 };

 // Dynamic 6-card Attendance Summary Metrics
 const attendanceStats = useMemo(() => {
 const list = Array.isArray(attendanceList) ? attendanceList : [];
 const totalEmployees = list.length;
 
 // Present count (case-insensitive check)
 const presentCount = list.filter(item => (item.status ||'').toLowerCase() ==='present').length;
 
 // Absent count (case-insensitive check)
 const absentCount = list.filter(item => (item.status ||'').toLowerCase() ==='absent').length;
 
 // Attendance rate safe percentage
 const attendanceRate = totalEmployees > 0 
 ?`${Math.round((presentCount / totalEmployees) * 100)}%` 
 :'0%';
 
 // Day Shift count (case-insensitive check)
 const dayShiftCount = list.filter(item => (item.shift ||'').toLowerCase().includes('day')).length;
 
 // Night Shift count (case-insensitive check)
 const nightShiftCount = list.filter(item => (item.shift ||'').toLowerCase().includes('night')).length;

 return [
 {
 id:'total-employees',
 title:'Total Employees',
 value: totalEmployees,
 subtext:'Roster total',
 icon: PeopleOutlinedIcon,
 iconBg:'bg-[var(--primary-main)]/10',
 iconColor:'text-[var(--primary-main)]'
 },
 {
 id:'present',
 title:'Present',
 value: presentCount,
 subtext:'On duty',
 icon: HowToRegOutlinedIcon,
 iconBg:'bg-emerald-50',
 iconColor:'text-emerald-600'
 },
 {
 id:'absent',
 title:'Absent',
 value: absentCount,
 subtext:'Off duty',
 icon: PersonOffOutlinedIcon,
 iconBg:'bg-rose-50',
 iconColor:'text-rose-600'
 },
 {
 id:'attendance-rate',
 title:'Attendance Rate',
 value: attendanceRate,
 subtext:'Turnout',
 icon: PercentOutlinedIcon,
 iconBg:'bg-blue-50',
 iconColor:'text-blue-600'
 },
 {
 id:'day-shift',
 title:'Day Shift',
 value: dayShiftCount,
 subtext:'Day roster',
 icon: WbSunnyOutlinedIcon,
 iconBg:'bg-amber-50',
 iconColor:'text-amber-600'
 },
 {
 id:'night-shift',
 title:'Night Shift',
 value: nightShiftCount,
 subtext:'Night roster',
 icon: NightsStayOutlinedIcon,
 iconBg:'bg-indigo-50',
 iconColor:'text-indigo-600'
 }
 ];
 }, [attendanceList]);

 return (
 <div className="p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden flex flex-col gap-2">
 {/* ── 6 Attendance Summary Cards ─────────────────────────────── */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
 {attendanceStats.map((card) => {
 const IconComp = card.icon;
 return (
 <div
 key={card.id}
 className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-3 py-2 flex flex-col justify-between hover:border-[var(--primary-main)]/30 transition-colors"
 >
 <div className="flex items-center gap-1.5 min-w-0">
 <div className={`p-1 rounded-md ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
 <IconComp sx={{ fontSize: 15 }} />
 </div>
 <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate">
 {card.title}
 </span>
 </div>
 <div className="flex items-baseline justify-between mt-1">
 <span className="text-xl font-bold text-[var(--text-primary)] leading-none">
 {card.value}
 </span>
 {card.subtext && (
 <span className="text-[10px] text-[var(--text-secondary)] font-normal hidden xl:inline">
 {card.subtext}
 </span>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {/* 2. Main Today's Attendance Card Container */}
 <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-2 sm:p-2.5 mb-2">
 {/* Card Toolbar */}
 <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-2 border-b border-slate-100">
 {/* Left: Card Title & Search Input */}
 <div className="flex items-center gap-3.5 w-full md:w-auto flex-wrap sm:flex-nowrap">
 <h2 className="text-base sm:text-lg font-bold text-slate-800 shrink-0">
 Today's Attendance
 </h2>

 <div className="relative w-full sm:w-64">
 <input
 type="text"
 placeholder="Search..."
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setPage(0);
 }}
 className="w-full pl-3.5 pr-9 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#5d5fef] text-slate-700 placeholder-slate-400 transition-all bg-white"
 />
 <SearchIcon
 sx={{
 position:'absolute',
 right: 10,
 top:'50%',
 transform:'translateY(-50%)',
 fontSize: 18,
 color:'#64748b'
 }}
 />
 </div>
 </div>

 {/* Right: Action Buttons matching Luxuria icons */}
 <div className="flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
 {/* Filter Button */}
 <Tooltip title="Filter by Shift / Status">
 <IconButton
 onClick={(e) => setFilterAnchorEl(e.currentTarget)}
 size="small"
 sx={{
 color:'#5d5fef',
 backgroundColor:'#f5f5ff','&:hover': { backgroundColor:'#eceeff' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <FilterListIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </Tooltip>

 {/* Add Attendance Button */}
 <Tooltip title="Add Attendance">
 <IconButton
 onClick={handleOpenAddModal}
 size="small"
 sx={{
 color:'#10b981',
 backgroundColor:'#ecfdf5','&:hover': { backgroundColor:'#d1fae5' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <AddCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </Tooltip>

 {/* Refresh Button */}
 <Tooltip title="Refresh Data">
 <IconButton
 onClick={handleRefresh}
 size="small"
 sx={{
 color:'#475569',
 backgroundColor:'#f8fafc','&:hover': { backgroundColor:'#f1f5f9' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <RefreshIcon
 sx={{
 fontSize: 20,
 transition:'transform 0.4s ease',
 transform: isRefreshing ?'rotate(360deg)' :'none'
 }}
 />
 </IconButton>
 </Tooltip>

 {/* Column Toggle Button */}
 <Tooltip title="Show / Hide Columns">
 <IconButton
 onClick={(e) => setColumnAnchorEl(e.currentTarget)}
 size="small"
 sx={{
 color:'#3b82f6',
 backgroundColor:'#eff6ff','&:hover': { backgroundColor:'#dbeafe' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <TableChartOutlinedIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </Tooltip>

 {/* Export PDF Button */}
 <Tooltip title="Export to PDF">
 <IconButton
 onClick={handleExportPDF}
 size="small"
 sx={{
 color:'#ef4444',
 backgroundColor:'#fef2f2','&:hover': { backgroundColor:'#fee2e2' },
 borderRadius:'8px',
 padding:'7px'
 }}
 >
 <PictureAsPdfIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </Tooltip>
 </div>
 </div>

 {/* 3. Data Table */}
 <div className="mt-3 rounded-lg border border-slate-100">
 <table className="w-full border-collapse text-left min-w-[950px]">
 <thead>
 <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold select-none border-b border-slate-200/80">
 {/* Checkbox Column */}
 <th scope="col" className="py-3.5 px-3 w-12 text-center">
 <Checkbox
 size="small"
 checked={isAllSelected}
 indeterminate={isSomeSelected}
 onChange={handleSelectAll}
 sx={{
 color:'#94a3b8','&.Mui-checked': { color:'#5d5fef' },'&.MuiCheckbox-indeterminate': { color:'#5d5fef' },
 padding: 0
 }}
 />
 </th>

 {/* Employee Name Column */}
 {visibleColumns.name && (
 <th
 scope="col"
 onClick={() => handleSort('name')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Employee Name</span>
 {sortField ==='name' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* First In Column */}
 {visibleColumns.firstIn && (
 <th
 scope="col"
 onClick={() => handleSort('firstIn')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>First In</span>
 {sortField ==='firstIn' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Break Column */}
 {visibleColumns.breakTime && (
 <th
 scope="col"
 onClick={() => handleSort('breakTime')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Break</span>
 {sortField ==='breakTime' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Last Out Column */}
 {visibleColumns.lastOut && (
 <th
 scope="col"
 onClick={() => handleSort('lastOut')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Last Out</span>
 {sortField ==='lastOut' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Total Hours Column */}
 {visibleColumns.totalHours && (
 <th
 scope="col"
 onClick={() => handleSort('totalHours')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Total Hours</span>
 {sortField ==='totalHours' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Status Column */}
 {visibleColumns.status && (
 <th
 scope="col"
 onClick={() => handleSort('status')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Status</span>
 {sortField ==='status' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Shift Column */}
 {visibleColumns.shift && (
 <th
 scope="col"
 onClick={() => handleSort('shift')}
 className="py-3.5 px-3 cursor-pointer hover:text-[#5d5fef] transition-colors"
 >
 <div className="flex items-center gap-1">
 <span>Shift</span>
 {sortField ==='shift' ? (
 sortOrder ==='asc' ? (
 <ArrowUpwardIcon sx={{ fontSize: 15 }} />
 ) : (
 <ArrowDownwardIcon sx={{ fontSize: 15 }} />
 )
 ) : (
 <span className="text-slate-300 text-xs">↕</span>
 )}
 </div>
 </th>
 )}

 {/* Actions Column */}
 {visibleColumns.actions && (
 <th scope="col" className="py-3.5 px-3 text-right">
 Actions
 </th>
 )}
 </tr>
 </thead>

 <tbody className="divide-y divide-slate-100 text-slate-700 text-xs sm:text-sm">
 {paginatedRecords.length === 0 ? (
 <tr>
 <td
 colSpan={9}
 className="py-12 text-center text-slate-400 font-medium text-sm"
 >
 No attendance records found matching your filters.
 </td>
 </tr>
 ) : (
 paginatedRecords.map((row) => {
 const isSelected = selectedIds.includes(row.id);
 return (
 <tr
 key={row.id}
 className={`hover:bg-slate-50/80 transition-colors ${
 isSelected ?'bg-indigo-50/40' :''
 }`}
 >
 {/* Checkbox */}
 <td className="py-2.5 px-3 text-center">
 <Checkbox
 size="small"
 checked={isSelected}
 onChange={() => handleSelectRow(row.id)}
 sx={{
 color:'#cbd5e1','&.Mui-checked': { color:'#5d5fef' },
 padding: 0
 }}
 />
 </td>

 {/* Employee Name & Avatar */}
 {visibleColumns.name && (
 <td className="py-2.5 px-3 font-medium text-slate-800">
 <div className="flex items-center gap-3">
 <img
 src={row.avatar}
 alt={row.name}
 className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-2xs shrink-0"
 onError={(e) => {
 e.target.onerror = null;
 e.target.src =`https://ui-avatars.com/api/?name=${encodeURIComponent(
 row.name
 )}&background=5d5fef&color=fff`;
 }}
 />
 <span className="truncate hover:text-[#5d5fef] transition-colors">
 {row.name}
 </span>
 </div>
 </td>
 )}

 {/* First In (with indigo clock icon) */}
 {visibleColumns.firstIn && (
 <td className="py-2.5 px-3 text-slate-700">
 <div className="flex items-center gap-1.5 font-medium">
 <ScheduleIcon sx={{ fontSize: 16, color:'#5d5fef' }} />
 <span>{row.firstIn}</span>
 </div>
 </td>
 )}

 {/* Break Duration */}
 {visibleColumns.breakTime && (
 <td className="py-2.5 px-3 text-slate-600">
 {row.breakTime}
 </td>
 )}

 {/* Last Out (with indigo clock icon) */}
 {visibleColumns.lastOut && (
 <td className="py-2.5 px-3 text-slate-700">
 <div className="flex items-center gap-1.5 font-medium">
 <ScheduleIcon sx={{ fontSize: 16, color:'#5d5fef' }} />
 <span>{row.lastOut}</span>
 </div>
 </td>
 )}

 {/* Total Hours */}
 {visibleColumns.totalHours && (
 <td className="py-2.5 px-3 text-slate-700 font-medium">
 {row.totalHours}
 </td>
 )}

 {/* Status (soft badge present/absent) */}
 {visibleColumns.status && (
 <td className="py-2.5 px-3">
 {row.status.toLowerCase() ==='present' ? (
 <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700">
 present
 </span>
 ) : (
 <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-700">
 absent
 </span>
 )}
 </td>
 )}

 {/* Shift */}
 {visibleColumns.shift && (
 <td className="py-2.5 px-3 text-slate-600">
 {row.shift}
 </td>
 )}

 {/* Actions (Edit & Delete buttons) */}
 {visibleColumns.actions && (
 <td className="py-2.5 px-3 text-right">
 <div className="flex items-center justify-end gap-1">
 {/* Edit Action */}
 <Tooltip title="Edit Record">
 <IconButton
 size="small"
 onClick={() => handleOpenEditModal(row)}
 sx={{
 color:'#3b82f6','&:hover': { backgroundColor:'#eff6ff' },
 padding:'5px'
 }}
 >
 <EditOutlinedIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </Tooltip>

 {/* Delete Action */}
 <Tooltip title="Delete Record">
 <IconButton
 size="small"
 onClick={() => handleOpenDeleteDialog(row)}
 sx={{
 color:'#f97316','&:hover': { backgroundColor:'#fff7ed' },
 padding:'5px'
 }}
 >
 <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </Tooltip>
 </div>
 </td>
 )}
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {/* 4. Pagination matching Luxuria bottom controls */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600 mt-2">
 {/* Items per page selector */}
 <div className="flex items-center gap-2">
 <span className="text-slate-500">Items per page:</span>
 <select
 value={rowsPerPage}
 onChange={(e) => {
 setRowsPerPage(Number(e.target.value));
 setPage(0);
 }}
 className="px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] bg-white text-slate-700 cursor-pointer font-medium"
 >
 <option value={5}>5</option>
 <option value={10}>10</option>
 <option value={25}>25</option>
 <option value={50}>50</option>
 </select>
 </div>

 {/* Range text & Navigation arrows */}
 <div className="flex items-center gap-4">
 <span className="text-slate-600 font-medium">
 {filteredRecords.length === 0
 ?'0 – 0 of 0'
 :`${page * rowsPerPage + 1} – ${Math.min(
 (page + 1) * rowsPerPage,
 filteredRecords.length
 )} of ${filteredRecords.length}`}
 </span>

 <div className="flex items-center gap-1">
 <IconButton
 size="small"
 disabled={page === 0}
 onClick={() => setPage((p) => Math.max(0, p - 1))}
 sx={{
 color:'#64748b','&.Mui-disabled': { color:'#cbd5e1' },
 padding:'4px'
 }}
 >
 <ChevronLeftIcon sx={{ fontSize: 20 }} />
 </IconButton>

 <IconButton
 size="small"
 disabled={(page + 1) * rowsPerPage >= filteredRecords.length}
 onClick={() => setPage((p) => p + 1)}
 sx={{
 color:'#64748b','&.Mui-disabled': { color:'#cbd5e1' },
 padding:'4px'
 }}
 >
 <ChevronRightIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </div>
 </div>
 </div>
 </div>

 {/* 5. Footer Copyright Note */}
 <div className="text-center text-xs text-slate-400 py-3">
 Copyright © 2026 Design By <span className="text-[#5d5fef] font-medium">Luxuria</span>
 </div>

 {/* Popover: Filter by Shift / Status */}
 <Popover
 open={Boolean(filterAnchorEl)}
 anchorEl={filterAnchorEl}
 onClose={() => setFilterAnchorEl(null)}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 transformOrigin={{ vertical:'top', horizontal:'right' }}
 PaperProps={{
 sx: {
 p: 2.5,
 width: 250,
 borderRadius:'12px',
 boxShadow:'0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
 }
 }}
 >
 <h4 className="text-sm font-bold text-slate-800 mb-3">Filter Attendance</h4>
 <div className="space-y-3 text-xs">
 <div>
 <label className="block text-slate-500 font-medium mb-1">Status</label>
 <select
 value={statusFilter}
 onChange={(e) => {
 setStatusFilter(e.target.value);
 setPage(0);
 }}
 className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] text-slate-700 bg-white"
 >
 <option value="All">All Statuses</option>
 <option value="present">Present</option>
 <option value="absent">Absent</option>
 </select>
 </div>

 <div>
 <label className="block text-slate-500 font-medium mb-1">Shift</label>
 <select
 value={shiftFilter}
 onChange={(e) => {
 setShiftFilter(e.target.value);
 setPage(0);
 }}
 className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:border-[#5d5fef] text-slate-700 bg-white"
 >
 <option value="All">All Shifts</option>
 <option value="Day Shift">Day Shift</option>
 <option value="Night Shift">Night Shift</option>
 </select>
 </div>

 <div className="pt-2 flex justify-end">
 <button
 onClick={() => {
 setStatusFilter('All');
 setShiftFilter('All');
 setFilterAnchorEl(null);
 }}
 className="text-xs text-[#5d5fef] hover:underline font-semibold"
 >
 Reset Filters
 </button>
 </div>
 </div>
 </Popover>

 {/* Popover: Show / Hide Columns */}
 <Popover
 open={Boolean(columnAnchorEl)}
 anchorEl={columnAnchorEl}
 onClose={() => setColumnAnchorEl(null)}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 transformOrigin={{ vertical:'top', horizontal:'right' }}
 PaperProps={{
 sx: {
 p: 2,
 width: 210,
 borderRadius:'12px',
 boxShadow:'0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
 }
 }}
 >
 <h4 className="text-sm font-bold text-slate-800 mb-2">Toggle Columns</h4>
 <div className="flex flex-col space-y-1">
 {Object.keys(visibleColumns).map((colKey) => (
 <FormControlLabel
 key={colKey}
 control={
 <Checkbox
 size="small"
 checked={visibleColumns[colKey]}
 onChange={(e) =>
 setVisibleColumns({
 ...visibleColumns,
 [colKey]: e.target.checked
 })
 }
 sx={{
 color:'#cbd5e1','&.Mui-checked': { color:'#5d5fef' },
 padding:'3px'
 }}
 />
 }
 label={
 <span className="text-xs text-slate-700 font-medium capitalize">
 {colKey ==='breakTime'
 ?'Break'
 : colKey.replace(/([A-Z])/g,' $1').trim()}
 </span>
 }
 />
 ))}
 </div>
 </Popover>

 {/* Dialog: Add Today's Attendance */}
 <Dialog
 open={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 maxWidth="sm"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 p: 1
 }
 }}
 >
 <div className="flex items-center justify-between p-4 border-b border-slate-100">
 <h3 className="text-lg font-bold text-slate-800">Add Today's Attendance</h3>
 <IconButton size="small" onClick={() => setIsAddModalOpen(false)}>
 <CloseIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </div>

 <DialogContent sx={{ p: 3 }}>
 <form onSubmit={handleSaveNewAttendance} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 Employee Name *
 </label>
 <TextField
 fullWidth
 size="small"
 placeholder="e.g. Alex Morgan"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 required
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">Shift *</label>
 <TextField
 select
 fullWidth
 size="small"
 value={formData.shift}
 onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
 >
 <MenuItem value="Day Shift">Day Shift</MenuItem>
 <MenuItem value="Night Shift">Night Shift</MenuItem>
 </TextField>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">Status *</label>
 <TextField
 select
 fullWidth
 size="small"
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
 >
 <MenuItem value="present">Present</MenuItem>
 <MenuItem value="absent">Absent</MenuItem>
 </TextField>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 First In (HH:MM)
 </label>
 <TextField
 fullWidth
 size="small"
 type="time"
 value={formData.firstIn}
 onChange={(e) => setFormData({ ...formData, firstIn: e.target.value })}
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 Break (HH:MM)
 </label>
 <TextField
 fullWidth
 size="small"
 type="time"
 value={formData.breakTime}
 onChange={(e) => setFormData({ ...formData, breakTime: e.target.value })}
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 Last Out (HH:MM)
 </label>
 <TextField
 fullWidth
 size="small"
 type="time"
 value={formData.lastOut}
 onChange={(e) => setFormData({ ...formData, lastOut: e.target.value })}
 />
 </div>
 </div>

 <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
 <button
 type="button"
 onClick={() => setIsAddModalOpen(false)}
 className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-5 py-2 rounded-lg bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
 >
 Save Attendance
 </button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* Dialog: Edit Attendance */}
 <Dialog
 open={isEditModalOpen}
 onClose={() => setIsEditModalOpen(false)}
 maxWidth="sm"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 p: 1
 }
 }}
 >
 <div className="flex items-center justify-between p-4 border-b border-slate-100">
 <h3 className="text-lg font-bold text-slate-800">Edit Today's Attendance</h3>
 <IconButton size="small" onClick={() => setIsEditModalOpen(false)}>
 <CloseIcon sx={{ fontSize: 20 }} />
 </IconButton>
 </div>

 <DialogContent sx={{ p: 3 }}>
 <form onSubmit={handleSaveEditAttendance} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 Employee Name *
 </label>
 <TextField
 fullWidth
 size="small"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 required
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">Shift *</label>
 <TextField
 select
 fullWidth
 size="small"
 value={formData.shift}
 onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
 >
 <MenuItem value="Day Shift">Day Shift</MenuItem>
 <MenuItem value="Night Shift">Night Shift</MenuItem>
 </TextField>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">Status *</label>
 <TextField
 select
 fullWidth
 size="small"
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
 >
 <MenuItem value="present">Present</MenuItem>
 <MenuItem value="absent">Absent</MenuItem>
 </TextField>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 First In (HH:MM)
 </label>
 <TextField
 fullWidth
 size="small"
 type="time"
 value={formData.firstIn}
 onChange={(e) => setFormData({ ...formData, firstIn: e.target.value })}
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 Break (HH:MM)
 </label>
 <TextField
 fullWidth
 size="small"
 type="time"
 value={formData.breakTime}
 onChange={(e) => setFormData({ ...formData, breakTime: e.target.value })}
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">
 Last Out (HH:MM)
 </label>
 <TextField
 fullWidth
 size="small"
 type="time"
 value={formData.lastOut}
 onChange={(e) => setFormData({ ...formData, lastOut: e.target.value })}
 />
 </div>
 </div>

 <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
 <button
 type="button"
 onClick={() => setIsEditModalOpen(false)}
 className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-5 py-2 rounded-lg bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
 >
 Update Attendance
 </button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* Dialog: Delete Confirmation */}
 <Dialog
 open={isDeleteDialogOpen}
 onClose={() => setIsDeleteDialogOpen(false)}
 maxWidth="xs"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 p: 2,
 textAlign:'center'
 }
 }}
 >
 <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
 <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
 </div>
 <h3 className="text-base font-bold text-slate-800 mb-1">Delete Attendance Record?</h3>
 <p className="text-xs text-slate-500 mb-5">
 Are you sure you want to delete attendance record for{''}
 <strong className="text-slate-700">{selectedRecord?.name}</strong>? This action cannot be
 undone.
 </p>

 <div className="flex items-center justify-center gap-3">
 <button
 onClick={() => setIsDeleteDialogOpen(false)}
 className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={handleConfirmDelete}
 className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
 >
 Delete
 </button>
 </div>
 </Dialog>

 {/* Global Snackbar Toast */}
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
