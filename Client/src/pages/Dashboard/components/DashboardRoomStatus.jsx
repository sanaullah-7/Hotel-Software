import React, { useState, useEffect, useCallback } from 'react';
import {
  Warning,
  CleaningServices,
  Cancel,
  Build,
  Schedule,
  CreditCard
} from '@mui/icons-material';
import KPICard from '../../../components/common/KPICard';
import {
  getInvoices,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../../features/payment-billing/pages/paymentBillingStore';

/** Count invoices with outstanding backend balance (pending payments). */
function computePendingPayments(invoices = getInvoices()) {
  let count = 0;
  for (const inv of invoices) {
    const due = Number(inv.balanceDue ?? (Number(inv.totalAmount || 0) - Number(inv.paidAmount || 0)));
    if (due > 0.005 && inv.status !== 'Paid') count++;
  }
  return count;
}

export default function DashboardRoomStatus({
  roomInventory = [],
  hkRooms = [],
  absentStaffCount
}) {
  // Rooms Dirty — from authoritative backend room (housekeeping_status === 'DIRTY') or status 'Dirty'
  const dirtyCount = (hkRooms.length > 0 ? hkRooms : roomInventory).filter(
    (r) => r.housekeeping_status === 'DIRTY' || r.status === 'Dirty' || r.status === 'DIRTY' || r.status === 'CLEANING'
  ).length;

  // Rooms Available — from authoritative room inventory (status === 'AVAILABLE' or 'Open')
  const availableCount = roomInventory.filter(
    (room) => room.status === 'AVAILABLE' || room.status === 'Open' || room.status === 'Available'
  ).length;

  // Under Maintenance — from authoritative room inventory (status === 'MAINTENANCE' or 'Maintenance')
  const maintenanceCount = (hkRooms.length > 0 ? hkRooms : roomInventory).filter(
    (r) => r.status === 'MAINTENANCE' || r.status === 'Maintenance'
  ).length;

  // Pending Payments — canonical invoice balance > 0 (reactive to billing events & backend invoices)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  const refreshPending = useCallback(() => {
    setPendingPaymentsCount(computePendingPayments());
  }, []);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  // Refresh on canonical financial mutations & storage
  useEffect(() => {
    window.addEventListener(INVOICES_UPDATED_EVENT, refreshPending);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, refreshPending);
    window.addEventListener(REFUNDS_UPDATED_EVENT, refreshPending);
    window.addEventListener('storage', refreshPending);
    return () => {
      window.removeEventListener(INVOICES_UPDATED_EVENT, refreshPending);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, refreshPending);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, refreshPending);
      window.removeEventListener('storage', refreshPending);
    };
  }, [refreshPending]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
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
      {/*
        Staff Absent: No canonical staff attendance source in this application.
        The housekeeping staff store (hkStore) tracks 'Active' / 'Off Duty', not absence.
        Remaining Finding — not safely derivable without inventing a definition.
      */}
      <KPICard
        title="Staff Absent"
        value="—"
        icon={Cancel}
        iconColor="text-orange-500"
        variant="compact"
      />
      <KPICard
        title="Under Maintenance"
        value={maintenanceCount}
        icon={Build}
        iconColor="text-gray-500"
        variant="compact"
      />
      {/*
        Late Checkouts: No reliable canonical source — application does not track
        a defined expected checkout time vs actual checkout time per booking.
        Remaining Finding — not safely derivable without inventing a business rule.
      */}
      <KPICard
        title="Late Checkouts"
        value="—"
        icon={Schedule}
        iconColor="text-purple-500"
        variant="compact"
      />
      <KPICard
        title="Pending Payments"
        value={pendingPaymentsCount}
        icon={CreditCard}
        iconColor="text-red-400"
        variant="compact"
      />
    </div>
  );
}
