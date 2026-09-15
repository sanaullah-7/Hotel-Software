import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { TextField, MenuItem, Button, InputAdornment } from '@mui/material';
import CreateGuestModal from './CreateGuestModal';

const rooms = [
  { number: 101, type: 'Super Deluxe', floor: 1, status: 'OCCUPIED', statusColor: '#ef4444', bed: 'King Bed', adults: 2, children: 2, maxOccupancy: 4, price: 320, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'John Doe', vip: true, id: 'AB123CD456', checkIn: 'Aug 1', checkOut: 'Aug 7' }, note: 'VIP guest, prefers sea view rooms' },
  { number: 102, type: 'Deluxe', floor: 1, status: 'AVAILABLE', statusColor: '#1b7f43', bed: 'Queen Bed', adults: 2, children: 0, maxOccupancy: 3, price: 280, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: null },
  { number: 103, type: 'Standard', floor: 1, status: 'CLEANING', statusColor: '#3b82f6', bed: 'Double Bed', adults: 1, children: 0, maxOccupancy: 2, price: 180, housekeeping: 'Dirty', housekeepingColor: '#ef4444', amenities: ['wifi', 'ac'], guest: null, note: 'Recently checked out, requires housekeeping' },
  { number: 104, type: 'Deluxe', floor: 1, status: 'RESERVED', statusColor: '#f97316', bed: 'King Bed', adults: 2, children: 0, maxOccupancy: 3, price: 300, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'Jane Smith', vip: false, id: 'XY789YZ012', checkIn: null, checkOut: null } },
  { number: 105, type: 'Suite', floor: 1, status: 'MAINTENANCE', statusColor: '#8b5cf6', bed: 'King Bed', adults: 2, children: 1, maxOccupancy: 4, price: 450, housekeeping: 'Out of Order', housekeepingColor: '#6b7280', amenities: ['wifi', 'ac', 'bar', 'safe', 'gym', 'elevator'], guest: null },
  { number: 106, type: 'Suite', floor: 1, status: 'BOOKED', statusColor: '#f59e0b', bed: 'Queen Bed', adults: 2, children: 2, maxOccupancy: 4, price: 420, housekeeping: 'Clean', housekeepingColor: '#1b7f43', amenities: ['wifi', 'ac', 'bar'], guest: { name: 'Emily Brown', vip: false, id: 'EM456BR789', checkIn: null, checkOut: null } },
];

const statusIcon = { OCCUPIED: <PersonIcon sx={{ fontSize: 13 }} />, AVAILABLE: <CheckCircleIcon sx={{ fontSize: 13 }} />, CLEANING: <CleaningServicesIcon sx={{ fontSize: 13 }} />, RESERVED: <Event sx={{ fontSize: 13 }} />, MAINTENANCE: <BuildIcon sx={{ fontSize: 13 }} />, BOOKED: <EventBusyIcon sx={{ fontSize: 13 }} /> };

