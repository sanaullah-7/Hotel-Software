import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle as SuccessIcon,
  ErrorOutlineOutlined as ErrorIcon,
  EventOutlined as EventIcon,
  PersonOutlined as PersonIcon,
  PlaceOutlined as VenueIcon,
  ReceiptOutlined as PriceIcon,
  ArrowForward as NextIcon,
  ArrowBack as PrevIcon,
  Check as CheckIcon
} from '@mui/icons-material';

import { CircularProgress } from '@mui/material';
import { CATERING_TYPES, EVENT_TYPES, STATUS_OPTIONS, VENUES, generateEventId } from '../data/eventOptions';
import eventService from '../../../services/eventService';
import { toBackendEventPayload } from '../adapters/eventAdapter';

export default function AddEvent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdEventData, setCreatedEventData] = useState(null);
  const [autoGenerateBeo, setAutoGenerateBeo] = useState(true);

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
    status: 'Confirmed',
    totalAmount: 12000,
    advanceAmount: 4000,
    balanceAmount: 8000,
    specialRequests: '',
    notes: '',
  });

  const handleAmountChange = (field, val) => {
    const numVal = parseFloat(val) || 0;
    setFormData((prev) => {
      const updated = { ...prev, [field]: numVal };
      const total = field === 'totalAmount' ? numVal : prev.totalAmount;
      const advance = field === 'advanceAmount' ? numVal : prev.advanceAmount;
      updated.balanceAmount = Math.max(0, total - advance);
      return updated;
    });
  };

  const validateStep = (step) => {
    setErrorMessage('');
    if (step === 1) {
      if (!formData.name?.trim()) {
        setErrorMessage('Please enter the Event Name before proceeding.');
        return false;
      }
      if (!formData.date) {
        setErrorMessage('Please select the Event Date.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.client?.trim()) {
        setErrorMessage('Please enter the Customer Name.');
        return false;
      }
      if (!formData.phone?.trim()) {
        setErrorMessage('Please enter the Customer Phone Number.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.venue) {
        setErrorMessage('Please select an Event Venue.');
        return false;
      }
      if (!formData.guests || Number(formData.guests) <= 0) {
        setErrorMessage('Please enter a valid number of expected guests.');
        return false;
      }
    } else if (step === 4) {
      if (Number(formData.advanceAmount || 0) > Number(formData.totalAmount || 0)) {
        setErrorMessage('Advance amount cannot exceed total amount');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrev = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleConfirmAndSaveBooking = async (e) => {
    if (e && e.preventDefault) e.preventDefault();



    if (isSubmitting) return;

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      // Ensure payload has a valid event ID
      const eventToSave = {
        ...formData,
        id: formData.id || generateEventId()
      };
      const payload = toBackendEventPayload(eventToSave);
      const res = await eventService.createEvent(payload);
      const created = res?.data || res;
      setCreatedEventData(created);

      // Auto-generate linked Banquet Event Order (BEO) in Event Plans tab if selected
      if (autoGenerateBeo && created?._id) {
        try {
          await eventService.createBeo({
            event_id: created._id,
            title: formData.name,
            client: formData.client,
            venue: formData.venue,
            status: formData.status === 'Confirmed' ? 'Confirmed & Deposit Paid' : 'BEO In Preparation',
            schedule: `${formData.date} (${formData.startTime} – ${formData.endTime})`,
            attendance: `${formData.guests} Guests (${formData.catering})`,
            catering: `${formData.catering} Package`,
            total_price: `$${Number(formData.totalAmount || 0).toLocaleString()}`,
            deposit_paid: `$${Number(formData.advanceAmount || 0).toLocaleString()}`,
            av_setup: 'Standard Stage, Podium Mic & Ambient Lighting',
            setup_requirements: formData.specialRequests || 'Standard banquet layout'
          });
        } catch (beoErr) {
          console.warn('Could not auto-generate linked BEO:', beoErr);
        }
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Notify domain listeners (Reports & Dashboard)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('hotel:data-updated', {
            detail: {
              domain: 'event-creation',
              action: 'create',
              amount: formData.advanceAmount,
              eventId: created?._id || created?.id || formData.id
            }
          })
        );
      }
    } catch (err) {
      console.error('Failed to create event on server:', err);
      setErrorMessage(err?.message || 'Failed to save event booking. Please review your input.');
    } finally {
      setIsSubmitting(false);
    }
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
      status: 'Confirmed',
      totalAmount: 12000,
      advanceAmount: 4000,
      balanceAmount: 8000,
      specialRequests: '',
      notes: ''
    });
    setCurrentStep(1);
    setIsSuccess(false);
    setErrorMessage('');
  };

  const steps = [
    { number: 1, label: 'Event Info', description: 'Name, Type & Schedule', icon: EventIcon },
    { number: 2, label: 'Customer', description: 'Contact & Details', icon: PersonIcon },
    { number: 3, label: 'Venue & Guests', description: 'Location & Capacity', icon: VenueIcon },
    { number: 4, label: 'Pricing & Notes', description: 'Payment & Requests', icon: PriceIcon }
  ];

  return (
    <div className="w-full space-y-3 pb-6 font-sans" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Create Event Booking</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Step-by-step form to register an event booking, assign a venue, and record payments.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/events/all-events')}
          className="text-xs font-semibold text-[#1b7f43] hover:text-[#12572e] flex items-center gap-1 cursor-pointer"
        >
          &larr; Back to Events & Bookings
        </button>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && createdEventData && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-900 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <SuccessIcon className="text-[#1b7f43]" />
            <div>
              <span className="font-bold text-sm block">Event Added Successfully!</span>
              <span className="text-xs text-emerald-700">
                &ldquo;{formData.name}&rdquo; ({createdEventData?.event_ref || formData.id}) has been recorded.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/events/all-events')}
              className="px-3.5 py-1.5 bg-[#1b7f43] hover:bg-[#12572e] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              View in All Events
            </button>
            <button
              onClick={() => navigate('/events/banquet-manager')}
              className="px-3.5 py-1.5 bg-white border border-[#1b7f43] hover:bg-emerald-50 text-[#1b7f43] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              View Event Plan (BEO)
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Create Another Booking
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 animate-fadeIn">
          <ErrorIcon className="text-rose-600 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Multi-Step Stepper Navigation */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((st) => {
            const isCompleted = currentStep > st.number;
            const isCurrent = currentStep === st.number;
            const IconComp = st.icon;

            return (
              <button
                key={st.number}
                type="button"
                onClick={() => {
                  if (st.number < currentStep || validateStep(currentStep)) {
                    setCurrentStep(st.number);
                  }
                }}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1b7f43]/5 border-[#1b7f43] text-gray-900 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 text-gray-700'
                    : 'bg-slate-50/60 border-slate-100 text-gray-400 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-[#1b7f43] text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? <CheckIcon sx={{ fontSize: 14 }} /> : st.number}
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-[#1b7f43]' : 'text-gray-800'}`}>
                    {st.label}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate hidden sm:block">
                    {st.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Step Form Container */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 sm:p-5">
        <div
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
              e.preventDefault();
              if (currentStep < 4) {
                handleNext();
              } else if (currentStep === 4) {
                handleConfirmAndSaveBooking(e);
              }
            }
          }}
          className="space-y-4"
        >
          {/* STEP 1: EVENT INFORMATION */}
          <div className={currentStep === 1 ? "" : "hidden"}>
            <div className="space-y-3.5 animate-fadeIn">
              <div className="border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Step 1: Event Information</h2>
                <p className="text-xs text-gray-500">Provide the title, function category, and expected schedule.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Event Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vance & Sterling Royal Gala"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Booking Reference ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.id}
                    className="w-full text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-500 font-mono select-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Event Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition cursor-pointer"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: CUSTOMER INFORMATION */}
          <div className={currentStep === 2 ? "" : "hidden"}>
            <div className="space-y-3.5 animate-fadeIn">
              <div className="border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Step 2: Customer Information</h2>
                <p className="text-xs text-gray-500">Primary client contact details for confirmation and coordination.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Customer / Organizer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baroness Evelyn Vance"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@luxuryevents.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: VENUE AND GUESTS */}
          <div className={currentStep === 3 ? "" : "hidden"}>
            <div className="space-y-3.5 animate-fadeIn">
              <div className="border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Step 3: Venue and Guests</h2>
                <p className="text-xs text-gray-500">Select the event hall, anticipated headcount, and catering style.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Select Event Venue <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition cursor-pointer"
                  >
                    {VENUES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expected Number of Guests <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Catering Service Plan
                  </label>
                  <select
                    value={formData.catering}
                    onChange={(e) => setFormData({ ...formData, catering: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition cursor-pointer"
                  >
                    {CATERING_TYPES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Booking Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: PRICING AND NOTES */}
          <div className={currentStep === 4 ? "" : "hidden"}>
            <div className="space-y-3.5 animate-fadeIn">
              <div className="border-b border-gray-100 pb-2">
                <h2 className="text-sm font-bold text-gray-900">Step 4: Pricing and Notes</h2>
                <p className="text-xs text-gray-500">Record package total, deposit received, and special requirements.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Total Package Price ($) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.totalAmount}
                    onChange={(e) => handleAmountChange('totalAmount', e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Advance Payment Received ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.advanceAmount}
                    onChange={(e) => handleAmountChange('advanceAmount', e.target.value)}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Balance Remaining ($)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={formData.balanceAmount}
                    className="w-full text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 font-semibold select-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Seating / Setup Requirements
                  </label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Round tables, podium with mic, projector screen, white carpet..."
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg p-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition resize-y"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Additional Coordinator Notes
                  </label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Staff instructions, dietary restrictions, arrival coordination..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-white border border-gray-200 rounded-lg p-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43]/20 transition resize-y"
                  ></textarea>
                </div>
              </div>

              {/* Linked BEO Plan Toggle */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Generate Banquet Event Order (BEO)</span>
                  <span className="text-[11px] text-emerald-700">Automatically creates an operational floor sheet in Event Plans tab.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateBeo}
                    onChange={(e) => setAutoGenerateBeo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1b7f43]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PrevIcon sx={{ fontSize: 16 }} />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Reset Form
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <NextIcon sx={{ fontSize: 16 }} />
                </button>
              )}
              {currentStep === 4 ? (
                <button
                  type="button"
                  onClick={handleConfirmAndSaveBooking}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={16} color="inherit" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon sx={{ fontSize: 16 }} />
                      <span>Submit Booking</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmAndSaveBooking}
                  className="sr-only"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
