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
import React, { useState } from 'react';
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
import { mockStaff } from '../../../utils/mockData';

export default function AllStaff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const [staffData, setStaffData] = useState(mockStaff);
  const [selectedIds, setSelectedIds] = useState([]);

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
    setStaffData(prev => prev.filter(staff => !selectedIds.includes(staff.id || staff.empId)));
    setSelectedIds([]);
  };

  const handleRefresh = () => {
    setStaffData([...mockStaff]);
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
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.empId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    { label: 'Name', field: 'name', render: (row) => (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Avatar src={`https://i.pravatar.cc/150?u=${row.id}`} alt={row.name} sx={{ width: 28, height: 28 }} />
        <span className="text-sm font-medium text-gray-700">{row.name}</span>
      </div>
    )},
    { label: 'Designation', field: 'designation', render: (row) => (
      <span className="text-xs text-gray-700 whitespace-nowrap">{row.designation}</span>
    )},
    { label: 'Mobile', field: 'phone', render: (row) => (
      <div className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
        <PhoneOutlinedIcon fontSize="small" sx={{ color: '#22c55e', fontSize: '1rem' }} />
        <span>{row.phone}</span>
      </div>
    )},
    { label: 'Email', field: 'email', render: (row) => (
      <div className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
        <MailOutlinedIcon fontSize="small" sx={{ color: '#ef4444', fontSize: '1rem' }} />
        <span>{row.email}</span>
      </div>
    )},
    { label: 'Joining Date', field: 'joiningDate', render: (row) => (
      <div className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
        <CalendarTodayOutlinedIcon fontSize="small" sx={{ color: '#4b5563', fontSize: '1rem' }} />
        <span>{row.joiningDate}</span>
      </div>
    )},
    { label: 'Address', field: 'address', render: (row) => (
      <div className="flex items-center gap-1 text-xs text-gray-700 whitespace-nowrap">
        <LocationOnOutlinedIcon fontSize="small" sx={{ color: '#3b82f6', fontSize: '1rem' }} />
        <span>{row.address}</span>
      </div>
    )},
    { label: 'Actions', field: 'actions', alwaysVisible: true, render: (row) => (
      <IconButton size="small" component={Link} to={`/hr/staff/${row.id}/edit`} sx={{ color: '#6366f1' }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  const activeColumns = columns.filter(col => col.alwaysVisible || visibleColumns[col.field]);

  return (
    <div className="px-px pt-4 pb-0">

      <div className="bg-white rounded-xl shadow-sm p-px mt-px">
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
      <div>
        <DataGridTable 
          columns={activeColumns} 
          data={filteredStaff} 
          selectable={true} 
          flat={true} 
          selected={selectedIds}
          onSelectionChange={setSelectedIds}
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

      </div>
    </div>
  );
}
