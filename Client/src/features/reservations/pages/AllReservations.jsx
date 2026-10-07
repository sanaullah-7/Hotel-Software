import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Alert } from '@mui/material';
import reservationService from '../../../services/reservationService';
import stayService from '../../../services/stayService';
import { toFrontendReservation, toBackendReservationPayload } from '../adapters/reservationAdapter';
import {
  getReservations,
  syncReservationsFromBackend,
  saveReservations,
  RESERVATIONS_UPDATED_EVENT
} from '../state/reservationStore';
import {
  getBookingDues,
  getCanonicalBookingPaymentStatus,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../payment-billing/pages/paymentBillingStore';
import { addGuest, findGuestByExactIdentity, resolveGuestForBooking } from '../../guests/state/guestStore';
import { getRoomByRoomNo } from '../../rooms/state/roomStore';
import { isRoomBlockingBooking, normalizeBookingStatus, validateStayDates } from '../state/bookingRules';

import ReservationToolbar from '../components/ReservationToolbar';
import ReservationTable from '../components/ReservationTable';
import ReservationViewModal from '../components/ReservationViewModal';
import ReservationFormModal from '../components/ReservationFormModal';
import ReservationCancelModal from '../components/ReservationCancelModal';
import { addAuditLog } from '../../audit/state/auditStore.js';

export default function AllBookings({ title = 'All Booking', showDateFilter = false }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('Daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modals state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Booking Form State
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    mobile: '',
    city: '',
    passport: '',
    nationality: '',
    checkIn: '',
    checkOut: '',
    package: 'All inclusive',
    totalPerson: '1',
    numRooms: '1',
    roomType: 'Delux',
    arrivalTime: 'Morning',
    purpose: 'Leisure',
    paymentMethod: 'Paid',
    discountCode: '',
    bookingRef: '',
    emergencyName: '',
    emergencyPhone: '',
    address: '',
    specialRequests: '',
    note: ''
  });

  const isFormValid = (form.firstName || '').trim() !== '';

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservationService.getReservations();
      const rawReservations = Array.isArray(response?.data?.reservations)
        ? response.data.reservations
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.reservations)
            ? response.reservations
            : (Array.isArray(response) ? response : []);

      const adapted = rawReservations.map(toFrontendReservation).filter(Boolean);
      setBookings(adapted);
      syncReservationsFromBackend(rawReservations);
    } catch (err) {
      setError(err?.message || 'Failed to load reservations from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  useEffect(() => {
    const handleFinancialUpdate = () => {
      loadReservations();
    };
    window.addEventListener(INVOICES_UPDATED_EVENT, handleFinancialUpdate);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, handleFinancialUpdate);
    window.addEventListener(REFUNDS_UPDATED_EVENT, handleFinancialUpdate);
    return () => {
      window.removeEventListener(INVOICES_UPDATED_EVENT, handleFinancialUpdate);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, handleFinancialUpdate);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, handleFinancialUpdate);
    };
  }, [loadReservations]);

  const persistBookings = (nextBookings) => {
    setBookings(nextBookings);
    saveReservations(nextBookings);
  };

  const handleRefresh = () => {
    setSearch('');
    loadReservations();
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(
    (b) =>
      (b.name && b.name.toLowerCase().includes(search.toLowerCase())) ||
      (b.email && b.email.toLowerCase().includes(search.toLowerCase())) ||
      (b.mobile && b.mobile.includes(search))
  );

  const exportColumns = ['Name', 'Package', 'Room Type', 'Status', 'Check In', 'Check Out', 'Payment', 'Dues', 'Mobile'];

  const handleExportCSV = () => {
    let csvContent = exportColumns.join(',') + '\n';

    filteredBookings.forEach((b) => {
      const row = exportColumns.map((col) => {
        let val = '';
        if (col === 'Name') val = b.name;
        else if (col === 'Package') val = b.package;
        else if (col === 'Room Type') val = b.roomType;
        else if (col === 'Status') val = b.status;
        else if (col === 'Check In') val = b.checkIn;
        else if (col === 'Check Out') val = b.checkOut;
        else if (col === 'Payment') val = getCanonicalBookingPaymentStatus(b.id) ?? b.payment ?? '';
        else if (col === 'Dues') {
          const duesAmt = getBookingDues(b);
          val = duesAmt === null ? 'Unverified' : duesAmt > 0 ? `$${duesAmt.toLocaleString()}` : '$0';
        } else if (col === 'Mobile') val = b.mobile;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bookings.csv';
    link.click();
  };

  const handleExportPDF = () => {
    let html = `
      <html>
      <head>
        <title>Bookings Report</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
          th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
          h2 { color: #0f172a; margin-bottom: 5px; }
          .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h2>Bookings Report</h2>
        <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
        <table>
          <thead>
            <tr>${exportColumns.map((c) => `<th>${c}</th>`).join('')}</tr>
          </thead>
          <tbody>`;

    filteredBookings.forEach((b) => {
      html += '<tr>';
      exportColumns.forEach((col) => {
        let val = '';
        if (col === 'Name') val = b.name;
        else if (col === 'Package') val = b.package;
        else if (col === 'Room Type') val = b.roomType;
        else if (col === 'Status') val = b.status;
        else if (col === 'Check In') val = b.checkIn;
        else if (col === 'Check Out') val = b.checkOut;
        else if (col === 'Payment') val = getCanonicalBookingPaymentStatus(b.id) ?? b.payment ?? '';
        else if (col === 'Dues') {
          const duesAmt = getBookingDues(b);
          val = duesAmt === null ? 'Unverified' : duesAmt > 0 ? `$${duesAmt.toLocaleString()}` : '$0';
        } else if (col === 'Mobile') val = b.mobile;
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });

    html += `
          </tbody>
        </table>
        <script>
          window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
        </script>
      </body>
      </html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const openViewModal = (booking) => {
    setViewingBooking(booking);
    setIsViewModalOpen(true);
  };

  const openNewModal = () => {
    navigate('/reservation/new');
  };

  const openEditModal = (booking) => {
    navigate('/reservation/edit/' + booking.id);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBooking = async () => {
    try {
      if (!isFormValid) {
        alert('Please fill out First Name.');
        return;
      }

      const fullName = `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Guest';
      const guest = findGuestByExactIdentity(fullName, form.email) || addGuest({ name: fullName, email: form.email || '', phone: form.mobile || '', city: form.city || '' });
      const room = form.roomNo ? getRoomByRoomNo(form.roomNo) : null;

      const payload = toBackendReservationPayload({
        ...form,
        guestId: guest?._id || guest?.id,
        roomId: room?._id || room?.id,
      }, { isCreate: !editingId, isUpdate: !!editingId });

      if (editingId) {
        await reservationService.updateReservation(editingId, payload);
      } else {
        await reservationService.createReservation(payload);
      }
      await loadReservations();
      setIsBookingModalOpen(false);
    } catch (err) {
      alert('Error saving booking: ' + (err?.message || 'Failed to save booking.'));
    }
  };

  const confirmCancel = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
    setActiveMenuId(null);
  };

  const handleCancelBooking = async () => {
    if (bookingToCancel) {
      try {
        const canonicalId = bookingToCancel._id || bookingToCancel.canonicalBookingId || bookingToCancel.id;
        const res = await reservationService.cancelReservation(canonicalId, "Cancelled by user");
        const updatedBackend = res?.data?.reservation || res?.data || res;
        const adapted = toFrontendReservation(updatedBackend) || { ...bookingToCancel, status: 'Cancelled' };

        // Synchronize compatibility store
        const currentStored = getReservations([]);
        const updatedList = currentStored.map((b) =>
          (String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)) ? adapted : b
        );
        syncReservationsFromBackend(updatedList);
        setBookings(updatedList);

        setIsCancelModalOpen(false);
        setBookingToCancel(null);
      } catch (error) {
        alert(error?.message || 'Failed to cancel reservation');
      }
    }
  };

  const handleCheckout = async (id) => {
    try {
      const booking = bookings.find((b) => String(b.id) === String(id) || String(b._id) === String(id));
      if (!booking) throw new Error('Booking not found');
      if (normalizeBookingStatus(booking.status) !== 'Checked In') {
        throw new Error('Only a checked-in booking can be checked out.');
      }
      const canonicalId = booking._id || booking.canonicalBookingId || booking.id || id;
      const payload = {
        reservation_id: canonicalId,
        notes: 'Checked out from All Reservations'
      };
      if (booking.stayId && /^[0-9a-fA-F]{24}$/.test(String(booking.stayId).trim())) {
        payload.stay_id = String(booking.stayId).trim();
      }
      const res = await stayService.checkOut(payload);
      const updatedBackend = res?.data?.reservation || res?.reservation;
      if (updatedBackend) {
        const adapted = toFrontendReservation(updatedBackend);
        setBookings((current) => current.map((b) =>
          (String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)) ? adapted : b
        ));
        const currentStored = getReservations([]);
        const updatedList = currentStored.map((b) =>
          (String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)) ? adapted : b
        );
        syncReservationsFromBackend(updatedList);
      } else {
        await loadReservations();
      }
      setActiveMenuId(null);
    } catch (error) {
      alert(error?.message || 'Check-out failed');
    }
  };

  const handleRowClick = (booking) => {
    const guest = resolveGuestForBooking(booking);
    if (guest) navigate(`/guests/${guest.id}`);
    else { setViewingBooking(booking); setIsViewModalOpen(true); }
  };

  return (
    <div className="w-full space-y-2.5 pb-3">
      <ReservationToolbar
        title={title}
        search={search}
        onSearchChange={setSearch}
        showDateFilter={showDateFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        customStartDate={customStartDate}
        onCustomStartDateChange={setCustomStartDate}
        customEndDate={customEndDate}
        onCustomEndDateChange={setCustomEndDate}
        onOpenNewModal={openNewModal}
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
      />

      {error && (
        <Alert severity="error" className="shadow-xs text-xs" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <ReservationTable
        bookings={filteredBookings}
        loading={loading}
        activeMenuId={activeMenuId}
        onToggleMenu={toggleMenu}
        onCloseMenu={() => setActiveMenuId(null)}
        onRowClick={handleRowClick}
        onOpenViewModal={openViewModal}
        onOpenEditModal={openEditModal}
        onConfirmCancel={confirmCancel}
        onCheckout={handleCheckout}
      />

      <ReservationViewModal
        open={isViewModalOpen}
        booking={viewingBooking}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={openEditModal}
      />

      <ReservationFormModal
        open={isBookingModalOpen}
        editingId={editingId}
        form={form}
        onFormChange={handleFormChange}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
      />

      <ReservationCancelModal
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSubmit={handleCancelBooking}
      />
    </div>
  );
}
