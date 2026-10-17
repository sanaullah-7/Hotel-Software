import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
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
import {
  getBookingDues,
  getCanonicalBookingPaymentStatus,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../payment-billing/pages/paymentBillingStore';
import { resolveGuestForBooking } from '../../guests/state/guestStore';
import { toStandardRoomType } from '../../rooms/state/roomStore';
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
  Unpaid: 'bg-orange-100 text-orange-500',
  'Partially Paid': 'bg-yellow-100 text-yellow-700'
};

export default function ReservationTable({
  bookings = [],
  loading = false,
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

  // Canonical financial status map: { [bookingId]: 'Paid' | 'Partially Paid' | 'Unpaid' | null }
  const [financialStatusMap, setFinancialStatusMap] = useState({});

  const refreshFinancialStatus = useCallback(() => {
    const map = {};
    bookings.forEach((b) => {
      map[b.id] = getCanonicalBookingPaymentStatus(b.id);
    });
    setFinancialStatusMap(map);
  }, [bookings]);

  // Initial load and whenever the bookings list changes
  useEffect(() => {
    refreshFinancialStatus();
  }, [refreshFinancialStatus]);

  // Job 23: respond to canonical billing mutations so mounted table updates immediately
  useEffect(() => {
    window.addEventListener(INVOICES_UPDATED_EVENT, refreshFinancialStatus);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, refreshFinancialStatus);
    window.addEventListener(REFUNDS_UPDATED_EVENT, refreshFinancialStatus);
    return () => {
      window.removeEventListener(INVOICES_UPDATED_EVENT, refreshFinancialStatus);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, refreshFinancialStatus);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, refreshFinancialStatus);
    };
  }, [refreshFinancialStatus]);

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
    <div className="bg-white rounded-lg border border-gray-200/80 shadow-xs flex-1 flex flex-col">
      <div className="w-full min-w-0 min-h-[220px]">
        <table className="w-full text-left table-fixed border-collapse">
          <colgroup><col style={{ width: '14%' }} /><col style={{ width: '9%' }} /><col style={{ width: '11%' }} /><col style={{ width: '8%' }} /><col style={{ width: '11%' }} /><col style={{ width: '11%' }} /><col style={{ width: '9%' }} /><col style={{ width: '7%' }} /><col style={{ width: '12%' }} /><col style={{ width: '8%' }} /></colgroup>
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50/50">
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Name</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Package</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Room Type</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Status</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Check In</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Check Out</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Payment</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Dues</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none whitespace-nowrap">Mobile</th>
              <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider select-none text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-xs text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <CircularProgress size={26} sx={{ color: '#1b7f43' }} />
                    <span className="text-xs text-gray-500 font-medium">Loading reservations...</span>
                  </div>
                </td>
              </tr>
            ) : currentBookings.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-xs text-gray-400">
                  No reservations found
                </td>
              </tr>
            ) : (
              currentBookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => onRowClick(booking)}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  title="Click anywhere to view Guest Profile"
                >
                <td className="py-1.5 px-1.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img 
                      src={booking.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.name || 'Guest')}&background=1b7f43&color=fff`} 
                      alt="Avatar" 
                      className="w-6 h-6 rounded-full object-cover shadow-2xs shrink-0" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.name || 'Guest')}&background=1b7f43&color=fff`;
                      }}
                    />
                    {resolveGuestForBooking(booking) ? (
                      <Link
                        to={`/guests/${resolveGuestForBooking(booking).id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11.5px] text-gray-800 font-semibold hover:text-[#1b7f43] transition-colors truncate block max-w-full"
                        title="View Guest Profile"
                      >
                        {booking.name}
                      </Link>
                    ) : (
                      <span className="text-[11.5px] text-gray-800 font-semibold truncate block max-w-full">{booking.name}</span>
                    )}
                  </div>
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap truncate">{booking.package}</td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap truncate">{toStandardRoomType(booking.roomType)}</td>
                <td className="py-1.5 px-1.5 whitespace-nowrap">
                  <StatusBadge
                    status={booking.status}
                    stylesMap={statusStyles}
                    size="xs"
                  />
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                      <CalendarTodayOutlined sx={{ fontSize: 11 }} className="text-gray-400 shrink-0" />
                      {booking.checkIn}
                    </div>
                    <span className="text-[9.5px] text-gray-400 font-normal pl-3.5">
                      {booking.checkInTime || '02:00 PM'}
                    </span>
                  </div>
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 whitespace-nowrap font-medium text-gray-800">
                      <CalendarTodayOutlined sx={{ fontSize: 11 }} className="text-gray-400 shrink-0" />
                      {booking.checkOut}
                    </div>
                    <span className="text-[9.5px] text-gray-400 font-normal pl-3.5">
                      {booking.checkOutTime || '11:00 AM'}
                    </span>
                  </div>
                </td>
                <td className="py-1.5 px-1.5 whitespace-nowrap">
                  {financialStatusMap[booking.id] !== null && financialStatusMap[booking.id] !== undefined ? (
                    <StatusBadge
                      status={financialStatusMap[booking.id]}
                      stylesMap={paymentStyles}
                      size="xs"
                    />
                  ) : (
                    <span className="text-gray-400 text-[10px]">—</span>
                  )}
                </td>
                <td className="py-1.5 px-1.5 text-[11px] font-semibold whitespace-nowrap">
                  {(() => {
                    const duesAmt = getBookingDues(booking);
                    return duesAmt === null ? <span className="text-amber-600 text-[10px]">Unverified</span> : duesAmt > 0 ? (
                      <span className="text-red-600 font-bold">${duesAmt.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">$0</span>
                    );
                  })()}
                </td>
                <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <PhoneOutlined sx={{ fontSize: 11 }} className="text-green-500 shrink-0" />
                    {booking.mobile}
                  </div>
                </td>
                <td className={`py-1.5 px-1.5 text-center whitespace-nowrap ${activeMenuId === booking.id ? 'relative z-50' : 'relative z-10'}`} onClick={(e) => e.stopPropagation()}>
                  <div className="relative inline-block text-center">
                    <button
                      id={`reservation-actions-trigger-${booking.id}`}
                      onClick={(e) => onToggleMenu(e, booking.id)}
                      onKeyDown={(e) => handleTriggerKeyDown(e, booking.id)}
                      aria-label="More actions"
                      aria-haspopup="menu"
                      aria-expanded={activeMenuId === booking.id}
                      aria-controls={activeMenuId === booking.id ? `reservation-actions-menu-${booking.id}` : undefined}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                    >
                      <MoreHoriz sx={{ fontSize: 17 }} />
                    </button>
                    {activeMenuId === booking.id && (
                      <div
                        ref={menuRef}
                        id={`reservation-actions-menu-${booking.id}`}
                        role="menu"
                        aria-labelledby={`reservation-actions-trigger-${booking.id}`}
                        onKeyDown={(e) => handleMenuKeyDown(e, booking.id)}
                        className="absolute right-0 top-full mt-1 bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.2),0_8px_10px_-6px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-50 py-2 w-44 animate-fade-in text-left"
                      >
                        {(() => {
                          const status = normalizeBookingStatus(booking.status);
                          const canCancel = ['Booked', 'Pending'].includes(status);
                          const canCheckout = status === 'Checked In';
                          return <>
                            <button
                              role="menuitem"
                              tabIndex={-1}
                              onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onOpenViewModal(booking); }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors cursor-pointer"
                            >
                              <SubjectOutlined className="text-[#10b981]" sx={{ fontSize: 18 }} /> View Booking
                            </button>
                            <button
                              role="menuitem"
                              tabIndex={-1}
                              onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onOpenEditModal(booking); }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors cursor-pointer"
                            >
                              <EditOutlined className="text-[#6366f1]" sx={{ fontSize: 18 }} /> Edit Booking
                            </button>
                            <button
                              role="menuitem"
                              tabIndex={-1}
                              onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onCheckout(booking.id); }}
                              disabled={!canCheckout}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              <LogoutOutlined className="text-[#64748b]" sx={{ fontSize: 18 }} /> Check Out
                            </button>
                            <button
                              role="menuitem"
                              tabIndex={-1}
                              onClick={() => { if (typeof onCloseMenu === 'function') onCloseMenu(); onConfirmCancel(booking); }}
                              disabled={!canCancel}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              <CancelOutlined className="text-[#64748b]" sx={{ fontSize: 18 }} /> Cancel Booking
                            </button>
                          </>;
                        })()}
                      </div>
                    )}
                  </div>
                </td>
          </tr>
        )))}
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
