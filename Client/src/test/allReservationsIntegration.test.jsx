import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AllBookings from '../features/reservations/pages/AllReservations';
import reservationService from '../services/reservationService';
import { getReservations } from '../features/reservations/state/reservationStore';

describe('Phase 3 Step 3: AllReservations Backend Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleBackendReservations = [
    {
      _id: '67a1b2c3d4e5f67890123456',
      booking_ref: 'RES-LIVE-001',
      status: 'CONFIRMED',
      expected_check_in: '2026-10-15T14:00:00.000Z',
      expected_check_out: '2026-10-20T11:00:00.000Z',
      adults: 2,
      children: 1,
      special_requests: 'Sea view room please',
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123457',
        first_name: 'Alexander',
        last_name: 'Wright',
        email: 'alexander.wright@example.com',
        phone: '+15559876543',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123458',
            room_number: '402',
            floor: '4',
          },
          room_type_id: {
            _id: '67a1b2c3d4e5f67890123459',
            name: 'Executive Suite',
            code: 'EXE',
          },
        },
      ],
      created_at: '2026-10-01T10:00:00.000Z',
    },
    {
      _id: '67a1b2c3d4e5f67890123460',
      booking_ref: 'RES-LIVE-002',
      status: 'IN_HOUSE',
      expected_check_in: '2026-10-12T14:00:00.000Z',
      expected_check_out: '2026-10-17T11:00:00.000Z',
      adults: 1,
      children: 0,
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123461',
        first_name: 'Sophia',
        last_name: 'Chen',
        email: 'sophia.chen@example.com',
        phone: '+15551122334',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123462',
            room_number: '205',
          },
          room_type_id: {
            _id: '67a1b2c3d4e5f67890123463',
            name: 'Deluxe Room',
          },
        },
      ],
      created_at: '2026-10-02T10:00:00.000Z',
    },
  ];

  it('1. Successfully loads backend reservations, adapts data, displays in UI, and synchronizes compatibility store', async () => {
    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: sampleBackendReservations,
      message: 'Reservations retrieved successfully',
      success: true,
    });

    render(
      <BrowserRouter>
        <AllBookings />
      </BrowserRouter>
    );

    // Initial loading indicator
    expect(screen.getByText(/loading reservations/i)).toBeInTheDocument();

    // Wait for reservations to appear in the table
    await waitFor(() => {
      expect(screen.getByText('Alexander Wright')).toBeInTheDocument();
    });

    expect(screen.getByText('Sophia Chen')).toBeInTheDocument();
    expect(screen.getByText('Executive Suite')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
    expect(screen.getByText('Booked')).toBeInTheDocument();
    expect(screen.getByText('Checked In')).toBeInTheDocument();
    expect(screen.getByText('+15559876543')).toBeInTheDocument();
    expect(screen.getByText('+15551122334')).toBeInTheDocument();

    // Verify compatibility store was synchronized
    const stored = getReservations();
    expect(stored).toHaveLength(2);
    expect(stored.find((b) => b.name === 'Alexander Wright')).toBeDefined();
    expect(stored.find((b) => b.name === 'Sophia Chen')).toBeDefined();
    expect(stored.find((b) => b.name === 'Alexander Wright').roomNo).toBe('402');
  });

  it('2. Correctly renders empty state when backend returns no reservations', async () => {
    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      message: 'Reservations retrieved successfully',
      success: true,
    });

    render(
      <BrowserRouter>
        <AllBookings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading reservations/i)).not.toBeInTheDocument();
    });

    // Table should render with no data rows
    expect(screen.queryByText('Alexander Wright')).not.toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('3. Displays error notification and does NOT inject fake data when backend API fails', async () => {
    vi.spyOn(reservationService, 'getReservations').mockRejectedValue(
      new Error('Network connection failed. Backend unreachable.')
    );

    render(
      <BrowserRouter>
        <AllBookings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Network connection failed. Backend unreachable./i)).toBeInTheDocument();
    });

    // Verify no fake reservations are shown
    expect(screen.queryByText('Alexander Wright')).not.toBeInTheDocument();
    expect(screen.queryByText('Sophia Chen')).not.toBeInTheDocument();
  });

  it('4. Loads and renders backend-shaped reservation independently of localStorage cache state', async () => {
    // Clear localStorage completely to ensure no cache exists beforehand
    localStorage.clear();
    expect(localStorage.getItem('hotel_reservations')).toBeNull();

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [sampleBackendReservations[0]],
      message: 'Success',
      success: true,
    });

    render(
      <BrowserRouter>
        <AllBookings />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alexander Wright')).toBeInTheDocument();
    });

    expect(screen.getByText('Executive Suite')).toBeInTheDocument();
    expect(screen.getByText('2026-10-15')).toBeInTheDocument();
    expect(screen.getByText('2026-10-20')).toBeInTheDocument();
    expect(screen.getByText('+15559876543')).toBeInTheDocument();
  });
});
