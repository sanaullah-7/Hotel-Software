import React from 'react';
import {
  Warning,
  CleaningServices,
  Cancel,
  Build,
  Schedule,
  CreditCard
} from '@mui/icons-material';
import KPICard from '../../../components/common/KPICard';

export default function DashboardRoomStatus({
  roomInventory = [],
  hkRooms = []
}) {
  const dirtyCount = 12;
  const availableCount = roomInventory.filter((room) => room.status === 'Open').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
      <KPICard
        title="Rooms Dirty"
        value={dirtyCount}
        icon={Warning}
        iconColor="text-red-500"
        variant="compact"
      />
      <KPICard
        title="Rooms Available"
        value={availableCount}
        icon={CleaningServices}
        iconColor="text-teal-500"
        variant="compact"
      />
      <KPICard
        title="Staff Absent"
        value={3}
        icon={Cancel}
        iconColor="text-orange-500"
        variant="compact"
      />
      <KPICard
        title="Under Maintenance"
        value={4}
        icon={Build}
        iconColor="text-gray-500"
        variant="compact"
      />
      <KPICard
        title="Late Checkouts"
        value={8}
        icon={Schedule}
        iconColor="text-purple-500"
        variant="compact"
      />
      <KPICard
        title="Pending Payments"
        value={15}
        icon={CreditCard}
        iconColor="text-red-400"
        variant="compact"
      />
    </div>
  );
}
