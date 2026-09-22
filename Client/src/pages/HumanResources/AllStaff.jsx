import PhoneOutlinedIcon from'@mui/icons-material/PhoneOutlined';
import MailOutlinedIcon from'@mui/icons-material/MailOutlined';
import CalendarTodayOutlinedIcon from'@mui/icons-material/CalendarTodayOutlined';
import LocationOnOutlinedIcon from'@mui/icons-material/LocationOnOutlined';
import EditIcon from'@mui/icons-material/Edit';
import SearchIcon from'@mui/icons-material/Search';
import DeleteOutlineIcon from'@mui/icons-material/DeleteOutlined';
import FilterListIcon from'@mui/icons-material/FilterList';
import AddCircleOutlineIcon from'@mui/icons-material/AddCircleOutlined';
import RefreshIcon from'@mui/icons-material/Refresh';
import CalculateIcon from'@mui/icons-material/Calculate';
import PictureAsPdfIcon from'@mui/icons-material/PictureAsPdf';
import PersonOutlinedIcon from'@mui/icons-material/PersonOutlined';
import GroupOutlinedIcon from'@mui/icons-material/GroupOutlined';
import CheckCircleOutlinedIcon from'@mui/icons-material/CheckCircleOutlined';
import EventBusyOutlinedIcon from'@mui/icons-material/EventBusyOutlined';
import BusinessOutlinedIcon from'@mui/icons-material/BusinessOutlined';
import PersonAddOutlinedIcon from'@mui/icons-material/PersonAddOutlined';
import BadgeOutlinedIcon from'@mui/icons-material/BadgeOutlined';
import React, { useState, useEffect, useMemo } from'react';
import { Link } from'react-router-dom';
import { 
 Button, 
 IconButton, 
 Menu, 
 MenuItem, 
 TextField, 
 InputAdornment,
 Avatar,
 Checkbox,
 FormControlLabel,
 Tooltip
} from'@mui/material';
import DataGridTable from'../../components/tables/DataGridTable';
import PageHeader from'../../components/common/PageHeader';
import { getStoredStaff, deleteStaffMember, bulkDeleteStaff } from'../../services/HumanResources/staffService';
import EditStaffModal from'../../components/HumanResources/Staff/StaffModal';
import StaffSummaryCards from '../../components/HumanResources/Staff/StaffSummaryCards';
import StaffTable from '../../components/HumanResources/Staff/StaffTable';
import '../../features/assigned-ui/toolbarStyles.css';

