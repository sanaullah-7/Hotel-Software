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
  loading = false,
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
    <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-[#ecfdf5] flex items-center justify-center shrink-0">
            <ChecklistRtlIcon style={{ color: PRIMARY }} sx={{ fontSize: 16 }} />
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-[13px] leading-tight">
              Check-in / Check-out Management
            </h3>
            <p className="text-[10px] text-gray-400">
              Manage current guests, check-ins, and departures
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-2">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search by guest name, room, or booking ID..."
          iconPosition="left"
          variant="pill"
          size="sm"
          className="flex-1"
        />
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{ backgroundColor: '#eef2ff', color: PRIMARY }}
        >
          {filteredGuests.length} of {totalGuests} guests
        </span>
      </div>

      {/* Table */}
      <div className="w-full overflow-hidden">
        <table className="w-full table-fixed text-left border-collapse">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[26%]" />
            <col className="w-[14%]" />
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none bg-slate-50/50">
              <th className="py-2 px-1.5 truncate">Booking ID</th>
              <th className="py-2 px-1.5 truncate">Guest Name/Email</th>
              <th className="py-2 px-1.5 truncate">Room</th>
              <th className="py-2 px-1.5 truncate">Stay Period</th>
              <th className="py-2 px-1.5 truncate">Status</th>
              <th className="py-2 px-1 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-[11px]">
            {loading && currentRows.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400 text-xs animate-pulse">
                  Loading Front Office records...
                </td>
              </tr>
            ) : currentRows.length > 0 ? (
              currentRows.map((guest) => {
                const StatusIcon = STATUS_ICONS[guest.status];
                const canCheckIn = !guest.isLegacyUnmapped && ['Booked', 'Reserved'].includes(guest.status);
                const canCheckOut = !guest.isLegacyUnmapped && guest.status === 'Checked In';
                return (
                  <tr
                    key={guest.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-1.5 px-1.5">
                      <span className="font-mono text-[11px] font-semibold text-gray-600 block truncate" title={String(guest.bookingId || guest.id)}>
                        {guest.bookingId || guest.id}
                      </span>
                      {guest.isLegacyUnmapped && <span className="block text-[9px] text-amber-700">Legacy</span>}
                    </td>
                    <td className="py-1.5 px-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img
                          src={guest.avatar || avatarUrl(guest.name)}
                          alt={guest.name}
                          className="w-5.5 h-5.5 rounded-full object-cover shrink-0 border border-gray-200"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[11px] text-gray-800 leading-tight truncate" title={guest.name}>
                            {guest.name}
                          </p>
                          <p className="text-[9.5px] text-gray-400 truncate" title={guest.email}>{guest.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 px-1.5">
                      <p className="font-bold text-[11px] text-gray-800 leading-tight truncate">
                        {guest.room}
                      </p>
                      <p className="text-[9.5px] text-gray-400 capitalize truncate">{guest.roomType}</p>
                    </td>
                    <td className="py-1.5 px-1.5">
                      <div className="flex flex-col gap-0.5 leading-tight">
                        <div className="flex items-center gap-1 text-[10.5px] text-[var(--primary-dark)] font-semibold truncate">
                          <LoginIcon sx={{ fontSize: 11 }} /> <span className="truncate">{guest.checkIn}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10.5px] text-blue-600 font-semibold truncate">
                          <LogoutIcon sx={{ fontSize: 11 }} /> <span className="truncate">{guest.checkOut}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-1.5 px-1.5 whitespace-nowrap">
                      <StatusBadge
                        status={guest.status}
                        stylesMap={STATUS_STYLES}
                        icon={StatusIcon}
                        size="xs"
                        className="rounded-full px-2 py-0.5 text-[10px]"
                      />
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {canCheckOut ? (
                          <button
                            onClick={() => onCheckOutAction(guest)}
                            title="Check Out"
                            className="text-gray-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50 cursor-pointer"
                          >
                            <LogoutIcon sx={{ fontSize: 15 }} />
                          </button>
                        ) : (
                          <button
                            disabled={!canCheckIn}
                            onClick={() => onCheckInAction(guest)}
                            title={canCheckIn ? 'Check In' : 'Only a linked Booked reservation can be checked in'}
                            className="text-gray-400 hover:text-[var(--primary-dark)] p-1 rounded-md hover:bg-emerald-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <LoginIcon sx={{ fontSize: 15 }} />
                          </button>
                        )}
                        <button
                          onClick={() => onViewGuest(guest)}
                          title="View"
                          className="text-gray-400 hover:text-[var(--primary-dark)] p-1 rounded-md hover:bg-emerald-50 cursor-pointer"
                        >
                          <VisibilityIcon sx={{ fontSize: 15 }} />
                        </button>
                        <button
                          disabled
                          onClick={() => onEditGuest(guest)}
                          title="Edit canonical booking details in Reservations"
                          className="text-gray-400 p-1 rounded-md cursor-not-allowed opacity-40"
                        >
                          <EditIcon sx={{ fontSize: 15 }} />
                        </button>
                        <button
                          disabled
                          onClick={() => onDeleteGuest(guest)}
                          title="Bookings cannot be deleted from Front Office"
                          className="text-gray-400 p-1 rounded-md cursor-not-allowed opacity-40"
                        >
                          <DeleteIcon sx={{ fontSize: 15 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-400 text-xs">
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
