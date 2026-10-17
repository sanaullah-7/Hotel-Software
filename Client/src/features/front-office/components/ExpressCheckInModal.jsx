import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Close as CloseIcon,
  FlashOn as ExpressIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  MeetingRoom as RoomIcon,
  CreditCard as PaymentIcon,
  CheckCircle as SuccessIcon,
  WarningAmber as WarningIcon,
  Print as PrintIcon,
  Add as AddIcon,
  EventNote as ReservationIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';

import guestService from '../../../services/guestService';
import roomService from '../../../services/roomService';
import reservationService from '../../../services/reservationService';
import stayService from '../../../services/stayService';
import billingService from '../../../services/billingService';
import shiftService from '../../../services/shiftService';

/**
 * Mask phone number for identity privacy.
 */
function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  if (phone.includes('*')) return phone;
  const trimmed = phone.trim();
  if (trimmed.length <= 6) return trimmed.replace(/.(?=.{2})/g, '*');
  const start = trimmed.startsWith('+') ? 5 : 4;
  const end = 3;
  return `${trimmed.slice(0, start)}****${trimmed.slice(-end)}`;
}

/**
 * Mask National ID / CNIC for identity privacy.
 */
function maskCNIC(cnic) {
  if (!cnic || typeof cnic !== 'string') return '';
  if (cnic.includes('*')) return cnic;
  const trimmed = cnic.trim();
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (parts.length === 3) return `${parts[0]}-*******-${parts[2]}`;
  }
  if (trimmed.length >= 8) return `${trimmed.slice(0, 5)}*******${trimmed.slice(-1)}`;
  return trimmed.replace(/.(?=.{2})/g, '*');
}

function getTodayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getTomorrowYMD() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * ExpressCheckInModal
 * Canonical 30-second walk-in reservation, room assignment, and check-in modal.
 */
