import React from 'react';
import {
  Warning,
  CleaningServices,
  Cancel,
  Build,
  Schedule,
  CreditCard
} from '@mui/icons-material';

export default function DashboardRoomStatus({
  roomInventory = [],
  hkRooms = []
}) {
  const dirtyCount = 12;
  const availableCount = roomInventory.filter((room) => room.status === 'Open').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      {/* Rooms Dirty */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">
            Rooms Dirty
          </span>
          <Warning className="text-red-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">{dirtyCount}</span>
      </div>

      {/* Rooms Available */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">
            Rooms Available
          </span>
          <CleaningServices className="text-teal-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">{availableCount}</span>
      </div>

      {/* Staff Absent */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">
            Staff Absent
          </span>
          <Cancel className="text-orange-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">3</span>
      </div>

      {/* Under Maintenance */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">
            Under Maintenance
          </span>
          <Build className="text-gray-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">4</span>
      </div>

      {/* Late Checkouts */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">
            Late Checkouts
          </span>
          <Schedule className="text-purple-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">8</span>
      </div>

      {/* Pending Payments */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] truncate pr-1">
            Pending Payments
          </span>
          <CreditCard className="text-red-400 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">15</span>
      </div>
    </div>
  );
}
