import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterAltOff as FilterAltOffIcon,
  DirectionsCar as CarIcon,
  LocalParking as ParkingIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

import { 
  getParkingRecords, 
  getParkingSpaces, 
  deleteParkingRecord,
  PARKING_UPDATED_EVENT 
} from '../state/carParkingStore';

import AddEditCarModal from '../components/AddEditCarModal';
import CheckoutCarModal from '../components/CheckoutCarModal';
import ManageSpacesModal from '../components/ManageSpacesModal';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    height: '32px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    height: '32px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    color: '#6b7280',
    transform: 'translate(14px, 7px) scale(1)',
    '&.Mui-focused': { color: '#1b7f43' }
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  }
};

const dateFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    height: '32px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiOutlinedInput-input': {
    padding: '0px 8px',
    boxSizing: 'border-box',
    height: '32px',
  }
};

const STATUS_OPTIONS = ['All', 'Parked', 'Checked Out'];
const PAYMENT_OPTIONS = ['All', 'Paid', 'Pending'];
const TYPE_OPTIONS = ['All', 'Sedan', 'SUV', 'Hatchback', 'Van', 'Bike', 'Other'];
const DATE_PERIODS = ['All Time', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

export default function CarParking() {
  const [records, setRecords] = useState([]);
  const [spaces, setSpaces] = useState([]);
  
  // Modals state
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [manageSpacesModalOpen, setManageSpacesModalOpen] = useState(false);
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [menuRecord, setMenuRecord] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Parked'); // Default to showing only parked cars
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [datePeriod, setDatePeriod] = useState('All Time');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = () => {
    setRecords(getParkingRecords());
    setSpaces(getParkingSpaces());
  };

  useEffect(() => {
    fetchData();
    window.addEventListener(PARKING_UPDATED_EVENT, fetchData);
    return () => window.removeEventListener(PARKING_UPDATED_EVENT, fetchData);
  }, []);

  const handleClear = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setTypeFilter('All');
    setDatePeriod('All Time');
    setCurrentPage(1);
  };

  const handleOpenAdd = () => {
    setSelectedRecord(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setSelectedRecord(record);
    setAddEditModalOpen(true);
    handleMenuClose();
  };

  const handleOpenCheckout = (record) => {
    setSelectedRecord(record);
    setCheckoutModalOpen(true);
    handleMenuClose();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this parking record?')) {
      deleteParkingRecord(id);
      fetchData(); // Trigger immediate visual update
    }
    handleMenuClose();
  };

  const handleMenuOpen = (event, record) => {
    setActionAnchorEl(event.currentTarget);
    setMenuRecord(record);
  };

  const handleMenuClose = () => {
    setActionAnchorEl(null);
    setMenuRecord(null);
  };

  // Calculations
  const totalSpaces = spaces.length;
  const parkedCars = records.filter(r => r.status === 'Parked').length;
  const availableSpaces = spaces.filter(s => s.status === 'Available').length;
  
  const todaysCharges = records.reduce((sum, record) => {
    const today = new Date().toISOString().split('T')[0];
    if (record.entryDate === today) {
      return sum + Number(record.chargeAmount || 0);
    }
    return sum;
  }, 0);

  // Filtering
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          record.guestName?.toLowerCase().includes(query) ||
          record.carNumber?.toLowerCase().includes(query) ||
          record.roomNumber?.toLowerCase().includes(query) ||
          record.parkingSpace?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Status
      if (statusFilter !== 'All' && record.status !== statusFilter) return false;
      
      // Payment
      if (paymentFilter !== 'All' && record.paymentStatus !== paymentFilter) return false;
      
      // Type
      if (typeFilter !== 'All' && record.carType !== typeFilter) return false;
      
      // Date Period
      if (datePeriod !== 'All Time') {
        const entryDate = new Date(record.entryDate);
        const today = new Date();
        
        if (datePeriod === 'Daily') {
          if (entryDate.toDateString() !== today.toDateString()) return false;
        } else if (datePeriod === 'Weekly') {
          const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (entryDate < oneWeekAgo) return false;
        } else if (datePeriod === 'Monthly') {
          if (entryDate.getMonth() !== today.getMonth() || entryDate.getFullYear() !== today.getFullYear()) return false;
        } else if (datePeriod === 'Yearly') {
          if (entryDate.getFullYear() !== today.getFullYear()) return false;
        }
      }
      
      return true;
    }).sort((a, b) => new Date(b.entryDate + 'T' + b.entryTime) - new Date(a.entryDate + 'T' + a.entryTime));
  }, [records, searchQuery, statusFilter, paymentFilter, typeFilter, datePeriod]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, typeFilter, datePeriod]);

  return (
    <div className="animate-fade-in">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
        <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{totalSpaces}</div>
            <div className="text-[13px] text-gray-500 font-medium">Total Spaces</div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
            <ParkingIcon sx={{ fontSize: 18 }} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{parkedCars}</div>
            <div className="text-[13px] text-gray-500 font-medium">Parked Cars</div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-50 text-yellow-600">
            <CarIcon sx={{ fontSize: 18 }} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{availableSpaces}</div>
            <div className="text-[13px] text-gray-500 font-medium">Available Spaces</div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
            <CheckCircleIcon sx={{ fontSize: 18 }} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-none mb-1">Rs. {todaysCharges.toLocaleString()}</div>
            <div className="text-[13px] text-gray-500 font-medium">Today's Charges</div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
            <AttachMoneyIcon sx={{ fontSize: 18 }} />
          </div>
        </div>
      </div>

      {/* FILTER & TABLE */}
      <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5">
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-wrap items-end gap-2.5 w-full">
            <TextField
              placeholder="Search car, guest, room..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }}/></InputAdornment>,
              }}
              sx={{ minWidth: 140, flexGrow: 1, maxWidth: { xs: '100%', sm: 180 }, '& .MuiInputBase-root': { height: '32px', backgroundColor: 'white', fontSize: '12px', borderRadius: '8px' }, '& .MuiOutlinedInput-input': { padding: '0 8px' }, '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' }, '&:hover fieldset': { borderColor: '#9ca3af' }, '& .Mui-focused fieldset': { borderColor: '#1b7f43 !important', borderWidth: '1.5px !important' } }}
            />
            
            <FormControl size="small" sx={{ minWidth: 95, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                {STATUS_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: '13px' }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 95, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Payment</InputLabel>
              <Select value={paymentFilter} label="Payment" onChange={(e) => setPaymentFilter(e.target.value)}>
                {PAYMENT_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: '13px' }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 95, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Car Type</InputLabel>
              <Select value={typeFilter} label="Car Type" onChange={(e) => setTypeFilter(e.target.value)}>
                {TYPE_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: '13px' }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 95, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Date</InputLabel>
              <Select value={datePeriod} label="Date" onChange={(e) => setDatePeriod(e.target.value)}>
                {DATE_PERIODS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: '13px' }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>

            <Button 
              variant="outlined"
              startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
              onClick={handleClear}
              sx={{ 
                borderColor: '#e2e8f0', color: '#64748b', textTransform: 'none', 
                height: '32px', fontSize: '13px', borderRadius: '8px',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
              }}
            >
              Clear
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            {/* ACTION BUTTONS ON THE RIGHT */}
            <Button 
              variant="outlined"
              startIcon={<ParkingIcon />}
              onClick={() => setManageSpacesModalOpen(true)}
              sx={{
                color: '#1e293b',
                borderColor: '#e2e8f0',
                bgcolor: 'white',
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                height: '32px',
                fontSize: '13px',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
              }}
            >
              Manage Spaces
            </Button>
            <Button 
              variant="contained" 
              startIcon={<CarIcon />} 
              onClick={handleOpenAdd}
              sx={{ 
                bgcolor: '#1b7f43', 
                textTransform: 'none', 
                fontWeight: 500,
                px: 3, 
                height: '32px',
                fontSize: '13px',
                borderRadius: '8px',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#166534', boxShadow: 'none' }
              }}
            >
              + Add Car
            </Button>
          </div>
        </div>

        {/* Main Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1.5, fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Car Number</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Guest</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Space</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Entry Time</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Exit Time</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Charge</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Payment</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', bgcolor: '#f9fafb' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRecords.length > 0 ? paginatedRecords.map((record) => (
                <TableRow key={record.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell sx={{ py: 1.5, fontWeight: 500, color: '#1e293b' }}>{record.carNumber}</TableCell>
                  <TableCell sx={{ color: '#475569' }}>{record.guestName}</TableCell>
                  <TableCell sx={{ color: '#475569' }}>{record.roomNumber || '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={record.parkingSpace} sx={{ bgcolor: '#e2e8f0', color: '#334155', fontWeight: 600, borderRadius: 1 }} />
                  </TableCell>
                  <TableCell sx={{ color: '#475569' }}>{record.carType}</TableCell>
                  <TableCell sx={{ color: '#475569' }}>
                    {record.entryTime}<br/><span style={{ fontSize: '11px', color: '#94a3b8' }}>{record.entryDate}</span>
                  </TableCell>
                  <TableCell sx={{ color: '#475569' }}>
                    {record.exitTime ? (
                      <>{record.exitTime}<br/><span style={{ fontSize: '11px', color: '#94a3b8' }}>{record.exitDate}</span></>
                    ) : '-'}
                  </TableCell>
                  <TableCell sx={{ color: '#475569' }}>Rs. {record.chargeAmount}</TableCell>
                  <TableCell>
                    <Chip 
                      label={record.paymentStatus} 
                      size="small"
                      sx={{ 
                        height: '22px', fontSize: '11px', fontWeight: 600,
                        bgcolor: record.paymentStatus === 'Paid' ? '#dcfce7' : '#fef08a',
                        color: record.paymentStatus === 'Paid' ? '#166534' : '#854d0e',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {record.status === 'Parked' ? (
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#1b7f43' }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                      )}
                      <Typography variant="body2" sx={{ 
                        fontSize: '12px', fontWeight: 600,
                        color: record.status === 'Parked' ? '#1b7f43' : '#94a3b8' 
                      }}>
                        {record.status}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, record)}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 6, color: '#94a3b8' }}>
                    No parking records found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Pagination */}
        <div className="p-3 mt-auto flex items-center justify-between text-[12px] text-gray-600 border-t border-gray-100 bg-gray-50/30 rounded-b-[6px]">
          <span>Showing {paginatedRecords.length} of {filteredRecords.length} records</span>
          <div className="flex items-center gap-4">
            <span 
              className={`cursor-pointer ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:text-gray-900'}`}
              onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
            >
              {'< Prev'}
            </span>
            <span 
              className={`cursor-pointer ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:text-gray-900'}`}
              onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
            >
              {'Next >'}
            </span>
          </div>
        </div>
      </div>

      {/* Row Actions Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ elevation: 2, sx: { minWidth: 150, borderRadius: 2 } }}
      >
        {menuRecord?.status === 'Parked' && (
          <MenuItem onClick={() => handleOpenCheckout(menuRecord)} sx={{ fontSize: '13px', color: '#d97706', fontWeight: 500 }}>
            Check Out Car
          </MenuItem>
        )}
        <MenuItem onClick={() => handleOpenEdit(menuRecord)} sx={{ fontSize: '13px' }}>Edit Record</MenuItem>
        <MenuItem onClick={() => handleDelete(menuRecord.id)} sx={{ fontSize: '13px', color: '#ef4444' }}>Delete Record</MenuItem>
      </Menu>

      {/* Modals */}
      <AddEditCarModal 
        open={addEditModalOpen} 
        onClose={() => setAddEditModalOpen(false)} 
        editRecord={selectedRecord}
      />
      <CheckoutCarModal 
        open={checkoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        record={selectedRecord}
      />
      <ManageSpacesModal 
        open={manageSpacesModalOpen} 
        onClose={() => setManageSpacesModalOpen(false)} 
      />
    </div>
  );
}
