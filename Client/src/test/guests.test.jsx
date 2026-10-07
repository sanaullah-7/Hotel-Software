import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import guestService from '../services/guestService';
import Guests from '../features/guests/pages/Guests';

vi.mock('../services/guestService', () => ({
  default: {
    getGuests: vi.fn(),
    updateGuest: vi.fn()
  }
}));

const renderGuests = () => render(
  <MemoryRouter initialEntries={['/guests']}>
    <Routes>
      <Route path="/guests" element={<Guests />} />
    </Routes>
  </MemoryRouter>
);

describe('Guests page API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an empty state when the API returns an empty guest list', async () => {
    guestService.getGuests.mockResolvedValue({
      success: true,
      data: [],
      meta: { page: 1, limit: 50, total: 0, pages: 0 }
    });

    renderGuests();

    expect(await screen.findByText('No guests have been added yet.')).toBeInTheDocument();
    expect(guestService.getGuests).toHaveBeenCalledOnce();
  });

  it('maps backend guest fields and updates the guest through the API', async () => {
    const guest = {
      _id: 'mongo-guest-1',
      guest_ref: 'GST-2026-1001',
      first_name: 'Amina',
      last_name: 'Khan',
      email: 'amina@example.com',
      phone: '+1 555 0100',
      city: 'Lahore',
      vip_status: true,
      created_at: new Date().toISOString()
    };
    guestService.getGuests.mockResolvedValue({
      success: true,
      data: [guest],
      meta: { page: 1, limit: 50, total: 1, pages: 1 }
    });
    guestService.updateGuest.mockResolvedValue({
      success: true,
      data: { ...guest, first_name: 'Amina', last_name: 'Noor' }
    });

    renderGuests();

    expect(await screen.findByText('GST-2026-1001')).toBeInTheDocument();
    expect(screen.getByText('Amina Khan')).toBeInTheDocument();
    expect(screen.getByText('amina@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1 555 0100')).toBeInTheDocument();
    expect(screen.getByText('Lahore')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit guest' }));
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'Amina Noor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(guestService.updateGuest).toHaveBeenCalledWith('mongo-guest-1', {
        first_name: 'Amina',
        last_name: 'Noor',
        email: 'amina@example.com',
        phone: '+1 555 0100',
        city: 'Lahore',
        vip_status: true
      });
    });
    expect(await screen.findByText('Amina Noor')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
  });
});
