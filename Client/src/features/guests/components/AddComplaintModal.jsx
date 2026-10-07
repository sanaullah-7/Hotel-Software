import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { Close, ReportProblemOutlined } from '@mui/icons-material';
import useModalFocus from '../../../components/common/useModalFocus';
import { complaintService } from '../../../services/complaintService';
import { toBackendComplaintPayload } from '../../front-office/adapters/complaintAdapter';
import { roomService } from '../../../services/roomService';

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
  'General'
];

export default function AddComplaintModal({
  isOpen,
  onClose,
  guest,
  defaultRoom,
  availableRooms = [],
  onSave
}) {
  const { dialogRef, titleId } = useModalFocus({ open: isOpen, onClose });
  const [form, setForm] = useState({
    type: 'Housekeeping',
    roomNo: defaultRoom || '',
    priority: 'Medium',
    description: ''
  });
  const [rooms, setRooms] = useState(availableRooms);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // If rooms weren't passed down, fetch them for authoritative room ID mapping
  useEffect(() => {
    if (availableRooms && availableRooms.length > 0) {
      setRooms(availableRooms);
      return;
    }
    let isMounted = true;
    roomService.getRooms()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.rooms || []);
        if (list.length > 0) setRooms(list);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [availableRooms]);

  // Keep roomNo synced if defaultRoom changes
  useEffect(() => {
    if (defaultRoom) {
      setForm((prev) => ({ ...prev, roomNo: defaultRoom }));
    }
  }, [defaultRoom]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;

    setIsSubmitting(true);
    setModalError(null);

    try {
      const canonicalGuestId = String(guest?._id || guest?.id || guest?.guestId || '').trim();
      if (!canonicalGuestId || !/^[0-9a-fA-F]{24}$/.test(canonicalGuestId)) {
        throw new Error('Valid registered guest ID is required to file a ticket.');
      }

      // Authoritative Room Lookup: resolve canonical room ObjectId if available
      let resolvedRoomId = null;
      if (form.roomNo && form.roomNo !== 'N/A' && Array.isArray(rooms) && rooms.length > 0) {
        const matchRoom = rooms.find((r) => {
          const rNum = String(r.room_number || r.roomNo || r.number || '').trim().toLowerCase();
          const target = String(form.roomNo).trim().toLowerCase();
          return rNum === target || r._id === form.roomNo;
        });
        if (matchRoom && /^[0-9a-fA-F]{24}$/.test(String(matchRoom._id))) {
          resolvedRoomId = matchRoom._id;
        }
      }

      const payload = toBackendComplaintPayload({
        guestId: canonicalGuestId,
        roomId: resolvedRoomId,
        category: form.type,
        severity: form.priority,
        description: form.description.trim()
      });

      const res = await complaintService.createComplaint(payload);
      const createdComplaint = res?.data?.data || res?.data || res;

      if (onSave) {
        await onSave(createdComplaint);
      }
      onClose();
    } catch (err) {
      console.error('Failed to create complaint:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        'Failed to submit ticket.';
      setModalError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const guestDisplayName = guest?.name || [guest?.firstName, guest?.lastName].filter(Boolean).join(' ') || 'Guest';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[540px] overflow-hidden flex flex-col border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ReportProblemOutlined sx={{ fontSize: 20 }} />
            <div>
              <h2 id={titleId} className="text-[16px] font-bold">New Guest Request / Complaint</h2>
              <p className="text-[11px] text-emerald-100 mt-0.5">Filing ticket for {guestDisplayName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Close sx={{ fontSize: 18 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {modalError && (
            <Alert severity="error" onClose={() => setModalError(null)} className="text-xs">
              {modalError}
            </Alert>
          )}

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
              label="Room Number"
              value={form.roomNo}
              placeholder="e.g. 101"
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
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>
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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#1b7f43] text-white font-semibold text-xs hover:brightness-105 transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
