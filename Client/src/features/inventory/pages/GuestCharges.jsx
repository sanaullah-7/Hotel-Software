import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PaginationControls from '../../../components/common/PaginationControls';
import { 
  Search, Add, Download, Refresh, FilterList, 
  Receipt, AttachMoney, RoomService, Warning, 
  CheckCircle, MoreVert, Visibility, Delete, Clear, 
  MeetingRoom, Person, Block,
  LocalShipping, ErrorOutlineOutlined
} from '@mui/icons-material';
import { 
  Menu, MenuItem, IconButton, FormControl, InputLabel, Select, Chip, Tooltip, Snackbar, Alert, CircularProgress 
} from '@mui/material';
import guestChargeService from '../../../services/guestChargeService';
import roomService from '../../../services/roomService';
import { adaptGuestChargeToUI, computeGuestChargeMetrics } from '../adapters/guestChargeAdapter';
import { CHARGE_TYPES, CHARGE_STATUSES } from './inventoryStore';
import AddGuestChargeModal from './components/AddGuestChargeModal';
import ChargeDetailModal from './components/ChargeDetailModal';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'var(--bg-paper)',
    fontSize: '12px',
    color: 'var(--text-primary)',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '6px 12px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--primary-main)' }
  }
};

export default function GuestCharges() {
  const navigate = useNavigate();

  // State
  const [charges, setCharges] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToastOpen, setRefreshToastOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState('success');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedChargeForDetail, setSelectedChargeForDetail] = useState(null);
  const [prefilledChargeData, setPrefilledChargeData] = useState(null);

  // Table action menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuChargeId, setActiveMenuChargeId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchCharges = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [response, roomsRes] = await Promise.all([
        guestChargeService.getGuestCharges({ limit: 500 }),
        roomService.getRooms({ limit: 200 }).catch(() => null)
      ]);
      const rawCharges = response?.data || response?.charges || [];
      const adapted = rawCharges.map(adaptGuestChargeToUI).filter(Boolean);
      setCharges(adapted);

      if (roomsRes) {
        const loadedRooms = Array.isArray(roomsRes?.data?.rooms)
          ? roomsRes.data.rooms
          : Array.isArray(roomsRes?.data)
            ? roomsRes.data
            : [];
        setRooms(loadedRooms);
      }
    } catch (err) {
      console.error('Failed to load guest charges:', err);
      setError(err?.message || 'Failed to load guest charges from server. Please check your network connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  useEffect(() => {
    const handleUpdate = () => fetchCharges(false);
    window.addEventListener('guest_charges_update', handleUpdate);
    return () => window.removeEventListener('guest_charges_update', handleUpdate);
  }, [fetchCharges]);

  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedRoom('All');
    setSelectedType('All Types');
    setSelectedStatus('All Statuses');
    setCurrentPage(1);
    fetchCharges(true).then(() => {
      setFeedbackMessage('Guest charges refreshed from backend.');
      setFeedbackSeverity('success');
      setRefreshToastOpen(true);
    });
  };

  const handleVoidCharge = async (chargeId) => {
    try {
      await guestChargeService.voidGuestCharge(chargeId);
      setFeedbackMessage('Guest charge successfully voided and removed from folio balance.');
      setFeedbackSeverity('success');
      setRefreshToastOpen(true);
      fetchCharges(false);
    } catch (err) {
      console.error('Failed to void guest charge:', err);
      setFeedbackMessage(err?.message || 'Failed to void guest charge.');
      setFeedbackSeverity('error');
      setRefreshToastOpen(true);
    } finally {
      handleMenuClose();
    }
  };

  const metrics = computeGuestChargeMetrics(charges);

  const roomOptions = Array.from(
    new Set([
      ...rooms.map(r => String(r.room_number || r.roomNumber || '')).filter(Boolean),
      ...charges.map(c => String(c.roomNumber || '')).filter(Boolean)
    ])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Multi-parameter filtering
  const filteredCharges = charges.filter(charge => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (charge.guestName && charge.guestName.toLowerCase().includes(q)) ||
      (charge.roomNumber && charge.roomNumber.toLowerCase().includes(q)) ||
      (charge.itemName && charge.itemName.toLowerCase().includes(q)) ||
      (charge.chargeType && charge.chargeType.toLowerCase().includes(q)) ||
      (charge.folioId && charge.folioId.toLowerCase().includes(q)) ||
      (charge.invoiceNumber && charge.invoiceNumber.toLowerCase().includes(q)) ||
      (charge.notes && charge.notes.toLowerCase().includes(q));

    const matchesRoom = 
      selectedRoom === 'All' || charge.roomNumber === selectedRoom;

    const matchesType = 
      selectedType === 'All Types' || charge.chargeType === selectedType;

    let matchesStatus = selectedStatus === 'All Statuses';
    if (!matchesStatus) {
      if (selectedStatus === 'Voided') matchesStatus = charge.isVoided || charge.status === 'Voided';
      else matchesStatus = charge.status === selectedStatus && !charge.isVoided;
    }

    return matchesSearch && matchesRoom && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCharges.length / itemsPerPage) || 1;
  const paginatedCharges = filteredCharges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoom('All');
    setSelectedType('All Types');
    setSelectedStatus('All Statuses');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedRoom !== 'All' || 
    selectedType !== 'All Types' || 
    selectedStatus !== 'All Statuses';

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuChargeId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuChargeId(null);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Consumption':
        return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Consumption</span>;
      case 'Damage':
        return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Damage</span>;
      case 'Minibar':
        return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Minibar</span>;
      case 'Room Service':
        return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Room Service</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-gray-100 text-gray-700 border border-gray-200">{type}</span>;
    }
  };

  const getStatusBadge = (charge) => {
    if (charge.isVoided || charge.status === 'Voided') {
      return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-600 border border-gray-300">Voided</span>;
    }
    switch (charge.status) {
      case 'Added to Folio':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Added to Folio</span>;
      case 'Pending':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case 'Paid':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Paid</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">{charge.status}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Charge ID','Guest Name','Room','Charge Item','Type','Quantity','Unit Price','Amount','Status','Date','Folio Ref','Invoice Ref','Notes'];
    const rows = filteredCharges.map(c => [
      c.id,
      `"${(c.guestName || '').replace(/"/g, '""')}"`,
      c.roomNumber,
      `"${(c.itemName || '').replace(/"/g, '""')}"`,
      c.chargeType,
      c.quantity,
      c.unitPrice,
      c.amount,
      c.status,
      c.date,
      c.folioId || '',
      c.invoiceNumber || '',
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guest_charges_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-2 max-w-[1600px] mx-auto pb-2 animate-fade-in">
      
      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Total Charges */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Total Charges</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-gray-900 leading-none">{metrics.totalCharges}</span>
            <span className="text-[10px] text-gray-500 font-medium">
              Rs. {metrics.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Active Folio Charges */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Active Folio Items</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-emerald-700 leading-none">{metrics.activeCharges}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Live Billed
            </span>
          </div>
        </div>

        {/* Consumption Charges */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Consumption / Minibar</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-blue-600 leading-none">
              Rs. {metrics.consumptionTotal.toLocaleString()}
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Billed</span>
          </div>
        </div>

        {/* Damage Charges */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Loss & Damage</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-rose-600 leading-none">
              Rs. {metrics.damageTotal.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-600 font-medium">Recovered</span>
          </div>
        </div>

        {/* Voided Charges */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Voided / Reversed</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-gray-700 leading-none">{metrics.voidedCount}</span>
            <span className="text-[10px] text-gray-400 font-medium">Reversals</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
            <input 
              type="text" 
              placeholder="Search guest, room, item, folio..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-7 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] placeholder-gray-400 text-gray-800"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Clear sx={{ fontSize: 14 }} />
              </button>
            )}
          </div>

          {/* Quick Charge Type Fast-Filter Pills */}
          <div className="flex items-center gap-1 shrink-0 py-0.5 flex-wrap">
            <span className="text-[10.5px] font-bold text-gray-400 uppercase mr-1">Charge Type:</span>
            {['All Types', 'Consumption', 'Damage', 'Minibar', 'Room Service'].map((t) => {
              const isActive = selectedType === t;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedType(t);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition cursor-pointer ${
                    isActive 
                      ? 'bg-[#1b7f43] text-white shadow-xs' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

        </div>

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 items-center">
          
          {/* Room Filter Dropdown */}
          <div>
            <FormControl fullWidth size="small" sx={muiSelectSx}>
              <InputLabel>Filter Room</InputLabel>
              <Select 
                label="Filter Room" 
                value={selectedRoom} 
                onChange={(e) => {
                  setSelectedRoom(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="All">All Guest Rooms</MenuItem>
                {roomOptions.map(r => (
                  <MenuItem key={r} value={r}>Room {r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Status Dropdown */}
          <div>
            <FormControl fullWidth size="small" sx={muiSelectSx}>
              <InputLabel>Folio Status</InputLabel>
              <Select 
                label="Folio Status" 
                value={selectedStatus} 
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="All Statuses">All Statuses</MenuItem>
                <MenuItem value="Added to Folio">Added to Folio</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Voided">Voided</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Filter Actions */}
          <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1.5 flex-wrap">
            <button 
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                hasActiveFilters 
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                  : 'border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Clear sx={{ fontSize: 13 }} />
              Reset Filters
            </button>

            <button 
              onClick={handleExportCSV}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Download sx={{ fontSize: 14, color: '#6b7280' }} />
              Export
            </button>

            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition cursor-pointer shadow-2xs"
              title="Refresh charges from backend"
            >
              <Refresh sx={{ fontSize: 16 }} className={isRefreshing ? 'animate-spin text-[#1b7f43]' : ''} />
            </button>

            <button 
              onClick={() => {
                setPrefilledChargeData(null);
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1 text-xs font-bold rounded-lg text-white bg-[#1b7f43] hover:bg-[#166636] transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Add sx={{ fontSize: 16 }} />
              New Guest Charge
            </button>
          </div>

        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <Alert 
          severity="error" 
          action={
            <button onClick={() => fetchCharges(false)} className="text-xs font-bold underline cursor-pointer">
              Retry
            </button>
          }
        >
          {error}
        </Alert>
      )}

      {/* DATA TABLE */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-500">
            <CircularProgress size={32} sx={{ color: '#1b7f43', mb: 1.5 }} />
            <span className="text-xs font-medium">Loading live guest charges from backend...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Guest & Room</th>
                  <th className="py-2.5 px-3">Charge Details</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-center">Qty / Rate</th>
                  <th className="py-2.5 px-3 text-right">Total (PKR)</th>
                  <th className="py-2.5 px-3">Folio & Billing Ref</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {paginatedCharges.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      <Receipt sx={{ fontSize: 36, color: '#d1d5db', mb: 1 }} className="mx-auto block" />
                      <p className="text-xs font-medium">No guest charges found matching your criteria.</p>
                      <button 
                        onClick={() => {
                          setPrefilledChargeData(null);
                          setIsAddModalOpen(true);
                        }}
                        className="mt-2 text-xs font-bold text-[#1b7f43] hover:underline cursor-pointer"
                      >
                        + Create First Guest Charge
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedCharges.map((charge) => {
                    const activeCharge = activeMenuChargeId === charge.id;
                    return (
                      <tr 
                        key={charge.id} 
                        className={`hover:bg-gray-50/60 transition-colors ${charge.isVoided ? 'opacity-60 bg-gray-50/40' : ''}`}
                      >
                        {/* Guest & Room */}
                        <td className="py-2 px-3">
                          <div className="font-bold text-gray-900">{charge.guestName}</div>
                          <div className="text-[10.5px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <MeetingRoom sx={{ fontSize: 12, color: '#6b7280' }} />
                            <span>Room {charge.roomNumber}</span>
                          </div>
                        </td>

                        {/* Charge Details */}
                        <td className="py-2 px-3 max-w-[240px]">
                          <div className="font-semibold text-gray-800 truncate" title={charge.itemName}>
                            {charge.itemName}
                          </div>
                          {charge.notes && (
                            <div className="text-[10.5px] text-gray-500 italic truncate mt-0.5" title={charge.notes}>
                              "{charge.notes}"
                            </div>
                          )}
                        </td>

                        {/* Charge Type */}
                        <td className="py-2 px-3">
                          {getTypeBadge(charge.chargeType)}
                        </td>

                        {/* Qty / Rate */}
                        <td className="py-2 px-3 text-center">
                          <span className="font-medium text-gray-700">{charge.quantity}</span>
                          <span className="text-[10px] text-gray-400 block">@ Rs. {Number(charge.unitPrice || 0).toLocaleString()}</span>
                        </td>

                        {/* Total Amount */}
                        <td className="py-2 px-3 text-right">
                          <span className={`font-bold font-mono text-xs ${charge.isVoided ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            Rs. {Number(charge.amount || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Folio & Billing Ref */}
                        <td className="py-2 px-3">
                          <div className="font-mono text-[10.5px] text-[#1b7f43] font-semibold">
                            {charge.folioId || '—'}
                          </div>
                          {charge.invoiceNumber && (
                            <span className="text-[10px] text-gray-400 font-mono block">
                              Inv: {charge.invoiceNumber}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-2 px-3">
                          {getStatusBadge(charge)}
                        </td>

                        {/* Date */}
                        <td className="py-2 px-3 text-[11px] text-gray-500 whitespace-nowrap">
                          {charge.date}
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip title="View Breakdown">
                              <IconButton 
                                size="small" 
                                onClick={() => setSelectedChargeForDetail(charge)}
                                sx={{ color: '#6b7280', '&:hover': { color: '#1b7f43' } }}
                              >
                                <Visibility sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleMenuClick(e, charge.id)}
                              sx={{ color: '#9ca3af' }}
                            >
                              <MoreVert sx={{ fontSize: 16 }} />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredCharges.length > 0 && (
          <div className="p-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredCharges.length)} to {Math.min(currentPage * itemsPerPage, filteredCharges.length)} of {filteredCharges.length} guest charges
            </span>
            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* CONTEXT MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: 160
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            const c = charges.find(item => item.id === activeMenuChargeId);
            setSelectedChargeForDetail(c);
            handleMenuClose();
          }}
          sx={{ fontSize: '12px', gap: 1 }}
        >
          <Visibility sx={{ fontSize: 15, color: '#1b7f43' }} />
          View Charge Details
        </MenuItem>

        {charges.find(item => item.id === activeMenuChargeId && !item.isVoided) && (
          <MenuItem 
            onClick={() => handleVoidCharge(activeMenuChargeId)}
            sx={{ fontSize: '12px', gap: 1, color: '#dc2626' }}
          >
            <Block sx={{ fontSize: 15, color: '#dc2626' }} />
            Void Charge (Remove from Folio)
          </MenuItem>
        )}
      </Menu>

      {/* ADD CHARGE MODAL */}
      <AddGuestChargeModal
        open={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setPrefilledChargeData(null);
        }}
        prefilledData={prefilledChargeData}
        onChargeAdded={() => {
          fetchCharges(false);
          setFeedbackMessage('Guest charge successfully posted to live folio and billing invoice.');
          setFeedbackSeverity('success');
          setRefreshToastOpen(true);
        }}
      />

      {/* CHARGE DETAIL MODAL */}
      <ChargeDetailModal
        open={Boolean(selectedChargeForDetail)}
        onClose={() => setSelectedChargeForDetail(null)}
        charge={selectedChargeForDetail}
        onChargeUpdated={() => {
          fetchCharges(false);
        }}
      />

      {/* TOAST NOTIFICATION */}
      <Snackbar
        open={refreshToastOpen}
        autoHideDuration={3000}
        onClose={() => setRefreshToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setRefreshToastOpen(false)} severity={feedbackSeverity} sx={{ width: '100%' }}>
          {feedbackMessage}
        </Alert>
      </Snackbar>

    </div>
  );
}
