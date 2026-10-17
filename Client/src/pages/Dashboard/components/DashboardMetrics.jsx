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
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT
} from '../../../features/payment-billing/pages/paymentBillingStore';

/** Checks if a date string or timestamp corresponds to today in local calendar or ISO format. */
function isToday(dateValue) {
  if (!dateValue) return false;
  const rawStr = String(dateValue).trim();
  const now = new Date();
  const localIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (rawStr.startsWith(localIso)) return true;

  const ts = typeof dateValue === 'number' ? dateValue : parseStayDate(dateValue);
  if (ts !== null && ts !== undefined && !isNaN(ts)) {
    const d = new Date(ts);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  const parsed = new Date(dateValue);
  if (!isNaN(parsed.getTime())) {
    return (
      parsed.getFullYear() === now.getFullYear() &&
      parsed.getMonth() === now.getMonth() &&
      parsed.getDate() === now.getDate()
    );
  }

  return false;
}

/** Sum invoiced revenue attributable to today. */
function computeRevenueToday(invoices) {
  let total = 0;
  for (const inv of invoices) {
    if (inv.financialIntegrity && inv.financialIntegrity !== 'verified') continue;
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
  roomInventory = [],
  serverMetrics = null
}) {
  // Reservation Today: Authoritative server metric with fallback
  const reservationTodayCount = serverMetrics?.today_reservations !== undefined
    ? serverMetrics.today_reservations
    : reservations.filter((r) =>
        isToday(r.createdAt) || isToday(r.bookingDate) || isToday(r.reservationDate) || isToday(r.date) || isToday(r.checkIn)
      ).length;

  // Occupied Rooms: Authoritative server metric with fallback
  const occupiedCount = serverMetrics?.occupied_rooms !== undefined
    ? serverMetrics.occupied_rooms
    : roomInventory.filter(
        (room) => room.status === 'Booked' || room.status === 'OCCUPIED' || room.status === 'Occupied'
      ).length;

  // Check-in Today: Authoritative server metric with fallback
  const checkInCount = serverMetrics?.today_check_ins !== undefined
    ? serverMetrics.today_check_ins
    : reservations.filter(
        (r) => normalizeBookingStatus(r.status) === 'Checked In'
      ).length;

  // Checkout Today: Authoritative server metric with fallback
  const checkOutCount = serverMetrics?.today_check_outs !== undefined
    ? serverMetrics.today_check_outs
    : reservations.filter((r) => {
        if (normalizeBookingStatus(r.status) !== 'Checked Out') return false;
        return isToday(r.checkedOutAt || r.checkoutDate || r.checkOut);
      }).length;

  // Billing-derived KPIs (reactive to payment & invoice events and backend data)
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

  useEffect(() => {
    window.addEventListener(INVOICES_UPDATED_EVENT, refreshBillingKPIs);
    window.addEventListener(PAYMENTS_UPDATED_EVENT, refreshBillingKPIs);
    window.addEventListener(REFUNDS_UPDATED_EVENT, refreshBillingKPIs);
    window.addEventListener('storage', refreshBillingKPIs);
    return () => {
      window.removeEventListener(INVOICES_UPDATED_EVENT, refreshBillingKPIs);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, refreshBillingKPIs);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, refreshBillingKPIs);
      window.removeEventListener('storage', refreshBillingKPIs);
    };
  }, [refreshBillingKPIs]);

  const displayRevenue = serverMetrics?.today_revenue !== undefined
    ? `$${serverMetrics.today_revenue.toLocaleString()}`
    : `$${revenueToday.toLocaleString()}`;

  const displayPayments = serverMetrics?.payments_today_count !== undefined
    ? serverMetrics.payments_today_count
    : paymentsTodayCount;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
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
        value={displayRevenue}
        icon={AttachMoney}
        iconColor="text-purple-500"
        variant="compact"
      />
      <KPICard
        title="Payments Today"
        value={displayPayments}
        icon={CreditCard}
        iconColor="text-indigo-500"
        variant="compact"
      />
    </div>
  );
}
