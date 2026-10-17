import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getGuestCharges, saveGuestCharges } from '../features/inventory/pages/inventoryStore';
import { saveRooms } from '../features/rooms/state/roomStore';
import {
  getInvoices,
  addInvoice,
  updateInvoice,
  recordInvoicePayment,
  getPayments,
  getRefunds,
  processRefund,
  updateRefundStatus,
  deriveCanonicalInvoiceStatus,
  auditFinancialIntegrity,
  reconcileDerivedInvoiceFinancialState,
  reconcileAllDerivedInvoiceFinancialStates,
  resetPaymentBillingStore,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_REFUNDS,
  saveInvoices,
  savePayments,
  saveRefunds,
  reconcileBookingChargesToInvoice,
  getOrCreateBookingInvoice,
  getInvoiceFinancialState,
  getBookingDues,
  INVOICES_UPDATED_EVENT,
  PAYMENTS_UPDATED_EVENT,
  REFUNDS_UPDATED_EVENT,
} from '../features/payment-billing/pages/paymentBillingStore';
import RecordPaymentModal from '../features/payment-billing/pages/components/RecordPaymentModal';
import InvoiceDetailModal from '../features/payment-billing/pages/components/InvoiceDetailModal';
import ProcessRefundModal from '../features/payment-billing/pages/components/ProcessRefundModal';
import { cancelBooking } from '../features/reservations/state/reservationLifecycle';
import { getReservations, saveReservations } from '../features/reservations/state/reservationStore';

