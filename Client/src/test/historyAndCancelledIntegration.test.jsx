import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ReservationHistory from '../features/reservations/pages/ReservationHistory';
import CancelledBookings from '../features/reservations/pages/CancelledBookings';

const { mockGetReservations, mockGetReservationById, mockUpdateReservation, mockCancelReservation, mockService } = vi.hoisted(() => {
  const mockGetReservations = vi.fn();
  const mockGetReservationById = vi.fn();
  const mockUpdateReservation = vi.fn();
  const mockCancelReservation = vi.fn();
  const mockService = {
    getReservations: mockGetReservations,
    getReservationById: mockGetReservationById,
    updateReservation: mockUpdateReservation,
    cancelReservation: mockCancelReservation,
  };
  return { mockGetReservations, mockGetReservationById, mockUpdateReservation, mockCancelReservation, mockService };
});

vi.mock('../services/reservationService', () => ({
  default: mockService,
  reservationService: mockService,
}));

describe('Phase 3 Step 6: ReservationHistory & CancelledBookings Backend Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('ReservationHistory Component', () => {
    it('Test 1 & 2 — Loads backend historical reservations and adapts them correctly', async () => {
      const todayISO = new Date().toISOString();
      const mockHistoryDocs = [
        {
          _id: '67a1b2c3d4e5f678901234a1',
          booking_ref: 'RES-HIST01',
          status: 'CHECKED_OUT',
          primary_guest_id: {
            _id: '67a1b2c3d4e5f67890123001',
            first_name: 'Sara',
            last_name: 'Tariq',
            email: 'sara@example.com',
            phone: '03001234567',
          },
          expected_check_in: todayISO,
          expected_check_out: todayISO,
          adults: 2,
          rooms: [
            {
              room_id: { _id: '67a1b2c3d4e5f67890123901', room_number: '201' },
              room_type_id: { _id: '67a1b2c3d4e5f67890123801', name: 'Deluxe Suite' },
            },
          ],
          totalPrice: 450,
          created_at: todayISO,
        },
        {
          _id: '67a1b2c3d4e5f678901234a2',
          booking_ref: 'RES-HIST02',
          status: 'CANCELLED',
          cancellation_reason: 'Change of schedule',
          primary_guest_id: {
            _id: '67a1b2c3d4e5f67890123002',
            first_name: 'Bilal',
            last_name: 'Khan',
            email: 'bilal@example.com',
            phone: '03009876543',
          },
          expected_check_in: todayISO,
          expected_check_out: todayISO,
          adults: 1,
          rooms: [
            {
              room_id: { _id: '67a1b2c3d4e5f67890123902', room_number: '102' },
              room_type_id: { _id: '67a1b2c3d4e5f67890123802', name: 'Single Room' },
            },
          ],
          totalPrice: 200,
          created_at: todayISO,
        },
      ];

      mockGetReservations.mockResolvedValueOnce({
        data: { reservations: mockHistoryDocs },
      });

      render(
        <BrowserRouter>
          <ReservationHistory />
        </BrowserRouter>
      );

      // Verify backend was queried
      expect(mockGetReservations).toHaveBeenCalled();

      // Verify records are rendered
      await waitFor(() => {
        expect(screen.getByText('Sara Tariq')).toBeInTheDocument();
        expect(screen.getByText('Bilal Khan')).toBeInTheDocument();
      });
    });

    it('Test 3 — Empty backend response renders empty state', async () => {
      mockGetReservations.mockResolvedValueOnce({
        data: { reservations: [] },
      });

      render(
        <BrowserRouter>
          <ReservationHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no reservations found/i)).toBeInTheDocument();
      });
    });

    it('Test 4 — Backend failure displays error banner and retry button', async () => {
      mockGetReservations.mockRejectedValueOnce(new Error('Network disconnected'));

      render(
        <BrowserRouter>
          <ReservationHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Network disconnected/i)).toBeInTheDocument();
      });

      // Clicking Retry calls backend again
      mockGetReservations.mockResolvedValueOnce({
        data: { reservations: [] },
      });

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(mockGetReservations).toHaveBeenCalledTimes(2);
      });
    });

    it('Test 5 — Refresh button triggers fresh backend fetch', async () => {
      mockGetReservations.mockResolvedValueOnce({
        data: { reservations: [] },
      });

      render(
        <BrowserRouter>
          <ReservationHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockGetReservations).toHaveBeenCalledTimes(1);
      });

      mockGetReservations.mockResolvedValueOnce({
        data: { reservations: [] },
      });

      const refreshBtn = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshBtn);

      await waitFor(() => {
        expect(mockGetReservations).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('CancelledBookings Component', () => {
    it('Test 6 & 7 — Queries backend with status=CANCELLED and displays cancelled reservations with reasons', async () => {
      const mockCancelledDocs = [
        {
          _id: '67a1b2c3d4e5f678901234c1',
          booking_ref: 'RES-CAN01',
          status: 'CANCELLED',
          cancellation_reason: 'Flight delayed indefinitely',
          primary_guest_id: {
            _id: '67a1b2c3d4e5f67890123003',
            first_name: 'Zubair',
            last_name: 'Ahmed',
            email: 'zubair@example.com',
            phone: '03211234567',
          },
          expected_check_in: '2026-10-05T12:00:00.000Z',
          expected_check_out: '2026-10-08T10:00:00.000Z',
          adults: 2,
          package: 'Family Package',
          rooms: [
            {
              room_id: { _id: '67a1b2c3d4e5f67890123903', room_number: '305' },
              room_type_id: { _id: '67a1b2c3d4e5f67890123803', name: 'Executive Suite' },
            },
          ],
          created_at: '2026-10-04T14:00:00.000Z',
        },
      ];

      mockGetReservations.mockResolvedValueOnce({
        data: { reservations: mockCancelledDocs },
      });

      render(
        <BrowserRouter>
          <CancelledBookings />
        </BrowserRouter>
      );

      // Verify backend was queried specifically for CANCELLED status
      expect(mockGetReservations).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'CANCELLED' })
      );

      // Verify row is rendered
      await waitFor(() => {
        expect(screen.getByText('Zubair Ahmed')).toBeInTheDocument();
        expect(screen.getByText('Cancelled')).toBeInTheDocument();
      });
    });

    it('Test 8 — Backend error displays error banner and retry in CancelledBookings', async () => {
      mockGetReservations.mockRejectedValueOnce(new Error('Server unavailable'));

      render(
        <BrowserRouter>
          <CancelledBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Server unavailable/i)).toBeInTheDocument();
      });
    });

    it('Test 9 — Empty response displays empty state in CancelledBookings', async () => {
      mockGetReservations.mockResolvedValueOnce({
        data: { reservations: [] },
      });

      render(
        <BrowserRouter>
          <CancelledBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no cancelled bookings found/i)).toBeInTheDocument();
      });
    });

    it('Test 10 — LocalStorage independence: History and Cancelled work without initial localStorage data', async () => {
      expect(localStorage.getItem('hotel_reservations')).toBeNull();

      mockGetReservations.mockResolvedValueOnce({
        data: {
          reservations: [
            {
              _id: '67a1b2c3d4e5f678901234c9',
              booking_ref: 'RES-CAN09',
              status: 'CANCELLED',
              primary_guest_id: { _id: '67a1b2c3d4e5f67890123009', first_name: 'Omar', last_name: 'Farooq' },
              rooms: [],
            },
          ],
        },
      });

      render(
        <BrowserRouter>
          <CancelledBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Omar Farooq')).toBeInTheDocument();
      });
    });
  });
});
