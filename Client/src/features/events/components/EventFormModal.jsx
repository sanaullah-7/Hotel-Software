import React, { useState, useEffect } from 'react';
import { Close as CloseIcon } from '@mui/icons-material';

export function generateEventId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 8; i += 1) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVT${randomStr}`;
}

export default function EventFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  typeOptions = [],
  venueOptions = [],
  statusOptions = [],
  cateringOptions = []
}) {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    id: generateEventId(),
    type: 'Wedding',
    client: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '18:00',
    venue: 'Grand Ballroom',
    guests: 100,
    catering: 'Plated Dinner',
    status: 'Pending',
    amount: 10000,
    advanceAmount: 3000,
    balanceAmount: 7000,
    specialRequests: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        id: initialData.id || generateEventId(),
        type: initialData.type || 'Wedding',
        client: initialData.client || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        startTime: initialData.startTime || '12:00',
        endTime: initialData.endTime || '18:00',
        venue: initialData.venue || 'Grand Ballroom',
        guests: initialData.guests ?? 100,
        catering: initialData.catering || 'Plated Dinner',
        status: initialData.status || 'Pending',
        amount: initialData.amount ?? 10000,
        advanceAmount: initialData.advanceAmount ?? 0,
        balanceAmount: initialData.balanceAmount ?? 0,
        specialRequests: initialData.specialRequests || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        name: '',
        id: generateEventId(),
        type: 'Wedding',
        client: '',
        phone: '',
        email: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '12:00',
        endTime: '18:00',
        venue: 'Grand Ballroom',
        guests: 100,
        catering: 'Plated Dinner',
        status: 'Pending',
        amount: 10000,
        advanceAmount: 3000,
        balanceAmount: 7000,
        specialRequests: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAmountChange = (field, val) => {
    const numVal = parseFloat(val) || 0;
    setFormData((prev) => {
      const updated = { ...prev, [field]: numVal };
      const total = field === 'amount' ? numVal : prev.amount;
      const advance = field === 'advanceAmount' ? numVal : prev.advanceAmount;
      updated.balanceAmount = Math.max(0, total - advance);
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.client) {
      alert('Please fill in required fields (Event Name and Client Name)');
      return;
    }

    const dateParts = formData.date.split('-');
    const displayDate =
      dateParts.length === 3
        ? `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`
        : formData.date;

    const savedEvt = {
      ...formData,
      displayDate,
      guests: parseInt(formData.guests, 10) || 0,
      amount: parseFloat(formData.amount) || 0,
      advanceAmount: parseFloat(formData.advanceAmount) || 0,
      balanceAmount: parseFloat(formData.balanceAmount) || 0
    };

    onSave(savedEvt);
  };

  const headerBg = isEdit ? 'bg-[#1b7f43]' : 'bg-[#5c67f2]';
  const buttonBg = isEdit
    ? 'bg-[#1b7f43] hover:bg-[#166534]'
    : 'bg-[#5c67f2] hover:bg-[#4b55e0]';
  const focusRing = isEdit ? 'focus:ring-[#1b7f43]/20' : 'focus:ring-[#5c67f2]/20';
  const focusBorder = isEdit ? 'focus:border-[#1b7f43]' : 'focus:border-[#5c67f2]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className={`${headerBg} px-6 py-4 flex items-center justify-between text-white`}>
          <h3 className="text-lg font-bold tracking-tight">
            {isEdit ? `Edit Event: ${initialData.name}` : 'New Event'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Name*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Wedding Gala"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              />
            </div>

            {/* Event ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event ID
              </label>
              <input
                type="text"
                readOnly
                value={formData.id}
                className="w-full text-sm bg-slate-50 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2.5 font-mono select-none"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Type*
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Name*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah Johnson"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              />
            </div>

            {/* Client Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Phone*
              </label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              />
            </div>

            {/* Client Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Email*
              </label>
              <input
                type="email"
                required
                placeholder="client@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              />
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date*
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Time*
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 ${focusRing}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Time*
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 ${focusRing}`}
                />
              </div>
            </div>

            {/* Venue */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue*
              </label>
              <select
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              >
                {venueOptions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Guests */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Guests*
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              />
            </div>

            {/* Catering Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catering Type
              </label>
              <select
                value={formData.catering}
                onChange={(e) => setFormData({ ...formData, catering: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              >
                {cateringOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status*
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Amount ($)*
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.amount}
                onChange={(e) => handleAmountChange('amount', e.target.value)}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              />
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Advance Amount ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.advanceAmount}
                onChange={(e) => handleAmountChange('advanceAmount', e.target.value)}
                className={`w-full text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
              />
            </div>

            {/* Balance Amount (Auto calculated) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Balance Amount ($)
              </label>
              <input
                type="number"
                readOnly
                value={formData.balanceAmount}
                className="w-full text-sm bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3.5 py-2.5 font-semibold"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Special Requests
            </label>
            <textarea
              rows="2"
              placeholder="Special setup, floral, stage, dietary notes..."
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className={`w-full text-sm bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
            ></textarea>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              rows="2"
              placeholder="Internal coordinator notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`w-full text-sm bg-white border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 ${focusRing} ${focusBorder}`}
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="submit"
              className={`px-6 py-2.5 ${buttonBg} text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer`}
            >
              {isEdit ? 'Update Event' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 ${
                isEdit ? 'text-slate-600' : 'text-rose-600'
              } text-sm font-semibold rounded-xl transition-colors cursor-pointer`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
