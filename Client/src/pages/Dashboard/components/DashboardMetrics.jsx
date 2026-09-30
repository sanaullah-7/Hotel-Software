import React, { useState, useEffect, useCallback } from 'react';
import {
  PersonAdd,
  Bed,
  Login,
  Logout,
  AttachMoney,
  CreditCard
} from '@mui/icons-material';
import KPICard from '../../../components/common/KPICard';
import { normalizeBookingStatus, parseStayDate } from '../../../features/reservations/state/bookingRules';
import {
  getInvoices,
  getPayments,
  getInvoiceFinancialState,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../../features/payment-billing/pages/paymentBillingStore';

/** Checks if a date string or timestamp corresponds to today in the local calendar. */
function isToday(dateValue) {
  if (!dateValue) return false;
  const ts = typeof dateValue === 'number' ? dateValue : parseStayDate(dateValue);
  if (ts === null || ts === undefined) return false;
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getUTCFullYear() === now.getFullYear() &&
    d.getUTCMonth() === now.getMonth() &&
    d.getUTCDate() === now.getDate()
  );
}

/** Sum invoiced revenue for verified invoices attributable to today. */
function computeRevenueToday(invoices) {
  let total = 0;
  for (const inv of invoices) {
    const state = getInvoiceFinancialState(inv.id || inv.invoiceNumber);
    if (state.integrity !== 'verified') continue;
    const invDateStr = inv.date || inv.issueDate || inv.createdAt || inv.invoiceDate || '';
    if (invDateStr && isToday(invDateStr)) {
      total += Number(inv.totalAmount || 0);
    }
  }
  return total;
}

/** Count successful payment transactions recorded today. */
function computePaymentsToday(payments) {
  let count = 0;
  for (const p of payments) {
    const isSuccessful = ['completed', 'partially refunded', 'refunded'].includes(String(p.status || '').toLowerCase());
    if (!isSuccessful) continue;
    const pDateStr = p.paymentDate || p.date || p.createdAt || '';
    if (pDateStr && isToday(pDateStr)) {
      count++;
    }
  }
  return count;
}

export default function DashboardMetrics({
  reservations = [],
  roomInventory = []
}) {
  // Reservation Today: reservations created/booked for today or checking in today
  const reservationTodayCount = reservations.filter((r) =>
    isToday(r.createdAt || r.date || r.reservationDate || r.bookingDate || r.checkIn)
  ).length;

  const occupiedCount = roomInventory.filter((room) => room.status === 'Booked').length;

  // Check-in Today: bookings currently in canonical 'Checked In' state
  const checkInCount = reservations.filter(
    (r) => normalizeBookingStatus(r.status) === 'Checked In'
  ).length;

  // Checkout Today: bookings in canonical 'Checked Out' state whose checkOut date is today
  const checkOutCount = reservations.filter((r) => {
    if (normalizeBookingStatus(r.status) !== 'Checked Out') return false;
    return isToday(r.checkOut);
  }).length;

  // Billing-derived KPIs (reactive to Job 23 events)
  const [revenueToday, setRevenueToday] = useState(0);
  const [paymentsTodayCount, setPaymentsTodayCount] = useState(0);

  const refreshBillingKPIs = useCallback(() => {
    const invoices = getInvoices();
    const payments = getPayments();
    setRevenueToday(computeRevenueToday(invoices));
    setPaymentsTodayCount(computePaymentsToday(payments));
  }, []);

  useEffect(() => {
    refreshBillingKPIs();
  }, [refreshBillingKPIs]);

  // Job 23: update KPIs on canonical financial mutations
  useEffect(() => {
    window.addEventListener(INVOICES_UPDATED_EVENT, refreshBillingKPIs);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, refreshBillingKPIs);
    window.addEventListener(REFUNDS_UPDATED_EVENT, refreshBillingKPIs);
    return () => {
      window.removeEventListener(INVOICES_UPDATED_EVENT, refreshBillingKPIs);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, refreshBillingKPIs);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, refreshBillingKPIs);
    };
  }, [refreshBillingKPIs]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
      <KPICard
        title="Reservation Today"
        value={reservationTodayCount}
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
        value={`$${revenueToday.toLocaleString()}`}
        icon={AttachMoney}
        iconColor="text-purple-500"
        variant="compact"
      />
      <KPICard
        title="Payments Today"
        value={paymentsTodayCount}
        icon={CreditCard}
        iconColor="text-indigo-500"
        variant="compact"
      />
    </div>
  );
}
