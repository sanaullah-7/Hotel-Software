import HomeOutlinedIcon from'@mui/icons-material/HomeOutlined';
import SearchIcon from'@mui/icons-material/Search';
import DeleteOutlinedIcon from'@mui/icons-material/DeleteOutlined';
import FilterListIcon from'@mui/icons-material/FilterList';
import AddIcon from'@mui/icons-material/Add';
import RefreshIcon from'@mui/icons-material/Refresh';
import TableChartIcon from'@mui/icons-material/TableChart';
import PictureAsPdfIcon from'@mui/icons-material/PictureAsPdf';
import CalendarTodayIcon from'@mui/icons-material/CalendarToday';
import EditIcon from'@mui/icons-material/Edit';
import ChevronLeftIcon from'@mui/icons-material/ChevronLeft';
import ChevronRightIcon from'@mui/icons-material/ChevronRight';
import PersonOutlinedIcon from'@mui/icons-material/PersonOutlined';
import CloseIcon from'@mui/icons-material/Close';
import AssignmentOutlinedIcon from'@mui/icons-material/AssignmentOutlined';
import PendingActionsOutlinedIcon from'@mui/icons-material/PendingActionsOutlined';
import CheckCircleOutlinedIcon from'@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from'@mui/icons-material/CancelOutlined';
import GroupOutlinedIcon from'@mui/icons-material/GroupOutlined';
import DateRangeIcon from'@mui/icons-material/DateRange';
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
 Alert,
 InputAdornment
} from'@mui/material';
import MetricCards from '../components/MetricCards';
import '../../../features/assigned-ui/formStyles.css';
import '../../../features/assigned-ui/toolbarStyles.css';

// Icons

// Rich mock data matching Luxuria template
const initialLeaveRequests = [
 {
 id: 1,
 empId:'EMP001',
 name:'John Deo',
 avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
 department:'HR',
 designation:'HR Executive',
 leaveType:'Special Leave',
 status:'Approved',
 from:'04/10/2026',
 to:'02/25/2026',
 days: 5,
 approvedBy:'John Deo',
 reason:'Family event and personal work.'
 },
 {
 id: 2,
 empId:'EMP002',
 name:'Jane Smith',
 avatar:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
 department:'Finance',
 designation:'Accountant',
 leaveType:'Personal Leave',
 status:'Pending',
 from:'01/15/2026',
 to:'01/20/2026',
 days: 5,
 approvedBy:'-',
 reason:'Urgent home renovation requirements.'
 },
 {
 id: 3,
 empId:'EMP003',
 name:'Michael Brown',
 avatar:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
 department:'House Keeping',
 designation:'Supervisor',
 leaveType:'Sick Leave',
 status:'Approved',
 from:'03/01/2026',
 to:'03/03/2026',
 days: 2,
 approvedBy:'Linda Johnson',
 reason:'Seasonal viral flu and doctor advice.'
 },
 {
 id: 4,
 empId:'EMP004',
 name:'Emily Davis',
 avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
 department:'Marketing',
 designation:'Marketing Lead',
 leaveType:'Annual Leave',
 status:'Approved',
 from:'06/10/2026',
 to:'06/24/2026',
 days: 14,
 approvedBy:'John Deo',
 reason:'Annual vacation trip with family.'
 },
 {
 id: 5,
 empId:'EMP005',
 name:'Robert Wilson',
 avatar:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
 department:'Sales',
 designation:'Sales Executive',
 leaveType:'Medical Leave',
 status:'Rejected',
 from:'07/05/2026',
 to:'07/10/2026',
 days: 5,
 approvedBy:'Sarah Lee',
 reason:'Medical checkup appointment.'
 },
 {
 id: 6,
 empId:'EMP006',
 name:'Linda Johnson',
 avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
 department:'HR',
 designation:'HR Specialist',
 leaveType:'Personal Leave',
 status:'Approved',
 from:'08/01/2026',
 to:'08/07/2026',
 days: 6,
 approvedBy:'John Deo',
 reason:'Personal affairs.'
 },
 {
 id: 7,
 empId:'EMP007',
 name:'Sarah Lee',
 avatar:'https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&auto=format&fit=crop&q=80',
 department:'House Keeping',
 designation:'Room Attendant',
 leaveType:'Sick Leave',
 status:'Approved',
 from:'09/01/2026',
 to:'09/02/2026',
 days: 1,
 approvedBy:'John Deo',
 reason:'Migraine and health recovery.'
 },
 {
 id: 8,
 empId:'EMP008',
 name:'David Miller',
 avatar:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
 department:'Finance',
 designation:'Accountant',
 leaveType:'Annual Leave',
 status:'Pending',
 from:'10/01/2026',
 to:'10/15/2026',
 days: 14,
 approvedBy:'-',
 reason:'Festival and holiday leave.'
 },
 {
 id: 9,
 empId:'EMP009',
 name:'Jessica Taylor',
 avatar:'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
 department:'Marketing',
 designation:'Content Creator',
 leaveType:'Medical Leave',
 status:'Approved',
 from:'11/01/2026',
 to:'11/05/2026',
 days: 4,
 approvedBy:'Sarah Lee',
 reason:'Minor surgery recovery.'
 },
 {
 id: 10,
 empId:'EMP010',
 name:'James Anderson',
 avatar:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
 department:'Sales',
 designation:'Sales Representative',
 leaveType:'Personal Leave',
 status:'Approved',
 from:'12/01/2026',
 to:'12/10/2026',
 days: 9,
 approvedBy:'John Deo',
 reason:'Sibling wedding ceremonies.'
 },
 {
 id: 11,
 empId:'EMP011',
 name:'Emma White',
 avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
 department:'Kitchen',
 designation:'Sous Chef',
 leaveType:'Casual Leave',
 status:'Pending',
 from:'12/15/2026',
 to:'12/18/2026',
 days: 3,
 approvedBy:'-',
 reason:'Family gathering.'
 },
 {
 id: 12,
 empId:'EMP012',
 name:'Daniel Clark',
 avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
 department:'Front Office',
 designation:'Receptionist',
 leaveType:'Sick Leave',
 status:'Approved',
 from:'12/20/2026',
 to:'12/22/2026',
 days: 2,
 approvedBy:'Linda Johnson',
 reason:'Dental emergency procedure.'
 }
];

