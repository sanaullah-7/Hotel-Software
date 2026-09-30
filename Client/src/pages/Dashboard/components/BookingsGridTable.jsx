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
      if (activeMenuId !== bookingId) {
        toggleMenu(e, bookingId);
      }
    } else if (e.key === 'Escape' && activeMenuId === bookingId) {
      e.preventDefault();
      e.stopPropagation();
      setActiveMenuId(null);
    }
  };

  return (
    <div className="w-full max-lg:overflow-x-auto lg:overflow-x-hidden min-w-0">
      <table className="w-full text-left border-collapse table-fixed max-lg:min-w-[850px]">
        <colgroup>
          <col style={{ width: '14%' }} />
          <col style={{ width: '6%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '6%' }} />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Name</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Room</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Room Type</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Package</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Status</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Check In</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Check Out</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Payment</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Dues</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">Mobile</th>
            <th className="py-2.5 px-2 text-[11px] font-bold text-gray-600 uppercase tracking-wide text-center whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map((booking) => (
            <tr
              key={booking.id}
              onClick={() => handleRowClick(booking)}
              className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer"
              title="Click to view Guest Profile"
            >
              {/* Name */}
              <td className="py-2.5 px-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <img
                    src={booking.avatar}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full object-cover shadow-xs shrink-0"
                  />
                  <span
                    className="text-[12px] text-gray-800 font-bold hover:text-[#1b7f43] transition-colors truncate"
                  >
                    {booking.name}
                  </span>
                </div>
              </td>

              {/* Room */}
              <td className="py-2.5 px-2">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-800 border border-gray-200 whitespace-nowrap">
                  {booking.roomNo || booking.room || '101'}
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
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 whitespace-nowrap text-gray-800 font-medium">
                    <CalendarTodayOutlined sx={{ fontSize: 11 }} className="text-gray-400" />
                    {booking.checkIn}
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal pl-3.5">
                    {booking.checkInTime || '02:00 PM'}
                  </span>
                </div>
              </td>

              {/* Check Out */}
              <td className="py-2.5 px-2 text-[11px] text-gray-600">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 whitespace-nowrap text-gray-800 font-medium">
                    <CalendarTodayOutlined sx={{ fontSize: 11 }} className="text-gray-400" />
                    {booking.checkOut}
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal pl-3.5">
                    {booking.checkOutTime || '11:00 AM'}
                  </span>
                </div>
              </td>

              {/* Payment */}
              <td className="py-2.5 px-2">
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

              {/* Dues */}
              <td className="py-2.5 px-2 text-[11.5px] font-semibold">
                {(() => {
                  const duesAmt = getBookingDues(booking);
                  return duesAmt === null ? <span className="text-amber-600">Unverified</span> : duesAmt > 0 ? (
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
                  id={`booking-actions-trigger-${booking.id}`}
                  onClick={(e) => toggleMenu(e, booking.id)}
                  onKeyDown={(e) => handleTriggerKeyDown(e, booking.id)}
                  aria-label="More actions"
                  aria-haspopup="menu"
                  aria-expanded={activeMenuId === booking.id}
                  aria-controls={activeMenuId === booking.id ? `booking-actions-menu-${booking.id}` : undefined}
                  className="text-gray-600 hover:bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                >
                  <MoreHoriz sx={{ fontSize: 18 }} />
                </button>

                {activeMenuId === booking.id && (
                  <div
                    ref={menuRef}
                    id={`booking-actions-menu-${booking.id}`}
                    role="menu"
                    aria-labelledby={`booking-actions-trigger-${booking.id}`}
                    onKeyDown={(e) => handleMenuKeyDown(e, booking.id)}
                    className="absolute right-3 top-9 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-lg border border-gray-100 z-50 py-1.5 w-40 animate-fade-in text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); openViewModal(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                    >
                      <SubjectOutlined className="text-[#10b981]" sx={{ fontSize: 16 }} /> View Details
                    </button>
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); openEditModal(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                    >
                      <EditOutlined className="text-[#6366f1]" sx={{ fontSize: 16 }} /> Edit Booking
                    </button>
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); confirmDelete(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                    >
                      <DeleteOutlined className="text-[#ef4444]" sx={{ fontSize: 16 }} /> Delete
                    </button>
                    <button
                      role="menuitem"
                      tabIndex={-1}
                      onClick={() => { setActiveMenuId(null); handleCheckout(booking.id); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                    >
                      <LogoutOutlined className="text-[#64748b]" sx={{ fontSize: 16 }} /> Check Out
                    </button>
                    <button
                      role="menuitem"
                      tabIndex={-1}
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
  );
}
