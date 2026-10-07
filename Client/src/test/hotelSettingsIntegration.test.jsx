import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HotelProfile from '../features/settings/pages/HotelProfile';
import Policies from '../features/settings/pages/Policies';
import AdminProfile from '../pages/Auth/AdminProfile';
import hotelConfigService from '../services/hotelConfigService';

vi.mock('../services/hotelConfigService', () => ({
  default: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getPolicies: vi.fn(),
    updatePolicies: vi.fn(),
  },
  hotelConfigService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getPolicies: vi.fn(),
    updatePolicies: vi.fn(),
  },
}));

const mockAuthUser = { fullName: 'Admin User', email: 'admin@luxuria.com' };
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    isAuthenticated: true,
  }),
}));

describe('Hotel Settings (Profile & Policies) Frontend-to-Backend Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. Hotel Profile Backend Authority', () => {
    const mockBackendProfile = {
      _id: '67a000000000000000000001',
      property_name: 'Imperial Grand Palace',
      legal_name: 'Imperial Holdings Ltd',
      email: 'concierge@imperial.com',
      phone: '+92 300 9876543',
      address: '77 Boulevard Avenue',
      city: 'Islamabad',
      country: 'Pakistan',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      logo_url: 'https://images.example.com/logo.png',
    };

    it('mounts, fetches profile from hotelConfigService.getProfile, and renders backend fields', async () => {
      hotelConfigService.getProfile.mockResolvedValueOnce({
        status: 200,
        data: mockBackendProfile,
      });

      render(
        <MemoryRouter>
          <HotelProfile />
        </MemoryRouter>
      );

      // Loading state check
      expect(screen.getByTestId('hotel-profile-loading')).toBeDefined();

      await waitFor(() => {
        expect(hotelConfigService.getProfile).toHaveBeenCalledTimes(1);
      });

      // Verify inputs populated with backend values
      await waitFor(() => {
        expect(screen.getByDisplayValue('Imperial Grand Palace')).toBeDefined();
        expect(screen.getByDisplayValue('concierge@imperial.com')).toBeDefined();
        expect(screen.getByDisplayValue('Islamabad')).toBeDefined();
      });

      // Verify localStorage was updated to reflect backend hotel name
      expect(localStorage.getItem('hotelName')).toBe('Imperial Grand Palace');
    });

    it('submits updated profile via hotelConfigService.updateProfile', async () => {
      hotelConfigService.getProfile.mockResolvedValueOnce({
        status: 200,
        data: mockBackendProfile,
      });

      hotelConfigService.updateProfile.mockResolvedValueOnce({
        status: 200,
        data: {
          ...mockBackendProfile,
          property_name: 'Renovated Imperial Resort',
        },
      });

      render(
        <MemoryRouter>
          <HotelProfile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Imperial Grand Palace')).toBeDefined();
      });

      // Click Edit
      const editBtn = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editBtn);

      // Change hotel name
      const hotelNameInput = screen.getByDisplayValue('Imperial Grand Palace');
      fireEvent.change(hotelNameInput, { target: { value: 'Renovated Imperial Resort' } });

      // Click Save Changes
      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(hotelConfigService.updateProfile).toHaveBeenCalledTimes(1);
      });

      expect(hotelConfigService.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          property_name: 'Renovated Imperial Resort',
        })
      );

      expect(localStorage.getItem('hotelName')).toBe('Renovated Imperial Resort');
    });

    it('surfaces backend error banner with a working Retry button', async () => {
      hotelConfigService.getProfile.mockRejectedValueOnce(
        new Error('Failed to connect to config service')
      );

      render(
        <MemoryRouter>
          <HotelProfile />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to connect to config service/i)).toBeDefined();
      });

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      expect(retryBtn).toBeDefined();

      hotelConfigService.getProfile.mockResolvedValueOnce({
        status: 200,
        data: mockBackendProfile,
      });

      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Imperial Grand Palace')).toBeDefined();
      });
    });
  });

  describe('2. Hotel Policies Backend Authority', () => {
    const mockBackendPolicies = {
      _id: '67a000000000000000000002',
      check_in_time: '15:30',
      check_out_time: '10:30',
      early_checkin_policy: 'Subject to room availability',
      late_checkout_policy: 'Permitted until 14:00 with fee',
      cancellation_policy: 'Flexible cancellation within 48h',
      no_show_policy: 'Full rate charged',
      pet_policy: 'Pets allowed in designated villas',
      smoking_policy: 'Non-smoking everywhere',
      age_policy: 'Minimum 21 years old',
      payment_methods_accepted: ['Credit Card', 'Cash', 'Bank Transfer'],
      id_verification_required: true,
      pets_allowed: true,
    };

    it('mounts, fetches policies via hotelConfigService.getPolicies, and populates times and switches', async () => {
      hotelConfigService.getPolicies.mockResolvedValueOnce({
        status: 200,
        data: mockBackendPolicies,
      });

      render(
        <MemoryRouter>
          <Policies />
        </MemoryRouter>
      );

      // Loading state check
      expect(screen.getByTestId('hotel-policies-loading')).toBeDefined();

      await waitFor(() => {
        expect(hotelConfigService.getPolicies).toHaveBeenCalledTimes(1);
      });

      // Verify check in and check out times populated
      await waitFor(() => {
        expect(screen.getByDisplayValue('15:30')).toBeDefined();
        expect(screen.getByDisplayValue('10:30')).toBeDefined();
      });
    });

    it('submits updated policies to hotelConfigService.updatePolicies on Apply Policy Configuration', async () => {
      hotelConfigService.getPolicies.mockResolvedValueOnce({
        status: 200,
        data: mockBackendPolicies,
      });

      hotelConfigService.updatePolicies.mockResolvedValueOnce({
        status: 200,
        data: {
          ...mockBackendPolicies,
          check_in_time: '16:00',
        },
      });

      render(
        <MemoryRouter>
          <Policies />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('15:30')).toBeDefined();
      });

      const checkInInput = screen.getByDisplayValue('15:30');
      fireEvent.change(checkInInput, { target: { value: '16:00' } });

      const applyBtn = screen.getByRole('button', { name: /apply policy configuration/i });
      fireEvent.click(applyBtn);

      await waitFor(() => {
        expect(hotelConfigService.updatePolicies).toHaveBeenCalledTimes(1);
      });

      expect(hotelConfigService.updatePolicies).toHaveBeenCalledWith(
        expect.objectContaining({
          check_in_time: '16:00',
          pets_allowed: true,
          id_verification_required: true,
        })
      );
    });

    it('handles backend error with a functional retry button in Policies', async () => {
      hotelConfigService.getPolicies.mockRejectedValueOnce(
        new Error('Failed to load hotel policies')
      );

      render(
        <MemoryRouter>
          <Policies />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to load hotel policies/i)).toBeDefined();
      });

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      expect(retryBtn).toBeDefined();

      hotelConfigService.getPolicies.mockResolvedValueOnce({
        status: 200,
        data: mockBackendPolicies,
      });

      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByDisplayValue('15:30')).toBeDefined();
      });
    });
  });

  describe('3. Admin Profile Integration', () => {
    it('calls hotelConfigService.updateProfile when saving AdminProfile', async () => {
      hotelConfigService.updateProfile.mockResolvedValueOnce({
        status: 200,
        data: { property_name: 'Hotel Serena' },
      });

      render(
        <MemoryRouter>
          <AdminProfile />
        </MemoryRouter>
      );

      const hotelInput = screen.getByDisplayValue('Hotel Admin');
      fireEvent.change(hotelInput, { target: { value: 'Hotel Serena' } });

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(hotelConfigService.updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            property_name: 'Hotel Serena',
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Profile updated successfully!/i)).toBeDefined();
      });
      expect(localStorage.getItem('hotelName')).toBe('Hotel Serena');
    });
  });
});
