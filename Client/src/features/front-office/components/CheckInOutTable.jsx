import React from 'react';
import {
  ChecklistRtl as ChecklistRtlIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PendingActions as PendingActionsIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import SearchInput from '../../../components/common/SearchInput';
import StatusBadge from '../../../components/common/StatusBadge';
import PaginationControls from '../../../components/common/PaginationControls';

export const PRIMARY = 'var(--primary-main)';

export const STATUS_STYLES = {
  Pending: 'bg-[#fee2e2] text-[#dc2626]',
  'Checked In': 'bg-[#dcfce7] text-[#16a34a]',
  'Checked Out': 'bg-[#dbeafe] text-[#2563eb]',
  Reserved: 'bg-[#fef3c7] text-[#d97706]'
};

export const STATUS_ICONS = {
  Pending: PendingActionsIcon,
  'Checked In': LoginIcon,
  'Checked Out': LogoutIcon,
  Reserved: BookmarkIcon
};

export const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=A700&color=fff`;

export default function CheckInOutTable({
  guests = [],
  filteredGuests = [],
  currentRows = [],
  searchQuery,
  onSearchChange,
  totalGuests,
  currentPage,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalPages,
  indexOfFirstRow,
  indexOfLastRow,
  onOpenCheckInModal,
  onCheckInAction,
  onCheckOutAction,
  onViewGuest,
  onEditGuest,
  onDeleteGuest
}) {
  return (
    <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[#ecfdf5] flex items-center justify-center shrink-0">
            <ChecklistRtlIcon style={{ color: PRIMARY }} sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-[15px] leading-tight">
              Check-in / Check-out Management
            </h3>
            <p className="text-[11.5px] text-gray-400">
              Manage current guests, check-ins, and departures
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-gray-100 flex items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by guest name, room, or booking ID..."
          iconPosition="left"
          variant="pill"
          size="md"
          className="flex-1"
        />
        <span
          className="text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0"
          style={{ backgroundColor: '#eef2ff', color: PRIMARY }}
        >
          {filteredGuests.length} of {totalGuests} guests
        </span>
      </div>

      {/* Table */}
      <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
                Booking ID
              </th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
                Guest Name/Email
              </th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
                Room
              </th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
                Stay Period
              </th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
                Status
              </th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((guest) => {
                const StatusIcon = STATUS_ICONS[guest.status];
                const canCheckIn = !guest.isLegacyUnmapped && ['Booked', 'Reserved'].includes(guest.status);
                const canCheckOut = !guest.isLegacyUnmapped && guest.status === 'Checked In';
                return (
                  <tr
                    key={guest.id}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="py-2 px-3">
                      <span className="font-mono text-[11.5px] font-semibold text-gray-500">
                        {guest.bookingId || guest.id}
                      </span>
                      {guest.isLegacyUnmapped && <span className="block text-[10px] text-amber-700">Legacy / unlinked</span>}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={guest.avatar || avatarUrl(guest.name)}
                          alt={guest.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[12.5px] text-gray-800 leading-tight truncate">
                            {guest.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">{guest.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <p className="font-bold text-[12px] text-gray-800 leading-tight">
                        {guest.room}
                      </p>
                      <p className="text-[10.5px] text-gray-400 capitalize">{guest.roomType}</p>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-col gap-1">
                        <div>
                          <div className="flex items-center gap-1 text-[11.5px] text-[var(--primary-dark)] font-semibold">
                            <LoginIcon sx={{ fontSize: 13 }} /> {guest.checkIn}
                          </div>
                          <span className="text-[10px] text-gray-400 font-normal pl-4 block">
                            {guest.checkInTime || '02:00 PM'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-[11.5px] text-blue-600 font-semibold">
                            <LogoutIcon sx={{ fontSize: 13 }} /> {guest.checkOut}
                          </div>
                          <span className="text-[10px] text-gray-400 font-normal pl-4 block">
                            {guest.checkOutTime || '11:00 AM'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <StatusBadge
                        status={guest.status}
                        stylesMap={STATUS_STYLES}
                        icon={StatusIcon}
                        size="xs"
                        className="rounded-full px-2.5 py-1"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canCheckOut ? (
                          <button
                            onClick={() => onCheckOutAction(guest)}
                            title="Check Out"
                            className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 cursor-pointer"
                          >
                            <LogoutIcon sx={{ fontSize: 16 }} />
                          </button>
                        ) : (
                          <button
                            disabled={!canCheckIn}
                            onClick={() => onCheckInAction(guest)}
                            title={canCheckIn ? 'Check In' : 'Only a linked Booked reservation can be checked in'}
                            className="text-gray-400 hover:text-[var(--primary-dark)] p-1.5 rounded-lg hover:bg-emerald-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <LoginIcon sx={{ fontSize: 16 }} />
                          </button>
                        )}
                        <button
                          onClick={() => onViewGuest(guest)}
                          title="View"
                          className="text-gray-400 hover:text-[var(--primary-dark)] p-1.5 rounded-lg hover:bg-emerald-50 cursor-pointer"
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </button>
                        <button
                          disabled
                          onClick={() => onEditGuest(guest)}
                          title="Edit canonical booking details in Reservations"
                          className="text-gray-400 p-1.5 rounded-lg cursor-not-allowed opacity-40"
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </button>
                        <button
                          disabled
                          onClick={() => onDeleteGuest(guest)}
                          title="Bookings cannot be deleted from Front Office"
                          className="text-gray-400 p-1.5 rounded-lg cursor-not-allowed opacity-40"
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-400 text-[12.5px]">
                  No guests found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={filteredGuests.length}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        indexOfFirstRow={indexOfFirstRow}
        indexOfLastRow={indexOfLastRow}
        variant="compact"
      />
    </div>
  );
}
