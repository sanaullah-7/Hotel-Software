import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  CircularProgress,
  Alert,
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
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import { parkingService } from '../../../services/parkingService';
import { toFrontendRecords, toFrontendSpaces } from '../adapters/parkingAdapter';
import { PARKING_UPDATED_EVENT } from '../state/carParkingStore';

import AddEditCarModal from '../components/AddEditCarModal';
import CheckoutCarModal from '../components/CheckoutCarModal';
import ManageSpacesModal from '../components/ManageSpacesModal';
import Dropdown from '../../../components/ui/Dropdown';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '11px',
    height: '28px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    height: '28px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '11.5px',
    color: '#6b7280',
    transform: 'translate(12px, 5px) scale(1)',
    '&.Mui-focused': { color: '#1b7f43' }
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(12px, -8px) scale(0.75)',
  }
};

const STATUS_OPTIONS = ['All', 'Parked', 'Checked Out'];
const PAYMENT_OPTIONS = ['All', 'Paid', 'Pending'];
const TYPE_OPTIONS = ['All', 'Sedan', 'SUV', 'Hatchback', 'Van', 'Bike', 'Other'];
const DATE_PERIODS = ['All Time', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

export default function CarParking() {
  const [records, setRecords] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [manageSpacesModalOpen, setManageSpacesModalOpen] = useState(false);
  
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [menuRecord, setMenuRecord] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Parked');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [datePeriod, setDatePeriod] = useState('All Time');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [backendSpaces, backendRecords] = await Promise.all([
        parkingService.getSpaces(),
        parkingService.getRecords(),
      ]);
      setSpaces(toFrontendSpaces(backendSpaces));
      setRecords(toFrontendRecords(backendRecords));
    } catch (err) {
      console.error('Failed to fetch car parking data from backend:', err);
      setError(err?.message || 'Failed to load car parking records. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener(PARKING_UPDATED_EVENT, fetchData);
    return () => window.removeEventListener(PARKING_UPDATED_EVENT, fetchData);
  }, [fetchData]);

  const handleClear = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setTypeFilter('All');
    setDatePeriod('All Time');
    setCurrentPage(1);
  };

  const handleMenuOpen = (event, record) => {
    setActionAnchorEl(event.currentTarget);
    setMenuRecord(record);
  };

  const handleMenuClose = () => {
    setActionAnchorEl(null);
    setMenuRecord(null);
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking record?')) {
      try {
        await parkingService.deleteRecord(id);
        window.dispatchEvent(new Event(PARKING_UPDATED_EVENT));
        fetchData();
      } catch (err) {
        alert(err?.message || 'Failed to delete parking record');
      }
    }
    handleMenuClose();
  };

  // Metrics
  const totalSpaces = spaces.length;
  const parkedCars = records.filter(r => r.status === 'Parked').length;
  const availableSpaces = Math.max(0, totalSpaces - parkedCars);
  
  const todaysCharges = useMemo(() => {
    const today = new Date().toDateString();
    return records
      .filter(r => new Date(r.entryDate).toDateString() === today)
      .reduce((sum, r) => sum + (Number(r.chargeAmount) || 0), 0);
  }, [records]);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          (record.carNumber && record.carNumber.toLowerCase().includes(q)) ||
          (record.guestName && record.guestName.toLowerCase().includes(q)) ||
          (record.roomNumber && String(record.roomNumber).toLowerCase().includes(q)) ||
          (record.parkingSpace && record.parkingSpace.toLowerCase().includes(q));
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, typeFilter, datePeriod]);

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">
      {/* ERROR BANNER */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 1, fontSize: '12px', alignItems: 'center' }}
          action={
            <Button color="inherit" size="small" onClick={fetchData} startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{totalSpaces}</div>
            <div className="text-[11px] text-gray-500 font-medium">Total Spaces</div>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <ParkingIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{parkedCars}</div>
            <div className="text-[11px] text-gray-500 font-medium">Parked Cars</div>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600">
            <CarIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{availableSpaces}</div>
            <div className="text-[11px] text-gray-500 font-medium">Available Spaces</div>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
            <CheckCircleIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">Rs. {todaysCharges.toLocaleString()}</div>
            <div className="text-[11px] text-gray-500 font-medium">Today's Charges</div>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
            <AttachMoneyIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* FILTER & TABLE */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 flex-1 flex flex-col overflow-hidden">
        <div className="p-2 sm:p-2.5 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full">
            <TextField
              placeholder="Search car, guest, room..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: '#94a3b8' }}/></InputAdornment>,
              }}
              sx={{ minWidth: 120, flexGrow: 1, maxWidth: { xs: '100%', sm: 180 }, '& .MuiInputBase-root': { height: '28px', backgroundColor: 'white', fontSize: '11px', borderRadius: '6px' }, '& .MuiOutlinedInput-input': { padding: '0 6px' }, '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1px' }, '&:hover fieldset': { borderColor: '#9ca3af' }, '& .Mui-focused fieldset': { borderColor: '#1b7f43 !important', borderWidth: '1.5px !important' } }}
            />
            
            <Dropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth={false}
              formControlSx={{ minWidth: 80, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}
              optionSx={{ fontSize: '11px' }}
            />
            
            <Dropdown
              label="Payment"
              options={PAYMENT_OPTIONS}
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              fullWidth={false}
              formControlSx={{ minWidth: 80, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}
              optionSx={{ fontSize: '11px' }}
            />
            
            <Dropdown
              label="Car Type"
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              fullWidth={false}
              formControlSx={{ minWidth: 80, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}
              optionSx={{ fontSize: '11px' }}
            />

            <Dropdown
              label="Date"
              options={DATE_PERIODS}
              value={datePeriod}
              onChange={(e) => setDatePeriod(e.target.value)}
              fullWidth={false}
              formControlSx={{ minWidth: 80, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}
              optionSx={{ fontSize: '11px' }}
            />

            <Button 
              variant="outlined"
              startIcon={<FilterAltOffIcon sx={{ fontSize: 13 }} />}
              onClick={handleClear}
              sx={{ 
                borderColor: '#e2e8f0', color: '#64748b', textTransform: 'none', 
                height: '28px', fontSize: '10.5px', borderRadius: '6px', px: 1.2,
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }
              }}
            >
              Clear
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            {/* ACTION BUTTONS ON THE RIGHT */}
            <div className="flex items-center gap-1.5 ml-auto">
              <Button 
                variant="outlined"
                startIcon={<ParkingIcon sx={{ fontSize: 14 }} />}
                onClick={() => setManageSpacesModalOpen(true)}
                sx={{
                  color: '#1e293b',
                  borderColor: '#e2e8f0',
                  bgcolor: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 1.5,
                  height: '28px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' }
                }}
              >
                Manage Spaces
              </Button>
              <Button 
                variant="contained" 
                startIcon={<CarIcon sx={{ fontSize: 14 }} />} 
                onClick={handleOpenAdd}
                sx={{ 
                  bgcolor: '#1b7f43', 
                  textTransform: 'none', 
                  fontWeight: 600,
                  px: 1.5, 
                  height: '28px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#166534', boxShadow: 'none' }
                }}
              >
                + Add Car
              </Button>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="w-full overflow-hidden">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <CircularProgress size={28} sx={{ color: '#1b7f43' }} />
              <span className="text-xs text-gray-500 font-medium">Loading parking records from server...</span>
            </div>
          ) : (
            <table className="table-fixed w-full text-left border-collapse">
              <colgroup>
                <col style={{ width: '10.5%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '5.5%' }} />
                <col style={{ width: '5.5%' }} />
                <col style={{ width: '6.5%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '7.5%' }} />
                <col style={{ width: '7.5%' }} />
                <col style={{ width: '7%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50">
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Car Number</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Guest</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Room</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Space</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Entry Time</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Exit Time</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Charge</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Payment</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="py-2 px-1 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedRecords.length > 0 ? paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/60 transition-colors border-b border-gray-50">
                    <td className="py-1.5 px-1.5 text-[11px] font-bold text-gray-900 whitespace-nowrap truncate" title={record.carNumber}>
                      {record.carNumber}
                    </td>
                    <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-700 truncate" title={record.guestName}>
                      {record.guestName || '-'}
                    </td>
                    <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                      {record.roomNumber || '-'}
                    </td>
                    <td className="py-1.5 px-1.5 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {record.parkingSpace}
                      </span>
                    </td>
                    <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                      {record.carType}
                    </td>
                    <td className="py-1.5 px-1.5 text-[10.5px] text-gray-600 whitespace-nowrap truncate" title={`${record.entryTime} (${record.entryDate})`}>
                      {record.entryTime} <span className="text-[9.5px] text-gray-400">({record.entryDate})</span>
                    </td>
                    <td className="py-1.5 px-1.5 text-[10.5px] text-gray-600 whitespace-nowrap truncate" title={record.exitTime ? `${record.exitTime} (${record.exitDate})` : '-'}>
                      {record.exitTime ? (
                        <>{record.exitTime} <span className="text-[9.5px] text-gray-400">({record.exitDate})</span></>
                      ) : '-'}
                    </td>
                    <td className="py-1.5 px-1.5 text-[11px] font-bold text-gray-800 whitespace-nowrap">
                      Rs. {record.chargeAmount}
                    </td>
                    <td className="py-1.5 px-1.5 whitespace-nowrap">
                      <span 
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold inline-block ${
                          record.paymentStatus === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {record.paymentStatus}
                      </span>
                    </td>
                    <td className="py-1.5 px-1.5 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {record.status === 'Parked' ? (
                          <CheckCircleIcon sx={{ fontSize: 13, color: '#1b7f43' }} />
                        ) : (
                          <CancelIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                        )}
                        <span className={`text-[10.5px] font-semibold ${record.status === 'Parked' ? 'text-[#1b7f43]' : 'text-gray-400'}`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 px-1 text-center whitespace-nowrap">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, record)} sx={{ p: 0.5 }}>
                        <MoreVertIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-gray-400 text-[11.5px]">
                      No parking records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Pagination */}
        <div className="px-3 py-1.5 sm:py-2 mt-auto flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 bg-slate-50/40">
          <span>Showing {paginatedRecords.length} of {filteredRecords.length} records</span>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              className={`px-2 py-0.5 text-xs rounded border border-gray-200 bg-white transition-colors ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed border-gray-100' : 'text-gray-700 hover:bg-gray-50 font-medium'
              }`}
              onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-gray-700 px-1">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button 
              type="button"
              className={`px-2 py-0.5 text-xs rounded border border-gray-200 bg-white transition-colors ${
                currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed border-gray-100' : 'text-gray-700 hover:bg-gray-50 font-medium'
              }`}
              onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
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
        PaperProps={{ elevation: 2, sx: { minWidth: 130, borderRadius: '6px' } }}
      >
        {menuRecord?.status === 'Parked' && (
          <MenuItem onClick={() => handleOpenCheckout(menuRecord)} sx={{ fontSize: '11px', color: '#d97706', fontWeight: 600, py: 0.75 }}>
            Check Out Car
          </MenuItem>
        )}
        <MenuItem onClick={() => handleOpenEdit(menuRecord)} sx={{ fontSize: '11px', py: 0.75 }}>Edit Record</MenuItem>
        <MenuItem onClick={() => handleDelete(menuRecord.id)} sx={{ fontSize: '11px', color: '#ef4444', py: 0.75 }}>Delete Record</MenuItem>
      </Menu>

      {/* Modals */}
      <AddEditCarModal 
        open={addEditModalOpen} 
        onClose={() => setAddEditModalOpen(false)} 
        editRecord={selectedRecord}
        onSuccess={fetchData}
      />
      <CheckoutCarModal 
        open={checkoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        record={selectedRecord}
        onSuccess={fetchData}
      />
      <ManageSpacesModal 
        open={manageSpacesModalOpen} 
        onClose={() => setManageSpacesModalOpen(false)} 
        onSuccess={fetchData}
      />
    </div>
  );
}
