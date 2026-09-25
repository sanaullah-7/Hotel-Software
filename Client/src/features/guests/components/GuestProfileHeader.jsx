import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  HotelOutlined,
  CalendarTodayOutlined,
  EditOutlined,
  AccountBalanceWalletOutlined,
  MeetingRoomOutlined,
  PersonOutlined
} from '@mui/icons-material';

export default function GuestProfileHeader({
  guest,
  currentStay,
  totalDues,
  totalStays,
  onEditClick
}) {
  const navigate = useNavigate();

  // Avatar initials fallback
  const getInitials = (name) => {
    if (!name) return 'G';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const hasAvatar = guest.avatar && !guest.avatar.includes('pravatar.cc/150?u=guest');

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition shadow-xs cursor-pointer"
          >
            <ArrowBack sx={{ fontSize: 16 }} /> Back
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Guest Profile
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                {guest.id}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/reservation/all"
            className="px-3 py-1.5 bg-[#e5f4eb] text-[#1b7f43] rounded-lg text-xs font-semibold hover:brightness-95 transition"
          >
            All Reservations
          </Link>
          <Link
            to="/guests"
            className="px-3 py-1.5 bg-[#1b7f43] text-white rounded-lg text-xs font-semibold hover:brightness-105 transition shadow-xs"
          >
            All Guests
          </Link>
        </div>
      </div>

      {/* Persistent Guest Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Guest Identity & Contact */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {hasAvatar ? (
              <img
                src={guest.avatar}
                alt={guest.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-gray-100 shrink-0"
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1b7f43] to-[#28a75a] text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md shrink-0">
                {getInitials(guest.name)}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{guest.name}</h2>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                  guest.status === 'VIP' 
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : guest.status === 'Inactive'
                    ? 'bg-gray-100 text-gray-600 border-gray-200'
                    : 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20'
                }`}>
                  {guest.status || 'Active'}
                </span>
              </div>

              {/* Contact Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5" title={guest.email}>
                  <EmailOutlined sx={{ fontSize: 15 }} className="text-gray-400 shrink-0" />
                  <span className="font-medium truncate max-w-[200px]">{guest.email || 'No email registered'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PhoneOutlined sx={{ fontSize: 15 }} className="text-emerald-500 shrink-0" />
                  <span className="font-medium">{guest.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LocationOnOutlined sx={{ fontSize: 15 }} className="text-blue-500 shrink-0" />
                  <span className="font-medium">{guest.city || 'Location N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Stay & Outstanding Dues Summary */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0">
            {/* Stay status pill */}
            <div className="px-4 py-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs min-w-[170px]">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MeetingRoomOutlined sx={{ fontSize: 13 }} /> Room & Stay
                </span>
                {currentStay && (
                  <span className={`px-1.5 py-0.5 text-[9.5px] font-bold rounded ${
                    currentStay.status === 'Booked' ? 'bg-green-100 text-green-700' :
                    currentStay.status === 'CheckIn' ? 'bg-blue-100 text-blue-700' :
                    currentStay.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {currentStay.status}
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-gray-800">
                {currentStay ? (
                  <>
                    <span>Room {currentStay.roomNumber || currentStay.room || 'Assigned'}</span>
                    <span className="text-[11px] font-normal text-gray-500 block truncate">
                      {currentStay.checkIn} – {currentStay.checkOut}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 font-medium">No Active Stay</span>
                )}
              </div>
            </div>

            {/* Outstanding balance badge */}
            <div className="px-4 py-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs min-w-[140px]">
              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Total Balance Due
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-base font-extrabold ${totalDues > 0 ? 'text-rose-600' : 'text-[#1b7f43]'}`}>
                  ${Number(totalDues).toFixed(2)}
                </span>
                {totalDues === 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#e5f4eb] text-[#1b7f43] rounded">
                    Settled
                  </span>
                )}
              </div>
            </div>

            {/* Edit Action Button */}
            <button
              onClick={onEditClick}
              className="flex items-center gap-1.5 px-3.5 py-3 bg-[#1b7f43] text-white hover:brightness-105 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer self-stretch sm:self-auto"
              title="Edit guest profile details"
            >
              <EditOutlined sx={{ fontSize: 16 }} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
