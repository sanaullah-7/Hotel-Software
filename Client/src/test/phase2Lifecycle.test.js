import { beforeEach, describe, expect, it } from 'vitest';
import { hasBookingDateOverlap, isRoomBlockingBooking, normalizeBookingStatus } from '../features/reservations/state/bookingRules';
import { buildFrontOfficeRows, checkInBooking, checkOutBooking, getRoomAvailability } from '../features/reservations/state/reservationLifecycle';
import { saveReservations } from '../features/reservations/state/reservationStore';
import { saveRooms } from '../features/rooms/state/roomStore';
import { getInvoiceFinancialState, getInvoices, getPayments, getRefunds, processRefund, recordInvoicePayment, saveInvoices, savePayments, saveRefunds, updateRefundStatus } from '../features/payment-billing/pages/paymentBillingStore';
import { INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_REFUNDS } from '../features/payment-billing/data/paymentBillingDemoData';

describe('Phase 2 lifecycle and financial rules', () => {
  beforeEach(() => {
    localStorage.clear();
    saveRooms([{ id: 'R1', roomNo: '101', status: 'Open', roomType: 'Standard' }]);
    saveReservations([]);
    localStorage.setItem('hotel_rooms', JSON.stringify([{ number: 101, roomId: 'R1', status: 'AVAILABLE', guest: null }]));
  });

  it('normalizes legacy statuses and blocks only active confirmed stays with half-open date ranges', () => {
    expect(normalizeBookingStatus('Reserved')).toBe('Booked');
    for (const status of ['Booked', 'Reserved', 'CheckIn', 'Checked In']) expect(isRoomBlockingBooking({ status })).toBe(true);
    for (const status of ['Pending', 'CheckOut', 'Checked Out', 'Cancelled']) expect(isRoomBlockingBooking({ status })).toBe(false);
    expect(hasBookingDateOverlap({ status: 'Booked', checkIn: '2026-10-01', checkOut: '2026-10-03' }, '2026-10-02', '2026-10-04')).toBe(true);
    expect(hasBookingDateOverlap({ status: 'Booked', checkIn: '2026-10-01', checkOut: '2026-10-03' }, '2026-10-03', '2026-10-04')).toBe(false);
  });

  it('checks in once into canonical booking and occupancy, then checks out without deleting the booking', () => {
    saveReservations([{ id: 'B1', roomId: 'R1', guestId: 'G1', status: 'Booked', checkIn: '2026-10-01', checkOut: '2026-10-03', name: 'Guest' }]);
    expect(getRoomAvailability({ id: 'R1', status: 'Open' }, '2026-10-01', '2026-10-02').available).toBe(false);
    checkInBooking('B1');
    expect(() => checkInBooking('B1')).toThrow();
    expect(JSON.parse(localStorage.getItem('hotel_rooms')).filter((row) => row.bookingId === 'B1')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('hotel_reservations'))[0].status).toBe('Checked In');
    checkOutBooking('B1');
    expect(() => checkOutBooking('B1')).toThrow();
    expect(JSON.parse(localStorage.getItem('hotel_reservations'))).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('hotel_reservations'))[0].status).toBe('Checked Out');
    const occupancy = JSON.parse(localStorage.getItem('hotel_rooms'))[0];
    expect(occupancy).toMatchObject({ status: 'AVAILABLE', bookingId: '' });
  });

  it('preserves front office rows that cannot be mapped by exact reference as legacy read-only rows', () => {
    const rows = buildFrontOfficeRows([{ id: 'B1', status: 'Booked', roomId: 'R1' }], [
      { id: 'B1', bookingId: 'B1', name: 'Mapped' },
      { id: 'BK-1002', bookingId: 'BK-1002', name: 'Legacy' },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.id === 'B1').isLegacyUnmapped).toBe(false);
    expect(rows.find((row) => row.id === 'BK-1002')).toMatchObject({ isLegacyUnmapped: true, name: 'Legacy' });
  });

  it('calculates full, partial, multiple payments and completed refunds from stable ledger links', () => {
    saveInvoices([{ id: 'I1', bookingId: 'B1', totalAmount: 100, paidAmount: 0, balanceDue: 100, status: 'Unpaid' }]);
    recordInvoicePayment('I1', { amount: 40 });
    recordInvoicePayment('I1', { amount: 60 });
    let state = getInvoiceFinancialState('I1');
    expect(state).toMatchObject({ integrity: 'verified', effectivePaid: 100, due: 0 });
    const pay = getPayments()[0];
    processRefund({ paymentId: pay.id, amount: 25 });
    state = getInvoiceFinancialState('I1');
    expect(state).toMatchObject({ integrity: 'verified', effectivePaid: 75, due: 25 });
  });

  it('counts a refund only after approval and updates the related invoice when approved', () => {
    saveInvoices([{ id: 'I1', bookingId: 'B1', totalAmount: 100, paidAmount: 100, balanceDue: 0, status: 'Paid' }]);
    savePayments([{ id: 'P1', paymentId: 'P1', invoiceId: 'I1', bookingId: 'B1', amount: 100, refundedAmount: 0, status: 'Completed' }]);
    saveRefunds([{ id: 'R1', refundId: 'R1', paymentId: 'P1', invoiceId: 'I1', amount: 30, status: 'Pending Approval' }]);
    expect(getInvoiceFinancialState('I1')).toMatchObject({ integrity: 'verified', effectivePaid: 100, due: 0 });
    updateRefundStatus('R1', 'Completed');
    expect(getInvoiceFinancialState('I1')).toMatchObject({ integrity: 'verified', effectivePaid: 70, due: 30 });
  });

  it('flags INV-2026-007 as unresolved and preserves its conflicting snapshots and ledgers', () => {
    saveInvoices(INITIAL_INVOICES);
    savePayments(INITIAL_PAYMENTS);
    saveRefunds(INITIAL_REFUNDS);
    const before = [
      getInvoices().find((invoice) => invoice.id === 'INV-2026-007'),
      getPayments().find((payment) => payment.id === 'PAY-2026-005'),
      getRefunds().find((refund) => refund.id === 'REF-2026-001'),
    ];
    expect(getInvoiceFinancialState('INV-2026-007').integrity).toBe('unresolved');
    expect(() => processRefund({ paymentId: 'PAY-2026-005', amount: 1 })).toThrow();
    expect([
      getInvoices().find((invoice) => invoice.id === 'INV-2026-007'),
      getPayments().find((payment) => payment.id === 'PAY-2026-005'),
      getRefunds().find((refund) => refund.id === 'REF-2026-001'),
    ]).toEqual(before);
  });
});