describe('Payment & Billing Store Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    resetPaymentBillingStore();
  });

  // 1. Invoices Store Tests
  describe('Invoices Management', () => {
    it('initializes with default mock invoices', () => {
      const invoices = getInvoices();
      expect(invoices.length).toBe(INITIAL_INVOICES.length);
      expect(invoices[0].id).toBe('INV-2026-001');
      expect(invoices[0].guestName).toBe('Alexander Wright');
      expect(invoices[0].totalAmount).toBe(894.60);
      expect(invoices[0].status).toBe('Paid');
    });

    it('creates a new invoice and calculates balanceDue correctly', () => {
      const newInvoice = {
        guestName: 'Eleanor Vance',
        guestEmail: 'eleanor.v@example.com',
        guestPhone: '+1 (555) 321-9988',
        bookingId: 'BK-9901',
        roomNumber: '408',
        roomType: 'Penthouse Suite',
        subtotal: 1200.00,
        discount: 100.00,
        taxesAndFees: 154.00,
        totalAmount: 1254.00,
        paidAmount: 0,
        issueDate: '2026-09-16',
        dueDate: '2026-09-18',
        status: 'Unpaid',
        items: [
          { description: 'Penthouse Suite - 2 Nights', amount: 1200.00 },
        ],
      };

      const updated = addInvoice(newInvoice);
      expect(updated.length).toBe(INITIAL_INVOICES.length + 1);
      const created = updated[0];
      expect(created.guestName).toBe('Eleanor Vance');
      expect(created.balanceDue).toBe(1254.00);
      expect(created.status).toBe('Unpaid');
      expect(created.id).toMatch(/^INV-\d{4}-\d{3}$/);
    });
  });

  // 2. Recording Payments & Balance Sync Tests
  describe('Payment Recording & Invoice Balance Sync', () => {
    it('records a partial payment against an invoice and updates balanceDue + status', () => {
      // Find an unpaid or partially paid invoice
      const initialInvoices = getInvoices();
      const targetInvoice = initialInvoices.find((inv) => inv.id === 'INV-2026-002'); // total: 1475.25, paid: 500, balance: 975.25

      expect(targetInvoice.balanceDue).toBe(975.25);
      expect(targetInvoice.status).toBe('Partially Paid');

      const paymentRecord = {
        invoiceId: targetInvoice.id,
        amount: 400.00,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-TEST-001',
        notes: 'Mid-stay partial payment',
        date: '2026-09-16',
      };

      const result = recordInvoicePayment(paymentRecord);
      expect(result.updatedInvoice.paidAmount).toBe(900.00);
      expect(result.updatedInvoice.balanceDue).toBe(575.25);
      expect(result.updatedInvoice.status).toBe('Partially Paid');

      // Verify payment ledger has new entry
      const payments = getPayments();
      const newPayment = payments.find((p) => p.transactionRef === 'TXN-TEST-001');
      expect(newPayment).toBeDefined();
      expect(newPayment.amount).toBe(400.00);
      expect(newPayment.invoiceId).toBe(targetInvoice.id);
      expect(newPayment.status).toBe('Completed');
    });

    it('records a full payment settling remaining balance to 0 and status to Paid', () => {
      const initialInvoices = getInvoices();
      const targetInvoice = initialInvoices.find((inv) => inv.id === 'INV-2026-002');

      const paymentRecord = {
        invoiceId: targetInvoice.id,
        amount: targetInvoice.balanceDue,
        paymentMethod: 'Cash',
        transactionRef: 'TXN-FULL-SETTLE',
        notes: 'Cash settlement at checkout',
        date: '2026-09-16',
      };

      const result = recordInvoicePayment(paymentRecord);
      expect(result.updatedInvoice.balanceDue).toBe(0);
      expect(result.updatedInvoice.status).toBe('Paid');
      expect(result.updatedInvoice.paidAmount).toBe(targetInvoice.totalAmount);
    });

    it('rejects recording a payment exceeding remaining balance due', () => {
      const initialInvoices = getInvoices();
      const targetInvoice = initialInvoices.find((inv) => inv.id === 'INV-2026-002');

      expect(() => {
        recordInvoicePayment({
          invoiceId: targetInvoice.id,
          amount: targetInvoice.balanceDue + 500,
          paymentMethod: 'Credit Card',
        });
      }).toThrow();
    });

    it('rejects payment with invalid amount <= 0', () => {
      expect(() => {
        recordInvoicePayment({
          invoiceId: 'INV-2026-002',
          amount: 0,
          paymentMethod: 'Cash',
        });
      }).toThrow();
    });
  });

  // 3. Payment Ledger Tests
  describe('Payment Ledger Management', () => {
    it('initializes with default payment transactions', () => {
      const payments = getPayments();
      expect(payments.length).toBe(INITIAL_PAYMENTS.length);
      expect(payments[0].id).toBe('PAY-2026-001');
      expect(payments[0].status).toBe('Completed');
      expect(payments[0].amount).toBe(894.60);
    });
  });

  // 4. Refunds & Reversals Tests
  describe('Refunds & Payment Adjustments', () => {
    it('initializes with default mock refunds', () => {
      const refunds = getRefunds();
      expect(refunds.length).toBe(INITIAL_REFUNDS.length);
      expect(refunds[0].id).toBe('REF-2026-001');
      expect(refunds[0].amount).toBe(650.00);
    });

    it('processes a partial refund on an eligible payment and updates payment status', () => {
      const payments = getPayments();
      // Target PAY-2026-001 ($894.60, 0 refunded)
      const targetPayment = payments.find((p) => p.id === 'PAY-2026-001');
      expect(targetPayment.refundedAmount).toBe(0);

      const refundRecord = {
        paymentId: targetPayment.id,
        amount: 200.00,
        reason: 'Guest Complaint / Room Issue',
        refundMethod: 'Credit Card Reverse',
        notes: 'Manager approved 200 credit for AC maintenance delay',
        date: '2026-09-16',
      };

      const result = processRefund(refundRecord);
      expect(result.updatedPayment.refundedAmount).toBe(200.00);
      expect(result.updatedPayment.status).toBe('Partially Refunded');

      // Verify refund ledger contains new refund
      const refunds = getRefunds();
      const newRefund = refunds.find((r) => r.paymentId === targetPayment.id && r.amount === 200.00);
      expect(newRefund).toBeDefined();
      expect(newRefund.reason).toBe('Guest Complaint / Room Issue');
      expect(newRefund.status).toBe('Completed');
    });

    it('processes a full refund and updates payment status to Refunded', () => {
      const payments = getPayments();
      const targetPayment = payments.find((p) => p.id === 'PAY-2026-001');
      const maxRefundable = targetPayment.amount - targetPayment.refundedAmount;

      const refundRecord = {
        paymentId: targetPayment.id,
        amount: maxRefundable,
        reason: 'Booking Cancellation',
        refundMethod: 'Original Payment Method',
        notes: 'Full cancellation refund',
        date: '2026-09-16',
      };

      const result = processRefund(refundRecord);
      expect(result.updatedPayment.refundedAmount).toBe(targetPayment.amount);
      expect(result.updatedPayment.status).toBe('Refunded');
    });

    it('rejects refund amount exceeding remaining refundable limit', () => {
      const payments = getPayments();
      const targetPayment = payments.find((p) => p.id === 'PAY-2026-001');

      expect(() => {
        processRefund({
          paymentId: targetPayment.id,
          amount: targetPayment.amount + 100,
          reason: 'Booking Cancellation',
        });
      }).toThrow();
    });
  });

  // 5. Canonical Guest Charge Reconciliation Contract (Phase 7 Job 17)
  describe('Guest Charge Reconciliation to Invoice Contract', () => {
    const mockBookingA = {
      id: 'BK-TEST-A',
      guestId: 'GST-A',
      name: 'Alice Springs',
      roomNo: '101',
      status: 'Checked In',
      checkIn: '2026-09-20',
      checkOut: '2026-09-25'
    };
    const mockBookingB = {
      id: 'BK-TEST-B',
      guestId: 'GST-B',
      name: 'Bob Waters',
      roomNo: '102',
      status: 'Checked In',
      checkIn: '2026-09-21',
      checkOut: '2026-09-26'
    };

    const mockInvoiceA = {
      id: 'INV-TEST-A',
      invoiceNumber: 'INV-TEST-A',
      bookingId: 'BK-TEST-A',
      guestName: 'Alice Springs',
      roomNumber: '101',
      roomType: 'Standard King',
      subtotal: 500.00,
      discount: 0,
      taxesAndFees: 50.00,
      tax: 50.00,
      totalAmount: 550.00,
      paidAmount: 200.00,
      balanceDue: 350.00,
      status: 'Partially Paid',
      items: [
        { description: 'Standard King (5 Nights @ $100/night)', rate: 100.00, qty: 5, amount: 500.00 }
      ],
      payments: []
    };

    const mockInvoiceB = {
      id: 'INV-TEST-B',
      invoiceNumber: 'INV-TEST-B',
      bookingId: 'BK-TEST-B',
      guestName: 'Bob Waters',
      roomNumber: '102',
      roomType: 'Deluxe Suite',
      subtotal: 600.00,
      discount: 0,
      taxesAndFees: 60.00,
      tax: 60.00,
      totalAmount: 660.00,
      paidAmount: 660.00,
      balanceDue: 0.00,
      status: 'Paid',
      items: [
        { description: 'Deluxe Suite (3 Nights @ $200/night)', rate: 200.00, qty: 3, amount: 600.00 }
      ],
      payments: []
    };

    beforeEach(() => {
      localStorage.setItem('hotel_reservations', JSON.stringify([mockBookingA, mockBookingB]));
      saveInvoices([mockInvoiceA, mockInvoiceB]);
      saveGuestCharges([]);
    });

    it('Test A — source attribution: creates invoice item with sourceId and sourceType = guest_charge', () => {
      const charge = {
        id: 'GC-101',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Minibar Sparkling Water',
        chargeType: 'Consumption',
        quantity: 2,
        unitPrice: 15.00,
        amount: 30.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      const result = reconcileBookingChargesToInvoice('BK-TEST-A');
      expect(result.success).toBe(true);
      expect(result.reconciledCount).toBe(1);

      const updatedInvoice = getInvoices().find((inv) => inv.id === 'INV-TEST-A');
      expect(updatedInvoice.items.length).toBe(2);

      const addedItem = updatedInvoice.items.find((it) => it.sourceId === 'GC-101');
      expect(addedItem).toBeDefined();
      expect(addedItem.sourceId).toBe('GC-101');
      expect(addedItem.sourceType).toBe('guest_charge');
      expect(addedItem.description).toBe('Minibar Sparkling Water');
      expect(addedItem.rate).toBe(15.00);
      expect(addedItem.qty).toBe(2);
      expect(addedItem.amount).toBe(30.00);

      // Verify updated totals
      expect(updatedInvoice.subtotal).toBe(530.00);
      expect(updatedInvoice.totalAmount).toBe(580.00);
      expect(updatedInvoice.balanceDue).toBe(380.00);
      expect(updatedInvoice.status).toBe('Partially Paid');
    });

    it('Test B — booking isolation: charge for Booking A is never added to Booking B invoice', () => {
      const chargeA = {
        id: 'GC-A',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Laundry Service',
        chargeType: 'Other',
        quantity: 1,
        unitPrice: 45.00,
        amount: 45.00,
        status: 'Added to Folio'
      };
      const chargeB = {
        id: 'GC-B',
        bookingId: 'BK-TEST-B',
        guestId: 'GST-B',
        itemName: 'Room Service Dinner',
        chargeType: 'Consumption',
        quantity: 1,
        unitPrice: 80.00,
        amount: 80.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([chargeA, chargeB]);

      reconcileBookingChargesToInvoice('BK-TEST-A');

      const invA = getInvoices().find((inv) => inv.id === 'INV-TEST-A');
      const invB = getInvoices().find((inv) => inv.id === 'INV-TEST-B');

      expect(invA.items.some((it) => it.sourceId === 'GC-A')).toBe(true);
      expect(invA.items.some((it) => it.sourceId === 'GC-B')).toBe(false);

      expect(invB.items.length).toBe(1);
      expect(invB.items.some((it) => it.sourceId === 'GC-A')).toBe(false);
      expect(invB.items.some((it) => it.sourceId === 'GC-B')).toBe(false);
    });

    it('Test C — legacy isolation: charge with bookingId: null is not reconciled', () => {
      const legacyCharge = {
        id: 'GC-LEGACY',
        bookingId: null,
        guestId: null,
        guestName: 'Alice Springs',
        roomNumber: '101',
        itemName: 'Legacy Minibar item',
        chargeType: 'Consumption',
        quantity: 1,
        unitPrice: 20.00,
        amount: 20.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([legacyCharge]);

      const result = reconcileBookingChargesToInvoice('BK-TEST-A');
      expect(result.success).toBe(true);
      expect(result.reconciledCount).toBe(0);

      const invA = getInvoices().find((inv) => inv.id === 'INV-TEST-A');
      expect(invA.items.length).toBe(1);
      expect(invA.items.some((it) => it.sourceId === 'GC-LEGACY')).toBe(false);
    });

    it('Test D — idempotency: running reconciliation twice does not duplicate invoice item', () => {
      const charge = {
        id: 'GC-IDEM-1',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Spa Massage',
        chargeType: 'Other',
        quantity: 1,
        unitPrice: 120.00,
        amount: 120.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      // Run 1
      const res1 = reconcileBookingChargesToInvoice('BK-TEST-A');
      expect(res1.reconciledCount).toBe(1);

      const invAfterFirst = getInvoices().find((inv) => inv.id === 'INV-TEST-A');
      expect(invAfterFirst.items.length).toBe(2);
      expect(invAfterFirst.totalAmount).toBe(670.00);

      // Run 2
      const res2 = reconcileBookingChargesToInvoice('BK-TEST-A');
      expect(res2.reconciledCount).toBe(0);
      expect(res2.skippedAlreadyInvoiced.length).toBe(1);
      expect(res2.skippedAlreadyInvoiced[0].chargeId).toBe('GC-IDEM-1');

      const invAfterSecond = getInvoices().find((inv) => inv.id === 'INV-TEST-A');
      expect(invAfterSecond.items.length).toBe(2);
      expect(invAfterSecond.totalAmount).toBe(670.00);
      expect(invAfterSecond.balanceDue).toBe(470.00);
    });

    it('Test E — existing source match: if invoice item already contains sourceId, skip without duplicate', () => {
      const existingItem = {
        description: 'Previously Invoiced Snack',
        rate: 15.00,
        qty: 1,
        amount: 15.00,
        sourceId: 'GC-PRE-EXIST',
        sourceType: 'guest_charge'
      };
      const invWithExisting = {
        ...mockInvoiceA,
        items: [...mockInvoiceA.items, existingItem]
      };
      saveInvoices([invWithExisting, mockInvoiceB]);

      const charge = {
        id: 'GC-PRE-EXIST',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Previously Invoiced Snack',
        chargeType: 'Consumption',
        quantity: 1,
        unitPrice: 15.00,
        amount: 15.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      const result = reconcileBookingChargesToInvoice('BK-TEST-A');
      expect(result.reconciledCount).toBe(0);
      expect(result.skippedAlreadyInvoiced.length).toBe(1);

      const inv = getInvoices().find((i) => i.id === 'INV-TEST-A');
      expect(inv.items.filter((it) => it.sourceId === 'GC-PRE-EXIST').length).toBe(1);
    });

    it('Test F — invalid financial charge: malformed quantity, unitPrice, or amount is rejected', () => {
      const invalidCharges = [
        {
          id: 'GC-INV-1',
          bookingId: 'BK-TEST-A',
          itemName: 'Zero Qty Item',
          quantity: 0,
          unitPrice: 20.00,
          amount: 20.00,
          status: 'Added to Folio'
        },
        {
          id: 'GC-INV-2',
          bookingId: 'BK-TEST-A',
          itemName: 'Negative Rate Item',
          quantity: 1,
          unitPrice: -5.00,
          amount: -5.00,
          status: 'Added to Folio'
        },
        {
          id: 'GC-INV-3',
          bookingId: 'BK-TEST-A',
          itemName: 'NaN Amount Item',
          quantity: 1,
          unitPrice: 20.00,
          amount: NaN,
          status: 'Added to Folio'
        }
      ];
      saveGuestCharges(invalidCharges);

      const result = reconcileBookingChargesToInvoice('BK-TEST-A');
      expect(result.reconciledCount).toBe(0);
      expect(result.skippedInvalid.length).toBe(3);

      const inv = getInvoices().find((i) => i.id === 'INV-TEST-A');
      expect(inv.items.length).toBe(1);
    });

    it('Test G — status transition: successfully reconciled charge becomes Invoiced', () => {
      const charge = {
        id: 'GC-STATUS-CHG',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Airport Taxi Transfer',
        chargeType: 'External Order',
        quantity: 1,
        unitPrice: 50.00,
        amount: 50.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      reconcileBookingChargesToInvoice('BK-TEST-A');

      const storedCharges = getGuestCharges();
      const updatedCharge = storedCharges.find((c) => c.id === 'GC-STATUS-CHG');
      expect(updatedCharge.status).toBe('Invoiced');
    });

    it('Test H — non-billable status: Pending and Paid charges are excluded from billing', () => {
      const charges = [
        {
          id: 'GC-PENDING',
          bookingId: 'BK-TEST-A',
          guestId: 'GST-A',
          itemName: 'Broken Lamp (Under Review)',
          chargeType: 'Damage',
          quantity: 1,
          unitPrice: 75.00,
          amount: 75.00,
          status: 'Pending'
        },
        {
          id: 'GC-PAID',
          bookingId: 'BK-TEST-A',
          guestId: 'GST-A',
          itemName: 'Minibar Soda (Cash Settled)',
          chargeType: 'Consumption',
          quantity: 1,
          unitPrice: 10.00,
          amount: 10.00,
          status: 'Paid'
        },
        {
          id: 'GC-ALREADY-INV',
          bookingId: 'BK-TEST-A',
          guestId: 'GST-A',
          itemName: 'Previously Invoiced Item',
          chargeType: 'Consumption',
          quantity: 1,
          unitPrice: 12.00,
          amount: 12.00,
          status: 'Invoiced'
        }
      ];
      saveGuestCharges(charges);

      const result = reconcileBookingChargesToInvoice('BK-TEST-A');
      expect(result.reconciledCount).toBe(0);
      expect(result.skippedIneligible.length).toBe(2);
      expect(result.skippedAlreadyInvoiced.length).toBe(1);

      const inv = getInvoices().find((i) => i.id === 'INV-TEST-A');
      expect(inv.items.length).toBe(1);
    });

    it('Test I — existing invoice items preserved: room charge and inclusions remain untouched', () => {
      const charge = {
        id: 'GC-EXTRA',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Extra Bedding',
        chargeType: 'Other',
        quantity: 1,
        unitPrice: 25.00,
        amount: 25.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      reconcileBookingChargesToInvoice('BK-TEST-A');

      const inv = getInvoices().find((i) => i.id === 'INV-TEST-A');
      expect(inv.items[0]).toEqual(mockInvoiceA.items[0]);
      expect(inv.items[1].sourceId).toBe('GC-EXTRA');
    });

    it('Test J — repeated reconciliation: multiple repeated calls remain strictly idempotent', () => {
      const charge = {
        id: 'GC-REPEAT',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Laundry Express',
        chargeType: 'Other',
        quantity: 1,
        unitPrice: 35.00,
        amount: 35.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      reconcileBookingChargesToInvoice('BK-TEST-A');
      reconcileBookingChargesToInvoice('BK-TEST-A');
      reconcileBookingChargesToInvoice('BK-TEST-A');

      const inv = getInvoices().find((i) => i.id === 'INV-TEST-A');
      expect(inv.items.length).toBe(2);
      expect(inv.totalAmount).toBe(585.00);
      expect(inv.balanceDue).toBe(385.00);
    });

    it('Test K — payment isolation: reconciliation does not create or mutate payment records', () => {
      const initialPayments = getPayments();

      const charge = {
        id: 'GC-PAY-ISO',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Mini Bar Beer',
        chargeType: 'Consumption',
        quantity: 1,
        unitPrice: 15.00,
        amount: 15.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      reconcileBookingChargesToInvoice('BK-TEST-A');

      const postPayments = getPayments();
      expect(postPayments.length).toBe(initialPayments.length);
      expect(postPayments).toEqual(initialPayments);
    });

    it('Test L — refund isolation: reconciliation does not create or mutate refund records', () => {
      const initialRefunds = getRefunds();

      const charge = {
        id: 'GC-REF-ISO',
        bookingId: 'BK-TEST-A',
        guestId: 'GST-A',
        itemName: 'Mini Bar Wine',
        chargeType: 'Consumption',
        quantity: 1,
        unitPrice: 40.00,
        amount: 40.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      reconcileBookingChargesToInvoice('BK-TEST-A');

      const postRefunds = getRefunds();
      expect(postRefunds.length).toBe(initialRefunds.length);
      expect(postRefunds).toEqual(initialRefunds);
    });
  });

  // 6. Canonical Booking Stay Invoice Generator (Phase 7 Job 19)
  describe('Canonical Booking Stay Invoice Generator (Job 19)', () => {
    const mockRoom101 = { id: 1, roomNo: '101', roomType: 'Standard Room', rent: 25, status: 'Open' };
    const mockRoom102 = { id: 2, roomNo: '102', roomType: 'Deluxe Suite', rent: 50, status: 'Open' };

    const mockBookingBooked = {
      id: 'BK-JOB19-BOOKED',
      guestId: 'GST-19-1',
      name: 'Catherine Bell',
      email: 'catherine.b@example.com',
      phone: '+1 555-123-4567',
      roomId: 1,
      roomNo: '101',
      status: 'Booked',
      checkIn: '2026-09-10',
      checkOut: '2026-09-12' // 2 nights
    };

    const mockBookingCheckedIn = {
      id: 'BK-JOB19-CHECKIN',
      guestId: 'GST-19-2',
      name: 'David Miller',
      email: 'david.m@example.com',
      phone: '+1 555-987-6543',
      roomId: 2,
      roomNo: '102',
      status: 'Checked In',
      checkIn: '2026-09-15',
      checkOut: '2026-09-18' // 3 nights @ $50 = $150
    };

    const mockBookingCheckedOut = {
      id: 'BK-JOB19-CHECKOUT',
      guestId: 'GST-19-3',
      name: 'Eva Green',
      email: 'eva.g@example.com',
      roomId: 1,
      roomNo: '101',
      status: 'Checked Out',
      checkIn: '2026-09-01',
      checkOut: '2026-09-03' // 2 nights @ $25 = $50
    };

    beforeEach(() => {
      localStorage.setItem('hotel_room_inventory_v1', JSON.stringify([mockRoom101, mockRoom102]));
      localStorage.setItem('hotel_reservations', JSON.stringify([
        mockBookingBooked,
        mockBookingCheckedIn,
        mockBookingCheckedOut
      ]));
      saveInvoices([]);
      savePayments([]);
      saveGuestCharges([]);
    });

    it('Test A — valid Booked booking creates exactly one invoice', () => {
      const result = getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      expect(result.success).toBe(true);
      expect(result.id).toMatch(/^INV-2026-\d{3}$/);
      expect(result.bookingId).toBe('BK-JOB19-BOOKED');
      expect(result.guestName).toBe('Catherine Bell');
      expect(result.guestEmail).toBe('catherine.b@example.com');
      expect(result.guestPhone).toBe('+1 555-123-4567');
      expect(result.roomNumber).toBe('101');
      expect(result.subtotal).toBe(50.00);
      expect(result.totalAmount).toBe(50.00);
      expect(result.paidAmount).toBe(0.00);
      expect(result.balanceDue).toBe(50.00);
      expect(result.status).toBe('Unpaid');
      expect(result.items.length).toBe(1);
      expect(result.items[0].qty).toBe(2);
      expect(result.items[0].rate).toBe(25.00);
      expect(result.items[0].amount).toBe(50.00);

      const storedInvoices = getInvoices();
      expect(storedInvoices.length).toBe(1);
      expect(storedInvoices[0].id).toBe(result.id);
    });

    it('Test B — valid Checked In booking creates exactly one invoice', () => {
      const result = getOrCreateBookingInvoice('BK-JOB19-CHECKIN');
      expect(result.success).toBe(true);
      expect(result.totalAmount).toBe(150.00);
      expect(result.balanceDue).toBe(150.00);
      expect(result.items[0].qty).toBe(3);
      expect(result.items[0].rate).toBe(50.00);
      expect(result.items[0].amount).toBe(150.00);

      const stored = getInvoices().filter((inv) => inv.bookingId === 'BK-JOB19-CHECKIN');
      expect(stored.length).toBe(1);
    });

    it('Test C — valid Checked Out booking can create the missing historical stay invoice if none exists', () => {
      const result = getOrCreateBookingInvoice('BK-JOB19-CHECKOUT');
      expect(result.success).toBe(true);
      expect(result.totalAmount).toBe(50.00);
      expect(result.bookingId).toBe('BK-JOB19-CHECKOUT');

      const stored = getInvoices().filter((inv) => inv.bookingId === 'BK-JOB19-CHECKOUT');
      expect(stored.length).toBe(1);
    });

    it('Test D — Pending booking does not create a new invoice', () => {
      const pendingBooking = {
        id: 'BK-JOB19-PENDING',
        name: 'Pending Guest',
        roomId: 1,
        roomNo: '101',
        status: 'Pending',
        checkIn: '2026-09-20',
        checkOut: '2026-09-22'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([pendingBooking]));

      const result = getOrCreateBookingInvoice('BK-JOB19-PENDING');
      expect(result.success).toBe(false);
      expect(result.reason).toMatch(/status.*Pending|Only Booked/i);
      expect(getInvoices().length).toBe(0);
    });

    it('Test E — Cancelled booking does not create a new invoice', () => {
      const cancelledBooking = {
        id: 'BK-JOB19-CANCELLED',
        name: 'Cancelled Guest',
        roomId: 1,
        roomNo: '101',
        status: 'Cancelled',
        checkIn: '2026-09-20',
        checkOut: '2026-09-22'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([cancelledBooking]));

      const result = getOrCreateBookingInvoice('BK-JOB19-CANCELLED');
      expect(result.success).toBe(false);
      expect(result.reason).toMatch(/status.*Cancelled|Only Booked/i);
      expect(getInvoices().length).toBe(0);
    });

    it('Test F — existing invoice: returns existing invoice without modifying it', () => {
      const existingInvoice = {
        id: 'INV-EXIST-100',
        invoiceNumber: 'INV-EXIST-100',
        bookingId: 'BK-JOB19-BOOKED',
        guestName: 'Existing Snapshot Name',
        roomNumber: '101',
        roomType: 'Custom Room Type',
        checkIn: '2026-09-10',
        checkOut: '2026-09-12',
        subtotal: 300.00,
        discount: 20.00,
        taxesAndFees: 30.00,
        tax: 30.00,
        totalAmount: 310.00,
        paidAmount: 100.00,
        balanceDue: 210.00,
        status: 'Partially Paid',
        items: [{ description: 'Custom Special Stay Package', rate: 300.00, qty: 1, amount: 300.00 }]
      };
      saveInvoices([existingInvoice]);

      const result = getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      expect(result.success).toBe(true);
      expect(result.id).toBe('INV-EXIST-100');
      expect(result.totalAmount).toBe(310.00);
      expect(result.paidAmount).toBe(100.00);
      expect(result.balanceDue).toBe(210.00);
      expect(result.status).toBe('Partially Paid');
      expect(result.items[0].description).toBe('Custom Special Stay Package');

      // Verify localStorage was not altered
      const stored = getInvoices();
      expect(stored.length).toBe(1);
      expect(stored[0]).toEqual(existingInvoice);
    });

    it('Test G — idempotency: two calls create only one invoice', () => {
      const first = getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      const invoiceCountAfterFirst = getInvoices().length;
      expect(invoiceCountAfterFirst).toBe(1);

      const second = getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      const invoiceCountAfterSecond = getInvoices().length;

      expect(first.id).toBe(second.id);
      expect(invoiceCountAfterSecond).toBe(1);

      // Verify second call does not alter existing fields
      expect(second.items).toEqual(first.items);
      expect(second.subtotal).toBe(first.subtotal);
      expect(second.totalAmount).toBe(first.totalAmount);
      expect(second.status).toBe(first.status);
      expect(second.paidAmount).toBe(first.paidAmount);
      expect(second.balanceDue).toBe(first.balanceDue);
    });

    it('Test H — duplicate existing invoices: fails safely with ambiguity', () => {
      const invA = { id: 'INV-DUP-1', invoiceNumber: 'INV-DUP-1', bookingId: 'BK-JOB19-BOOKED', totalAmount: 100 };
      const invB = { id: 'INV-DUP-2', invoiceNumber: 'INV-DUP-2', bookingId: 'BK-JOB19-BOOKED', totalAmount: 100 };
      saveInvoices([invA, invB]);

      const result = getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      expect(result.success).toBe(false);
      expect(result.reason).toMatch(/multiple invoices|ambiguous/i);

      // Invoices storage remains untouched
      expect(getInvoices().length).toBe(2);
    });

    it('Test I — invalid booking ID fails safely', () => {
      const resNonExistent = getOrCreateBookingInvoice('BK-DOES-NOT-EXIST');
      expect(resNonExistent.success).toBe(false);
      expect(resNonExistent.reason).toMatch(/not found/i);

      const resEmpty = getOrCreateBookingInvoice('');
      expect(resEmpty.success).toBe(false);

      const resNull = getOrCreateBookingInvoice(null);
      expect(resNull.success).toBe(false);
    });

    it('Test J — invalid dates fail safely', () => {
      const badDateBooking = {
        id: 'BK-BAD-DATE',
        name: 'Bad Date',
        roomId: 1,
        roomNo: '101',
        status: 'Booked',
        checkIn: 'not-a-valid-date',
        checkOut: '2026-09-12'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([badDateBooking]));

      const result = getOrCreateBookingInvoice('BK-BAD-DATE');
      expect(result.success).toBe(false);
      expect(result.reason).toMatch(/invalid or missing check-in/i);
      expect(getInvoices().length).toBe(0);
    });

    it('Test K — zero-night stay fails safely', () => {
      const zeroNightBooking = {
        id: 'BK-ZERO-NIGHT',
        name: 'Zero Night',
        roomId: 1,
        roomNo: '101',
        status: 'Booked',
        checkIn: '2026-09-10',
        checkOut: '2026-09-10'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([zeroNightBooking]));

      const result = getOrCreateBookingInvoice('BK-ZERO-NIGHT');
      expect(result.success).toBe(false);
      expect(result.reason).toMatch(/check-out date must be strictly after|duration must be at least 1 night/i);
      expect(getInvoices().length).toBe(0);
    });

    it('Test L — checkout before check-in fails safely', () => {
      const invertedBooking = {
        id: 'BK-INVERTED',
        name: 'Inverted Stay',
        roomId: 1,
        roomNo: '101',
        status: 'Booked',
        checkIn: '2026-09-15',
        checkOut: '2026-09-10'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([invertedBooking]));

      const result = getOrCreateBookingInvoice('BK-INVERTED');
      expect(result.success).toBe(false);
      expect(result.reason).toMatch(/check-out date must be strictly after/i);
      expect(getInvoices().length).toBe(0);
    });

    it('Test M — canonical room resolution: uses booking.roomId over roomNo display text', () => {
      // Room 2 has rent: 50. Display roomNo is '101' (which has rent 25).
      const roomDiscrepancyBooking = {
        id: 'BK-DISCREPANCY',
        name: 'Discrepancy Guest',
        roomId: 2,
        roomNo: '101',
        status: 'Booked',
        checkIn: '2026-09-10',
        checkOut: '2026-09-11' // 1 night
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([roomDiscrepancyBooking]));

      const result = getOrCreateBookingInvoice('BK-DISCREPANCY');
      expect(result.success).toBe(true);
      // Must use roomId: 2 ($50) rather than room 101 ($25)
      expect(result.items[0].rate).toBe(50.00);
      expect(result.totalAmount).toBe(50.00);
    });

    it('Test N — accommodation calculation: correct nights × nightly rate', () => {
      // 5 nights in Room 1 (rent: 25)
      const multiNightBooking = {
        id: 'BK-MULTI-NIGHT',
        name: 'Multi Night Guest',
        roomId: 1,
        roomNo: '101',
        status: 'Booked',
        checkIn: '2026-09-10',
        checkOut: '2026-09-15' // 5 nights
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([multiNightBooking]));

      const result = getOrCreateBookingInvoice('BK-MULTI-NIGHT');
      expect(result.success).toBe(true);
      expect(result.items[0].qty).toBe(5);
      expect(result.items[0].rate).toBe(25.00);
      expect(result.items[0].amount).toBe(125.00);
      expect(result.totalAmount).toBe(125.00);
    });

    it('Test O — invoice financial state: verified integrity, paid = 0, due = totalAmount', () => {
      const result = getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      expect(result.success).toBe(true);

      const finState = getInvoiceFinancialState(result.id);
      expect(finState.integrity).toBe('verified');
      expect(finState.effectivePaid).toBe(0);
      expect(finState.due).toBe(result.totalAmount);
    });

    it('Test P — getBookingDues() compatibility: returns due after creation and null before', () => {
      const beforeDues = getBookingDues(mockBookingBooked);
      expect(beforeDues).toBeNull();

      const result = getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      expect(result.success).toBe(true);

      const afterDues = getBookingDues(mockBookingBooked);
      expect(afterDues).toBe(result.totalAmount);
    });

    it('Test Q — Job 17 reconciliation: guest charge can be reconciled into generated invoice', () => {
      const invResult = getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      expect(invResult.success).toBe(true);
      expect(invResult.items.length).toBe(1);

      const charge = {
        id: 'GC-JOB19-EXTRA',
        bookingId: 'BK-JOB19-BOOKED',
        guestId: 'GST-19-1',
        itemName: 'Airport Shuttle',
        chargeType: 'External Order',
        quantity: 1,
        unitPrice: 35.00,
        amount: 35.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      const recResult = reconcileBookingChargesToInvoice('BK-JOB19-BOOKED');
      expect(recResult.success).toBe(true);
      expect(recResult.reconciledCount).toBe(1);

      const updatedInv = getInvoices().find((i) => i.id === invResult.id);
      expect(updatedInv.items.length).toBe(2);
      expect(updatedInv.items[1].sourceId).toBe('GC-JOB19-EXTRA');
      expect(updatedInv.items[1].sourceType).toBe('guest_charge');
      expect(updatedInv.totalAmount).toBe(85.00); // 50 accommodation + 35 shuttle
      expect(updatedInv.balanceDue).toBe(85.00);

      const updatedCharges = getGuestCharges();
      expect(updatedCharges.find((c) => c.id === 'GC-JOB19-EXTRA').status).toBe('Invoiced');
    });

    it('Test R — reconciliation idempotency: repeated reconciliation does not duplicate items', () => {
      getOrCreateBookingInvoice('BK-JOB19-BOOKED');
      const charge = {
        id: 'GC-JOB19-REPEAT',
        bookingId: 'BK-JOB19-BOOKED',
        guestId: 'GST-19-1',
        itemName: 'Laundry Service',
        chargeType: 'Other',
        quantity: 1,
        unitPrice: 20.00,
        amount: 20.00,
        status: 'Added to Folio'
      };
      saveGuestCharges([charge]);

      reconcileBookingChargesToInvoice('BK-JOB19-BOOKED');
      reconcileBookingChargesToInvoice('BK-JOB19-BOOKED');
      reconcileBookingChargesToInvoice('BK-JOB19-BOOKED');

      const inv = getInvoices().find((i) => i.bookingId === 'BK-JOB19-BOOKED');
      expect(inv.items.length).toBe(2);
      expect(inv.totalAmount).toBe(70.00);
      expect(inv.balanceDue).toBe(70.00);
    });

    it('Test S — legacy invoice compatibility: existing demo invoice remains unchanged', () => {
      saveInvoices(INITIAL_INVOICES);
      // Demo invoice INV-2026-001 has bookingId 'BK-7801'
      const demoBooking = {
        id: 'BK-7801',
        name: 'Alexander Wright',
        roomId: 1,
        roomNo: '302',
        status: 'Booked',
        checkIn: '2026-09-10',
        checkOut: '2026-09-14'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([demoBooking]));

      const result = getOrCreateBookingInvoice('BK-7801');
      expect(result.id).toBe('INV-2026-001');
      expect(result.totalAmount).toBe(894.60);
      expect(result.status).toBe('Paid');
      expect(result.discount).toBe(50.00);
      expect(result.taxesAndFees).toBe(184.60);

      // Verify the stored invoice was not recalculated or changed
      const stored = getInvoices().find((i) => i.id === 'INV-2026-001');
      expect(stored).toEqual(INITIAL_INVOICES[0]);
    });

    it('Test T — collision-safe invoice ID generation: does not collide after deletion', () => {
      // Seed with initial invoices 1..10
      saveInvoices(INITIAL_INVOICES);
      // Delete invoice 5 so length is 9
      const subset = INITIAL_INVOICES.filter((inv) => inv.id !== 'INV-2026-005');
      saveInvoices(subset);
      expect(getInvoices().length).toBe(INITIAL_INVOICES.length - 1);

      const newBooking = {
        id: 'BK-JOB19-COLLISION-TEST',
        name: 'Collision Test Guest',
        roomId: 1,
        roomNo: '101',
        status: 'Booked',
        checkIn: '2026-09-10',
        checkOut: '2026-09-12'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([newBooking]));

      const result = getOrCreateBookingInvoice('BK-JOB19-COLLISION-TEST');
      expect(result.success).toBe(true);
      // Highest existing is INV-2026-010, so next must be INV-2026-011 (never INV-2026-010)
      expect(result.id).toBe('INV-2026-011');
      expect(result.invoiceNumber).toBe('INV-2026-011');

      // Verify no collisions exist in storage
      const allInvoices = getInvoices();
      const ids = allInvoices.map((inv) => inv.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  // 9. Folio Charge Reconciliation before Payment Review (Phase 7 Job 22)
  describe('Phase 7 Job 22: Folio Charge Reconciliation before Payment Review', () => {
    it('reconciles eligible folio charges when opening RecordPaymentModal before payment review', () => {
      saveRooms([{ id: 'R-PAY-1', roomNo: '201', rent: 100, roomType: 'Standard' }]);
      const booking = {
        id: 'BK-PAY-REV',
        name: 'Review Guest',
        roomId: 'R-PAY-1',
        roomNo: '201',
        status: 'Checked In',
        checkIn: '2026-10-01',
        checkOut: '2026-10-03'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([booking]));

      const invResult = getOrCreateBookingInvoice('BK-PAY-REV');
      expect(invResult.success).toBe(true);
      expect(invResult.totalAmount).toBe(200); // 2 nights @ $100

      // Add eligible folio charge
      saveGuestCharges([
        {
          id: 'CHG-REV-1',
          bookingId: 'BK-PAY-REV',
          itemName: 'Room Service Breakfast',
          quantity: 2,
          unitPrice: 25,
          amount: 50,
          status: 'Added to Folio'
        }
      ]);

      const onRecord = (paymentData) => {
        recordInvoicePayment(paymentData);
      };

      const { getAllByText } = render(
        <RecordPaymentModal
          open={true}
          invoice={invResult}
          onRecordPayment={onRecord}
          onClose={() => {}}
        />
      );

      // Verify reconciled total and balance due are displayed
      expect(getAllByText('$250.00').length).toBeGreaterThanOrEqual(1); // $200 stay + $50 charge

      // Verify charge was marked as Invoiced
      const charges = getGuestCharges();
      expect(charges.find((c) => c.id === 'CHG-REV-1').status).toBe('Invoiced');

      // Verify invoice in storage was updated
      const storedInv = getInvoices().find((i) => i.bookingId === 'BK-PAY-REV');
      expect(storedInv.totalAmount).toBe(250);
      expect(storedInv.balanceDue).toBe(250);
    });

    it('reconciles eligible folio charges when opening InvoiceDetailModal', () => {
      saveRooms([{ id: 'R-PAY-2', roomNo: '202', rent: 150, roomType: 'Deluxe' }]);
      const booking = {
        id: 'BK-DETAIL-REV',
        name: 'Detail Guest',
        roomId: 'R-PAY-2',
        roomNo: '202',
        status: 'Checked In',
        checkIn: '2026-10-05',
        checkOut: '2026-10-07'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([booking]));

      const invResult = getOrCreateBookingInvoice('BK-DETAIL-REV');
      expect(invResult.success).toBe(true);

      saveGuestCharges([
        {
          id: 'CHG-DET-1',
          bookingId: 'BK-DETAIL-REV',
          itemName: 'Airport Shuttle Luxury',
          quantity: 1,
          unitPrice: 60,
          amount: 60,
          status: 'Added to Folio'
        }
      ]);

      const { getByText } = render(
        <InvoiceDetailModal
          open={true}
          invoice={invResult}
          onClose={() => {}}
        />
      );

      // Verify charge line item appears in document
      expect(getByText('Airport Shuttle Luxury')).toBeTruthy();

      // Verify invoice in store is reconciled
      const stored = getInvoices().find((i) => i.bookingId === 'BK-DETAIL-REV');
      expect(stored.totalAmount).toBe(360); // 300 stay + 60 shuttle
      expect(stored.balanceDue).toBe(360);
    });

    it('partial payment against reconciled balance due works correctly without automatic payment', () => {
      saveRooms([{ id: 'R-PAY-3', roomNo: '203', rent: 100, roomType: 'Standard' }]);
      const booking = {
        id: 'BK-PARTIAL-REV',
        name: 'Partial Guest',
        roomId: 'R-PAY-3',
        roomNo: '203',
        status: 'Checked In',
        checkIn: '2026-10-10',
        checkOut: '2026-10-12'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([booking]));

      const invResult = getOrCreateBookingInvoice('BK-PARTIAL-REV');
      saveGuestCharges([
        {
          id: 'CHG-PARTIAL-1',
          bookingId: 'BK-PARTIAL-REV',
          itemName: 'Laundry Service',
          quantity: 1,
          unitPrice: 40,
          amount: 40,
          status: 'Added to Folio'
        }
      ]);

      // Reconcile before payment review
      const recon = reconcileBookingChargesToInvoice('BK-PARTIAL-REV');
      expect(recon.invoice.totalAmount).toBe(240);
      expect(recon.invoice.balanceDue).toBe(240);

      // Record a partial payment of $100
      recordInvoicePayment({
        invoiceId: recon.invoiceId,
        amount: 100,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-PARTIAL-1'
      });

      const updatedInv = getInvoices().find((i) => i.id === recon.invoiceId);
      expect(updatedInv.paidAmount).toBe(100);
      expect(updatedInv.balanceDue).toBe(140);
      expect(updatedInv.status).toBe('Partially Paid');

      // Re-running reconciliation does not duplicate lines or change dues
      const secondRecon = reconcileBookingChargesToInvoice('BK-PARTIAL-REV');
      expect(secondRecon.reconciledCount).toBe(0);
      const afterSecond = getInvoices().find((i) => i.id === recon.invoiceId);
      expect(afterSecond.totalAmount).toBe(240);
      expect(afterSecond.balanceDue).toBe(140);
    });
  });

  // 10. Phase 7 Job 23: Payment Recording Integrity + Invoice Finalization Lifecycle
  describe('Phase 7 Job 23: Payment Recording Integrity + Invoice Finalization Lifecycle', () => {
    it('1. records a valid full payment transitioning status to Paid and balanceDue to 0', () => {
      saveInvoices([
        {
          id: 'INV-JOB23-FULL',
          invoiceNumber: 'INV-JOB23-FULL',
          bookingId: 'BK-JOB23-FULL',
          guestName: 'Full Pay Guest',
          totalAmount: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Room Stay', amount: 1000 }],
          payments: []
        }
      ]);

      const res = recordInvoicePayment('INV-JOB23-FULL', {
        amount: 1000,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-FULL-001'
      });

      expect(res.updatedInvoice.paidAmount).toBe(1000);
      expect(res.updatedInvoice.balanceDue).toBe(0);
      expect(res.updatedInvoice.status).toBe('Paid');

      const storedInv = getInvoices().find((i) => i.id === 'INV-JOB23-FULL');
      expect(storedInv.balanceDue).toBe(0);
      expect(storedInv.status).toBe('Paid');

      const payment = getPayments().find((p) => p.transactionRef === 'TXN-FULL-001');
      expect(payment).toBeDefined();
      expect(payment.invoiceId).toBe('INV-JOB23-FULL');
      expect(payment.amount).toBe(1000);
      expect(payment.status).toBe('Completed');
    });

    it('2 & 9. records a valid partial payment leaving correct remaining balance and Partially Paid status', () => {
      saveInvoices([
        {
          id: 'INV-JOB23-PART',
          invoiceNumber: 'INV-JOB23-PART',
          bookingId: 'BK-JOB23-PART',
          guestName: 'Partial Guest',
          totalAmount: 10000,
          paidAmount: 0,
          balanceDue: 10000,
          status: 'Unpaid',
          items: [{ description: 'Long Stay', amount: 10000 }],
          payments: []
        }
      ]);

      const res = recordInvoicePayment('INV-JOB23-PART', {
        amount: 4000,
        paymentMethod: 'Bank Transfer',
        transactionRef: 'TXN-PART-4000'
      });

      expect(res.updatedInvoice.paidAmount).toBe(4000);
      expect(res.updatedInvoice.balanceDue).toBe(6000);
      expect(res.updatedInvoice.status).toBe('Partially Paid');

      const storedInv = getInvoices().find((i) => i.id === 'INV-JOB23-PART');
      expect(storedInv.paidAmount).toBe(4000);
      expect(storedInv.balanceDue).toBe(6000);
      expect(storedInv.status).toBe('Partially Paid');
    });

    it('3. records multiple partial payments cumulatively settling to 0 and Paid status', () => {
      saveInvoices([
        {
          id: 'INV-JOB23-MULTI',
          invoiceNumber: 'INV-JOB23-MULTI',
          bookingId: 'BK-JOB23-MULTI',
          guestName: 'Multi Guest',
          totalAmount: 10000,
          paidAmount: 0,
          balanceDue: 10000,
          status: 'Unpaid',
          items: [{ description: 'Suite Stay', amount: 10000 }],
          payments: []
        }
      ]);

      // Payment 1: $4,000
      recordInvoicePayment('INV-JOB23-MULTI', {
        amount: 4000,
        transactionRef: 'TXN-M-1'
      });

      // Payment 2: $6,000
      const res2 = recordInvoicePayment('INV-JOB23-MULTI', {
        amount: 6000,
        transactionRef: 'TXN-M-2'
      });

      expect(res2.updatedInvoice.paidAmount).toBe(10000);
      expect(res2.updatedInvoice.balanceDue).toBe(0);
      expect(res2.updatedInvoice.status).toBe('Paid');

      const inv = getInvoices().find((i) => i.id === 'INV-JOB23-MULTI');
      expect(inv.paidAmount).toBe(10000);
      expect(inv.balanceDue).toBe(0);
      expect(inv.status).toBe('Paid');
      expect(inv.payments).toHaveLength(2);
    });

    it('4. rejects payment exceeding remaining balance due without modifying financial state', () => {
      saveInvoices([
        {
          id: 'INV-JOB23-EXCEED',
          invoiceNumber: 'INV-JOB23-EXCEED',
          bookingId: 'BK-JOB23-EXCEED',
          totalAmount: 1000,
          paidAmount: 400,
          balanceDue: 600,
          status: 'Partially Paid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [{ paymentId: 'P-PREV', amount: 400, status: 'Completed' }]
        }
      ]);
      savePayments([
        { id: 'P-PREV', paymentId: 'P-PREV', invoiceId: 'INV-JOB23-EXCEED', amount: 400, refundedAmount: 0, status: 'Completed' }
      ]);

      const initialPaymentsCount = getPayments().length;

      expect(() => {
        recordInvoicePayment('INV-JOB23-EXCEED', { amount: 650 });
      }).toThrow(/exceeds remaining balance due/i);

      // Verify no payment was created
      expect(getPayments().length).toBe(initialPaymentsCount);

      // Verify invoice was not mutated
      const inv = getInvoices().find((i) => i.id === 'INV-JOB23-EXCEED');
      expect(inv.balanceDue).toBe(600);
      expect(inv.paidAmount).toBe(400);
      expect(inv.status).toBe('Partially Paid');
    });

    it('5. strictly requires and matches canonical invoice ID', () => {
      expect(() => recordInvoicePayment('', { amount: 100 })).toThrow(/valid invoiceId is required/i);
      expect(() => recordInvoicePayment('   ', { amount: 100 })).toThrow(/valid invoiceId is required/i);
      expect(() => recordInvoicePayment('INV-DOES-NOT-EXIST', { amount: 100 })).toThrow(/was not found/i);
    });

    it('6 & 10. failed payment does not create a payment record or modify invoice', () => {
      saveInvoices([
        {
          id: 'INV-JOB23-FAIL',
          invoiceNumber: 'INV-JOB23-FAIL',
          totalAmount: 500,
          paidAmount: 0,
          balanceDue: 500,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 500 }],
          payments: []
        }
      ]);

      expect(() => recordInvoicePayment('INV-JOB23-FAIL', { amount: 0 })).toThrow(/greater than 0/i);
      expect(() => recordInvoicePayment('INV-JOB23-FAIL', { amount: -50 })).toThrow(/greater than 0/i);
      expect(() => recordInvoicePayment('INV-JOB23-FAIL', { amount: 'invalid' })).toThrow(/greater than 0/i);

      expect(getPayments().filter((p) => p.invoiceId === 'INV-JOB23-FAIL')).toHaveLength(0);
      const inv = getInvoices().find((i) => i.id === 'INV-JOB23-FAIL');
      expect(inv.balanceDue).toBe(500);
      expect(inv.paidAmount).toBe(0);
    });

    it('7. handles concurrency/stale state: rejects second payment attempt exceeding remaining balance', () => {
      saveInvoices([
        {
          id: 'INV-JOB23-CONCUR',
          invoiceNumber: 'INV-JOB23-CONCUR',
          bookingId: 'BK-CONCUR',
          totalAmount: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: []
        }
      ]);

      // Dialog A attempts $700 against $1,000 balance
      const resA = recordInvoicePayment('INV-JOB23-CONCUR', { amount: 700, transactionRef: 'TXN-A' });
      expect(resA.updatedInvoice.balanceDue).toBe(300);

      // Dialog B attempts $500 (held stale $1,000 balance in its UI)
      expect(() => {
        recordInvoicePayment('INV-JOB23-CONCUR', { amount: 500, transactionRef: 'TXN-B' });
      }).toThrow(/exceeds remaining balance due of \$300\.00/i);

      // Invoice balance remains $300, and only TXN-A was recorded
      const inv = getInvoices().find((i) => i.id === 'INV-JOB23-CONCUR');
      expect(inv.balanceDue).toBe(300);
      expect(inv.paidAmount).toBe(700);
      const payments = getPayments().filter((p) => p.invoiceId === 'INV-JOB23-CONCUR');
      expect(payments).toHaveLength(1);
      expect(payments[0].transactionRef).toBe('TXN-A');
    });

    it('8 & 16-18. post-checkout payment allows payment against Checked Out reservation without mutating reservation lifecycle', () => {
      saveRooms([{ id: 'R-CO-1', roomNo: '301', rent: 120, roomType: 'Deluxe' }]);
      const booking = {
        id: 'BK-POST-CHECKOUT',
        name: 'Post Checkout Guest',
        roomId: 'R-CO-1',
        roomNo: '301',
        status: 'Checked Out',
        checkIn: '2026-10-01',
        checkOut: '2026-10-03'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([booking]));

      saveInvoices([
        {
          id: 'INV-POST-CO',
          invoiceNumber: 'INV-POST-CO',
          bookingId: 'BK-POST-CHECKOUT',
          guestName: 'Post Checkout Guest',
          totalAmount: 240,
          paidAmount: 0,
          balanceDue: 240,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 240 }],
          payments: []
        }
      ]);

      // Record full payment post-checkout
      const res = recordInvoicePayment('INV-POST-CO', {
        amount: 240,
        paymentMethod: 'Credit Card',
        transactionRef: 'TXN-POST-CO'
      });

      expect(res.updatedInvoice.balanceDue).toBe(0);
      expect(res.updatedInvoice.status).toBe('Paid');

      // Crucial: Operational reservation status MUST remain Checked Out
      const reservations = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
      const storedBooking = reservations.find((b) => b.id === 'BK-POST-CHECKOUT');
      expect(storedBooking.status).toBe('Checked Out');
    });

    it('12-15. folio integration: eligible charges reconciled before review, payment uses reconciled balance without auto-payment', () => {
      saveRooms([{ id: 'R-FOL-1', roomNo: '302', rent: 100, roomType: 'Standard' }]);
      const booking = {
        id: 'BK-FOL-REV',
        name: 'Folio Review Guest',
        roomId: 'R-FOL-1',
        roomNo: '302',
        status: 'Checked In',
        checkIn: '2026-10-10',
        checkOut: '2026-10-12'
      };
      localStorage.setItem('hotel_reservations', JSON.stringify([booking]));

      const invRes = getOrCreateBookingInvoice('BK-FOL-REV');
      expect(invRes.totalAmount).toBe(200);

      // Add eligible charge
      saveGuestCharges([
        {
          id: 'CHG-JOB23-1',
          bookingId: 'BK-FOL-REV',
          itemName: 'Spa Massage',
          quantity: 1,
          unitPrice: 80,
          amount: 80,
          status: 'Added to Folio'
        }
      ]);

      // Render RecordPaymentModal
      let recordedPaymentData = null;
      const { getByRole } = render(
        <RecordPaymentModal
          open={true}
          invoice={invRes}
          onRecordPayment={(data) => {
            recordedPaymentData = data;
            recordInvoicePayment(data);
          }}
          onClose={() => {}}
        />
      );

      // Verify reconciled total: $200 stay + $80 spa = $280
      const charges = getGuestCharges();
      expect(charges.find((c) => c.id === 'CHG-JOB23-1').status).toBe('Invoiced');

      // Verify no automatic payments were created
      expect(getPayments().filter((p) => p.bookingId === 'BK-FOL-REV')).toHaveLength(0);

      // Confirm payment of the full reconciled balance $280
      const confirmBtn = getByRole('button', { name: /confirm & record payment/i });
      fireEvent.click(confirmBtn);

      expect(recordedPaymentData).toBeDefined();
      expect(recordedPaymentData.amount).toBe(280);

      const finalizedInv = getInvoices().find((i) => i.bookingId === 'BK-FOL-REV');
      expect(finalizedInv.balanceDue).toBe(0);
      expect(finalizedInv.status).toBe('Paid');
    });

    it('11. UI real-flow test: failed payment keeps modal open and displays error alert', async () => {
      saveInvoices([
        {
          id: 'INV-JOB23-UI-ERR',
          invoiceNumber: 'INV-JOB23-UI-ERR',
          totalAmount: 500,
          paidAmount: 0,
          balanceDue: 500,
          status: 'Unpaid',
          items: [{ description: 'Room Stay', amount: 500 }],
          payments: []
        }
      ]);

      let closed = false;
      const failingSave = () => {
        throw new Error('Simulated gateway timeout error');
      };

      const { getByRole, findByText } = render(
        <RecordPaymentModal
          open={true}
          invoice={{ id: 'INV-JOB23-UI-ERR' }}
          onRecordPayment={failingSave}
          onClose={() => { closed = true; }}
        />
      );

      const confirmBtn = getByRole('button', { name: /confirm & record payment/i });
      fireEvent.click(confirmBtn);

      // Error alert must be visible to user
      expect(await findByText('Simulated gateway timeout error')).toBeDefined();

      // Modal must NOT close on error
      expect(closed).toBe(false);
    });

    it('UI real-flow test: Open invoice -> Record partial payment -> Confirm -> Reopen -> Settle remaining balance to Paid', async () => {
      saveInvoices([
        {
          id: 'INV-JOB23-FLOW',
          invoiceNumber: 'INV-JOB23-FLOW',
          guestName: 'Flow Test Guest',
          totalAmount: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Room Stay', amount: 1000 }],
          payments: []
        }
      ]);

      let closedCount = 0;
      const handleRecord = (data) => {
        recordInvoicePayment(data);
      };

      // 1. Partial payment: $400
      const { unmount, getByLabelText, getByRole } = render(
        <RecordPaymentModal
          open={true}
          invoice={{ id: 'INV-JOB23-FLOW' }}
          onRecordPayment={handleRecord}
          onClose={() => { closedCount++; }}
        />
      );

      const amountInput = getByLabelText(/payment amount/i);
      fireEvent.change(amountInput, { target: { value: '400' } });

      const confirmBtn = getByRole('button', { name: /confirm & record payment/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => expect(closedCount).toBe(1));

      // Verify store state after partial payment
      const midInv = getInvoices().find((i) => i.id === 'INV-JOB23-FLOW');
      expect(midInv.paidAmount).toBe(400);
      expect(midInv.balanceDue).toBe(600);
      expect(midInv.status).toBe('Partially Paid');

      unmount();

      // 2. Re-open modal to settle remaining balance
      const render2 = render(
        <RecordPaymentModal
          open={true}
          invoice={{ id: 'INV-JOB23-FLOW' }}
          onRecordPayment={handleRecord}
          onClose={() => { closedCount++; }}
        />
      );

      // Remaining balance should now be $600
      expect(render2.getAllByText('$600.00').length).toBeGreaterThanOrEqual(1);

      // Pay the remaining $600
      const confirmBtn2 = render2.getByRole('button', { name: /confirm & record payment/i });
      fireEvent.click(confirmBtn2);

      await waitFor(() => expect(closedCount).toBe(2));

      // Verify finalized invoice
      const finalInv = getInvoices().find((i) => i.id === 'INV-JOB23-FLOW');
      expect(finalInv.paidAmount).toBe(1000);
      expect(finalInv.balanceDue).toBe(0);
      expect(finalInv.status).toBe('Paid');
    });
  });

  // 12. Phase 7 Job 24: Refund Integrity + Payment/Refund Ledger Consistency
  describe('Phase 7 Job 24: Refund Integrity + Payment/Refund Ledger Consistency', () => {
    it('1. Valid full refund: updates payment to Refunded and invoice to Unpaid with full balanceDue', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-FULL',
          invoiceNumber: 'INV-JOB24-FULL',
          guestName: 'Full Refund Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-FULL', { amount: 1000, paymentMethod: 'Credit Card' });
      expect(payRes.updatedInvoice.status).toBe('Paid');
      expect(payRes.updatedInvoice.balanceDue).toBe(0);

      const refRes = processRefund({
        paymentId: payRes.newPayment.id,
        amount: 1000,
        reason: 'Guest Complaint / Room Issue',
      });

      expect(refRes.newRefund.status).toBe('Completed');
      expect(refRes.updatedPayment.status).toBe('Refunded');
      expect(refRes.updatedPayment.refundedAmount).toBe(1000);

      const updatedInv = getInvoices().find((i) => i.id === 'INV-JOB24-FULL');
      expect(updatedInv.paidAmount).toBe(0);
      expect(updatedInv.balanceDue).toBe(1000);
      expect(updatedInv.status).toBe('Unpaid');
    });

    it('2. Valid partial refund: updates payment to Partially Refunded and invoice to Partially Paid', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-PART',
          invoiceNumber: 'INV-JOB24-PART',
          guestName: 'Partial Refund Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 0,
          balanceDue: 10000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 10000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-PART', { amount: 10000, paymentMethod: 'Credit Card' });
      expect(payRes.updatedInvoice.status).toBe('Paid');

      const refRes = processRefund({
        paymentId: payRes.newPayment.id,
        amount: 2500,
        reason: 'Service Dissatisfaction',
      });

      expect(refRes.newRefund.status).toBe('Completed');
      expect(refRes.updatedPayment.status).toBe('Partially Refunded');
      expect(refRes.updatedPayment.refundedAmount).toBe(2500);

      const updatedInv = getInvoices().find((i) => i.id === 'INV-JOB24-PART');
      expect(updatedInv.paidAmount).toBe(7500);
      expect(updatedInv.balanceDue).toBe(2500);
      expect(updatedInv.status).toBe('Partially Paid');
    });

    it('3. Multiple partial refunds: accumulates completed refunds against payment without exceeding total', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-MULTI',
          invoiceNumber: 'INV-JOB24-MULTI',
          guestName: 'Multi Refund Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 0,
          balanceDue: 10000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 10000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-MULTI', { amount: 10000, paymentMethod: 'Credit Card' });
      const pId = payRes.newPayment.id;

      // Refund 1: $2,500
      processRefund({ paymentId: pId, amount: 2500 });
      let inv = getInvoices().find((i) => i.id === 'INV-JOB24-MULTI');
      expect(inv.paidAmount).toBe(7500);
      expect(inv.balanceDue).toBe(2500);

      // Refund 2: $3,000
      processRefund({ paymentId: pId, amount: 3000 });
      inv = getInvoices().find((i) => i.id === 'INV-JOB24-MULTI');
      expect(inv.paidAmount).toBe(4500);
      expect(inv.balanceDue).toBe(5500);
      expect(inv.status).toBe('Partially Paid');

      const payment = getPayments().find((p) => p.id === pId);
      expect(payment.refundedAmount).toBe(5500);
      expect(payment.status).toBe('Partially Refunded');
    });

    it('4. Rejects refund greater than original payment amount', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-EXC1',
          invoiceNumber: 'INV-JOB24-EXC1',
          guestName: 'Excess Guest 1',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-EXC1', { amount: 1000 });
      expect(() => {
        processRefund({ paymentId: payRes.newPayment.id, amount: 1001 });
      }).toThrow(/exceeds/i);
    });

    it('5. Rejects refund greater than remaining refundable amount', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-EXC2',
          invoiceNumber: 'INV-JOB24-EXC2',
          guestName: 'Excess Guest 2',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-EXC2', { amount: 1000 });
      processRefund({ paymentId: payRes.newPayment.id, amount: 600 });

      expect(() => {
        processRefund({ paymentId: payRes.newPayment.id, amount: 450 });
      }).toThrow(/Refund amount \$450\.00 exceeds maximum refundable amount of \$400\.00/i);
    });

    it('6. Rejects refund against nonexistent payment ID', () => {
      expect(() => {
        processRefund({ paymentId: 'PAY-NONEXISTENT', amount: 100 });
      }).toThrow(/Payment with ID "PAY-NONEXISTENT" was not found/i);
    });

    it('7. Rejects refund attempting to cross invoices', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-A',
          invoiceNumber: 'INV-JOB24-A',
          guestName: 'Guest A',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-A', { amount: 1000 });
      expect(() => {
        processRefund({
          paymentId: payRes.newPayment.id,
          invoiceId: 'INV-JOB24-B',
          amount: 200,
        });
      }).toThrow(/Refund cannot cross invoices/i);
    });

    it('8. Pending or rejected refund does not reduce effective paid or invoice balance', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-PEND',
          invoiceNumber: 'INV-JOB24-PEND',
          guestName: 'Pending Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-PEND', { amount: 1000 });
      const refRes = processRefund({
        paymentId: payRes.newPayment.id,
        amount: 300,
        status: 'Pending Approval',
      });

      expect(refRes.newRefund.status).toBe('Pending Approval');
      const inv = getInvoices().find((i) => i.id === 'INV-JOB24-PEND');
      expect(inv.paidAmount).toBe(1000);
      expect(inv.balanceDue).toBe(0);
      expect(inv.status).toBe('Paid');

      const payment = getPayments().find((p) => p.id === payRes.newPayment.id);
      expect(payment.refundedAmount).toBe(0);
      expect(payment.status).toBe('Completed');
    });

    it('9. Effective completed refund reduces effective paid and transitions invoice via updateRefundStatus', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-STATUS',
          invoiceNumber: 'INV-JOB24-STATUS',
          guestName: 'Status Transition Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-STATUS', { amount: 1000 });
      const refRes = processRefund({
        paymentId: payRes.newPayment.id,
        amount: 300,
        status: 'Pending Approval',
      });

      // Transition to Completed
      updateRefundStatus(refRes.newRefund.id, 'Completed');
      let inv = getInvoices().find((i) => i.id === 'INV-JOB24-STATUS');
      expect(inv.paidAmount).toBe(700);
      expect(inv.balanceDue).toBe(300);
      expect(inv.status).toBe('Partially Paid');

      let payment = getPayments().find((p) => p.id === payRes.newPayment.id);
      expect(payment.refundedAmount).toBe(300);
      expect(payment.status).toBe('Partially Refunded');

      // Revert from Completed to Rejected
      updateRefundStatus(refRes.newRefund.id, 'Rejected');
      inv = getInvoices().find((i) => i.id === 'INV-JOB24-STATUS');
      expect(inv.paidAmount).toBe(1000);
      expect(inv.balanceDue).toBe(0);
      expect(inv.status).toBe('Paid');

      payment = getPayments().find((p) => p.id === payRes.newPayment.id);
      expect(payment.refundedAmount).toBe(0);
      expect(payment.status).toBe('Completed');
    });

    it('10. Recalculates invoice effectivePaid and balanceDue correctly and verifies financial integrity', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-INTEG',
          invoiceNumber: 'INV-JOB24-INTEG',
          guestName: 'Integrity Check Guest',
          totalAmount: 2500,
          subtotal: 2500,
          paidAmount: 0,
          balanceDue: 2500,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 2500 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-INTEG', { amount: 2500 });
      processRefund({ paymentId: payRes.newPayment.id, amount: 500 });

      const state = getInvoiceFinancialState('INV-JOB24-INTEG');
      expect(state.integrity).toBe('verified');
      expect(state.effectivePaid).toBe(2000);
      expect(state.due).toBe(500);

      const inv = getInvoices().find((i) => i.id === 'INV-JOB24-INTEG');
      expect(inv.paidAmount).toBe(2000);
      expect(inv.balanceDue).toBe(500);
      expect(inv.status).toBe('Partially Paid');
    });

    it('11-13. Multiple payments on single invoice: refund against Payment A affects Payment A only and leaves Payment B intact', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-MULTIPLE-PAY',
          invoiceNumber: 'INV-JOB24-MULTIPLE-PAY',
          guestName: 'Two Payments Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 0,
          balanceDue: 10000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 10000 }],
          payments: [],
        },
      ]);
      const payA = recordInvoicePayment('INV-JOB24-MULTIPLE-PAY', { amount: 4000 });
      const payB = recordInvoicePayment('INV-JOB24-MULTIPLE-PAY', { amount: 6000 });

      let inv = getInvoices().find((i) => i.id === 'INV-JOB24-MULTIPLE-PAY');
      expect(inv.paidAmount).toBe(10000);
      expect(inv.balanceDue).toBe(0);
      expect(inv.status).toBe('Paid');

      // Refund $1,000 against Payment A
      processRefund({ paymentId: payA.newPayment.id, amount: 1000 });

      const pA = getPayments().find((p) => p.id === payA.newPayment.id);
      const pB = getPayments().find((p) => p.id === payB.newPayment.id);

      // Payment A is affected
      expect(pA.refundedAmount).toBe(1000);
      expect(pA.status).toBe('Partially Refunded');

      // Payment B remains completely intact
      expect(pB.amount).toBe(6000);
      expect(pB.refundedAmount).toBe(0);
      expect(pB.status).toBe('Completed');

      // Invoice balance combines all payments and refunds:
      // Gross payments = 10,000; Effective refunds = 1,000; Effective paid = 9,000; Balance due = 1,000
      inv = getInvoices().find((i) => i.id === 'INV-JOB24-MULTIPLE-PAY');
      expect(inv.paidAmount).toBe(9000);
      expect(inv.balanceDue).toBe(1000);
      expect(inv.status).toBe('Partially Paid');
    });

    it('14. Concurrency protection: two stale refund attempts cannot collectively exceed the available refundable amount', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-CONC',
          invoiceNumber: 'INV-JOB24-CONC',
          guestName: 'Concurrent Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 0,
          balanceDue: 10000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 10000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-CONC', { amount: 10000 });
      const paymentId = payRes.newPayment.id;

      // Two stale attempts for $6,000
      const attempt1 = processRefund({ paymentId, amount: 6000 });
      expect(attempt1.newRefund.status).toBe('Completed');

      // Second attempt must fail because only $4,000 remains refundable
      expect(() => {
        processRefund({ paymentId, amount: 6000 });
      }).toThrow(/Refund amount \$6000\.00 exceeds maximum refundable amount of \$4000\.00/i);
    });

    it('15-16. Post-checkout refund succeeds and does not mutate reservation lifecycle status', () => {
      const bookings = getReservations();
      const booking = {
        id: 'BK-JOB24-POSTCHECKOUT',
        guestId: 'GST-001',
        roomId: '101',
        status: 'Checked Out',
        checkIn: '2026-09-20',
        checkOut: '2026-09-22',
      };
      saveReservations([booking, ...bookings]);

      saveInvoices([
        {
          id: 'INV-JOB24-POSTCHECKOUT',
          invoiceNumber: 'INV-JOB24-POSTCHECKOUT',
          bookingId: booking.id,
          guestName: 'Post Checkout Guest',
          totalAmount: 500,
          subtotal: 500,
          paidAmount: 0,
          balanceDue: 500,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 500 }],
          payments: [],
        },
      ]);

      const payRes = recordInvoicePayment('INV-JOB24-POSTCHECKOUT', { amount: 500 });
      const refRes = processRefund({ paymentId: payRes.newPayment.id, amount: 200 });

      expect(refRes.newRefund.status).toBe('Completed');
      const inv = getInvoices().find((i) => i.id === 'INV-JOB24-POSTCHECKOUT');
      expect(inv.paidAmount).toBe(300);
      expect(inv.balanceDue).toBe(200);

      // Verify reservation lifecycle was NOT reverted to Checked In or modified
      const bPost = getReservations().find((b) => b.id === booking.id);
      expect(bPost.status).toBe('Checked Out');
    });

    it('17. Reservation cancellation does not automatically create refunds or mutate payments', () => {
      const bookings = getReservations();
      const booking = {
        id: 'BK-JOB24-CANCEL',
        guestId: 'GST-001',
        roomId: '102',
        status: 'Booked',
        checkIn: '2026-10-01',
        checkOut: '2026-10-05',
      };
      saveReservations([booking, ...bookings]);

      saveInvoices([
        {
          id: 'INV-JOB24-CANCEL',
          invoiceNumber: 'INV-JOB24-CANCEL',
          bookingId: booking.id,
          guestName: 'Cancel Guest',
          totalAmount: 800,
          subtotal: 800,
          paidAmount: 0,
          balanceDue: 800,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 800 }],
          payments: [],
        },
      ]);
      recordInvoicePayment('INV-JOB24-CANCEL', { amount: 400 });

      const refundsBefore = getRefunds();
      const cancelledBooking = cancelBooking(booking.id);
      expect(cancelledBooking.status).toBe('Cancelled');

      const refundsAfter = getRefunds();
      expect(refundsAfter.length).toBe(refundsBefore.length);
      const linkedRefunds = refundsAfter.filter((r) => r.bookingId === booking.id || r.invoiceId === 'INV-JOB24-CANCEL');
      expect(linkedRefunds.length).toBe(0);
    });

    it('18. Normal payment persistence records payment and invoice consistently', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-NORM-PAY',
          invoiceNumber: 'INV-JOB24-NORM-PAY',
          guestName: 'Normal Pay Guest',
          totalAmount: 750,
          subtotal: 750,
          paidAmount: 0,
          balanceDue: 750,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 750 }],
          payments: [],
        },
      ]);

      const res = recordInvoicePayment('INV-JOB24-NORM-PAY', { amount: 750 });
      expect(res.newPayment.amount).toBe(750);
      expect(res.updatedInvoice.paidAmount).toBe(750);
      expect(res.updatedInvoice.balanceDue).toBe(0);
      expect(res.updatedInvoice.status).toBe('Paid');
    });

    it('19. Payment persistence safety: storage write failure cleanly rolls back snapshots and throws error', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-ROLLBACK-PAY',
          invoiceNumber: 'INV-JOB24-ROLLBACK-PAY',
          guestName: 'Rollback Pay Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [],
        },
      ]);

      const beforeInvoicesRaw = localStorage.getItem('hm_invoices_v2');
      const beforePaymentsRaw = localStorage.getItem('hm_payments_v2');

      let throwOnPayments = true;
      const realSetItem = Storage.prototype.setItem;
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
        if (key === 'hm_payments_v2' && throwOnPayments) {
          throwOnPayments = false;
          throw new Error('Simulated QuotaExceededError');
        }
        return realSetItem.call(this, key, value);
      });

      try {
        expect(() => {
          recordInvoicePayment('INV-JOB24-ROLLBACK-PAY', { amount: 500 });
        }).toThrow(/Payment persistence failed and was rolled back/);

        // Verify pre-operation snapshots were restored cleanly
        expect(localStorage.getItem('hm_invoices_v2')).toBe(beforeInvoicesRaw);
        expect(localStorage.getItem('hm_payments_v2')).toBe(beforePaymentsRaw);

        const inv = getInvoices().find((i) => i.id === 'INV-JOB24-ROLLBACK-PAY');
        expect(inv.paidAmount).toBe(0);
        expect(inv.balanceDue).toBe(1000);
      } finally {
        spy.mockRestore();
      }
    });

    it('20. Refund persistence safety: storage write failure cleanly rolls back snapshots and throws error', () => {
      saveInvoices([
        {
          id: 'INV-JOB24-ROLLBACK-REF',
          invoiceNumber: 'INV-JOB24-ROLLBACK-REF',
          guestName: 'Rollback Ref Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 1000 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-ROLLBACK-REF', { amount: 1000 });

      const beforeRefundsRaw = localStorage.getItem('hm_refunds_v2');
      const beforePaymentsRaw = localStorage.getItem('hm_payments_v2');
      const beforeInvoicesRaw = localStorage.getItem('hm_invoices_v2');

      let throwOnInvoices = true;
      const realSetItem = Storage.prototype.setItem;
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
        if (key === 'hm_invoices_v2' && throwOnInvoices) {
          throwOnInvoices = false;
          throw new Error('Simulated Storage Failure');
        }
        return realSetItem.call(this, key, value);
      });

      try {
        expect(() => {
          processRefund({ paymentId: payRes.newPayment.id, amount: 500 });
        }).toThrow(/Refund persistence failed and was rolled back/);

        // Verify pre-operation snapshots were restored cleanly
        expect(localStorage.getItem('hm_refunds_v2')).toBe(beforeRefundsRaw);
        expect(localStorage.getItem('hm_payments_v2')).toBe(beforePaymentsRaw);
        expect(localStorage.getItem('hm_invoices_v2')).toBe(beforeInvoicesRaw);

        const payment = getPayments().find((p) => p.id === payRes.newPayment.id);
        expect(payment.refundedAmount).toBe(0);
        expect(payment.status).toBe('Completed');

        const inv = getInvoices().find((i) => i.id === 'INV-JOB24-ROLLBACK-REF');
        expect(inv.paidAmount).toBe(1000);
        expect(inv.balanceDue).toBe(0);
        expect(inv.status).toBe('Paid');
      } finally {
        spy.mockRestore();
      }
    });

    it('UI Real-Flow Test: Open payment -> Record payment -> Open refund modal -> Select payment -> Enter refund amount -> Confirm -> Verify persisted refund & invoice balance', async () => {
      // 1. Setup invoice
      const invoiceData = {
        id: 'INV-JOB24-REALFLOW',
        invoiceNumber: 'INV-JOB24-REALFLOW',
        guestName: 'Realflow Guest',
        totalAmount: 1000,
        subtotal: 1000,
        paidAmount: 0,
        balanceDue: 1000,
        status: 'Unpaid',
        items: [{ description: 'Stay', amount: 1000 }],
        payments: [],
      };
      saveInvoices([invoiceData]);

      // 2. Open payment modal and record payment
      let payClosed = false;
      const handleRecord = (paymentData) => {
        recordInvoicePayment(paymentData);
      };

      const payModal = render(
        <RecordPaymentModal
          open={true}
          invoice={invoiceData}
          invoices={[invoiceData]}
          onRecordPayment={handleRecord}
          onClose={() => { payClosed = true; }}
        />
      );

      const payAmountInput = payModal.getByLabelText(/payment amount/i);
      fireEvent.change(payAmountInput, { target: { value: '1000' } });

      const confirmPayBtn = payModal.getByRole('button', { name: /confirm & record payment/i });
      fireEvent.click(confirmPayBtn);

      await waitFor(() => expect(payClosed).toBe(true));

      // Verify payment was recorded in store
      const paidInvoice = getInvoices().find((i) => i.id === 'INV-JOB24-REALFLOW');
      expect(paidInvoice.paidAmount).toBe(1000);
      expect(paidInvoice.status).toBe('Paid');

      const payments = getPayments().filter((p) => p.invoiceId === 'INV-JOB24-REALFLOW');
      expect(payments.length).toBe(1);
      const recordedPayment = payments[0];
      expect(recordedPayment.amount).toBe(1000);

      payModal.unmount();

      // 3. Open ProcessRefundModal with the recorded payment
      let refundClosed = false;
      const handleRefund = (refundData) => {
        processRefund(refundData);
      };

      const refModal = render(
        <ProcessRefundModal
          open={true}
          payment={recordedPayment}
          payments={payments}
          onProcessRefund={handleRefund}
          onClose={() => { refundClosed = true; }}
        />
      );

      // Verify payment ID is displayed in modal
      expect(refModal.getByText(recordedPayment.id)).toBeDefined();

      // Enter partial refund amount of $400
      const refAmountInput = refModal.getByLabelText(/refund amount/i);
      fireEvent.change(refAmountInput, { target: { value: '400' } });

      // Click Confirm & Issue Refund
      const confirmRefBtn = refModal.getByRole('button', { name: /confirm & issue refund/i });
      fireEvent.click(confirmRefBtn);

      await waitFor(() => expect(refundClosed).toBe(true));

      // 4. Verify persisted refund
      const refunds = getRefunds().filter((r) => r.paymentId === recordedPayment.id);
      expect(refunds.length).toBe(1);
      expect(refunds[0].amount).toBe(400);
      expect(refunds[0].status).toBe('Completed');

      // 5. Verify updated invoice balance
      const postInv = getInvoices().find((i) => i.id === 'INV-JOB24-REALFLOW');
      expect(postInv.paidAmount).toBe(600);
      expect(postInv.balanceDue).toBe(400);
      expect(postInv.status).toBe('Partially Paid');

      // 6. Verify payment state
      const postPayment = getPayments().find((p) => p.id === recordedPayment.id);
      expect(postPayment.refundedAmount).toBe(400);
      expect(postPayment.status).toBe('Partially Refunded');

      refModal.unmount();
    });

    it('UI Failure Safety: ProcessRefundModal displays error and remains open upon invalid submission', async () => {
      saveInvoices([
        {
          id: 'INV-JOB24-UI-FAIL',
          invoiceNumber: 'INV-JOB24-UI-FAIL',
          guestName: 'UI Fail Guest',
          totalAmount: 500,
          subtotal: 500,
          paidAmount: 0,
          balanceDue: 500,
          status: 'Unpaid',
          items: [{ description: 'Stay', amount: 500 }],
          payments: [],
        },
      ]);
      const payRes = recordInvoicePayment('INV-JOB24-UI-FAIL', { amount: 500 });
      let refundClosed = false;

      const refModal = render(
        <ProcessRefundModal
          open={true}
          payment={payRes.newPayment}
          onProcessRefund={(data) => processRefund(data)}
          onClose={() => { refundClosed = true; }}
        />
      );

      // Attempt to enter amount exceeding max refundable
      const refAmountInput = refModal.getByLabelText(/refund amount/i);
      fireEvent.change(refAmountInput, { target: { value: '999' } });

      const confirmRefBtn = refModal.getByRole('button', { name: /confirm & issue refund/i });
      // Button is disabled on the client side
      expect(confirmRefBtn.disabled).toBe(true);

      // Submitting the form directly triggers the validation check and displays the error alert
      const form = document.querySelector('form');
      fireEvent.submit(form);

      // Error message should appear in modal
      await waitFor(() => {
        expect(refModal.getByText(/exceed/i)).toBeDefined();
      });

      // Modal must NOT have closed
      expect(refundClosed).toBe(false);

      refModal.unmount();
    });
  });
  // 13. Phase 7 Job 25: Financial Integrity Audit + Safe Derived-State Reconciliation
  describe('Phase 7 Job 25: Financial Integrity Audit + Safe Derived-State Reconciliation', () => {
    it('A. Correct invoice: canonical ledger and invoice agree, producing no discrepancy and zero mutation', () => {
      saveInvoices([
        {
          id: 'INV-JOB25-CORRECT',
          invoiceNumber: 'INV-JOB25-CORRECT',
          guestName: 'Correct Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          payments: [],
        },
      ]);
      recordInvoicePayment('INV-JOB25-CORRECT', { amount: 600 });
      const auditBefore = auditFinancialIntegrity();
      const invAudit = auditBefore.invoices.find((i) => i.id === 'INV-JOB25-CORRECT');
      expect(invAudit.isConsistent).toBe(true);
      expect(invAudit.hasDiscrepancies).toBe(false);
      expect(invAudit.canAutoReconcile).toBe(false); // Consistent invoices require no repair

      const reconRes = reconcileDerivedInvoiceFinancialState('INV-JOB25-CORRECT');
      expect(reconRes.success).toBe(true);
      expect(reconRes.modified).toBe(false);
      expect(reconRes.reason).toMatch(/already consistent/i);
    });

    it('B. Incorrect paidAmount: audit detects discrepancy and reconciliation repairs paidAmount to match canonical ledger', () => {
      // Payment = 10,000, Refund = 2,000 -> Effective paid = 8,000; Stored invoice paidAmount = 7,000
      saveInvoices([
        {
          id: 'INV-JOB25-PAID',
          invoiceNumber: 'INV-JOB25-PAID',
          guestName: 'Drift Paid Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 7000, // Discrepancy!
          balanceDue: 2000,
          status: 'Partially Paid',
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-B1',
          paymentId: 'PAY-JOB25-B1',
          invoiceId: 'INV-JOB25-PAID',
          amount: 10000,
          refundedAmount: 2000,
          status: 'Partially Refunded',
        },
      ]);
      saveRefunds([
        {
          id: 'REF-JOB25-B1',
          refundId: 'REF-JOB25-B1',
          paymentId: 'PAY-JOB25-B1',
          invoiceId: 'INV-JOB25-PAID',
          amount: 2000,
          status: 'Completed',
        },
      ]);

      const audit = auditFinancialIntegrity();
      const invAudit = audit.invoices.find((i) => i.id === 'INV-JOB25-PAID');
      expect(invAudit.hasDiscrepancies).toBe(true);
      expect(invAudit.storedPaidAmount).toBe(7000);
      expect(invAudit.canonicalPaidAmount).toBe(8000);
      expect(invAudit.canAutoReconcile).toBe(true);

      const recon = reconcileDerivedInvoiceFinancialState('INV-JOB25-PAID');
      expect(recon.success).toBe(true);
      expect(recon.modified).toBe(true);
      expect(recon.repairedFields.paidAmount).toEqual({ from: 7000, to: 8000 });

      const updatedInv = getInvoices().find((i) => i.id === 'INV-JOB25-PAID');
      expect(updatedInv.paidAmount).toBe(8000);
    });

    it('C. Incorrect balanceDue: audit detects discrepancy and repairs balanceDue deterministically from canonical ledger', () => {
      // Total = 10,000, Effective paid = 8,000 -> Canonical balanceDue = 2,000; Stored balanceDue = 1,000
      saveInvoices([
        {
          id: 'INV-JOB25-BAL',
          invoiceNumber: 'INV-JOB25-BAL',
          guestName: 'Drift Balance Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 8000,
          balanceDue: 1000, // Discrepancy!
          status: 'Partially Paid',
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-C1',
          paymentId: 'PAY-JOB25-C1',
          invoiceId: 'INV-JOB25-BAL',
          amount: 8000,
          refundedAmount: 0,
          status: 'Completed',
        },
      ]);

      const audit = auditFinancialIntegrity();
      const invAudit = audit.invoices.find((i) => i.id === 'INV-JOB25-BAL');
      expect(invAudit.hasDiscrepancies).toBe(true);
      expect(invAudit.storedBalanceDue).toBe(1000);
      expect(invAudit.canonicalBalanceDue).toBe(2000);

      const recon = reconcileDerivedInvoiceFinancialState('INV-JOB25-BAL');
      expect(recon.success).toBe(true);
      expect(recon.modified).toBe(true);
      expect(recon.repairedFields.balanceDue).toEqual({ from: 1000, to: 2000 });

      const updatedInv = getInvoices().find((i) => i.id === 'INV-JOB25-BAL');
      expect(updatedInv.balanceDue).toBe(2000);
    });

    it('D. Incorrect invoice status: audit detects status mismatch and repairs status according to canonical rules', () => {
      // Total = 10,000, Payment = 10,000, balanceDue = 0 -> Canonical status = "Paid"; Stored status = "Partially Paid"
      saveInvoices([
        {
          id: 'INV-JOB25-STATUS',
          invoiceNumber: 'INV-JOB25-STATUS',
          guestName: 'Drift Status Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 10000,
          balanceDue: 0,
          status: 'Partially Paid', // Discrepancy!
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-D1',
          paymentId: 'PAY-JOB25-D1',
          invoiceId: 'INV-JOB25-STATUS',
          amount: 10000,
          refundedAmount: 0,
          status: 'Completed',
        },
      ]);

      const audit = auditFinancialIntegrity();
      const invAudit = audit.invoices.find((i) => i.id === 'INV-JOB25-STATUS');
      expect(invAudit.hasDiscrepancies).toBe(true);
      expect(invAudit.storedStatus).toBe('Partially Paid');
      expect(invAudit.canonicalStatus).toBe('Paid');

      const recon = reconcileDerivedInvoiceFinancialState('INV-JOB25-STATUS');
      expect(recon.success).toBe(true);
      expect(recon.modified).toBe(true);
      expect(recon.repairedFields.status).toEqual({ from: 'Partially Paid', to: 'Paid' });

      const updatedInv = getInvoices().find((i) => i.id === 'INV-JOB25-STATUS');
      expect(updatedInv.status).toBe('Paid');
    });

    it('E. Multiple payments: reconciliation calculates effective paid and balance across all payments in ledger', () => {
      // Invoice = 10,000; Payment A = 4,000, Payment B = 6,000, Refund A = 1,000 -> Effective paid = 9,000, due = 1,000
      saveInvoices([
        {
          id: 'INV-JOB25-MULTI-PAY',
          invoiceNumber: 'INV-JOB25-MULTI-PAY',
          guestName: 'Multi Pay Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 5000, // Discrepancy!
          balanceDue: 5000, // Discrepancy!
          status: 'Partially Paid',
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-E1',
          paymentId: 'PAY-JOB25-E1',
          invoiceId: 'INV-JOB25-MULTI-PAY',
          amount: 4000,
          refundedAmount: 1000,
          status: 'Partially Refunded',
        },
        {
          id: 'PAY-JOB25-E2',
          paymentId: 'PAY-JOB25-E2',
          invoiceId: 'INV-JOB25-MULTI-PAY',
          amount: 6000,
          refundedAmount: 0,
          status: 'Completed',
        },
      ]);
      saveRefunds([
        {
          id: 'REF-JOB25-E1',
          refundId: 'REF-JOB25-E1',
          paymentId: 'PAY-JOB25-E1',
          invoiceId: 'INV-JOB25-MULTI-PAY',
          amount: 1000,
          status: 'Completed',
        },
      ]);

      const audit = auditFinancialIntegrity();
      const invAudit = audit.invoices.find((i) => i.id === 'INV-JOB25-MULTI-PAY');
      expect(invAudit.canonicalPaidAmount).toBe(9000);
      expect(invAudit.canonicalBalanceDue).toBe(1000);
      expect(invAudit.canonicalStatus).toBe('Partially Paid');

      const recon = reconcileDerivedInvoiceFinancialState('INV-JOB25-MULTI-PAY');
      expect(recon.success).toBe(true);
      expect(recon.modified).toBe(true);

      const updatedInv = getInvoices().find((i) => i.id === 'INV-JOB25-MULTI-PAY');
      expect(updatedInv.paidAmount).toBe(9000);
      expect(updatedInv.balanceDue).toBe(1000);
    });

    it('F. Partial refunds: reconciliation properly combines multiple partial refunds against payments', () => {
      // Invoice = 10,000; Payment = 10,000; Refund 1 = 2,500, Refund 2 = 3,000 -> Effective paid = 4,500, due = 5,500
      saveInvoices([
        {
          id: 'INV-JOB25-PART-REF',
          invoiceNumber: 'INV-JOB25-PART-REF',
          guestName: 'Part Ref Guest',
          totalAmount: 10000,
          subtotal: 10000,
          paidAmount: 10000, // Discrepancy!
          balanceDue: 0,     // Discrepancy!
          status: 'Paid',   // Discrepancy!
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-F1',
          paymentId: 'PAY-JOB25-F1',
          invoiceId: 'INV-JOB25-PART-REF',
          amount: 10000,
          refundedAmount: 5500,
          status: 'Partially Refunded',
        },
      ]);
      saveRefunds([
        {
          id: 'REF-JOB25-F1',
          refundId: 'REF-JOB25-F1',
          paymentId: 'PAY-JOB25-F1',
          invoiceId: 'INV-JOB25-PART-REF',
          amount: 2500,
          status: 'Completed',
        },
        {
          id: 'REF-JOB25-F2',
          refundId: 'REF-JOB25-F2',
          paymentId: 'PAY-JOB25-F1',
          invoiceId: 'INV-JOB25-PART-REF',
          amount: 3000,
          status: 'Completed',
        },
      ]);

      const recon = reconcileDerivedInvoiceFinancialState('INV-JOB25-PART-REF');
      expect(recon.success).toBe(true);
      expect(recon.modified).toBe(true);

      const updatedInv = getInvoices().find((i) => i.id === 'INV-JOB25-PART-REF');
      expect(updatedInv.paidAmount).toBe(4500);
      expect(updatedInv.balanceDue).toBe(5500);
      expect(updatedInv.status).toBe('Partially Paid');
    });

    it('G. Pending/rejected refunds: audit and reconciliation ignore non-effective refunds when calculating effective paid', () => {
      // Invoice = 1000, Payment = 1000; Refund 1 = 200 (Pending), Refund 2 = 300 (Rejected)
      // Effective paid remains 1000, balanceDue = 0, status = "Paid"
      saveInvoices([
        {
          id: 'INV-JOB25-PEND-REF',
          invoiceNumber: 'INV-JOB25-PEND-REF',
          guestName: 'Pending Ref Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 500, // Discrepancy!
          balanceDue: 500, // Discrepancy!
          status: 'Partially Paid', // Discrepancy!
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-G1',
          paymentId: 'PAY-JOB25-G1',
          invoiceId: 'INV-JOB25-PEND-REF',
          amount: 1000,
          refundedAmount: 0,
          status: 'Completed',
        },
      ]);
      saveRefunds([
        {
          id: 'REF-JOB25-G1',
          refundId: 'REF-JOB25-G1',
          paymentId: 'PAY-JOB25-G1',
          invoiceId: 'INV-JOB25-PEND-REF',
          amount: 200,
          status: 'Pending Approval',
        },
        {
          id: 'REF-JOB25-G2',
          refundId: 'REF-JOB25-G2',
          paymentId: 'PAY-JOB25-G1',
          invoiceId: 'INV-JOB25-PEND-REF',
          amount: 300,
          status: 'Rejected',
        },
      ]);

      const audit = auditFinancialIntegrity();
      const invAudit = audit.invoices.find((i) => i.id === 'INV-JOB25-PEND-REF');
      expect(invAudit.canonicalPaidAmount).toBe(1000);
      expect(invAudit.canonicalBalanceDue).toBe(0);
      expect(invAudit.canonicalStatus).toBe('Paid');

      const recon = reconcileDerivedInvoiceFinancialState('INV-JOB25-PEND-REF');
      expect(recon.success).toBe(true);
      expect(recon.modified).toBe(true);

      const updatedInv = getInvoices().find((i) => i.id === 'INV-JOB25-PEND-REF');
      expect(updatedInv.paidAmount).toBe(1000);
      expect(updatedInv.balanceDue).toBe(0);
      expect(updatedInv.status).toBe('Paid');
    });

    it('H. Orphan refund: audit detects reference to nonexistent payment and refuses automatic repair', () => {
      saveInvoices([
        {
          id: 'INV-JOB25-ORPHAN-R',
          invoiceNumber: 'INV-JOB25-ORPHAN-R',
          guestName: 'Orphan Ref Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 500,
          balanceDue: 500,
          status: 'Partially Paid',
          payments: [],
        },
      ]);
      savePayments([]);
      saveRefunds([
        {
          id: 'REF-JOB25-H1',
          refundId: 'REF-JOB25-H1',
          paymentId: 'PAY-DOES-NOT-EXIST',
          invoiceId: 'INV-JOB25-ORPHAN-R',
          amount: 250,
          status: 'Completed',
        },
      ]);

      const audit = auditFinancialIntegrity();
      expect(audit.summary.isClean).toBe(false);
      const orphanRefundAudit = audit.refunds.find((r) => r.id === 'REF-JOB25-H1');
      expect(orphanRefundAudit.isOrphan).toBe(true);
      expect(orphanRefundAudit.discrepancies.some((d) => d.includes('nonexistent payment'))).toBe(true);

      const orphanAmbiguity = audit.ambiguities.find((a) => a.type === 'ORPHAN_REFUND');
      expect(orphanAmbiguity).toBeDefined();

      // Verify safe reconciliation does NOT delete or alter the orphan refund
      const refundsBefore = getRefunds();
      reconcileDerivedInvoiceFinancialState('INV-JOB25-ORPHAN-R');
      const refundsAfter = getRefunds();
      expect(refundsAfter.length).toBe(refundsBefore.length);
      expect(refundsAfter[0].id).toBe('REF-JOB25-H1');
    });

    it('I. Cross-invoice refund corruption: audit flags conflicting invoice links and refuses automatic repair', () => {
      saveInvoices([
        {
          id: 'INV-JOB25-I-A',
          invoiceNumber: 'INV-JOB25-I-A',
          guestName: 'Cross Invoice Guest A',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 1000,
          balanceDue: 0,
          status: 'Paid',
          payments: [],
        },
        {
          id: 'INV-JOB25-I-B',
          invoiceNumber: 'INV-JOB25-I-B',
          guestName: 'Cross Invoice Guest B',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-I1',
          paymentId: 'PAY-JOB25-I1',
          invoiceId: 'INV-JOB25-I-A',
          amount: 1000,
          refundedAmount: 200,
          status: 'Partially Refunded',
        },
      ]);
      // Refund claims to belong to Invoice B, but linked payment belongs to Invoice A!
      saveRefunds([
        {
          id: 'REF-JOB25-I1',
          refundId: 'REF-JOB25-I1',
          paymentId: 'PAY-JOB25-I1',
          invoiceId: 'INV-JOB25-I-B',
          amount: 200,
          status: 'Completed',
        },
      ]);

      const audit = auditFinancialIntegrity();
      expect(audit.summary.isClean).toBe(false);
      const crossAmbiguity = audit.ambiguities.find((a) => a.type === 'CROSS_INVOICE_REFUND');
      expect(crossAmbiguity).toBeDefined();

      const invAuditA = audit.invoices.find((i) => i.id === 'INV-JOB25-I-A');
      expect(invAuditA.canAutoReconcile).toBe(false);

      const reconA = reconcileDerivedInvoiceFinancialState('INV-JOB25-I-A');
      expect(reconA.success).toBe(false);
      expect(reconA.reason).toMatch(/cannot be safely auto-reconciled/i);
    });

    it('J. Multiple invoices: audit detects ambiguous booking invoices and refuses automatic selection or repair', () => {
      saveInvoices([
        {
          id: 'INV-JOB25-DUP-1',
          invoiceNumber: 'INV-JOB25-DUP-1',
          bookingId: 'BK-AMBIGUOUS-JOB25',
          guestName: 'Ambiguous Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 500,
          balanceDue: 500,
          status: 'Partially Paid',
          payments: [],
        },
        {
          id: 'INV-JOB25-DUP-2',
          invoiceNumber: 'INV-JOB25-DUP-2',
          bookingId: 'BK-AMBIGUOUS-JOB25',
          guestName: 'Ambiguous Guest',
          totalAmount: 1200,
          subtotal: 1200,
          paidAmount: 0,
          balanceDue: 1200,
          status: 'Unpaid',
          payments: [],
        },
      ]);

      const audit = auditFinancialIntegrity();
      const multiAmbiguity = audit.ambiguities.find((a) => a.type === 'MULTIPLE_INVOICES_FOR_BOOKING');
      expect(multiAmbiguity).toBeDefined();
      expect(multiAmbiguity.entityId).toBe('BK-AMBIGUOUS-JOB25');

      const invAudit1 = audit.invoices.find((i) => i.id === 'INV-JOB25-DUP-1');
      const invAudit2 = audit.invoices.find((i) => i.id === 'INV-JOB25-DUP-2');
      expect(invAudit1.canAutoReconcile).toBe(false);
      expect(invAudit2.canAutoReconcile).toBe(false);

      // Both should fail auto-reconcile safely
      const recon1 = reconcileDerivedInvoiceFinancialState('INV-JOB25-DUP-1');
      expect(recon1.success).toBe(false);
      expect(recon1.reason).toMatch(/multiple linked invoices/i);

      // Invoices must NOT be deleted or guessed
      const currentInvoices = getInvoices();
      expect(currentInvoices.filter((i) => i.bookingId === 'BK-AMBIGUOUS-JOB25').length).toBe(2);
    });

    it('K. Idempotency: running reconciliation repeatedly produces no additional mutations or duplicate records', () => {
      saveInvoices([
        {
          id: 'INV-JOB25-IDEM',
          invoiceNumber: 'INV-JOB25-IDEM',
          guestName: 'Idempotency Guest',
          totalAmount: 5000,
          subtotal: 5000,
          paidAmount: 2000, // Discrepancy! (Actual payments = 3,000)
          balanceDue: 3000,
          status: 'Partially Paid',
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-K1',
          paymentId: 'PAY-JOB25-K1',
          invoiceId: 'INV-JOB25-IDEM',
          amount: 3000,
          refundedAmount: 0,
          status: 'Completed',
        },
      ]);

      // First run: repairs paidAmount to 3000, balanceDue to 2000
      const firstRun = reconcileDerivedInvoiceFinancialState('INV-JOB25-IDEM');
      expect(firstRun.success).toBe(true);
      expect(firstRun.modified).toBe(true);

      // Second run: no further modification
      const secondRun = reconcileDerivedInvoiceFinancialState('INV-JOB25-IDEM');
      expect(secondRun.success).toBe(true);
      expect(secondRun.modified).toBe(false);
      expect(secondRun.reason).toMatch(/already consistent/i);

      // Batch reconciliation idempotency
      const batchRun1 = reconcileAllDerivedInvoiceFinancialStates();
      expect(batchRun1.repairedCount).toBe(0);
      expect(batchRun1.modified).toBe(false);
    });

    it('L. Malformed financial data: audit reports malformed records without inventing or deleting records', () => {
      saveInvoices([
        {
          id: 'INV-JOB25-MALFORMED',
          invoiceNumber: 'INV-JOB25-MALFORMED',
          guestName: 'Malformed Guest',
          totalAmount: 'NOT_A_NUMBER', // Malformed!
          paidAmount: 0,
          balanceDue: 0,
          status: 'Unpaid',
          payments: [],
        },
      ]);
      savePayments([
        {
          id: 'PAY-JOB25-MALFORMED',
          paymentId: 'PAY-JOB25-MALFORMED',
          invoiceId: 'INV-JOB25-MALFORMED',
          amount: -500, // Invalid negative amount!
          status: 'Completed',
        },
      ]);

      const audit = auditFinancialIntegrity();
      expect(audit.summary.isClean).toBe(false);
      const malformedAmbiguity = audit.ambiguities.find((a) => a.type === 'MALFORMED_RECORD');
      expect(malformedAmbiguity).toBeDefined();

      const payAudit = audit.payments.find((p) => p.id === 'PAY-JOB25-MALFORMED');
      expect(payAudit.discrepancies.some((d) => d.includes('greater than 0'))).toBe(true);

      // Verify records are preserved as-is without destructive cleanup
      expect(getInvoices().some((i) => i.id === 'INV-JOB25-MALFORMED')).toBe(true);
      expect(getPayments().some((p) => p.id === 'PAY-JOB25-MALFORMED')).toBe(true);
    });

    it('M. Audit-log failure regression: failure to write secondary audit log does not fail core financial payment or refund', () => {
      saveInvoices([
        {
          id: 'INV-JOB25-AUDIT-FAIL',
          invoiceNumber: 'INV-JOB25-AUDIT-FAIL',
          guestName: 'Audit Fail Guest',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          payments: [],
        },
      ]);

      // Mock localStorage to simulate audit log write failure
      const realSetItem = Storage.prototype.setItem;
      let auditWriteIntercepted = false;
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
        if (key.includes('audit')) {
          auditWriteIntercepted = true;
          throw new Error('Audit storage quota exceeded!');
        }
        return realSetItem.call(this, key, value);
      });

      try {
        // 1. Payment recording must succeed despite audit log failure
        const payRes = recordInvoicePayment('INV-JOB25-AUDIT-FAIL', { amount: 600 });
        expect(payRes.newPayment.amount).toBe(600);
        expect(payRes.updatedInvoice.paidAmount).toBe(600);
        expect(payRes.updatedInvoice.balanceDue).toBe(400);

        // 2. Refund processing must succeed despite audit log failure
        const refRes = processRefund({
          paymentId: payRes.newPayment.id,
          amount: 200,
        });
        expect(refRes.newRefund.amount).toBe(200);
        expect(refRes.newRefund.status).toBe('Completed');

        // 3. Refund status update must succeed despite audit log failure
        const statusRes = updateRefundStatus(refRes.newRefund.id, 'Rejected');
        expect(statusRes.find((r) => r.id === refRes.newRefund.id).status).toBe('Rejected');

        expect(auditWriteIntercepted).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });

    it('N. Batch reconciliation: repairs multiple eligible invoices in a single pass while preserving untouched invoices', () => {
      saveInvoices([
        {
          id: 'INV-JOB25-BATCH-1',
          invoiceNumber: 'INV-JOB25-BATCH-1',
          guestName: 'Batch Guest 1',
          totalAmount: 2000,
          subtotal: 2000,
          paidAmount: 1000, // Discrepancy: actual paid is 2,000
          balanceDue: 1000, // Discrepancy: actual balance is 0
          status: 'Partially Paid', // Discrepancy: actual status is Paid
          payments: [],
        },
        {
          id: 'INV-JOB25-BATCH-2',
          invoiceNumber: 'INV-JOB25-BATCH-2',
          guestName: 'Batch Guest 2',
          totalAmount: 3000,
          subtotal: 3000,
          paidAmount: 500, // Discrepancy: actual paid is 1,500
          balanceDue: 2500, // Discrepancy: actual balance is 1,500
          status: 'Partially Paid',
          payments: [],
        },
        {
          id: 'INV-JOB25-BATCH-3',
          invoiceNumber: 'INV-JOB25-BATCH-3',
          guestName: 'Batch Guest 3 (Clean)',
          totalAmount: 1000,
          subtotal: 1000,
          paidAmount: 0,
          balanceDue: 1000,
          status: 'Unpaid',
          payments: [],
        },
      ]);

      savePayments([
        {
          id: 'PAY-JOB25-BATCH-1',
          paymentId: 'PAY-JOB25-BATCH-1',
          invoiceId: 'INV-JOB25-BATCH-1',
          amount: 2000,
          refundedAmount: 0,
          status: 'Completed',
        },
        {
          id: 'PAY-JOB25-BATCH-2',
          paymentId: 'PAY-JOB25-BATCH-2',
          invoiceId: 'INV-JOB25-BATCH-2',
          amount: 1500,
          refundedAmount: 0,
          status: 'Completed',
        },
      ]);

      const batchRes = reconcileAllDerivedInvoiceFinancialStates();
      expect(batchRes.success).toBe(true);
      expect(batchRes.repairedCount).toBe(2);

      const inv1 = getInvoices().find((i) => i.id === 'INV-JOB25-BATCH-1');
      expect(inv1.paidAmount).toBe(2000);
      expect(inv1.balanceDue).toBe(0);
      expect(inv1.status).toBe('Paid');

      const inv2 = getInvoices().find((i) => i.id === 'INV-JOB25-BATCH-2');
      expect(inv2.paidAmount).toBe(1500);
      expect(inv2.balanceDue).toBe(1500);
      expect(inv2.status).toBe('Partially Paid');

      const inv3 = getInvoices().find((i) => i.id === 'INV-JOB25-BATCH-3');
      expect(inv3.paidAmount).toBe(0);
      expect(inv3.balanceDue).toBe(1000);
      expect(inv3.status).toBe('Unpaid');
    });
  });

  describe('Canonical Billing Event Propagation (Job 23)', () => {
    it('dispatches INVOICES_UPDATED_EVENT on successful invoice creation and updates', () => {
      const invoiceListener = vi.fn();
      window.addEventListener(INVOICES_UPDATED_EVENT, invoiceListener);

      // A. Invoice mutation via addInvoice
      addInvoice({
        guestName: 'Jane EventTest',
        bookingId: 'BK-EVENT-1',
        totalAmount: 500,
        subtotal: 500,
      });

      expect(invoiceListener).toHaveBeenCalledTimes(1);
      const event = invoiceListener.mock.calls[0][0];
      expect(event.type).toBe('invoices_update');
      expect(event.detail.domain).toBe('invoices');
      expect(event.detail.action).toBe('create');
      expect(event.detail.bookingId).toBe('BK-EVENT-1');
      expect(event.detail.invoiceId).toMatch(/^INV-2026-/);

      // Invoice mutation via getOrCreateBookingInvoice
      saveReservations([{
        id: 'BK-STAY-EVENT',
        roomId: 2,
        status: 'Booked',
        checkIn: '2026-10-01',
        checkOut: '2026-10-03',
        name: 'Stay Guest',
      }]);
      const stayInvRes = getOrCreateBookingInvoice('BK-STAY-EVENT');
      expect(stayInvRes.success).toBe(true);
      expect(invoiceListener).toHaveBeenCalledTimes(2);
      expect(invoiceListener.mock.calls[1][0].detail.action).toBe('create_stay_invoice');
      expect(invoiceListener.mock.calls[1][0].detail.bookingId).toBe('BK-STAY-EVENT');

      window.removeEventListener(INVOICES_UPDATED_EVENT, invoiceListener);
    });

    it('dispatches PAYMENTS_UPDATED_EVENT and INVOICES_UPDATED_EVENT on successful payment', () => {
      const [testInvoice] = addInvoice({
        guestName: 'Pay Event Guest',
        bookingId: 'BK-PAY-EVENT',
        totalAmount: 400,
        subtotal: 400,
      });

      const paymentListener = vi.fn();
      const invoiceListener = vi.fn();
      window.addEventListener(PAYMENTS_UPDATED_EVENT, paymentListener);
      window.addEventListener(INVOICES_UPDATED_EVENT, invoiceListener);

      // B. Payment mutation via recordInvoicePayment
      const res = recordInvoicePayment({
        invoiceId: testInvoice.id,
        amount: 100,
        paymentMethod: 'Credit Card',
      });

      expect(paymentListener).toHaveBeenCalledTimes(1);
      expect(invoiceListener).toHaveBeenCalledTimes(1);

      const pEvent = paymentListener.mock.calls[0][0];
      expect(pEvent.type).toBe('payments_update');
      expect(pEvent.detail.domain).toBe('payments');
      expect(pEvent.detail.action).toBe('record_payment');
      expect(pEvent.detail.paymentId).toBe(res.newPayment.id);
      expect(pEvent.detail.invoiceId).toBe(testInvoice.id);
      expect(pEvent.detail.amount).toBe(100);

      const iEvent = invoiceListener.mock.calls[0][0];
      expect(iEvent.type).toBe('invoices_update');
      expect(iEvent.detail.domain).toBe('invoices');
      expect(iEvent.detail.action).toBe('record_payment');
      expect(iEvent.detail.invoiceId).toBe(testInvoice.id);

      window.removeEventListener(PAYMENTS_UPDATED_EVENT, paymentListener);
      window.removeEventListener(INVOICES_UPDATED_EVENT, invoiceListener);
    });

    it('dispatches REFUNDS_UPDATED_EVENT, PAYMENTS_UPDATED_EVENT, and INVOICES_UPDATED_EVENT on successful refund', () => {
      const refundListener = vi.fn();
      const paymentListener = vi.fn();
      const invoiceListener = vi.fn();
      window.addEventListener(REFUNDS_UPDATED_EVENT, refundListener);
      window.addEventListener(PAYMENTS_UPDATED_EVENT, paymentListener);
      window.addEventListener(INVOICES_UPDATED_EVENT, invoiceListener);

      // C. Refund mutation via processRefund
      // INV-2026-001 has payment PAY-2026-001 ($894.60)
      const res = processRefund({
        paymentId: 'PAY-2026-001',
        amount: 50,
        reason: 'Guest dissatisfaction',
        status: 'Completed',
      });

      expect(refundListener).toHaveBeenCalledTimes(1);
      expect(paymentListener).toHaveBeenCalledTimes(1);
      expect(invoiceListener).toHaveBeenCalledTimes(1);

      const rEvent = refundListener.mock.calls[0][0];
      expect(rEvent.type).toBe('refunds_update');
      expect(rEvent.detail.domain).toBe('refunds');
      expect(rEvent.detail.action).toBe('process_refund');
      expect(rEvent.detail.refundId).toBe(res.newRefund.id);
      expect(rEvent.detail.paymentId).toBe('PAY-2026-001');
      expect(rEvent.detail.amount).toBe(50);

      const pEvent = paymentListener.mock.calls[0][0];
      expect(pEvent.detail.domain).toBe('payments');
      expect(pEvent.detail.action).toBe('process_refund');
      expect(pEvent.detail.paymentId).toBe('PAY-2026-001');

      const iEvent = invoiceListener.mock.calls[0][0];
      expect(iEvent.detail.domain).toBe('invoices');
      expect(iEvent.detail.action).toBe('process_refund');

      window.removeEventListener(REFUNDS_UPDATED_EVENT, refundListener);
      window.removeEventListener(PAYMENTS_UPDATED_EVENT, paymentListener);
      window.removeEventListener(INVOICES_UPDATED_EVENT, invoiceListener);
    });

    it('does NOT dispatch events when validation fails before persistence', () => {
      const [testInvoice] = addInvoice({
        guestName: 'Validation Test Guest',
        totalAmount: 200,
        subtotal: 200,
      });

      const paymentListener = vi.fn();
      const invoiceListener = vi.fn();
      const refundListener = vi.fn();
      window.addEventListener(PAYMENTS_UPDATED_EVENT, paymentListener);
      window.addEventListener(INVOICES_UPDATED_EVENT, invoiceListener);
      window.addEventListener(REFUNDS_UPDATED_EVENT, refundListener);

      // D1. Invalid payment validation (missing invoice)
      expect(() => {
        recordInvoicePayment({ invoiceId: 'NON_EXISTENT_INV', amount: 50 });
      }).toThrow();
      expect(paymentListener).not.toHaveBeenCalled();
      expect(invoiceListener).not.toHaveBeenCalled();

      // D2. Invalid payment amount
      expect(() => {
        recordInvoicePayment({ invoiceId: testInvoice.id, amount: -20 });
      }).toThrow();
      expect(paymentListener).not.toHaveBeenCalled();
      expect(invoiceListener).not.toHaveBeenCalled();

      // D3. Overpayment exceeding balance due
      expect(() => {
        recordInvoicePayment({ invoiceId: testInvoice.id, amount: 999999 });
      }).toThrow();
      expect(paymentListener).not.toHaveBeenCalled();
      expect(invoiceListener).not.toHaveBeenCalled();

      // D4. Invalid refund validation (non-existent payment)
      expect(() => {
        processRefund({ paymentId: 'PAY-DOES-NOT-EXIST', amount: 50 });
      }).toThrow();
      expect(refundListener).not.toHaveBeenCalled();

      // D5. Refund exceeding payment amount
      expect(() => {
        processRefund({ paymentId: 'PAY-2026-001', amount: 999999 });
      }).toThrow();
      expect(refundListener).not.toHaveBeenCalled();

      window.removeEventListener(PAYMENTS_UPDATED_EVENT, paymentListener);
      window.removeEventListener(INVOICES_UPDATED_EVENT, invoiceListener);
      window.removeEventListener(REFUNDS_UPDATED_EVENT, refundListener);
    });

    it('does NOT dispatch events when storage persistence throws and is rolled back', () => {
      const [testInvoice] = addInvoice({
        guestName: 'Rollback Test Guest',
        totalAmount: 300,
        subtotal: 300,
      });

      const paymentListener = vi.fn();
      const invoiceListener = vi.fn();
      window.addEventListener(PAYMENTS_UPDATED_EVENT, paymentListener);
      window.addEventListener(INVOICES_UPDATED_EVENT, invoiceListener);

      const originalSetItem = localStorage.setItem.bind(localStorage);
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
        if (key === 'hm_payments_v2') {
          throw new Error('Disk quota exceeded simulated');
        }
        return originalSetItem(key, value);
      });

      try {
        expect(() => {
          recordInvoicePayment({ invoiceId: testInvoice.id, amount: 50 });
        }).toThrow(/Payment persistence failed and was rolled back/);

        expect(paymentListener).not.toHaveBeenCalled();
        expect(invoiceListener).not.toHaveBeenCalled();
      } finally {
        setItemSpy.mockRestore();
        window.removeEventListener(PAYMENTS_UPDATED_EVENT, paymentListener);
        window.removeEventListener(INVOICES_UPDATED_EVENT, invoiceListener);
      }
    });

    it('verifies event payload contract contains domain, action, and entity identifiers', () => {
      const invoiceListener = vi.fn();
      window.addEventListener(INVOICES_UPDATED_EVENT, invoiceListener);

      updateInvoice('INV-2026-001', { notes: 'Updated notes test' });

      expect(invoiceListener).toHaveBeenCalledTimes(1);
      const event = invoiceListener.mock.calls[0][0];
      expect(event.type).toBe('invoices_update');
      expect(event.detail).toEqual(
        expect.objectContaining({
          domain: 'invoices',
          action: 'update',
          invoiceId: 'INV-2026-001',
        })
      );

      window.removeEventListener(INVOICES_UPDATED_EVENT, invoiceListener);
    });
  });

});
