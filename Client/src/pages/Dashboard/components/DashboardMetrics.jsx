import React from 'react';
import {
  PersonAdd,
  Bed,
  Login,
  Logout,
  AttachMoney,
  CreditCard
} from '@mui/icons-material';
import KPICard from '../../../components/common/KPICard';

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
      <KPICard
        title="Reservation Today"
        value={reservationCount}
        icon={PersonAdd}
        iconColor="text-blue-500"
        variant="compact"
      />
      <KPICard
        title="Occupied Rooms"
        value={occupiedCount}
        icon={Bed}
        iconColor="text-teal-500"
        variant="compact"
      />
      <KPICard
        title="Check-in Today"
        value={checkInCount}
        icon={Login}
        iconColor="text-green-500"
        variant="compact"
      />
      <KPICard
        title="Checkout Today"
        value={checkOutCount}
        icon={Logout}
        iconColor="text-orange-500"
        variant="compact"
      />
      <KPICard
        title="Revenue Today"
        value="$1,250"
        icon={AttachMoney}
        iconColor="text-purple-500"
        variant="compact"
      />
      <KPICard
        title="Payments Today"
        value={paidCount}
        icon={CreditCard}
        iconColor="text-indigo-500"
        variant="compact"
      />
    </div>
  );
}
