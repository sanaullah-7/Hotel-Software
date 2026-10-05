import React, { useState, useMemo, useEffect } from 'react';
import CheckInOutSummary from '../components/CheckInOutSummary';
import CheckInOutTable from '../components/CheckInOutTable';
import CheckInOutViewModal from '../components/CheckInOutViewModal';
import {
  CheckInActionModal,
  CheckOutActionModal
} from '../components/CheckInOutEditModal';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../reservations/state/reservationStore';
import { buildFrontOfficeRows, checkInBooking, checkOutBooking, OCCUPANCY_UPDATED_EVENT } from '../../reservations/state/reservationLifecycle';
// PHASE 1 FIX (BUG-CIO-3): initialBookings is Dashboard seed data and must not
// be used in the operational front-office view. Legacy rows without canonical
// roomId/guestId cannot enter the check-in lifecycle and must not appear here.

// PHASE 1 FIX (BUG-CIO-2, BUG-CIO-3): Legacy initialGuests removed from the
// operational view. These records had no canonical roomId or guestId and could
// never enter the check-in/check-out lifecycle. The front-office table now shows
// only canonical reservations from hotel_reservations.

export default function CheckInOut() {
  // PHASE 1 FIX: Only canonical reservations from hotel_reservations are used.
  // Pass empty array as legacyRows — legacy rows that can't enter the lifecycle
  // must not appear in the operational front-office table.
  const [guests, setGuests] = useState(() => buildFrontOfficeRows(getReservations(), []));
  const [lifecycleError, setLifecycleError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewGuest, setViewGuest] = useState(null);
  const [checkInActionModal, setCheckInActionModal] = useState(null);
  const [checkOutActionModal, setCheckOutActionModal] = useState(null);

  useEffect(() => {
    const sync = () => setGuests(buildFrontOfficeRows(getReservations(), []));
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, sync);
    window.addEventListener(OCCUPANCY_UPDATED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, sync);
      window.removeEventListener(OCCUPANCY_UPDATED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const totalGuests = guests.length;
  const checkedInCount = guests.filter((g) => g.status === 'Checked In').length;
  const checkedOutCount = guests.filter((g) => g.status === 'Checked Out').length;
  const pendingCount = guests.filter((g) => g.status === 'Pending').length;

  const filteredGuests = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        String(g.name || '').toLowerCase().includes(q) ||
        String(g.room || '').toLowerCase().includes(q) ||
        String(g.id || '').toLowerCase().includes(q)
    );
  }, [guests, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / rowsPerPage));
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const indexOfLastRow = indexOfFirstRow + rowsPerPage;
  const currentRows = filteredGuests.slice(indexOfFirstRow, indexOfLastRow);

  const handleCheckIn = (id) => {
    try { checkInBooking(id); setLifecycleError(''); }
    catch (error) { setLifecycleError(error.message); }
  };

  const handleCheckOut = (id) => {
    try { checkOutBooking(id); setLifecycleError(''); }
    catch (error) { setLifecycleError(error.message); }
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

      {/* MAIN TABLE */}
      {lifecycleError && <div role="alert" className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">{lifecycleError}</div>}
      <CheckInOutTable
        guests={guests}
        filteredGuests={filteredGuests}
        currentRows={currentRows}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
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
          onComplete={(id) => {
            handleCheckIn(id);
            setCheckInActionModal(null);
          }}
        />
      )}

      {/* CHECK-OUT ACTION MODAL */}
      {checkOutActionModal && (
        <CheckOutActionModal
          guest={checkOutActionModal}
          onClose={() => setCheckOutActionModal(null)}
          onComplete={(id) => {
            handleCheckOut(id);
            setCheckOutActionModal(null);
          }}
        />
      )}

    </div>
  );
}
