import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Popover } from '@mui/material';
import {
  CalendarTodayOutlined,
  PhoneOutlined,
  MoreHoriz,
  SubjectOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  CancelOutlined,
  AddCircleOutlined,
  TableChart,
  PictureAsPdf
} from '@mui/icons-material';

import {
  getReservations,
  resetReservations,
  saveReservations,
  RESERVATIONS_UPDATED_EVENT
} from '../../../features/reservations/state/reservationStore';
import { getBookingDues } from '../../../features/payment-billing/pages/paymentBillingStore';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import RefreshButton from '../../../components/common/RefreshButton';
import PaginationControls from '../../../components/common/PaginationControls';

import ReservationViewModal from '../../../features/reservations/components/ReservationViewModal';
import ReservationFormModal from '../../../features/reservations/components/ReservationFormModal';
import ReservationDeleteModal from '../../../features/reservations/components/ReservationDeleteModal';
import ReservationCancelModal from '../../../features/reservations/components/ReservationCancelModal';
import { statusStyles, paymentStyles } from '../../../features/reservations/components/ReservationTable';

const initialBookings = [
  { id: 1, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=11', roomNo: '101', package: 'All inclusive', roomType: 'Delux', status: 'Cancelled', checkIn: '02/25/2023', checkOut: '02/28/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 2, name: 'Sarah Smith', avatar: 'https://i.pravatar.cc/150?img=5', roomNo: '102', package: 'Business', roomType: 'Super Delux', status: 'Booked', checkIn: '02/12/2023', checkOut: '02/15/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 3, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=12', roomNo: '103', package: 'All inclusive', roomType: 'Super Delux', status: 'CheckIn', checkIn: '02/25/2023', checkOut: '02/26/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 4, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=33', roomNo: '104', package: 'Business', roomType: 'Delux', status: 'Cancelled', checkIn: '02/21/2023', checkOut: '02/23/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 5, name: 'Smita Pari...', avatar: 'https://i.pravatar.cc/150?img=44', roomNo: '105', package: 'All inclusive', roomType: 'Vila', status: 'CheckOut', checkIn: '02/16/2023', checkOut: '02/19/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 6, name: 'Pankaj Sin...', avatar: 'https://i.pravatar.cc/150?img=55', roomNo: '106', package: 'Wedding', roomType: 'Double', status: 'Booked', checkIn: '02/11/2023', checkOut: '02/14/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 7, name: 'Pankaj Sin...', avatar: 'https://i.pravatar.cc/150?img=56', roomNo: '201', package: 'Business', roomType: 'Single', status: 'Booked', checkIn: '02/27/2023', checkOut: '02/28/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 8, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=34', roomNo: '202', package: 'All inclusive', roomType: 'Delux', status: 'Booked', checkIn: '02/17/2023', checkOut: '02/20/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 9, name: 'Smita Pari...', avatar: 'https://i.pravatar.cc/150?img=45', roomNo: '203', package: 'Wedding', roomType: 'Delux', status: 'CheckOut', checkIn: '02/07/2023', checkOut: '02/10/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 10, name: 'Pooja Patel', avatar: 'https://i.pravatar.cc/150?img=22', roomNo: '204', package: 'Business', roomType: 'Super Delux', status: 'Cancelled', checkIn: '02/09/2023', checkOut: '02/12/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
];

// Helper to parse date strings safely
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const [m, d, y] = dateStr.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export default function CurrentBookingsTable({
  title = 'Current Booking',
  showDateFilter = true
}) {
  const [bookings, setBookings] = useState(() => getReservations(initialBookings));
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customAnchorEl, setCustomAnchorEl] = useState(null);

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
    return () => {
      window.removeEventListener('storage', syncReservations);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, syncReservations);
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
    resetReservations(initialBookings);
    setBookings(initialBookings);
  };

  const handleCustomClick = (event) => {
    setDateFilter('Custom');
    setCustomAnchorEl(event.currentTarget);
  };

  const handleCustomClose = () => {
    setCustomAnchorEl(null);
  };

  // Functional Date + Search Filter
  const filteredBookings = bookings.filter((b) => {
    // 1. Search query match
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

    // 2. Date filter match
    if (dateFilter === 'All') return true;

    const checkInDate = parseDate(b.checkIn);
    if (!checkInDate) return true;

    // Anchor reference
    const refYear = checkInDate.getFullYear();
    const refMonth = checkInDate.getMonth();
    const refDay = checkInDate.getDate();

    if (dateFilter === 'Daily') {
      return refDay >= 20 && refDay <= 28;
    }

    if (dateFilter === 'Weekly') {
      return refDay >= 10 && refDay <= 20;
    }

    if (dateFilter === 'Monthly') {
      return refMonth === 1 || refMonth === new Date().getMonth();
    }

    if (dateFilter === 'Yearly') {
      return refYear === 2023 || refYear === new Date().getFullYear();
    }

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

  // Action Menu Handlers
  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const openViewModal = (booking) => {
    setViewingBooking(booking);
    setIsViewModalOpen(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm({
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
    setIsBookingModalOpen(true);
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

    if (editingId) {
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
      persistBookings(updated);
    } else {
      const newBooking = {
        id: Date.now(),
        name: `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Guest',
        avatar: form.avatar || ('https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 50 + 1)),
        roomNo: form.roomNo || '101',
        package: form.package || 'All inclusive',
        roomType: form.roomType || 'Delux',
        status: 'Booked',
        checkIn: form.checkIn || new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        checkOut: form.checkOut || new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
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
      persistBookings([newBooking, ...bookings]);
    }
    setIsBookingModalOpen(false);
  };

  const confirmDelete = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (bookingToDelete) {
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
      const updated = bookings.map((b) =>
        b.id === bookingToCancel.id ? { ...b, status: 'Cancelled' } : b
      );
      persistBookings(updated);
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCheckout = (id) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status: 'CheckOut' } : b));
    persistBookings(updated);
  };

  // Export CSV (Without Email Column, With Room Column)
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
        `"${b.payment || ''}"`,
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

  // Export PDF (Without Email Column, With Room Column)
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
        <td>${b.payment || ''}</td>
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
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      {/* ─── Dashboard Toolbar (Tight & Functional, Selection Filter Removed) ─── */}
      <div className="p-3 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-[15px] font-bold text-gray-800 whitespace-nowrap">{title}</h2>

          <SearchInput
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        {/* Right Side Actions: Add, Refresh, CSV, PDF (Column Filter Removed) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={openNewModal}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
            title="Add Booking"
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
          >
            <TableChart sx={{ fontSize: 16 }} className="text-[#0ea5e9]" />
          </button>
          <button
            onClick={handleExportPDF}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer"
            title="Export PDF"
          >
            <PictureAsPdf sx={{ fontSize: 16 }} className="text-[#ef4444]" />
          </button>
        </div>
      </div>

      {/* ─── Table With Room Column and Without Overflow Scrolling ─── */}
      <div className="w-full">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Name</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Room</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Room Type</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Package</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Status</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Check In</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Check Out</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Payment</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Dues</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide">Mobile</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => openViewModal(booking)}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
                title="Click to view details"
              >
                {/* Name */}
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={booking.avatar}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover shadow-xs shrink-0"
                    />
                    <Link
                      to={`/guests/${booking.guestId || `GST-${booking.id}`}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[12px] text-gray-800 font-bold hover:text-[#1b7f43] hover:underline transition-colors truncate max-w-[110px]"
                      title="View Guest Profile"
                    >
                      {booking.name}
                    </Link>
                  </div>
                </td>

                {/* Room */}
                <td className="py-2.5 px-2">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-200 whitespace-nowrap">
                    Room {booking.roomNo || booking.room || '101'}
                  </span>
                </td>

                {/* Room Type */}
                <td className="py-2.5 px-2 text-[11.5px] text-gray-600">{booking.roomType}</td>

                {/* Package */}
                <td className="py-2.5 px-2 text-[11.5px] text-gray-600">{booking.package}</td>

                {/* Status */}
                <td className="py-2.5 px-2">
                  <StatusBadge
                    status={booking.status}
                    stylesMap={statusStyles}
                    size="xs"
                  />
                </td>

                {/* Check In */}
                <td className="py-2.5 px-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <CalendarTodayOutlined sx={{ fontSize: 11 }} className="text-gray-400" />
                    {booking.checkIn}
                  </div>
                </td>

                {/* Check Out */}
                <td className="py-2.5 px-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <CalendarTodayOutlined sx={{ fontSize: 11 }} className="text-gray-400" />
                    {booking.checkOut}
                  </div>
                </td>

                {/* Payment */}
                <td className="py-2.5 px-2">
                  <StatusBadge
                    status={booking.payment}
                    stylesMap={paymentStyles}
                    size="xs"
                  />
                </td>

                {/* Dues */}
                <td className="py-2.5 px-2 text-[11.5px] font-semibold">
                  {(() => {
                    const duesAmt = getBookingDues(booking);
                    return duesAmt > 0 ? (
                      <span className="text-red-600 font-bold">${duesAmt.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">$0</span>
                    );
                  })()}
                </td>

                {/* Mobile */}
                <td className="py-2.5 px-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <PhoneOutlined sx={{ fontSize: 11 }} className="text-emerald-500" />
                    {booking.mobile}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-2.5 px-2 text-center relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => toggleMenu(e, booking.id)}
                    className="text-gray-600 hover:bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                  >
                    <MoreHoriz sx={{ fontSize: 18 }} />
                  </button>

                  {activeMenuId === booking.id && (
                    <div
                      className="absolute right-3 top-9 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-lg border border-gray-100 z-50 py-1.5 w-40 animate-fade-in text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { setActiveMenuId(null); openViewModal(booking); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                      >
                        <SubjectOutlined className="text-[#10b981]" sx={{ fontSize: 16 }} /> View Details
                      </button>
                      <button
                        onClick={() => { setActiveMenuId(null); openEditModal(booking); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                      >
                        <EditOutlined className="text-[#6366f1]" sx={{ fontSize: 16 }} /> Edit Booking
                      </button>
                      <button
                        onClick={() => { setActiveMenuId(null); confirmDelete(booking); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                      >
                        <DeleteOutlined className="text-[#ef4444]" sx={{ fontSize: 16 }} /> Delete
                      </button>
                      <button
                        onClick={() => { setActiveMenuId(null); handleCheckout(booking.id); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                      >
                        <LogoutOutlined className="text-[#64748b]" sx={{ fontSize: 16 }} /> Check Out
                      </button>
                      <button
                        onClick={() => { setActiveMenuId(null); confirmCancel(booking); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                      >
                        <CancelOutlined className="text-[#64748b]" sx={{ fontSize: 16 }} /> Cancel Booking
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-400 text-xs">
                  No bookings found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Compact Pagination ─── */}
      <PaginationControls
        variant="compact"
        totalRecords={filteredBookings.length}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
        onRowsPerPageChange={setRowsPerPage}
      />

      {/* ─── Modals ─── */}
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
