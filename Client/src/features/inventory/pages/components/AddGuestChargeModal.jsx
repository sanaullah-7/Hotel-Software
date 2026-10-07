import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  IconButton, TextField, MenuItem, FormControl, InputLabel, Select, Alert, CircularProgress
} from '@mui/material';
import { Close, Receipt } from '@mui/icons-material';
import guestChargeService from '../../../../services/guestChargeService';
import inventoryService from '../../../../services/inventoryService';
import { adaptInventoryItemToUI } from '../../adapters/inventoryAdapter';
import { getInventoryItems } from '../inventoryStore';
import { getReservations } from '../../../reservations/state/reservationStore';
import { isCheckedIn } from '../../../reservations/state/bookingRules';
import api from '../../../../api/client';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: 'var(--bg-paper)',
    fontSize: '12px',
    color: 'var(--text-primary)',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--primary-main)' }
  }
};

export default function AddGuestChargeModal({
  open,
  onClose,
  prefilledData = null,
  onChargeAdded
}) {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [activeStays, setActiveStays] = useState([]);
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    bookingId: '',
    guestId: '',
    guestName: '',
    roomNumber: '',
    chargeType: 'Consumption',
    selectedInventoryId: '',
    itemName: 'Coca-Cola (330ml Can)',
    quantity: 1,
    unitPrice: 150,
    status: 'Added to Folio',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setApiError('');

    // Synchronous initial load for instant rendering & test compatibility
    const initialItems = getInventoryItems();
    setInventoryItems(initialItems);

    const allBookings = getReservations();
    const active = allBookings.filter((b) => isCheckedIn(b));
    setActiveStays(active);

    let targetBooking = null;
    let ambiguityNotice = '';

    if (prefilledData) {
      // Explicit bookingId provided
      if (prefilledData.bookingId) {
        const found = active.find((b) => String(b.id) === String(prefilledData.bookingId));
        if (found) targetBooking = found;
      }

      // guestId provided (e.g. from GuestProfile)
      if (!targetBooking && prefilledData.guestId) {
        const forGuest = active.filter((b) => String(b.guestId) === String(prefilledData.guestId));
        if (forGuest.length === 1) {
          targetBooking = forGuest[0];
        } else if (forGuest.length > 1) {
          ambiguityNotice = 'This guest has multiple active stays. Please select the specific stay.';
        } else {
          ambiguityNotice = 'This guest has no active "Checked In" reservation.';
        }
      }

      // roomNumber / guestName provided (e.g. from MissingInventory)
      if (!targetBooking && prefilledData.roomNumber && !prefilledData.guestId) {
        const forRoom = active.filter((b) => {
          const bRoom = b.roomNo || b.roomNumber || (typeof b.room === 'string' && b.room.includes(' - ') ? b.room.split(' - ')[0] : b.room) || '';
          const roomMatch = String(bRoom).trim() === String(prefilledData.roomNumber).trim();
          if (!roomMatch) return false;
          if (prefilledData.guestName) {
            const bName = b.name || b.guestName || '';
            return bName.trim().toLowerCase() === prefilledData.guestName.trim().toLowerCase();
          }
          return true;
        });

        if (forRoom.length === 1) {
          targetBooking = forRoom[0];
        } else if (forRoom.length > 1) {
          ambiguityNotice = `Multiple active reservations found for Room ${prefilledData.roomNumber}. Please select the stay explicitly.`;
        } else {
          ambiguityNotice = `No active checked-in reservation found for Room ${prefilledData.roomNumber}.`;
        }
      }
    } else if (active.length === 1) {
      targetBooking = active[0];
    }

    setNotice(ambiguityNotice);

    const bRoom = targetBooking
      ? (targetBooking.roomNo || targetBooking.roomNumber || (typeof targetBooking.room === 'string' && targetBooking.room.includes(' - ') ? targetBooking.room.split(' - ')[0] : targetBooking.room) || '')
      : (prefilledData?.roomNumber || '');

    setFormData({
      bookingId: targetBooking ? targetBooking.id : (prefilledData?.bookingId || ''),
      guestId: targetBooking ? (targetBooking.guestId || '') : (prefilledData?.guestId || ''),
      guestName: targetBooking ? (targetBooking.name || targetBooking.guestName || 'Guest') : (prefilledData?.guestName || ''),
      roomNumber: bRoom,
      chargeType: prefilledData?.chargeType || 'Consumption',
      selectedInventoryId: prefilledData?.inventoryItemId || '',
      itemName: prefilledData?.itemName || 'Coca-Cola (330ml Can)',
      quantity: prefilledData?.quantity || 1,
      unitPrice: prefilledData?.unitPrice !== undefined ? prefilledData.unitPrice : 150,
      status: prefilledData?.status || 'Added to Folio',
      notes: prefilledData?.notes || ''
    });
    setErrors({});

    // Async background refresh from backend API
    inventoryService.getInventoryItems({ limit: 100 })
      .then((res) => {
        const rawItems = res?.data || [];
        const adapted = rawItems.map(adaptInventoryItemToUI).filter(Boolean);
        if (adapted.length > 0) setInventoryItems(adapted);
      })
      .catch(() => {});

    api.get('/hotel/reservations', { limit: 100 })
      .then((res) => {
        const rawRes = res?.data || [];
        if (Array.isArray(rawRes) && rawRes.length > 0) {
          const backendActive = rawRes
            .filter(r => r.status === 'CHECKED_IN' || r.status === 'Checked In' || isCheckedIn(r))
            .map(r => ({
              id: r._id || r.id,
              guestId: r.guest_id?._id || r.guest_id || r.primary_guest_id,
              name: r.guest_id?.first_name ? `${r.guest_id.first_name} ${r.guest_id.last_name || ''}`.trim() : (r.name || r.guestName || 'Guest'),
              roomNo: r.room_id?.room_number || r.room_number || r.roomNo || '—',
              roomNumber: r.room_id?.room_number || r.room_number || r.roomNo || '—',
              status: r.status
            }));
          if (backendActive.length > 0) {
            setActiveStays(backendActive);
          }
        }
      })
      .catch(() => {});
  }, [open, prefilledData]);

  const handleBookingSelect = (bookingId) => {
    if (!bookingId) {
      setFormData((prev) => ({
        ...prev,
        bookingId: '',
        guestId: '',
        guestName: '',
        roomNumber: ''
      }));
      return;
    }
    const target = activeStays.find((b) => String(b.id) === String(bookingId));
    if (target) {
      const bRoom = target.roomNo || target.roomNumber || (typeof target.room === 'string' && target.room.includes(' - ') ? target.room.split(' - ')[0] : target.room) || '';
      setFormData((prev) => ({
        ...prev,
        bookingId: target.id,
        guestId: target.guestId || '',
        guestName: target.name || target.guestName || 'Guest',
        roomNumber: bRoom
      }));
      setNotice('');
      if (errors.bookingId) {
        setErrors((prev) => ({ ...prev, bookingId: undefined }));
      }
    }
  };

  const handleChargeTypeChange = (type) => {
    setFormData((prev) => {
      let defaultItem = prev.itemName;
      let defaultPrice = prev.unitPrice;
      let defaultInvId = prev.selectedInventoryId;

      if (type === 'Consumption') {
        defaultItem = defaultItem || 'Minibar Beverage';
        if (defaultPrice === 0) defaultPrice = 150;
      } else if (type === 'Damage') {
        defaultItem = defaultItem || 'Damaged Hotel Linen';
        if (defaultPrice === 0) defaultPrice = 2500;
      } else if (type === 'External Order') {
        defaultItem = 'External Pizza / Food Order';
        defaultPrice = 2000;
        defaultInvId = '';
      } else if (type === 'Other') {
        defaultItem = 'Guest Laundry Service';
        defaultPrice = 1200;
        defaultInvId = '';
      }

      return {
        ...prev,
        chargeType: type,
        itemName: defaultItem,
        unitPrice: defaultPrice,
        selectedInventoryId: defaultInvId
      };
    });
  };

  const handleInventoryItemSelect = (itemId) => {
    if (!itemId) {
      setFormData((prev) => ({ ...prev, selectedInventoryId: '' }));
      return;
    }
    const item = inventoryItems.find((i) => i.id === itemId);
    if (item) {
      setFormData((prev) => ({
        ...prev,
        selectedInventoryId: item.id,
        itemName: item.itemName,
        unitPrice: item.unitPrice
      }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.bookingId && !formData.roomNumber) {
      errs.bookingId = 'An active checked-in stay or room number is required.';
    }
    if (!formData.itemName.trim()) errs.itemName = 'Item or charge description is required.';
    if (Number(formData.quantity) <= 0) errs.quantity = 'Quantity must be at least 1.';
    if (Number(formData.unitPrice) < 0) errs.unitPrice = 'Price cannot be negative.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError('');

    const totalAmount = (Number(formData.quantity) || 1) * (Number(formData.unitPrice) || 0);

    const chargePayload = {
      bookingId: formData.bookingId,
      reservation_id: formData.bookingId,
      guestId: formData.guestId || null,
      guest_id: formData.guestId || null,
      guestName: formData.guestName.trim(),
      roomNumber: formData.roomNumber,
      room_number: formData.roomNumber,
      chargeType: formData.chargeType,
      charge_type: formData.chargeType,
      itemName: formData.itemName.trim(),
      item_name: formData.itemName.trim(),
      quantity: Number(formData.quantity) || 1,
      unitPrice: Number(formData.unitPrice) || 0,
      unit_price: Number(formData.unitPrice) || 0,
      amount: totalAmount,
      description: `${formData.itemName.trim()} (${formData.chargeType})`,
      status: formData.status,
      date: 'Today',
      reportedDate: new Date().toISOString().split('T')[0],
      folioId: `FOL-${formData.roomNumber}`,
      notes: formData.notes.trim(),
      reference_id: prefilledData?.incidentId || prefilledData?.inventoryItemId || null
    };

    try {
      // 1. Save to Backend API (Posts to Folio & Invoice)
      await guestChargeService.createGuestCharge(chargePayload);

      window.dispatchEvent(new Event('guest_charges_update'));
      if (onChargeAdded) onChargeAdded();
      onClose();
    } catch (err) {
      console.error('Failed to post guest charge:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to post guest charge.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCalculated = (Number(formData.quantity) || 1) * (Number(formData.unitPrice) || 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }
      }}
    >
      <div className="bg-[#1b7f43] px-4 py-3 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Receipt sx={{ fontSize: 20 }} />
            <h2 className="text-base font-bold">Record Guest Folio Charge</h2>
          </div>
          <p className="text-[11px] text-white/80">Add consumption, damage, external order, or service charge to guest's folio</p>
        </div>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5, backgroundColor: '#f9fafb' }}>
          <div className="space-y-3">

            {apiError && (
              <Alert severity="error" sx={{ fontSize: '11.5px', py: 0.5 }}>
                {apiError}
              </Alert>
            )}

            {notice && (
              <Alert severity="warning" sx={{ fontSize: '11.5px', py: 0.5 }}>
                {notice}
              </Alert>
            )}

            {/* Active Stays Quick Select Bar */}
            {activeStays.length > 0 && (
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Quick Stay Select (Checked In):
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeStays.map((b) => {
                    const bRoom = b.roomNo || b.roomNumber || (typeof b.room === 'string' && b.room.includes(' - ') ? b.room.split(' - ')[0] : b.room) || '—';
                    const isSelected = formData.bookingId === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleBookingSelect(b.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#1b7f43] text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {b.name || b.guestName} (Rm {bRoom})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Stay Selector Dropdown */}
            <FormControl fullWidth size="small" sx={muiSelectSx} error={Boolean(errors.bookingId)}>
              <InputLabel id="active-stay-label">Active Stay (Checked In) *</InputLabel>
              <Select
                labelId="active-stay-label"
                label="Active Stay (Checked In) *"
                value={formData.bookingId}
                onChange={(e) => handleBookingSelect(e.target.value)}
              >
                <MenuItem value="">
                  <em>{activeStays.length === 0 ? 'No active checked-in stays found' : 'Select an active stay...'}</em>
                </MenuItem>
                {activeStays.map((b) => {
                  const bRoom = b.roomNo || b.roomNumber || (typeof b.room === 'string' && b.room.includes(' - ') ? b.room.split(' - ')[0] : b.room) || '—';
                  return (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name || b.guestName} — Room {bRoom} ({b.id})
                    </MenuItem>
                  );
                })}
              </Select>
              {errors.bookingId && (
                <p className="text-[11px] text-red-600 mt-1 pl-1">{errors.bookingId}</p>
              )}
            </FormControl>

            {/* Derived Guest Name & Room (Display snapshots) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <TextField
                label="Guest Name (From Stay)"
                size="small"
                value={formData.guestName || '—'}
                disabled
                sx={muiSelectSx}
                fullWidth
              />
              <TextField
                label="Room Number (From Stay)"
                size="small"
                value={formData.roomNumber ? `Room ${formData.roomNumber}` : '—'}
                disabled
                sx={muiSelectSx}
                fullWidth
              />
            </div>

            {/* Charge Type */}
            <div>
              <FormControl fullWidth size="small" sx={muiSelectSx}>
                <InputLabel>Charge Type *</InputLabel>
                <Select
                  label="Charge Type *"
                  value={formData.chargeType}
                  onChange={(e) => handleChargeTypeChange(e.target.value)}
                >
                  <MenuItem value="Consumption">Consumption (Minibar, Room Items, Snacks)</MenuItem>
                  <MenuItem value="Damage">Damage (Broken Item, Stained Linen, Property)</MenuItem>
                  <MenuItem value="External Order">External Order (Food Delivery, External Taxi, Concierge)</MenuItem>
                  <MenuItem value="Other">Other (Laundry, Extra Service, Late Checkout)</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Hotel Inventory Item (When Consumption or Damage) */}
            {(formData.chargeType === 'Consumption' || formData.chargeType === 'Damage') && (
              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-[10.5px] font-bold text-[#1b7f43] block mb-1.5">
                  Link to Hotel Inventory Stock (Auto-pricing):
                </span>
                <FormControl fullWidth size="small" sx={muiSelectSx}>
                  <InputLabel>Select Hotel Stock Item</InputLabel>
                  <Select
                    label="Select Hotel Stock Item"
                    value={formData.selectedInventoryId}
                    onChange={(e) => handleInventoryItemSelect(e.target.value)}
                  >
                    <MenuItem value="">Custom / Unlisted Item</MenuItem>
                    {inventoryItems.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.itemName} ({item.category}) — Rs. {item.unitPrice}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}

            {/* Item / Service Name Description */}
            <div>
              <TextField
                label="Item / Service Name *"
                size="small"
                value={formData.itemName}
                onChange={(e) => setFormData((prev) => ({ ...prev, itemName: e.target.value }))}
                error={Boolean(errors.itemName)}
                helperText={errors.itemName}
                sx={muiSelectSx}
                fullWidth
                placeholder="e.g., Minibar Red Bull, Damaged Lamp, Laundry"
              />
            </div>

            {/* Quantity & Unit Price */}
            <div className="grid grid-cols-2 gap-2.5">
              <TextField
                label="Quantity *"
                type="number"
                size="small"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                error={Boolean(errors.quantity)}
                helperText={errors.quantity}
                sx={muiSelectSx}
                fullWidth
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Unit Price (PKR) *"
                type="number"
                size="small"
                value={formData.unitPrice}
                onChange={(e) => setFormData((prev) => ({ ...prev, unitPrice: Math.max(0, parseFloat(e.target.value) || 0) }))}
                error={Boolean(errors.unitPrice)}
                helperText={errors.unitPrice}
                sx={muiSelectSx}
                fullWidth
                inputProps={{ min: 0, step: 'any' }}
              />
            </div>

            {/* Notes */}
            <div>
              <TextField
                label="Notes / Charge Justification"
                size="small"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                sx={muiSelectSx}
                fullWidth
                placeholder="e.g., Guest consumed 2 bottles from room 203 mini fridge; housekeeping confirmed."
              />
            </div>

            {/* Live Total Calculation Banner */}
            <div className="bg-white p-3 rounded-lg border border-gray-100 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block">
                  Total Folio Charge
                </span>
                <span className="text-[11px] text-gray-500">
                  {formData.quantity} x Rs. {Number(formData.unitPrice || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-[#1b7f43] font-mono">
                  Rs. {totalCalculated.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 block font-semibold">
                  Will Post to Guest's Open Folio & Invoice
                </span>
              </div>
            </div>

          </div>
        </DialogContent>

        <DialogActions sx={{ p: 2, backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', gap: 1 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !formData.bookingId}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#1b7f43] hover:bg-[#166636] transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <CircularProgress size={14} sx={{ color: 'white' }} />}
            Save & Add to Guest Folio
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
