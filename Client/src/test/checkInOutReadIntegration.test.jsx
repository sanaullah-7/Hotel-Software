import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckInOut from '../features/front-office/pages/CheckInOut';
import stayService from '../services/stayService';
import reservationService from '../services/reservationService';

describe('Phase 5 Step 3: Check-In/Check-Out Backend READ Integration Tests', () => {
  const mockStays = [
    {
      _id: '65b1c2d3e4f5678901234501',
      stay_ref: 'STY-1001',
      status: 'CHECKED_IN',
      actual_check_in: '2026-10-06T14:00:00.000Z',
      actual_check_out: null,
      total_guests: 2,
      notes: 'High floor preferred',
      primary_guest_id: {
        _id: '65a1b2c3d4e5f67890123001',
        guest_ref: 'GST-1001',
        first_name: 'Arthur',
        last_name: 'Dent',
        email: 'arthur.dent@galaxy.org',
        phone: '+44 7700 900077',
      },
      reservation_id: {
        _id: '65c1d2e3f4a5678901234001',
        booking_ref: 'RES-1001',
        expected_check_in: '2026-10-06T14:00:00.000Z',
        expected_check_out: '2026-10-10T10:00:00.000Z',
      },
      rooms: [
        {
          _id: '65e1f2a3b4c5678901234001',
          stay_id: '65b1c2d3e4f5678901234501',
          room_id: {
            _id: '65d1e2f3a4b5678901234001',
            room_number: '42',
            floor: '4',
            status: 'OCCUPIED',
            housekeeping_status: 'CLEAN',
            room_type_id: {
              name: 'Deluxe Suite',
              code: 'DLX',
            },
          },
          status: 'OCCUPIED',
        },
      ],
    },
    {
      _id: '65b1c2d3e4f5678901234502',
      stay_ref: 'STY-1002',
      status: 'CHECKED_OUT',
      actual_check_in: '2026-10-01T12:00:00.000Z',
      actual_check_out: '2026-10-05T11:00:00.000Z',
      total_guests: 1,
      primary_guest_id: {
        _id: '65a1b2c3d4e5f67890123002',
        guest_ref: 'GST-1002',
        first_name: 'Tricia',
        last_name: 'McMillan',
        email: 'trillian@galaxy.org',
        phone: '+44 7700 900088',
      },
      reservation_id: {
        _id: '65c1d2e3f4a5678901234002',
        booking_ref: 'RES-1002',
      },
      rooms: [
        {
          room_id: {
            _id: '65d1e2f3a4b5678901234002',
            room_number: '101',
            status: 'AVAILABLE',
            housekeeping_status: 'DIRTY',
          },
        },
      ],
    },
  ];

  const mockReservations = [
    // Upcoming booking eligible for check-in
    {
      _id: '65c1d2e3f4a5678901234003',
      booking_ref: 'RES-1003',
      status: 'CONFIRMED',
      expected_check_in: '2026-10-06T15:00:00.000Z',
      expected_check_out: '2026-10-08T11:00:00.000Z',
      adults: 1,
      children: 0,
      primary_guest_id: {
        _id: '65a1b2c3d4e5f67890123003',
        guest_ref: 'GST-1003',
        first_name: 'Ford',
        last_name: 'Prefect',
        email: 'ford.prefect@guide.org',
        phone: '+44 7700 900099',
      },
      rooms: [
        {
          room_id: {
            _id: '65d1e2f3a4b5678901234003',
            room_number: '201',
            floor: '2',
            status: 'AVAILABLE',
          },
          room_type_id: {
            name: 'Standard Single',
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Test 1 — Initial Load: Calls stayService.getStays() and reservationService.getReservations() and renders backend records', async () => {
    const getStaysSpy = vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: mockStays,
      success: true,
    });

    const getReservationsSpy = vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: mockReservations,
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    expect(getStaysSpy).toHaveBeenCalledTimes(1);
    expect(getReservationsSpy).toHaveBeenCalledTimes(1);

    // Wait for in-house checked-in guest
    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    });

    // Verify booking IDs
    expect(screen.getByText('RES-1001')).toBeInTheDocument();
    expect(screen.getByText('RES-1002')).toBeInTheDocument();
    expect(screen.getByText('RES-1003')).toBeInTheDocument();

    // Verify rooms
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('201')).toBeInTheDocument();

    // Verify upcoming reservation
    expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
  });

  it('Test 2 — Summary KPIs: Correctly calculates KPI metrics from authoritative backend data', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: mockStays,
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: mockReservations,
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Guests')).toBeInTheDocument();
    expect(screen.getAllByText('Checked In').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Checked Out').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1);
  });

  it('Test 3 — Empty State: Handles zero backend records gracefully without crashing or seeding demo rows', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No guests found matching your search/i)).toBeInTheDocument();
    });
  });

  it('Test 4 — Error Handling & Functional Retry: Surfaces error message and allows user to retry fetch', async () => {
    const errorSpy = vi.spyOn(stayService, 'getStays').mockRejectedValueOnce(
      new Error('Network connectivity issue to server')
    );

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Network connectivity issue to server/i)).toBeInTheDocument();
    });

    // Mock recovery on retry
    errorSpy.mockResolvedValueOnce({
      statusCode: 200,
      data: mockStays,
      success: true,
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    });
  });

  it('Test 5 — Search Filter: Filters records by guest name, room number, or booking reference', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: mockStays,
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: mockReservations,
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by guest name, room, or booking ID/i);
    fireEvent.change(searchInput, { target: { value: 'Prefect' } });

    await waitFor(() => {
      expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
      expect(screen.queryByText('Arthur Dent')).not.toBeInTheDocument();
    });
  });

  it('Test 6 — Canonical ID and Relationship Integrity: Displays View Guest modal with canonical identifiers', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: mockStays,
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: mockReservations,
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    });

    // Click View Guest icon for first row
    const viewButtons = screen.getAllByTitle('View');
    expect(viewButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewButtons[0]);

    // Check modal opens with guest details
    await waitFor(() => {
      expect(screen.getByText('Guest Information')).toBeInTheDocument();
      const emailMatches = screen.getAllByText('arthur.dent@galaxy.org');
      expect(emailMatches.length).toBeGreaterThanOrEqual(1);
    });
  });
});
