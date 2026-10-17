import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  AccessTimeOutlined,
  AttachMoneyOutlined,
  BadgeOutlined,
  CalendarTodayOutlined,
  EditOutlined,
  DeleteOutlined
} from '@mui/icons-material';

export default function StaffProfileHeader({
  staff,
  onEditClick,
  onDeleteClick
}) {
  const navigate = useNavigate();

  // Avatar initials fallback
  const getInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const hasCustomAvatar = Boolean(
    staff.avatar &&
    !staff.avatar.includes('pravatar.cc') &&
    !staff.avatar.includes('ui-avatars.com')
  );

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20';
    if (s.includes('leave')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s.includes('terminate') || s === 'inactive') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/hr/staff')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition shadow-xs cursor-pointer"
          >
            <ArrowBack sx={{ fontSize: 16 }} /> Back
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Staff Profile
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                {staff.empId || staff.employee_ref || staff.id}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hr/staff"
            className="px-3 py-1.5 bg-[#e5f4eb] text-[#1b7f43] rounded-lg text-xs font-semibold hover:brightness-95 transition"
          >
            All Staff
          </Link>
          <button
            onClick={onEditClick}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1b7f43] text-white rounded-lg text-xs font-semibold hover:brightness-105 transition shadow-xs cursor-pointer"
          >
            <EditOutlined sx={{ fontSize: 15 }} /> Edit Staff
          </button>
          <button
            onClick={onDeleteClick}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200/80 rounded-lg text-xs font-semibold hover:bg-rose-100 transition shadow-xs cursor-pointer"
          >
            <DeleteOutlined sx={{ fontSize: 15 }} /> Terminate
          </button>
        </div>
      </div>

      {/* Persistent Staff Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-white flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Staff Identity & Contact */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4.5">
            {hasCustomAvatar ? (
              <img
                src={staff.avatar}
                alt={staff.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-gray-100 shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name || 'Staff')}&background=1b7f43&color=fff`;
                }}
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1b7f43] to-[#28a75a] text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md shrink-0">
                {getInitials(staff.name)}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{staff.name}</h2>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getStatusColor(staff.status)}`}>
                  {staff.status || 'Active'}
                </span>
                {staff.empType && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                    {staff.empType}
                  </span>
                )}
              </div>

              {/* Subtitle: Job Title & Department */}
              <p className="text-xs font-bold text-gray-500 tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
                <BadgeOutlined sx={{ fontSize: 14 }} className="text-[#1b7f43]" />
                <span className="text-gray-800 font-semibold">{staff.designation}</span>
                <span>•</span>
                <span className="text-gray-600">{staff.department}</span>
              </p>

              {/* Contact Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-gray-600 pt-0.5">
                <div className="flex items-center gap-1.5" title={staff.email}>
                  <EmailOutlined sx={{ fontSize: 15 }} className="text-gray-400 shrink-0" />
                  <span className="font-medium truncate max-w-[220px]">{staff.email || 'No email registered'}</span>
                </div>
                <div className="flex items-center gap-1.5" title={staff.phone}>
                  <PhoneOutlined sx={{ fontSize: 15 }} className="text-emerald-500 shrink-0" />
                  <span className="font-medium">{staff.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-1.5" title={staff.address}>
                  <LocationOnOutlined sx={{ fontSize: 15 }} className="text-blue-500 shrink-0" />
                  <span className="font-medium truncate max-w-[200px]">{staff.address || 'Address N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stat Tiles on Right (Role, Shift, Salary) */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0">
            {/* Shift Pill */}
            <div className="px-4 py-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs min-w-[170px]">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <AccessTimeOutlined sx={{ fontSize: 13 }} /> Shift & Timing
                </span>
                <span className="px-1.5 py-0.5 text-[9.5px] font-bold rounded bg-emerald-50 text-[#1b7f43]">
                  {staff.shift !== 'N/A' ? staff.shift : 'Standard'}
                </span>
              </div>
              <div className="text-xs font-bold text-gray-800">
                <span>{staff.shiftTime || '06:00 - 14:00'}</span>
                <span className="text-[11px] font-normal text-gray-500 block truncate">
                  Assigned Schedule
                </span>
              </div>
            </div>

            {/* Compensation Pill */}
            <div className="px-4 py-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs min-w-[145px]">
              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Salary / Rate
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-[#1b7f43]">
                  {staff.salary ? `$${Number(staff.salary).toLocaleString()}` : 'Confidential'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#e5f4eb] text-[#1b7f43] rounded">
                  /month
                </span>
              </div>
            </div>

            {/* Joining Date Pill */}
            <div className="px-4 py-3 bg-white rounded-xl border border-gray-200/80 shadow-2xs min-w-[145px]">
              <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <CalendarTodayOutlined sx={{ fontSize: 12 }} /> Joining Date
              </span>
              <div className="text-xs font-bold text-gray-800">
                <span>{staff.joiningDate || 'N/A'}</span>
                <span className="text-[11px] font-normal text-gray-500 block">
                  Hire Date
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
