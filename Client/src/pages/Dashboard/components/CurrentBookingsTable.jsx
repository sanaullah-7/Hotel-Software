import React from 'react';
import AllBookings from '../../../features/reservations/pages/AllReservations';

export default function CurrentBookingsTable({
  title = 'Current Booking',
  showDateFilter = true
}) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="p-4">
        <AllBookings title={title} showDateFilter={showDateFilter} />
      </div>
    </div>
  );
}
