import { beforeEach, describe, expect, it } from 'vitest';
import { hasBookingDateOverlap, isRoomBlockingBooking, normalizeBookingStatus } from '../features/reservations/state/bookingRules';
import { buildFrontOfficeRows, cancelBooking, checkInBooking, checkOutBooking, getRoomAvailability } from '../features/reservations/state/reservationLifecycle';
import { getReservations, saveReservations } from '../features/reservations/state/reservationStore';
import { getRooms, saveRooms } from '../features/rooms/state/roomStore';
import { getInvoiceFinancialState, getInvoices, getOrCreateBookingInvoice, getPayments, getRefunds, processRefund, recordInvoicePayment, saveInvoices, savePayments, saveRefunds, updateRefundStatus, reconcileBookingChargesToInvoice } from '../features/payment-billing/pages/paymentBillingStore';
import { getGuestCharges, saveGuestCharges } from '../features/inventory/pages/inventoryStore';
import { INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_REFUNDS } from '../features/payment-billing/data/paymentBillingDemoData';

describe('Phase 2 lifecycle and financial rules', () => {
  beforeEach(() => {
    localStorage.clear();
    saveRooms([{ id: 'R1', roomNo: '101', status: 'Open', roomType: 'Standard', rent: 100 }]);
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

  describe('Phase 7 Job 21 — Check-In Stay Invoice Initialization', () => {
    beforeEach(() => {
      localStorage.clear();
      saveRooms([
        { id: 'R-101', roomNo: '101', status: 'Open', roomType: 'Deluxe', rent: 150 },
        { id: 'R-ZERO', roomNo: '102', status: 'Open', roomType: 'Standard', rent: 0 },
      ]);
      localStorage.setItem('hotel_rooms', JSON.stringify([
        { number: 101, roomId: 'R-101', status: 'AVAILABLE', guest: null },
        { number: 102, roomId: 'R-ZERO', status: 'AVAILABLE', guest: null },
      ]));
    });

    it('Test 1 — Normal Check-In: creates exactly one primary stay invoice with canonical accommodation totals', () => {
      saveReservations([
        { id: 'B-NORMAL', roomId: 'R-101', guestId: 'G1', status: 'Booked', checkIn: '2026-10-01', checkOut: '2026-10-04', name: 'Alice Normal' }
      ]);
      expect(getInvoices().filter((inv) => inv.bookingId === 'B-NORMAL')).toHaveLength(0);

      const res = checkInBooking('B-NORMAL');
      expect(res.status).toBe('Checked In');
      expect(res.invoice).toBeDefined();

      const linked = getInvoices().filter((inv) => inv.bookingId === 'B-NORMAL');
      expect(linked).toHaveLength(1);
      const invoice = linked[0];
      expect(invoice.bookingId).toBe('B-NORMAL');
      // 3 nights (Oct 1 to Oct 4) @ $150 = $450
      expect(invoice.subtotal).toBe(450.00);
      expect(invoice.totalAmount).toBe(450.00);
      expect(invoice.balanceDue).toBe(450.00);
      expect(invoice.paidAmount).toBe(0.00);
      expect(invoice.status).toBe('Unpaid');
      expect(invoice.items).toHaveLength(1);
      expect(invoice.items[0]).toMatchObject({
        rate: 150,
        qty: 3,
        amount: 450
      });
    });

    it('Test 2 — Existing Invoice: retains single existing invoice without recreation or overwriting', () => {
      saveReservations([
        { id: 'B-EXISTING', roomId: 'R-101', guestId: 'G2', status: 'Booked', checkIn: '2026-10-05', checkOut: '2026-10-07', name: 'Bob Existing' }
      ]);
      const existing = {
        id: 'INV-EXISTING-PRE',
        invoiceNumber: 'INV-EXISTING-PRE',
        bookingId: 'B-EXISTING',
        guestName: 'Pre-existing Folio',
        roomNumber: '101',
        roomType: 'Deluxe',
        checkIn: '2026-10-05',
        checkOut: '2026-10-07',
        subtotal: 500.00,
        discount: 0,
        taxesAndFees: 0,
        totalAmount: 500.00,
        paidAmount: 200.00,
        balanceDue: 300.00,
        status: 'Partially Paid',
        items: [{ description: 'Custom Corporate Package', rate: 250, qty: 2, amount: 500 }]
      };
      saveInvoices([existing]);

      const res = checkInBooking('B-EXISTING');
      expect(res.status).toBe('Checked In');

      const linked = getInvoices().filter((inv) => inv.bookingId === 'B-EXISTING');
      expect(linked).toHaveLength(1);
      expect(linked[0].id).toBe('INV-EXISTING-PRE');
      expect(linked[0].totalAmount).toBe(500.00);
      expect(linked[0].paidAmount).toBe(200.00);
      expect(linked[0].balanceDue).toBe(300.00);
      expect(linked[0].status).toBe('Partially Paid');
      expect(linked[0].items[0].description).toBe('Custom Corporate Package');
    });

    it('Test 3 — Idempotency: repeated invocation on the same booking returns the same invoice and produces no duplicates', () => {
      saveReservations([
        { id: 'B-IDEM', roomId: 'R-101', guestId: 'G1', status: 'Booked', checkIn: '2026-10-01', checkOut: '2026-10-04', name: 'Alice Idem' }
      ]);
      checkInBooking('B-IDEM');
      const invoicesFirst = getInvoices().filter((inv) => inv.bookingId === 'B-IDEM');
      expect(invoicesFirst).toHaveLength(1);

      const secondResult = getOrCreateBookingInvoice('B-IDEM');
      expect(secondResult.success).toBe(true);
      expect(secondResult.isExisting).toBe(true);
      expect(secondResult.id).toBe(invoicesFirst[0].id);

      const invoicesSecond = getInvoices().filter((inv) => inv.bookingId === 'B-IDEM');
      expect(invoicesSecond).toHaveLength(1);
    });

    it('Test 4 — Multiple Invoice Ambiguity: rejects check-in and preserves ambiguity error without guessing', () => {
      saveRooms([{ id: 'R-101', roomNo: '101', status: 'Open', roomType: 'Standard', rent: 100 }]);
      saveReservations([
        { id: 'B-AMBIGUOUS', roomId: 'R-101', guestId: 'G3', status: 'Booked', checkIn: '2026-10-08', checkOut: '2026-10-10', name: 'Charlie Ambiguous' }
      ]);
      saveInvoices([
        { id: 'INV-AMB-1', invoiceNumber: 'INV-AMB-1', bookingId: 'B-AMBIGUOUS', totalAmount: 100, paidAmount: 0, balanceDue: 100, status: 'Unpaid' },
        { id: 'INV-AMB-2', invoiceNumber: 'INV-AMB-2', bookingId: 'B-AMBIGUOUS', totalAmount: 200, paidAmount: 0, balanceDue: 200, status: 'Unpaid' },
      ]);
      expect(() => checkInBooking('B-AMBIGUOUS')).toThrow(/multiple invoices.*ambiguous/i);
      const invoices = getInvoices().filter((inv) => inv.bookingId === 'B-AMBIGUOUS');
      expect(invoices).toHaveLength(2);
      expect(invoices.map((i) => i.id)).toEqual(['INV-AMB-1', 'INV-AMB-2']);

      // Phase 7 Job 22: Rollback verification - booking must NOT remain Checked In
      const bookingAfter = getReservations().find((b) => b.id === 'B-AMBIGUOUS');
      expect(bookingAfter.status).toBe('Booked');
      const roomAfter = getRooms().find((r) => r.id === 'R-101');
      expect(roomAfter.status).toBe('Open');
      const occupancy = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
      const activeOccupancy = occupancy.filter((o) => o.bookingId === 'B-AMBIGUOUS');
      expect(activeOccupancy).toHaveLength(0);
    });

    it('Test 5 — Invalid Room Rate: surfaces failure through existing error mechanism without creating a zero-value invoice', () => {
      saveRooms([{ id: 'R-ZERO', roomNo: '102', status: 'Open', roomType: 'Standard', rent: 0 }]);
      saveReservations([
        { id: 'B-BADRATE', roomId: 'R-ZERO', guestId: 'G4', status: 'Booked', checkIn: '2026-10-11', checkOut: '2026-10-13', name: 'David BadRate' }
      ]);
      expect(() => checkInBooking('B-BADRATE')).toThrow(/room rate/i);
      const invoices = getInvoices().filter((inv) => inv.bookingId === 'B-BADRATE');
      expect(invoices).toHaveLength(0);

      // Phase 7 Job 22: Rollback verification - booking must NOT remain Checked In + OCCUPIED
      const bookingAfter = getReservations().find((b) => b.id === 'B-BADRATE');
      expect(bookingAfter.status).toBe('Booked');
      const roomAfter = getRooms().find((r) => r.id === 'R-ZERO');
      expect(roomAfter.status).toBe('Open');
      const occupancy = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
      const activeOccupancy = occupancy.filter((o) => o.bookingId === 'B-BADRATE');
      expect(activeOccupancy).toHaveLength(0);
    });

    it('Test 6 — Invalid Stay Dates: check-in throws and does not report financial success', () => {
      saveReservations([
        { id: 'B-BADDATES', roomId: 'R-101', guestId: 'G5', status: 'Booked', checkIn: '2026-10-15', checkOut: '2026-10-12', name: 'Eve BadDates' }
      ]);
      expect(() => checkInBooking('B-BADDATES')).toThrow(/check-out must be after check-in/i);
      const invoices = getInvoices().filter((inv) => inv.bookingId === 'B-BADDATES');
      expect(invoices).toHaveLength(0);
    });

    it('Test 7 — Pending Reservation: no invoice created merely because a Pending reservation exists', () => {
      saveReservations([
        { id: 'B-PENDING', roomId: 'R-101', guestId: 'G6', status: 'Pending', checkIn: '2026-10-20', checkOut: '2026-10-22', name: 'Frank Pending' }
      ]);
      expect(getInvoices().filter((inv) => inv.bookingId === 'B-PENDING')).toHaveLength(0);
      expect(() => checkInBooking('B-PENDING')).toThrow(/cannot be checked in from status Pending/i);
      expect(getInvoices().filter((inv) => inv.bookingId === 'B-PENDING')).toHaveLength(0);
    });

    it('Test 7b — Consistency Recovery: invoice failure restores Booked, Room status, and Occupancy', () => {
      saveRooms([{ id: 'R-101', roomNo: '101', status: 'Open', roomType: 'Standard', rent: 120 }]);
      saveReservations([
        { id: 'B-RECOVER', roomId: 'R-101', guestId: 'G-REC', status: 'Booked', checkIn: '2026-10-21', checkOut: '2026-10-23', name: 'Rollback Guest' }
      ]);
      localStorage.setItem('hotel_rooms', JSON.stringify([{ number: 101, roomId: 'R-101', status: 'AVAILABLE', guest: null }]));

      // Corrupt invoices with ambiguous duplicates to trigger invoice failure
      saveInvoices([
        { id: 'INV-DUP-1', invoiceNumber: 'INV-DUP-1', bookingId: 'B-RECOVER', totalAmount: 240, paidAmount: 0, balanceDue: 240, status: 'Unpaid' },
        { id: 'INV-DUP-2', invoiceNumber: 'INV-DUP-2', bookingId: 'B-RECOVER', totalAmount: 240, paidAmount: 0, balanceDue: 240, status: 'Unpaid' },
      ]);

      expect(() => checkInBooking('B-RECOVER')).toThrow(/multiple invoices/i);

      // System must NOT silently remain Checked In + OCCUPIED with no valid invoice
      const bAfter = getReservations().find((b) => b.id === 'B-RECOVER');
      expect(bAfter.status).toBe('Booked');

      const rAfter = getRooms().find((r) => r.id === 'R-101');
      expect(rAfter.status).toBe('Open');

      const occRooms = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
      const bSlot = occRooms.find((rec) => rec.bookingId === 'B-RECOVER');
      expect(bSlot).toBeUndefined();
      const slot101 = occRooms.find((rec) => String(rec.number) === '101');
      expect(slot101.status).toBe('AVAILABLE');
    });

    it('Test 8 — Booked Reservation Without Check-In: Booked alone does not create an invoice', () => {
      saveReservations([
        { id: 'B-JUSTBOOKED', roomId: 'R-101', guestId: 'G7', status: 'Booked', checkIn: '2026-10-23', checkOut: '2026-10-25', name: 'Grace Booked' }
      ]);
      expect(getInvoices().filter((inv) => inv.bookingId === 'B-JUSTBOOKED')).toHaveLength(0);
    });

    it('Test 9 — Cancellation Regression: cancelling Booked and Pending reservations remains operational without invoice creation', () => {
      saveReservations([
        { id: 'B-CANCEL1', roomId: 'R-101', guestId: 'G8', status: 'Booked', checkIn: '2026-10-26', checkOut: '2026-10-28', name: 'Heidi Cancel' },
        { id: 'B-CANCEL2', roomId: 'R-101', guestId: 'G9', status: 'Pending', checkIn: '2026-10-29', checkOut: '2026-10-31', name: 'Ivan Cancel' },
      ]);
      const c1 = cancelBooking('B-CANCEL1');
      expect(c1.status).toBe('Cancelled');
      expect(getInvoices().filter((inv) => inv.bookingId === 'B-CANCEL1')).toHaveLength(0);

      const c2 = cancelBooking('B-CANCEL2');
      expect(c2.status).toBe('Cancelled');
      expect(getInvoices().filter((inv) => inv.bookingId === 'B-CANCEL2')).toHaveLength(0);
    });

    it('Test 10 — Checkout Regression: Checked In to Checked Out completes operationally with balanceDue > 0 without blocking', () => {
      saveReservations([
        { id: 'B-CHECKOUT', roomId: 'R-101', guestId: 'G10', status: 'Booked', checkIn: '2026-11-01', checkOut: '2026-11-03', name: 'Judy Checkout' }
      ]);
      checkInBooking('B-CHECKOUT');
      const invoice = getInvoices().find((inv) => inv.bookingId === 'B-CHECKOUT');
      expect(invoice.balanceDue).toBeGreaterThan(0);

      const checkedOut = checkOutBooking('B-CHECKOUT');
      expect(checkedOut.status).toBe('Checked Out');

      const invoiceAfter = getInvoices().find((inv) => inv.bookingId === 'B-CHECKOUT');
      expect(invoiceAfter.balanceDue).toBe(invoice.balanceDue);
      expect(invoiceAfter.status).toBe('Unpaid');
    });

    it('Test 11 — Folio Reconciliation on Checkout: eligible guest charges are added to invoice before checkout completes', () => {
      saveRooms([{ id: 'R-101', roomNo: '101', status: 'Open', roomType: 'Standard', rent: 100 }]);
      saveReservations([
        { id: 'B-RECON-CO', roomId: 'R-101', guestId: 'G11', status: 'Booked', checkIn: '2026-11-05', checkOut: '2026-11-07', name: 'Kevin Recon' }
      ]);
      localStorage.setItem('hotel_rooms', JSON.stringify([{ number: 101, roomId: 'R-101', status: 'AVAILABLE', guest: null }]));
      checkInBooking('B-RECON-CO');

      const initialInvoice = getInvoices().find((inv) => inv.bookingId === 'B-RECON-CO');
      expect(initialInvoice.totalAmount).toBe(200); // 2 nights @ $100

      // Add eligible guest charge linked strictly by bookingId
      saveGuestCharges([
        { id: 'CHG-CO-1', bookingId: 'B-RECON-CO', guestId: 'G11', itemName: 'Spa Treatment', quantity: 1, unitPrice: 75, amount: 75, status: 'Added to Folio' }
      ]);

      const checkedOut = checkOutBooking('B-RECON-CO');
      expect(checkedOut.status).toBe('Checked Out');
      expect(checkedOut.reconciliation.reconciledCount).toBe(1);

      // Verify invoice was updated
      const invoiceAfter = getInvoices().find((inv) => inv.bookingId === 'B-RECON-CO');
      expect(invoiceAfter.totalAmount).toBe(275);
      expect(invoiceAfter.balanceDue).toBe(275);
      expect(invoiceAfter.items.some((it) => it.sourceId === 'CHG-CO-1' && it.sourceType === 'guest_charge')).toBe(true);

      // Verify charge was marked as Invoiced
      const chargeAfter = getGuestCharges().find((c) => c.id === 'CHG-CO-1');
      expect(chargeAfter.status).toBe('Invoiced');

      // Verify no payments were automatically created
      const payments = getPayments().filter((p) => p.bookingId === 'B-RECON-CO');
      expect(payments).toHaveLength(0);
    });

    it('Test 12 — Ineligible charges are NOT reconciled during checkout', () => {
      saveRooms([{ id: 'R-101', roomNo: '101', status: 'Open', roomType: 'Standard', rent: 100 }]);
      saveReservations([
        { id: 'B-INELIG-CO', roomId: 'R-101', guestId: 'G12', status: 'Booked', checkIn: '2026-11-08', checkOut: '2026-11-10', name: 'Laura Inelig' }
      ]);
      localStorage.setItem('hotel_rooms', JSON.stringify([{ number: 101, roomId: 'R-101', status: 'AVAILABLE', guest: null }]));
      checkInBooking('B-INELIG-CO');

      saveGuestCharges([
        { id: 'CHG-PENDING', bookingId: 'B-INELIG-CO', guestId: 'G12', itemName: 'Pending Room Service', quantity: 1, unitPrice: 30, amount: 30, status: 'Pending' },
        { id: 'CHG-PAID', bookingId: 'B-INELIG-CO', guestId: 'G12', itemName: 'Cash Paid Laundry', quantity: 1, unitPrice: 20, amount: 20, status: 'Paid' },
        { id: 'CHG-DIFF-BOOKING', bookingId: 'B-OTHER', guestId: 'G12', itemName: 'Other Booking Charge', quantity: 1, unitPrice: 50, amount: 50, status: 'Added to Folio' }
      ]);

      const checkedOut = checkOutBooking('B-INELIG-CO');
      expect(checkedOut.status).toBe('Checked Out');
      expect(checkedOut.reconciliation.reconciledCount).toBe(0);

      const invoice = getInvoices().find((inv) => inv.bookingId === 'B-INELIG-CO');
      expect(invoice.totalAmount).toBe(200); // Only accommodation, no charges added
      expect(invoice.items.filter((it) => it.sourceType === 'guest_charge')).toHaveLength(0);

      // Statuses remain unchanged
      expect(getGuestCharges().find((c) => c.id === 'CHG-PENDING').status).toBe('Pending');
      expect(getGuestCharges().find((c) => c.id === 'CHG-PAID').status).toBe('Paid');
    });

    it('Test 13 — Checkout reconciliation is idempotent', () => {
      saveRooms([{ id: 'R-101', roomNo: '101', status: 'Open', roomType: 'Standard', rent: 100 }]);
      saveReservations([
        { id: 'B-IDEM-CO', roomId: 'R-101', guestId: 'G13', status: 'Booked', checkIn: '2026-11-12', checkOut: '2026-11-14', name: 'Mike Idem' }
      ]);
      localStorage.setItem('hotel_rooms', JSON.stringify([{ number: 101, roomId: 'R-101', status: 'AVAILABLE', guest: null }]));
      checkInBooking('B-IDEM-CO');

      saveGuestCharges([
        { id: 'CHG-IDEM-1', bookingId: 'B-IDEM-CO', guestId: 'G13', itemName: 'Mini Bar Drink', quantity: 2, unitPrice: 15, amount: 30, status: 'Added to Folio' }
      ]);

      // Reconcile once before checkout
      const firstRecon = reconcileBookingChargesToInvoice('B-IDEM-CO');
      expect(firstRecon.reconciledCount).toBe(1);

      // Now checkout which also reconciles
      const checkedOut = checkOutBooking('B-IDEM-CO');
      expect(checkedOut.status).toBe('Checked Out');
      expect(checkedOut.reconciliation.reconciledCount).toBe(0);

      const invoice = getInvoices().find((inv) => inv.bookingId === 'B-IDEM-CO');
      expect(invoice.totalAmount).toBe(230); // 200 + 30 exactly once
      const chargeItems = invoice.items.filter((it) => it.sourceId === 'CHG-IDEM-1');
      expect(chargeItems).toHaveLength(1);
    });

    it('Test 14 — Checkout fails safely if multiple invoices exist, without modifying operational state', () => {
      saveRooms([{ id: 'R-101', roomNo: '101', status: 'Open', roomType: 'Standard', rent: 100 }]);
      saveReservations([
        { id: 'B-AMB-CO', roomId: 'R-101', guestId: 'G14', status: 'Checked In', checkIn: '2026-11-15', checkOut: '2026-11-17', name: 'Nancy Amb' }
      ]);
      localStorage.setItem('hotel_rooms', JSON.stringify([
        { number: 101, roomId: 'R-101', status: 'OCCUPIED', bookingId: 'B-AMB-CO', guest: { name: 'Nancy Amb' } }
      ]));
      saveInvoices([
        { id: 'INV-AMB-A', invoiceNumber: 'INV-AMB-A', bookingId: 'B-AMB-CO', totalAmount: 200, paidAmount: 0, balanceDue: 200, status: 'Unpaid' },
        { id: 'INV-AMB-B', invoiceNumber: 'INV-AMB-B', bookingId: 'B-AMB-CO', totalAmount: 200, paidAmount: 0, balanceDue: 200, status: 'Unpaid' }
      ]);

      expect(() => checkOutBooking('B-AMB-CO')).toThrow(/multiple invoices.*ambiguous/i);

      // Booking must remain Checked In, not Checked Out
      const booking = getReservations().find((b) => b.id === 'B-AMB-CO');
      expect(booking.status).toBe('Checked In');

      // Occupancy must remain OCCUPIED
      const occupancy = JSON.parse(localStorage.getItem('hotel_rooms') || '[]');
      const occ = occupancy.find((o) => o.bookingId === 'B-AMB-CO');
      expect(occ.status).toBe('OCCUPIED');
    });

    it('Test 15 — Checkout succeeds operationally with balanceDue > 0 and no automatic payments', () => {
      saveRooms([{ id: 'R-101', roomNo: '101', status: 'Open', roomType: 'Standard', rent: 150 }]);
      saveReservations([
        { id: 'B-UNPAID-CO', roomId: 'R-101', guestId: 'G15', status: 'Booked', checkIn: '2026-11-18', checkOut: '2026-11-20', name: 'Oscar Unpaid' }
      ]);
      localStorage.setItem('hotel_rooms', JSON.stringify([{ number: 101, roomId: 'R-101', status: 'AVAILABLE', guest: null }]));
      checkInBooking('B-UNPAID-CO');

      saveGuestCharges([
        { id: 'CHG-OSCAR', bookingId: 'B-UNPAID-CO', guestId: 'G15', itemName: 'Dinner Buffet', quantity: 2, unitPrice: 40, amount: 80, status: 'Added to Folio' }
      ]);

      const checkedOut = checkOutBooking('B-UNPAID-CO');
      expect(checkedOut.status).toBe('Checked Out');

      const invoice = getInvoices().find((inv) => inv.bookingId === 'B-UNPAID-CO');
      expect(invoice.totalAmount).toBe(380); // 300 stay + 80 dinner
      expect(invoice.paidAmount).toBe(0);
      expect(invoice.balanceDue).toBe(380);
      expect(invoice.status).toBe('Unpaid');

      // Absolutely no payments were generated
      const payments = getPayments().filter((p) => p.bookingId === 'B-UNPAID-CO');
      expect(payments).toHaveLength(0);
    });
  });
});
