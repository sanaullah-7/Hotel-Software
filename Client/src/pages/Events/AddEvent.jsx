import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeOutlined as HomeIcon,
  CheckCircle as SuccessIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

// Helper to generate auto Event ID matching Luxuria EVT... format
function generateEventId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVT${randomStr}`;
}

const EVENT_TYPES = [
  'Wedding',
  'Corporate Meeting',
  'Conference',
  'Birthday Party',
  'Anniversary',
  'Product Launch',
  'Seminar',
  'Reception',
  'Gala',
  'Workshop'
];

const VENUES = [
  'Grand Ballroom',
  'Conference Hall A',
  'Conference Hall B',
  'Rooftop Terrace',
  'Garden Area',
  'Poolside',
  'Grand Crystal Ballroom',
  'Royal Executive Boardroom'
];

const CATERING_TYPES = [
  'Buffet',
  'Plated Service',
  'Cocktail Reception',
  'Family Style',
  'Coffee & Snacks',
  'No Catering'
];

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'In Progress',
  'Completed',
  'Cancelled'
];

export default function AddEvent() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

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
    catering: 'Buffet',
    status: 'Pending',
    totalAmount: 12000,
    advanceAmount: 4000,
    balanceAmount: 8000,
    specialRequests: '',
    notes: ''
  });

  const handleAmountChange = (field, val) => {
    const numVal = parseFloat(val) || 0;
    setFormData(prev => {
      const updated = { ...prev, [field]: numVal };
      const total = field === 'totalAmount' ? numVal : prev.totalAmount;
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

    setIsSuccess(true);
    setTimeout(() => {
      // scroll to top smoothly to show success banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
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
      catering: 'Buffet',
      status: 'Pending',
      totalAmount: 12000,
      advanceAmount: 4000,
      balanceAmount: 8000,
      specialRequests: '',
      notes: ''
    });
    setIsSuccess(false);
  };

  return (
    <div className="w-full space-y-4">
     

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <SuccessIcon className="text-emerald-600" />
            <div>
              <span className="font-bold text-sm block">Event Added Successfully!</span>
              <span className="text-xs text-emerald-700">
                {formData.name} ({formData.id}) has been recorded in the system.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/events/all-events')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              View in All Events
            </button>
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Add Another Event
            </button>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6 pb-3 border-b border-slate-100">
          Add Event/Banquet
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Event Name & Event ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Name*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vance & Sterling Royal Gala"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event ID
              </label>
              <input
                type="text"
                readOnly
                value={formData.id}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-mono font-medium select-none"
              />
            </div>
          </div>

          {/* Row 2: Event Type & Client Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Type*
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all cursor-pointer"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Name*
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Baroness Evelyn Vance"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>
          </div>

          {/* Row 3: Client Phone & Client Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Phone*
              </label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Client Email*
              </label>
              <input
                type="email"
                required
                placeholder="client@luxuryevents.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>
          </div>

          {/* Row 4: Event Date, Start Time & End Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Event Date*
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Time*
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Time*
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>
          </div>

          {/* Row 5: Venue & Expected Guests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Venue*
              </label>
              <select
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all cursor-pointer"
              >
                {VENUES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expected Guests*
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>
          </div>

          {/* Row 6: Catering Type & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Catering Type
              </label>
              <select
                value={formData.catering}
                onChange={(e) => setFormData({ ...formData, catering: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all cursor-pointer"
              >
                {CATERING_TYPES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status*
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 7: Total Amount, Advance Amount & Balance Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Amount*
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.totalAmount}
                onChange={(e) => handleAmountChange('totalAmount', e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Advance Amount
              </label>
              <input
                type="number"
                min="0"
                value={formData.advanceAmount}
                onChange={(e) => handleAmountChange('advanceAmount', e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Balance Amount
              </label>
              <input
                type="number"
                readOnly
                value={formData.balanceAmount}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-semibold select-none"
              />
            </div>
          </div>

          {/* Row 8: Special Requests & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Special Requests
              </label>
              <textarea
                rows="4"
                placeholder="Decorations, lighting, floral arrangements, audio/visual setup..."
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all resize-y"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Notes
              </label>
              <textarea
                rows="4"
                placeholder="Internal event coordinator notes, special dietary allergies..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full text-sm bg-white border border-slate-300 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5c67f2]/20 focus:border-[#5c67f2] transition-all resize-y"
              ></textarea>
            </div>
          </div>

          {/* Row 9: Buttons matching Luxuria exactly */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-4">
            <button
              type="submit"
              className="min-w-[126px] h-[42px] px-8 rounded-full bg-[#5c67f2] hover:bg-[#4c57e8] text-white font-medium text-[14px] tracking-wide shadow-[0_4px_12px_rgba(92,103,242,0.28)] hover:shadow-[0_6px_16px_rgba(92,103,242,0.35)] transition-all duration-200 cursor-pointer flex items-center justify-center select-none active:scale-[0.98]"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="min-w-[126px] h-[42px] px-8 rounded-full bg-white border border-[#ffb3be] hover:border-[#f43f5e] hover:bg-rose-50/40 text-[#e11d48] font-medium text-[14px] tracking-wide shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center select-none active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
