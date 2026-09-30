import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Dashboard from '../pages/Dashboard/Dashboard';
import DashboardMetrics from '../pages/Dashboard/components/DashboardMetrics';
import DashboardRoomStatus from '../pages/Dashboard/components/DashboardRoomStatus';
import CurrentBookingsTable from '../pages/Dashboard/components/CurrentBookingsTable';
import BookingsGridTable from '../pages/Dashboard/components/BookingsGridTable';

import {
  addInvoice,
  recordInvoicePayment,
  getInvoices,
  getPayments,
  getRefunds,
  saveInvoices,
  savePayments,
  getCanonicalBookingPaymentStatus
} from '../features/payment-billing/pages/paymentBillingStore';
import { saveReservations } from '../features/reservations/state/reservationStore';
import { saveRooms as saveRoomInventory } from '../features/rooms/state/roomStore';
import { saveRooms as saveHkRooms } from '../features/housekeeping/pages/hkStore';

const noop = () => {};

function getTodayString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getYesterdayString() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getCardContainer(element) {
  return element.closest('.rounded-xl') || element.parentElement?.parentElement;
}

describe('Job 26 — Dashboard Financial Semantics & Current Booking Scope', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('hotel_reservations', JSON.stringify([]));
    localStorage.setItem('hotel_rooms', JSON.stringify([]));
    localStorage.setItem('hk_rooms', JSON.stringify([]));
    localStorage.setItem('hm_invoices_v2', JSON.stringify([]));
    localStorage.setItem('hm_payments_v2', JSON.stringify([]));
    localStorage.setItem('hm_refunds_v2', JSON.stringify([]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // 1. Dashboard Financial KPIs — Revenue Today vs Payments Today
  // -------------------------------------------------------------------------
  describe('Dashboard Financial Metrics Semantics (Job 26)', () => {
    it('Revenue Today measures invoiced revenue attributable to today and excludes yesterday activity', () => {
      const todayStr = getTodayString();
      const yesterdayStr = getYesterdayString();

      const invoices = [
        {
          id: 'INV-101',
          invoiceNumber: 'INV-101',
          date: todayStr,
          issueDate: todayStr,
          totalAmount: 1200,
          paidAmount: 1200,
          balanceDue: 0,
          status: 'Paid'
        },
        {
          id: 'INV-102',
          invoiceNumber: 'INV-102',
          date: todayStr,
          issueDate: todayStr,
          totalAmount: 800,
          paidAmount: 0,
          balanceDue: 800,
          status: 'Unpaid'
        },
        {
          id: 'INV-YEST',
          invoiceNumber: 'INV-YEST',
          date: yesterdayStr,
          issueDate: yesterdayStr,
          totalAmount: 5000,
          paidAmount: 5000,
          balanceDue: 0,
          status: 'Paid'
        }
      ];
      const payments = [
        { id: 'PAY-101', invoiceId: 'INV-101', amount: 1200, paymentDate: todayStr, status: 'Completed', refundedAmount: 0 },
        { id: 'PAY-YEST', invoiceId: 'INV-YEST', amount: 5000, paymentDate: yesterdayStr, status: 'Completed', refundedAmount: 0 }
      ];
      localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
      localStorage.setItem('hm_payments_v2', JSON.stringify(payments));

      const { getByText } = render(
        <DashboardMetrics reservations={[]} roomInventory={[]} />
      );

      // Revenue Today should include only today's verified invoices: INV-101 ($1,200) + INV-102 ($800) = $2,000
      // Yesterday's $5,000 invoice is excluded.
      expect(getByText('Revenue Today')).toBeTruthy();
      const revenueCard = getCardContainer(getByText('Revenue Today'));
      expect(revenueCard.textContent).toContain('$2,000');
    });

    it('Payments Today measures count of completed payment transactions processed today', () => {
      const todayStr = getTodayString();
      const yesterdayStr = getYesterdayString();

      const invoices = [
        {
          id: 'INV-201',
          invoiceNumber: 'INV-201',
          date: todayStr,
          issueDate: todayStr,
          totalAmount: 500,
          paidAmount: 500,
          balanceDue: 0,
          status: 'Paid'
        },
        {
          id: 'INV-202',
          invoiceNumber: 'INV-202',
          date: todayStr,
          issueDate: todayStr,
          totalAmount: 400,
          paidAmount: 200,
          balanceDue: 200,
          status: 'Partially Paid'
        }
      ];
      const payments = [
        { id: 'PAY-T1', invoiceId: 'INV-201', amount: 500, paymentDate: todayStr, status: 'Completed', refundedAmount: 0 },
        { id: 'PAY-T2', invoiceId: 'INV-202', amount: 200, paymentDate: todayStr, status: 'Completed', refundedAmount: 0 },
        { id: 'PAY-YEST', invoiceId: 'INV-201', amount: 1000, paymentDate: yesterdayStr, status: 'Completed', refundedAmount: 0 }
      ];
      localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
      localStorage.setItem('hm_payments_v2', JSON.stringify(payments));

      const { getByText } = render(
        <DashboardMetrics reservations={[]} roomInventory={[]} />
      );

      // Payments Today = 2 (today's transactions PAY-T1 and PAY-T2, excluding PAY-YEST)
      expect(getByText('Payments Today')).toBeTruthy();
      const paymentsCard = getCardContainer(getByText('Payments Today'));
      expect(paymentsCard.textContent).toContain('2');
    });

    it('Pending Payments in DashboardRoomStatus measures count of verified invoices with remaining balance > 0', () => {
      const invoices = [
        {
          id: 'INV-301',
          invoiceNumber: 'INV-301',
          totalAmount: 500,
          paidAmount: 500,
          balanceDue: 0,
          status: 'Paid'
        },
        {
          id: 'INV-302',
          invoiceNumber: 'INV-302',
          totalAmount: 400,
          paidAmount: 100,
          balanceDue: 300,
          status: 'Partially Paid'
        },
        {
          id: 'INV-303',
          invoiceNumber: 'INV-303',
          totalAmount: 600,
          paidAmount: 0,
          balanceDue: 600,
          status: 'Unpaid'
        }
      ];
      const payments = [
        { id: 'PAY-301', invoiceId: 'INV-301', amount: 500, status: 'Completed', refundedAmount: 0 },
        { id: 'PAY-302', invoiceId: 'INV-302', amount: 100, status: 'Completed', refundedAmount: 0 }
      ];
      localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
      localStorage.setItem('hm_payments_v2', JSON.stringify(payments));

      const { getByText } = render(
        <DashboardRoomStatus roomInventory={[]} hkRooms={[]} />
      );

      // Pending Payments in Room Status = 2 (INV-302 and INV-303)
      expect(getByText('Pending Payments')).toBeTruthy();
      const pendingCard = getCardContainer(getByText('Pending Payments'));
      expect(pendingCard.textContent).toContain('2');
    });
  });

  // -------------------------------------------------------------------------
  // 2. Lifecycle KPIs — Check-in and Checkout
  // -------------------------------------------------------------------------
  describe('Lifecycle Status Normalization', () => {
    it('Check-in KPI accurately counts canonical "Checked In" bookings regardless of legacy string variants', () => {
      const reservations = [
        { id: 1, name: 'Guest 1', status: 'Checked In', checkIn: '2026-09-30', checkOut: '2026-10-02' },
        { id: 2, name: 'Guest 2', status: 'CheckIn', checkIn: '2026-09-30', checkOut: '2026-10-02' }, // legacy normalizes
        { id: 3, name: 'Guest 3', status: 'Booked', checkIn: '2026-09-30', checkOut: '2026-10-02' },
        { id: 4, name: 'Guest 4', status: 'Checked Out', checkIn: '2026-09-28', checkOut: '2026-09-30' },
        { id: 5, name: 'Guest 5', status: 'Cancelled', checkIn: '2026-09-30', checkOut: '2026-10-02' }
      ];

      const { getByText } = render(
        <DashboardMetrics reservations={reservations} roomInventory={[]} />
      );

      expect(getByText('Check-in Today')).toBeTruthy();
      const checkInCard = getCardContainer(getByText('Check-in Today'));
      expect(checkInCard.textContent).toContain('2');
    });

    it('Reservation Today KPI accurately counts reservations attributable to today and ignores other dates', () => {
      const todayStr = getTodayString();
      const reservations = [
        { id: 1, name: 'Guest Today 1', status: 'Booked', checkIn: todayStr, checkOut: '2026-10-05' },
        { id: 2, name: 'Guest Today 2', status: 'Pending', createdAt: todayStr, checkIn: '2026-10-10', checkOut: '2026-10-15' },
        { id: 3, name: 'Guest Other Date', status: 'Booked', checkIn: '2026-10-20', checkOut: '2026-10-25' },
        { id: 4, name: 'Guest Past', status: 'Checked Out', checkIn: '2026-09-01', checkOut: '2026-09-05' }
      ];

      const { getByText } = render(
        <DashboardMetrics reservations={reservations} roomInventory={[]} />
      );

      expect(getByText('Reservation Today')).toBeTruthy();
      const resCard = getCardContainer(getByText('Reservation Today'));
      // Only Guest Today 1 and Guest Today 2 (= 2)
      expect(resCard.textContent).toContain('2');
    });

    it('Checkout KPI accurately counts canonical "Checked Out" bookings with checkOut date today', () => {
      const todayStr = getTodayString();
      const reservations = [
        { id: 1, name: 'Guest 1', status: 'Checked Out', checkIn: '2026-09-25', checkOut: todayStr },
        { id: 2, name: 'Guest 2', status: 'CheckOut', checkIn: '2026-09-25', checkOut: todayStr },
        { id: 3, name: 'Guest 3', status: 'Checked Out', checkIn: '2026-09-20', checkOut: '2026-09-21' },
        { id: 4, name: 'Guest 4', status: 'Booked', checkIn: '2026-09-25', checkOut: todayStr },
        { id: 5, name: 'Guest 5', status: 'Cancelled', checkIn: '2026-09-25', checkOut: todayStr }
      ];

      const { getByText } = render(
        <DashboardMetrics reservations={reservations} roomInventory={[]} />
      );

      expect(getByText('Checkout Today')).toBeTruthy();
      const checkOutCard = getCardContainer(getByText('Checkout Today'));
      expect(checkOutCard.textContent).toContain('2');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Current Bookings — Pending, Booked, Checked In vs Checked Out, Cancelled
  // -------------------------------------------------------------------------
  describe('Current Bookings Operational Scope (Job 26)', () => {
    it('includes Pending, Booked, and Checked In while excluding Checked Out and Cancelled bookings', () => {
      const reservations = [
        { id: 10, name: 'Active Guest 1', roomNo: '101', status: 'Booked', checkIn: '2026-10-01', checkOut: '2026-10-05', mobile: '555-1111' },
        { id: 11, name: 'Active Guest 2', roomNo: '102', status: 'Checked In', checkIn: '2026-09-30', checkOut: '2026-10-04', mobile: '555-2222' },
        { id: 12, name: 'Pending Guest 3', roomNo: '103', status: 'Pending', checkIn: '2026-10-10', checkOut: '2026-10-15', mobile: '555-3333' },
        { id: 13, name: 'Departed Guest', roomNo: '104', status: 'Checked Out', checkIn: '2026-09-20', checkOut: '2026-09-25', mobile: '555-4444' },
        { id: 14, name: 'Cancelled Guest', roomNo: '105', status: 'Cancelled', checkIn: '2026-10-01', checkOut: '2026-10-05', mobile: '555-5555' }
      ];
      localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

      const { getByText, queryByText } = render(
        <MemoryRouter>
          <CurrentBookingsTable />
        </MemoryRouter>
      );

      // Active bookings (Pending, Booked, Checked In) must appear
      expect(getByText('Active Guest 1')).toBeTruthy();
      expect(getByText('Active Guest 2')).toBeTruthy();
      expect(getByText('Pending Guest 3')).toBeTruthy();

      // Terminal bookings must NOT appear
      expect(queryByText('Departed Guest')).toBeNull();
      expect(queryByText('Cancelled Guest')).toBeNull();
    });

    it('filters using real current date for Daily and Monthly filters without hardcoded dates', () => {
      const todayStr = getTodayString();
      const now = new Date();
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 2, 15).toISOString().split('T')[0];

      const reservations = [
        { id: 21, name: 'Today Guest', roomNo: '201', status: 'Booked', checkIn: todayStr, checkOut: '2026-12-01', mobile: '555-0001' },
        { id: 22, name: 'Future Guest', roomNo: '202', status: 'Booked', checkIn: nextMonthDate, checkOut: '2026-12-05', mobile: '555-0002' }
      ];
      localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

      const { getByText, queryByText } = render(
        <MemoryRouter>
          <CurrentBookingsTable />
        </MemoryRouter>
      );

      // Default 'All' shows both
      expect(getByText('Today Guest')).toBeTruthy();
      expect(getByText('Future Guest')).toBeTruthy();

      // Click Daily filter
      const dailyBtn = getByText('Daily');
      fireEvent.click(dailyBtn);

      expect(getByText('Today Guest')).toBeTruthy();
      expect(queryByText('Future Guest')).toBeNull();

      // Click Monthly filter
      const monthlyBtn = getByText('Monthly');
      fireEvent.click(monthlyBtn);

      expect(getByText('Today Guest')).toBeTruthy();
      expect(queryByText('Future Guest')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // 4. Financial Truth: Canonical Ledger overrides stale booking.payment
  // -------------------------------------------------------------------------
  describe('Dashboard Financial Truth (Job 24 & Job 25 Invariant)', () => {
    it('displays Unpaid with outstanding dues when booking.payment is Paid but canonical invoice is Unpaid', async () => {
      const booking = {
        id: 50,
        name: 'Unpaid In Ledger',
        roomNo: '301',
        roomType: 'Deluxe',
        package: 'Standard',
        status: 'Booked',
        checkIn: '2026-10-01',
        checkOut: '2026-10-05',
        payment: 'Paid', // STALE / FALSE
        mobile: '555-9999'
      };

      const invoices = [
        {
          id: 'INV-50',
          invoiceNumber: 'INV-50',
          bookingId: 50,
          totalAmount: 600,
          paidAmount: 0,
          balanceDue: 600,
          status: 'Unpaid'
        }
      ];
      localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
      localStorage.setItem('hm_payments_v2', JSON.stringify([]));

      const { findByText, getByText } = render(
        <MemoryRouter>
          <BookingsGridTable
            filteredBookings={[booking]}
            handleRowClick={noop}
            activeMenuId={null}
            toggleMenu={noop}
            setActiveMenuId={noop}
            openViewModal={noop}
            openEditModal={noop}
            confirmDelete={noop}
            handleCheckout={noop}
            confirmCancel={noop}
          />
        </MemoryRouter>
      );

      expect(await findByText('Unpaid')).toBeTruthy();
      expect(getByText('$600')).toBeTruthy();
    });

    it('displays Paid with $0 dues when booking.payment is Unpaid but canonical invoice is Paid', async () => {
      const booking = {
        id: 60,
        name: 'Paid In Ledger',
        roomNo: '302',
        roomType: 'Deluxe',
        package: 'Standard',
        status: 'Booked',
        checkIn: '2026-10-01',
        checkOut: '2026-10-05',
        payment: 'Unpaid', // STALE / FALSE
        mobile: '555-8888'
      };

      const invoices = [
        {
          id: 'INV-60',
          invoiceNumber: 'INV-60',
          bookingId: 60,
          totalAmount: 500,
          paidAmount: 500,
          balanceDue: 0,
          status: 'Paid'
        }
      ];
      const payments = [
        {
          id: 'PAY-60',
          invoiceId: 'INV-60',
          amount: 500,
          status: 'Completed',
          refundedAmount: 0
        }
      ];
      localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
      localStorage.setItem('hm_payments_v2', JSON.stringify(payments));

      const { findByText, getByText } = render(
        <MemoryRouter>
          <BookingsGridTable
            filteredBookings={[booking]}
            handleRowClick={noop}
            activeMenuId={null}
            toggleMenu={noop}
            setActiveMenuId={noop}
            openViewModal={noop}
            openEditModal={noop}
            confirmDelete={noop}
            handleCheckout={noop}
            confirmCancel={noop}
          />
        </MemoryRouter>
      );

      expect(await findByText('Paid')).toBeTruthy();
      expect(getByText('$0')).toBeTruthy();
    });
  });

  // -------------------------------------------------------------------------
  // 5. State Propagation: Reactive update on real canonical mutations
  // -------------------------------------------------------------------------
  describe('Mounted Dashboard Event Propagation', () => {
    it('refreshes Dashboard KPIs and table payment status upon real canonical payment recording without page refresh', async () => {
      const todayStr = getTodayString();
      const booking = {
        id: 88,
        name: 'Reactive Guest',
        roomNo: '401',
        roomType: 'Deluxe',
        package: 'All inclusive',
        status: 'Booked',
        checkIn: todayStr,
        checkOut: '2026-10-10',
        payment: 'Unpaid',
        mobile: '555-3456'
      };
      saveReservations([booking]);

      const initialInvoice = {
        id: 'INV-88',
        invoiceNumber: 'INV-88',
        bookingId: 88,
        guestName: 'Reactive Guest',
        date: todayStr,
        issueDate: todayStr,
        totalAmount: 1000,
        paidAmount: 0,
        balanceDue: 1000,
        status: 'Unpaid'
      };
      saveInvoices([initialInvoice]);

      const { findByText, getByText } = render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );

      // Verify initial state:
      // Revenue Today = $1,000 (invoice created today)
      // Payments Today = 0 (no payment recorded yet)
      // Table status = Unpaid
      expect(await findByText('Unpaid')).toBeTruthy();
      const revenueCard = getCardContainer(getByText('Revenue Today'));
      expect(revenueCard.textContent).toContain('$1,000');
      const paymentsTodayCard = getCardContainer(getByText('Payments Today'));
      expect(paymentsTodayCard.textContent).toContain('0');

      // Perform real canonical payment mutation through paymentBillingStore API
      act(() => {
        recordInvoicePayment('INV-88', {
          amount: 1000,
          paymentMethod: 'Credit Card',
          date: todayStr
        });
      });

      // Verify that the mounted Dashboard dynamically updated:
      // Table shows Paid, Payments Today increments to 1, Revenue Today remains $1,000
      await waitFor(() => {
        expect(screen.getAllByText('Paid').length).toBeGreaterThan(0);
      });
      await waitFor(() => {
        expect(revenueCard.textContent).toContain('$1,000');
        expect(paymentsTodayCard.textContent).toContain('1');
      });
    });
  });
});
