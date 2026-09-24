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
    <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 overflow-hidden mt-2">
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
          onChange={(e) => onSearchChange(e.target.value)}
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
      <div className="w-full">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="py-3 px-3 text-[10.5px] font-bold text-gray-500 uppercase tracking-wide">
                Booking ID
              </th>
              <th className="py-3 px-3 text-[10.5px] font-bold text-gray-500 uppercase tracking-wide">
                Guest Name/Email
              </th>
              <th className="py-3 px-3 text-[10.5px] font-bold text-gray-500 uppercase tracking-wide">
                Room
              </th>
              <th className="py-3 px-3 text-[10.5px] font-bold text-gray-500 uppercase tracking-wide">
                Stay Period
              </th>
              <th className="py-3 px-3 text-[10.5px] font-bold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="py-3 px-3 text-[10.5px] font-bold text-gray-500 uppercase tracking-wide text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((guest) => {
                const StatusIcon = STATUS_ICONS[guest.status];
                return (
                  <tr
                    key={guest.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11.5px] font-semibold text-gray-500">
                        {guest.bookingId || guest.id}
                      </span>
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3">
                      <p className="font-bold text-[12px] text-gray-800 leading-tight">
                        {guest.room}
                      </p>
                      <p className="text-[10.5px] text-gray-400 capitalize">{guest.roomType}</p>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-[11.5px] text-[var(--primary-dark)] font-semibold">
                        <LoginIcon sx={{ fontSize: 13 }} /> {guest.checkIn}
                      </div>
                      <div className="flex items-center gap-1 text-[11.5px] text-blue-600 font-semibold mt-0.5">
                        <LogoutIcon sx={{ fontSize: 13 }} /> {guest.checkOut}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge
                        status={guest.status}
                        stylesMap={STATUS_STYLES}
                        icon={StatusIcon}
                        size="xs"
                        className="rounded-full px-2.5 py-1"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {guest.status === 'Checked In' ? (
                          <button
                            onClick={() => onCheckOutAction(guest)}
                            title="Check Out"
                            className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 cursor-pointer"
                          >
                            <LogoutIcon sx={{ fontSize: 16 }} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onCheckInAction(guest)}
                            title="Check In"
                            className="text-gray-400 hover:text-[var(--primary-dark)] p-1.5 rounded-lg hover:bg-emerald-50 cursor-pointer"
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
                          onClick={() => onEditGuest(guest)}
                          title="Edit"
                          className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </button>
                        <button
                          onClick={() => onDeleteGuest(guest)}
                          title="Delete"
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
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
        variant="standard"
      />
    </div>
  );
}
