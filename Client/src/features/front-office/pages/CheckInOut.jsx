import React, { useState, useMemo, useEffect, useCallback } from 'react';
import CheckInOutSummary from '../components/CheckInOutSummary';
import CheckInOutTable from '../components/CheckInOutTable';
import CheckInOutViewModal from '../components/CheckInOutViewModal';
import {
  CheckInActionModal,
  CheckOutActionModal
} from '../components/CheckInOutEditModal';
import stayService from '../../../services/stayService';
import reservationService from '../../../services/reservationService';
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
  const [viewGuest, setViewGuest] = useState(null);
  const [checkInActionModal, setCheckInActionModal] = useState(null);
  const [checkOutActionModal, setCheckOutActionModal] = useState(null);

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
      let payload;
      if (typeof guestOrId === 'object' && guestOrId !== null) {
        payload = toBackendCheckInPayload({
          ...guestOrId,
          notes: [guestOrId.notes, extraData.roomKey ? `Key: ${extraData.roomKey}` : ''].filter(Boolean).join('; '),
        });
      } else {
        payload = toBackendCheckInPayload({ id: guestOrId });
      }

      await stayService.checkIn(payload);
      setCheckInActionModal(null);
      await loadFrontOfficeData();
    } catch (error) {
      const msg = error?.message || error?.data?.message || 'Check-in failed. Please try again.';
      setLifecycleError(msg);
      throw error;
    }
  };

  const handleCheckOut = async (guestOrId, extraData = {}) => {
    setLifecycleError('');
    try {
      let payload;
      if (typeof guestOrId === 'object' && guestOrId !== null) {
        payload = toBackendCheckOutPayload({
          ...guestOrId,
          notes: [
            guestOrId.notes,
            extraData.paymentMethod ? `Payment: ${extraData.paymentMethod}` : '',
            extraData.roomInspection ? `Inspection: ${extraData.roomInspection}` : ''
          ].filter(Boolean).join('; '),
        });
      } else {
        payload = toBackendCheckOutPayload({ id: guestOrId });
      }

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
    </div>
  );
}
