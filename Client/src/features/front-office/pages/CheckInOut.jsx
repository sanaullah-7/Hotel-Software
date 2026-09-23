import React, { useState, useMemo } from 'react';
import CheckInOutSummary from '../components/CheckInOutSummary';
import CheckInOutTable from '../components/CheckInOutTable';
import CheckInOutViewModal from '../components/CheckInOutViewModal';
import {
  GuestFormModal,
  CheckInActionModal,
  CheckOutActionModal
} from '../components/CheckInOutEditModal';
import CheckInOutDeleteModal from '../components/CheckInOutDeleteModal';

export const initialGuests = [
  { id: 'BK-1001', name: 'John Doe', email: 'john.doe@example.com', room: '101', roomType: 'Deluxe', checkIn: '5/20/24', checkOut: '5/22/24', status: 'Pending' },
  { id: 'BK-1002', name: 'Jane Smith', email: 'jane.smith@example.com', room: '205', roomType: 'Suite', checkIn: '5/19/24', checkOut: '5/21/24', status: 'Checked In' },
  { id: 'BK-1003', name: 'Robert Brown', email: 'robert.brown@example.com', room: '302', roomType: 'Standard', checkIn: '5/18/24', checkOut: '5/19/24', status: 'Checked Out' },
  { id: 'BK-1004', name: 'Emily Johnson', email: 'emily.johnson@example.com', room: '105', roomType: 'Deluxe', checkIn: '5/21/24', checkOut: '5/24/24', status: 'Reserved' },
  { id: 'BK-1005', name: 'Michael Wilson', email: 'michael.wilson@example.com', room: '210', roomType: 'Executive', checkIn: '5/22/24', checkOut: '5/25/24', status: 'Pending' },
  { id: 'BK-1006', name: 'Sarah Davis', email: 'sarah.davis@example.com', room: '112', roomType: 'Standard', checkIn: '5/16/24', checkOut: '5/18/24', status: 'Checked Out' },
  { id: 'BK-1007', name: 'David Lee', email: 'david.lee@example.com', room: '308', roomType: 'Suite', checkIn: '5/23/24', checkOut: '5/27/24', status: 'Checked In' },
  { id: 'BK-1008', name: 'Laura Martinez', email: 'laura.martinez@example.com', room: '406', roomType: 'Deluxe', checkIn: '5/24/24', checkOut: '5/26/24', status: 'Reserved' },
  { id: 'BK-1009', name: 'Chris Anderson', email: 'chris.anderson@example.com', room: '118', roomType: 'Standard', checkIn: '5/15/24', checkOut: '5/17/24', status: 'Checked Out' },
  { id: 'BK-1010', name: 'Olivia Taylor', email: 'olivia.taylor@example.com', room: '221', roomType: 'Executive', checkIn: '5/25/24', checkOut: '5/28/24', status: 'Pending' },
  { id: 'BK-1011', name: 'Daniel Thomas', email: 'daniel.thomas@example.com', room: '133', roomType: 'Deluxe', checkIn: '5/17/24', checkOut: '5/20/24', status: 'Checked In' },
  { id: 'BK-1012', name: 'Sophia White', email: 'sophia.white@example.com', room: '409', roomType: 'Suite', checkIn: '5/26/24', checkOut: '5/29/24', status: 'Reserved' },
];

export default function CheckInOut() {
  const [guests, setGuests] = useState(initialGuests);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [viewGuest, setViewGuest] = useState(null);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInActionModal, setCheckInActionModal] = useState(null);
  const [checkOutActionModal, setCheckOutActionModal] = useState(null);
  const [editGuest, setEditGuest] = useState(null);
  const [deleteGuest, setDeleteGuest] = useState(null);

  const totalGuests = guests.length;
  const checkedInCount = guests.filter((g) => g.status === 'Checked In').length;
  const checkedOutCount = guests.filter((g) => g.status === 'Checked Out').length;
  const pendingCount = guests.filter((g) => g.status === 'Pending').length;

  const filteredGuests = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.room.toLowerCase().includes(q) ||
        g.id.toLowerCase().includes(q)
    );
  }, [guests, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / rowsPerPage));
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const indexOfLastRow = indexOfFirstRow + rowsPerPage;
  const currentRows = filteredGuests.slice(indexOfFirstRow, indexOfLastRow);

  const handleCheckIn = (id) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'Checked In' } : g))
    );
  };

  const handleCheckOut = (id) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: 'Checked Out' } : g))
    );
  };

  const handleDelete = (id) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const handleEdit = (guest) => {
    setEditGuest(guest);
  };

  const handleSaveEdit = (form) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === editGuest.id ? { ...g, ...form } : g))
    );
    setEditGuest(null);
  };

  const handleAddGuest = (form) => {
    const nextNum = guests.length
      ? Math.max(...guests.map((g) => parseInt(g.id.split('-')[1], 10))) + 1
      : 1001;
    const newGuest = {
      id: `BK-${nextNum}`,
      name: form.name.trim(),
      email:
        form.email.trim() ||
        `${form.name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
      room: form.room.trim(),
      roomType: form.roomType,
      checkIn: form.checkIn || '—',
      checkOut: form.checkOut || '—',
      status: form.status,
    };
    setGuests((prev) => [newGuest, ...prev]);
    setCheckInModalOpen(false);
  };

  return (
    <div className="animate-fade-in pt-1 pb-2">
      {/* SUMMARY CARDS */}
      <CheckInOutSummary
        totalGuests={totalGuests}
        checkedInCount={checkedInCount}
        checkedOutCount={checkedOutCount}
        pendingCount={pendingCount}
      />

      {/* MAIN TABLE */}
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
        onOpenCheckInModal={() => setCheckInModalOpen(true)}
        onCheckInAction={(guest) => setCheckInActionModal(guest)}
        onCheckOutAction={(guest) => setCheckOutActionModal(guest)}
        onViewGuest={(guest) => setViewGuest(guest)}
        onEditGuest={(guest) => handleEdit(guest)}
        onDeleteGuest={(guest) => setDeleteGuest(guest)}
      />

      {/* VIEW MODAL */}
      {viewGuest && (
        <CheckInOutViewModal
          guest={viewGuest}
          onClose={() => setViewGuest(null)}
          onEdit={() => {
            const current = viewGuest;
            setViewGuest(null);
            handleEdit(current);
          }}
        />
      )}

      {/* CREATE RECORD MODAL */}
      {checkInModalOpen && (
        <GuestFormModal
          onClose={() => setCheckInModalOpen(false)}
          onSave={handleAddGuest}
        />
      )}

      {/* EDIT RECORD MODAL */}
      {editGuest && (
        <GuestFormModal
          initialData={editGuest}
          onClose={() => setEditGuest(null)}
          onSave={handleSaveEdit}
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteGuest && (
        <CheckInOutDeleteModal
          guest={deleteGuest}
          onClose={() => setDeleteGuest(null)}
          onConfirm={() => {
            handleDelete(deleteGuest.id);
            setDeleteGuest(null);
          }}
        />
      )}
    </div>
  );
}
