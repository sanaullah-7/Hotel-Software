/**
 * Job 24 — Canonical Reservation Payment Display Tests
 *
 * Proves that ReservationTable and ReservationViewModal no longer use
 * booking.payment as the authoritative financial source.
 *
 * All tests verify the canonical Invoice → Payment → Refund ledger is the
 * source of truth for payment status and dues shown in reservation screens.
 */
import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReservationTable from '../features/reservations/components/ReservationTable';
import ReservationViewModal from '../features/reservations/components/ReservationViewModal';
import {
  getCanonicalBookingPaymentStatus,
  recordInvoicePayment,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT,
} from '../features/payment-billing/pages/paymentBillingStore';
import { saveReservations } from '../features/reservations/state/reservationStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const noop = () => {};

function renderTable(bookings) {
  return render(
    <MemoryRouter>
      <ReservationTable
        bookings={bookings}
        activeMenuId={null}
        onToggleMenu={noop}
        onCloseMenu={noop}
        onRowClick={noop}
        onOpenViewModal={noop}
        onOpenEditModal={noop}
        onConfirmDelete={noop}
        onConfirmCancel={noop}
        onCheckout={noop}
      />
    </MemoryRouter>
  );
}

function renderViewModal(booking) {
  return render(
    <MemoryRouter>
      <ReservationViewModal
        open={true}
        booking={booking}
        onClose={noop}
        onEdit={noop}
      />
    </MemoryRouter>
  );
}

// A verified invoice + payment fixture that produces a 'Paid' canonical status.
function seedPaidInvoice(bookingId) {
  const invoices = [
    {
      id: `INV-T1-${bookingId}`,
      invoiceNumber: `INV-T1-${bookingId}`,
      bookingId,
      totalAmount: 500,
      paidAmount: 500,
      balanceDue: 0,
      status: 'Paid',
    },
  ];
  const payments = [
    {
      id: `PAY-T1-${bookingId}`,
      paymentId: `PAY-T1-${bookingId}`,
      invoiceId: `INV-T1-${bookingId}`,
      invoiceNumber: `INV-T1-${bookingId}`,
      bookingId,
      amount: 500,
      status: 'Completed',
      refundedAmount: 0,
    },
  ];
  localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
  localStorage.setItem('hm_payments_v2', JSON.stringify(payments));
  localStorage.setItem('hm_refunds_v2', JSON.stringify([]));
}

