import React from 'react';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CreditCard as CreditCardIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  MeetingRoom as MeetingRoomIcon,
  Layers as LayersIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { avatarUrl, STATUS_STYLES } from './CheckInOutTable';

export default function CheckInOutViewModal({ guest, onClose, onEdit }) {
  if (!guest) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary-main)] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl(guest.name)}
              alt={guest.name}
              className="w-12 h-12 rounded-full border-2 border-white/20 shadow-sm"
            />
            <div className="flex flex-col">
              <h2 className="text-white text-[20px] font-bold leading-tight">{guest.name}</h2>
              <p className="text-emerald-100 text-[12px] font-medium leading-tight mt-0.5">
                {guest.id} • Room {guest.room}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Guest Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PersonIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              <h3 className="text-[var(--primary-main)] text-[11px] font-bold uppercase tracking-wider">
                Guest Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <WorkIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Full Name</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.name}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <EmailIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Email</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.email}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <PhoneIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Phone</span>
                  <span className="text-gray-800 text-[13px] font-semibold">
                    {guest.phone || '+1-234-567-8901'}
                  </span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <CreditCardIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Passport</span>
                  <span className="text-gray-800 text-[13px] font-semibold">
                    {guest.passport || 'P12345678'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ConfirmationNumberIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              <h3 className="text-[var(--primary-main)] text-[11px] font-bold uppercase tracking-wider">
                Booking Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <ConfirmationNumberIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Booking ID</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.id}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <MeetingRoomIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Room</span>
                  <span className="text-gray-800 text-[13px] font-semibold">
                    {guest.room} • {guest.roomType}
                  </span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <LayersIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Floor</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.floor || '1'}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <GroupsIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Guest Count</span>
                  <span className="text-gray-800 text-[13px] font-semibold">
                    {guest.guestCount || '2'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <EventIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              <h3 className="text-[var(--primary-main)] text-[11px] font-bold uppercase tracking-wider">
                Stay Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <LoginIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Check-In Date</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.checkIn}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <LogoutIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Check-Out Date</span>
                  <span className="text-gray-800 text-[13px] font-semibold">{guest.checkOut}</span>
                </div>
              </div>
              <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                  <InfoIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] uppercase font-bold">Status</span>
                  <span
                    className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-md mt-0.5 ${STATUS_STYLES[guest.status]}`}
                  >
                    {guest.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-3 flex items-start gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-[#ecfdf5] flex items-center justify-center shrink-0">
                <ReceiptIcon sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              </div>
              <div className="flex flex-col mt-0.5">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Special Requests</span>
                <span className="text-gray-800 text-[13px] font-semibold">
                  {guest.specialRequests || 'Early check-in requested'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end items-center gap-4 shrink-0">
          <button
            onClick={onClose}
            className="text-gray-500 text-[13px] font-semibold hover:text-gray-700 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 bg-[var(--primary-main)] hover:bg-[#059669] text-white px-5 py-2 rounded-lg text-[13px] font-bold transition-colors cursor-pointer shadow-sm"
          >
            <EditIcon sx={{ fontSize: 16 }} /> Edit Guest
          </button>
        </div>
      </div>
    </div>
  );
}
