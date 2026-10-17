import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Invoices from '../features/payment-billing/pages/Invoices';
import PaymentHistory from '../features/payment-billing/pages/PaymentHistory';
import PendingPayments from '../features/payment-billing/pages/PendingPayments';
import Refunds from '../features/payment-billing/pages/Refunds';
import GuestProfile from '../features/guests/pages/GuestProfile';
import { billingService } from '../services/billingService';
import guestChargeService from '../services/guestChargeService';
import { guestService } from '../services/guestService';
import {
  getInvoices,
  getPayments,
  getRefunds,
} from '../features/payment-billing/pages/paymentBillingStore';

describe('Step 2: Billing / Financial Authority Retirement Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. Invoices Backend Authority', () => {
    it('displays backend invoices and handles empty backend response as empty (no seeded fallback)', async () => {
      vi.spyOn(billingService, 'getInvoices').mockResolvedValue({
        data: { invoices: [] }
      });

      render(
        <MemoryRouter>
          <Invoices />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No invoices found')).toBeInTheDocument();
      });

      // Local storage must not have seeded invoices
      expect(getInvoices()).toEqual([]);
    });

    it('displays backend invoices when returned from backend', async () => {
      vi.spyOn(billingService, 'getInvoices').mockResolvedValue({
        data: {
          invoices: [
            {
              _id: '507f1f77bcf86cd799439011',
              invoice_number: 'INV-2026-999',
              total_amount: 500,
              amount_paid: 200,
              status: 'PARTIALLY_PAID',
              guest_id: { first_name: 'Authoritative', last_name: 'Guest', email: 'auth@test.com' },
              line_items: [{ description: 'Room Charge', amount: 500 }],
            }
          ]
        }
      });

      render(
        <MemoryRouter>
          <Invoices />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('INV-2026-999')).toBeInTheDocument();
        expect(screen.getByText('Authoritative Guest')).toBeInTheDocument();
      });
    });

    it('payment creation failure surfaces error to user and does NOT create a local payment', async () => {
      vi.spyOn(billingService, 'getInvoices').mockResolvedValue({
        data: {
          invoices: [
            {
              _id: '507f1f77bcf86cd799439011',
              invoice_number: 'INV-2026-FAIL',
              total_amount: 500,
              amount_paid: 0,
              status: 'UNPAID',
              guest_id: { first_name: 'Test', last_name: 'Guest' },
              line_items: [],
            }
          ]
        }
      });

      vi.spyOn(billingService, 'createPayment').mockRejectedValue(
        new Error('Payment gateway declined: insufficient funds')
      );

      render(
        <MemoryRouter>
          <Invoices />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('INV-2026-FAIL')).toBeInTheDocument();
      });

      // Click "Record Payment" row action
      const recordActionBtn = screen.getByTitle('Record Payment');
      fireEvent.click(recordActionBtn);

      await waitFor(() => {
        expect(screen.getByText('Post a guest transaction directly against an invoice')).toBeInTheDocument();
      });

      // Fill in amount
      const amtInput = screen.getByLabelText(/payment amount/i);
      fireEvent.change(amtInput, { target: { value: '250' } });

      const confirmBtn = screen.getByRole('button', { name: /confirm & record payment/i });
      fireEvent.click(confirmBtn);

      // Must surface error
      await waitFor(() => {
        expect(screen.getAllByText('Payment gateway declined: insufficient funds').length).toBeGreaterThan(0);
      });

      // Zero local payments created
      expect(getPayments()).toEqual([]);
    });
  });

  describe('2. Payment History Backend Authority', () => {
    it('displays empty payment history on 200 + [] without resurrecting mock payments', async () => {
      vi.spyOn(billingService, 'getPayments').mockResolvedValue({
        data: { payments: [] }
      });

      render(
        <MemoryRouter>
          <PaymentHistory />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No payments recorded')).toBeInTheDocument();
      });

      expect(getPayments()).toEqual([]);
    });
  });

  describe('3. Refunds Backend Authority', () => {
    it('displays empty refund history on 200 + [] without seeded mock data', async () => {
      vi.spyOn(billingService, 'getRefunds').mockResolvedValue({
        data: { refunds: [] }
      });
      vi.spyOn(billingService, 'getPayments').mockResolvedValue({
        data: { payments: [] }
      });

      render(
        <MemoryRouter>
          <Refunds />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No refunds recorded')).toBeInTheDocument();
      });

      expect(getRefunds()).toEqual([]);
    });

    it('refund rejection surfaces error and creates NO local refund record', async () => {
      vi.spyOn(billingService, 'getRefunds').mockResolvedValue({
        data: { refunds: [] }
      });
      vi.spyOn(billingService, 'getPayments').mockResolvedValue({
        data: {
          payments: [
            {
              _id: '507f1f77bcf86cd799439099',
              payment_ref: 'PAY-2026-REFUNDABLE',
              amount: 300,
              refunded_amount: 0,
              status: 'COMPLETED',
              payment_method: 'Credit Card',
              guest_id: { first_name: 'Refund', last_name: 'Target' }
            }
          ]
        }
      });
      vi.spyOn(billingService, 'createRefund').mockRejectedValue(
        new Error('Refund amount exceeds remaining refundable amount')
      );

      render(
        <MemoryRouter>
          <Refunds />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /\+ process refund/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /\+ process refund/i }));

      await waitFor(() => {
        expect(screen.getByText('Process Guest Refund')).toBeInTheDocument();
      });

      const amtInput = screen.getByLabelText(/refund amount/i);
      fireEvent.change(amtInput, { target: { value: '150' } });

      const confirmBtn = screen.getByRole('button', { name: /confirm & issue refund/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getAllByText('Refund amount exceeds remaining refundable amount').length).toBeGreaterThan(0);
      });

      expect(getRefunds()).toEqual([]);
    });
  });

  describe('4. Guest Profile Financial Isolation & Empty Backend Authority', () => {
    it('displays empty financial tabs when backend returns empty billing data without falling back to demo data', async () => {
      vi.spyOn(guestService, 'getGuestById').mockResolvedValue({
        data: {
          _id: '507f1f77bcf86cd799439077',
          guest_ref: 'GST-AUTH-001',
          first_name: 'Empty',
          last_name: 'Guest',
          email: 'empty@guest.com',
          phone: '+1234567890',
          status: 'ACTIVE',
        }
      });

      vi.spyOn(billingService, 'getInvoices').mockResolvedValue({ data: { invoices: [] } });
      vi.spyOn(billingService, 'getPayments').mockResolvedValue({ data: { payments: [] } });
      vi.spyOn(billingService, 'getGuestCharges').mockResolvedValue({ data: { charges: [] } });
      vi.spyOn(billingService, 'getRefunds').mockResolvedValue({ data: { refunds: [] } });

      render(
        <MemoryRouter initialEntries={['/guests/507f1f77bcf86cd799439077']}>
          <Routes>
            <Route path="/guests/:id" element={<GuestProfile />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Empty Guest')).toBeInTheDocument();
      });

      // Switch to Invoices tab
      const invTabs = screen.getAllByText('Invoices');
      fireEvent.click(invTabs[0]);

      await waitFor(() => {
        expect(screen.getByText('No invoices found')).toBeInTheDocument();
      });
    });
  });
});
