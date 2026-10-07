import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover } from '@mui/material';
import {
  AddCircleOutlined,
  TableChart,
  PictureAsPdf
} from '@mui/icons-material';

import {
  getReservations,
  saveReservations,
  syncReservationsFromBackend,
  RESERVATIONS_UPDATED_EVENT
} from '../../../features/reservations/state/reservationStore';
import reservationService from '../../../services/reservationService';
import stayService from '../../../services/stayService';
import { toFrontendReservation } from '../../../features/reservations/adapters/reservationAdapter';
import { resolveGuestForBooking } from '../../../features/guests/state/guestStore';
import { normalizeBookingStatus } from '../../../features/reservations/state/bookingRules';
import {
  getBookingDues,
  getCanonicalBookingPaymentStatus,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../../features/payment-billing/pages/paymentBillingStore';
import SearchInput from '../../../components/common/SearchInput';
import RefreshButton from '../../../components/common/RefreshButton';
import PaginationControls from '../../../components/common/PaginationControls';

import ReservationViewModal from '../../../features/reservations/components/ReservationViewModal';
import ReservationDeleteModal from '../../../features/reservations/components/ReservationDeleteModal';
import ReservationCancelModal from '../../../features/reservations/components/ReservationCancelModal';
import { initialBookings, parseDate } from '../data/currentBookingsData';
import BookingsGridTable from './BookingsGridTable';

export default function CurrentBookingsTable({
  title = 'Current Booking',
  showDateFilter = true
}) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(() => getReservations(initialBookings));
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customAnchorEl, setCustomAnchorEl] = useState(null);

  const fetchBackendBookings = React.useCallback(async () => {
    try {
      const res = await reservationService.getReservations({ limit: 100 });
      const rawList = Array.isArray(res?.data?.reservations)
        ? res.data.reservations
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.reservations)
            ? res.reservations
            : (Array.isArray(res) ? res : null);

      if (rawList !== null) {
        const adapted = rawList.map(toFrontendReservation).filter(Boolean);
        setBookings(adapted);
        syncReservationsFromBackend(rawList);
      }
    } catch {
      // Backend request failed - preserve existing state without injecting demo data
    }
  }, []);

  const handleRowClick = (booking) => {
    const guest = resolveGuestForBooking(booking);
    if (guest) navigate(`/guests/${guest.id}`);
    else openViewModal(booking);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    fetchBackendBookings();
    const handleLocalReservationsUpdate = () => {
      const local = getReservations([]);
      setBookings(local);
    };
    const handleFinancialUpdate = () => {
      fetchBackendBookings();
    };
    window.addEventListener('storage', handleLocalReservationsUpdate);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, handleLocalReservationsUpdate);
    // Refresh booking list on financial mutations so payment display and dues stay current
    window.addEventListener(INVOICES_UPDATED_EVENT, handleFinancialUpdate);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, handleFinancialUpdate);
    window.addEventListener(REFUNDS_UPDATED_EVENT, handleFinancialUpdate);
    return () => {
      window.removeEventListener('storage', handleLocalReservationsUpdate);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, handleLocalReservationsUpdate);
      window.removeEventListener(INVOICES_UPDATED_EVENT, handleFinancialUpdate);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, handleFinancialUpdate);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, handleFinancialUpdate);
    };
  }, [fetchBackendBookings]);

  const persistBookings = (nextBookings) => {
    setBookings(nextBookings);
    saveReservations(nextBookings);
  };

  const handleRefresh = () => {
    setSearch('');
    setDateFilter('All');
    setCustomStartDate('');
    setCustomEndDate('');
    fetchBackendBookings();
    setCurrentPage(1);
  };

  const handleCustomClick = (event) => {
    setDateFilter('Custom');
    setCustomAnchorEl(event.currentTarget);
  };

  const handleCustomClose = () => {
    setCustomAnchorEl(null);
  };

  // Canonical active-booking filter: Current Bookings = Pending + Booked + Checked In
  // Excludes Checked Out and Cancelled as they are no longer operationally active.
  const activeBookings = bookings.filter((b) => {
    const s = normalizeBookingStatus(b.status);
    return s === 'Pending' || s === 'Booked' || s === 'Checked In';
  });

  // Functional Date + Search Filter (applied on top of active-booking filter)
  const filteredBookings = activeBookings.filter((b) => {
    const q = search.toLowerCase().trim();
    if (q) {
      const matchName = b.name && b.name.toLowerCase().includes(q);
      const matchMobile = b.mobile && b.mobile.includes(q);
      const matchPackage = b.package && b.package.toLowerCase().includes(q);
      const matchRoomType = b.roomType && b.roomType.toLowerCase().includes(q);
      const matchRoomNo = (b.roomNo || b.room || '').toString().toLowerCase().includes(q);
      if (!matchName && !matchMobile && !matchPackage && !matchRoomType && !matchRoomNo) {
        return false;
      }
    }

    if (dateFilter === 'All') return true;

    const checkInDate = parseDate(b.checkIn);
    if (!checkInDate) return true;

    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = now.getMonth();
    const todayD = now.getDate();

    const refYear = checkInDate.getFullYear();
    const refMonth = checkInDate.getMonth();
    const refDay = checkInDate.getDate();

    // Daily: check-in date is today
    if (dateFilter === 'Daily') return refYear === todayY && refMonth === todayM && refDay === todayD;
    // Weekly: check-in date falls within the current calendar week (Mon–Sun)
    if (dateFilter === 'Weekly') {
      const dayOfWeek = now.getDay(); // 0=Sun
      const startOfWeek = new Date(todayY, todayM, todayD - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
      return checkInDate >= startOfWeek && checkInDate < endOfWeek;
    }
    // Monthly: check-in date is in the current calendar month
    if (dateFilter === 'Monthly') return refYear === todayY && refMonth === todayM;
    // Yearly: check-in date is in the current calendar year
    if (dateFilter === 'Yearly') return refYear === todayY;

    if (dateFilter === 'Custom') {
      if (!customStartDate && !customEndDate) return true;
      const start = customStartDate ? new Date(customStartDate) : null;
      const end = customEndDate ? new Date(customEndDate) : null;

      if (start && checkInDate < start) return false;
      if (end && checkInDate > end) return false;
      return true;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / (rowsPerPage || 10)));
  const effectivePage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage) => {
    if (activeMenuId) {
      setActiveMenuId(null);
    }
    setCurrentPage(Math.min(Math.max(1, newPage), totalPages));
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    if (activeMenuId) {
      setActiveMenuId(null);
    }
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const startIndex = (effectivePage - 1) * rowsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + rowsPerPage);

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
    navigate(`/reservation/edit/${booking.id}`);
  };

  const confirmDelete = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (bookingToDelete) {
      if (normalizeBookingStatus(bookingToDelete.status) === 'Checked In') {
        window.alert('Check out this booking before cancelling it.');
        return;
      }
      try {
        const canonicalId = bookingToDelete._id || bookingToDelete.canonicalBookingId || bookingToDelete.id;
        const res = await reservationService.cancelReservation(canonicalId, 'Cancelled from dashboard');
        const updatedBackend = res?.data?.reservation || res?.data || res;
        const adapted = toFrontendReservation(updatedBackend) || { ...bookingToDelete, status: 'Cancelled' };

        const currentStored = getReservations([]);
        const updatedList = currentStored.map((b) =>
          (String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)) ? adapted : b
        );
        syncReservationsFromBackend(updatedList);
        setBookings((current) => current.map((b) =>
          (String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)) ? adapted : b
        ));

        setIsDeleteModalOpen(false);
        setBookingToDelete(null);
      } catch (error) {
        window.alert(error?.message || 'Failed to cancel reservation');
      }
    }
  };

  const confirmCancel = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleCancelBooking = async () => {
    if (bookingToCancel) {
      try {
        const canonicalId = bookingToCancel._id || bookingToCancel.canonicalBookingId || bookingToCancel.id;
        const res = await reservationService.cancelReservation(canonicalId, 'Cancelled from dashboard');
        const updatedBackend = res?.data?.reservation || res?.data || res;
        const adapted = toFrontendReservation(updatedBackend) || { ...bookingToCancel, status: 'Cancelled' };

        const currentStored = getReservations([]);
        const updatedList = currentStored.map((b) =>
          (String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)) ? adapted : b
        );
        syncReservationsFromBackend(updatedList);
        setBookings((current) => current.map((b) =>
          (String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)) ? adapted : b
        ));

        setIsCancelModalOpen(false);
        setBookingToCancel(null);
      } catch (error) {
        window.alert(error?.message || 'Failed to cancel reservation');
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
        notes: 'Checked out from Current Bookings'
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
        await fetchBackendBookings();
      }
    } catch (error) {
      window.alert(error?.message || 'Check-out failed');
    }
  };

  const handleExportCSV = () => {
    const cols = ['Name', 'Room', 'Room Type', 'Package', 'Status', 'Check In', 'Check Out', 'Payment', 'Dues', 'Mobile'];
    let csvContent = cols.join(',') + '\n';

    filteredBookings.forEach((b) => {
      const canonical = getBookingDues(b);
      const duesAmt = canonical !== null
        ? canonical
        : (b.folio_balance !== undefined && b.folio_balance !== null ? Number(b.folio_balance) : 0);
      const row = [
        `"${b.name || ''}"`,
        `"Room ${b.roomNo || b.room || '101'}"`,
        `"${b.roomType || ''}"`,
        `"${b.package || ''}"`,
        `"${b.status || ''}"`,
        `"${b.checkIn || ''}"`,
        `"${b.checkOut || ''}"`,
        `"${getCanonicalBookingPaymentStatus(b.id) ?? b.payment ?? ''}"`,
        `"${duesAmt > 0 ? `$${duesAmt.toLocaleString()}` : '$0'}"`,
        `"${b.mobile || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dashboard_current_bookings.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const cols = ['Name', 'Room', 'Room Type', 'Package', 'Status', 'Check In', 'Check Out', 'Payment', 'Dues', 'Mobile'];
    let html = `
      <html>
      <head>
        <title>Current Bookings Report</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
          th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
          h2 { color: #0f172a; margin-bottom: 5px; }
          .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h2>Current Bookings</h2>
        <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
        <table>
          <thead>
            <tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr>
          </thead>
          <tbody>`;

    filteredBookings.forEach((b) => {
      const canonical = getBookingDues(b);
      const duesAmt = canonical !== null
        ? canonical
        : (b.folio_balance !== undefined && b.folio_balance !== null ? Number(b.folio_balance) : 0);
      html += `<tr>
        <td>${b.name || ''}</td>
        <td>Room ${b.roomNo || b.room || '101'}</td>
        <td>${b.roomType || ''}</td>
        <td>${b.package || ''}</td>
        <td>${b.status || ''}</td>
        <td>${b.checkIn || ''}</td>
        <td>${b.checkOut || ''}</td>
        <td>${getCanonicalBookingPaymentStatus(b.id) ?? b.payment ?? ''}</td>
        <td>${duesAmt > 0 ? `$${duesAmt.toLocaleString()}` : '$0'}</td>
        <td>${b.mobile || ''}</td>
      </tr>`;
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

  return (
    <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm">
      {/* Dashboard Toolbar */}
      <div className="px-3.5 py-2 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-sm font-bold text-gray-800 whitespace-nowrap">{title}</h2>

          <SearchInput
            placeholder="Search..."
            value={search}
            onChange={setSearch}
            width="w-[140px] sm:w-[170px]"
            size="sm"
            inputClassName="border-gray-300"
          />

          {showDateFilter && (
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
              {['All', 'Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map((filter) => (
                <button
                  key={filter}
                  onClick={(e) => (filter === 'Custom' ? handleCustomClick(e) : setDateFilter(filter))}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
                    dateFilter === filter
                      ? 'bg-[#e5f4eb] text-[#1b7f43] font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}

              <Popover
                open={Boolean(customAnchorEl)}
                anchorEl={customAnchorEl}
                onClose={handleCustomClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <div className="p-3.5 w-[250px]">
                  <h3 className="font-bold text-gray-700 text-xs mb-2.5">Custom Date Range</h3>
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[10.5px] text-gray-500 font-semibold block mb-0.5">Start Date</span>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg text-xs px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-[#1b7f43]"
                      />
                    </div>
                    <div>
                      <span className="text-[10.5px] text-gray-500 font-semibold block mb-0.5">End Date</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg text-xs px-2.5 py-1.5 text-gray-700 focus:outline-none focus:border-[#1b7f43]"
                      />
                    </div>
                  </div>
                </div>
              </Popover>
            </div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={openNewModal}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
            title="Add Booking"
            aria-label="Add booking"
          >
            <AddCircleOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
          </button>
          <RefreshButton
            onClick={handleRefresh}
            title="Refresh"
            size="sm"
            variant="circle"
          />
          <button
            onClick={handleExportCSV}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
            title="Export CSV"
            aria-label="Export CSV"
          >
            <TableChart sx={{ fontSize: 16 }} className="text-[#0ea5e9]" />
          </button>
          <button
            onClick={handleExportPDF}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
            title="Export PDF"
            aria-label="Export PDF"
          >
            <PictureAsPdf sx={{ fontSize: 16 }} className="text-[#ef4444]" />
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <BookingsGridTable
        filteredBookings={paginatedBookings}
        handleRowClick={handleRowClick}
        activeMenuId={activeMenuId}
        toggleMenu={toggleMenu}
        setActiveMenuId={setActiveMenuId}
        openViewModal={openViewModal}
        openEditModal={openEditModal}
        confirmDelete={confirmDelete}
        handleCheckout={handleCheckout}
        confirmCancel={confirmCancel}
      />

      {/* Compact Pagination */}
      <PaginationControls
        variant="compact"
        currentPage={effectivePage}
        totalPages={totalPages}
        totalRecords={filteredBookings.length}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Modals */}
      <ReservationViewModal
        open={isViewModalOpen}
        booking={viewingBooking}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={(b) => {
          setIsViewModalOpen(false);
          openEditModal(b);
        }}
      />

      <ReservationDeleteModal
        open={isDeleteModalOpen}
        booking={bookingToDelete}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />

      <ReservationCancelModal
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSubmit={handleCancelBooking}
      />
    </div>
  );
}
