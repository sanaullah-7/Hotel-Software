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
  RESERVATIONS_UPDATED_EVENT
} from '../../../features/reservations/state/reservationStore';
import { addGuest, findGuestByExactIdentity, resolveGuestForBooking } from '../../../features/guests/state/guestStore';
import { getRoomByRoomNo } from '../../../features/rooms/state/roomStore';
import { normalizeBookingStatus, isRoomBlockingBooking, validateStayDates } from '../../../features/reservations/state/bookingRules';
import { cancelBooking, checkOutBooking, saveBookingsWithRoomState, validateBookingRequest } from '../../../features/reservations/state/reservationLifecycle';
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
import ReservationFormModal from '../../../features/reservations/components/ReservationFormModal';
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

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

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
    roomNo: '101',
    arrivalTime: 'Morning',
    purpose: 'Leisure',
    paymentMethod: 'Paid',
    discountCode: '',
    bookingRef: '',
    emergencyName: '',
    emergencyPhone: '',
    address: '',
    specialRequests: '',
    note: '',
    avatar: '',
    avatarFileName: ''
  });

  const isFormValid = (form.firstName || '').trim() !== '';

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const syncReservations = () => setBookings(getReservations(initialBookings));
    window.addEventListener('storage', syncReservations);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
    // Job 23: refresh booking list on financial mutations so payment display stays current
    window.addEventListener(INVOICES_UPDATED_EVENT, syncReservations);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, syncReservations);
    window.addEventListener(REFUNDS_UPDATED_EVENT, syncReservations);
    return () => {
      window.removeEventListener('storage', syncReservations);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
      window.removeEventListener(INVOICES_UPDATED_EVENT, syncReservations);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, syncReservations);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, syncReservations);
    };
  }, []);

  const persistBookings = (nextBookings) => {
    setBookings(nextBookings);
    saveReservations(nextBookings);
  };

  const handleRefresh = () => {
    setSearch('');
    setDateFilter('All');
    setCustomStartDate('');
    setCustomEndDate('');
    setBookings(getReservations(initialBookings));
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
    setEditingId(booking.id);
    const [firstName, ...lastNames] = (booking.name || '').split(' ');
    setForm({
      firstName: firstName || '',
      lastName: lastNames.join(' ') || '',
      email: booking.email || '',
      gender: booking.gender || '',
      mobile: booking.mobile || '',
      city: booking.city || '',
      passport: booking.passport || '',
      nationality: booking.nationality || '',
      checkIn: booking.checkIn || '',
      checkOut: booking.checkOut || '',
      package: booking.package || 'All inclusive',
      totalPerson: booking.totalPerson || '1',
      numRooms: booking.numRooms || '1',
      roomType: booking.roomType || 'Delux',
      roomNo: booking.roomNo || booking.room || '101',
      arrivalTime: booking.arrivalTime || 'Morning',
      purpose: booking.purpose || 'Leisure',
      paymentMethod: booking.payment || 'Paid',
      discountCode: booking.discountCode || '',
      bookingRef: booking.bookingRef || `BK-${booking.id}`,
      emergencyName: booking.emergencyName || '',
      emergencyPhone: booking.emergencyPhone || '',
      address: booking.address || '',
      specialRequests: booking.specialRequests || '',
      note: booking.note || '',
      avatar: booking.avatar || '',
      avatarFileName: ''
    });
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isFormValid) return;
    try {
    const editingBooking = editingId ? bookings.find((booking) => booking.id === editingId) : null;
    validateStayDates(form.checkIn, form.checkOut);
    const room = form.roomNo ? getRoomByRoomNo(form.roomNo) : null;
    if (form.roomNo && !room) throw new Error(`Room ${form.roomNo} does not identify exactly one canonical room.`);
    if (!editingBooking || isRoomBlockingBooking(editingBooking)) {
      if (room) validateBookingRequest({ roomId: room.id, checkIn: form.checkIn, checkOut: form.checkOut, bookings, excludeBookingId: editingId });
    }

    if (editingId) {
      const previousRoomId = editingBooking?.roomId;
      const updated = bookings.map((b) =>
        b.id === editingId
          ? {
              ...b,
              name: `${form.firstName || ''} ${form.lastName || ''}`.trim() || b.name,
              avatar: form.avatar || b.avatar,
              email: form.email,
              gender: form.gender,
              mobile: form.mobile,
              city: form.city,
              passport: form.passport,
              nationality: form.nationality,
              package: form.package,
              roomType: form.roomType,
              roomNo: form.roomNo || b.roomNo || '101',
              roomId: room?.id,
              checkIn: form.checkIn,
              checkOut: form.checkOut,
              payment: form.paymentMethod,
              arrivalTime: form.arrivalTime,
              purpose: form.purpose,
              discountCode: form.discountCode,
              bookingRef: form.bookingRef,
              emergencyName: form.emergencyName,
              emergencyPhone: form.emergencyPhone,
              address: form.address,
              specialRequests: form.specialRequests,
              note: form.note
            }
          : b
      );
      setBookings(updated);
      saveBookingsWithRoomState(updated, [previousRoomId, room?.id].filter((id) => id !== undefined && id !== null));
    } else {
      const fullName = `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Guest';
      const guest = findGuestByExactIdentity(fullName, form.email) || addGuest({ name: fullName, email: form.email || '', phone: form.mobile || '', city: form.city || '' });
      let newId = Date.now();
      while (bookings.some((booking) => String(booking.id) === String(newId))) newId += 1;
      const newBooking = {
        id: newId,
        guestId: guest.id,
        roomId: room?.id,
        name: fullName,
        avatar: form.avatar || ('https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 50 + 1)),
        roomNo: form.roomNo || '101',
        package: form.package || 'All inclusive',
        roomType: form.roomType || 'Delux',
        status: 'Booked',
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        payment: form.paymentMethod || 'Paid',
        email: form.email || '',
        mobile: form.mobile || '',
        city: form.city || '',
        passport: form.passport || '',
        nationality: form.nationality || '',
        arrivalTime: form.arrivalTime || 'Morning',
        purpose: form.purpose || 'Leisure',
        discountCode: form.discountCode || '',
        bookingRef: form.bookingRef || `BK-${Date.now().toString().slice(-6)}`,
        emergencyName: form.emergencyName || '',
        emergencyPhone: form.emergencyPhone || '',
        address: form.address || '',
        specialRequests: form.specialRequests || '',
        note: form.note || ''
      };
      const updated = [newBooking, ...bookings];
      setBookings(updated);
      saveBookingsWithRoomState(updated, room ? [room.id] : []);
    }
    setIsBookingModalOpen(false);
    } catch (error) { window.alert(error.message); }
  };

  const confirmDelete = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (bookingToDelete) {
      if (normalizeBookingStatus(bookingToDelete.status) === 'Checked In') {
        window.alert('Check out this booking before deleting it.');
        return;
      }
      persistBookings(bookings.filter((b) => b.id !== bookingToDelete.id));
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    }
  };

  const confirmCancel = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleCancelBooking = () => {
    if (bookingToCancel) {
      try {
        const updatedBooking = cancelBooking(bookingToCancel.id, bookings);
        setBookings((current) => current.map((booking) => String(booking.id) === String(updatedBooking.id) ? updatedBooking : booking));
        setIsCancelModalOpen(false);
        setBookingToCancel(null);
      } catch (error) { window.alert(error.message); }
    }
  };

  const handleCheckout = (id) => {
    try {
      const updated = checkOutBooking(id);
      setBookings((current) => current.map((booking) => String(booking.id) === String(updated.id) ? updated : booking));
    } catch (error) { window.alert(error.message); }
  };

  const handleExportCSV = () => {
    const cols = ['Name', 'Room', 'Room Type', 'Package', 'Status', 'Check In', 'Check Out', 'Payment', 'Dues', 'Mobile'];
    let csvContent = cols.join(',') + '\n';

    filteredBookings.forEach((b) => {
      const duesAmt = getBookingDues(b);
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
      const duesAmt = getBookingDues(b);
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
      <div className="p-3 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[15px] font-bold text-gray-800 whitespace-nowrap">{title}</h2>

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
                  className={`px-2.5 py-1 text-[11.5px] font-medium transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
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
                <div className="p-3.5 w-[260px]">
                  <h3 className="font-bold text-gray-700 text-xs mb-2.5">Custom Date Range</h3>
                  <div className="space-y-3">
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

      <ReservationFormModal
        open={isBookingModalOpen}
        editingId={editingId}
        form={form}
        onFormChange={handleFormChange}
        onClose={() => setIsBookingModalOpen(false)}
        onSave={handleSaveBooking}
        onSubmit={handleSaveBooking}
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
