import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CheckInOutSummary from '../components/CheckInOutSummary';
import CheckInOutTable from '../components/CheckInOutTable';
import CheckInOutViewModal from '../components/CheckInOutViewModal';
import ExpressCheckInModal from '../components/ExpressCheckInModal';
import {
  CheckInActionModal,
  CheckOutActionModal
} from '../components/CheckInOutEditModal';
import stayService from '../../../services/stayService';
import reservationService from '../../../services/reservationService';
import billingService from '../../../services/billingService';
import { toFrontendFrontOfficeRows, toBackendCheckInPayload, toBackendCheckOutPayload } from '../adapters/stayAdapter';
import { syncReservationsFromBackend } from '../../reservations/state/reservationStore';
import { OCCUPANCY_UPDATED_EVENT } from '../../reservations/state/reservationLifecycle';

export default function CheckInOut() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lifecycleError, setLifecycleError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [viewGuest, setViewGuest] = useState(null);
  const [checkInActionModal, setCheckInActionModal] = useState(null);
  const [checkOutActionModal, setCheckOutActionModal] = useState(null);

  useEffect(() => {
    if (searchParams.get('express') === 'true') {
      setIsExpressModalOpen(true);
    }
  }, [searchParams]);

  const loadFrontOfficeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [staysRes, reservationsRes] = await Promise.all([
        stayService.getStays(),
        reservationService.getReservations(),
      ]);

      const rawStays = Array.isArray(staysRes?.data)
        ? staysRes.data
        : (Array.isArray(staysRes) ? staysRes : (staysRes?.data?.stays || []));

      const rawReservations = Array.isArray(reservationsRes?.data)
        ? reservationsRes.data
        : (Array.isArray(reservationsRes) ? reservationsRes : (reservationsRes?.data?.reservations || []));

      const rows = toFrontendFrontOfficeRows(rawStays, rawReservations);

      setGuests(rows);
      if (rawReservations.length > 0) {
        syncReservationsFromBackend(rawReservations);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load Front Office records from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFrontOfficeData();
  }, [loadFrontOfficeData]);

  useEffect(() => {
    const handleSync = () => {
      loadFrontOfficeData();
    };
    window.addEventListener(OCCUPANCY_UPDATED_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(OCCUPANCY_UPDATED_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadFrontOfficeData]);

  const totalGuests = guests.length;
  const checkedInCount = guests.filter((g) => g.status === 'Checked In').length;
  const checkedOutCount = guests.filter((g) => g.status === 'Checked Out').length;
  const pendingCount = guests.filter((g) => ['Pending', 'Booked', 'Reserved'].includes(g.status)).length;

  const filteredGuests = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        String(g.name || '').toLowerCase().includes(q) ||
        String(g.room || '').toLowerCase().includes(q) ||
        String(g.bookingId || g.id || '').toLowerCase().includes(q)
    );
  }, [guests, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / rowsPerPage));
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const indexOfLastRow = indexOfFirstRow + rowsPerPage;
  const currentRows = filteredGuests.slice(indexOfFirstRow, indexOfLastRow);

  const handleCheckIn = async (guestOrId, extraData = {}) => {
    setLifecycleError('');
    try {
      const guestObj = typeof guestOrId === 'object' && guestOrId !== null ? guestOrId : { id: guestOrId };
      const payload = toBackendCheckInPayload({
        ...guestObj,
        manager_override: !!extraData.manager_override,
        override_cleanliness: !!extraData.override_cleanliness,
        notes: [
          guestObj.notes,
          extraData.roomKey ? `Key: ${extraData.roomKey}` : '',
          extraData.paymentStatus ? `Payment: ${extraData.paymentStatus}` : '',
          extraData.manager_override ? `[Manager Cleanliness Override Authorized]` : ''
        ].filter(Boolean).join('; '),
      });

      await stayService.checkIn(payload);

      // If staff chose "Paid in Full", settle outstanding invoice balance
      if (extraData.paymentStatus === 'Paid in Full') {
        try {
          const targetResId = guestObj.reservationId || guestObj.canonicalBookingId || (guestObj.id && /^[0-9a-fA-F]{24}$/.test(guestObj.id) ? guestObj.id : null) || guestObj.bookingId;
          const invRes = await billingService.getInvoices({ reservation_id: targetResId });
          const invList = Array.isArray(invRes?.data?.invoices) ? invRes.data.invoices : (Array.isArray(invRes?.data) ? invRes.data : []);
          const unpaidInv = invList.find((i) => i.status !== 'PAID');
          if (unpaidInv) {
            const dueToPay = Math.max(0, (unpaidInv.total_amount || 0) - (unpaidInv.amount_paid || 0));
            if (dueToPay > 0) {
              await billingService.createPayment({
                invoice_id: unpaidInv._id,
                folio_id: unpaidInv.folio_id?._id || unpaidInv.folio_id,
                guest_id: unpaidInv.guest_id?._id || unpaidInv.guest_id,
                amount: dueToPay,
                payment_method: 'Cash',
              });
            }
          }
        } catch (payErr) {
          console.warn('[CHECKIN_PAYMENT_SETTLEMENT_WARN]', payErr.message);
        }
      }

      setCheckInActionModal(null);
      await loadFrontOfficeData();
    } catch (error) {
      const msg = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Check-in failed. Please try again.';
      setLifecycleError(msg);
      throw new Error(msg);
    }
  };

  const handleCheckOut = async (guestOrId, extraData = {}) => {
    setLifecycleError('');
    try {
      const guestObj = typeof guestOrId === 'object' && guestOrId !== null ? guestOrId : { id: guestOrId };
      const targetResId = guestObj.reservationId || guestObj.canonicalBookingId || (guestObj.id && /^[0-9a-fA-F]{24}$/.test(guestObj.id) ? guestObj.id : null) || guestObj.bookingId;

      // 1. Post damage/missing item charge if reported
      if (extraData.hasDamage && extraData.damageAmount > 0) {
        try {
          await billingService.createGuestCharge({
            reservation_id: targetResId,
            charge_type: (extraData.damageItemName || '').toLowerCase().includes('missing') ? 'MISSING_ITEM' : 'DAMAGE',
            item_name: extraData.damageItemName || 'Room Damage',
            amount: extraData.damageAmount,
            description: `Checkout Inspection: ${extraData.damageItemName || 'Room Damage'}`,
            notes: `Reported during checkout by housekeeping/front desk`,
          });
        } catch (dmgErr) {
          console.warn('[CHECKOUT_DAMAGE_CHARGE_WARN]', dmgErr.message);
        }
      }

      // 2. Settle remaining balance if paid
      if (extraData.paymentMethod && extraData.paymentMethod !== 'Manager Override' && extraData.finalBalanceDue > 0) {
        try {
          const invRes = await billingService.getInvoices({ reservation_id: targetResId });
          const invList = Array.isArray(invRes?.data?.invoices) ? invRes.data.invoices : (Array.isArray(invRes?.data) ? invRes.data : []);
          const unpaidInv = invList.find((i) => i.status !== 'PAID');
          if (unpaidInv) {
            const dueToPay = Math.max(0, (unpaidInv.total_amount || 0) - (unpaidInv.amount_paid || 0));
            if (dueToPay > 0) {
              await billingService.createPayment({
                invoice_id: unpaidInv._id,
                folio_id: unpaidInv.folio_id?._id || unpaidInv.folio_id,
                guest_id: unpaidInv.guest_id?._id || unpaidInv.guest_id,
                amount: dueToPay,
                payment_method: extraData.paymentMethod || 'Cash',
              });
            }
          }
        } catch (payErr) {
          console.warn('[CHECKOUT_PAYMENT_SETTLEMENT_WARN]', payErr.message);
        }
      }

      const payload = toBackendCheckOutPayload({
        ...guestObj,
        damage_reported: extraData.hasDamage ? {
          has_damage: true,
          item_name: extraData.damageItemName || 'Room Damage',
          amount: extraData.damageAmount || 0,
          is_missing: (extraData.damageItemName || '').toLowerCase().includes('missing'),
        } : null,
        notes: [
          guestObj.notes,
          extraData.paymentMethod ? `Payment: ${extraData.paymentMethod}` : '',
          extraData.roomInspection ? `Inspection: ${extraData.roomInspection}` : '',
          extraData.hasDamage ? `Damage Added: ${extraData.damageItemName} (${extraData.damageAmount} PKR)` : '',
          extraData.managerOverride ? `[MANAGER OVERRIDE: ${extraData.overrideReason || 'Authorized'}]` : ''
        ].filter(Boolean).join('; '),
      });

      await stayService.checkOut(payload);
      setCheckOutActionModal(null);
      await loadFrontOfficeData();
    } catch (error) {
      const msg = error?.message || error?.data?.message || 'Check-out failed. Please try again.';
      setLifecycleError(msg);
      throw error;
    }
  };

  return (
    <div className="animate-fade-in space-y-2.5 pb-3">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-1 border-b border-slate-200">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            Front Desk Operations
          </h1>
          <p className="text-[11.5px] text-slate-500 font-medium">
            Manage arrivals, in-house stays, keycards, and walk-in check-in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpressModalOpen(true)}
          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>⚡</span>
          <span>Express Walk-In Check-In</span>
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <CheckInOutSummary
        totalGuests={totalGuests}
        checkedInCount={checkedInCount}
        checkedOutCount={checkedOutCount}
        pendingCount={pendingCount}
      />

      {/* ERROR ALERTS */}
      {error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadFrontOfficeData}
            className="px-2.5 py-1 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors cursor-pointer text-[11px]"
          >
            Retry
          </button>
        </div>
      )}

      {lifecycleError && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
          {lifecycleError}
        </div>
      )}

      {/* MAIN TABLE */}
      <CheckInOutTable
        guests={guests}
        filteredGuests={filteredGuests}
        currentRows={currentRows}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          const query = typeof val === 'string' ? val : (val?.target?.value ?? '');
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        totalGuests={totalGuests}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
        totalPages={totalPages}
        indexOfFirstRow={indexOfFirstRow}
        indexOfLastRow={indexOfLastRow}
        onCheckInAction={(guest) => setCheckInActionModal(guest)}
        onCheckOutAction={(guest) => setCheckOutActionModal(guest)}
        onViewGuest={(guest) => setViewGuest(guest)}
        onEditGuest={() => setLifecycleError('Edit booking details from Reservations.')}
        onDeleteGuest={() => setLifecycleError('Bookings cannot be deleted from Front Office.')}
      />

      {/* VIEW MODAL */}
      {viewGuest && (
        <CheckInOutViewModal
          guest={viewGuest}
          onClose={() => setViewGuest(null)}
          onEdit={() => setLifecycleError('Edit booking details from Reservations.')}
        />
      )}

      {/* CHECK-IN ACTION MODAL */}
      {checkInActionModal && (
        <CheckInActionModal
          guest={checkInActionModal}
          onClose={() => setCheckInActionModal(null)}
          onComplete={async (guest, extraData) => {
            await handleCheckIn(guest, extraData);
          }}
        />
      )}

      {/* CHECK-OUT ACTION MODAL */}
      {checkOutActionModal && (
        <CheckOutActionModal
          guest={checkOutActionModal}
          onClose={() => setCheckOutActionModal(null)}
          onComplete={async (guest, extraData) => {
            await handleCheckOut(guest, extraData);
          }}
        />
      )}

      {/* EXPRESS CHECK-IN MODAL */}
      <ExpressCheckInModal
        isOpen={isExpressModalOpen}
        onClose={() => {
          setIsExpressModalOpen(false);
          if (searchParams.get('express')) {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('express');
                return next;
              },
              { replace: true }
            );
          }
        }}
        onSuccess={async () => {
          await loadFrontOfficeData();
        }}
      />
    </div>
  );
}
