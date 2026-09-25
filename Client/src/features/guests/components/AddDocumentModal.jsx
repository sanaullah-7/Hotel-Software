import React, { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Close, DescriptionOutlined, UploadFileOutlined } from '@mui/icons-material';

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

const DOC_TYPES = [
  'CNIC / National ID',
  'Passport',
  'Driver License',
  'Registration Form',
  'Visa Copy',
  'Corporate ID',
  'Other Document'
];

export default function AddDocumentModal({ isOpen, onClose, guest, defaultRoom, onSave }) {
  const [form, setForm] = useState({
    name: 'National Identity / Passport Scan',
    idType: 'Passport',
    idNumber: '',
    room: defaultRoom || '101',
    status: 'Signed & Verified',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.idNumber.trim()) return;

    onSave({
      id: `DOC-${Date.now()}`,
      formNo: `REG-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      guest: guest.name,
      idType: form.idType,
      idNumber: form.idNumber.trim(),
      room: form.room,
      status: form.status,
      date: form.date,
      notes: form.notes
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
            <UploadFileOutlined sx={{ fontSize: 20 }} />
            <div>
              <h2 className="text-[16px] font-bold">Attach Identity / Registration Document</h2>
              <p className="text-[11px] text-emerald-100 mt-0.5">Uploading for {guest.name}</p>
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
              <InputLabel>Document Type</InputLabel>
              <Select
                value={form.idType}
                label="Document Type"
                onChange={(e) => setForm({ ...form, idType: e.target.value })}
              >
                {DOC_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              required
              label="Document / ID Number"
              value={form.idNumber}
              onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
              placeholder="e.g. 42101-1234567-1 or USA-987654"
              sx={muiInputSx}
              size="small"
              fullWidth
            />

            <TextField
              label="Document Title / Reference"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={muiInputSx}
              size="small"
              fullWidth
            />

            <TextField
              label="Allocated Room"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              sx={muiInputSx}
              size="small"
              fullWidth
            />

            <FormControl size="small" fullWidth sx={muiInputSx}>
              <InputLabel>Verification Status</InputLabel>
              <Select
                value={form.status}
                label="Verification Status"
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <MenuItem value="Signed & Verified">Signed & Verified</MenuItem>
                <MenuItem value="Pending Signature">Pending Signature</MenuItem>
                <MenuItem value="Uploaded (Unverified)">Uploaded (Unverified)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="Registration Date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              sx={muiInputSx}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <TextField
            label="Notes / Description"
            multiline
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Front desk verification or storage notes..."
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
              Save Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
