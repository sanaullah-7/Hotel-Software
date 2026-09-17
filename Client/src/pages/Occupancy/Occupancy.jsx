import { useState, useMemo } from 'react';
import {
  Bed as BedIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  FilterAltOff as FilterAltOffIcon,
  CleaningServices as CleaningServicesIcon,
  AttachMoney as AttachMoneyIcon,
  Wifi as WifiIcon,
  AcUnit as AcUnitIcon,
  LocalBar as LocalBarIcon,
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
import React, { useState } from 'react';
import BedIcon from '@mui/icons-material/Bed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WifiIcon from '@mui/icons-material/Wifi';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import EventIcon from '@mui/icons-material/Event';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { TextField, MenuItem, Button, InputAdornment } from '@mui/material';
import CreateGuestModal from './CreateGuestModal';
import GuestDetailsModal from './GuestDetailsModal';

const initialRooms = [
  { number: 101, type: 'Super Deluxe', floor: 1, status: 'OCCUPIED', statusColor: '#ef4444', bed: 'King Bed', adults: 2, children: 2, maxOccupancy: 4, price: 320, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'John Doe', vip: true, id: 'AB123CD456', checkIn: 'Aug 1', checkOut: 'Aug 7' }, note: 'VIP guest, prefers sea view rooms' },
  { number: 102, type: 'Deluxe', floor: 1, status: 'AVAILABLE', statusColor: '#1b7f43', bed: 'Queen Bed', adults: 2, children: 0, maxOccupancy: 3, price: 280, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: null },
  { number: 103, type: 'Standard', floor: 1, status: 'CLEANING', statusColor: '#3b82f6', bed: 'Double Bed', adults: 1, children: 0, maxOccupancy: 2, price: 180, housekeeping: 'Dirty', housekeepingColor: '#ef4444', amenities: ['wifi', 'ac'], guest: null, note: 'Recently checked out, requires housekeeping' },
  { number: 104, type: 'Deluxe', floor: 1, status: 'RESERVED', statusColor: '#f97316', bed: 'King Bed', adults: 2, children: 0, maxOccupancy: 3, price: 300, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'Jane Smith', vip: false, id: 'XY789YZ012', checkIn: null, checkOut: null } },
  { number: 105, type: 'Suite', floor: 1, status: 'MAINTENANCE', statusColor: '#8b5cf6', bed: 'King Bed', adults: 2, children: 1, maxOccupancy: 4, price: 450, housekeeping: 'Out of Order', housekeepingColor: '#6b7280', amenities: ['wifi', 'ac', 'bar', 'safe', 'gym', 'elevator'], guest: null },
  { number: 106, type: 'Suite', floor: 1, status: 'BOOKED', statusColor: '#f59e0b', bed: 'Queen Bed', adults: 2, children: 2, maxOccupancy: 4, price: 420, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'Emily Brown', vip: false, id: 'EM456BR789', checkIn: null, checkOut: null } },
];

