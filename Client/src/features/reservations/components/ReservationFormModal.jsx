import React, { useRef, useState, useEffect } from 'react';
import { Close, CloudUpload, DeleteOutlined, ImageOutlined } from '@mui/icons-material';
import useModalFocus from '../../../components/common/useModalFocus';
import { getRooms, getRoomsByRoomType, getAvailableRoomTypes, normalizeRoomType } from '../../rooms/state/roomStore.js';
import reservationService from '../../../services/reservationService.js';
import { fileService } from '../../../services/fileService.js';

export default function ReservationFormModal({
  open,
  editingId,
  form = {},
  onFormChange,
  onClose,
  onSave,
  onSubmit,
  error = null,
  isSubmitting = false,
}) {
  const { dialogRef, titleId } = useModalFocus({ open, onClose });
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [backendAvailability, setBackendAvailability] = useState(null);
  const availableRoomTypes = getAvailableRoomTypes();

  useEffect(() => {
    if (!form.checkIn || !form.checkOut) {
      setBackendAvailability(null);
      return;
    }
    const checkIn = new Date(form.checkIn);
    const checkOut = new Date(form.checkOut);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      setBackendAvailability(null);
      return;
    }

    let isMounted = true;
    reservationService.checkAvailability({
      check_in: checkIn.toISOString(),
      check_out: checkOut.toISOString(),
    })
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.availability)
            ? res.data.availability
            : (Array.isArray(res) ? res : []);
        setBackendAvailability(list);
      })
      .catch(() => {
        if (isMounted) setBackendAvailability([]);
      });

    return () => { isMounted = false; };
  }, [form.checkIn, form.checkOut]);

  if (!open) return null;

  const handleSave = onSave || onSubmit;

  const handleFieldChange = (field, value) => {
    if (typeof onFormChange === 'function') {
      onFormChange(field, value);
    }
  };

  const allRooms = getRooms();
  const selectedType = form.roomType || '';

  const isRoomAvailableByBackend = (room) => {
    if (backendAvailability === null) {
      return true;
    }
    if (!backendAvailability || backendAvailability.length === 0) {
      return false;
    }
    const matchedType = backendAvailability.find((item) => {
      const typeIdMatch = room.roomTypeId && String(item.room_type_id) === String(room.roomTypeId);
      const typeNameMatch = room.roomType && String(item.room_type_name).toLowerCase() === String(room.roomType).toLowerCase();
      const typeCodeMatch = room.roomType && item.room_type_code && String(item.room_type_code).toLowerCase() === String(room.roomType).toLowerCase();
      return typeIdMatch || typeNameMatch || typeCodeMatch;
    });
    return Boolean(matchedType && matchedType.is_available && (matchedType.available_rooms > 0));
  };

  const availableRoomsList = allRooms.filter((room) => {
    const roomStatus = String(room.status || '').toLowerCase();
    if (['inactive', 'maintenance', 'out of order'].includes(roomStatus)) return false;
    return isRoomAvailableByBackend(room);
  });

  const filteredRooms = selectedType
    ? availableRoomsList.filter((r) => normalizeRoomType(r.roomType) === normalizeRoomType(selectedType))
    : availableRoomsList;

  const currentRoomVal = String(form.roomNo || form.room || '').trim();
  const roomOptions = [...filteredRooms];
  if (currentRoomVal && !roomOptions.some((r) => String(r.roomNo) === currentRoomVal)) {
    const existing = allRooms.find((r) => String(r.roomNo) === currentRoomVal);
    roomOptions.unshift(existing || { id: `custom-${currentRoomVal}`, roomNo: currentRoomVal, roomType: form.roomType || '' });
  }

  const handleRoomTypeChange = (e) => {
    const newType = e.target.value;
    handleFieldChange('roomType', newType);
    if (newType) {
      const validRooms = availableRoomsList.filter((r) => normalizeRoomType(r.roomType) === normalizeRoomType(newType));
      const current = String(form.roomNo || form.room || '').trim();
      if (current && validRooms.length > 0 && !validRooms.some((r) => String(r.roomNo) === current)) {
        handleFieldChange('roomNo', '');
      }
    }
  };

  const handleFileProcess = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    handleFieldChange('avatar', previewUrl);
    handleFieldChange('avatarFileName', file.name);
    setIsUploading(true);
    try {
      const uploadRes = await fileService.uploadFile(file, { folder: 'guests', entity_ref: 'GUEST_PROFILE' });
      if (uploadRes?.file_url) {
        handleFieldChange('avatar', uploadRes.file_url);
      }
    } catch (err) {
      console.warn('Cloudinary upload error, using local preview:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    handleFieldChange('avatar', '');
    handleFieldChange('avatarFileName', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-2xl w-full max-w-[850px] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-4 py-2.5 flex items-center justify-between shrink-0">
          <h2 id={titleId} className="text-white text-sm font-bold">
            {editingId ? 'Edit Booking' : 'Add New Booking'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-xs font-bold"
          >
            <Close sx={{ fontSize: 17 }} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (handleSave && !isSubmitting) handleSave(e);
          }}
          className="overflow-y-auto flex-1 p-3.5 sm:p-5 bg-gray-50/30 space-y-4"
        >
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium flex items-center justify-between shadow-2xs animate-fade-in"
            >
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Guest Information */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <label htmlFor="res-first-name" className="block text-[11px] text-gray-600 font-medium mb-1">First Name *</label>
                <input
                  id="res-first-name"
                  type="text"
                  value={form.firstName || ''}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="First Name"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-last-name" className="block text-[11px] text-gray-600 font-medium mb-1">Last Name</label>
                <input
                  id="res-last-name"
                  type="text"
                  value={form.lastName || ''}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="Last Name"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-email" className="block text-[11px] text-gray-600 font-medium mb-1">Email Address</label>
                <input
                  id="res-email"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="test@example.com"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-gender" className="block text-[11px] text-gray-600 font-medium mb-1">Gender</label>
                <select
                  id="res-gender"
                  value={form.gender || ''}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-mobile" className="block text-[11px] text-gray-600 font-medium mb-1">Mobile</label>
                <input
                  id="res-mobile"
                  type="text"
                  value={form.mobile || ''}
                  onChange={(e) => handleFieldChange('mobile', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="123456789"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-city" className="block text-[11px] text-gray-600 font-medium mb-1">City</label>
                <input
                  id="res-city"
                  type="text"
                  value={form.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="City"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-passport" className="block text-[11px] text-gray-600 font-medium mb-1">ID/Passport Number</label>
                <input
                  id="res-passport"
                  type="text"
                  value={form.passport || ''}
                  onChange={(e) => handleFieldChange('passport', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="P123456789"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-nationality" className="block text-[11px] text-gray-600 font-medium mb-1">Nationality</label>
                <input
                  id="res-nationality"
                  type="text"
                  value={form.nationality || ''}
                  onChange={(e) => handleFieldChange('nationality', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="Nationality"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Stay Details */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">
              Stay Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <label htmlFor="res-check-in" className="block text-[11px] text-gray-600 font-medium mb-1">Check In Date</label>
                <input
                  id="res-check-in"
                  type="date"
                  value={form.checkIn || ''}
                  onChange={(e) => handleFieldChange('checkIn', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-check-out" className="block text-[11px] text-gray-600 font-medium mb-1">Check Out Date</label>
                <input
                  id="res-check-out"
                  type="date"
                  value={form.checkOut || ''}
                  onChange={(e) => handleFieldChange('checkOut', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-package" className="block text-[11px] text-gray-600 font-medium mb-1">Select Package Type</label>
                <select
                  id="res-package"
                  value={form.package || 'Standard (Room Only)'}
                  onChange={(e) => handleFieldChange('package', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="Standard (Room Only)">Standard (Room Only)</option>
                  <option value="Bed & Breakfast">Bed & Breakfast</option>
                  <option value="Business">Business</option>
                  <option value="All inclusive">All inclusive</option>
                  <option value="Wedding">Wedding</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-total-person" className="block text-[11px] text-gray-600 font-medium mb-1">Total Person *</label>
                <input
                  id="res-total-person"
                  type="number"
                  required
                  value={form.totalPerson || ''}
                  onChange={(e) => handleFieldChange('totalPerson', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="1"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-num-rooms" className="block text-[11px] text-gray-600 font-medium mb-1">Number of Rooms</label>
                <input
                  id="res-num-rooms"
                  type="number"
                  value={form.numRooms || ''}
                  onChange={(e) => handleFieldChange('numRooms', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="1"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-room-type" className="block text-[11px] text-gray-600 font-medium mb-1">Select Room Type</label>
                <select
                  id="res-room-type"
                  value={form.roomType || ''}
                  onChange={handleRoomTypeChange}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">All Room Types (Show All)</option>
                  {availableRoomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-room-no" className="block text-[11px] text-gray-600 font-medium mb-1">Room / Room No.</label>
                <select
                  id="res-room-no"
                  placeholder="e.g. 101, 102, 201"
                  value={form.roomNo || form.room || ''}
                  onChange={(e) => handleFieldChange('roomNo', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select Room No.</option>
                  {roomOptions.map((room) => (
                    <option key={room.id || room.roomNo} value={room.roomNo}>
                      Room {room.roomNo} ({room.capacity || 2})
                    </option>
                  ))}
                </select>
                {filteredRooms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-1.5" aria-label="Quick Select Rooms">
                    {filteredRooms.map((room) => {
                      const isSelected = String(form.roomNo || form.room) === String(room.roomNo);
                      return (
                        <button
                          key={room.id || room.roomNo}
                          type="button"
                          aria-label={`[${room.roomNo}]`}
                          onClick={() => handleFieldChange('roomNo', room.roomNo)}
                          className={`px-1.5 py-0.5 text-[10.5px] font-bold rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)] shadow-xs'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--primary-main)] hover:bg-emerald-50/50'
                          }`}
                        >
                          <span>[{room.roomNo}]</span>
                          <span className="text-[9.5px] font-normal opacity-80">({room.capacity || 2})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-arrival-time" className="block text-[11px] text-gray-600 font-medium mb-1">Arrival Time</label>
                <select
                  id="res-arrival-time"
                  value={form.arrivalTime || ''}
                  onChange={(e) => handleFieldChange('arrivalTime', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening (6:00 PM - 10:00 PM)">Evening (6:00 PM - 10:00 PM)</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-purpose" className="block text-[11px] text-gray-600 font-medium mb-1">Purpose of Stay</label>
                <select
                  id="res-purpose"
                  value={form.purpose || ''}
                  onChange={(e) => handleFieldChange('purpose', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select</option>
                  <option value="Business">Business</option>
                  <option value="Leisure">Leisure</option>
                  <option value="Family">Family</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Payment & Booking */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">
              Payment & Booking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <label htmlFor="res-payment-method" className="block text-[11px] text-gray-600 font-medium mb-1">Payment Method</label>
                <select
                  id="res-payment-method"
                  value={form.paymentMethod || ''}
                  onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-discount-code" className="block text-[11px] text-gray-600 font-medium mb-1">Discount Code</label>
                <input
                  id="res-discount-code"
                  type="text"
                  value={form.discountCode || ''}
                  onChange={(e) => handleFieldChange('discountCode', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="SAVE10"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-booking-ref" className="block text-[11px] text-gray-600 font-medium mb-1">Booking Reference</label>
                <input
                  id="res-booking-ref"
                  type="text"
                  value={form.bookingRef || ''}
                  onChange={(e) => handleFieldChange('bookingRef', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="BK123456ABCD"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-emergency-name" className="block text-[11px] text-gray-600 font-medium mb-1">Emergency Contact Name</label>
                <input
                  id="res-emergency-name"
                  type="text"
                  value={form.emergencyName || ''}
                  onChange={(e) => handleFieldChange('emergencyName', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="John Doe"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-emergency-phone" className="block text-[11px] text-gray-600 font-medium mb-1">Emergency Contact Phone</label>
                <input
                  id="res-emergency-phone"
                  type="text"
                  value={form.emergencyPhone || ''}
                  onChange={(e) => handleFieldChange('emergencyPhone', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="987654321"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Additional Details */}
          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-1">
                <label htmlFor="res-address" className="block text-[11px] text-gray-600 font-medium mb-1">Address</label>
                <input
                  id="res-address"
                  type="text"
                  value={form.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="101, Elanxa, New York"
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="res-special-requests" className="block text-[11px] text-gray-600 font-medium mb-1">Special Requests</label>
                <input
                  id="res-special-requests"
                  type="text"
                  value={form.specialRequests || ''}
                  onChange={(e) => handleFieldChange('specialRequests', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="Non-smoking room, late check-in"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="res-guest-image" className="block text-[11px] text-gray-600 font-medium mb-1">
                  Upload Guest Image / Photo
                </label>
                <input
                  id="res-guest-image"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {form.avatar ? (
                  <div className="w-full p-2.5 border border-green-300 bg-green-50/40 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={form.avatar}
                        alt="Guest Preview"
                        className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-2xs"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {form.avatarFileName || 'Guest Photo Attached'}
                        </p>
                        <p className={`text-[10.5px] font-medium ${isUploading ? 'text-amber-600 animate-pulse' : 'text-green-700'}`}>
                          {isUploading ? 'Uploading to Cloudinary...' : 'Image stored & verified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        className="px-2.5 py-1 bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Remove Image"
                        aria-label="Remove image"
                      >
                        <DeleteOutlined sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full p-3.5 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-[var(--primary-main)] bg-green-50/50'
                        : 'border-gray-300 bg-white hover:bg-gray-50/80 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <CloudUpload className="text-gray-400 mb-1" sx={{ fontSize: 24 }} />
                      <p className="text-xs font-semibold text-gray-700 mb-0.5">
                        Click to upload or drag and drop image here
                      </p>
                      <p className="text-[10px] text-gray-400">PNG, JPG, JPEG, WEBP (Max 5MB)</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="res-note" className="block text-[11px] text-gray-600 font-medium mb-1">Note</label>
                <textarea
                  id="res-note"
                  rows="2"
                  value={form.note || ''}
                  onChange={(e) => handleFieldChange('note', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="Notes regarding booking..."
                ></textarea>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="px-4 py-2.5 bg-white border-t border-gray-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => {
              if (handleSave && !isSubmitting) handleSave(e);
            }}
            className={`px-4.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--primary-main)] hover:bg-green-700 transition-colors cursor-pointer shadow-2xs ${
              isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add New Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
