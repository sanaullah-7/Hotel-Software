import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarTodayOutlined,
  PhoneOutlined,
  MoreHoriz,
  SubjectOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  CancelOutlined
} from '@mui/icons-material';
import { getBookingDues } from '../../payment-billing/pages/paymentBillingStore';
import { resolveGuestForBooking } from '../../guests/state/guestStore';
import StatusBadge from '../../../components/common/StatusBadge';
import PaginationControls from '../../../components/common/PaginationControls';
import { normalizeBookingStatus } from '../state/bookingRules';

export const statusStyles = {
  Cancelled: 'bg-orange-100 text-orange-500',
  Booked: 'bg-green-100 text-green-600',
  CheckIn: 'bg-blue-100 text-blue-500',
  CheckOut: 'bg-purple-100 text-purple-500'
};

export const paymentStyles = {
  Paid: 'bg-green-100 text-green-600',
  Unpaid: 'bg-orange-100 text-orange-500'
};

export default function ReservationTable({
  bookings = [],
  activeMenuId,
  onToggleMenu,
  onCloseMenu,
  onRowClick,
  onOpenViewModal,
  onOpenEditModal,
  onConfirmDelete,
  onConfirmCancel,
  onCheckout,
  currentPage: externalPage,
  onPageChange: externalOnPageChange,
  rowsPerPage = 10
}) {
  const menuRef = useRef(null);

  const [internalPage, setInternalPage] = useState(1);
  const isControlled = externalPage !== undefined && typeof externalOnPageChange === 'function';
  const currentPage = isControlled ? externalPage : internalPage;

  const totalPages = Math.max(1, Math.ceil(bookings.length / rowsPerPage));
  const effectivePage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (!isControlled && internalPage > totalPages) {
      setInternalPage(totalPages);
    }
  }, [isControlled, internalPage, totalPages]);

  const handlePageChange = (newPage) => {
    if (activeMenuId && typeof onCloseMenu === 'function') {
      onCloseMenu();
    }
    if (isControlled) {
      externalOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const startIndex = (effectivePage - 1) * rowsPerPage;
  const currentBookings = bookings.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    if (activeMenuId && menuRef.current) {
      const items = Array.from(
        menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')
      );
      if (items.length > 0) {
        items[0].focus({ preventScroll: true });
      }
    }
  }, [activeMenuId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (event.target.closest && event.target.closest('[id^="reservation-actions-trigger-"]')) {
          return;
        }
        if (typeof onCloseMenu === 'function') {
          onCloseMenu();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCloseMenu]);

  const handleMenuKeyDown = (e, bookingId) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (typeof onCloseMenu === 'function') {
        onCloseMenu();
      }
      const trigger = document.getElementById(`reservation-actions-trigger-${bookingId}`);
      if (trigger) {
        trigger.focus();
      }
      return;
    }

    if (e.key === 'Tab') {
      if (typeof onCloseMenu === 'function') {
        onCloseMenu();
      }
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (!menuRef.current) return;
      const items = Array.from(
        menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')
      );
      if (items.length === 0) return;
      const currentIndex = items.indexOf(document.activeElement);
      if (currentIndex === -1) {
        items[0].focus({ preventScroll: true });
      } else if (e.key === 'ArrowDown') {
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus({ preventScroll: true });
      } else if (e.key === 'ArrowUp') {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex].focus({ preventScroll: true });
      }
      return;
    }

    if (e.key === 'Home') {
      e.preventDefault();
      if (!menuRef.current) return;
      const items = Array.from(
        menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')
      );
      if (items.length > 0) items[0].focus({ preventScroll: true });
      return;
    }

    if (e.key === 'End') {
      e.preventDefault();
      if (!menuRef.current) return;
      const items = Array.from(
        menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')
      );
      if (items.length > 0) items[items.length - 1].focus({ preventScroll: true });
      return;
    }
  };

  const handleTriggerKeyDown = (e, bookingId) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeMenuId !== bookingId && typeof onToggleMenu === 'function') {
        onToggleMenu(e, bookingId);
      }
    } else if (e.key === 'Escape' && activeMenuId === bookingId) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof onCloseMenu === 'function') {
        onCloseMenu();
      }
    }
  };

  return (
    <div className="bg-white rounded-b-xl shadow-sm flex-1 flex flex-col">
      <div className="w-full max-lg:overflow-x-auto lg:overflow-x-hidden min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full text-left table-fixed max-lg:min-w-[850px]">
          <colgroup>
            <col style={{ width: '14%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Name</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Package</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Room Type</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Status</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Check In</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Check Out</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Payment</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Dues</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide whitespace-nowrap">Mobile</th>
              <th className="py-2.5 px-2 text-[11px] font-bold text-[#1e293b] uppercase tracking-wide text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => onRowClick(booking)}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                title="Click anywhere to view Guest Profile"
              >
                <td className="py-2 px-2 whitespace-nowrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={booking.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover shadow-sm shrink-0" />
                    {resolveGuestForBooking(booking) ? (
                      <Link
                        to={`/guests/${resolveGuestForBooking(booking).id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[12px] text-gray-800 font-bold hover:text-[#1b7f43] transition-colors truncate block max-w-full"
                        title="View Guest Profile"
                      >
                        {booking.name}
                      </Link>
                    ) : (
                      <span className="text-[12px] text-gray-800 font-bold truncate block max-w-full">{booking.name}</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap truncate">{booking.package}</td>
                <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap truncate">{booking.roomType}</td>
                <td className="py-2 px-2 whitespace-nowrap">
                  <StatusBadge
                    status={booking.status}
                    stylesMap={statusStyles}
                    size="xs"
                  />
                </td>
                <td className="py-2 px-2 text-[11px] text-gray-600 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 whitespace-nowrap font-medium text-gray-800">
                      <CalendarTodayOutlined sx={{ fontSize: 12 }} className="text-gray-400" />
                      {booking.checkIn}
                    </div>
                    <span className="text-[10px] text-gray-400 font-normal pl-4">
                      {booking.checkInTime || '02:00 PM'}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-[11px] text-gray-600 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 whitespace-nowrap font-medium text-gray-800">
                      <CalendarTodayOutlined sx={{ fontSize: 12 }} className="text-gray-400" />
                      {booking.checkOut}
                    </div>
                    <span className="text-[10px] text-gray-400 font-normal pl-4">
                      {booking.checkOutTime || '11:00 AM'}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 whitespace-nowrap">
                  <StatusBadge
                    status={booking.payment}
                    stylesMap={paymentStyles}
                    size="xs"
                  />
                </td>
                <td className="py-2 px-2 text-[11.5px] font-semibold whitespace-nowrap">
                  {(() => {
                    const duesAmt = getBookingDues(booking);
                    return duesAmt === null ? <span className="text-amber-600 text-[10px]">Unverified</span> : duesAmt > 0 ? (
                      <span className="text-red-600 font-bold">${duesAmt.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">$0</span>
                    );
                  })()}
                </td>
                <td className="py-2 px-2 text-[11px] text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <PhoneOutlined sx={{ fontSize: 12 }} className="text-green-500" />
                    {booking.mobile}
                  </div>
                </td>
                <td className="py-2 px-2 relative text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    id={`reservation-actions-trigger-${booking.id}`}
                    onClick={(e) => onToggleMenu(e, booking.id)}
                    onKeyDown={(e) => handleTriggerKeyDown(e, booking.id)}
                    aria-label="More actions"
                    aria-haspopup="menu"
                    aria-expanded={activeMenuId === booking.id}
                    aria-controls={activeMenuId === booking.id ? `reservation-actions-menu-${booking.id}` : undefined}
                    className="text-gray-700 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-colors"
                  >
                    <MoreHoriz sx={{ fontSize: 20 }} />
                  </button>
                  {activeMenuId === booking.id && (
                    <div
                      ref={menuRef}
                      id={`reservation-actions-menu-${booking.id}`}
                      role="menu"
                      aria-labelledby={`reservation-actions-trigger-${booking.id}`}
                      onKeyDown={(e) => handleMenuKeyDown(e, booking.id)}
                      className="absolute right-2 top-8 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-md border border-gray-100 z-50 py-2 w-44 animate-fade-in text-left"
                    >
                      {(() => {
                        const status = normalizeBookingStatus(booking.status);
                        const canCancel = ['Booked', 'Pending'].includes(status);
                        const canCheckout = status === 'Checked In';
                        const isCheckedIn = status === 'Checked In';
                        return <>
                      <button
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onOpenViewModal(booking); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                      >
                        <SubjectOutlined className="text-[#10b981]" sx={{ fontSize: 18 }} /> View Booking
                      </button>
                      <button
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onOpenEditModal(booking); }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                      >
                        <EditOutlined className="text-[#6366f1]" sx={{ fontSize: 18 }} /> Edit Booking
                      </button>
                      <button
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onConfirmDelete(booking); }}
                        disabled={isCheckedIn}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                      >
                        <DeleteOutlined className="text-[#ef4444]" sx={{ fontSize: 18 }} /> Delete Booking
                      </button>
                      <button
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onCheckout(booking.id); }}
                        disabled={!canCheckout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                      >
                        <LogoutOutlined className="text-[#64748b]" sx={{ fontSize: 18 }} /> Check Out
                      </button>
                      <button
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onConfirmCancel(booking); }}
                        disabled={!canCancel}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                      >
                        <CancelOutlined className="text-[#64748b]" sx={{ fontSize: 18 }} /> Cancel Booking
                      </button>
                        </>;
                      })()}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-400 text-[14px]">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <PaginationControls
        variant="compact"
        currentPage={effectivePage}
        totalPages={totalPages}
        totalRecords={bookings.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
