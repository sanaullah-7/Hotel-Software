import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Guests from '../features/guests/pages/Guests.jsx';
import { guestService } from '../services/guestService.js';
import { getGuests } from '../features/guests/state/guestStore.js';

describe('Phase 4 Step 3: Guests List Backend Read Integration Tests', () => {
  const STORAGE_KEY = 'hotel_guests_v1';

  const mockBackendGuests = [
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
      notes: 'High floor preferred',
    },
    {
      _id: '6ac39d17ab4d72a799999f77',
      guest_ref: 'GST-987654WXYZ',
      first_name: 'Airi',
      last_name: 'Satou',
      email: 'airi@tokyo.jp',
      phone: '+81312345678',
      city: 'Tokyo',
      country: 'Japan',
      passport_number: 'JP9988776',
      vip_status: true,
      notes: 'VIP Guest',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('Test 1 — Initial Load: Calls guestService.getGuests(), adapts data, and renders backend list', async () => {
    const getGuestsSpy = vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      statusCode: 200,
      data: mockBackendGuests,
      message: 'Guests retrieved successfully',
      success: true,
    });

    render(
      <MemoryRouter>
        <Guests />
      </MemoryRouter>
    );

    // Initial loading indicator appears
    expect(screen.getByText(/loading guests\.\.\./i)).toBeInTheDocument();

    // Verify service was called
    expect(getGuestsSpy).toHaveBeenCalledTimes(1);

    // Wait for guests to appear in the UI
    await waitFor(() => {
      expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
      expect(screen.getByText('Airi Satou')).toBeInTheDocument();
    });

    // Check rendered details
    expect(screen.getByText('6ac39d17ab4d72a799999f66')).toBeInTheDocument();
    expect(screen.getByText('6ac39d17ab4d72a799999f77')).toBeInTheDocument();
    expect(screen.getByText('kamran@example.com')).toBeInTheDocument();
    expect(screen.getByText('airi@tokyo.jp')).toBeInTheDocument();
    expect(screen.getByText('+923001234567')).toBeInTheDocument();
    expect(screen.getByText('Lahore')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();

    // Check VIP badges
    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('Test 2 — Store Synchronization: Authoritatively synchronizes backend data into guestStore', async () => {
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      statusCode: 200,
      data: mockBackendGuests,
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

    // Verify compatibility store now holds the adapted backend records
    const stored = getGuests();
    expect(stored).toHaveLength(2);
    expect(stored[0].id).toBe('6ac39d17ab4d72a799999f66');
    expect(stored[0].name).toBe('Kamran Akmal');
    expect(stored[1].id).toBe('6ac39d17ab4d72a799999f77');
    expect(stored[1].status).toBe('VIP');
  });

  it('Test 3 — Source-of-Truth Isolation: Stale localStorage data is not merged into backend results', async () => {
    // Seed stale fake local record
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: 'fake_local_guest', name: 'Fake Local Ghost', email: 'fake@ghost.com' }
    ]));

    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      statusCode: 200,
      data: [mockBackendGuests[0]], // Only Kamran Akmal
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

    // Stale ghost record must NOT be rendered in the UI
    expect(screen.queryByText('Fake Local Ghost')).not.toBeInTheDocument();

    // Stale ghost record must NOT survive in guestStore
    const stored = getGuests();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('6ac39d17ab4d72a799999f66');
  });

  it('Test 4 — Empty Backend State: Displays "No guests found." when backend returns empty array', async () => {
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    render(
      <MemoryRouter>
        <Guests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No guests found.')).toBeInTheDocument();
    });

    expect(screen.queryByText(/loading guests/i)).not.toBeInTheDocument();
    expect(getGuests()).toHaveLength(0);
  });

  it('Test 5 — Error Handling: Displays user-facing error message and provides functional Retry button', async () => {
    const getGuestsSpy = vi.spyOn(guestService, 'getGuests')
      .mockRejectedValueOnce(new Error('Network connection timeout'))
      .mockResolvedValueOnce({
        statusCode: 200,
        data: mockBackendGuests,
        success: true,
      });

    render(
      <MemoryRouter>
        <Guests />
      </MemoryRouter>
    );

    // Error message appears
    await waitFor(() => {
      expect(screen.getByText(/Network connection timeout/i)).toBeInTheDocument();
    });

    // Click Retry
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    // Verify recovery after retry
    await waitFor(() => {
      expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
    });

    expect(getGuestsSpy).toHaveBeenCalledTimes(2);
  });

  it('Test 6 — Search Query Filter: Filters rendered backend guests accurately in real-time', async () => {
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      statusCode: 200,
      data: mockBackendGuests,
      success: true,
    });

    render(
      <MemoryRouter>
        <Guests />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
      expect(screen.getByText('Airi Satou')).toBeInTheDocument();
    });

    // Search for "Tokyo"
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Tokyo' } });

    expect(screen.queryByText('Kamran Akmal')).not.toBeInTheDocument();
    expect(screen.getByText('Airi Satou')).toBeInTheDocument();

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Kamran Akmal')).toBeInTheDocument();
    expect(screen.getByText('Airi Satou')).toBeInTheDocument();
  });
});
