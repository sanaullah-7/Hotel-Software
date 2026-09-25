import React, { useState, useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Close } from '@mui/icons-material';

const muiInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    color: '#6b7280',
    '&.Mui-focused': { color: '#1b7f43' }
  }
};

export default function EditGuestModal({ isOpen, onClose, guest, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    totalStays: 0,
    status: 'Active'
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        city: guest.city || '',
        totalStays: guest.totalStays !== undefined ? guest.totalStays : 1,
        status: guest.status || 'Active'
      });
    }
  }, [guest]);

  if (!isOpen || !guest) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...guest,
      ...formData,
      totalStays: Number(formData.totalStays) || 0
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[580px] overflow-hidden flex flex-col border border-gray-100" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-white">
              Edit Guest Profile
            </h2>
            <p className="text-[11px] text-emerald-100 mt-0.5 font-mono">{guest.id} • {guest.name}</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center"
          >
            <Close sx={{ fontSize: 18 }} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField 
              required 
              label="Full Name" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              sx={muiInputSx} 
              size="small" 
              fullWidth 
            />
            <TextField 
              required 
              type="email"
              label="Email Address" 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              sx={muiInputSx} 
              size="small" 
              fullWidth 
            />
            <TextField 
              label="Phone Number" 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              sx={muiInputSx} 
              size="small" 
              fullWidth 
            />
            <TextField 
              label="City / Country" 
              value={formData.city} 
              onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
              sx={muiInputSx} 
              size="small" 
              fullWidth 
            />
            <TextField 
              type="number"
              label="Total Stays" 
              value={formData.totalStays} 
              onChange={(e) => setFormData({ ...formData, totalStays: e.target.value })} 
              sx={muiInputSx} 
              size="small" 
              fullWidth 
              inputProps={{ min: 0 }}
            />
            <FormControl size="small" fullWidth sx={muiInputSx}>
              <InputLabel>Status</InputLabel>
              <Select 
                value={formData.status} 
                label="Status" 
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="VIP">VIP</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 rounded-lg bg-[#1b7f43] text-white font-semibold text-xs hover:brightness-105 transition-all shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
