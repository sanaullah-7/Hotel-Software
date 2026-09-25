import React, { useState } from 'react';
import {
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Close, ReportProblemOutlined } from '@mui/icons-material';

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

const COMPLAINT_TYPES = [
  'Housekeeping',
  'Plumbing',
  'Electrical',
  'Air Conditioning',
  'Noise',
  'Room Service',
  'Amenities Request',
  'General / Front Desk'
];

export default function AddComplaintModal({ isOpen, onClose, guest, defaultRoom, onSave }) {
  const [form, setForm] = useState({
    type: 'Housekeeping',
    roomNo: defaultRoom || '101',
    priority: 'Medium',
    status: 'Open',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;

    onSave({
      id: Date.now(),
      guestName: guest.name,
      roomNo: form.roomNo,
      type: form.type,
      priority: form.priority,
      status: form.status,
      description: form.description.trim(),
      date: form.date
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[540px] overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ReportProblemOutlined sx={{ fontSize: 20 }} />
            <div>
              <h2 className="text-[16px] font-bold">New Guest Request / Complaint</h2>
              <p className="text-[11px] text-emerald-100 mt-0.5">Filing ticket for {guest.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Close sx={{ fontSize: 18 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormControl size="small" fullWidth sx={muiInputSx}>
              <InputLabel>Category / Type</InputLabel>
              <Select
                value={form.type}
                label="Category / Type"
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {COMPLAINT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              required
              label="Room Number"
              value={form.roomNo}
              onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
              sx={muiInputSx}
              size="small"
              fullWidth
            />

            <FormControl size="small" fullWidth sx={muiInputSx}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={form.priority}
                label="Priority"
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              sx={muiInputSx}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <TextField
            required
            label="Issue / Request Description"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Provide specific details about the guest's operational request or issue..."
            sx={muiInputSx}
            fullWidth
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#1b7f43] text-white font-semibold text-xs hover:brightness-105 transition shadow-xs cursor-pointer"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
