import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TapeChart from '../features/occupancy/pages/TapeChart';
import roomService from '../services/roomService';
import reservationService from '../services/reservationService';
import guestService from '../services/guestService';

// Mock services
vi.mock('../services/roomService', () => ({
  default: {
    getTapeChart: vi.fn(),
  },
}));

vi.mock('../services/reservationService', () => ({
  default: {
    getTapeChart: vi.fn(),
    checkAvailability: vi.fn(),
    createReservation: vi.fn(),
    getReservations: vi.fn(),
  },
}));

vi.mock('../services/guestService', () => ({
  default: {
    getGuests: vi.fn(),
    createGuest: vi.fn(),
  },
}));

describe('Phase 3 — Step 3: Reservation Creation from Empty Cells Integration Suite', () => {
  const mockRoomTypes = [
    {
      id: 'rt_suite',
      name: 'Deluxe Suite',
      code: 'DLX-S',
      base_price: 250,
      base_occupancy: 2,
      max_occupancy: 4,
    },
    {
      id: 'rt_standard',
      name: 'Standard Room',
      code: 'STD',
      base_price: 150,
      base_occupancy: 1,
      max_occupancy: 2,
    },
  ];

  const mockRooms = [
    {
      id: 'room_101',
      _id: 'room_101',
      room_number: '101',
      floor: '1',
      room_type_id: 'rt_suite',
      room_type_name: 'Deluxe Suite',
      room_type_code: 'DLX-S',
      status: 'AVAILABLE',
      housekeeping_status: 'CLEAN',
      active_maintenance: [],
    },
    {
      id: 'room_102',
      _id: 'room_102',
      room_number: '102',
      floor: '1',
      room_type_id: 'rt_suite',
      room_type_name: 'Deluxe Suite',
      room_type_code: 'DLX-S',
      status: 'OUT OF ORDER',
      housekeeping_status: 'DIRTY',
      active_maintenance: [],
    },
  ];

  // Room 101 is occupied from Nov 12 to Nov 15
  // Nov 10 and Nov 11 are empty!
  const mockTimelineItems = [
    {
      id: 'res_active_1',
      item_type: 'RESERVATION',
      type: 'RESERVATION',
      status: 'CONFIRMED',
      room_id: 'room_101',
      start_date: '2026-11-12',
      end_date: '2026-11-15',
      booking_ref: 'RES-101A',
      guest: {
        id: 'gst_1',
        name: 'John Doe',
      },
    },
  ];

  const defaultApiResponse = {
    statusCode: 200,
    data: {
      date_range: {
        start_date: '2026-11-10',
        end_date: '2026-11-17',
        total_days: 7,
      },
      room_types: mockRoomTypes,
      rooms: mockRooms,
      timeline_items: mockTimelineItems,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    roomService.getTapeChart.mockResolvedValue(defaultApiResponse);
    reservationService.checkAvailability.mockResolvedValue({ data: [] });
    guestService.getGuests.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------
  // 1. EMPTY CELL CLICK & MODAL PREFILL
  // ----------------------------------------------------
  describe('1. Empty-Cell Activation & Form Prefill', () => {
    it('clicking an eligible empty cell opens ReservationFormModal with room and check-in date prefilled', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      // Find eligible empty cell for Room 101 on 2026-11-10
      const emptyCellBtn = screen.getByTestId('empty-cell-101-2026-11-10');
      expect(emptyCellBtn).toBeInTheDocument();
      expect(emptyCellBtn).toHaveAttribute('aria-label', 'Book Room 101 on 2026-11-10');

      // Click the empty cell
      fireEvent.click(emptyCellBtn);

      // Verify ReservationFormModal is open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Add New Booking' })).toBeInTheDocument();
      });

      // Check prefilled check-in date
      const checkInInput = screen.getByLabelText(/Check In Date/i);
      expect(checkInInput.value).toBe('2026-11-10');

      // Check prefilled default check-out date (established +1 day default)
      const checkOutInput = screen.getByLabelText(/Check Out Date/i);
      expect(checkOutInput.value).toBe('2026-11-11');

      // Check prefilled room number
      const roomNoSelect = screen.getByLabelText(/Room \/ Room No\./i);
      expect(roomNoSelect.value).toBe('101');
    });

    it('supports keyboard activation via Enter key on focused empty cell', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      const emptyCellBtn = screen.getByTestId('empty-cell-101-2026-11-11');
      fireEvent.keyDown(emptyCellBtn, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const checkInInput = screen.getByLabelText(/Check In Date/i);
      expect(checkInInput.value).toBe('2026-11-11');
      const checkOutInput = screen.getByLabelText(/Check Out Date/i);
      expect(checkOutInput.value).toBe('2026-11-12');
    });
  });

  // ----------------------------------------------------
  // 2. OCCUPIED & INELIGIBLE CELL PROTECTION
  // ----------------------------------------------------
  describe('2. Occupied and Ineligible Cell Protection', () => {
    it('occupied cells (covered by existing reservation) do not render booking buttons and cannot initiate reservation', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      // For Room 101 on 2026-11-12, reservation exists: empty cell button should NOT exist
      expect(screen.queryByTestId('empty-cell-101-2026-11-12')).not.toBeInTheDocument();

      // Non-interactive cell exists instead
      const occupiedCell = screen.getByTestId('cell-101-2026-11-12');
      expect(occupiedCell).toBeInTheDocument();
      expect(occupiedCell.tagName.toLowerCase()).not.toBe('button');

      // Clicking occupied cell does NOT open modal
      fireEvent.click(occupiedCell);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('existing reservation blocks retain read-only behavior and do not open creation modal', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click the reservation block
      const reservationBlock = screen.getByText('John Doe');
      fireEvent.click(reservationBlock);

      // Verify creation modal did NOT open
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('out of order rooms do not render interactive booking buttons', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('102')).toBeInTheDocument();
      });

      // Room 102 is OUT OF ORDER: empty cell button should NOT exist
      expect(screen.queryByTestId('empty-cell-102-2026-11-10')).not.toBeInTheDocument();

      const oooCell = screen.getByTestId('cell-102-2026-11-10');
      expect(oooCell).toHaveAttribute('title', 'Room is Out of Order');

      fireEvent.click(oooCell);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ----------------------------------------------------
  // 3. CANCELLATION & TIMELINE RANGE PRESERVATION
  // ----------------------------------------------------
  describe('3. Cancellation & Range Preservation', () => {
    it('canceling creation closes modal without calling creation API or modifying timeline', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      // Open modal from empty cell
      fireEvent.click(screen.getByTestId('empty-cell-101-2026-11-10'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click Cancel
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(reservationService.createReservation).not.toHaveBeenCalled();
      // getTapeChart called once on initial mount only
      expect(roomService.getTapeChart).toHaveBeenCalledTimes(1);
    });
  });

  // ----------------------------------------------------
  // 4. SUCCESSFUL CREATION & BACKEND REFRESH
  // ----------------------------------------------------
  describe('4. Canonical Backend Creation & Authority Refresh', () => {
    it('successfully creates reservation via canonical service, closes modal, and re-fetches authoritative Tape Chart', async () => {
      const createdBackendReservation = {
        _id: 'res_created_99',
        id: 'res_created_99',
        booking_ref: 'RES-999999',
        status: 'CONFIRMED',
        expected_check_in: '2026-11-10T00:00:00.000Z',
        expected_check_out: '2026-11-11T00:00:00.000Z',
        primary_guest_id: 'gst_real_123',
        room_id: 'room_101',
        room_type_id: 'rt_suite',
      };

      reservationService.createReservation.mockResolvedValueOnce({
        statusCode: 201,
        data: { reservation: createdBackendReservation },
      });

      guestService.createGuest.mockResolvedValueOnce({
        statusCode: 201,
        data: {
          _id: 'gst_real_123',
          first_name: 'Alice',
          last_name: 'Wonderland',
          email: 'alice@example.com',
        },
      });

      // Tape Chart refreshed response containing the new reservation
      const refreshedApiResponse = {
        ...defaultApiResponse,
        data: {
          ...defaultApiResponse.data,
          timeline_items: [
            ...mockTimelineItems,
            {
              id: 'res_created_99',
              item_type: 'RESERVATION',
              type: 'RESERVATION',
              status: 'CONFIRMED',
              room_id: 'room_101',
              start_date: '2026-11-10',
              end_date: '2026-11-11',
              booking_ref: 'RES-999999',
              guest: { id: 'gst_real_123', name: 'Alice Wonderland' },
            },
          ],
        },
      };

      roomService.getTapeChart
        .mockResolvedValueOnce(defaultApiResponse)
        .mockResolvedValueOnce(refreshedApiResponse);

      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      // Click empty cell
      fireEvent.click(screen.getByTestId('empty-cell-101-2026-11-10'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fill required guest info
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Wonderland' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'alice@example.com' } });

      // Submit modal
      const submitBtn = screen.getByRole('button', { name: /Add New Booking/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(reservationService.createReservation).toHaveBeenCalledTimes(1);
      });

      // Verify canonical payload passed to createReservation
      const calledPayload = reservationService.createReservation.mock.calls[0][0];
      expect(calledPayload).toMatchObject({
        room_id: 'room_101',
        room_type_id: 'rt_suite',
      });
      expect(calledPayload.expected_check_in).toContain('2026-11-10');
      expect(calledPayload.expected_check_out).toContain('2026-11-11');

      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Verify tape chart was refreshed from backend
      await waitFor(() => {
        expect(roomService.getTapeChart).toHaveBeenCalledTimes(2);
        expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();
      });
    });
  });

  // ----------------------------------------------------
  // 5. AVAILABILITY CONFLICT REJECTION PROTECTION
  // ----------------------------------------------------
  describe('5. Availability Conflict Protection', () => {
    it('surfaces backend 409 conflict error in modal alert and prevents optimistic block creation', async () => {
      reservationService.createReservation.mockRejectedValueOnce(
        new Error('Room is already booked for the selected dates')
      );

      guestService.createGuest.mockResolvedValueOnce({
        statusCode: 201,
        data: { _id: 'gst_race_1', first_name: 'Bob', last_name: 'Builder' },
      });

      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      // Click empty cell
      fireEvent.click(screen.getByTestId('empty-cell-101-2026-11-10'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fill in name
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Bob' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Builder' } });

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /Add New Booking/i }));

      // Verify conflict error is displayed in the modal
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Room is already booked for the selected dates/i)).toBeInTheDocument();
      });

      // Form modal must remain open so user can adjust dates/room
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i).value).toBe('Bob');
      expect(screen.getByLabelText(/Check In Date/i).value).toBe('2026-11-10');

      // Close modal manually
      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // No false optimistic block exists on the Tape Chart
      expect(screen.queryByText('Bob Builder')).not.toBeInTheDocument();
      // Tape chart was not falsely refreshed with corrupted data
      expect(roomService.getTapeChart).toHaveBeenCalledTimes(1);
    });

    it('rejects submission when check-out date is not strictly after check-in date', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('empty-cell-101-2026-11-10'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Carol' } });

      // Set checkout equal to checkin (0 nights)
      fireEvent.change(screen.getByLabelText(/Check Out Date/i), { target: { value: '2026-11-10' } });

      fireEvent.click(screen.getByRole('button', { name: /Add New Booking/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Check Out Date must be strictly after Check In Date/i)).toBeInTheDocument();
      });

      expect(reservationService.createReservation).not.toHaveBeenCalled();
    });
  });
});
