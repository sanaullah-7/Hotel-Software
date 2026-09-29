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
    <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm flex-1 overflow-hidden">
      <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full text-left">
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
          <thead className="bg-gray-50/50">
            <tr>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Name</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Package</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Room Type</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Status</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Check In</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Check Out</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Payment</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Dues</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Mobile</th>
              <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => onRowClick(booking)}
                className="hover:bg-gray-50/30 transition-colors cursor-pointer"
                title="Click anywhere to view Guest Profile"
              >
                <td className="py-2 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={booking.avatar} alt="Avatar" className="w-7 h-7 rounded-full object-cover shadow-sm shrink-0" />
                    <Link
                      to={`/guests/${booking.guestId || `GST-${booking.id}`}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[12px] text-gray-800 font-bold hover:text-[#1b7f43] transition-colors truncate block max-w-full"
                      title="View Guest Profile"
                    >
                      {booking.name}
                    </Link>
                  </div>
                </td>
                <td className="py-2 px-3 text-[11.5px] text-gray-600 whitespace-nowrap truncate">{booking.package}</td>
                <td className="py-2 px-3 text-[11.5px] text-gray-600 whitespace-nowrap truncate">{booking.roomType}</td>
                <td className="py-2 px-3 whitespace-nowrap">
                  <StatusBadge
                    status={booking.status}
                    stylesMap={statusStyles}
                    size="xs"
                  />
                </td>
                <td className="py-2 px-3 text-[11px] text-gray-600 whitespace-nowrap">
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
                <td className="py-2 px-3 text-[11px] text-gray-600 whitespace-nowrap">
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
                <td className="py-2 px-3 whitespace-nowrap">
                  <StatusBadge
                    status={booking.payment}
                    stylesMap={paymentStyles}
                    size="xs"
                  />
                </td>
                <td className="py-2 px-3 text-[11.5px] font-semibold whitespace-nowrap">
                  {(() => {
                    const duesAmt = getBookingDues(booking);
                    return duesAmt > 0 ? (
                      <span className="text-red-600 font-bold">${duesAmt.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">$0</span>
                    );
                  })()}
                </td>
                <td className="py-2 px-3 text-[11px] text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <PhoneOutlined sx={{ fontSize: 12 }} className="text-green-500" />
                    {booking.mobile}
                  </div>
                </td>
                <td className="py-2 px-3 relative text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => onToggleMenu(e, booking.id)}
                    className="text-gray-700 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-colors"
                  >
                    <MoreHoriz sx={{ fontSize: 20 }} />
                  </button>
                  {activeMenuId === booking.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-2 top-8 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-md border border-gray-100 z-50 py-2 w-44 animate-fade-in text-left"
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
