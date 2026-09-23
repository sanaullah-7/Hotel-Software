import React from 'react';
import { Close } from '@mui/icons-material';

export default function ReservationFormModal({
  open,
  editingId,
  form = {},
  onFormChange,
  onClose,
  onSave,
  onSubmit
}) {
  if (!open) return null;

  const handleSave = onSave || onSubmit;

  const handleFieldChange = (field, value) => {
    if (typeof onFormChange === 'function') {
      onFormChange(field, value);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-[850px] overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-white text-[16px] font-bold">
            {editingId ? 'Edit Booking' : 'Add Booking'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-[12px] font-bold"
          >
            <Close sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (handleSave) handleSave(e);
          }}
          className="overflow-y-auto flex-1 p-6 bg-gray-50/30"
        >
          {/* Section 1: Guest Information */}
          <div className="mb-8">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  value={form.firstName || ''}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="First Name"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.lastName || ''}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="Last Name"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="test@example.com"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Gender</label>
                <select
                  value={form.gender || ''}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Mobile</label>
                <input
                  type="text"
                  value={form.mobile || ''}
                  onChange={(e) => handleFieldChange('mobile', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="123456789"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">City</label>
                <input
                  type="text"
                  value={form.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="City"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">ID/Passport Number</label>
                <input
                  type="text"
                  value={form.passport || ''}
                  onChange={(e) => handleFieldChange('passport', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="P123456789"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Nationality</label>
                <input
                  type="text"
                  value={form.nationality || ''}
                  onChange={(e) => handleFieldChange('nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="Nationality"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Stay Details */}
          <div className="mb-8">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Stay Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Check In Date</label>
                <input
                  type="date"
                  value={form.checkIn || ''}
                  onChange={(e) => handleFieldChange('checkIn', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Check Out Date</label>
                <input
                  type="date"
                  value={form.checkOut || ''}
                  onChange={(e) => handleFieldChange('checkOut', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Select Package Type</label>
                <select
                  value={form.package || ''}
                  onChange={(e) => handleFieldChange('package', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select</option>
                  <option value="Business">Business</option>
                  <option value="All inclusive">All inclusive</option>
                  <option value="Wedding">Wedding</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Total Person *</label>
                <input
                  type="number"
                  required
                  value={form.totalPerson || ''}
                  onChange={(e) => handleFieldChange('totalPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="1"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Number of Rooms</label>
                <input
                  type="number"
                  value={form.numRooms || ''}
                  onChange={(e) => handleFieldChange('numRooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="1"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Select Room Type</label>
                <select
                  value={form.roomType || ''}
                  onChange={(e) => handleFieldChange('roomType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select</option>
                  <option value="Delux">Delux</option>
                  <option value="Super Delux">Super Delux</option>
                  <option value="Vila">Vila</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Arrival Time</label>
                <select
                  value={form.arrivalTime || ''}
                  onChange={(e) => handleFieldChange('arrivalTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                >
                  <option value="">Select</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening (6:00 PM - 10:00 PM)">Evening (6:00 PM - 10:00 PM)</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Purpose of Stay</label>
                <select
                  value={form.purpose || ''}
                  onChange={(e) => handleFieldChange('purpose', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
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
          <div className="mb-8">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Payment & Booking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Payment Method</label>
                <select
                  value={form.paymentMethod || ''}
                  onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
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
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Discount Code</label>
                <input
                  type="text"
                  value={form.discountCode || ''}
                  onChange={(e) => handleFieldChange('discountCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="SAVE10"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Booking Reference</label>
                <input
                  type="text"
                  value={form.bookingRef || ''}
                  onChange={(e) => handleFieldChange('bookingRef', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="BK123456ABCD"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={form.emergencyName || ''}
                  onChange={(e) => handleFieldChange('emergencyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="John Doe"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={form.emergencyPhone || ''}
                  onChange={(e) => handleFieldChange('emergencyPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="987654321"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Additional Details */}
          <div className="mb-8">
            <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={form.address || ''}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="101, Elanxa, New York"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Special Requests</label>
                <input
                  type="text"
                  value={form.specialRequests || ''}
                  onChange={(e) => handleFieldChange('specialRequests', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="Non-smoking room, late check-in"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">
                  Upload or drag and drop file here
                </label>
                <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-md bg-white text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <p className="text-[13px] text-gray-500 mb-2">No file chosen</p>
                  <input type="file" className="text-[12px] text-gray-500" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] text-gray-600 font-medium mb-1">Note</label>
                <textarea
                  rows="3"
                  value={form.note || ''}
                  onChange={(e) => handleFieldChange('note', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
                  placeholder="Notes regarding booking..."
                ></textarea>
              </div>
            </div>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded text-[13.5px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              if (handleSave) handleSave(e);
            }}
            className="px-5 py-2 rounded text-[13.5px] font-bold text-white bg-[var(--primary-main)] hover:bg-green-700 transition-colors cursor-pointer shadow-sm"
          >
            {editingId ? 'Save Changes' : 'Add Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
