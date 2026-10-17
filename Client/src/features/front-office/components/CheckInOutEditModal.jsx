import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select as MuiSelect,
  MenuItem,
  Box,
  Typography,
  CircularProgress
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
  CleaningServices as CleaningServicesIcon,
  WarningAmber as WarningIcon
} from '@mui/icons-material';
import billingService from '../../../services/billingService';
import inventoryService from '../../../services/inventoryService';
import { getInventoryItems } from '../../inventory/pages/inventoryStore';
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
  const [managerPasskey, setManagerPasskey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const isRoomDirty = guest.housekeepingStatus && !['CLEAN', 'INSPECTED', 'INSPECTING'].includes(guest.housekeepingStatus);
  const errorRequiresOverride = modalError && (
    modalError.toLowerCase().includes('dirty') ||
    modalError.toLowerCase().includes('override') ||
    modalError.toLowerCase().includes('housekeeping') ||
    modalError.toLowerCase().includes('cleanliness')
  );
  const needsManagerOverride = isRoomDirty || Boolean(errorRequiresOverride);

  const isReady = idVerification && paymentStatus && roomKey.trim() && (!needsManagerOverride || managerPasskey.trim().length > 0) && !submitting;

  const handleComplete = async () => {
    if (!isReady) return;
    if (needsManagerOverride && !managerPasskey.trim()) {
      setModalError('Manager Passkey is required to check in a room that is not clean.');
      return;
    }
    setSubmitting(true);
    setModalError('');
    try {
      await onComplete(guest, { 
        idVerification, 
        paymentStatus, 
        roomKey,
        manager_override: !!needsManagerOverride,
        override_cleanliness: !!needsManagerOverride,
        managerPasskey,
      });
    } catch (err) {
      setModalError(err?.message || 'Check-in failed. Please check room availability.');
      setSubmitting(false);
    }
  };

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
          {/* Modal Error Banner */}
          {modalError && (
            <div role="alert" className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              {modalError}
            </div>
          )}

          {/* Welcome Box */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-4 flex flex-col">
            <h3 className="text-[var(--primary-main)] text-[14px] font-bold mb-1">
              Welcome, {guest.name}
            </h3>
            <span className="text-gray-500 text-[12px] font-medium leading-relaxed">
              Booking ID: {guest.bookingId || guest.id}
            </span>
            <div className="flex items-center justify-between text-gray-500 text-[12px] font-medium leading-relaxed mt-1">
              <span>Room {guest.room} ({guest.roomType})</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                ['CLEAN', 'INSPECTED', 'INSPECTING'].includes(guest.housekeepingStatus)
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                HK: {guest.housekeepingStatus || 'CLEAN'}
              </span>
            </div>
          </div>

          {/* Cleanliness Gate Alert if Room is DIRTY or requires override */}
          {needsManagerOverride && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 space-y-2 text-amber-900 animate-fade-in shadow-sm">
              <div className="flex items-center gap-2">
                <WarningIcon className="text-amber-600" sx={{ fontSize: 20 }} />
                <span className="font-bold text-[13px] text-amber-900">
                  Room {guest.room} is currently {guest.housekeepingStatus || 'DIRTY'}
                </span>
              </div>
              <p className="text-[12px] text-amber-800 leading-relaxed">
                Cleanliness Gate Warning: Front-desk policy prohibits checking guests into uncleaned rooms. Require Manager Passkey to assign anyway?
              </p>
              <TextField
                fullWidth
                size="small"
                type="password"
                label="Manager Passkey / PIN*"
                placeholder="Enter manager passkey to override"
                value={managerPasskey}
                onChange={(e) => setManagerPasskey(e.target.value)}
                className="bg-white"
                autoFocus
              />
            </div>
          )}

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
                <InputLabel id="id-verification-label">ID Verification*</InputLabel>
                <MuiSelect
                  labelId="id-verification-label"
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
                <InputLabel id="payment-status-label">Payment Status*</InputLabel>
                <MuiSelect
                  labelId="payment-status-label"
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
            onClick={handleComplete}
            disabled={!isReady}
            className="px-5 py-2 rounded-full bg-[#e2e8f0] text-gray-400 text-[13px] font-bold disabled:opacity-70 transition-colors"
            style={isReady ? { backgroundColor: needsManagerOverride ? '#d97706' : 'var(--primary-main)', color: 'white' } : {}}
          >
            {submitting 
              ? 'Checking In...' 
              : (needsManagerOverride ? 'Authorize & Check In' : 'Complete Check-in')}
          </button>
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 rounded-full border border-gray-200 text-red-500 text-[13px] font-bold hover:bg-gray-50 transition-colors cursor-pointer bg-white disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function CheckOutActionModal({ guest, onClose, onComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [roomInspection, setRoomInspection] = useState('Cleared');
  const [damageType, setDamageType] = useState('');
  const [customDamageName, setCustomDamageName] = useState('');
  const [damageAmount, setDamageAmount] = useState('0');
  const [roomInventoryItems, setRoomInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [settlementMode, setSettlementMode] = useState('pay_now'); // 'pay_now' | 'override'
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // Live Folio & Invoicing State
  const [billingData, setBillingData] = useState({
    roomCharges: 0,
    servicesCharges: 0,
    totalAmount: 0,
    paidAmount: 0,
    balanceDue: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    const targetId = guest?.bookingId || guest?.id;
    if (!targetId) {
      setBillingData(prev => ({ ...prev, loading: false }));
      return;
    }

    Promise.all([
      billingService.getGuestCharges({ reservation_id: targetId }).catch(() => ({ data: [] })),
      billingService.getInvoices({ reservation_id: targetId }).catch(() => ({ data: [] })),
    ])
      .then(([chargesRes, invoicesRes]) => {
        if (!isMounted) return;
        const rawCharges = Array.isArray(chargesRes?.data?.charges)
          ? chargesRes.data.charges
          : Array.isArray(chargesRes?.data)
            ? chargesRes.data
            : [];
        const rawInvoices = Array.isArray(invoicesRes?.data?.invoices)
          ? invoicesRes.data.invoices
          : Array.isArray(invoicesRes?.data)
            ? invoicesRes.data
            : [];

        const activeInvoice = rawInvoices[0] || null;

        const roomRates = rawCharges
          .filter((c) => c.charge_type === 'ROOM_RATE')
          .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

        const otherServices = rawCharges
          .filter((c) => c.charge_type !== 'ROOM_RATE')
          .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

        const totalAmt = activeInvoice
          ? Number(activeInvoice.total_amount || 0)
          : (roomRates + otherServices);

        const paidAmt = activeInvoice ? Number(activeInvoice.amount_paid || 0) : 0;
        const dueAmt = Math.max(0, totalAmt - paidAmt);

        setBillingData({
          roomCharges: roomRates || (totalAmt - otherServices),
          servicesCharges: otherServices,
          totalAmount: totalAmt,
          paidAmount: paidAmt,
          balanceDue: dueAmt,
          loading: false,
        });
      })
      .catch(() => {
        if (isMounted) setBillingData(prev => ({ ...prev, loading: false }));
      });

    return () => { isMounted = false; };
  }, [guest]);

  // Fetch dynamic in-room stock for the guest's specific room
  useEffect(() => {
    let isMounted = true;
    const roomNo = String(guest?.room || '').replace(/^Room\s*/i, '').trim();
    if (!roomNo) {
      setRoomInventoryItems([]);
      setDamageType('Other');
      return;
    }

    setInventoryLoading(true);
    inventoryService.getInventoryItems({ room_number: roomNo })
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data?.items)
          ? res.data.items
          : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));

        let items = list.map((item) => ({
          id: item._id || item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unitCost: Number(item.unit_cost || item.unitPrice || 0),
        }));

        // Fallback to local inventory cache if backend returns empty
        if (items.length === 0) {
          const localItems = getInventoryItems();
          const matched = localItems.filter(i => 
            String(i.roomNumber || i.room_number || '').replace(/^Room\s*/i, '').trim() === roomNo ||
            String(i.location || '').toLowerCase().includes(`room ${roomNo.toLowerCase()}`)
          );
          if (matched.length > 0) {
            items = matched.map((i) => ({
              id: i.id || i._id,
              name: i.name,
              category: i.category,
              quantity: i.quantity,
              unitCost: Number(i.unitPrice || i.unit_cost || 0),
            }));
          }
        }

        setRoomInventoryItems(items);
        if (items.length > 0) {
          setDamageType(items[0].name);
          setDamageAmount(String(items[0].unitCost || 0));
        } else {
          setDamageType('Other');
          setDamageAmount('0');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        const localItems = getInventoryItems();
        const matched = localItems.filter(i => 
          String(i.roomNumber || i.room_number || '').replace(/^Room\s*/i, '').trim() === roomNo ||
          String(i.location || '').toLowerCase().includes(`room ${roomNo.toLowerCase()}`)
        );
        const items = matched.map((i) => ({
          id: i.id || i._id,
          name: i.name,
          category: i.category,
          quantity: i.quantity,
          unitCost: Number(i.unitPrice || i.unit_cost || 0),
        }));
        setRoomInventoryItems(items);
        if (items.length > 0) {
          setDamageType(items[0].name);
          setDamageAmount(String(items[0].unitCost || 0));
        } else {
          setDamageType('Other');
          setDamageAmount('0');
        }
      })
      .finally(() => {
        if (isMounted) setInventoryLoading(false);
      });

    return () => { isMounted = false; };
  }, [guest?.room]);

  const handleItemSelect = (e) => {
    const selected = e.target.value;
    setDamageType(selected);
    if (selected === 'Other') {
      setCustomDamageName('');
    } else {
      const found = roomInventoryItems.find((i) => i.name === selected);
      if (found && found.unitCost >= 0) {
        setDamageAmount(String(found.unitCost));
      }
    }
  };

  const addedDamage = roomInspection === 'Damages Reported' ? (Math.max(0, Number(damageAmount)) || 0) : 0;
  const currentTotal = billingData.totalAmount + addedDamage;
  const finalBalanceDue = Math.max(0, currentTotal - billingData.paidAmount);

  const isReady = (
    !!roomInspection &&
    !submitting &&
    (
      finalBalanceDue === 0 ||
      (settlementMode === 'pay_now' && isPaymentConfirmed && !!paymentMethod) ||
      (settlementMode === 'override' && overrideReason.trim().length > 0)
    )
  );

  const handleComplete = async () => {
    if (finalBalanceDue > 0) {
      if (settlementMode === 'pay_now' && !isPaymentConfirmed) {
        setModalError(`Dues of $${finalBalanceDue.toFixed(2)} are remaining. Please collect payment and check the confirmation box before checking out.`);
        return;
      }
      if (settlementMode === 'override' && !overrideReason.trim()) {
        setModalError(`Please provide an authorized manager override reason for checking out with unpaid dues.`);
        return;
      }
    }
    if (roomInspection === 'Damages Reported' && damageType === 'Other' && !customDamageName.trim()) {
      setModalError('Please describe the damage or missing item under description.');
      return;
    }
    if (!isReady) return;
    setSubmitting(true);
    setModalError('');
    try {
      const resolvedDamageName = (damageType === 'Other' || !damageType)
        ? (customDamageName.trim() || 'Room Damage / Loss')
        : damageType;

      await onComplete(guest, {
        paymentMethod: settlementMode === 'override' ? 'Manager Override' : (finalBalanceDue > 0 ? paymentMethod : 'Settled'),
        roomInspection,
        hasDamage: roomInspection === 'Damages Reported' && addedDamage > 0,
        damageItemName: resolvedDamageName,
        damageAmount: addedDamage,
        finalBalanceDue: settlementMode === 'override' ? 0 : finalBalanceDue,
        managerOverride: settlementMode === 'override',
        overrideReason: overrideReason.trim(),
      });
    } catch (err) {
      setModalError(err?.message || 'Check-out failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[440px] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white text-[15px] font-bold leading-tight">Check-out Guest</h2>
            <p className="text-white/80 text-[11px]">{guest.name} • Room {guest.room || '—'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Modal Error Banner */}
          {modalError && (
            <div role="alert" className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              {modalError}
            </div>
          )}

          {/* Stay Info */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-3 flex justify-between items-center text-[11.5px]">
            <div>
              <span className="text-gray-500 font-medium block">Stay Period</span>
              <span className="text-gray-800 font-bold">{guest.checkIn} → {guest.checkOut}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 font-medium block">Booking Ref</span>
              <span className="font-mono text-gray-700 font-bold">{guest.bookingId || guest.id}</span>
            </div>
          </div>

          {/* Room Condition & Inspection Box */}
          <div className="bg-white border border-gray-200 rounded-lg p-3.5 flex flex-col shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <CleaningServicesIcon sx={{ fontSize: 18, color: 'var(--primary-main)' }} />
              <h3 className="text-gray-900 text-[12.5px] font-bold">Room Inspection & Condition</h3>
            </div>
            <FormControl fullWidth size="small">
              <InputLabel id="room-inspection-label">Room Inspection Status*</InputLabel>
              <MuiSelect
                labelId="room-inspection-label"
                label="Room Inspection Status*"
                value={roomInspection}
                onChange={(e) => setRoomInspection(e.target.value)}
                className="bg-white text-xs"
              >
                <MenuItem value="Cleared">Cleared (No Damages / Clean)</MenuItem>
                <MenuItem value="Damages Reported">Damages or Missing Items Reported</MenuItem>
                <MenuItem value="Pending Inspection">Pending Inspection</MenuItem>
              </MuiSelect>
            </FormControl>

            {/* If Damages Reported: Add Damage/Missing Item Inputs */}
            {roomInspection === 'Damages Reported' && (
              <div className="mt-3 p-3 bg-rose-50/70 border border-rose-200 rounded-md space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between text-rose-800 text-[11px] font-bold">
                  <div className="flex items-center gap-1.5">
                    <WarningIcon sx={{ fontSize: 14 }} />
                    <span>Room {guest.room || '—'} Inventory & Damage Charge</span>
                  </div>
                  {inventoryLoading && <CircularProgress size={12} color="inherit" />}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <FormControl fullWidth size="small">
                    <InputLabel id="damage-type-label">Room Item / Damage*</InputLabel>
                    <MuiSelect
                      labelId="damage-type-label"
                      label="Room Item / Damage*"
                      value={damageType}
                      onChange={handleItemSelect}
                      className="bg-white text-xs"
                    >
                      {roomInventoryItems.length > 0 ? (
                        roomInventoryItems.map((item) => (
                          <MenuItem key={item.id || item.name} value={item.name}>
                            {item.name} {item.quantity ? `(Qty: ${item.quantity})` : ''} {item.unitCost > 0 ? `— $${item.unitCost}` : ''}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="" disabled>
                          <em>No stock items found for Room {guest.room || '—'}</em>
                        </MenuItem>
                      )}
                      <MenuItem value="Other">Other Custom Damage / Loss</MenuItem>
                    </MuiSelect>
                  </FormControl>

                  <TextField
                    size="small"
                    type="number"
                    label="Penalty / Charge ($)"
                    value={damageAmount}
                    onChange={(e) => setDamageAmount(e.target.value)}
                    inputProps={{ min: 0 }}
                    fullWidth
                    className="bg-white"
                  />
                </div>

                {(damageType === 'Other' || roomInventoryItems.length === 0) && (
                  <TextField
                    size="small"
                    label="Damage / Item Description*"
                    placeholder="e.g. Broken mirror, Stained carpet, Missing amenity"
                    value={customDamageName}
                    onChange={(e) => setCustomDamageName(e.target.value)}
                    fullWidth
                    className="bg-white"
                    required
                    error={damageType === 'Other' && !customDamageName.trim()}
                    helperText={damageType === 'Other' && !customDamageName.trim() ? "Please describe the damage or item" : ""}
                  />
                )}
              </div>
            )}
          </div>

          {/* Final Billing & Folio Settlement */}
          <div className="bg-[#f8f9fc] border border-emerald-100 rounded-lg p-3.5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ReceiptIcon sx={{ fontSize: 18, color: 'var(--primary-main)' }} />
                <h3 className="text-gray-900 text-[12.5px] font-bold">Folio Settlement & Billing</h3>
              </div>
              {billingData.loading && <CircularProgress size={14} color="success" />}
            </div>

            <div className="bg-white border border-gray-100 rounded-md p-3 mb-3 shadow-2xs space-y-1.5 text-[11.5px]">
              <div className="flex justify-between items-center text-gray-600">
                <span>Room Charges:</span>
                <span className="font-semibold text-gray-800">${Number(billingData.roomCharges).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Services / Orders / Meals:</span>
                <span className="font-semibold text-gray-800">${Number(billingData.servicesCharges).toFixed(2)}</span>
              </div>
              {addedDamage > 0 && (
                <div className="flex justify-between items-center text-rose-700 font-medium">
                  <span>Damages / Missing Items:</span>
                  <span className="font-bold">+${addedDamage.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-emerald-700">
                <span>Already Paid:</span>
                <span className="font-semibold">-${Number(billingData.paidAmount).toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-100 pt-2 flex justify-between items-center text-[13px] font-extrabold">
                <span className="text-gray-900">Balance to Settle:</span>
                <span className={finalBalanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {finalBalanceDue > 0 ? `$${finalBalanceDue.toFixed(2)}` : 'Settled ($0.00)'}
                </span>
              </div>
            </div>

            {/* Settlement & Zero-Balance Guard (Option B) */}
            {finalBalanceDue > 0 ? (
              <div className="space-y-3">
                {/* Dues Warning Toast/Alert Banner */}
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md flex items-start gap-2 text-rose-900 text-[11.5px]">
                  <WarningIcon sx={{ fontSize: 16, color: '#e11d48', mt: '1px', shrink: 0 }} />
                  <div>
                    <span className="font-bold block">Remaining Dues: ${finalBalanceDue.toFixed(2)}</span>
                    <span>Dues are remaining for this guest. Please settle the outstanding balance first before checking out, or authorize departure via manager override.</span>
                  </div>
                </div>

                {/* Settlement Mode Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlementMode('pay_now')}
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                      settlementMode === 'pay_now'
                        ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Collect & Settle Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettlementMode('override')}
                    className={`py-1.5 px-2 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                      settlementMode === 'override'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Manager Override
                  </button>
                </div>

                {settlementMode === 'pay_now' ? (
                  <div className="space-y-2.5 bg-white p-3 rounded-lg border border-gray-200 shadow-2xs">
                    <FormControl fullWidth size="small">
                      <InputLabel id="payment-method-label">Settlement Payment Method*</InputLabel>
                      <MuiSelect
                        labelId="payment-method-label"
                        label="Settlement Payment Method*"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="bg-white text-xs"
                      >
                        <MenuItem value="Cash">Cash</MenuItem>
                        <MenuItem value="Credit Card">Credit Card</MenuItem>
                        <MenuItem value="Debit Card">Debit Card</MenuItem>
                        <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                      </MuiSelect>
                    </FormControl>

                    <label className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded border border-emerald-100 text-[11.5px] text-gray-800 font-medium cursor-pointer hover:bg-emerald-50">
                      <input
                        type="checkbox"
                        checked={isPaymentConfirmed}
                        onChange={(e) => setIsPaymentConfirmed(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                      />
                      <span>Confirm Collection: <strong>${finalBalanceDue.toFixed(2)}</strong> paid via {paymentMethod}</span>
                    </label>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-900 text-[11.5px] font-bold">
                      <WarningIcon sx={{ fontSize: 15 }} />
                      <span>Authorized Departure with Unpaid Dues</span>
                    </div>
                    <p className="text-[10.5px] text-amber-800">
                      For corporate direct billing (city ledger) or GM approved deferred payment.
                    </p>
                    <TextField
                      size="small"
                      label="Manager Authorization Reason*"
                      placeholder="e.g. Billed to corporate monthly account, GM approved"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      fullWidth
                      className="bg-white"
                      error={!overrideReason.trim()}
                      helperText={!overrideReason.trim() ? "Authorization reason is required" : ""}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded text-center border border-emerald-200">
                Account is settled ($0.00). No outstanding dues for this stay.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-gray-50 flex items-center justify-between shrink-0 rounded-b-xl border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-[12px] font-semibold hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={!isReady}
            className="px-5 py-2 rounded-lg bg-[var(--primary-main)] text-white text-[12px] font-bold hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            {submitting ? (
              <>
                <CircularProgress size={14} color="inherit" />
                <span>Checking Out...</span>
              </>
            ) : (
              <span>Complete Check-out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GuestFormModal;