// ---------------------------------------------------------------------------
// describe
// ---------------------------------------------------------------------------
describe('Canonical Reservation Payment Display (Job 24)', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('hotel_reservations', JSON.stringify([]));
    localStorage.setItem('hm_invoices_v2', JSON.stringify([]));
    localStorage.setItem('hm_payments_v2', JSON.stringify([]));
    localStorage.setItem('hm_refunds_v2', JSON.stringify([]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Test 1 — Paid booking: canonical status overrides booking.payment = 'Unpaid'
  it('Test 1 - Paid booking: displays Paid even when booking.payment = Unpaid', () => {
    const bookingId = 'B-T1-PAID';
    seedPaidInvoice(bookingId);

    const booking = {
      id: bookingId,
      name: 'Alice Canonical',
      payment: 'Unpaid',   // deliberately stale/wrong
      status: 'Booked',
      checkIn: '2026-01-10',
      checkOut: '2026-01-12',
      roomType: 'Standard',
      package: 'Room Only',
      mobile: '5551111111',
      avatar: '',
    };

    // Verify the helper itself
    expect(getCanonicalBookingPaymentStatus(bookingId)).toBe('Paid');

    // Verify ReservationTable renders canonical status
    const { getByText } = renderTable([booking]);
    expect(getByText('Paid')).toBeTruthy();

    // The stale booking.payment value must NOT appear as the payment status
    const row = getByText('Alice Canonical').closest('tr');
    const statusCells = row.querySelectorAll('td');
    const paymentCellText = statusCells[6]?.textContent || '';
    expect(paymentCellText).toContain('Paid');
    expect(paymentCellText).not.toBe('Unpaid');
  });

  // Test 2 — Partial payment: canonical 'Partially Paid' status
  it('Test 2 - Partial payment: displays canonical Partially Paid status', () => {
    const bookingId = 'B-T2-PART';
    const invoices = [
      {
        id: `INV-T2-${bookingId}`,
        invoiceNumber: `INV-T2-${bookingId}`,
        bookingId,
        totalAmount: 1000,
        paidAmount: 400,
        balanceDue: 600,
        status: 'Partially Paid',
      },
    ];
    const payments = [
      {
        id: `PAY-T2-${bookingId}`,
        paymentId: `PAY-T2-${bookingId}`,
        invoiceId: `INV-T2-${bookingId}`,
        invoiceNumber: `INV-T2-${bookingId}`,
        bookingId,
        amount: 400,
        status: 'Completed',
        refundedAmount: 0,
      },
    ];
    localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
    localStorage.setItem('hm_payments_v2', JSON.stringify(payments));

    const booking = {
      id: bookingId,
      name: 'Bob Partial',
      payment: 'Unpaid',
      status: 'Booked',
      checkIn: '2026-02-10',
      checkOut: '2026-02-12',
      roomType: 'Standard',
      package: 'Room Only',
      mobile: '5552222222',
      avatar: '',
    };

    expect(getCanonicalBookingPaymentStatus(bookingId)).toBe('Partially Paid');

    const { getByText } = renderTable([booking]);
    expect(getByText('Partially Paid')).toBeTruthy();
  });

  // Test 3 — Outstanding balance: dues from canonical ledger
  it('Test 3 - Outstanding balance: dues = $600 from canonical (Invoice 1000, Payment 400)', () => {
    const bookingId = 'B-T3-DUES';
    const invoices = [
      {
        id: `INV-T3-${bookingId}`,
        invoiceNumber: `INV-T3-${bookingId}`,
        bookingId,
        totalAmount: 1000,
        paidAmount: 400,
        balanceDue: 600,
        status: 'Partially Paid',
      },
    ];
    const payments = [
      {
        id: `PAY-T3-${bookingId}`,
        paymentId: `PAY-T3-${bookingId}`,
        invoiceId: `INV-T3-${bookingId}`,
        invoiceNumber: `INV-T3-${bookingId}`,
        bookingId,
        amount: 400,
        status: 'Completed',
        refundedAmount: 0,
      },
    ];
    localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
    localStorage.setItem('hm_payments_v2', JSON.stringify(payments));

    const booking = {
      id: bookingId,
      name: 'Charlie Dues',
      payment: 'Unpaid',
      status: 'Booked',
      checkIn: '2026-03-01',
      checkOut: '2026-03-03',
      roomType: 'Deluxe',
      package: 'Bed and Breakfast',
      mobile: '5553333333',
      avatar: '',
    };

    const { getByText } = renderTable([booking]);
    // Dues cell should show $600
    expect(getByText('$600')).toBeTruthy();
  });

  // Test 4 — Refund affects displayed status
  it('Test 4 - Refund of 300 on fully-paid invoice ($1000) results in Partially Paid', () => {
    const bookingId = 'B-T4-REFUND';
    const invoiceId = `INV-T4-${bookingId}`;
    const paymentId = `PAY-T4-${bookingId}`;

    const invoices = [
      {
        id: invoiceId,
        invoiceNumber: invoiceId,
        bookingId,
        totalAmount: 1000,
        paidAmount: 700,
        balanceDue: 300,
        status: 'Partially Paid',
      },
    ];
    const payments = [
      {
        id: paymentId,
        paymentId,
        invoiceId,
        invoiceNumber: invoiceId,
        bookingId,
        amount: 1000,
        status: 'Partially Refunded',
        refundedAmount: 300,
      },
    ];
    const refunds = [
      {
        id: `REF-T4-${bookingId}`,
        paymentId,
        invoiceId,
        bookingId,
        amount: 300,
        refundAmount: 300,
        status: 'Completed',
      },
    ];
    localStorage.setItem('hm_invoices_v2', JSON.stringify(invoices));
    localStorage.setItem('hm_payments_v2', JSON.stringify(payments));
    localStorage.setItem('hm_refunds_v2', JSON.stringify(refunds));

    const booking = {
      id: bookingId,
      name: 'Diana Refund',
      payment: 'Paid',  // stale: shows Paid, canonical should show Partially Paid
      status: 'Checked Out',
      checkIn: '2026-04-01',
      checkOut: '2026-04-03',
      roomType: 'Standard',
      package: 'All Inclusive',
      mobile: '5554444444',
      avatar: '',
    };

    const status = getCanonicalBookingPaymentStatus(bookingId);
    expect(status).toBe('Partially Paid');

    const { getByText } = renderTable([booking]);
    expect(getByText('Partially Paid')).toBeTruthy();
  });

  // Test 5 — Legacy snapshot deliberately incorrect: canonical wins
  it('Test 5 - booking.payment = Unpaid overridden by canonical Paid invoice (regression guard)', () => {
    const bookingId = 'B-T5-LEGACY';
    seedPaidInvoice(bookingId);

    const booking = {
      id: bookingId,
      name: 'Eve Legacy',
      payment: 'Unpaid',     // DELIBERATELY WRONG - canonical says Paid
      status: 'Checked Out',
      checkIn: '2026-05-01',
      checkOut: '2026-05-03',
      roomType: 'Suite',
      package: 'All Inclusive',
      mobile: '5555555555',
      avatar: '',
    };

    expect(getCanonicalBookingPaymentStatus(bookingId)).toBe('Paid');

    const { getByText } = renderTable([booking]);
    const row = getByText('Eve Legacy').closest('tr');

    // Payment column (index 6) must contain 'Paid' not 'Unpaid'
    const statusCells = row.querySelectorAll('td');
    const paymentCellText = statusCells[6]?.textContent || '';
    expect(paymentCellText).not.toBe('Unpaid');
    expect(paymentCellText).toContain('Paid');
  });

  // Test 6 — No invoice yet: display dash, no creation, no error
  it('Test 6 - No invoice: payment column shows dash, no invoice created, no error thrown', () => {
    const bookingId = 'B-T6-NOINV';

    const booking = {
      id: bookingId,
      name: 'Frank NoInvoice',
      payment: 'Unpaid',
      status: 'Booked',
      checkIn: '2026-06-01',
      checkOut: '2026-06-03',
      roomType: 'Standard',
      package: 'Room Only',
      mobile: '5556666666',
      avatar: '',
    };

    expect(getCanonicalBookingPaymentStatus(bookingId)).toBeNull();

    const { getByText, queryByText } = renderTable([booking]);
    expect(getByText('Frank NoInvoice')).toBeTruthy();

    // No invoice should have been created
    const invoices = JSON.parse(localStorage.getItem('hm_invoices_v2') || '[]');
    expect(invoices.length).toBe(0);

    // Payment column shows dash, not a Paid/Unpaid badge
    const row = getByText('Frank NoInvoice').closest('tr');
    const paymentCellText = row.querySelectorAll('td')[6]?.textContent || '';
    expect(paymentCellText).not.toContain('Paid');
    expect(paymentCellText).not.toContain('Unpaid');
  });

  // Test 7 — Event propagation: payment mutation updates mounted table
  it('Test 7 - Event propagation: mounted ReservationTable shows Paid after real payment mutation', async () => {
    const bookingId = 'B-T7-EVENT';

    const bookingRecord = {
      id: bookingId, name: 'Grace Event', status: 'Booked',
      checkIn: '2026-07-01', checkOut: '2026-07-03'
    };
    saveReservations([bookingRecord]);

    const invoiceId = `INV-T7-${bookingId}`;
    const initialInvoices = [
      {
        id: invoiceId,
        invoiceNumber: invoiceId,
        bookingId,
        totalAmount: 800,
        paidAmount: 0,
        balanceDue: 800,
        status: 'Unpaid',
        items: [],
        payments: [],
      },
    ];
    localStorage.setItem('hm_invoices_v2', JSON.stringify(initialInvoices));
    localStorage.setItem('hm_payments_v2', JSON.stringify([]));
    localStorage.setItem('hm_refunds_v2', JSON.stringify([]));

    const booking = {
      id: bookingId,
      name: 'Grace Event',
      payment: 'Unpaid',
      status: 'Booked',
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      roomType: 'Deluxe',
      package: 'Room Only',
      mobile: '5557777777',
      avatar: '',
    };

    const { getByText, queryByText } = renderTable([booking]);
    expect(getByText('Unpaid')).toBeTruthy();

    // Perform the real canonical payment mutation (dispatches PAYMENTS_UPDATED_EVENT + INVOICES_UPDATED_EVENT)
    act(() => {
      recordInvoicePayment(invoiceId, {
        amount: 800,
        paymentMethod: 'Cash',
        paymentDate: '2026-07-01',
        notes: 'Full payment',
        bookingId,
      });
    });

    // Table must update to Paid without page refresh
    await waitFor(() => {
      expect(getByText('Paid')).toBeTruthy();
      expect(queryByText('Unpaid')).toBeNull();
    }, { timeout: 3000 });
  });

  // Bonus — ReservationViewModal also reads canonical state
  it('Bonus - ReservationViewModal shows canonical Paid when booking.payment = Unpaid', () => {
    const bookingId = 'B-T8-MODAL';
    seedPaidInvoice(bookingId);

    const booking = {
      id: bookingId,
      name: 'Henry Modal',
      payment: 'Unpaid',   // stale
      status: 'Booked',
      checkIn: '2026-08-01',
      checkOut: '2026-08-03',
      roomType: 'Standard',
      package: 'Room Only',
      mobile: '5558888888',
      avatar: '',
      email: 'henry@test.com',
      room: '101',
    };

    expect(getCanonicalBookingPaymentStatus(bookingId)).toBe('Paid');

    const { getByText } = renderViewModal(booking);
    expect(getByText('Paid')).toBeTruthy();
  });
});
