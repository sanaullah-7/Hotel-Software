import { describe, it, expect, beforeEach } from 'vitest';
import {
  getInvoices,
  addInvoice,
  recordInvoicePayment,
  getPayments,
  getRefunds,
  processRefund,
  resetPaymentBillingStore,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_REFUNDS,
} from '../features/payment-billing/pages/paymentBillingStore';

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
});
