import { useState, useMemo, useEffect } from 'react';
import {
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  FilterAltOff as FilterAltOffIcon,
  CleaningServices as CleaningServicesIcon,
  Event as EventIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Build as BuildIcon,
  EventBusy as EventBusyIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  MenuItem, 
  FormControl, 
  Select, 
  InputLabel,
  Button
} from '@mui/material';
import CreateGuestModal from '../components/CreateGuestModal';
import GuestDetailsModal from '../components/GuestDetailsModal';
import { getRoomByRoomNo } from '../../rooms/state/roomStore';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../reservations/state/reservationStore';
import { checkInBooking, checkOutBooking, OCCUPANCY_UPDATED_EVENT } from '../../reservations/state/reservationLifecycle';
import { resolveBookingReference } from '../../reservations/state/bookingRules';

const initialRooms = [
  { number: 101, type: 'Super Deluxe', floor: 1, status: 'OCCUPIED', statusColor: '#ef4444', bed: 'King Bed', adults: 2, children: 2, maxOccupancy: 4, price: 320, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'John Doe', vip: true, id: 'AB123CD456', checkIn: 'Aug 1', checkOut: 'Aug 7' }, note: 'VIP guest, prefers sea view rooms' },
  { number: 102, type: 'Deluxe', floor: 1, status: 'AVAILABLE', statusColor: '#1b7f43', bed: 'Queen Bed', adults: 2, children: 0, maxOccupancy: 3, price: 280, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: null },
  { number: 103, type: 'Standard', floor: 1, status: 'CLEANING', statusColor: '#3b82f6', bed: 'Double Bed', adults: 1, children: 0, maxOccupancy: 2, price: 180, housekeeping: 'Dirty', housekeepingColor: '#ef4444', amenities: ['wifi', 'ac'], guest: null, note: 'Recently checked out, requires housekeeping' },
  { number: 104, type: 'Deluxe', floor: 1, status: 'RESERVED', statusColor: '#f97316', bed: 'King Bed', adults: 2, children: 0, maxOccupancy: 3, price: 300, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'Jane Smith', vip: false, id: 'XY789YZ012', checkIn: null, checkOut: null } },
  { number: 105, type: 'Suite', floor: 1, status: 'MAINTENANCE', statusColor: '#8b5cf6', bed: 'King Bed', adults: 2, children: 1, maxOccupancy: 4, price: 450, housekeeping: 'Out of Order', housekeepingColor: '#6b7280', amenities: ['wifi', 'ac', 'bar', 'safe', 'gym', 'elevator'], guest: null },
  { number: 106, type: 'Suite', floor: 1, status: 'BOOKED', statusColor: '#f59e0b', bed: 'Queen Bed', adults: 2, children: 2, maxOccupancy: 4, price: 420, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'Emily Brown', vip: false, id: 'EM456BR789', checkIn: null, checkOut: null } },
];

const attachCanonicalRoomIds = (rooms) => rooms.map((room) => {
  if (room.roomId !== undefined && room.roomId !== null && room.roomId !== '') return room;
  const canonicalRoom = getRoomByRoomNo(room.number ?? room.roomNo ?? room.id);
  return canonicalRoom ? { ...room, roomId: canonicalRoom.id } : room;
});

const statusIcon = { 
  OCCUPIED: <PersonIcon sx={{ fontSize: 14 }} />, 
  AVAILABLE: <CheckCircleIcon sx={{ fontSize: 14 }} />, 
  CLEANING: <CleaningServicesIcon sx={{ fontSize: 14 }} />, 
  RESERVED: <EventIcon sx={{ fontSize: 14 }} />, 
  MAINTENANCE: <BuildIcon sx={{ fontSize: 14 }} />, 
  BOOKED: <EventBusyIcon sx={{ fontSize: 14 }} />,
  'OUT OF ORDER': <BlockIcon sx={{ fontSize: 14 }} />
};

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    fontSize: '11.5px',
    height: '28px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '0 6px',
    display: 'flex',
    alignItems: 'center',
    height: '28px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '11.5px',
    color: '#6b7280',
    transform: 'translate(10px, 5px) scale(1)',
    '&.Mui-focused': { color: '#1b7f43' }
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(10px, -8px) scale(0.75)',
  },
};

const dateFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    fontSize: '11px',
    height: '28px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiOutlinedInput-input': {
    padding: '0px 6px',
    boxSizing: 'border-box',
    height: '28px',
  },
  '& input::-webkit-calendar-picker-indicator': {
    cursor: 'pointer',
    opacity: 0.6,
    transition: '0.2s',
    filter: 'invert(30%) sepia(80%) saturate(1000%) hue-rotate(100deg)'
  },
  '& input::-webkit-calendar-picker-indicator:hover': {
    opacity: 1,
  }
};

