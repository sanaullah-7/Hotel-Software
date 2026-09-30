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
  getInvoiceFinancialState,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../../features/payment-billing/pages/paymentBillingStore';

/** Count invoices with outstanding canonical balance (pending payments). */
function computePendingPayments() {
  const invoices = getInvoices();
  let count = 0;
  for (const inv of invoices) {
    const state = getInvoiceFinancialState(inv.id || inv.invoiceNumber);
    if (state.integrity === 'verified' && state.due > 0.005) count++;
  }
  return count;
}

export default function DashboardRoomStatus({
  roomInventory = [],
  hkRooms = []
}) {
  // Rooms Dirty — from canonical housekeeping store (status === 'Dirty')
  const dirtyCount = hkRooms.filter((r) => r.status === 'Dirty').length;

  // Rooms Available — from canonical room inventory (status === 'Open')
  const availableCount = roomInventory.filter((room) => room.status === 'Open').length;

  // Under Maintenance — from canonical housekeeping store (status === 'Maintenance')
  const maintenanceCount = hkRooms.filter((r) => r.status === 'Maintenance').length;

  // Pending Payments — canonical invoice balance > 0 (reactive to billing events)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  const refreshPending = useCallback(() => {
    setPendingPaymentsCount(computePendingPayments());
  }, []);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  // Job 23: refresh on canonical financial mutations
  useEffect(() => {
    window.addEventListener(INVOICES_UPDATED_EVENT, refreshPending);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, refreshPending);
    window.addEventListener(REFUNDS_UPDATED_EVENT, refreshPending);
    return () => {
      window.removeEventListener(INVOICES_UPDATED_EVENT, refreshPending);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, refreshPending);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, refreshPending);
    };
  }, [refreshPending]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
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