// Styled form field sx for the modal dialog
const modalInputStyle = {'& .MuiOutlinedInput-root': {
 height:'46px',
 borderRadius:'7px',
 backgroundColor:'#ffffff',
 fontSize:'14px',
 color:'#1e293b','& fieldset': {
 borderColor:'#e2e8f0',
 borderWidth:'1.2px',
 },'&:hover fieldset': {
 borderColor:'#cbd5e1',
 },'&.Mui-focused fieldset': {
 borderColor:'#5d5fef',
 borderWidth:'1.5px',
 },'&.Mui-focused': {
 boxShadow:'0 0 0 3px rgba(93, 95, 239, 0.12)',
 },
 },'& .MuiInputLabel-root': {
 fontSize:'13.5px',
 color:'#64748b','&.Mui-focused': {
 color:'#5d5fef',
 fontWeight: 500,
 },
 },'& .MuiInputLabel-shrink': {
 transform:'translate(14px, -9px) scale(0.85)',
 backgroundColor:'#ffffff',
 padding:'0 4px',
 },
};

export default function LeaveRequests() {
 const [data, setData] = useState(initialLeaveRequests);
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedIds, setSelectedIds] = useState([]);

 // Pagination states
 const [page, setPage] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(10);

 // Column visibility
 const [filterAnchorEl, setFilterAnchorEl] = useState(null);
 const [visibleColumns, setVisibleColumns] = useState({
 select: true,
 id: false,
 empId: false,
 name: true,
 department: true,
 designation: false,
 leaveType: true,
 status: true,
 from: true,
 to: true,
 days: true,
 approvedBy: true,
 reason: false,
 actions: true
 });

 // Modal Dialog state (Add / Edit)
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingItem, setEditingItem] = useState(null);
 const [modalForm, setModalForm] = useState({
 name:'',
 department:'HR',
 leaveType:'Special Leave',
 status:'Pending',
 from: new Date().toISOString().split('T')[0],
 to: new Date().toISOString().split('T')[0],
 days: 1,
 approvedBy:'',
 reason:''
 });

 // Toast notification
 const [snackbar, setSnackbar] = useState({ open: false, message:'', severity:'success' });

 // Handle Search & Filtering
 const filteredData = useMemo(() => {
 return data.filter(item => {
 const matchSearch =
 item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
 item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (item.approvedBy && item.approvedBy.toLowerCase().includes(searchTerm.toLowerCase()));
 return matchSearch;
 });
 }, [data, searchTerm]);

 // Paginated Data
 const paginatedData = useMemo(() => {
 const startIndex = page * rowsPerPage;
 return filteredData.slice(startIndex, startIndex + rowsPerPage);
 }, [filteredData, page, rowsPerPage]);

 // Select all handler
 const handleSelectAll = (e) => {
 if (e.target.checked) {
 setSelectedIds(filteredData.map(d => d.id));
 } else {
 setSelectedIds([]);
 }
 };

 const handleSelectRow = (id) => {
 setSelectedIds(prev =>
 prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
 );
 };

 // Bulk Delete
 const handleBulkDelete = () => {
 setData(prev => prev.filter(item => !selectedIds.includes(item.id)));
 setSelectedIds([]);
 setSnackbar({ open: true, message:'Selected leave requests removed', severity:'info' });
 };

 // Single Delete
 const handleDeleteRow = (id) => {
 setData(prev => prev.filter(item => item.id !== id));
 setSelectedIds(prev => prev.filter(item => item !== id));
 setSnackbar({ open: true, message:'Leave request deleted successfully', severity:'info' });
 };

 // Refresh
 const handleRefresh = () => {
 setData(initialLeaveRequests);
 setSelectedIds([]);
 setSearchTerm('');
 setPage(0);
 setSnackbar({ open: true, message:'Data refreshed successfully', severity:'success' });
 };

 // Export PDF
 const handleExportPdf = async () => {
 try {
 const { default: jsPDF } = await import('jspdf');
 const { default: autoTable } = await import('jspdf-autotable');
 const doc = new jsPDF();
 
 const tableHeaders = [['Name','Department','Leave Type','Status','From','To','Days','Approved By']];
 const tableData = filteredData.map(row => [
 row.name,
 row.department,
 row.leaveType,
 row.status,
 row.from,
 row.to,
 row.days,
 row.approvedBy
 ]);

 doc.setFontSize(16);
 doc.text('Hotel Management - Leave Requests Report', 14, 15);
 doc.setFontSize(10);
 doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

 autoTable(doc, {
 head: tableHeaders,
 body: tableData,
 startY: 28,
 theme:'grid',
 headStyles: { fillColor: [93, 95, 239], textColor: [255, 255, 255] }
 });

 doc.save('Leave_Requests.pdf');
 setSnackbar({ open: true, message:'PDF exported successfully', severity:'success' });
 } catch (err) {
 setSnackbar({ open: true, message:'Failed to export PDF', severity:'error' });
 }
 };

 // Export Excel
 const handleExportExcel = async () => {
 try {
 const XLSX = await import('xlsx');
 const exportRows = filteredData.map(row => ({'Employee ID': row.empId,'Name': row.name,'Department': row.department,'Leave Type': row.leaveType,'Status': row.status,'From Date': row.from,'To Date': row.to,'No of Days': row.days,'Approved By': row.approvedBy,'Reason': row.reason
 }));

 const worksheet = XLSX.utils.json_to_sheet(exportRows);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,'LeaveRequests');
 XLSX.writeFile(workbook,'Leave_Requests.xlsx');
 setSnackbar({ open: true, message:'Excel file exported successfully', severity:'success' });
 } catch (err) {
 setSnackbar({ open: true, message:'Failed to export Excel', severity:'error' });
 }
 };

 // Modal Open for Add
 const handleOpenAddModal = () => {
 setEditingItem(null);
 setModalForm({
 name:'',
 department:'HR',
 leaveType:'Special Leave',
 status:'Pending',
 from: new Date().toISOString().split('T')[0],
 to: new Date().toISOString().split('T')[0],
 days: 1,
 approvedBy:'',
 reason:''
 });
 setIsModalOpen(true);
 };

 // Modal Open for Edit
 const handleOpenEditModal = (item) => {
 setEditingItem(item);
 setModalForm({
 name: item.name,
 department: item.department,
 leaveType: item.leaveType,
 status: item.status,
 from: item.from,
 to: item.to,
 days: item.days,
 approvedBy: item.approvedBy ==='-' ?'' : item.approvedBy,
 reason: item.reason ||''
 });
 setIsModalOpen(true);
 };

 // Modal Save
 const handleSaveModal = (e) => {
 e.preventDefault();
 if (!modalForm.name.trim()) {
 setSnackbar({ open: true, message:'Employee Name is required', severity:'error' });
 return;
 }

 if (editingItem) {
 setData(prev =>
 prev.map(item =>
 item.id === editingItem.id
 ? {
 ...item,
 ...modalForm,
 approvedBy: modalForm.status ==='Approved' ? (modalForm.approvedBy ||'Admin') :'-'
 }
 : item
 )
 );
 setSnackbar({ open: true, message:'Leave request updated successfully', severity:'success' });
 } else {
 const newItem = {
 id: Date.now(),
 empId:`EMP${Math.floor(100 + Math.random() * 900)}`,
 name: modalForm.name,
 avatar:`https://api.dicebear.com/7.x/avataaars/svg?seed=${modalForm.name}`,
 department: modalForm.department,
 designation:'Staff',
 leaveType: modalForm.leaveType,
 status: modalForm.status,
 from: modalForm.from,
 to: modalForm.to,
 days: modalForm.days || 1,
 approvedBy: modalForm.status ==='Approved' ? (modalForm.approvedBy ||'Admin') :'-',
 reason: modalForm.reason
 };
 setData(prev => [newItem, ...prev]);
 setSnackbar({ open: true, message:'New leave request created!', severity:'success' });
 }

 setIsModalOpen(false);
 };

 // Toggle column
 const toggleColumn = (col) => {
 setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
 };

 // Dynamic Leave Management Summary Statistics
 const leaveStats = useMemo(() => {
 const list = Array.isArray(data) ? data : [];
 const totalRequests = list.length;
 const pendingRequests = list.filter(item => (item.status ||'').toLowerCase() ==='pending').length;
 const approvedRequests = list.filter(item => (item.status ||'').toLowerCase() ==='approved').length;
 const rejectedRequests = list.filter(item => (item.status ||'').toLowerCase() ==='rejected').length;
 
 // Unique employees with approved leave
 const employeesOnLeave = new Set(
 list
 .filter(item => (item.status ||'').toLowerCase() ==='approved')
 .map(item => item.empId || item.name)
 .filter(Boolean)
 ).size;

 // Total days requested / recorded
 const totalLeaveDays = list.reduce((sum, item) => sum + (Number(item.days) || 0), 0);

 return [
 {
 id:'total-requests',
 title:'Total Requests',
 value: totalRequests,
 subtext:'All records',
 icon: AssignmentOutlinedIcon,
 iconBg:'bg-[var(--primary-main)]/10',
 iconColor:'text-[var(--primary-main)]'
 },
 {
 id:'pending-requests',
 title:'Pending Requests',
 value: pendingRequests,
 subtext:'Needs review',
 icon: PendingActionsOutlinedIcon,
 iconBg:'bg-amber-50',
 iconColor:'text-amber-600'
 },
 {
 id:'approved-requests',
 title:'Approved Requests',
 value: approvedRequests,
 subtext:'Granted',
 icon: CheckCircleOutlinedIcon,
 iconBg:'bg-emerald-50',
 iconColor:'text-emerald-600'
 },
 {
 id:'rejected-requests',
 title:'Rejected Requests',
 value: rejectedRequests,
 subtext:'Declined',
 icon: CancelOutlinedIcon,
 iconBg:'bg-rose-50',
 iconColor:'text-rose-600'
 },
 {
 id:'employees-on-leave',
 title:'Employees on Leave',
 value: employeesOnLeave,
 subtext:'Active staff',
 icon: GroupOutlinedIcon,
 iconBg:'bg-blue-50',
 iconColor:'text-blue-600'
 },
 {
 id:'total-leave-days',
 title:'Total Leave Days',
 value: totalLeaveDays,
 subtext:'Days total',
 icon: DateRangeIcon,
 iconBg:'bg-indigo-50',
 iconColor:'text-indigo-600'
 }
 ];
 }, [data]);

 return (
 <div className="assigned-form-surface p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden bg-[#f8fafc] flex flex-col gap-1">
 <MetricCards cards={leaveStats} compactSubtext />

 {/* 2. Main White Table Card Container */}
 <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.03)] p-2 sm:p-2.5">

 {/* Toolbar Header (Title + Search + Actions) */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-gray-100">
 
 {/* Left: Table Title & Search input */}
 <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
 <h2 className="text-[17px] font-bold text-gray-800 shrink-0">Leave Requests</h2>
 
 <div className="relative w-full sm:w-64">
 <input
 type="text"
 placeholder="Search..."
 value={searchTerm}
 onChange={(e) => {
 setSearchTerm(e.target.value);
 setPage(0);
 }}
 className="w-full h-9 pl-3.5 pr-9 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#5d5fef] focus:ring-2 focus:ring-[#5d5fef]/15 transition-all"
 />
 <SearchIcon
 sx={{ fontSize: 18, color:'#94a3b8' }}
 className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
 />
 </div>
 </div>

 {/* Right Toolbar Action Icons */}
 <div className="assigned-table-toolbar flex items-center gap-1.5 sm:gap-2 self-end md:self-auto">
 {/* Bulk Delete Button if rows selected */}
 {selectedIds.length > 0 && (
 <Tooltip title={`Delete ${selectedIds.length} Selected`}>
 <IconButton
 size="small"
 onClick={handleBulkDelete}
 className="!bg-red-50 !text-red-600 hover:!bg-red-100"
 sx={{ width: 34, height: 34, borderRadius:'8px' }}
 >
 <DeleteOutlinedIcon fontSize='small' />
 </IconButton>
 </Tooltip>
 )}

 {/* Show/Hide Column Filter Button */}
 <Tooltip title="Show/Hide Column">
 <IconButton
 size="small"
 onClick={(e) => setFilterAnchorEl(e.currentTarget)}
 sx={{
 width: 34,
 height: 34,
 borderRadius:'8px',
 backgroundColor:'#22c55e',
 color:'#22c55e','&:hover': { backgroundColor:'#e2e8f0' }
 }}
 >
 <FilterListIcon fontSize="small" />
 </IconButton>
 </Tooltip>

 {/* Add Leave Request Button */}
 <Tooltip title="Add Leave Request">
 <IconButton
 size="small"
 onClick={handleOpenAddModal}
 sx={{
 width: 34,
 height: 34,
 borderRadius:'8px',
 backgroundColor:'#22c55e',
 color:'#10b981','&:hover': { backgroundColor:'#16a34a' }
 }}
 >
 <AddIcon fontSize="small" />
 </IconButton>
 </Tooltip>

 {/* Refresh Button */}
 <Tooltip title="Refresh">
 <IconButton
 size="small"
 onClick={handleRefresh}
 sx={{
 width: 34,
 height: 34,
 borderRadius:'8px',
 backgroundColor:'#475569',
 color:'#475569','&:hover': { backgroundColor:'#e2e8f0' }
 }}
 >
 <RefreshIcon fontSize="small" />
 </IconButton>
 </Tooltip>

 {/* Export Excel Button */}
 <Tooltip title="Export to Excel">
 <IconButton
 className="toolbar-export-icon"
 size="small"
 onClick={handleExportExcel}
 sx={{
 width: 34,
 height: 34,
 borderRadius:'8px',
 backgroundColor:'#0284c7',
 color:'#3b82f6','&:hover': { backgroundColor:'#0369a1' }
 }}
 >
 <TableChartIcon fontSize="small" />
 </IconButton>
 </Tooltip>

 {/* Export PDF Button */}
 <Tooltip title="Export to PDF">
 <IconButton
 className="toolbar-export-icon"
 size="small"
 onClick={handleExportPdf}
 sx={{
 width: 34,
 height: 34,
 borderRadius:'8px',
 backgroundColor:'#ef4444',
 color:'#ef4444','&:hover': { backgroundColor:'#dc2626' }
 }}
 >
 <PictureAsPdfIcon fontSize="small" />
 </IconButton>
 </Tooltip>
 </div>
 </div>

 {/* 3. Leave Requests Table */}
 <div className="w-full mt-2">
 <table className="w-full text-left border-collapse min-w-[860px]">
 <thead>
 <tr className="border-b border-gray-100 text-xs font-bold text-gray-700 tracking-wider">
 {visibleColumns.select && (
 <th className="py-3 px-2.5 w-10">
 <Checkbox
 size="small"
 checked={
 paginatedData.length > 0 &&
 paginatedData.every(row => selectedIds.includes(row.id))
 }
 indeterminate={
 selectedIds.length > 0 &&
 !paginatedData.every(row => selectedIds.includes(row.id))
 }
 onChange={handleSelectAll}
 sx={{
 color:'#cbd5e1','&.Mui-checked': { color:'#5d5fef' },'&.MuiCheckbox-indeterminate': { color:'#5d5fef' }
 }}
 />
 </th>
 )}
 {visibleColumns.id && <th className="py-3 px-3">ID</th>}
 {visibleColumns.empId && <th className="py-3 px-3">Emp ID</th>}
 {visibleColumns.name && <th className="py-3 px-3">Name</th>}
 {visibleColumns.department && <th className="py-3 px-3">Department</th>}
 {visibleColumns.designation && <th className="py-3 px-3">Designation</th>}
 {visibleColumns.leaveType && <th className="py-3 px-3">Leave Type</th>}
 {visibleColumns.status && <th className="py-3 px-3">Status</th>}
 {visibleColumns.from && <th className="py-3 px-3">From</th>}
 {visibleColumns.to && <th className="py-3 px-3">To</th>}
 {visibleColumns.days && <th className="py-3 px-3">No of Days</th>}
 {visibleColumns.approvedBy && <th className="py-3 px-3">Approved By</th>}
 {visibleColumns.reason && <th className="py-3 px-3">Reason</th>}
 {visibleColumns.actions && <th className="py-3 px-3 text-right pr-4">Actions</th>}
 </tr>
 </thead>

 <tbody className="divide-y divide-gray-50 text-sm">
 {paginatedData.length === 0 ? (
 <tr>
 <td colSpan={12} className="py-10 text-center text-gray-400 font-medium">
 No leave requests found matching your search.
 </td>
 </tr>
 ) : (
 paginatedData.map((row) => {
 const isSelected = selectedIds.includes(row.id);
 return (
 <tr
 key={row.id}
 className={`hover:bg-slate-50/70 transition-colors ${
 isSelected ?'bg-indigo-50/40' :''
 }`}
 >
 {/* Select Checkbox */}
 {visibleColumns.select && (
 <td className="py-2.5 px-2.5">
 <Checkbox
 size="small"
 checked={isSelected}
 onChange={() => handleSelectRow(row.id)}
 sx={{
 color:'#cbd5e1','&.Mui-checked': { color:'#5d5fef' }
 }}
 />
 </td>
 )}

 {/* Optional ID */}
 {visibleColumns.id && (
 <td className="py-2.5 px-3 text-gray-500 font-medium text-xs">#{row.id}</td>
 )}

 {/* Optional Emp ID */}
 {visibleColumns.empId && (
 <td className="py-2.5 px-3 text-gray-600 font-medium text-xs">{row.empId}</td>
 )}

 {/* Employee Avatar & Name */}
 {visibleColumns.name && (
 <td className="py-2.5 px-3">
 <div className="flex items-center gap-2.5">
 <img
 src={row.avatar}
 alt={row.name}
 className="w-8 h-8 rounded-full object-cover border border-gray-100 shrink-0"
 />
 <span className="font-semibold text-gray-800 text-[13.5px]">
 {row.name}
 </span>
 </div>
 </td>
 )}

 {/* Department */}
 {visibleColumns.department && (
 <td className="py-2.5 px-3 text-gray-600 text-[13.5px]">
 {row.department}
 </td>
 )}

 {/* Optional Designation */}
 {visibleColumns.designation && (
 <td className="py-2.5 px-3 text-gray-500 text-xs">
 {row.designation}
 </td>
 )}

 {/* Leave Type */}
 {visibleColumns.leaveType && (
 <td className="py-2.5 px-3 text-gray-700 font-medium text-[13.5px]">
 {row.leaveType}
 </td>
 )}

 {/* Status Badge */}
 {visibleColumns.status && (
 <td className="py-2.5 px-3">
 <span
 className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide ${
 row.status ==='Approved'
 ?'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
 : row.status ==='Pending'
 ?'bg-amber-50 text-amber-700 border border-amber-200/60'
 :'bg-rose-50 text-rose-700 border border-rose-200/60'
 }`}
 >
 {row.status}
 </span>
 </td>
 )}

 {/* From Date */}
 {visibleColumns.from && (
 <td className="py-2.5 px-3 text-gray-600 text-[13px]">
 <div className="flex items-center gap-1.5">
 <CalendarTodayIcon sx={{ fontSize: 14, color:'#1e293b' }} />
 <span>{row.from}</span>
 </div>
 </td>
 )}

 {/* To Date */}
 {visibleColumns.to && (
 <td className="py-2.5 px-3 text-gray-600 text-[13px]">
 <div className="flex items-center gap-1.5">
 <CalendarTodayIcon sx={{ fontSize: 14, color:'#1e293b' }} />
 <span>{row.to}</span>
 </div>
 </td>
 )}

 {/* Days */}
 {visibleColumns.days && (
 <td className="py-2.5 px-3 text-gray-700 font-semibold text-[13.5px]">
 {row.days}
 </td>
 )}

 {/* Approved By */}
 {visibleColumns.approvedBy && (
 <td className="py-2.5 px-3 text-gray-600 text-[13px]">
 {row.approvedBy ||'-'}
 </td>
 )}

 {/* Optional Reason */}
 {visibleColumns.reason && (
 <td className="py-2.5 px-3 text-gray-500 text-xs max-w-xs truncate">
 {row.reason ||'-'}
 </td>
 )}

 {/* Actions */}
 {visibleColumns.actions && (
 <td className="py-2.5 px-3 text-right pr-4">
 <div className="flex items-center justify-end gap-1">
 <Tooltip title="Edit">
 <IconButton
 size="small"
 onClick={() => handleOpenEditModal(row)}
 sx={{
 color:'#3b82f6','&:hover': { backgroundColor:'#eff6ff' }
 }}
 >
 <EditIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </Tooltip>
 <Tooltip title="Delete">
 <IconButton
 size="small"
 onClick={() => handleDeleteRow(row.id)}
 sx={{
 color:'#ef4444','&:hover': { backgroundColor:'#fef2f2' }
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

 {/* 4. Table Pagination Footer */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-gray-100 text-xs text-gray-500">
 <div className="flex items-center gap-2">
 <span>Items per page:</span>
 <select
 value={rowsPerPage}
 onChange={(e) => {
 setRowsPerPage(Number(e.target.value));
 setPage(0);
 }}
 className="h-8 px-2 bg-white border border-gray-200 rounded text-xs text-gray-700 focus:outline-none focus:border-[#5d5fef]"
 >
 <option value={5}>5</option>
 <option value={10}>10</option>
 <option value={25}>25</option>
 <option value={50}>50</option>
 </select>
 </div>

 <div className="flex items-center gap-3">
 <span>
 {filteredData.length === 0
 ?'0 – 0 of 0'
 :`${page * rowsPerPage + 1} – ${Math.min(
 (page + 1) * rowsPerPage,
 filteredData.length
 )} of ${filteredData.length}`}
 </span>

 <div className="flex items-center gap-1">
 <IconButton
 size="small"
 disabled={page === 0}
 onClick={() => setPage(p => p - 1)}
 sx={{ borderRadius:'6px' }}
 >
 <ChevronLeftIcon sx={{ fontSize: 18 }} />
 </IconButton>
 <IconButton
 size="small"
 disabled={(page + 1) * rowsPerPage >= filteredData.length}
 onClick={() => setPage(p => p + 1)}
 sx={{ borderRadius:'6px' }}
 >
 <ChevronRightIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </div>
 </div>
 </div>
 </div>

 {/* 5. Show/Hide Column Popover Menu */}
 <Popover
 open={Boolean(filterAnchorEl)}
 anchorEl={filterAnchorEl}
 onClose={() => setFilterAnchorEl(null)}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 transformOrigin={{ vertical:'top', horizontal:'right' }}
 PaperProps={{
 sx: {
 p: 2,
 width: 210,
 borderRadius:'12px',
 boxShadow:'0 4px 20px rgba(0,0,0,0.1)'
 }
 }}
 >
 <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider pb-2 mb-2 border-b border-gray-100">
 Show/Hide Column
 </h4>
 <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto pr-1">
 {[
 { key:'select', label:'Select' },
 { key:'id', label:'ID' },
 { key:'empId', label:'Emp ID' },
 { key:'name', label:'Name' },
 { key:'department', label:'Department' },
 { key:'designation', label:'Designation' },
 { key:'leaveType', label:'Leave Type' },
 { key:'status', label:'Status' },
 { key:'from', label:'From' },
 { key:'to', label:'To' },
 { key:'days', label:'No of Days' },
 { key:'approvedBy', label:'Approved By' },
 { key:'reason', label:'Reason' }
 ].map(col => (
 <FormControlLabel
 key={col.key}
 control={
 <Checkbox
 size="small"
 checked={visibleColumns[col.key]}
 onChange={() => toggleColumn(col.key)}
 sx={{
 p: 0.5,
 color:'#cbd5e1','&.Mui-checked': { color:'#5d5fef' }
 }}
 />
 }
 label={<span className="text-xs font-medium text-gray-700">{col.label}</span>}
 sx={{ m: 0 }}
 />
 ))}
 </div>
 </Popover>

 {/* 6."New Leave Request" / Edit Modal Dialog */}
 <Dialog
 className="assigned-form-surface"
 open={isModalOpen}
 onClose={() => setIsModalOpen(false)}
 maxWidth="md"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 overflow:'hidden'
 }
 }}
 >
 {/* Modal Header Banner */}
 <div className="assigned-modal-header px-5 py-3.5 flex items-center justify-between text-white">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
 <PersonOutlinedIcon sx={{ fontSize: 22, color:'#ffffff' }} />
 </div>
 <h3 className="text-base font-bold tracking-tight">
 {editingItem ?'Edit Leave Request' :'New Leave Request'}
 </h3>
 </div>
 <IconButton
 size="small"
 onClick={() => setIsModalOpen(false)}
 sx={{
 color:'#ffffff',
 backgroundColor:'rgba(255,255,255,0.15)','&:hover': { backgroundColor:'rgba(255,255,255,0.25)' }
 }}
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </div>

 {/* Modal Body Form */}
 <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
 <form onSubmit={handleSaveModal} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Employee Name */}
 <div>
 <TextField
 fullWidth
 label="Employee Name*"
 placeholder="Enter employee name"
 value={modalForm.name}
 onChange={(e) => setModalForm(prev => ({ ...prev, name: e.target.value }))}
 required
 sx={modalInputStyle}
 />
 </div>

 {/* Department */}
 <div>
 <TextField
 fullWidth
 select
 label="Department*"
 value={modalForm.department}
 onChange={(e) => setModalForm(prev => ({ ...prev, department: e.target.value }))}
 sx={modalInputStyle}
 >
 <MenuItem value="HR">HR</MenuItem>
 <MenuItem value="Finance">Finance</MenuItem>
 <MenuItem value="House Keeping">House Keeping</MenuItem>
 <MenuItem value="Marketing">Marketing</MenuItem>
 <MenuItem value="Sales">Sales</MenuItem>
 <MenuItem value="Kitchen">Kitchen</MenuItem>
 <MenuItem value="Front Office">Front Office</MenuItem>
 <MenuItem value="Management">Management</MenuItem>
 </TextField>
 </div>

 {/* Leave Type */}
 <div>
 <TextField
 fullWidth
 select
 label="Leave Type*"
 value={modalForm.leaveType}
 onChange={(e) => setModalForm(prev => ({ ...prev, leaveType: e.target.value }))}
 sx={modalInputStyle}
 >
 <MenuItem value="Special Leave">Special Leave</MenuItem>
 <MenuItem value="Personal Leave">Personal Leave</MenuItem>
 <MenuItem value="Sick Leave">Sick Leave</MenuItem>
 <MenuItem value="Annual Leave">Annual Leave</MenuItem>
 <MenuItem value="Medical Leave">Medical Leave</MenuItem>
 <MenuItem value="Casual Leave">Casual Leave</MenuItem>
 <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
 </TextField>
 </div>

 {/* Status */}
 <div>
 <TextField
 fullWidth
 select
 label="Status*"
 value={modalForm.status}
 onChange={(e) => setModalForm(prev => ({ ...prev, status: e.target.value }))}
 sx={modalInputStyle}
 >
 <MenuItem value="Pending">Pending</MenuItem>
 <MenuItem value="Approved">Approved</MenuItem>
 <MenuItem value="Rejected">Rejected</MenuItem>
 </TextField>
 </div>

 {/* Start Date */}
 <div>
 <TextField
 fullWidth
 label="Start Date*"
 type="date"
 value={modalForm.from}
 onChange={(e) => setModalForm(prev => ({ ...prev, from: e.target.value }))}
 InputLabelProps={{ shrink: true }}
 InputProps={{
 endAdornment: (
 <InputAdornment position="end">
 <CalendarTodayIcon sx={{ color:'#1e293b', fontSize: 18 }} />
 </InputAdornment>
 ),
 }}
 sx={{
 ...modalInputStyle,'& input::-webkit-calendar-picker-indicator': {
 opacity: 0,
 position:'absolute',
 right: 0,
 top: 0,
 width:'100%',
 height:'100%',
 cursor:'pointer'
 }
 }}
 />
 </div>

 {/* End Date */}
 <div>
 <TextField
 fullWidth
 label="End Date*"
 type="date"
 value={modalForm.to}
 onChange={(e) => setModalForm(prev => ({ ...prev, to: e.target.value }))}
 InputLabelProps={{ shrink: true }}
 InputProps={{
 endAdornment: (
 <InputAdornment position="end">
 <CalendarTodayIcon sx={{ color:'#1e293b', fontSize: 18 }} />
 </InputAdornment>
 ),
 }}
 sx={{
 ...modalInputStyle,'& input::-webkit-calendar-picker-indicator': {
 opacity: 0,
 position:'absolute',
 right: 0,
 top: 0,
 width:'100%',
 height:'100%',
 cursor:'pointer'
 }
 }}
 />
 </div>

 {/* No of days */}
 <div>
 <TextField
 fullWidth
 label="No of days*"
 type="number"
 value={modalForm.days}
 onChange={(e) => setModalForm(prev => ({ ...prev, days: Number(e.target.value) }))}
 sx={modalInputStyle}
 />
 </div>

 {/* Approved By */}
 <div>
 <TextField
 fullWidth
 label="Approved By"
 placeholder="Approver name"
 value={modalForm.approvedBy}
 onChange={(e) => setModalForm(prev => ({ ...prev, approvedBy: e.target.value }))}
 sx={modalInputStyle}
 />
 </div>
 </div>

 {/* Reason */}
 <div>
 <TextField
 fullWidth
 multiline
 rows={3}
 label="Reason*"
 placeholder="Specify the reason for leave..."
 value={modalForm.reason}
 onChange={(e) => setModalForm(prev => ({ ...prev, reason: e.target.value }))}
 required
 sx={{
 ...modalInputStyle,'& .MuiOutlinedInput-root': {
 borderRadius:'7px',
 backgroundColor:'#ffffff',
 fontSize:'14px',
 color:'#1e293b',
 padding:'10px 12px','& fieldset': { borderColor:'#e2e8f0' },'&:hover fieldset': { borderColor:'#cbd5e1' },'&.Mui-focused fieldset': { borderColor:'#5d5fef' }
 }
 }}
 />
 </div>

 {/* Modal Actions */}
 <div className="flex items-center gap-3 pt-3">
 <button
 type="submit"
 className="assigned-primary-button px-6 py-2 text-sm font-medium rounded-full shadow-sm transition-all cursor-pointer"
 >
 Save
 </button>
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="assigned-secondary-button px-6 py-2 text-sm font-medium rounded-full transition-all cursor-pointer"
 >
 Cancel
 </button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* 7. Snackbar Toast Feedback */}
 <Snackbar
 open={snackbar.open}
 autoHideDuration={3000}
 onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 >
 <Alert
 onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
 severity={snackbar.severity}
 variant="filled"
 sx={{ width:'100%', borderRadius:'10px' }}
 >
 {snackbar.message}
 </Alert>
 </Snackbar>
 </div>
 );
}