export default function AllStaff() {
 const [searchTerm, setSearchTerm] = useState('');
 const [anchorEl, setAnchorEl] = useState(null);
 const [selectedStaff, setSelectedStaff] = useState(null);
 
 const [staffData, setStaffData] = useState(() => getStoredStaff());
 const [selectedIds, setSelectedIds] = useState([]);

 // Edit Staff Modal state
 const [editModalOpen, setEditModalOpen] = useState(false);
 const [editingStaff, setEditingStaff] = useState(null);

 const handleOpenEdit = (staff) => {
 setEditingStaff(staff);
 setEditModalOpen(true);
 };

 const handleCloseEdit = () => {
 setEditModalOpen(false);
 setEditingStaff(null);
 };

 const handleEditSuccess = (updatedStaff) => {
 setStaffData(prev => prev.map(s => String(s.id) === String(updatedStaff.id) ? { ...s, ...updatedStaff } : s));
 };

 // Auto-sync staff from localStorage on mount and when changed
 useEffect(() => {
 const syncStaff = () => {
 setStaffData(getStoredStaff());
 };
 syncStaff();
 window.addEventListener('storage', syncStaff);
 window.addEventListener('luxuria_staff_updated', syncStaff);
 return () => {
 window.removeEventListener('storage', syncStaff);
 window.removeEventListener('luxuria_staff_updated', syncStaff);
 };
 }, []);

 // Column visibility state
 const [filterAnchorEl, setFilterAnchorEl] = useState(null);
 const [visibleColumns, setVisibleColumns] = useState({
 name: true,
 designation: true,
 phone: true,
 email: true,
 joiningDate: true,
 address: true
 });

 const handleMenuClick = (event, staff) => {
 setAnchorEl(event.currentTarget);
 setSelectedStaff(staff);
 };

 const handleMenuClose = () => {
 setAnchorEl(null);
 setSelectedStaff(null);
 };

 const handleFilterClick = (event) => {
 setFilterAnchorEl(event.currentTarget);
 };

 const handleFilterClose = () => {
 setFilterAnchorEl(null);
 };

 const toggleColumnVisibility = (field) => {
 setVisibleColumns(prev => ({
 ...prev,
 [field]: !prev[field]
 }));
 };

 const handleBulkDelete = () => {
 const updated = bulkDeleteStaff(selectedIds);
 setStaffData(updated);
 setSelectedIds([]);
 };

 const handleDeleteStaff = (id) => {
 const updated = deleteStaffMember(id);
 setStaffData(updated);
 setSelectedIds(prev => prev.filter(selId => selId !== id));
 };

 const handleRefresh = () => {
 setStaffData(getStoredStaff());
 setSelectedIds([]);
 setSearchTerm('');
 };

 const handlePdfExport = async () => {
 const { default: jsPDF } = await import('jspdf');
 const { default: autoTable } = await import('jspdf-autotable');
 const doc = new jsPDF();
 const exportCols = columns.filter(c => c.field !=='actions');
 const headers = exportCols.map(c => c.label);
 const rows = filteredStaff.map(s => exportCols.map(c => s[c.field] ||''));
 autoTable(doc, { head: [headers], body: rows });
 doc.save('All_Staff.pdf');
 };

 const handleExcelExport = async () => {
 const XLSX = await import('xlsx');
 const exportCols = columns.filter(c => c.field !=='actions');
 const rows = filteredStaff.map(s => {
 const row = {};
 exportCols.forEach(c => row[c.label] = s[c.field] ||'');
 return row;
 });
 const worksheet = XLSX.utils.json_to_sheet(rows);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet,"Staff");
 XLSX.writeFile(workbook,"All_Staff.xlsx");
 };

 const filteredStaff = staffData.filter(staff => {
 const term = (searchTerm ||'').toLowerCase().trim();
 if (!term) return true;
 const matchesName = (staff.name ||'').toLowerCase().includes(term);
 const matchesEmpId = (staff.empId ||'').toLowerCase().includes(term);
 const matchesDept = (staff.department ||'').toLowerCase().includes(term);
 const matchesDesig = (staff.designation ||'').toLowerCase().includes(term);
 return matchesName || matchesEmpId || matchesDept || matchesDesig;
 });

 const columns = [
 { 
 label:'Name', 
 field:'name', 
 sx: { width:'18%' },
 render: (row) => (
 <div className="flex items-center gap-1.5 min-w-0">
 <Avatar src={row.avatar ||`https://i.pravatar.cc/150?u=${row.id}`} alt={row.name} sx={{ width: 24, height: 24, flexShrink: 0 }} />
 <Link to={`/hr/staff/${row.id}`} className="text-xs font-semibold text-gray-800 hover:text-indigo-600 transition-colors truncate block" title={row.name}>
 {row.name}
 </Link>
 </div>
 )
 },
 { 
 label:'Designation', 
 field:'designation', 
 sx: { width:'15%' },
 render: (row) => (
 <span className="text-xs text-gray-700 truncate block" title={row.designation}>{row.designation}</span>
 )
 },
 { 
 label:'Mobile', 
 field:'phone', 
 sx: { width:'14%' },
 render: (row) => (
 <div className="flex items-center gap-1 text-xs text-gray-700 min-w-0">
 <PhoneOutlinedIcon sx={{ color:'#22c55e', fontSize: 14, flexShrink: 0 }} />
 <span className="truncate block" title={row.phone}>{row.phone}</span>
 </div>
 )
 },
 { 
 label:'Email', 
 field:'email', 
 sx: { width:'18%' },
 render: (row) => (
 <div className="flex items-center gap-1 text-xs text-gray-700 min-w-0">
 <MailOutlinedIcon sx={{ color:'#ef4444', fontSize: 14, flexShrink: 0 }} />
 <span className="truncate block" title={row.email}>{row.email}</span>
 </div>
 )
 },
 { 
 label:'Joining Date', 
 field:'joiningDate', 
 sx: { width:'13%' },
 render: (row) => (
 <div className="flex items-center gap-1 text-xs text-gray-700 min-w-0">
 <CalendarTodayOutlinedIcon sx={{ color:'#4b5563', fontSize: 13, flexShrink: 0 }} />
 <span className="truncate block">{row.joiningDate}</span>
 </div>
 )
 },
 { 
 label:'Address', 
 field:'address', 
 sx: { width:'12%' },
 render: (row) => (
 <div className="flex items-center gap-1 text-xs text-gray-700 min-w-0">
 <LocationOnOutlinedIcon sx={{ color:'#3b82f6', fontSize: 14, flexShrink: 0 }} />
 <span className="truncate block" title={row.address}>{row.address}</span>
 </div>
 )
 },
 { 
 label:'Actions', 
 field:'actions', 
 alwaysVisible: true, 
 sx: { 
 width:'100px', 
 minWidth:'100px', 
 maxWidth:'100px', 
 textAlign:'center',
 padding:'4px 2px',
 },
 render: (row) => (
 <div className="flex items-center justify-center gap-0.5">
 <Tooltip title="View Profile">
 <IconButton 
 size="small" 
 component={Link} 
 to={`/hr/staff/${row.id}`} 
 sx={{ color:'#3b82f6', p:'2px' }}
 >
 <PersonOutlinedIcon sx={{ fontSize: 17 }} />
 </IconButton>
 </Tooltip>
 <Tooltip title="Edit Staff">
 <IconButton 
 size="small" 
 onClick={() => handleOpenEdit(row)} 
 sx={{ color:'#6366f1', p:'2px' }}
 >
 <EditIcon sx={{ fontSize: 17 }} />
 </IconButton>
 </Tooltip>
 <Tooltip title="Delete Staff">
 <IconButton 
 size="small" 
 onClick={() => handleDeleteStaff(row.id)} 
 sx={{ color:'#ef4444', p:'2px' }}
 >
 <DeleteOutlineIcon sx={{ fontSize: 17 }} />
 </IconButton>
 </Tooltip>
 </div>
 )
 },
 ];

 const activeColumns = columns.filter(col => col.alwaysVisible || visibleColumns[col.field]);

 // Calculate dynamic HR summary metrics from staffData
 const summaryCards = useMemo(() => {
 const list = Array.isArray(staffData) ? staffData : [];
 const totalStaff = list.length;
 
 // Active staff: status is active (case-insensitive)
 const activeStaff = list.filter(s => (s.status || s.employmentStatus ||'Active').trim().toLowerCase() ==='active').length;
 
 // On Leave: status contains'leave' (case-insensitive), fallback to 0
 const onLeaveStaff = list.filter(s => (s.status || s.employmentStatus ||'').trim().toLowerCase().includes('leave')).length;
 
 // Unique departments
 const departmentsCount = new Set(list.map(s => (s.department ||'').trim()).filter(Boolean)).size;
 
 // New Joiners: based on joiningDate within current month or last 30 days
 const now = new Date();
 const newJoinersCount = list.filter(s => {
 if (!s.joiningDate) return false;
 const joinDate = new Date(s.joiningDate);
 if (isNaN(joinDate.getTime())) return false;
 const isCurrentMonth = joinDate.getFullYear() === now.getFullYear() && joinDate.getMonth() === now.getMonth();
 const diffDays = (now.getTime() - joinDate.getTime()) / (1000 * 3600 * 24);
 return isCurrentMonth || (diffDays >= 0 && diffDays <= 30);
 }).length;

 // Unique designations
 const designationsCount = new Set(list.map(s => (s.designation ||'').trim()).filter(Boolean)).size;

 return [
 {
 id:'total-staff',
 title:'Total Staff',
 value: totalStaff,
 subtext:'Members',
 icon: GroupOutlinedIcon
 },
 {
 id:'active-staff',
 title:'Active Staff',
 value: activeStaff,
 subtext:'Active',
 icon: CheckCircleOutlinedIcon
 },
 {
 id:'on-leave',
 title:'On Leave',
 value: onLeaveStaff,
 subtext:'On Leave',
 icon: EventBusyOutlinedIcon
 },
 {
 id:'departments',
 title:'Departments',
 value: departmentsCount,
 subtext:'Units',
 icon: BusinessOutlinedIcon
 },
 {
 id:'new-joiners',
 title:'New Joiners',
 value: newJoinersCount,
 subtext:'Recent',
 icon: PersonAddOutlinedIcon
 },
 {
 id:'designations',
 title:'Designations',
 value: designationsCount,
 subtext:'Roles',
 icon: BadgeOutlinedIcon
 }
 ];
 }, [staffData]);

 return (
 <div className="p-0 -mx-1 sm:-mx-1.5 md:-mx-2 w-[calc(100%+8px)] sm:w-[calc(100%+12px)] md:w-[calc(100%+16px)] overflow-hidden flex flex-col gap-2">
 <StaffSummaryCards cards={summaryCards} />

 {/* Main Table Card */}
 <div className="bg-white rounded-xl shadow-sm p-0 w-full overflow-hidden">
 {/* Top Bar */}
 <div className="flex justify-between items-center mb-1 pb-1 border-b border-gray-100 px-2 sm:px-2.5">
 <div className="flex items-center gap-2 pt-1">
 <TextField
 size="small"
 placeholder="Search..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 sx={{ 
 width: 250,'& .MuiOutlinedInput-root': {
 borderRadius:'8px',
 } 
 }}
 InputProps={{
 endAdornment: (
 <InputAdornment position="end">
 <SearchIcon className="text-gray-500" fontSize="small" />
 </InputAdornment>
 ),
 }}
 />
 </div>
 
 <div className="assigned-table-toolbar flex items-center gap-2">
 {selectedIds.length > 0 && (
 <Tooltip title="Delete Selected">
 <IconButton size="small" sx={{ color:'#ef4444' }} onClick={handleBulkDelete}>
 <DeleteOutlineIcon fontSize="small" />
 </IconButton>
 </Tooltip>
 )}
 <Tooltip title="Filter Columns">
 <IconButton size="small" sx={{ color:'#3b82f6' }} onClick={handleFilterClick}>
 <FilterListIcon fontSize="small" />
 </IconButton>
 </Tooltip>
 <Tooltip title="Add Staff">
 <IconButton size="small" sx={{ color:'#22c55e' }} component={Link} to="/hr/staff/add">
 <AddCircleOutlineIcon fontSize="small" />
 </IconButton>
 </Tooltip>
 <Tooltip title="Refresh">
 <IconButton size="small" sx={{ color:'#64748b' }} onClick={handleRefresh}>
 <RefreshIcon fontSize="small" />
 </IconButton>
 </Tooltip>
 <Tooltip title="Download Excel">
 <IconButton className="toolbar-export-icon" size="small" sx={{ color:'#0ea5e9' }} onClick={handleExcelExport}>
 <CalculateIcon fontSize="small" />
 </IconButton>
 </Tooltip>
 <Tooltip title="Download PDF">
 <IconButton className="toolbar-export-icon" size="small" sx={{ color:'#ef4444' }} onClick={handlePdfExport}>
 <PictureAsPdfIcon fontSize="small" />
 </IconButton>
 </Tooltip>
 </div>
 </div>

 {/* Table */}
 <div className="w-full overflow-hidden">
 <StaffTable
 columns={activeColumns}
 data={filteredStaff}
 selected={selectedIds}
 onSelectionChange={setSelectedIds}
 />
 </div>

 {/* Column Visibility Filter Menu */}
 <Menu
 anchorEl={filterAnchorEl}
 open={Boolean(filterAnchorEl)}
 onClose={handleFilterClose}
 transformOrigin={{ horizontal:'right', vertical:'top' }}
 anchorOrigin={{ horizontal:'right', vertical:'bottom' }}
 PaperProps={{
 style: { minWidth:'200px', padding:'8px' }
 }}
 >
 <div className="px-4 py-2 font-bold text-gray-700 border-b mb-2">Show Columns</div>
 {columns.filter(col => !col.alwaysVisible).map(col => (
 <MenuItem key={col.field} disableRipple onClick={() => toggleColumnVisibility(col.field)}>
 <FormControlLabel
 control={
 <Checkbox 
 checked={visibleColumns[col.field]} 
 size="small"
 color="primary"
 />
 }
 label={col.label}
 onClick={(e) => e.preventDefault()} // Prevent double trigger
 />
 </MenuItem>
 ))}
 </Menu>

 {/* Edit Staff Modal Dialog matching Luxuria exact design */}
 <EditStaffModal
 open={editModalOpen}
 onClose={handleCloseEdit}
 staff={editingStaff}
 onSaveSuccess={handleEditSuccess}
 />

 </div>
 </div>
 );
}
