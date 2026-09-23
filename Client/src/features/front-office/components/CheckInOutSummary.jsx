import React from 'react';
import {
  Groups as GroupsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PendingActions as PendingActionsIcon
} from '@mui/icons-material';

export default function CheckInOutSummary({
  totalGuests,
  checkedInCount,
  checkedOutCount,
  pendingCount
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-gray-500 font-semibold text-[11px]">Total Guests</span>
          <span className="text-lg font-bold text-gray-900 leading-tight">{totalGuests}</span>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
          <GroupsIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-gray-500 font-semibold text-[11px]">Checked In</span>
          <span className="text-lg font-bold text-gray-900 leading-tight">{checkedInCount}</span>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
          <LoginIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-gray-500 font-semibold text-[11px]">Checked Out</span>
          <span className="text-lg font-bold text-gray-900 leading-tight">{checkedOutCount}</span>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600">
          <LogoutIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
      <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-gray-500 font-semibold text-[11px]">Pending</span>
          <span className="text-lg font-bold text-gray-900 leading-tight">{pendingCount}</span>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">
          <PendingActionsIcon sx={{ fontSize: 18 }} />
        </div>
      </div>
    </div>
  );
}
