import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  toFrontendInvoice,
  toFrontendInvoiceList,
  toBackendInvoicePayload,
  toFrontendPayment,
  toFrontendPaymentList,
  toBackendPaymentPayload,
  toFrontendRefund,
  toFrontendRefundList,
  toBackendRefundPayload,
  toFrontendGuestCharge,
  toFrontendGuestChargeList,
  toBackendGuestChargePayload,
} from '../features/payment-billing/adapters/billingAdapter';
import { billingService } from '../services/billingService';
import Invoices from '../features/payment-billing/pages/Invoices';
import PaymentHistory from '../features/payment-billing/pages/PaymentHistory';
import PendingPayments from '../features/payment-billing/pages/PendingPayments';
import Refunds from '../features/payment-billing/pages/Refunds';

describe('Phase 6 Step 3: Billing Adapter & Frontend Pages Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. Billing Adapter Unit Transformations', () => {
    it('adapts backend invoice to frontend invoice contract', () => {
      const backendInvoice = {
        _id: '60c72b2f9b1d8b2bad000001',
        invoice_number: 'INV-2026-001',
        total_amount: 1500,
        amount_paid: 500,
        tax_total: 150,
        status: 'PARTIALLY_PAID',
        due_date: '2026-11-01T00:00:00.000Z',
        created_at: '2026-10-01T12:00:00.000Z',
        guest_id: {
          _id: '60c72b2f9b1d8b2bad000002',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '03001234567',
        },
        folio_id: {
          _id: '60c72b2f9b1d8b2bad000003',
          folio_ref: 'FOL-1001',
          reservation_id: {
            _id: '60c72b2f9b1d8b2bad000004',
            booking_ref: 'RES-9999',
          },
        },
        line_items: [
          { description: 'Deluxe Room 3 Nights', amount: 1350, tax_amount: 150 },
        ],
      };

      const adapted = toFrontendInvoice(backendInvoice);
      expect(adapted._id).toBe('60c72b2f9b1d8b2bad000001');
      expect(adapted.invoiceNumber).toBe('INV-2026-001');
      expect(adapted.id).toBe('INV-2026-001');
      expect(adapted.totalAmount).toBe(1500);
      expect(adapted.paidAmount).toBe(500);
      expect(adapted.balanceDue).toBe(1000);
      expect(adapted.status).toBe('Partially Paid');
      expect(adapted.guestName).toBe('John Doe');
      expect(adapted.guestEmail).toBe('john@example.com');
      expect(adapted.folio).toBe('FOL-1001');
      expect(adapted.bookingId).toBe('RES-9999');
      expect(adapted.items.length).toBe(1);
      expect(adapted.financialIntegrity).toBe('verified');
    });

    it('adapts backend payment to frontend payment contract', () => {
      const backendPayment = {
        _id: '60c72b2f9b1d8b2bad000010',
        payment_ref: 'PAY-1001',
        amount: 800,
        payment_method: 'CREDIT_CARD',
        status: 'COMPLETED',
        transaction_id: 'TXN-ABC1234',
        refunded_amount: 200,
        date: '2026-10-02T10:00:00.000Z',
        guest_id: {
          _id: '60c72b2f9b1d8b2bad000002',
          first_name: 'Alice',
          last_name: 'Smith',
        },
        invoice_id: {
          _id: '60c72b2f9b1d8b2bad000001',
          invoice_number: 'INV-2026-001',
        },
        folio_id: {
          _id: '60c72b2f9b1d8b2bad000003',
          folio_ref: 'FOL-1001',
          reservation_id: {
            booking_ref: 'RES-9999',
          },
        },
      };

      const adapted = toFrontendPayment(backendPayment);
      expect(adapted._id).toBe('60c72b2f9b1d8b2bad000010');
      expect(adapted.paymentId).toBe('PAY-1001');
      expect(adapted.id).toBe('PAY-1001');
      expect(adapted.amount).toBe(800);
      expect(adapted.paymentMethod).toBe('Credit Card');
      expect(adapted.status).toBe('Completed');
      expect(adapted.refundedAmount).toBe(200);
      expect(adapted.guestName).toBe('Alice Smith');
      expect(adapted.invoiceNumber).toBe('INV-2026-001');
      expect(adapted.bookingId).toBe('RES-9999');
    });

    it('adapts backend refund to frontend refund contract', () => {
      const backendRefund = {
        _id: '60c72b2f9b1d8b2bad000020',
        refund_ref: 'REF-5001',
        amount: 200,
        reason: 'Guest requested partial refund for room maintenance issue',
        status: 'PROCESSED',
        date: '2026-10-03T15:00:00.000Z',
        payment_id: {
          _id: '60c72b2f9b1d8b2bad000010',
          payment_ref: 'PAY-1001',
          payment_method: 'CREDIT_CARD',
          guest_id: {
            first_name: 'Alice',
            last_name: 'Smith',
          },
          invoice_id: {
            invoice_number: 'INV-2026-001',
          },
        },
      };

      const adapted = toFrontendRefund(backendRefund);
      expect(adapted._id).toBe('60c72b2f9b1d8b2bad000020');
      expect(adapted.refundId).toBe('REF-5001');
      expect(adapted.id).toBe('REF-5001');
      expect(adapted.amount).toBe(200);
      expect(adapted.reason).toBe('Guest requested partial refund for room maintenance issue');
      expect(adapted.status).toBe('Completed');
      expect(adapted.refundMethod).toBe('Credit Card Reverse');
      expect(adapted.guestName).toBe('Alice Smith');
      expect(adapted.paymentId).toBe('PAY-1001');
    });

    it('adapts backend guest charge to frontend charge contract', () => {
      const backendCharge = {
        _id: '60c72b2f9b1d8b2bad000030',
        charge_type: 'MINIBAR',
        description: 'Snacks & drinks',
        amount: 50,
        is_voided: false,
        date: '2026-10-04T12:00:00.000Z',
        folio_id: '60c72b2f9b1d8b2bad000003',
      };

      const adapted = toFrontendGuestCharge(backendCharge);
      expect(adapted.id).toBe('60c72b2f9b1d8b2bad000030');
      expect(adapted.chargeType).toBe('MINIBAR');
      expect(adapted.description).toBe('Snacks & drinks');
      expect(adapted.amount).toBe(50);
      expect(adapted.isVoided).toBe(false);
    });
  });

  describe('2. Invoices Page Backend Authority (Step 3A)', () => {
    it('fetches invoices from billingService on mount and displays backend list', async () => {
      const mockBackendInvoices = [
        {
          _id: 'inv_mock_1',
          invoice_number: 'INV-BE-100',
          total_amount: 1200,
          amount_paid: 1200,
          status: 'PAID',
          guest_id: { first_name: 'Robert', last_name: 'Langdon' },
          folio_id: { folio_ref: 'FOL-BE-1', reservation_id: { booking_ref: 'RES-BE-1' } },
          line_items: [{ description: 'Room Stay', amount: 1200, tax_amount: 0 }],
        },
      ];

      vi.spyOn(billingService, 'getInvoices').mockResolvedValue({
        data: { invoices: mockBackendInvoices },
      });

      render(
        <MemoryRouter>
          <Invoices />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(billingService.getInvoices).toHaveBeenCalled();
        expect(screen.getByText('INV-BE-100')).toBeInTheDocument();
        expect(screen.getByText('Robert Langdon')).toBeInTheDocument();
      });
    });
  });

  describe('3. Payment History Page Backend Authority (Step 3B)', () => {
    it('fetches payments from billingService on mount and displays backend list', async () => {
      const mockBackendPayments = [
        {
          _id: 'pay_mock_1',
          payment_ref: 'PAY-BE-200',
          amount: 600,
          payment_method: 'CREDIT_CARD',
          status: 'COMPLETED',
          refunded_amount: 0,
          date: '2026-10-05T00:00:00.000Z',
          guest_id: { first_name: 'Emma', last_name: 'Watson' },
          invoice_id: { invoice_number: 'INV-BE-200' },
          folio_id: { reservation_id: { booking_ref: 'RES-BE-2' } },
        },
      ];

      vi.spyOn(billingService, 'getPayments').mockResolvedValue({
        data: { payments: mockBackendPayments },
      });

      render(
        <MemoryRouter>
          <PaymentHistory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(billingService.getPayments).toHaveBeenCalled();
        expect(screen.getByText('PAY-BE-200')).toBeInTheDocument();
        expect(screen.getByText('Emma Watson')).toBeInTheDocument();
      });
    });
  });

  describe('4. Pending Payments Page Backend Authority (Step 3C)', () => {
    it('fetches invoices from billingService on mount and filters pending items', async () => {
      const mockBackendInvoices = [
        {
          _id: 'inv_mock_pending',
          invoice_number: 'INV-BE-PENDING',
          total_amount: 900,
          amount_paid: 300,
          status: 'PARTIALLY_PAID',
          guest_id: { first_name: 'Sarah', last_name: 'Connor' },
          folio_id: { folio_ref: 'FOL-BE-3', reservation_id: { booking_ref: 'RES-BE-3' } },
          line_items: [{ description: 'Suite Stay', amount: 900, tax_amount: 0 }],
        },
      ];

      vi.spyOn(billingService, 'getInvoices').mockResolvedValue({
        data: { invoices: mockBackendInvoices },
      });

      render(
        <MemoryRouter>
          <PendingPayments />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(billingService.getInvoices).toHaveBeenCalled();
        expect(screen.getByText('INV-BE-PENDING')).toBeInTheDocument();
        expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      });
    });
  });

  describe('5. Refunds Page Backend Authority (Step 3D)', () => {
    it('fetches refunds and payments from billingService on mount and displays backend list', async () => {
      const mockBackendRefunds = [
        {
          _id: 'ref_mock_1',
          refund_ref: 'REF-BE-300',
          amount: 150,
          reason: 'Late checkout waiver',
          status: 'PROCESSED',
          date: '2026-10-06T00:00:00.000Z',
          payment_id: {
            _id: 'pay_mock_1',
            payment_ref: 'PAY-BE-300',
            payment_method: 'CASH',
            guest_id: { first_name: 'David', last_name: 'Tennant' },
            invoice_id: { invoice_number: 'INV-BE-300' },
          },
        },
      ];

      vi.spyOn(billingService, 'getRefunds').mockResolvedValue({
        data: { refunds: mockBackendRefunds },
      });
      vi.spyOn(billingService, 'getPayments').mockResolvedValue({
        data: { payments: [] },
      });

      render(
        <MemoryRouter>
          <Refunds />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(billingService.getRefunds).toHaveBeenCalled();
        expect(screen.getByText('REF-BE-300')).toBeInTheDocument();
        expect(screen.getByText('David Tennant')).toBeInTheDocument();
      });
    });
  });
});