const STATUS_OPTIONS = ['All Status', 'Available', 'Booked', 'Occupied', 'Cleaning', 'Maintenance', 'Out of Order', 'Reserved'];
const ROOM_TYPE_OPTIONS = ['All Types', 'Super Deluxe', 'Deluxe', 'Standard', 'Suite', 'Family Suite', 'Business Room'];
const FLOOR_OPTIONS = ['All Floors', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];
const BED_SIZE_OPTIONS = ['All Beds', 'King Bed', 'Queen Bed', 'Double Bed', 'Single Bed'];
const HOUSEKEEPING_OPTIONS = ['All Status', 'Clean', 'Dirty', 'Inspected', 'Out of Order'];

export default function Occupancy() {
  const [rooms, setRooms] = useState(() => {
    const savedRooms = localStorage.getItem('hotel_rooms');
    if (savedRooms) {
      try {
        const parsedRooms = JSON.parse(savedRooms);
        return Array.isArray(parsedRooms) ? attachCanonicalRoomIds(parsedRooms) : attachCanonicalRoomIds(initialRooms);
      } catch (e) {
        console.error('Error parsing rooms from local storage', e);
      }
    }
    return attachCanonicalRoomIds(initialRooms);
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [lifecycleError, setLifecycleError] = useState('');

  useEffect(() => {
    const sync = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
        if (Array.isArray(stored)) setRooms(attachCanonicalRoomIds(stored));
      } catch { /* Keep the last readable occupancy view. */ }
    };
    window.addEventListener(OCCUPANCY_UPDATED_EVENT, sync);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(OCCUPANCY_UPDATED_EVENT, sync);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [floorFilter, setFloorFilter] = useState('All Floors');
  const [bedFilter, setBedFilter] = useState('All Beds');
  const [hkFilter, setHkFilter] = useState('All Status');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const openModal = (room) => { setSelectedRoom(room); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedRoom(null); };

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const openDetailsModal = (room) => { setSelectedRoom(room); setDetailsModalOpen(true); };
  const closeDetailsModal = () => { setDetailsModalOpen(false); setSelectedRoom(null); };

  const handleEditGuest = () => setLifecycleError('Guest and stay details must be changed on the canonical reservation.');

  const handleSaveGuest = (updatedGuestData) => {
    if (!selectedRoom) return;
    const booking = resolveBookingReference(updatedGuestData.bookingRef, getReservations());
    if (!booking || String(booking.roomId) !== String(selectedRoom.roomId)) {
      setLifecycleError('Enter the exact reference for a canonical booking assigned to this room.');
      return;
    }
    try {
      checkInBooking(booking.id);
      setLifecycleError('');
      setModalOpen(false);
      setSelectedRoom(null);
    } catch (error) { setLifecycleError(error.message); }
  };

  const handleCheckoutGuest = () => {
    if (!selectedRoom) return;
    if (!selectedRoom.bookingId) {
      setLifecycleError('This occupancy has no safe canonical booking link and was preserved. Check out from Front Office only after linking it safely.');
      return;
    }
    try {
      checkOutBooking(selectedRoom.bookingId);
      setLifecycleError('');
      setDetailsModalOpen(false);
      setSelectedRoom(null);
    } catch (error) { setLifecycleError(error.message); }
  };

  const handleClear = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setTypeFilter('All Types');
    setFloorFilter('All Floors');
    setBedFilter('All Beds');
    setHkFilter('All Status');
    setCheckInDate('');
    setCheckOutDate('');
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          room.number.toString().includes(query) ||
          room.type.toLowerCase().includes(query) ||
          (room.guest && room.guest.name.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      // Status
      if (statusFilter !== 'All Status' && room.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      // Type
      if (typeFilter !== 'All Types' && room.type !== typeFilter) return false;
      // Floor
      if (floorFilter !== 'All Floors') {
        const floorNum = parseInt(floorFilter.replace('Floor', ''));
        if (room.floor !== floorNum) return false;
      }
      // Bed Size
      if (bedFilter !== 'All Beds' && room.bed !== bedFilter) return false;
      // Housekeeping
      if (hkFilter !== 'All Status' && room.housekeeping !== hkFilter) return false;

      return true;
    });
  }, [rooms, searchQuery, statusFilter, typeFilter, floorFilter, bedFilter, hkFilter]);

  return (
    <div className="animate-fade-in space-y-2.5 pb-3">
      {lifecycleError && (
        <div role="alert" className="mb-2 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
          {lifecycleError}
        </div>
      )}
      
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-0.5">
        <div className="bg-white p-2.5 sm:p-3 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{rooms.length}</div>
            <div className="text-xs text-gray-500 font-medium">Total Rooms</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <BedIcon sx={{ fontSize: 17 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{rooms.filter(r => r.status === 'AVAILABLE').length}</div>
            <div className="text-xs text-gray-500 font-medium">Available</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
            <CheckCircleIcon sx={{ fontSize: 17 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{rooms.filter(r => r.status === 'OCCUPIED').length}</div>
            <div className="text-xs text-gray-500 font-medium">Occupied</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600">
            <PersonIcon sx={{ fontSize: 17 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-[6px] shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{Math.round((rooms.filter(r => r.status === 'OCCUPIED').length / rooms.length) * 100)}%</div>
            <div className="text-xs text-gray-500 font-medium">Occupancy Rate</div>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
            <BarChartIcon sx={{ fontSize: 17 }} />
          </div>
        </div>
      </div>

      {/* ROOM CARDS & TABLE */}
      <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1">
        {/* Table Header with Filters */}
        <div className="p-2 sm:p-2.5 border-b border-gray-100">
          <div className="flex flex-wrap items-end gap-2 w-full">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search rooms, guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: 'text.secondary', ml: -0.5, mr: 0.5 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                minWidth: 125,
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: 160, md: 180 },
                '& .MuiInputBase-root': { height: '28px', backgroundColor: 'white', fontSize: '11.5px', borderRadius: '6px' },
                '& .MuiOutlinedInput-input': { padding: '0 8px' },
                '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
                '&:hover fieldset': { borderColor: '#9ca3af' },
                '& .Mui-focused fieldset': { borderColor: '#1b7f43 !important', borderWidth: '1.5px !important' }
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 85, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                {STATUS_OPTIONS.map(opt => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: 11.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {opt !== 'All Status' && statusIcon[opt.toUpperCase()]} {opt}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 90, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Room Type</InputLabel>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Room Type">
                {ROOM_TYPE_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 11.5 }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 80, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Floor</InputLabel>
              <Select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} label="Floor">
                {FLOOR_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 11.5 }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 80, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Bed Size</InputLabel>
              <Select value={bedFilter} onChange={(e) => setBedFilter(e.target.value)} label="Bed Size">
                {BED_SIZE_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 11.5 }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 95, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Housekeeping</InputLabel>
              <Select value={hkFilter} onChange={(e) => setHkFilter(e.target.value)} label="Housekeeping">
                {HOUSEKEEPING_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 11.5 }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>

            <div className="flex flex-col gap-0.5 flex-grow sm:flex-grow-0">
              <span className="text-[9.5px] font-semibold text-gray-500 pl-0.5">
                Check-in From
              </span>
              <TextField
                type="date"
                size="small"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                sx={{ minWidth: 110, ...dateFieldSx }}
              />
            </div>
            
            <div className="flex flex-col gap-0.5 flex-grow sm:flex-grow-0">
              <span className="text-[9.5px] font-semibold text-gray-500 pl-0.5">
                Check-out To
              </span>
              <TextField
                type="date"
                size="small"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                sx={{ minWidth: 110, ...dateFieldSx }}
              />
            </div>
            
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<FilterAltOffIcon sx={{ fontSize: 14 }} />}
              onClick={handleClear}
              sx={{
                height: '28px',
                textTransform: 'none',
                fontSize: '11px',
                minWidth: 65,
                px: 1.5,
                backgroundColor: 'white',
                borderRadius: '6px',
                borderColor: '#e5e7eb',
                color: '#ef4444',
                flexShrink: 0,
                '&:hover': { backgroundColor: '#fef2f2', borderColor: '#ef4444' }
              }}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-left border-collapse">
            <colgroup>
              <col className="w-[6%]" />
              <col className="w-[15%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none bg-slate-50/50">
                <th className="py-2 px-1.5 truncate">Room</th>
                <th className="py-2 px-1.5 truncate">Type & Floor</th>
                <th className="py-2 px-1.5 truncate">Bed</th>
                <th className="py-2 px-1.5 truncate">Occupancy</th>
                <th className="py-2 px-1.5 truncate">Price</th>
                <th className="py-2 px-1.5 truncate">Status</th>
                <th className="py-2 px-1.5 truncate">Housekeeping</th>
                <th className="py-2 px-1.5 truncate">Guest</th>
                <th className="py-2 px-1 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[11px]">
              {filteredRooms.map(room => (
                <tr
                  key={room.number}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  onClick={() => room.guest ? openDetailsModal(room) : openModal(room)}
                >
                  {/* Room Number */}
                  <td className="py-1.5 px-1.5 whitespace-nowrap">
                    <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-[10.5px] font-bold text-gray-800 border border-gray-200/60 font-mono">
                      {room.number}
                    </span>
                  </td>

                  {/* Type & Floor */}
                  <td className="py-1.5 px-1.5">
                    <div className="text-[11px] font-bold text-gray-800 leading-tight truncate" title={room.type}>
                      {room.type}
                    </div>
                    <div className="text-[9.5px] text-gray-400 font-normal leading-tight">
                      Floor {room.floor}
                    </div>
                  </td>

                  {/* Bed */}
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate" title={room.bed}>
                    {room.bed}
                  </td>

                  {/* Occupancy */}
                  <td className="py-1.5 px-1.5 text-[10.5px] text-gray-600">
                    <div className="flex items-center gap-1 min-w-0" title={`${room.adults} Adult${room.adults !== 1 ? 's' : ''}${room.children > 0 ? `, ${room.children} Child` : ''}`}>
                      <PersonIcon sx={{ fontSize: 13, color: '#9ca3af' }} className="shrink-0" />
                      <span className="truncate">
                        {room.adults} Adult{room.adults !== 1 ? 's' : ''}{room.children > 0 ? `, ${room.children} Ch` : ''}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                    <span className="font-bold text-gray-800">${room.price}</span>
                    <span className="text-[9.5px] text-gray-400 font-normal">/nt</span>
                  </td>

                  {/* Status */}
                  <td className="py-1.5 px-1.5 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] whitespace-nowrap shrink-0 border"
                      style={{
                        backgroundColor: room.status === 'AVAILABLE' ? '#dcfce7' : room.status === 'OCCUPIED' ? '#fee2e2' : room.status === 'CLEANING' ? '#dbeafe' : room.status === 'RESERVED' ? '#fef3c7' : '#f1f5f9',
                        color: room.status === 'AVAILABLE' ? '#16a34a' : room.status === 'OCCUPIED' ? '#dc2626' : room.status === 'CLEANING' ? '#2563eb' : room.status === 'RESERVED' ? '#d97706' : '#475569',
                        borderColor: room.status === 'AVAILABLE' ? '#bbf7d0' : room.status === 'OCCUPIED' ? '#fecaca' : room.status === 'CLEANING' ? '#bfdbfe' : room.status === 'RESERVED' ? '#fde68a' : '#e2e8f0'
                      }}
                    >
                      {statusIcon[room.status.toUpperCase()] && (
                        <span className="shrink-0 flex items-center">{statusIcon[room.status.toUpperCase()]}</span>
                      )}
                      <span>{room.status}</span>
                    </span>
                  </td>

                  {/* Housekeeping */}
                  <td className="py-1.5 px-1.5 text-[10.5px] whitespace-nowrap" style={{ color: room.housekeepingColor }}>
                    <div className="flex items-center gap-1 font-semibold truncate" title={room.housekeeping}>
                      <CleaningServicesIcon sx={{ fontSize: 12 }} className="shrink-0" />
                      <span className="truncate">{room.housekeeping}</span>
                    </div>
                  </td>

                  {/* Guest */}
                  <td className="py-1.5 px-1.5">
                    {room.guest ? (
                      <div className="flex items-center gap-1 font-semibold text-gray-800 text-[11px] min-w-0" title={room.guest.name}>
                        <PersonIcon sx={{ fontSize: 13, color: '#9ca3af' }} className="shrink-0" />
                        <span className="truncate">{room.guest.name}</span>
                      </div>
                    ) : (
                      <span className="text-[10.5px] text-gray-400 italic whitespace-nowrap">No Guest</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-1.5 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center">
                      {room.guest ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); openDetailsModal(room); }}
                          className="inline-flex items-center justify-center gap-1 text-white text-[10px] font-semibold px-2 py-0.5 rounded-[4px] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                          style={{ backgroundColor: '#1b7f43' }}
                        >
                          <VisibilityIcon sx={{ fontSize: 12 }} /> Details
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal(room); }}
                          className="inline-flex items-center justify-center gap-1 text-white text-[10px] font-semibold px-2 py-0.5 rounded-[4px] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
                          style={{ backgroundColor: '#1f3a4a' }}
                        >
                          <PersonAddIcon sx={{ fontSize: 12 }} /> Add Guest
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRooms.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-7 text-center text-gray-400 text-xs">
                    No rooms found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Pagination */}
        <div className="px-3 py-1.5 mt-auto flex items-center justify-between text-[11px] text-gray-600 border-t border-gray-100 bg-gray-50/40 rounded-b-[6px]">
          <span>Showing {filteredRooms.length} of {rooms.length} rooms</span>
          <div className="flex items-center gap-2 font-medium">
            <span className="text-gray-400 cursor-not-allowed">{'< Prev'}</span>
            <span className="cursor-pointer hover:text-gray-900 text-[#1b7f43]">{'Next >'}</span>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CreateGuestModal open={modalOpen} onClose={closeModal} onSave={handleSaveGuest} room={selectedRoom} />
      <GuestDetailsModal open={detailsModalOpen} onClose={closeDetailsModal} onEdit={handleEditGuest} onCheckout={handleCheckoutGuest} room={selectedRoom} />
    </div>
  );
}
