import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Guests from '../features/guests/pages/Guests.jsx';
import { guestService } from '../services/guestService.js';
import { getGuests } from '../features/guests/state/guestStore.js';

describe('Phase 4 Step 4: Guest Mutations Backend Integration Tests', () => {
  const STORAGE_KEY = 'hotel_guests_v1';

  const mockInitialGuests = [
    {
      _id: '6ac39d17ab4d72a799999f66',
      guest_ref: 'GST-123456ABCD',
      first_name: 'Kamran',
      last_name: 'Akmal',
      email: 'kamran@example.com',
      phone: '+923001234567',
      city: 'Lahore',
      country: 'Pakistan',
      passport_number: 'PK1234567',
      national_id: '42101-1122334-1',
      date_of_birth: '1992-08-20T00:00:00.000Z',
      vip_status: false,
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  // ─── 1. CREATE GUEST ─────────────────────────────────────────────────────────────
  describe('CREATE GUEST', () => {
    it('calls guestService.createGuest with adapted payload and updates UI & store on success', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        statusCode: 200,
        data: mockInitialGuests,
        success: true,
      });

      const createSpy = vi.spyOn(guestService, 'createGuest').mockResolvedValue({
        statusCode: 201,
        data: {
          _id: '6ac39d17ab4d72a799999f88',
          guest_ref: 'GST-998877NEW',
          first_name: 'Tariq',
          last_name: 'Jameel',
          email: 'tariq@example.com',
          phone: '+923009988776',
          city: 'Faisalabad',
          country: 'Pakistan',
          passport_number: 'PK9988776',
          vip_status: true,
        },
        message: 'Guest created successfully',
        success: true,
      });

      render(
        <MemoryRouter>
          <Guests />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
      });

      // Open Add Guest Modal
      const addBtn = screen.getByRole('button', { name: /add guest/i });
      fireEvent.click(addBtn);

      expect(screen.getByText('Add New Guest')).toBeInTheDocument();

      // Fill in form
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const cityInput = screen.getByLabelText(/city/i);
      const passportInput = screen.getByLabelText(/passport number/i);

      fireEvent.change(nameInput, { target: { value: 'Tariq Jameel' } });
      fireEvent.change(emailInput, { target: { value: 'tariq@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+923009988776' } });
      fireEvent.change(cityInput, { target: { value: 'Faisalabad' } });
      fireEvent.change(passportInput, { target: { value: 'PK9988776' } });

      // Submit form
      const submitBtn = screen.getByRole('button', { name: /create guest/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledTimes(1);
      });

      // Verify payload was adapted cleanly
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Tariq',
          last_name: 'Jameel',
          email: 'tariq@example.com',
          phone: '+923009988776',
          city: 'Faisalabad',
          passport_number: 'PK9988776',
        })
      );

      // Verify new guest appears in UI
      await waitFor(() => {
        expect(screen.getByText('Tariq Jameel')).toBeInTheDocument();
        expect(screen.getByText('6ac39d17ab4d72a799999f88')).toBeInTheDocument();
      });

      // Verify guestStore compatibility cache was authoritatively synchronized
      const stored = getGuests();
      expect(stored).toHaveLength(2);
      expect(stored.some(g => g.id === '6ac39d17ab4d72a799999f88')).toBe(true);
    });

    it('surfaces 409 Conflict duplicate error and does NOT add to UI or store on failure', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        statusCode: 200,
        data: mockInitialGuests,
        success: true,
      });

      vi.spyOn(guestService, 'createGuest').mockRejectedValue({
        response: {
          status: 409,
          data: {
            statusCode: 409,
            message: 'Guest with this passport number already exists in this hotel',
            success: false,
          },
        },
      });

      render(
        <MemoryRouter>
          <Guests />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /add guest/i }));
      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Duplicate Person' } });

      fireEvent.click(screen.getByRole('button', { name: /create guest/i }));

      // Conflict error appears in modal
      await waitFor(() => {
        expect(screen.getByText(/already exists in this hotel/i)).toBeInTheDocument();
      });

      // Store is NOT corrupted
      const stored = getGuests();
      expect(stored).toHaveLength(1);
      expect(stored.some(g => g.name === 'Duplicate Person')).toBe(false);
    });
  });

  // ─── 2. UPDATE GUEST ─────────────────────────────────────────────────────────────
  describe('UPDATE GUEST', () => {
    it('calls guestService.updateGuest with canonical Mongo _id and updates UI & store on success', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        statusCode: 200,
        data: mockInitialGuests,
        success: true,
      });

      const updateSpy = vi.spyOn(guestService, 'updateGuest').mockResolvedValue({
        statusCode: 200,
        data: {
          ...mockInitialGuests[0],
          city: 'Islamabad',
          vip_status: true,
        },
        message: 'Guest updated successfully',
        success: true,
      });

      render(
        <MemoryRouter>
          <Guests />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
      });

      // Open Edit Modal
      const editBtn = screen.getByRole('button', { name: /edit guest/i });
      fireEvent.click(editBtn);

      expect(screen.getByText(/edit guest: kamran akmal/i)).toBeInTheDocument();

      // Change city
      const cityInput = screen.getByLabelText(/city/i);
      fireEvent.change(cityInput, { target: { value: 'Islamabad' } });

      // Submit Edit
      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith(
          '6ac39d17ab4d72a799999f66',
          expect.objectContaining({
            city: 'Islamabad',
          })
        );
      });

      // Updated city appears in UI
      await waitFor(() => {
        expect(screen.getByText('Islamabad')).toBeInTheDocument();
      });

      // Compatibility cache synchronized
      const stored = getGuests();
      expect(stored[0].city).toBe('Islamabad');
    });

    it('surfaces error and preserves unchanged cache if update fails', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        statusCode: 200,
        data: mockInitialGuests,
        success: true,
      });

      vi.spyOn(guestService, 'updateGuest').mockRejectedValue({
        response: {
          status: 409,
          data: { message: 'Another guest with this passport number already exists' },
        },
      });

      render(
        <MemoryRouter>
          <Guests />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit guest/i }));
      fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'FailedCity' } });
      fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

      // Error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Another guest with this passport number already exists/i)).toBeInTheDocument();
      });

      // Store remained unchanged
      expect(getGuests()[0].city).toBe('Lahore');
    });
  });

  // ─── 3. DELETE GUEST ─────────────────────────────────────────────────────────────
  describe('DELETE GUEST', () => {
    it('calls guestService.deleteGuest with canonical Mongo _id and removes from UI & store on success', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        statusCode: 200,
        data: mockInitialGuests,
        success: true,
      });

      const deleteSpy = vi.spyOn(guestService, 'deleteGuest').mockResolvedValue({
        statusCode: 200,
        data: null,
        message: 'Guest deleted successfully',
        success: true,
      });

      render(
        <MemoryRouter>
          <Guests />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
      });

      // Click Delete
      const deleteBtn = screen.getByRole('button', { name: /delete guest/i });
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith('6ac39d17ab4d72a799999f66');
      });

      // Guest is removed from UI
      await waitFor(() => {
        expect(screen.getByText('No guests found.')).toBeInTheDocument();
      });

      // Guest is removed from store
      expect(getGuests()).toHaveLength(0);
    });

    it('preserves guest in UI and store if backend delete fails (e.g. 409 active booking constraint)', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        statusCode: 200,
        data: mockInitialGuests,
        success: true,
      });

      const deleteSpy = vi.spyOn(guestService, 'deleteGuest').mockRejectedValue({
        response: {
          status: 409,
          data: { message: 'Cannot delete guest with existing reservations or stays' },
        },
      });

      render(
        <MemoryRouter>
          <Guests />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /delete guest/i }));

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith('6ac39d17ab4d72a799999f66');
      });

      // Top banner error appears
      await waitFor(() => {
        expect(screen.getByText(/Cannot delete guest with existing reservations or stays/i)).toBeInTheDocument();
      });

      // Guest remains in UI
      expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();

      // Guest remains in store
      expect(getGuests()).toHaveLength(1);
    });
  });
});
