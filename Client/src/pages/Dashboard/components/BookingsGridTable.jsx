import React, { useRef, useEffect, useState, useCallback } from 'react';
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
import StatusBadge from '../../../components/common/StatusBadge';
import { statusStyles, paymentStyles } from '../../../features/reservations/components/ReservationTable';
import { toStandardRoomType } from '../../../features/rooms/state/roomStore';
import {
  getBookingDues,
  getCanonicalBookingPaymentStatus,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../../features/payment-billing/pages/paymentBillingStore';

export default function BookingsGridTable({
  filteredBookings,
  handleRowClick,
  activeMenuId,
  toggleMenu,
  setActiveMenuId,
  openViewModal,
  openEditModal,
  confirmDelete,
  handleCheckout,
  confirmCancel
}) {
  const menuRef = useRef(null);

  // Canonical financial status map: { [bookingId]: 'Paid' | 'Partially Paid' | 'Unpaid' | null }
  const [financialStatusMap, setFinancialStatusMap] = useState({});

  const refreshFinancialStatus = useCallback(() => {
    const map = {};
    (filteredBookings || []).forEach((b) => {
      map[b.id] = getCanonicalBookingPaymentStatus(b.id);
    });
    setFinancialStatusMap(map);
  }, [filteredBookings]);

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
    if (!activeMenuId) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (event.target.closest && event.target.closest('[id^="booking-actions-trigger-"]')) {
          return;
        }
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId, setActiveMenuId]);

  const handleMenuKeyDown = (e, bookingId) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setActiveMenuId(null);
      const trigger = document.getElementById(`booking-actions-trigger-${bookingId}`);
      if (trigger) {
        trigger.focus();
      }
      return;
    }

    if (e.key === 'Tab') {
      setActiveMenuId(null);
      return;
    }

    if (!menuRef.current) return;
    const items = Array.from(
      menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')
    );
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[nextIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prevIndex].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1].focus();
    }
  };

  const handleTriggerKeyDown = (e, bookingId) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveMenuId(bookingId);
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <table className="w-full table-fixed text-left border-collapse">
        <colgroup>
          <col className="w-[13%]" />
          <col className="w-[5.5%]" />
          <col className="w-[9.5%]" />
          <col className="w-[8%]" />
          <col className="w-[9%]" />
          <col className="w-[10.5%]" />
          <col className="w-[10.5%]" />
          <col className="w-[9%]" />
          <col className="w-[7%]" />
          <col className="w-[10.5%]" />
          <col className="w-[7.5%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none bg-slate-50/50">
            <th className="py-2 px-1.5 truncate">Name</th>
            <th className="py-2 px-1.5 truncate">Room</th>
            <th className="py-2 px-1.5 truncate">Room Type</th>
            <th className="py-2 px-1.5 truncate">Package</th>
            <th className="py-2 px-1.5 truncate">Status</th>
            <th className="py-2 px-1.5 truncate">Check In</th>
            <th className="py-2 px-1.5 truncate">Check Out</th>
            <th className="py-2 px-1.5 truncate">Payment</th>
            <th className="py-2 px-1.5 truncate">Dues</th>
            <th className="py-2 px-1.5 truncate">Mobile</th>
            <th className="py-2 px-1 text-center whitespace-nowrap">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 text-[11px]">
          {filteredBookings.map((booking) => (
            <tr
              key={booking.id}
              onClick={() => handleRowClick(booking)}
              title="Click to view Guest Profile"
              className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
            >
              {/* Name & Avatar */}
              <td className="py-1.5 px-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <img
                    src={booking.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                    alt={booking.name || 'Guest'}
                    className="w-5 h-5 rounded-full object-cover border border-gray-200 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="font-semibold text-gray-800 text-[11px] truncate block" title={booking.name}>
                    {booking.name}
                  </span>
                </div>
              </td>

              {/* Room */}
              <td className="py-1.5 px-1.5">
                <span className="inline-block px-1 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-800 border border-gray-200/60 font-mono whitespace-nowrap">
                  {booking.roomNo || booking.room || '101'}
                </span>
              </td>

              {/* Room Type */}
              <td className="py-1.5 px-1.5">
                <span className="text-[10.5px] text-gray-600 truncate block" title={toStandardRoomType(booking.roomType)}>
                  {toStandardRoomType(booking.roomType)}
                </span>
              </td>

              {/* Package */}
              <td className="py-1.5 px-1.5">
                <span className="text-[10.5px] text-gray-600 truncate block" title={booking.package || 'Standard'}>
                  {booking.package || 'Standard'}
                </span>
              </td>

              {/* Status */}
              <td className="py-1.5 px-1.5">
                <StatusBadge
                  status={booking.status}
                  stylesMap={statusStyles}
                  size="xs"
                />
              </td>

              {/* Check In */}
              <td className="py-1.5 px-1.5">
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[10px] text-gray-800 font-medium whitespace-nowrap truncate" title={booking.checkIn}>
                    {booking.checkIn}
                  </span>
                  <span className="text-[9px] text-gray-400 font-normal whitespace-nowrap truncate" title={booking.checkInTime || '02:00 PM'}>
                    {booking.checkInTime || '02:00 PM'}
                  </span>
                </div>
              </td>

              {/* Check Out */}
              <td className="py-1.5 px-1.5">
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[10px] text-gray-800 font-medium whitespace-nowrap truncate" title={booking.checkOut}>
                    {booking.checkOut}
                  </span>
                  <span className="text-[9px] text-gray-400 font-normal whitespace-nowrap truncate" title={booking.checkOutTime || '11:00 AM'}>
                    {booking.checkOutTime || '11:00 AM'}
                  </span>
                </div>
              </td>

              {/* Payment */}
              <td className="py-1.5 px-1.5">
                {financialStatusMap[booking.id] !== null && financialStatusMap[booking.id] !== undefined ? (
                  <StatusBadge
                    status={financialStatusMap[booking.id]}
                    stylesMap={paymentStyles}
                    size="xs"
                  />
                ) : (
                  <span className="text-gray-400 text-[10px] whitespace-nowrap">—</span>
                )}
              </td>

              {/* Dues */}
              <td className="py-1.5 px-1.5 font-semibold">
                {(() => {
                  const duesAmt = getBookingDues(booking);
                  return duesAmt === null ? (
                    <span className="text-amber-600 text-[10px] font-medium whitespace-nowrap">Unverified</span>
                  ) : duesAmt > 0 ? (
                    <span className="text-red-600 font-bold text-[10.5px] whitespace-nowrap">${duesAmt.toLocaleString()}</span>
                  ) : (
                    <span className="text-gray-400 font-normal text-[10.5px] whitespace-nowrap">$0</span>
                  );
                })()}
              </td>

              {/* Mobile */}
              <td className="py-1.5 px-1.5">
                <span className="text-[10px] text-gray-600 whitespace-nowrap font-mono truncate block" title={booking.mobile}>
                  {booking.mobile}
                </span>
              </td>

              {/* Actions */}
              <td className="py-1.5 px-1.5 text-center relative" onClick={(e) => e.stopPropagation()}>
                <button
                  id={`booking-actions-trigger-${booking.id}`}
                  onClick={(e) => toggleMenu(e, booking.id)}
                  onKeyDown={(e) => handleTriggerKeyDown(e, booking.id)}
                  aria-label="More actions"
                  aria-haspopup="menu"
                  aria-expanded={activeMenuId === booking.id}
                  aria-controls={activeMenuId === booking.id ? `booking-actions-menu-${booking.id}` : undefined}
                  className="text-gray-600 hover:bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                >
                  <MoreHoriz sx={{ fontSize: 15 }} />
                </button>

                {activeMenuId === booking.id && (
                  <div
                    ref={menuRef}
                    id={`booking-actions-menu-${booking.id}`}
                    role="menu"
                    aria-labelledby={`booking-actions-trigger-${booking.id}`}
                    onKeyDown={(e) => handleMenuKeyDown(e, booking.id)}
                    className="absolute right-1 top-7 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-lg border border-gray-100 z-50 py-1.5 w-36 animate-fade-in text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); openViewModal(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-xs text-gray-700 font-medium cursor-pointer"
                    >
                      <SubjectOutlined className="text-[#10b981]" sx={{ fontSize: 14 }} /> View Details
                    </button>
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); openEditModal(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-xs text-gray-700 font-medium cursor-pointer"
                    >
                      <EditOutlined className="text-[#6366f1]" sx={{ fontSize: 14 }} /> Edit Booking
                    </button>
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); confirmDelete(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-xs text-gray-700 font-medium cursor-pointer"
                    >
                      <DeleteOutlined className="text-[#ef4444]" sx={{ fontSize: 14 }} /> Delete
                    </button>
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); handleCheckout(booking.id); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-xs text-gray-700 font-medium cursor-pointer"
                    >
                      <LogoutOutlined className="text-[#64748b]" sx={{ fontSize: 14 }} /> Check Out
                    </button>
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); confirmCancel(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-xs text-gray-700 font-medium cursor-pointer"
                    >
                      <CancelOutlined className="text-[#64748b]" sx={{ fontSize: 14 }} /> Cancel Booking
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {filteredBookings.length === 0 && (
            <tr>
              <td colSpan={11} className="py-7 text-center text-gray-400 text-xs">
                No bookings found matching criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
