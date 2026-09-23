import React from 'react';
import {
  PersonAdd,
  Bed,
  Login,
  Logout,
  AttachMoney,
  CreditCard
} from '@mui/icons-material';

export default function DashboardMetrics({
  reservations = [],
  roomInventory = []
}) {
  const reservationCount = reservations.length;
  const occupiedCount = roomInventory.filter((room) => room.status === 'Booked').length;
  const checkInCount = reservations.filter((reservation) => reservation.status === 'CheckIn').length;
  const checkOutCount = reservations.filter((reservation) => reservation.status === 'CheckOut').length;
  const paidCount = reservations.filter((reservation) => reservation.payment === 'Paid').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      {/* Reservation Today */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">
            Reservation Today
          </span>
          <PersonAdd className="text-blue-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">{reservationCount}</span>
      </div>

      {/* Occupied Rooms */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">
            Occupied Rooms
          </span>
          <Bed className="text-teal-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">{occupiedCount}</span>
      </div>

      {/* Check-in Today */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">
            Check-in Today
          </span>
          <Login className="text-green-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">{checkInCount}</span>
      </div>

      {/* Checkout Today */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">
            Checkout Today
          </span>
          <Logout className="text-orange-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">{checkOutCount}</span>
      </div>

      {/* Revenue Today */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">
            Revenue Today
          </span>
          <AttachMoney className="text-purple-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">$1,250</span>
      </div>

      {/* Payments Today */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">
            Payments Today
          </span>
          <CreditCard className="text-indigo-500 shrink-0" sx={{ fontSize: 16 }} />
        </div>
        <span className="text-lg font-bold text-gray-900">{paidCount}</span>
      </div>
    </div>
  );
}
