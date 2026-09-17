import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalculateIcon from '@mui/icons-material/Calculate';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
} from '@mui/material';
import DataGridTable from '../../../components/tables/DataGridTable';
import PageHeader from '../../../components/common/PageHeader';
import { getStoredStaff, deleteStaffMember, bulkDeleteStaff } from './staffStore';
import EditStaffModal from './EditStaffModal';

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
    const exportCols = columns.filter(c => c.field !== 'actions');
    const headers = exportCols.map(c => c.label);
    const rows = filteredStaff.map(s => exportCols.map(c => s[c.field] || ''));
    autoTable(doc, { head: [headers], body: rows });
    doc.save('All_Staff.pdf');
  };

  const handleExcelExport = async () => {
    const XLSX = await import('xlsx');
    const exportCols = columns.filter(c => c.field !== 'actions');
    const rows = filteredStaff.map(s => {
      const row = {};
      exportCols.forEach(c => row[c.label] = s[c.field] || '');
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");
    XLSX.writeFile(workbook, "All_Staff.xlsx");
  };

  const filteredStaff = staffData.filter(staff => {
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return true;
    const matchesName = (staff.name || '').toLowerCase().includes(term);
    const matchesEmpId = (staff.empId || '').toLowerCase().includes(term);
    const matchesDept = (staff.department || '').toLowerCase().includes(term);
    const matchesDesig = (staff.designation || '').toLowerCase().includes(term);
    return matchesName || matchesEmpId || matchesDept || matchesDesig;
  });

  const columns = [
    { label: 'Name', field: 'name', render: (row) => (
      <div className="flex items-center gap-2">
        <Avatar src={row.avatar || `https://i.pravatar.cc/150?u=${row.id}`} alt={row.name} sx={{ width: 28, height: 28, flexShrink: 0 }} />
        <Link to={`/hr/staff/${row.id}`} className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors truncate max-w-[140px]" title={row.name}>
          {row.name}
        </Link>
      </div>
    )},
    { label: 'Designation', field: 'designation', render: (row) => (
      <span className="text-xs text-gray-700 truncate block max-w-[120px]" title={row.designation}>{row.designation}</span>
    )},
    { label: 'Mobile', field: 'phone', render: (row) => (
      <div className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
        <PhoneOutlinedIcon fontSize="small" sx={{ color: '#22c55e', fontSize: '0.95rem', flexShrink: 0 }} />
        <span>{row.phone}</span>
      </div>
    )},
    { label: 'Email', field: 'email', render: (row) => (
      <div className="flex items-center gap-1 text-xs text-gray-700">
        <MailOutlinedIcon fontSize="small" sx={{ color: '#ef4444', fontSize: '0.95rem', flexShrink: 0 }} />
        <span className="truncate max-w-[140px]" title={row.email}>{row.email}</span>
      </div>
    )},
    { label: 'Joining Date', field: 'joiningDate', render: (row) => (
      <div className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
        <CalendarTodayOutlinedIcon fontSize="small" sx={{ color: '#4b5563', fontSize: '0.95rem', flexShrink: 0 }} />
        <span>{row.joiningDate}</span>
      </div>
    )},
    { label: 'Address', field: 'address', render: (row) => (
      <div className="flex items-center gap-1 text-xs text-gray-700">
        <LocationOnOutlinedIcon fontSize="small" sx={{ color: '#3b82f6', fontSize: '0.95rem', flexShrink: 0 }} />
        <span className="truncate max-w-[150px]" title={row.address}>{row.address}</span>
      </div>
    )},
    { 
      label: 'Actions', 
      field: 'actions', 
      alwaysVisible: true, 
      sx: { pr: 2 },
      render: (row) => (
        <div className="flex items-center gap-1 whitespace-nowrap pr-2">
          <Tooltip title="Edit Staff">
            <IconButton size="small" onClick={() => handleOpenEdit(row)} sx={{ color: '#6366f1', p: '4px' }}>
              <EditIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Staff">
            <IconButton size="small" onClick={() => handleDeleteStaff(row.id)} sx={{ color: '#ef4444', p: '4px' }}>
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </div>
      )
    },
  ];

  const activeColumns = columns.filter(col => col.alwaysVisible || visibleColumns[col.field]);

  return (
    <div className="px-px pt-4 pb-0 w-full overflow-x-hidden">

      <div className="bg-white rounded-xl shadow-sm p-px mt-px w-full overflow-x-hidden">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-1 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-4 pt-4 pl-4">
            <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              width: 250, 
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
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
        
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Tooltip title="Delete Selected">
              <IconButton size="small" sx={{ color: '#ef4444' }} onClick={handleBulkDelete}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Filter Columns">
            <IconButton size="small" sx={{ color: '#3b82f6' }} onClick={handleFilterClick}>
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Staff">
            <IconButton size="small" sx={{ color: '#22c55e' }} component={Link} to="/hr/staff/add">
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton size="small" sx={{ color: '#64748b' }} onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Excel">
            <IconButton size="small" sx={{ color: '#0ea5e9' }} onClick={handleExcelExport}>
              <CalculateIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <IconButton size="small" sx={{ color: '#ef4444' }} onClick={handlePdfExport}>
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-hidden">
        <DataGridTable 
          columns={activeColumns} 
          data={filteredStaff} 
          selectable={true} 
          flat={true} 
          selected={selectedIds}
          onSelectionChange={setSelectedIds}
          noHorizontalScroll={true}
        />
      </div>

      {/* Column Visibility Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          style: { minWidth: '200px', padding: '8px' }
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
