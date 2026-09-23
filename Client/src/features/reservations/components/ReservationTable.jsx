import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarTodayOutlined,
  EmailOutlined,
  PhoneOutlined,
  MoreHoriz,
  SubjectOutlined,
  EditOutlined,
  DeleteOutlined,
  LogoutOutlined,
  CancelOutlined
} from '@mui/icons-material';
import { getBookingDues } from '../../payment-billing/pages/paymentBillingStore';

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
  visibleColumns = {},
  activeMenuId,
  onToggleMenu,
  onCloseMenu,
  onRowClick,
  onOpenViewModal,
  onOpenEditModal,
  onConfirmDelete,
  onConfirmCancel,
  onCheckout
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onCloseMenu();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCloseMenu]);

  return (
    <div className="bg-white rounded-b-xl shadow-sm flex-1 flex flex-col">
      <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              {visibleColumns['Name'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Name</th>}
              {visibleColumns['Package'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Package</th>}
              {visibleColumns['Room Type'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Room Type</th>}
              {visibleColumns['Status'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Status</th>}
              {visibleColumns['Check In'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Check In</th>}
              {visibleColumns['Check Out'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Check Out</th>}
              {visibleColumns['Payment'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Payment</th>}
              {visibleColumns['Dues'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Dues</th>}
              {visibleColumns['Email'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Email</th>}
              {visibleColumns['Mobile'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Mobile</th>}
              {visibleColumns['Actions'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b] text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => onRowClick(booking)}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                title="Click anywhere to view Guest Profile"
              >
                {visibleColumns['Name'] && (
                  <td className="py-3 px-2 flex items-center gap-3">
                    <img src={booking.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0" />
                    <Link
                      to={`/guests/${booking.guestId || `GST-${booking.id}`}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[13px] text-gray-800 font-medium hover:text-[#1b7f43] hover:underline transition-colors"
                      title="View Guest Profile"
                    >
                      {booking.name}
                    </Link>
                  </td>
                )}
                {visibleColumns['Package'] && <td className="py-3 px-2 text-[13px] text-gray-600">{booking.package}</td>}
                {visibleColumns['Room Type'] && <td className="py-3 px-2 text-[13px] text-gray-600">{booking.roomType}</td>}
                {visibleColumns['Status'] && (
                  <td className="py-3 px-2">
                    <span className={`px-3 py-1 rounded-[4px] text-[11px] font-bold ${statusStyles[booking.status]}`}>
                      {booking.status}
                    </span>
                  </td>
                )}
                {visibleColumns['Check In'] && (
                  <td className="py-3 px-2 text-[13px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                      {booking.checkIn}
                    </div>
                  </td>
                )}
                {visibleColumns['Check Out'] && (
                  <td className="py-3 px-2 text-[13px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                      {booking.checkOut}
                    </div>
                  </td>
                )}
                {visibleColumns['Payment'] && (
                  <td className="py-3 px-2">
                    <span className={`px-3 py-1 rounded-[4px] text-[11px] font-bold ${paymentStyles[booking.payment]}`}>
                      {booking.payment}
                    </span>
                  </td>
                )}
                {visibleColumns['Dues'] && (
                  <td className="py-3 px-2 text-[13px] font-medium text-gray-700">
                    {(() => {
                      const duesAmt = getBookingDues(booking);
                      return duesAmt > 0 ? (
                        <span className="text-red-600 font-bold">${duesAmt.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-400 font-normal">$0</span>
                      );
                    })()}
                  </td>
                )}
                {visibleColumns['Email'] && (
                  <td className="py-3 px-2 text-[13px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <EmailOutlined sx={{ fontSize: 14 }} className="text-red-400" />
                      {booking.email}
                    </div>
                  </td>
                )}
                {visibleColumns['Mobile'] && (
                  <td className="py-3 px-2 text-[13px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <PhoneOutlined sx={{ fontSize: 14 }} className="text-green-500" />
                      {booking.mobile}
                    </div>
                  </td>
                )}
                {visibleColumns['Actions'] && (
                  <td className="py-3 px-2 relative text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => onToggleMenu(e, booking.id)}
                      className="text-gray-700 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-colors"
                    >
                      <MoreHoriz sx={{ fontSize: 20 }} />
                    </button>

                    {/* Action Dropdown */}
                    {activeMenuId === booking.id && (
                      <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-8 top-10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-20 py-2 w-48 text-left animate-fade-in"
                      >
                        <button
                          onClick={() => onOpenViewModal(booking)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                        >
                          <SubjectOutlined className="text-[var(--primary-main)]" sx={{ fontSize: 18 }} /> View Details
                        </button>
                        <button
                          onClick={() => onOpenEditModal(booking)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                        >
                          <EditOutlined className="text-[var(--primary-main)]" sx={{ fontSize: 18 }} /> Edit Booking
                        </button>
                        <button
                          onClick={() => onConfirmDelete(booking)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                        >
                          <DeleteOutlined className="text-[#ef4444]" sx={{ fontSize: 18 }} /> Delete Booking
                        </button>
                        <button
                          onClick={() => onCheckout(booking.id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                        >
                          <LogoutOutlined className="text-[#64748b]" sx={{ fontSize: 18 }} /> Check Out
                        </button>
                        <button
                          onClick={() => onConfirmCancel(booking)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                        >
                          <CancelOutlined className="text-[#64748b]" sx={{ fontSize: 18 }} /> Cancel Booking
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-400 text-[14px]">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div className="p-4 mt-auto flex items-center justify-end gap-6 text-[12px] text-gray-600 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select className="border border-gray-300 rounded px-2 py-1 outline-none text-[12px]">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>
        <span>
          1 - {Math.min(10, bookings.length)} of {bookings.length}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 cursor-not-allowed">{'<'}</span>
          <span className="cursor-pointer hover:text-gray-900">{'>'}</span>
        </div>
      </div>
    </div>
  );
}