export default function Occupancy() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const openModal = (room) => { setSelectedRoom(room); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedRoom(null); };

  return (
    <div className="animate-fade-in pb-8 space-y-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Occupancy</h1>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#eef0ff] text-[#5c67f2] mr-4 shrink-0"><BedIcon /></div>
          <div><div className="text-2xl font-bold text-gray-900 leading-none mb-1">20</div><div className="text-[13px] text-gray-500 font-medium">Total Rooms</div></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#eaf7ee] text-[#1b7f43] mr-4 shrink-0"><CheckCircleIcon /></div>
          <div><div className="text-2xl font-bold text-gray-900 leading-none mb-1">10</div><div className="text-[13px] text-gray-500 font-medium">Available</div></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#fce8e8] text-[#e53935] mr-4 shrink-0"><PersonIcon /></div>
          <div><div className="text-2xl font-bold text-gray-900 leading-none mb-1">7</div><div className="text-[13px] text-gray-500 font-medium">Occupied</div></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#eaf3fd] text-[#1976d2] mr-4 shrink-0"><BarChartIcon /></div>
          <div><div className="text-2xl font-bold text-gray-900 leading-none mb-1">35%</div><div className="text-[13px] text-gray-500 font-medium">Occupancy Rate</div></div>
        </div>
      </div>

      {/* SEARCH AND FILTERS ROW */}
      <div className="flex flex-wrap xl:flex-nowrap gap-2 mt-6 items-center w-full">
        <TextField
          variant="outlined" size="small" placeholder="Search..."
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary', ml: -0.5, mr: 0.5 }} /></InputAdornment> }}
          sx={{ minWidth: 160, flexGrow: 1, '& .MuiInputBase-root': { height: '32px', backgroundColor: 'white', fontSize: '12px' }, '& .MuiOutlinedInput-input': { padding: '0 8px' } }}
        />
        {[
          { label: 'Status', minWidth: 90, items: ['All Status'] },
          { label: 'Room Type', minWidth: 100, items: ['All Types'] },
          { label: 'Floor', minWidth: 90, items: ['All Floors'] },
          { label: 'Bed Size', minWidth: 105, items: ['All Beds'] },
          { label: 'Housekeeping', minWidth: 115, items: ['All Status'] },
        ].map(f => (
          <TextField key={f.label} select size="small" label={f.label} defaultValue="all"
            sx={{ minWidth: f.minWidth, '& .MuiInputBase-root': { height: '32px', backgroundColor: 'white', fontSize: '12px' }, '& .MuiSelect-select': { padding: '0 24px 0 8px !important', display: 'flex', alignItems: 'center' }, '& .MuiInputLabel-root': { fontSize: '13px', top: '-5px' }, '& .MuiInputLabel-shrink': { top: '0px' } }}
          >
            <MenuItem value="all" sx={{ fontSize: 12 }}>{f.items[0]}</MenuItem>
          </TextField>
        ))}
        <TextField type="date" size="small" label="Check-in From" InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140, '& .MuiInputBase-root': { height: '32px', backgroundColor: 'white' }, '& .MuiOutlinedInput-input': { padding: '0px 8px', fontSize: '12px', height: '32px', boxSizing: 'border-box' }, '& .MuiInputLabel-root.MuiInputLabel-shrink': { fontSize: '11px', transform: 'translate(14px, -8px) scale(1)' } }}
        />
        <TextField type="date" size="small" label="Check-out To" InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140, '& .MuiInputBase-root': { height: '32px', backgroundColor: 'white' }, '& .MuiOutlinedInput-input': { padding: '0px 8px', fontSize: '12px', height: '32px', boxSizing: 'border-box' }, '& .MuiInputLabel-root.MuiInputLabel-shrink': { fontSize: '11px', transform: 'translate(14px, -8px) scale(1)' } }}
        />
        <Button variant="outlined" color="error" size="small" startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
          sx={{ height: '32px', textTransform: 'none', fontSize: '12px', minWidth: 75, px: 1, backgroundColor: 'white' }}
        >Clear</Button>
      </div>

      {/* ROOM CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
        {rooms.map(room => (
          <div key={room.number} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-none mb-0.5">{room.number}</h2>
                <p className="text-xs text-gray-400 font-medium">{room.type} · Floor {room.floor}</p>
              </div>
              <span className="flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: room.statusColor }}>
                {room.status}
              </span>
            </div>

            {/* Room Info Grid */}
            <div className="grid grid-cols-2 gap-y-2 text-[12px] text-gray-600 mb-3">
              <div className="flex items-center gap-1.5"><BedIcon sx={{ fontSize: 15, color: '#9ca3af' }} />{room.bed}</div>
              <div className="flex items-center gap-1.5"><PersonIcon sx={{ fontSize: 15, color: '#9ca3af' }} />{room.adults} Adult{room.adults !== 1 ? 's' : ''}{room.children > 0 ? `, ${room.children} Child` : ''} / {room.maxOccupancy}</div>
              <div className="flex items-center gap-1.5"><AttachMoneyIcon sx={{ fontSize: 15, color: '#9ca3af' }} /><span className="font-bold text-gray-800">${room.price}</span><span className="text-[10px] text-gray-400">/night</span></div>
              <div className="flex items-center gap-1.5" style={{ color: room.housekeepingColor }}>
                <CleaningServicesIcon sx={{ fontSize: 15 }} />{room.housekeeping}
              </div>
            </div>

            {/* Amenities */}
            <div className="flex gap-2 text-gray-300 mb-3">
              {room.amenities.includes('wifi') && <WifiIcon sx={{ fontSize: 16 }} />}
              {room.amenities.includes('ac') && <AcUnitIcon sx={{ fontSize: 16 }} />}
              {room.amenities.includes('bar') && <LocalBarIcon sx={{ fontSize: 16 }} />}
            </div>

            {/* Guest Info */}
            {room.guest && (
              <div className="bg-[#f4f6fc] rounded-lg p-2.5 border border-[#e5e7eb] mb-3 text-[12px]">
                <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-1">
                  <PersonIcon sx={{ fontSize: 14, color: '#5c67f2' }} />
                  {room.guest.name}
                  {room.guest.vip && <span className="bg-[#fef08a] text-[#854d0e] text-[9px] px-1.5 py-0.5 rounded font-bold ml-1">VIP</span>}
                </div>
                <div className="text-gray-400 text-[11px] flex items-center gap-1">
                  <span className="bg-white border border-gray-200 px-1 py-0.5 rounded text-[9px]">ID</span>
                  {room.guest.id}
                </div>
                {room.guest.checkIn && (
                  <div className="text-[#5c67f2] text-[11px] mt-1 flex items-center gap-1">
                    <EventIcon sx={{ fontSize: 13 }} />{room.guest.checkIn} → {room.guest.checkOut}
                  </div>
                )}
              </div>
            )}

            {/* Note */}
            {room.note && !room.guest && (
              <p className="text-[11px] text-gray-400 italic mb-3">{room.note}</p>
            )}
            {room.note && room.guest && (
              <p className="text-[11px] text-gray-400 italic mb-3">{room.note}</p>
            )}

            {/* Action Button */}
            <div className="mt-auto">
              {room.guest ? (
                <button
                  onClick={() => openModal(room)}
                  className="w-full flex items-center justify-center gap-2 text-white text-[13px] font-semibold py-2.5 rounded-lg transition-all"
                  style={{ backgroundColor: '#1b5e20', background: 'linear-gradient(135deg, #2e7d32, #1b5e20)' }}
                >
                  <VisibilityIcon sx={{ fontSize: 16 }} /> Guest Details
                </button>
              ) : (
                <button
                  onClick={() => openModal(room)}
                  className="w-full flex items-center justify-center gap-2 text-white text-[13px] font-semibold py-2.5 rounded-lg transition-all"
                  style={{ backgroundColor: '#1f3a4a', background: 'linear-gradient(135deg, #2c4a5a, #1f3a4a)' }}
                >
                  <PersonAddIcon sx={{ fontSize: 16 }} /> Add Guest
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE GUEST MODAL */}
      <CreateGuestModal open={modalOpen} onClose={closeModal} room={selectedRoom} />
    </div>
  );
}
