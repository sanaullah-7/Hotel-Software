import React, { useState, useRef } from 'react';
import {
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  Bed as BedIcon,
  Groups as GroupsIcon,
  Receipt as ReceiptIcon,
  Badge as BadgeIcon,
  CloudUpload as CloudUploadIcon,
  Assignment as AssignmentIcon,
  VpnKey as VpnKeyIcon,
  CleaningServices as CleaningServicesIcon
} from '@mui/icons-material';
import { avatarUrl } from './CheckInOutTable';

export function GuestFormModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState(() => {
    if (initialData) {
      const [firstName, ...rest] = (initialData.name || '').split(' ');
      return {
        ...initialData,
        firstName: firstName || '',
        lastName: rest.join(' ') || '',
        guestCount: initialData.guestCount || '1',
        idType: initialData.idType || 'Passport',
        status: initialData.status || 'Pending'
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bookingId: '',
      room: '',
      roomType: 'Standard',
      roomFloor: '',
      checkIn: '',
      checkOut: '',
      guestCount: '1',
      specialRequests: '',
      idType: 'Passport',
      idNumber: '',
      status: 'Pending'
    };
  });
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDocuments((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setDocuments((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeDocument = (index, e) => {
    e.stopPropagation();
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.room.trim()) return;
    onSave({ ...form, name: `${form.firstName} ${form.lastName}`.trim(), documents });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[650px] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
              <img
                src={avatarUrl(initialData ? initialData.name : 'New')}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-white text-[15px] font-bold leading-tight">
              {initialData ? `Edit ${initialData.name}` : 'New Check-in/out Record'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Row 1 */}
            <TextField
              fullWidth
              label="First Name*"
              variant="outlined"
              size="small"
              value={form.firstName}
              onChange={(e) => set('firstName')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Last Name*"
              variant="outlined"
              size="small"
              value={form.lastName}
              onChange={(e) => set('lastName')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PersonIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />

            {/* Row 2 */}
            <TextField
              fullWidth
              label="Email*"
              variant="outlined"
              size="small"
              value={form.email}
              onChange={(e) => set('email')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <EmailIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Phone*"
              variant="outlined"
              size="small"
              value={form.phone}
              onChange={(e) => set('phone')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PhoneIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />

            {/* Row 3 */}
            <TextField
              fullWidth
              label="Booking ID"
              variant="outlined"
              size="small"
              value={form.bookingId}
              onChange={(e) => set('bookingId')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ConfirmationNumberIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Room No*"
              variant="outlined"
              size="small"
              value={form.room}
              onChange={(e) => set('room')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <BedIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />

            {/* Row 4 */}
            <FormControl fullWidth size="small">
              <InputLabel>Room Type*</InputLabel>
              <MuiSelect
                label="Room Type*"
                value={form.roomType}
                onChange={(e) => set('roomType')(e.target.value)}
              >
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Deluxe">Deluxe</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
                <MenuItem value="Executive">Executive</MenuItem>
              </MuiSelect>
            </FormControl>
            <TextField
              fullWidth
              label="Room Floor"
              variant="outlined"
              size="small"
              value={form.roomFloor}
              onChange={(e) => set('roomFloor')(e.target.value)}
            />

            {/* Row 5 */}
            <Box>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                Check-in Date
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="date"
                value={form.checkIn}
                onChange={(e) => set('checkIn')(e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                Check-out Date
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="date"
                value={form.checkOut}
                onChange={(e) => set('checkOut')(e.target.value)}
              />
            </Box>

            {/* Row 6 */}
            <TextField
              fullWidth
              label="Guest Count"
              variant="outlined"
              size="small"
              value={form.guestCount}
              onChange={(e) => set('guestCount')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <GroupsIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Special Requests"
              variant="outlined"
              size="small"
              value={form.specialRequests}
              onChange={(e) => set('specialRequests')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ReceiptIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />

            {/* Row 7 */}
            <FormControl fullWidth size="small">
              <InputLabel>ID Type</InputLabel>
              <MuiSelect
                label="ID Type"
                value={form.idType}
                onChange={(e) => set('idType')(e.target.value)}
              >
                <MenuItem value="Passport">Passport</MenuItem>
                <MenuItem value="National ID">National ID</MenuItem>
                <MenuItem value="Driver's License">Driver's License</MenuItem>
              </MuiSelect>
            </FormControl>
            <TextField
              fullWidth
              label="ID Number"
              variant="outlined"
              size="small"
              value={form.idNumber}
              onChange={(e) => set('idNumber')(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <BadgeIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                )
              }}
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="text-[12px] font-semibold text-gray-500 block mb-2">
              Document Upload
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-[var(--primary-main)] bg-emerald-50/50'
                  : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              <CloudUploadIcon
                className={
                  isDragging
                    ? 'text-[var(--primary-main)] mb-2'
                    : 'text-gray-400 mb-2'
                }
                sx={{ fontSize: 32 }}
              />
              <span className="text-[var(--primary-main)] text-[13px] font-bold">
                Click to upload documents or drag and drop
              </span>
              <span className="text-gray-400 text-[11px] mt-1">
                Supports JPG, PNG, PDF, DOC, DOCX (Max 5MB each)
              </span>
            </div>

            {documents.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {documents.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ReceiptIcon
                        sx={{ fontSize: 16 }}
                        className="text-[var(--primary-main)] shrink-0"
                      />
                      <span className="text-[12px] font-medium text-gray-700 truncate">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => removeDocument(idx, e)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors cursor-pointer shrink-0"
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="relative">
            <FormControl fullWidth size="small">
              <InputLabel>Status*</InputLabel>
              <MuiSelect
                label="Status*"
                value={form.status}
                onChange={(e) => set('status')(e.target.value)}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Checked In">Checked In</MenuItem>
                <MenuItem value="Checked Out">Checked Out</MenuItem>
                <MenuItem value="Reserved">Reserved</MenuItem>
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-start gap-4 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!form.firstName.trim() || !form.room.trim()}
            className="px-6 py-2 rounded-full bg-[#e2e8f0] text-gray-400 text-[13px] font-bold disabled:opacity-70 transition-colors"
            style={
              form.firstName.trim() && form.room.trim()
                ? { backgroundColor: 'var(--primary-main)', color: 'white' }
                : {}
            }
          >
            {initialData ? 'Update Record' : 'Save Record'}
          </button>
          <button
            onClick={onClose}
            className="text-red-500 text-[13px] font-bold hover:text-red-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function CheckInActionModal({ guest, onClose, onComplete }) {
  const [idVerification, setIdVerification] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [roomKey, setRoomKey] = useState('');

  const isReady = idVerification && paymentStatus && roomKey.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between shrink-0">
          <h2 className="text-white text-[15px] font-bold leading-tight">Check-in Guest</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Welcome Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <h3 className="text-[var(--primary-main)] text-[14px] font-bold mb-1">
              Welcome, {guest.name}
            </h3>
            <span className="text-gray-500 text-[12px] font-medium leading-relaxed">
              Booking ID: {guest.id}
            </span>
            <span className="text-gray-500 text-[12px] font-medium leading-relaxed">
              Room {guest.room} ({guest.roomType})
            </span>
          </div>

          {/* Verify Information Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center shrink-0 shadow-sm">
                <AssignmentIcon className="text-white" sx={{ fontSize: 16 }} />
              </div>
              <h3 className="text-gray-900 text-[13px] font-bold">
                Verify Guest Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormControl fullWidth size="small">
                <InputLabel>ID Verification*</InputLabel>
                <MuiSelect
                  label="ID Verification*"
                  value={idVerification}
                  onChange={(e) => setIdVerification(e.target.value)}
                  className="bg-white"
                >
                  <MenuItem value="Passport Verified">Passport Verified</MenuItem>
                  <MenuItem value="ID Card Verified">ID Card Verified</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </MuiSelect>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status*</InputLabel>
                <MuiSelect
                  label="Payment Status*"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="bg-white"
                >
                  <MenuItem value="Paid in Full">Paid in Full</MenuItem>
                  <MenuItem value="Card Pre-authorized">Card Pre-authorized</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </MuiSelect>
              </FormControl>
            </div>
          </div>

          {/* Room Assignment Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center shrink-0 shadow-sm">
                <VpnKeyIcon className="text-white" sx={{ fontSize: 16 }} />
              </div>
              <h3 className="text-gray-900 text-[13px] font-bold">Room Assignment</h3>
            </div>
            <TextField
              fullWidth
              label="Room Key/Card*"
              variant="outlined"
              size="small"
              value={roomKey}
              onChange={(e) => setRoomKey(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 pb-5 flex items-center justify-start gap-3 shrink-0 rounded-b-xl">
          <button
            onClick={() => onComplete(guest.id)}
            disabled={!isReady}
            className="px-5 py-2 rounded-full bg-[#e2e8f0] text-gray-400 text-[13px] font-bold disabled:opacity-70 transition-colors"
            style={isReady ? { backgroundColor: 'var(--primary-main)', color: 'white' } : {}}
          >
            Complete Check-in
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-gray-200 text-red-500 text-[13px] font-bold hover:bg-gray-50 transition-colors cursor-pointer bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function CheckOutActionModal({ guest, onClose, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [roomInspection, setRoomInspection] = useState('');

  const isReady = paymentMethod && roomInspection;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between shrink-0">
          <h2 className="text-white text-[15px] font-bold leading-tight">Check-out Guest</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Welcome Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <h3 className="text-[var(--primary-main)] text-[13px] font-bold mb-1">
              Checking Out, {guest.name}
            </h3>
            <span className="text-gray-500 text-[11px] font-medium leading-relaxed">
              Booking ID: {guest.id}
            </span>
            <span className="text-gray-500 text-[11px] font-medium leading-relaxed">
              Room {guest.room} ({guest.roomType})
            </span>
            <span className="text-gray-500 text-[11px] font-medium leading-relaxed">
              Stay: {guest.checkIn} - {guest.checkOut}
            </span>
          </div>

          {/* Final Billing Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center shrink-0 shadow-sm">
                <ReceiptIcon className="text-white" sx={{ fontSize: 16 }} />
              </div>
              <h3 className="text-gray-900 text-[13px] font-bold">Final Billing</h3>
            </div>

            <div className="bg-white border border-gray-100 rounded-md p-3 mb-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-[11px] font-medium">Room Charges:</span>
                <span className="text-gray-700 text-[12px] font-medium">$450.00</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-500 text-[11px] font-medium">Additional Services:</span>
                <span className="text-gray-700 text-[12px] font-medium">$75.50</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                <span className="text-[var(--primary-main)] text-[13px] font-bold">
                  Total Amount:
                </span>
                <span className="text-[var(--primary-main)] text-[14px] font-bold">$525.50</span>
              </div>
            </div>

            <FormControl fullWidth size="small">
              <InputLabel>Payment Method*</InputLabel>
              <MuiSelect
                label="Payment Method*"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Debit Card">Debit Card</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
              </MuiSelect>
            </FormControl>
          </div>

          {/* Room Condition Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center shrink-0 shadow-sm">
                <CleaningServicesIcon className="text-white" sx={{ fontSize: 16 }} />
              </div>
              <h3 className="text-gray-900 text-[13px] font-bold">Room Condition</h3>
            </div>
            <FormControl fullWidth size="small">
              <InputLabel>Room Inspection*</InputLabel>
              <MuiSelect
                label="Room Inspection*"
                value={roomInspection}
                onChange={(e) => setRoomInspection(e.target.value)}
                className="bg-white"
              >
                <MenuItem value="Cleared">Cleared (No Damages)</MenuItem>
                <MenuItem value="Damages Reported">Damages Reported</MenuItem>
                <MenuItem value="Pending Inspection">Pending Inspection</MenuItem>
              </MuiSelect>
            </FormControl>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 pb-5 flex items-center justify-start gap-3 shrink-0 rounded-b-xl">
          <button
            onClick={() => onComplete(guest.id)}
            disabled={!isReady}
            className="px-5 py-2 rounded-full bg-[#e2e8f0] text-gray-400 text-[12px] font-bold disabled:opacity-70 transition-colors"
            style={isReady ? { backgroundColor: 'var(--primary-main)', color: 'white' } : {}}
          >
            Complete Check-out
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full border border-gray-200 text-red-500 text-[12px] font-bold hover:bg-gray-50 transition-colors cursor-pointer bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestFormModal;
