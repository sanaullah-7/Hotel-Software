import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Box, Typography } from '@mui/material';
import {
  Close, EditOutlined,
  CalendarTodayOutlined, PhoneOutlined, EmailOutlined,
  BusinessOutlined, PersonOutlined, MeetingRoomOutlined,
  GroupsOutlined, LocalOfferOutlined, AttachMoneyOutlined
} from '@mui/icons-material';
import { statusStyles } from '../data/groupReservationsDemoData';

const muiInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    color: '#64748b',
    '&.Mui-focused': { color: 'var(--primary-main)' }
  }
};

export default function GroupReservationModal({
  isModalOpen,
  editingId,
  form,
  setForm,
  setIsModalOpen,
  handleSaveModal,
  isDeleteModalOpen,
  groupToDelete,
  setIsDeleteModalOpen,
  handleDelete,
  isViewModalOpen,
  viewingGroup,
  setIsViewModalOpen,
  openEditModal
}) {
  return (
    <>
      {/* Edit/New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[17px] font-bold">
                {editingId ? `Edit Group Reservation ${form.groupName}` : 'New Group Reservation'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
                <TextField required label="Group Name" name="groupName" value={form.groupName} onChange={(e)=>setForm({...form, groupName: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={(e)=>setForm({...form, contactPerson: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                
                <TextField required label="Email" type="email" name="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required label="Phone" name="phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} sx={muiInputSx} size="small" fullWidth />

                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    Check In Date
                  </Typography>
                  <TextField
                    required
                    type="date"
                    label=""
                    name="checkIn"
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    sx={muiInputSx}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    Check Out Date
                  </Typography>
                  <TextField
                    required
                    type="date"
                    label=""
                    name="checkOut"
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    sx={muiInputSx}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <TextField required type="number" label="Number of Rooms" name="rooms" value={form.rooms} onChange={(e)=>setForm({...form, rooms: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required type="number" label="Number of Guests" name="guests" value={form.guests} onChange={(e)=>setForm({...form, guests: e.target.value})} sx={muiInputSx} size="small" fullWidth />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Room Types</InputLabel>
                  <Select name="roomTypes" value={form.roomTypes} label="Room Types" onChange={(e)=>setForm({...form, roomTypes: e.target.value})}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Delux">Delux</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select name="status" value={form.status} label="Status*" onChange={(e)=>setForm({...form, status: e.target.value})}>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                  </Select>
                </FormControl>

                <TextField label="Total Price" type="number" name="totalPrice" value={form.totalPrice} onChange={(e)=>setForm({...form, totalPrice: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                
                <TextField label="Special Requests" name="specialRequests" value={form.specialRequests} onChange={(e)=>setForm({...form, specialRequests: e.target.value})} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <button type="submit" disabled={!form.groupName || !form.contactPerson} className="px-5 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Save
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] p-6 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-left">Are you sure?</h3>
            <div className="text-left space-y-3 mb-8">
              <p className="text-sm text-gray-600 font-medium grid grid-cols-[100px_1fr]"><span className="text-gray-500">Group Name:</span> <span className="text-gray-800">{groupToDelete.groupName}</span></p>
              <p className="text-sm text-gray-600 font-medium grid grid-cols-[100px_1fr]"><span className="text-gray-500">Contact Person:</span> <span className="text-gray-800">{groupToDelete.contactPerson}</span></p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button onClick={handleDelete} className="px-5 py-2.5 rounded-full bg-[#c0392b] text-white font-bold text-sm hover:bg-[#a93226] transition-colors cursor-pointer">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 rounded-full bg-[#1b7f43] text-white font-bold text-sm hover:bg-[#156736] transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[var(--primary-main)] px-5 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-transparent flex items-center justify-center text-white text-xl font-bold">
                  {viewingGroup.groupName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white text-[20px] font-bold leading-tight">Group Reservations</h2>
                  <span className="text-white/80 text-[13px]">{viewingGroup.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewingGroup); }} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit"
                >
                  <EditOutlined sx={{ fontSize: 16 }} />
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <Close sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
            
            {/* Body Cards */}
            <div className="p-6 bg-white max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Group Name */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <BusinessOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Group Name</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.groupName}</span>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <PersonOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Contact Person</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.contactPerson}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <EmailOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.email}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <PhoneOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Phone</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.phone}</span>
                  </div>
                </div>

                {/* Check In */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarTodayOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check In</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.checkIn}</span>
                  </div>
                </div>

                {/* Check Out */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarTodayOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check Out</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.checkOut}</span>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <MeetingRoomOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Rooms</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.rooms}</span>
                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <GroupsOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Guests</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.guests}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <LocalOfferOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Status</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${statusStyles[viewingGroup.status]}`}>
                      {viewingGroup.status}
                    </span>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <AttachMoneyOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Price</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.totalPrice}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
