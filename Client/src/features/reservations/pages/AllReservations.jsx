import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getReservations,
  resetReservations,
  saveReservations,
  RESERVATIONS_UPDATED_EVENT
} from '../state/reservationStore';
import { getBookingDues } from '../../payment-billing/pages/paymentBillingStore';

import ReservationToolbar from '../components/ReservationToolbar';
import ReservationTable from '../components/ReservationTable';
import ReservationViewModal from '../components/ReservationViewModal';
import ReservationFormModal from '../components/ReservationFormModal';
import ReservationDeleteModal from '../components/ReservationDeleteModal';
import ReservationCancelModal from '../components/ReservationCancelModal';

const initialBookings = [
  { id: 1, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=11', package: 'All inclusive', roomType: 'Delux', status: 'Cancelled', checkIn: '02/25/2023', checkOut: '02/28/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 2, name: 'Sarah Smith', avatar: 'https://i.pravatar.cc/150?img=5', package: 'Business', roomType: 'Super Delux', status: 'Booked', checkIn: '02/12/2023', checkOut: '02/15/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 3, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=12', package: 'All inclusive', roomType: 'Super Delux', status: 'CheckIn', checkIn: '02/25/2023', checkOut: '02/26/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 4, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=33', package: 'Business', roomType: 'Delux', status: 'Cancelled', checkIn: '02/21/2023', checkOut: '02/23/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 5, name: 'Smita Pari...', avatar: 'https://i.pravatar.cc/150?img=44', package: 'All inclusive', roomType: 'Vila', status: 'CheckOut', checkIn: '02/16/2023', checkOut: '02/19/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 6, name: 'Pankaj Sin...', avatar: 'https://i.pravatar.cc/150?img=55', package: 'Wedding', roomType: 'Double', status: 'Booked', checkIn: '02/11/2023', checkOut: '02/14/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 7, name: 'Pankaj Sin...', avatar: 'https://i.pravatar.cc/150?img=56', package: 'Business', roomType: 'Single', status: 'Booked', checkIn: '02/27/2023', checkOut: '02/28/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 8, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=34', package: 'All inclusive', roomType: 'Delux', status: 'Booked', checkIn: '02/17/2023', checkOut: '02/20/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 9, name: 'Smita Pari...', avatar: 'https://i.pravatar.cc/150?img=45', package: 'Wedding', roomType: 'Delux', status: 'CheckOut', checkIn: '02/07/2023', checkOut: '02/10/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 10, name: 'Pooja Patel', avatar: 'https://i.pravatar.cc/150?img=22', package: 'Business', roomType: 'Super Delux', status: 'Cancelled', checkIn: '02/09/2023', checkOut: '02/12/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
];

export default function AllBookings({ title = 'Bookings', showDateFilter = false }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(() => getReservations(initialBookings));
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('Daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

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
    resetReservations(initialBookings);
    setBookings(initialBookings);
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
        else if (col === 'Payment') val = b.payment;
        else if (col === 'Dues') {
          const duesAmt = getBookingDues(b);
          val = duesAmt > 0 ? `$${duesAmt.toLocaleString()}` : '$0';
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
        else if (col === 'Payment') val = b.payment;
        else if (col === 'Dues') {
          const duesAmt = getBookingDues(b);
          val = duesAmt > 0 ? `$${duesAmt.toLocaleString()}` : '$0';
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
      arrivalTime: booking.arrivalTime || 'Morning',
      purpose: booking.purpose || 'Leisure',
      paymentMethod: booking.payment || 'Paid',
      discountCode: booking.discountCode || '',
      bookingRef: booking.bookingRef || `BK-${booking.id}`,
      emergencyName: booking.emergencyName || '',
      emergencyPhone: booking.emergencyPhone || '',
      address: booking.address || '',
      specialRequests: booking.specialRequests || '',
      note: booking.note || ''
    });
    setIsBookingModalOpen(true);
    setActiveMenuId(null);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBooking = () => {
    try {
      if (!isFormValid) {
        alert('Please fill out First Name.');
        return;
      }

      let checkInDate = form.checkIn || new Date().toLocaleDateString();
      let checkOutDate = form.checkOut || new Date().toLocaleDateString();
      try {
        if (form.checkIn && form.checkIn.includes('-')) {
          checkInDate = new Date(form.checkIn).toLocaleDateString();
        }
        if (form.checkOut && form.checkOut.includes('-')) {
          checkOutDate = new Date(form.checkOut).toLocaleDateString();
        }
      } catch (e) {}

      const fullName = `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Guest';

      if (editingId) {
        persistBookings(
          bookings.map((b) =>
            b.id === editingId
              ? {
                  ...b,
                  name: fullName,
                  package: form.package || 'All inclusive',
                  roomType: form.roomType || 'Delux',
                  payment: form.paymentMethod || 'Paid',
                  status: b.status || 'Booked',
                  checkIn: checkInDate,
                  checkOut: checkOutDate,
                  email: form.email || 'test@email.com',
                  mobile: form.mobile || '1234567890',
                  gender: form.gender,
                  city: form.city,
                  passport: form.passport,
                  nationality: form.nationality,
                  totalPerson: form.totalPerson,
                  numRooms: form.numRooms,
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
          )
        );
      } else {
        const newId = bookings.length ? Math.max(...bookings.map((b) => b.id)) + 1 : 1;
        const newBooking = {
          id: newId,
          guestId: `GST-${newId}`,
          name: fullName,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
          package: form.package || 'All inclusive',
          roomType: form.roomType || 'Delux',
          status: 'Booked',
          checkIn: checkInDate,
          checkOut: checkOutDate,
          payment: form.paymentMethod || 'Paid',
          email: form.email || 'test@email.com',
          mobile: form.mobile || '1234567890',
          gender: form.gender,
          city: form.city,
          passport: form.passport,
          nationality: form.nationality,
          totalPerson: form.totalPerson,
          numRooms: form.numRooms,
          arrivalTime: form.arrivalTime,
          purpose: form.purpose,
          discountCode: form.discountCode,
          bookingRef: form.bookingRef,
          emergencyName: form.emergencyName,
          emergencyPhone: form.emergencyPhone,
          address: form.address,
          specialRequests: form.specialRequests,
          note: form.note
        };
        persistBookings([newBooking, ...bookings]);
      }
      setIsBookingModalOpen(false);
    } catch (err) {
      alert('Error saving booking: ' + err.message);
    }
  };

  const confirmDelete = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
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
    setActiveMenuId(null);
  };

  const handleCancelBooking = () => {
    if (bookingToCancel) {
      persistBookings(bookings.map((b) => (b.id === bookingToCancel.id ? { ...b, status: 'Cancelled' } : b)));
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCheckout = (id) => {
    persistBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'CheckOut' } : b)));
    setActiveMenuId(null);
  };

  const handleRowClick = (booking) => {
    navigate(`/guests/${booking.guestId || `GST-${booking.id}`}`);
  };

  return (
    <div className="w-full h-full flex flex-col pt-1">
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

      <ReservationTable
        bookings={filteredBookings}
        activeMenuId={activeMenuId}
        onToggleMenu={toggleMenu}
        onCloseMenu={() => setActiveMenuId(null)}
        onRowClick={handleRowClick}
        onOpenViewModal={openViewModal}
        onOpenEditModal={openEditModal}
        onConfirmDelete={confirmDelete}
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
