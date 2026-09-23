import React from 'react';
import {
  EditOutlined,
  Close,
  SubjectOutlined,
  LocalOfferOutlined,
  CalendarTodayOutlined,
  PhoneOutlined,
  EmailOutlined
} from '@mui/icons-material';
import { statusStyles, paymentStyles } from './ReservationTable';

export default function ReservationViewModal({
  open,
  booking,
  onClose,
  onEdit
}) {
  if (!open || !booking) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={booking.avatar}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
            />
            <div className="flex flex-col">
              <h2 className="text-white text-[20px] font-bold leading-tight">{booking.name}</h2>
              <span className="text-white/80 text-[13px]">{booking.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onEdit(booking);
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Edit Booking"
            >
              <EditOutlined sx={{ fontSize: 16 }} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <Close sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {/* Body Cards */}
        <div className="p-6 bg-white max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Package */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
              <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                <SubjectOutlined sx={{ fontSize: 20 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Package
                </span>
                <span className="text-[14px] font-bold text-gray-800">{booking.package}</span>
              </div>
            </div>

            {/* Room Type */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
              <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                <SubjectOutlined sx={{ fontSize: 20 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Room Type
                </span>
                <span className="text-[14px] font-bold text-gray-800">{booking.roomType}</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
              <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                <LocalOfferOutlined sx={{ fontSize: 20 }} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${statusStyles[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Check In */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
              <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                <CalendarTodayOutlined sx={{ fontSize: 20 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Check In
                </span>
                <span className="text-[14px] font-bold text-gray-800">{booking.checkIn}</span>
              </div>
            </div>

            {/* Check Out */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
              <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                <CalendarTodayOutlined sx={{ fontSize: 20 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Check Out
                </span>
                <span className="text-[14px] font-bold text-gray-800">{booking.checkOut}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
              <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                <LocalOfferOutlined sx={{ fontSize: 20 }} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Payment
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${paymentStyles[booking.payment]}`}
                >
                  {booking.payment}
                </span>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
              <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                <PhoneOutlined sx={{ fontSize: 20 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Mobile
                </span>
                <span className="text-[14px] font-bold text-gray-800">{booking.mobile}</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
              <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                <EmailOutlined sx={{ fontSize: 20 }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Email
                </span>
                <span className="text-[14px] font-bold text-gray-800 break-all">{booking.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