export default function ExpressCheckInModal({ isOpen, onClose, onSuccess }) {
  // Wizard Step: 1 = Guest Identity, 2 = Stay & Room, 3 = Payment & Confirmation, 4 = Success
  const [step, setStep] = useState(1);

  // Guest State
  const [guestMode, setGuestMode] = useState('search'); // 'search' | 'create'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [existingReservations, setExistingReservations] = useState([]);
  const [selectedExistingReservation, setSelectedExistingReservation] = useState(null);

  // New Guest Form State
  const [newGuest, setNewGuest] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    national_id: '',
    email: '',
  });

  // Stay & Room State
  const [checkInDate, setCheckInDate] = useState(getTodayYMD);
  const [checkOutDate, setCheckOutDate] = useState(getTomorrowYMD);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');

  // Available Rooms State
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [managerOverrideCleanliness, setManagerOverrideCleanliness] = useState(false);

  // Payment State
  const [paymentOption, setPaymentOption] = useState('PAY_NOW'); // 'PAY_NOW' | 'PAY_LATER'
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [hasActiveShift, setHasActiveShift] = useState(null);
  const [activeShiftName, setActiveShiftName] = useState('');
  const [shiftCheckLoading, setShiftCheckLoading] = useState(false);

  // Submission & Error State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [partialFailureInfo, setPartialFailureInfo] = useState(null);
  const [confirmedResult, setConfirmedResult] = useState(null);

  const searchTimerRef = useRef(null);
  const modalCardRef = useRef(null);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setGuestMode('search');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedGuest(null);
      setExistingReservations([]);
      setSelectedExistingReservation(null);
      setNewGuest({ first_name: '', last_name: '', phone: '', national_id: '', email: '' });
      setCheckInDate(getTodayYMD());
      setCheckOutDate(getTomorrowYMD());
      setAdults(1);
      setChildren(0);
      setSpecialRequests('');
      setSelectedRoom(null);
      setPaymentOption('PAY_NOW');
      setPaymentMethod('Cash');
      setErrorBanner('');
      setPartialFailureInfo(null);
      setConfirmedResult(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Check active cash shift when modal opens or payment method changes to Cash
  useEffect(() => {
    if (isOpen && paymentOption === 'PAY_NOW' && paymentMethod === 'Cash') {
      let isMounted = true;
      setShiftCheckLoading(true);
      shiftService
        .getActiveShift()
        .then((res) => {
          if (!isMounted) return;
          const shift = res?.data?.shift || res?.data;
          if (shift && shift.status === 'OPEN') {
            setHasActiveShift(true);
            setActiveShiftName(shift.drawer_name || 'Active Drawer');
          } else {
            setHasActiveShift(false);
            setActiveShiftName('');
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setHasActiveShift(false);
          setActiveShiftName('');
        })
        .finally(() => {
          if (isMounted) setShiftCheckLoading(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, paymentOption, paymentMethod]);

  // Debounced guest search
  useEffect(() => {
    if (guestMode !== 'search' || !isOpen) return;
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await guestService.getGuests({ search: trimmed, limit: 8 });
        const list = Array.isArray(res?.data?.guests)
          ? res.data.guests
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setSearchResults(list);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery, guestMode, isOpen]);

  // Load available rooms when Step 2 is active
  useEffect(() => {
    if (step === 2 && isOpen) {
      let isMounted = true;
      setIsLoadingRooms(true);
      setErrorBanner('');

      Promise.all([
        roomService.getRooms(),
        reservationService.checkAvailability({
          check_in: checkInDate,
          check_out: checkOutDate,
        }).catch(() => ({ data: [] })),
      ])
        .then(([roomsRes, availRes]) => {
          if (!isMounted) return;
          const rawRooms = Array.isArray(roomsRes?.data?.rooms)
            ? roomsRes.data.rooms
            : Array.isArray(roomsRes?.data)
            ? roomsRes.data
            : [];
          setRooms(rawRooms);
        })
        .catch((err) => {
          if (!isMounted) return;
          setErrorBanner('Failed to load room availability. Please verify dates.');
        })
        .finally(() => {
          if (isMounted) setIsLoadingRooms(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [step, isOpen, checkInDate, checkOutDate]);

  // Check if selected guest has any existing active reservations
  const handleSelectGuest = async (guest) => {
    setSelectedGuest(guest);
    setErrorBanner('');
    setSelectedExistingReservation(null);

    try {
      const res = await reservationService.getReservations({
        primary_guest_id: guest._id || guest.id,
        limit: 10,
      });
      const list = Array.isArray(res?.data?.reservations)
        ? res.data.reservations
        : Array.isArray(res?.data)
        ? res.data
        : [];
      const active = list.filter((r) => ['CONFIRMED', 'PENDING'].includes(r.status));
      setExistingReservations(active);
    } catch {
      setExistingReservations([]);
    }
  };

  // Calculate nights and price
  const stayNights = useMemo(() => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 <= d1) return 1;
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / msPerDay));
  }, [checkInDate, checkOutDate]);

  const unitPrice = useMemo(() => {
    if (selectedExistingReservation) {
      return (
        selectedExistingReservation.room_type_id?.base_price ||
        selectedExistingReservation.rooms?.[0]?.room_type_id?.base_price ||
        0
      );
    }
    if (selectedRoom) {
      return selectedRoom.room_type_id?.base_price || selectedRoom.base_price || 0;
    }
    return 0;
  }, [selectedRoom, selectedExistingReservation]);

  const totalAmount = useMemo(() => {
    return unitPrice * stayNights;
  }, [unitPrice, stayNights]);

  // Filter eligible clean rooms for selection
  const eligibleRooms = useMemo(() => {
    return rooms.map((r) => {
      const isOccupied = r.status === 'OCCUPIED';
      const isOOD = r.status === 'OUT_OF_ORDER' || r.status === 'MAINTENANCE';
      const cleanStatuses = ['CLEAN', 'INSPECTED', 'INSPECTING'];
      const isClean = cleanStatuses.includes(r.housekeeping_status);

      let eligible = !isOccupied && !isOOD;
      let reason = '';
      if (isOccupied) {
        eligible = false;
        reason = 'Occupied';
      } else if (isOOD) {
        eligible = false;
        reason = r.status === 'OUT_OF_ORDER' ? 'Out of Order' : 'Under Maintenance';
      } else if (!isClean && !managerOverrideCleanliness) {
        eligible = false;
        reason = `Requires Cleaning (${r.housekeeping_status || 'DIRTY'})`;
      }

      return {
        ...r,
        eligible,
        ineligibleReason: reason,
        roomTypeName: r.room_type_id?.name || 'Standard Room',
        rate: r.room_type_id?.base_price || 0,
      };
    });
  }, [rooms, managerOverrideCleanliness]);

  // Handle Step 1 validation
  const handleProceedFromStep1 = () => {
    setErrorBanner('');
    if (guestMode === 'search') {
      if (!selectedGuest) {
        setErrorBanner('Please search and select a guest, or switch to Register New Guest.');
        return;
      }
    } else {
      if (!newGuest.first_name.trim() || !newGuest.last_name.trim()) {
        setErrorBanner('First Name and Last Name are required to register a guest.');
        return;
      }
    }
    setStep(2);
  };

  // Handle Step 2 validation
  const handleProceedFromStep2 = () => {
    setErrorBanner('');
    const d1 = new Date(checkInDate);
    const d2 = new Date(checkOutDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 <= d1) {
      setErrorBanner('Check-out date must be strictly after Check-in date.');
      return;
    }
    if (!selectedExistingReservation && !selectedRoom) {
      setErrorBanner('Please select an eligible, clean room for this stay.');
      return;
    }
    setStep(3);
  };

  // Execute full Express Check-In orchestrator
  const handleCompleteCheckIn = async () => {
    setErrorBanner('');
    setPartialFailureInfo(null);

    // Enforce cash shift restriction
    if (paymentOption === 'PAY_NOW' && paymentMethod === 'Cash' && hasActiveShift === false) {
      setErrorBanner(
        'An active Cash Shift is required to record cash payments. Please select a non-cash payment method or open a shift on the Shift Handover page.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let guestId = selectedGuest?._id || selectedGuest?.id;
      let guestDisplayName = selectedGuest
        ? selectedGuest.full_name || `${selectedGuest.first_name} ${selectedGuest.last_name}`
        : `${newGuest.first_name} ${newGuest.last_name}`.trim();

      // Step 1: Create Guest if in register mode
      if (guestMode === 'create') {
        const guestPayload = {
          first_name: newGuest.first_name.trim(),
          last_name: newGuest.last_name.trim(),
          phone: newGuest.phone.trim() || null,
          national_id: newGuest.national_id.trim() || null,
          email: newGuest.email.trim() || null,
        };
        const createdGuestRes = await guestService.createGuest(guestPayload);
        const createdGuest = createdGuestRes?.data?.guest || createdGuestRes?.data || createdGuestRes;
        guestId = createdGuest._id || createdGuest.id;
        setSelectedGuest(createdGuest);
      }

      let reservationId = selectedExistingReservation?._id || selectedExistingReservation?.id;
      let bookingRef = selectedExistingReservation?.booking_ref || '';
      let targetRoomId =
        selectedRoom?._id ||
        selectedRoom?.id ||
        selectedExistingReservation?.rooms?.[0]?.room_id?._id ||
        selectedExistingReservation?.room_id;

      // Step 2: Create Reservation if new walk-in
      if (!selectedExistingReservation) {
        const isPaidInFull = paymentOption === 'PAY_NOW';
        const resPayload = {
          primary_guest_id: guestId,
          room_id: selectedRoom._id || selectedRoom.id,
          room_type_id: selectedRoom.room_type_id?._id || selectedRoom.room_type_id,
          expected_check_in: new Date(checkInDate).toISOString(),
          expected_check_out: new Date(checkOutDate).toISOString(),
          adults: Math.max(1, adults),
          children: Math.max(0, children),
          special_requests: specialRequests || 'Express Check-In Walk-in',
          payment: isPaidInFull ? 'Paid' : 'Unpaid',
          payment_status: isPaidInFull ? 'Paid' : 'Unpaid',
          payment_method: isPaidInFull ? paymentMethod : null,
        };

        const createdRes = await reservationService.createReservation(resPayload);
        const resObj = createdRes?.data?.reservation || createdRes?.data || createdRes;
        reservationId = resObj._id || resObj.id;
        bookingRef = resObj.booking_ref || '';
      }

      // Step 3: Perform Authoritative Check-In
      const checkInPayload = {
        reservation_id: reservationId,
        room_id: targetRoomId,
        primary_guest_id: guestId,
        total_guests: Math.max(1, adults),
        manager_override: !!managerOverrideCleanliness,
        override_cleanliness: !!managerOverrideCleanliness,
        notes: `Express Check-In; Payment: ${paymentOption === 'PAY_NOW' ? paymentMethod : 'Pending'}`,
      };

      let stayResponse = null;
      try {
        stayResponse = await stayService.checkIn(checkInPayload);
      } catch (checkInErr) {
        // Partial failure: Reservation exists, but check-in failed
        const errMsg = checkInErr?.message || checkInErr?.data?.message || 'Check-in execution failed';
        setPartialFailureInfo({
          type: 'CHECKIN_FAILED',
          bookingRef,
          reservationId,
          message: errMsg,
        });
        setIsSubmitting(false);
        return;
      }

      const stayData = stayResponse?.data?.stay || stayResponse?.data || {};

      // Step 4: Record Payment if requested and not auto-settled
      let paymentOutcome = paymentOption === 'PAY_NOW' ? 'PAID' : 'PENDING';
      if (paymentOption === 'PAY_NOW') {
        try {
          const invRes = await billingService.getInvoices({ reservation_id: reservationId });
          const invoices = Array.isArray(invRes?.data?.invoices)
            ? invRes.data.invoices
            : Array.isArray(invRes?.data)
            ? invRes.data
            : [];
          const unpaid = invoices.find((i) => i.status !== 'PAID');
          if (unpaid) {
            const amountDue = Math.max(0, (unpaid.total_amount || 0) - (unpaid.amount_paid || 0));
            if (amountDue > 0) {
              await billingService.createPayment({
                invoice_id: unpaid._id,
                folio_id: unpaid.folio_id?._id || unpaid.folio_id,
                guest_id: guestId,
                amount: amountDue,
                payment_method: paymentMethod,
              });
              paymentOutcome = 'PAID';
            }
          }
        } catch (payErr) {
          // Check-in succeeded, but payment settlement failed
          paymentOutcome = 'PARTIAL_PAYMENT_ERROR';
        }
      }

      // Step 5: Notify data update and present Confirmed Screen
      window.dispatchEvent(
        new CustomEvent('hotel:data-updated', { detail: { domain: 'stay', action: 'check-in' } })
      );
      window.dispatchEvent(new Event('storage'));

      const confirmedData = {
        stayRef: stayData.stay_ref || 'STY-COMPLETED',
        bookingRef: bookingRef || 'RES-COMPLETED',
        guestName: guestDisplayName,
        roomNumber: selectedRoom?.room_number || selectedExistingReservation?.rooms?.[0]?.room_id?.room_number || 'Assigned',
        roomTypeName: selectedRoom?.room_type_id?.name || selectedExistingReservation?.rooms?.[0]?.room_type_id?.name || 'Room',
        checkInDate,
        checkOutDate,
        nights: stayNights,
        amount: totalAmount,
        paymentStatus: paymentOutcome === 'PAID' ? 'Paid in Full' : paymentOutcome === 'PARTIAL_PAYMENT_ERROR' ? 'Check-in complete (Payment Error)' : 'Unpaid (Charged to Folio)',
        paymentMethod: paymentOption === 'PAY_NOW' ? paymentMethod : 'None',
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConfirmedResult(confirmedData);
      setStep(4);
      if (typeof onSuccess === 'function') {
        onSuccess(confirmedData);
      }
    } catch (err) {
      setErrorBanner(err?.message || err?.data?.message || 'Express Check-In failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="express-checkin-title"
    >
      {/* Modal Dialog Card */}
      <div
        ref={modalCardRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3.5 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <ExpressIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h2 id="express-checkin-title" className="text-[16px] font-bold leading-tight">
                Express Check-In
              </h2>
              <p className="text-[11px] text-emerald-100 font-medium">
                Rapid Front Desk Walk-In & Arrival Check-In (Target: 30s)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Express Check-In"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Step Indicator Pills (Steps 1-3) */}
        {step < 4 && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[12px] font-bold">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className={`flex items-center gap-1.5 ${step === 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  1
                </span>
                Guest Identity
              </span>
              <span className="text-slate-300">›</span>
              <span className={`flex items-center gap-1.5 ${step === 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  2
                </span>
                Stay & Room
              </span>
              <span className="text-slate-300">›</span>
              <span className={`flex items-center gap-1.5 ${step === 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  3
                </span>
                Payment
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Step {step} of 3
            </span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Error Banner */}
          {errorBanner && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[12.5px] flex items-center gap-2">
              <WarningIcon sx={{ fontSize: 18 }} className="shrink-0 text-rose-600" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Partial Failure Warning */}
          {partialFailureInfo && (
            <div role="alert" className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <WarningIcon sx={{ fontSize: 18 }} className="text-amber-600" />
                <span>Partial Workflow Notice</span>
              </div>
              <p>
                Reservation was saved with Booking Reference:{' '}
                <strong>{partialFailureInfo.bookingRef}</strong>.
              </p>
              <p className="text-amber-800">{partialFailureInfo.message}</p>
              <p className="text-[11px] text-amber-700 mt-1">
                You can complete check-in directly from the Front Office table once the room condition is cleared.
              </p>
            </div>
          )}

          {/* ================= STEP 1: GUEST IDENTITY ================= */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Mode Toggle Buttons */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setGuestMode('search');
                    setErrorBanner('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    guestMode === 'search'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <SearchIcon sx={{ fontSize: 15 }} className="mr-1" />
                  Search Existing Guest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGuestMode('create');
                    setSelectedGuest(null);
                    setErrorBanner('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    guestMode === 'create'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <AddIcon sx={{ fontSize: 15 }} className="mr-1" />
                  Register New Guest
                </button>
              </div>

              {/* Search Mode */}
              {guestMode === 'search' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lookup Guest by Phone or National ID (CNIC)*
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="e.g. 03001234567 or 35201-1234567-1..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        autoFocus
                      />
                      <SearchIcon
                        sx={{ fontSize: 18 }}
                        className="absolute left-2.5 top-2.5 text-slate-400"
                      />
                      {isSearching && (
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                          Searching...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Search Results List */}
                  {searchQuery.trim().length >= 2 && (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                      {searchResults.length === 0 && !isSearching && (
                        <div className="py-4 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          <p>No matching guest found for "{searchQuery}".</p>
                          <button
                            type="button"
                            onClick={() => {
                              setGuestMode('create');
                              // Prefill phone or CNIC if query matches digits
                              if (/^\d+$/.test(searchQuery)) {
                                setNewGuest((prev) => ({ ...prev, phone: searchQuery }));
                              }
                            }}
                            className="mt-1.5 text-emerald-600 font-bold hover:underline text-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <AddIcon sx={{ fontSize: 14 }} />
                            Create new guest profile
                          </button>
                        </div>
                      )}

                      {searchResults.map((g) => {
                        const isSelected = selectedGuest && (selectedGuest._id === g._id || selectedGuest.id === g.id);
                        return (
                          <div
                            key={g._id || g.id}
                            onClick={() => handleSelectGuest(g)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-500'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {g.first_name?.[0] || 'G'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800 text-[13px]">
                                    {g.full_name || `${g.first_name} ${g.last_name}`}
                                  </span>
                                  {g.vip_status && (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                      VIP
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {g.guest_ref && <span>Ref: {g.guest_ref} • </span>}
                                  {g.phone && <span>Phone: {maskPhone(g.phone)} • </span>}
                                  {g.national_id && <span>CNIC: {maskCNIC(g.national_id)}</span>}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`text-xs font-bold px-2.5 py-1 rounded transition-colors ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Select'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Guest Card & Existing Reservations */}
                  {selectedGuest && (
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span>Selected Guest: {selectedGuest.full_name || `${selectedGuest.first_name} ${selectedGuest.last_name}`}</span>
                        <span className="text-emerald-700">Ref: {selectedGuest.guest_ref}</span>
                      </div>

                      {/* Check if guest has active existing reservation */}
                      {existingReservations.length > 0 && (
                        <div className="pt-2 border-t border-emerald-200/80 space-y-1.5">
                          <span className="font-bold text-[11px] text-emerald-900 block">
                            Active Upcoming Bookings Found:
                          </span>
                          {existingReservations.map((r) => {
                            const isResSelected = selectedExistingReservation && selectedExistingReservation._id === r._id;
                            return (
                              <div
                                key={r._id}
                                onClick={() =>
                                  setSelectedExistingReservation(isResSelected ? null : r)
                                }
                                className={`p-2 rounded border cursor-pointer flex items-center justify-between ${
                                  isResSelected
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-100/50'
                                }`}
                              >
                                <div>
                                  <div className="font-bold text-xs">
                                    Booking Ref: {r.booking_ref}
                                  </div>
                                  <div className={`text-[11px] ${isResSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                                    Status: {r.status} • Dates:{' '}
                                    {new Date(r.expected_check_in).toLocaleDateString()} -{' '}
                                    {new Date(r.expected_check_out).toLocaleDateString()}
                                  </div>
                                </div>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isResSelected ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'}`}>
                                  {isResSelected ? 'Check-in this booking' : 'Select'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Create Mode (New Guest Form) */}
              {guestMode === 'create' && (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    New Guest Registration
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-0.5">
                        First Name*
                      </label>
                      <input
                        type="text"
                        value={newGuest.first_name}
                        onChange={(e) =>
                          setNewGuest((prev) => ({ ...prev, first_name: e.target.value }))
                        }
                        placeholder="e.g. Tariq"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-0.5">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        value={newGuest.last_name}
                        onChange={(e) =>
                          setNewGuest((prev) => ({ ...prev, last_name: e.target.value }))
                        }
                        placeholder="e.g. Mahmood"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-0.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={newGuest.phone}
                        onChange={(e) =>
                          setNewGuest((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="e.g. 03001234567"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-0.5">
                        National ID / CNIC
                      </label>
                      <input
                        type="text"
                        value={newGuest.national_id}
                        onChange={(e) =>
                          setNewGuest((prev) => ({ ...prev, national_id: e.target.value }))
                        }
                        placeholder="e.g. 35201-1234567-1"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11.5px] font-bold text-slate-700 mb-0.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={newGuest.email}
                        onChange={(e) =>
                          setNewGuest((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="tariq@example.com"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: STAY & ROOM ================= */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Stay Dates & Occupancy */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Check-In Date*
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Check-Out Date*
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adults}
                    onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Nights
                  </label>
                  <div className="px-2 py-1.5 bg-slate-100 rounded text-xs font-bold text-slate-700 border border-slate-200">
                    {stayNights} Night{stayNights > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Cleanliness Gate Override Option */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-700 font-medium">
                  Manager Cleanliness Override (allow uninspected room)
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={managerOverrideCleanliness}
                    onChange={(e) => setManagerOverrideCleanliness(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-slate-800">Authorize</span>
                </label>
              </div>

              {/* Room Selection Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Select Available Clean Room*
                  </label>
                  {isLoadingRooms && (
                    <span className="text-xs text-emerald-600 font-medium">
                      Loading available rooms...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {eligibleRooms.length === 0 && !isLoadingRooms && (
                    <div className="sm:col-span-2 py-6 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      No rooms found for selected criteria.
                    </div>
                  )}

                  {eligibleRooms.map((r) => {
                    const isSelected = selectedRoom && (selectedRoom._id === r._id || selectedRoom.id === r.id);
                    return (
                      <div
                        key={r._id || r.id}
                        onClick={() => {
                          if (r.eligible) {
                            setSelectedRoom(r);
                            setErrorBanner('');
                          }
                        }}
                        className={`p-3 rounded-lg border transition-all ${
                          !r.eligible
                            ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500 cursor-pointer'
                            : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/80 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-sm">
                            Room {r.room_number}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              r.housekeeping_status === 'CLEAN' || r.housekeeping_status === 'INSPECTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.housekeeping_status || 'CLEAN'}
                          </span>
                        </div>
                        <div className="text-[11.5px] text-slate-500 mb-1">
                          {r.roomTypeName} • Floor {r.floor || '1'}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="font-bold text-emerald-700">
                            PKR {r.rate.toLocaleString()} / night
                          </span>
                          {!r.eligible ? (
                            <span className="text-[10px] text-rose-600 font-bold">
                              {r.ineligibleReason}
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              {isSelected ? '✓ Selected' : 'Choose'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PAYMENT & CONFIRMATION ================= */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 text-sm pb-1.5 border-b border-slate-200">
                  <span>Guest: {selectedGuest?.full_name || `${newGuest.first_name} ${newGuest.last_name}`}</span>
                  <span className="text-emerald-700 font-bold">
                    Room {selectedRoom?.room_number || selectedExistingReservation?.rooms?.[0]?.room_id?.room_number}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 text-[12px]">
                  <div>Dates: {checkInDate} to {checkOutDate}</div>
                  <div>Stay: {stayNights} Night{stayNights > 1 ? 's' : ''}</div>
                  <div>Rate: PKR {unitPrice.toLocaleString()} / night</div>
                  <div className="font-bold text-emerald-900">
                    Total Estimated Rate: PKR {totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Payment Settlement Options */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Payment Collection Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setPaymentOption('PAY_NOW')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      paymentOption === 'PAY_NOW'
                        ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-800">
                      ✓ Pay Now (Full Payment)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Settle invoice balance immediately at front desk.
                    </p>
                  </div>
                  <div
                    onClick={() => setPaymentOption('PAY_LATER')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      paymentOption === 'PAY_LATER'
                        ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-800">
                      Post to Folio (Pay at Checkout)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Open active stay with unpaid balance on guest folio.
                    </p>
                  </div>
                </div>

                {/* Payment Method Selector if Pay Now */}
                {paymentOption === 'PAY_NOW' && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700">
                      Payment Tender Method*
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            paymentMethod === m
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    {/* Cash Shift Enforcement Message */}
                    {paymentMethod === 'Cash' && (
                      <div className="mt-2">
                        {shiftCheckLoading ? (
                          <div className="text-[11px] text-slate-500">Checking cashier drawer status...</div>
                        ) : hasActiveShift === false ? (
                          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs space-y-1">
                            <div className="font-bold flex items-center gap-1.5">
                              <WarningIcon sx={{ fontSize: 16 }} className="text-amber-600" />
                              <span>Active Cash Shift Required</span>
                            </div>
                            <p className="text-[11.5px] leading-relaxed">
                              You do not have an open cash shift to receive cash payments. Either choose a non-cash payment method or open your shift on the Shift Handover page.
                            </p>
                            <a
                              href="/payment-billing/shift-handover"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-1 text-emerald-700 font-bold underline hover:text-emerald-900"
                            >
                              Go to Shift Handover ↗
                            </a>
                          </div>
                        ) : (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[11.5px] flex items-center gap-1.5">
                            <SuccessIcon sx={{ fontSize: 15 }} className="text-emerald-600" />
                            <span>Attributed to open drawer: <strong>{activeShiftName}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Special Requests / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Front Desk Notes / Special Requests (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. VIP guest, requested late checkout, keycard issued #..."
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* ================= STEP 4: AUTHORITATIVE CONFIRMATION ================= */}
          {step === 4 && confirmedResult && (
            <div className="py-2 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <SuccessIcon sx={{ fontSize: 36 }} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Express Check-In Successful!
                </h3>
                <p className="text-xs text-slate-500">
                  Guest is confirmed IN_HOUSE with active stay record.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Stay Reference:</span>
                  <span className="font-bold text-emerald-700">{confirmedResult.stayRef}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-bold text-slate-800">{confirmedResult.bookingRef}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Guest Name:</span>
                  <span className="font-bold text-slate-800">{confirmedResult.guestName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Assigned Room:</span>
                  <span className="font-bold text-emerald-800">
                    Room {confirmedResult.roomNumber} ({confirmedResult.roomTypeName})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Dates:</span>
                  <span className="font-medium text-slate-700">
                    {confirmedResult.checkInDate} to {confirmedResult.checkOutDate} ({confirmedResult.nights} night{confirmedResult.nights > 1 ? 's' : ''})
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-700">{confirmedResult.paymentStatus}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PrintIcon sx={{ fontSize: 16 }} />
                  Print Check-In Slip
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1-3) */}
        {step < 4 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setErrorBanner('');
                  setStep((s) => s - 1);
                }}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleProceedFromStep1}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Continue to Room Selection →
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleProceedFromStep2}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Continue to Payment →
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleCompleteCheckIn}
                disabled={isSubmitting || (paymentOption === 'PAY_NOW' && paymentMethod === 'Cash' && hasActiveShift === false)}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                  isSubmitting || (paymentOption === 'PAY_NOW' && paymentMethod === 'Cash' && hasActiveShift === false)
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <ExpressIcon sx={{ fontSize: 16 }} />
                <span>
                  {isSubmitting
                    ? 'Processing Check-In...'
                    : `Complete Check-In ${totalAmount > 0 ? `(PKR ${totalAmount.toLocaleString()})` : ''}`}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
