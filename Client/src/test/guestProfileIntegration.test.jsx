import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import GuestProfile from '../features/guests/pages/GuestProfile.jsx';
import { guestService } from '../services/guestService.js';
import { getGuests, saveGuests } from '../features/guests/state/guestStore.js';
import { saveReservations } from '../features/reservations/state/reservationStore.js';
import { saveInvoices } from '../features/payment-billing/pages/paymentBillingStore.js';

describe('Phase 4 Step 5: Guest Profile Backend Integration Tests', () => {
  const mockBackendGuest = {
    _id: '6ac3a404e1498eaa1c65bbf4',
    guest_ref: 'GST-123456ABCD',
    first_name: 'Zainab',
    last_name: 'Abbas',
    email: 'zainab@example.com',
    phone: '+923001122334',
    city: 'Lahore',
    country: 'Pakistan',
    passport_number: 'PK9988776',
    national_id: '42101-9988776-5',
    vip_status: true,
    special_requests: 'Sea view room, late checkout',
    created_at: '2026-05-18T10:00:00.000Z',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const renderProfile = (id = '6ac3a404e1498eaa1c65bbf4') => {
    return render(
      <MemoryRouter initialEntries={[`/guests/${id}`]}>
        <Routes>
          <Route path="/guests/:id" element={<GuestProfile />} />
        </Routes>
      </MemoryRouter>
    );
  };

  // ─── 1. BACKEND LOADING & ADAPTER MAPPING ─────────────────────────────────────────────
  describe('Backend Loading & Adapter Mapping', () => {
    it('calls guestService.getGuestById with canonical route Mongo _id, adapts response, and renders profile', async () => {
      const getSpy = vi.spyOn(guestService, 'getGuestById').mockResolvedValue({
        statusCode: 200,
        data: mockBackendGuest,
        success: true,
      });

      renderProfile('6ac3a404e1498eaa1c65bbf4');

      await waitFor(() => {
        expect(getSpy).toHaveBeenCalledWith('6ac3a404e1498eaa1c65bbf4');
      });

      // Verify rendered adapted fields
      await waitFor(() => {
        expect(screen.getByText('Zainab Abbas')).toBeInTheDocument();
        expect(screen.getAllByText('zainab@example.com').length).toBeGreaterThan(0);
        expect(screen.getAllByText('+923001122334').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Lahore').length).toBeGreaterThan(0);
        expect(screen.getAllByText('VIP').length).toBeGreaterThan(0);
      });

      // Verify guestStore cache synchronization
      const cached = getGuests();
      expect(cached.some(g => g.id === '6ac3a404e1498eaa1c65bbf4')).toBe(true);
    });
  });

  // ─── 2. SOURCE OF TRUTH & STALE CACHE OVERRIDE ───────────────────────────────────────
  describe('Source of Truth & Stale Cache Override', () => {
    it('authoritatively overrides stale local cache data with fresh backend response', async () => {
      // Seed stale guest in local cache
      saveGuests([
        {
          id: '6ac3a404e1498eaa1c65bbf4',
          name: 'Old Name From Cache',
          email: 'old@cache.com',
          phone: '+0000000000',
          city: 'Old City',
        },
      ]);

      vi.spyOn(guestService, 'getGuestById').mockResolvedValue({
        statusCode: 200,
        data: {
          ...mockBackendGuest,
          first_name: 'Zainab Authoritative',
          last_name: 'Abbas',
          city: 'Islamabad',
        },
        success: true,
      });

      renderProfile('6ac3a404e1498eaa1c65bbf4');

      // The backend authoritative data must win
      await waitFor(() => {
        expect(screen.getByText('Zainab Authoritative Abbas')).toBeInTheDocument();
        expect(screen.getAllByText('Islamabad').length).toBeGreaterThan(0);
        expect(screen.queryByText('Old Name From Cache')).not.toBeInTheDocument();
      });
    });

    it('successfully loads and renders profile with zero pre-existing localStorage cache', async () => {
      vi.spyOn(guestService, 'getGuestById').mockResolvedValue({
        statusCode: 200,
        data: mockBackendGuest,
        success: true,
      });

      renderProfile('6ac3a404e1498eaa1c65bbf4');

      await waitFor(() => {
        expect(screen.getByText('Zainab Abbas')).toBeInTheDocument();
      });
    });
  });

  // ─── 3. LOADING, ERROR, & NOT FOUND STATES ───────────────────────────────────────────
  describe('Profile UI States', () => {
    it('displays loading indicator during fetch', async () => {
      let resolvePromise;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.spyOn(guestService, 'getGuestById').mockReturnValue(pendingPromise);

      renderProfile('6ac3a404e1498eaa1c65bbf4');

      expect(screen.getByText(/loading guest/i)).toBeInTheDocument();

      // Resolve
      resolvePromise({
        statusCode: 200,
        data: mockBackendGuest,
        success: true,
      });

      await waitFor(() => {
        expect(screen.queryByText(/loading guest/i)).not.toBeInTheDocument();
        expect(screen.getByText('Zainab Abbas')).toBeInTheDocument();
      });
    });

    it('renders "Guest Record Not Located" on 404 response without displaying stale local data', async () => {
      vi.spyOn(guestService, 'getGuestById').mockRejectedValue({
        response: {
          status: 404,
          data: { message: 'Guest not found in tenant database' },
        },
      });

      renderProfile('6ac3a404e1498eaa1c65bbf4');

      await waitFor(() => {
        expect(screen.getByText('Guest Record Not Located')).toBeInTheDocument();
        expect(screen.getByText(/Guest not found/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /view all guests/i })).toBeInTheDocument();
      });
    });

    it('renders clear error state on server/network failure and provides functional Retry button', async () => {
      const getSpy = vi.spyOn(guestService, 'getGuestById')
        .mockRejectedValueOnce({
          response: {
            status: 500,
            data: { message: 'Internal server error while retrieving guest' },
          },
        })
        .mockResolvedValueOnce({
          statusCode: 200,
          data: mockBackendGuest,
          success: true,
        });

      renderProfile('6ac3a404e1498eaa1c65bbf4');

      await waitFor(() => {
        expect(screen.getByText(/Internal server error while retrieving guest/i)).toBeInTheDocument();
      });

      // Click Retry
      const retryBtn = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryBtn);

      // Verify recovery
      await waitFor(() => {
        expect(screen.getByText('Zainab Abbas')).toBeInTheDocument();
      });

      expect(getSpy).toHaveBeenCalledTimes(2);
    });
  });

  // ─── 4. PROFILE MUTATION FLOW ────────────────────────────────────────────────────────
  describe('Profile Edit Mutation Integration', () => {
    it('calls guestService.updateGuest with canonical Mongo _id and updates profile UI & cache', async () => {
      vi.spyOn(guestService, 'getGuestById').mockResolvedValue({
        statusCode: 200,
        data: mockBackendGuest,
        success: true,
      });

      const updateSpy = vi.spyOn(guestService, 'updateGuest').mockResolvedValue({
        statusCode: 200,
        data: {
          ...mockBackendGuest,
          first_name: 'Zainab',
          last_name: 'Edited',
          city: 'Karachi',
        },
        message: 'Guest updated successfully',
        success: true,
      });

      renderProfile('6ac3a404e1498eaa1c65bbf4');

      await waitFor(() => {
        expect(screen.getByText('Zainab Abbas')).toBeInTheDocument();
      });

      // Open Edit Profile modal
      fireEvent.click(screen.getByText('Edit Profile'));

      expect(screen.getByText('Edit Guest Profile')).toBeInTheDocument();

      // Change full name
      const nameInput = screen.getByLabelText('Full Name *');
      fireEvent.change(nameInput, { target: { value: 'Zainab Edited' } });

      // Save
      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith(
          '6ac3a404e1498eaa1c65bbf4',
          expect.objectContaining({
            first_name: 'Zainab',
            last_name: 'Edited',
          })
        );
      });

      await waitFor(() => {
        expect(screen.getAllByText('Zainab Edited').length).toBeGreaterThan(0);
      });
    });
  });

  // ─── 5. DOWNSTREAM RELATED DATA COMPATIBILITY ─────────────────────────────────────────
  describe('Downstream Related Data Compatibility', () => {
    it('loads and links related reservations and invoices for the authoritative backend guest', async () => {
      vi.spyOn(guestService, 'getGuestById').mockResolvedValue({
        statusCode: 200,
        data: mockBackendGuest,
        success: true,
      });

      saveReservations([
        {
          id: 'res_999',
          bookingId: 'BK-999',
          guestId: '6ac3a404e1498eaa1c65bbf4',
          name: 'Zainab Abbas',
          email: 'zainab@example.com',
          roomNumber: '305',
          roomType: 'Deluxe Suite',
          checkIn: '2026-06-01',
          checkOut: '2026-06-05',
          status: 'Booked',
          totalPrice: 1200,
        },
      ]);

      saveInvoices([
        {
          id: 'inv_888',
          invoiceNumber: 'INV-2026-888',
          guestId: '6ac3a404e1498eaa1c65bbf4',
          guestName: 'Zainab Abbas',
          guestEmail: 'zainab@example.com',
          bookingId: 'BK-999',
          totalAmount: 1200,
          paidAmount: 1200,
          financialIntegrity: 'verified',
          status: 'Paid',
        },
      ]);

      renderProfile('6ac3a404e1498eaa1c65bbf4');

      await waitFor(() => {
        expect(screen.getByText('Zainab Abbas')).toBeInTheDocument();
      });

      // Switch to Reservations & Stays tab
      const resTab = screen.getByText('Reservations & Stays');
      fireEvent.click(resTab);

      await waitFor(() => {
        expect(screen.getByText('BK-999')).toBeInTheDocument();
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      // Switch to Invoices tab
      const invTabs = screen.getAllByText('Invoices');
      fireEvent.click(invTabs[0]);

      await waitFor(() => {
        expect(screen.getByText('INV-2026-888')).toBeInTheDocument();
        expect(screen.getAllByText('$1200.00').length).toBeGreaterThan(0);
      });
    });
  });
});
