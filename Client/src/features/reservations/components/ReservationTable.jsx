import React, { useRef, useEffect } from 'react';
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
import StatusBadge from '../../../components/common/StatusBadge';
import PaginationControls from '../../../components/common/PaginationControls';

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
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Name</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Package</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Room Type</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Status</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Check In</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Check Out</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Payment</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Dues</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Mobile</th>
              <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b] text-center">Actions</th>
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
                <td className="py-3 px-2 text-[13px] text-gray-600">{booking.package}</td>
                <td className="py-3 px-2 text-[13px] text-gray-600">{booking.roomType}</td>
                <td className="py-3 px-2">
                  <StatusBadge
                    status={booking.status}
                    stylesMap={statusStyles}
                    size="sm"
                  />
                </td>
                <td className="py-3 px-2 text-[13px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                    {booking.checkIn}
                  </div>
                </td>
                <td className="py-3 px-2 text-[13px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                    {booking.checkOut}
                  </div>
                </td>
                <td className="py-3 px-2">
                  <StatusBadge
                    status={booking.payment}
                    stylesMap={paymentStyles}
                    size="sm"
                  />
                </td>
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
                <td className="py-3 px-2 text-[13px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <PhoneOutlined sx={{ fontSize: 14 }} className="text-green-500" />
                    {booking.mobile}
                  </div>
                </td>
                <td className="py-3 px-2 relative text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => onToggleMenu(e, booking.id)}
                    className="text-gray-700 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-colors"
                  >
                    <MoreHoriz sx={{ fontSize: 20 }} />
                  </button>
                  {activeMenuId === booking.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-4 top-10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-md border border-gray-100 z-50 py-2 w-44 animate-fade-in text-left"
                    >
                      <button
                        onClick={() => onOpenViewModal(booking)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                      >
                        <SubjectOutlined className="text-[#10b981]" sx={{ fontSize: 18 }} /> View Booking
                      </button>
                      <button
                        onClick={() => onOpenEditModal(booking)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors"
                      >
                        <EditOutlined className="text-[#6366f1]" sx={{ fontSize: 18 }} /> Edit Booking
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
        totalRecords={bookings.length}
        rowsPerPage={10}
      />
    </div>
  );
}
