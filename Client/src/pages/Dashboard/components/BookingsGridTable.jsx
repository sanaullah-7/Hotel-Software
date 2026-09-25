import React from 'react';
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
import { getBookingDues } from '../../../features/payment-billing/pages/paymentBillingStore';

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
                <StatusBadge
                  status={booking.payment}
                  stylesMap={paymentStyles}
                  size="xs"
                />
              </td>

              {/* Dues */}
              <td className="py-2.5 px-2 text-[11.5px] font-semibold">
                {(() => {
                  const duesAmt = getBookingDues(booking);
                  return duesAmt > 0 ? (
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
                  onClick={(e) => toggleMenu(e, booking.id)}
                  className="text-gray-600 hover:bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                >
                  <MoreHoriz sx={{ fontSize: 18 }} />
                </button>

                {activeMenuId === booking.id && (
                  <div
                    className="absolute right-3 top-9 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-lg border border-gray-100 z-50 py-1.5 w-40 animate-fade-in text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { setActiveMenuId(null); openViewModal(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                    >
                      <SubjectOutlined className="text-[#10b981]" sx={{ fontSize: 16 }} /> View Details
                    </button>
                    <button
                      onClick={() => { setActiveMenuId(null); openEditModal(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                    >
                      <EditOutlined className="text-[#6366f1]" sx={{ fontSize: 16 }} /> Edit Booking
                    </button>
                    <button
                      onClick={() => { setActiveMenuId(null); confirmDelete(booking); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                    >
                      <DeleteOutlined className="text-[#ef4444]" sx={{ fontSize: 16 }} /> Delete
                    </button>
                    <button
                      onClick={() => { setActiveMenuId(null); handleCheckout(booking.id); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2.5 text-[12px] text-gray-700 font-medium cursor-pointer"
                    >
                      <LogoutOutlined className="text-[#64748b]" sx={{ fontSize: 16 }} /> Check Out
                    </button>
                    <button
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