const statusIcon = { 
  OCCUPIED: <PersonIcon sx={{ fontSize: 16 }} />, 
  AVAILABLE: <CheckCircleIcon sx={{ fontSize: 16 }} />, 
  CLEANING: <CleaningServicesIcon sx={{ fontSize: 16 }} />, 
  RESERVED: <EventIcon sx={{ fontSize: 16 }} />, 
  MAINTENANCE: <BuildIcon sx={{ fontSize: 16 }} />, 
  BOOKED: <EventBusyIcon sx={{ fontSize: 16 }} />,
  'OUT OF ORDER': <BlockIcon sx={{ fontSize: 16 }} />
};

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
  },
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
  const [rooms, setRooms] = useState(initialRooms);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

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

  const handleEditGuest = () => {
    setDetailsModalOpen(false);
    setModalOpen(true);
  };

  const handleSaveGuest = (updatedGuestData) => {
    setRooms(prev => prev.map(r => 
      r.number === selectedRoom.number 
        ? { ...r, guest: { ...r.guest, ...updatedGuestData }, status: 'OCCUPIED', statusColor: '#ef4444' } 
        : r
    ));
    setModalOpen(false);
    setSelectedRoom(null);
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
        const floorNum = parseInt(floorFilter.replace('Floor ', ''));
        if (room.floor !== floorNum) return false;
      }
      // Bed Size
      if (bedFilter !== 'All Beds' && room.bed !== bedFilter) return false;
      // Housekeeping
      if (hkFilter !== 'All Status' && room.housekeeping !== hkFilter) return false;

      return true;
    });
  }, [searchQuery, statusFilter, typeFilter, floorFilter, bedFilter, hkFilter]);

  return (
    // FIX: removed the global `space-y-4` — it was auto-adding a margin-top to every
    // section, stacking on top of each section's own margin and making gaps inconsistent.
    // Each section below now controls its own top margin explicitly.
    <div className="animate-fade-in">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
        <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#eef0ff] text-[#5c67f2] mr-4 shrink-0"><BedIcon /></div>
          <div><div className="text-2xl font-bold text-gray-900 leading-none mb-1">{rooms.length}</div><div className="text-[13px] text-gray-500 font-medium">Total Rooms</div></div>
        </div>
        <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#eaf7ee] text-[#1b7f43] mr-4 shrink-0"><CheckCircleIcon /></div>
          <div><div className="text-2xl font-bold text-gray-900 leading-none mb-1">{rooms.filter(r => r.status === 'AVAILABLE').length}</div><div className="text-[13px] text-gray-500 font-medium">Available</div></div>
        </div>
        <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#fce8e8] text-[#e53935]   mr-4 shrink-0"><PersonIcon /></div>
          <div><div className="text-2xl font-bold text-gray-900 leading-none mb-1">{rooms.filter(r => r.status === 'OCCUPIED').length}</div><div className="text-[13px] text-gray-500 font-medium">Occupied</div></div>
        </div>
        <div className="bg-white p-5 rounded-[6px] shadow-sm border border-gray-100 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#eaf3fd] text-[#1976d2] mr-4 shrink-0"><BarChartIcon /></div>
          <div><div className="text-2xl font-bold text-gray-900 leading-none mb-1">{Math.round((rooms.filter(r => r.status === 'OCCUPIED').length / rooms.length) * 100)}%</div><div className="text-[13px] text-gray-500 font-medium">Occupancy Rate</div></div>
        </div>
      </div>

      {/* ROOM CARDS & TABLE */}
        <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5">
          {/* Table Header with Filters */}
          <div className="p-2.5 flex items-center justify-between border-b border-gray-100 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-nowrap items-end gap-2 shrink-0">
              
              <TextField
          variant="outlined" size="small" placeholder="Search rooms, guests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary', ml: -0.5, mr: 0.5 }} /></InputAdornment> }}
          sx={{ minWidth: 150, flexBasis: 140, maxWidth: 160, '& .MuiInputBase-root': { height: '32px', backgroundColor: 'white', fontSize: '12px', borderRadius: '8px' }, '& .MuiOutlinedInput-input': { padding: '0 8px' }, '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' }, '&:hover fieldset': { borderColor: '#9ca3af' }, '& .Mui-focused fieldset': { borderColor: '#1b7f43 !important', borderWidth: '1.5px !important' } }}
        />
        
        <FormControl size="small" sx={{ minWidth: 100, ...muiSelectSx }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {opt !== 'All Status' && statusIcon[opt.toUpperCase()]} {opt}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100, ...muiSelectSx }}>
          <InputLabel>Room Type</InputLabel>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Room Type">
            {ROOM_TYPE_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100, ...muiSelectSx }}>
          <InputLabel>Floor</InputLabel>
          <Select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} label="Floor">
            {FLOOR_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 100, ...muiSelectSx }}>
          <InputLabel>Bed Size</InputLabel>
          <Select value={bedFilter} onChange={(e) => setBedFilter(e.target.value)} label="Bed Size">
            {BED_SIZE_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 105, ...muiSelectSx }}>
          <InputLabel>Housekeeping</InputLabel>
          <Select value={hkFilter} onChange={(e) => setHkFilter(e.target.value)} label="Housekeeping">
            {HOUSEKEEPING_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>)}
          </Select>
        </FormControl>

        <div className="flex flex-col gap-0.1">
          <span className="text-[10px] font-semibold text-gray-500 pl-0.5">
            Check-in From
          </span>
          <TextField type="date" size="small"
            value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}
            sx={{ minWidth: 140, ...dateFieldSx }}
          />
        </div>
        <div className="flex flex-col gap-0.1">
          <span className="text-[10px] font-semibold text-gray-500 pl-0.5">
            Check-out To
          </span>
          <TextField type="date" size="small"
            value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)}
            sx={{ minWidth: 140, ...dateFieldSx }}
          />
        </div>
        <Button variant="outlined" color="error" size="small" startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
          onClick={handleClear}
          sx={{ height: '32px', textTransform: 'none', fontSize: '12px', minWidth: 75, px: 1, backgroundColor: 'white', borderRadius: '8px', borderColor: '#e5e7eb', color: '#ef4444', '&:hover': { backgroundColor: '#fef2f2', borderColor: '#ef4444' } }}
        >Clear</Button>
            </div>
            
          
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Room</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Type & Floor</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Bed</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Occupancy</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Price</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Status</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Housekeeping</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Guest</th>
                  <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRooms.map(room => (
                  <tr key={room.number} className="hover:bg-gray-50/30 transition-colors cursor-pointer" onClick={() => room.guest ? openDetailsModal(room) : openModal(room)}>
                    <td className="py-2 px-3 text-[13px] font-bold text-gray-900">{room.number}</td>
                    <td className="py-2 px-3">
                      <div className="text-[12px] font-bold text-gray-800">{room.type}</div>
                      <div className="text-[11px] text-gray-500">Floor {room.floor}</div>
                    </td>
                    <td className="py-2 px-3 text-[12px] text-gray-600">
                      <div className="flex items-center gap-1.5"> {room.bed}</div>
                    </td>
                    <td className="py-2 px-3 text-[12px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <PersonIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                        {room.adults} Adult{room.adults !== 1 ? 's' : ''}{room.children > 0 ? `, ${room.children} Child` : ''}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-[12px] text-gray-600">
                      <span className="font-bold text-gray-800">${room.price}</span><span className="text-[10px] text-gray-400">/night</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {room.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-[12px]" style={{ color: room.housekeepingColor }}>
                      <div className="flex items-center gap-1.5">
                        <CleaningServicesIcon sx={{ fontSize: 15 }} /> {room.housekeeping}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      {room.guest ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-[12px]">
                            <PersonIcon sx={{ fontSize: 14, color: '#5c67f2' }} />
                            {room.guest.name}
                          </div>

                        </div>
                      ) : (
                        <span className="text-[12px] text-gray-400 italic">No Guest</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center justify-center gap-2">
                        {room.guest ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); openDetailsModal(room); }}
                            className="flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold px-4 py-1.5 rounded-md transition-all cursor-pointer"
                            style={{ backgroundColor: '#1b5e20', background: 'linear-gradient(135deg, #2e7d32, #1b5e20)' }}
                          >
                            <VisibilityIcon sx={{ fontSize: 14 }} /> Details
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal(room); }}
                            className="flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold px-1.5 py-1.5 rounded-md transition-all cursor-pointer"
                            style={{ backgroundColor: '#1f3a4a', background: 'linear-gradient(135deg, #2c4a5a, #1f3a4a)' }}
                          >
                            <PersonAddIcon sx={{ fontSize: 14 }} /> Add Guest
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer Pagination */}
          <div className="p-3 mt-auto flex items-center justify-between text-[12px] text-gray-600 border-t border-gray-100 bg-gray-50/30 rounded-b-[6px]">
            <span>Showing {filteredRooms.length} of {rooms.length} rooms</span>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 cursor-not-allowed">{'< Prev'}</span>
              <span className="cursor-pointer hover:text-gray-900">{'Next >'}</span>
            </div>
          </div>
        </div>

        {/* MODALS */}
      <CreateGuestModal open={modalOpen} onClose={closeModal} onSave={handleSaveGuest} room={selectedRoom} />
      <GuestDetailsModal open={detailsModalOpen} onClose={closeDetailsModal} onEdit={handleEditGuest} room={selectedRoom} />
    </div>
  );
}