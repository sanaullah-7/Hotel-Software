import React from 'react';
import {
  Groups as GroupsIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PendingActions as PendingActionsIcon
} from '@mui/icons-material';
import KPICard from '../../../components/common/KPICard';

export default function CheckInOutSummary({
  totalGuests,
  checkedInCount,
  checkedOutCount,
  pendingCount
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <KPICard
        title="Total Guests"
        value={totalGuests}
        icon={GroupsIcon}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        variant="horizontal"
      />
      <KPICard
        title="Checked In"
        value={checkedInCount}
        icon={LoginIcon}
        iconBg="bg-green-50"
        iconColor="text-green-600"
        variant="horizontal"
      />
      <KPICard
        title="Checked Out"
        value={checkedOutCount}
        icon={LogoutIcon}
        iconBg="bg-red-50"
        iconColor="text-red-600"
        variant="horizontal"
      />
      <KPICard
        title="Pending"
        value={pendingCount}
        icon={PendingActionsIcon}
        iconBg="bg-orange-50"
        iconColor="text-orange-600"
        variant="horizontal"
      />
    </div>
  );
}
