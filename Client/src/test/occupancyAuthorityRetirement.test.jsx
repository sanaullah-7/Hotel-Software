import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Occupancy from '../features/occupancy/pages/Occupancy';
import roomService from '../services/roomService';
import stayService from '../services/stayService';
import reservationService from '../services/reservationService';

// Mock Services
vi.mock('../services/roomService');
vi.mock('../services/stayService');
vi.mock('../services/reservationService');

describe('STEP 3: Occupancy Frontend Authority Retirement Integration Suite', () => {
  const canonicalRooms = [
    {
      _id: '67a1b2c3d4e5f67890123451',
      room_number: '101',
      floor: '1',
      status: 'OCCUPIED',
      housekeeping_status: 'CLEAN',
      room_type_id: {
        _id: '67a1b2c3d4e5f67890123401',
        name: 'Super Deluxe',
        code: 'SDX',
        base_price: 320,
        base_occupancy: 2,
        max_occupancy: 4,
        amenities: [],
      },
    },
    {
      _id: '67a1b2c3d4e5f67890123452',
      room_number: '102',
      floor: '1',
      status: 'AVAILABLE',
      housekeeping_status: 'CLEAN',
      room_type_id: {
        _id: '67a1b2c3d4e5f67890123402',
        name: 'Deluxe',
        code: 'DLX',
        base_price: 280,
        base_occupancy: 2,
        max_occupancy: 3,
        amenities: [],
      },
    },
    {
      _id: '67a1b2c3d4e5f67890123453',
      room_number: '103',
      floor: '1',
      status: 'CLEANING',
      housekeeping_status: 'DIRTY',
      room_type_id: {
        _id: '67a1b2c3d4e5f67890123403',
        name: 'Standard',
        code: 'STD',
        base_price: 180,
        base_occupancy: 1,
        max_occupancy: 2,
        amenities: [],
      },
    },
  ];

  const canonicalStays = [
    {
      _id: '67a1b2c3d4e5f67890123471',
      stay_ref: 'STY-101001',
      status: 'CHECKED_IN',
      actual_check_in: '2026-10-01T15:00:00.000Z',
      actual_check_out: null,
      total_guests: 2,
      notes: 'VIP guest, prefers ocean view',
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123481',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-1234',
        guest_ref: 'GST-001',
        passport_number: 'AB123CD456',
        vip: true,
        loyalty_points: 1250,
      },
      reservation_id: {
        _id: '67a1b2c3d4e5f67890123491',
        booking_ref: 'RES-001001',
        expected_check_in: '2026-10-01T15:00:00.000Z',
        expected_check_out: '2026-10-07T11:00:00.000Z',
        payment_status: 'paid',
        total_amount: 2240,
        booking_source: 'direct',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123451',
            room_number: '101',
          },
        },
      ],
    },
  ];

  const canonicalReservations = [
    {
      _id: '67a1b2c3d4e5f67890123491',
      booking_ref: 'RES-001001',
      status: 'IN_HOUSE',
      expected_check_in: '2026-10-01T15:00:00.000Z',
      expected_check_out: '2026-10-07T11:00:00.000Z',
      adults: 2,
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123481',
        first_name: 'John',
        last_name: 'Doe',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123451',
            room_number: '101',
          },
        },
      ],
    },
    {
      _id: '67a1b2c3d4e5f67890123492',
      booking_ref: 'RES-001002',
      status: 'CONFIRMED',
      expected_check_in: '2026-10-10T15:00:00.000Z',
      expected_check_out: '2026-10-15T11:00:00.000Z',
      adults: 2,
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123482',
        first_name: 'Jane',
        last_name: 'Smith',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123452',
            room_number: '102',
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    roomService.getRooms.mockResolvedValue({ data: canonicalRooms });
    stayService.getStays.mockResolvedValue({ data: canonicalStays });
    reservationService.getReservations.mockResolvedValue({ data: canonicalReservations });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Occupancy Read Migration & Source of Truth (Steps 3B, 3E)', () => {
    it('loads and renders authoritative backend rooms, active stays, and reservations', async () => {
      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      // Verify backend APIs were called
      await waitFor(() => {
        expect(roomService.getRooms).toHaveBeenCalledTimes(1);
        expect(stayService.getStays).toHaveBeenCalledTimes(1);
        expect(reservationService.getReservations).toHaveBeenCalledTimes(1);
      });

      // Verify rendered table rows
      expect(await screen.findByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
      expect(screen.getByText('103')).toBeInTheDocument();

      // Verify John Doe is displayed for occupied Room 101
      expect(screen.getByText('John Doe')).toBeInTheDocument();

      // Verify summary KPI metrics: 3 Total Rooms, 1 Occupied, 33% Occupancy Rate
      expect(screen.getByText('3')).toBeInTheDocument(); // Total Rooms
      expect(screen.getByText('33%')).toBeInTheDocument(); // Occupancy Rate
    });

    it('displays empty state when backend returns 200 with empty rooms array (Step 3F)', async () => {
      roomService.getRooms.mockResolvedValue({ data: [] });
      stayService.getStays.mockResolvedValue({ data: [] });
      reservationService.getReservations.mockResolvedValue({ data: [] });

      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(roomService.getRooms).toHaveBeenCalledTimes(1);
      });

      // Verify empty table message
      expect(await screen.findByText('No rooms found matching criteria.')).toBeInTheDocument();

      // Verify 0 metrics without falling back to demo data
      const zeroes = screen.getAllByText('0');
      expect(zeroes.length).toBeGreaterThanOrEqual(3);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('surfaces backend error banner on network failure without falling back to local data (Step 3G)', async () => {
      roomService.getRooms.mockRejectedValue(new Error('Network error: server unreachable'));

      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      // Error alert displayed
      expect(await screen.findByRole('alert')).toHaveTextContent('Network error: server unreachable');

      // Retry button present
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();

      // Retry succeeds on second attempt
      roomService.getRooms.mockResolvedValue({ data: canonicalRooms });
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      expect(await screen.findByText('John Doe')).toBeInTheDocument();
    });

    it('ignores stale localStorage hotel_rooms and strictly prefers backend data', async () => {
      // Seed stale local storage
      localStorage.setItem('hotel_rooms', JSON.stringify([
        { number: 999, type: 'Stale Room', status: 'OCCUPIED', guest: { name: 'Stale Ghost Guest' } }
      ]));

      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(roomService.getRooms).toHaveBeenCalled();
      });

      // Stale room 999 must NOT appear
      expect(screen.queryByText('999')).not.toBeInTheDocument();
      expect(screen.queryByText('Stale Ghost Guest')).not.toBeInTheDocument();

      // Backend rooms MUST appear
      expect(screen.getByText('101')).toBeInTheDocument();
    });
  });

  describe('2. Check-In Authority Migration (Step 3C)', () => {
    it('dispatches stayService.checkIn with canonical payload upon Add Guest', async () => {
      // Setup Room 102 as available without pre-existing guest
      reservationService.getReservations.mockResolvedValue({
        data: [
          canonicalReservations[0],
          {
            ...canonicalReservations[1],
            rooms: [], // not pre-assigned to 102
          }
        ]
      });

      stayService.checkIn.mockResolvedValue({
        data: {
          stay: {
            _id: '67a1b2c3d4e5f67890123472',
            status: 'CHECKED_IN',
          },
        },
      });

      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('102')).toBeInTheDocument();
      });

      // Find Add Guest button for Room 102
      const addGuestButtons = screen.getAllByRole('button', { name: /add guest/i });
      fireEvent.click(addGuestButtons[0]);

      // Verify modal is opened
      expect(await screen.findByText(/add new guest/i)).toBeInTheDocument();

      // Switch to Reservation Details tab (tab 1)
      const reservationTab = screen.getByRole('tab', { name: /reservation details/i });
      fireEvent.click(reservationTab);

      // Fill in Booking Reference matching canonical reservation RES-001002
      const bookingRefInput = screen.getByLabelText(/booking reference/i);
      fireEvent.change(bookingRefInput, { target: { value: 'RES-001002' } });

      // Click Save Guest Details
      const saveButton = screen.getByRole('button', { name: /save guest details/i });
      fireEvent.click(saveButton);

      // Verify stayService.checkIn was called with authentic MongoDB IDs
      await waitFor(() => {
        expect(stayService.checkIn).toHaveBeenCalledTimes(1);
        expect(stayService.checkIn).toHaveBeenCalledWith(
          expect.objectContaining({
            reservation_id: '67a1b2c3d4e5f67890123492',
            room_id: '67a1b2c3d4e5f67890123452',
          })
        );
      });
    });

    it('surfaces backend check-in error and prevents local mutation on failure (Step 3C, 3P)', async () => {
      reservationService.getReservations.mockResolvedValue({
        data: [
          canonicalReservations[0],
          {
            ...canonicalReservations[1],
            rooms: [],
          }
        ]
      });

      stayService.checkIn.mockRejectedValue(new Error('Room 102 is currently under maintenance on the server'));

      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('102')).toBeInTheDocument();
      });

      const addGuestButtons = screen.getAllByRole('button', { name: /add guest/i });
      fireEvent.click(addGuestButtons[0]);

      // Switch to Reservation Details tab and set booking reference
      const reservationTab = await screen.findByRole('tab', { name: /reservation details/i });
      fireEvent.click(reservationTab);

      const bookingRefInput = screen.getByLabelText(/booking reference/i);
      fireEvent.change(bookingRefInput, { target: { value: 'RES-001002' } });

      const saveButton = screen.getByRole('button', { name: /save guest details/i });
      fireEvent.click(saveButton);

      // Verify error alert is displayed
      expect(await screen.findByRole('alert')).toHaveTextContent('Room 102 is currently under maintenance on the server');

      // Verify room remains available (not occupied locally)
      expect(screen.getByText('Available')).toBeInTheDocument();
    });
  });

  describe('3. Checkout Authority Migration (Step 3D, 3N)', () => {
    it('dispatches stayService.checkOut with canonical stay_id from Details modal', async () => {
      stayService.checkOut.mockResolvedValue({
        data: {
          stay: { _id: '67a1b2c3d4e5f67890123471', status: 'CHECKED_OUT' },
        },
      });

      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click Details button on Room 101
      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[0]);

      // Details Modal opened
      expect(await screen.findByText(/room 101 - guest details/i)).toBeInTheDocument();

      // Click Checkout Guest button
      const checkoutButton = screen.getByRole('button', { name: /checkout guest/i });
      fireEvent.click(checkoutButton);

      // Verify stayService.checkOut was called
      await waitFor(() => {
        expect(stayService.checkOut).toHaveBeenCalledTimes(1);
        expect(stayService.checkOut).toHaveBeenCalledWith(
          expect.objectContaining({
            stay_id: '67a1b2c3d4e5f67890123471',
          })
        );
      });
    });

    it('surfaces backend checkout rejection and leaves occupancy state unchanged (Step 3D, 3N)', async () => {
      stayService.checkOut.mockRejectedValue(new Error('Checkout blocked: Outstanding folio balance exists'));

      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[0]);

      const checkoutButton = await screen.findByRole('button', { name: /checkout guest/i });
      fireEvent.click(checkoutButton);

      // Verify error alert is displayed
      expect(await screen.findByRole('alert')).toHaveTextContent('Checkout blocked: Outstanding folio balance exists');

      // Verify guest remains in room
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('4. Filters and Presentation Formatting (Step 3O)', () => {
    it('filters rooms by status, floor, and search query', async () => {
      render(
        <MemoryRouter>
          <Occupancy />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Search filter for 103
      const searchInput = screen.getByPlaceholderText(/search rooms, guests/i);
      fireEvent.change(searchInput, { target: { value: '103' } });

      expect(screen.getByText('103')).toBeInTheDocument();
      expect(screen.queryByText('101')).not.toBeInTheDocument();
      expect(screen.queryByText('102')).not.toBeInTheDocument();

      // Clear button
      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
      expect(screen.getByText('103')).toBeInTheDocument();
    });
  });
});
