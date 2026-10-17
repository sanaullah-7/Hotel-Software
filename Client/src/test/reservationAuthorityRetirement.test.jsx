import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import AllBookings from '../features/reservations/pages/AllReservations';
import AddReservation from '../features/reservations/pages/AddReservation';
import EditReservation from '../features/reservations/pages/EditReservation';
import ReservationHistory from '../features/reservations/pages/ReservationHistory';
import CurrentBookingsTable from '../pages/Dashboard/components/CurrentBookingsTable';
import reservationService from '../services/reservationService';
import stayService from '../services/stayService';
import guestService from '../services/guestService';
import { getReservations } from '../features/reservations/state/reservationStore';

describe('Step 1: Reservation Frontend Authority Retirement Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    cleanup();
  });

  const sampleBackendRes = {
    _id: '67a1b2c3d4e5f67890123456',
    booking_ref: 'RES-AUTH-001',
    status: 'CONFIRMED',
    expected_check_in: '2026-11-10T14:00:00.000Z',
    expected_check_out: '2026-11-15T11:00:00.000Z',
    adults: 2,
    children: 0,
    primary_guest_id: {
      _id: '67a1b2c3d4e5f67890123457',
      first_name: 'Arthur',
      last_name: 'Pendelton',
      email: 'arthur.p@example.com',
      phone: '+15551239876',
    },
    rooms: [
      {
        room_id: {
          _id: '67a1b2c3d4e5f67890123458',
          room_number: '101',
        },
        room_type_id: {
          _id: '67a1b2c3d4e5f67890123459',
          name: 'Deluxe Room',
        },
      },
    ],
    created_at: '2026-10-01T10:00:00.000Z',
  };

  const sampleCheckedInRes = {
    _id: '67a1b2c3d4e5f67890123470',
    booking_ref: 'RES-INHOUSE-001',
    status: 'IN_HOUSE',
    expected_check_in: '2026-10-01T14:00:00.000Z',
    expected_check_out: '2026-10-10T11:00:00.000Z',
    adults: 1,
    children: 0,
    primary_guest_id: {
      _id: '67a1b2c3d4e5f67890123471',
      first_name: 'Clara',
      last_name: 'Oswald',
      email: 'clara@example.com',
      phone: '+15559998888',
    },
    rooms: [
      {
        room_id: {
          _id: '67a1b2c3d4e5f67890123472',
          room_number: '201',
        },
        room_type_id: {
          _id: '67a1b2c3d4e5f67890123473',
          name: 'Standard Room',
        },
      },
    ],
    created_at: '2026-10-01T10:00:00.000Z',
  };

  describe('1. AllReservations Backend Authority (Steps 1B, 1C, 1D)', () => {
    it('Step 1B: Empty backend response [] renders empty state without stale fallback', async () => {
      localStorage.setItem('hotel_reservations', JSON.stringify([{ id: 'STALE-1', name: 'Stale Ghost Guest' }]));

      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [],
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

      expect(screen.queryByText('Stale Ghost Guest')).not.toBeInTheDocument();
      expect(getReservations()).toHaveLength(0);
    });

    it('Step 1C: Cancellation calls backend and updates UI upon confirmation', async () => {
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [sampleBackendRes],
        success: true,
      });

      const cancelSpy = vi.spyOn(reservationService, 'cancelReservation').mockResolvedValue({
        statusCode: 200,
        data: {
          ...sampleBackendRes,
          status: 'CANCELLED',
          cancellation_reason: 'Cancelled by user',
        },
        success: true,
      });

      render(
        <BrowserRouter>
          <AllBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Arthur Pendelton')).toBeInTheDocument();
      });

      const actionBtn = screen.getByRole('button', { name: /more actions/i });
      fireEvent.click(actionBtn);

      const cancelMenuOption = screen.getByRole('menuitem', { name: /cancel booking/i });
      fireEvent.click(cancelMenuOption);

      const submitBtn = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(cancelSpy).toHaveBeenCalledWith('67a1b2c3d4e5f67890123456', 'Cancelled by user');
      });

      await waitFor(() => {
        expect(screen.getByText('Cancelled')).toBeInTheDocument();
      });
    });

    it('Step 1C: Cancellation rejection does NOT locally mark reservation cancelled', async () => {
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [sampleBackendRes],
        success: true,
      });

      vi.spyOn(reservationService, 'cancelReservation').mockRejectedValue(
        new Error('Cancellation rejected: past cancellation deadline')
      );
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <BrowserRouter>
          <AllBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Arthur Pendelton')).toBeInTheDocument();
      });

      const actionBtn = screen.getByRole('button', { name: /more actions/i });
      fireEvent.click(actionBtn);

      const cancelMenuOption = screen.getByRole('menuitem', { name: /cancel booking/i });
      fireEvent.click(cancelMenuOption);

      const submitBtn = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Cancellation rejected: past cancellation deadline');
      });

      expect(screen.getByText('Booked')).toBeInTheDocument();
      expect(screen.queryByText('Cancelled')).not.toBeInTheDocument();
    });

    it('Step 1D: Checkout uses backend Stay/Checkout flow and updates UI upon success', async () => {
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [sampleCheckedInRes],
        success: true,
      });

      const checkOutSpy = vi.spyOn(stayService, 'checkOut').mockResolvedValue({
        statusCode: 200,
        data: {
          stay: { _id: 'stay-123', status: 'CHECKED_OUT' },
          reservation: {
            ...sampleCheckedInRes,
            status: 'CHECKED_OUT',
          },
        },
        success: true,
      });

      render(
        <BrowserRouter>
          <AllBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Clara Oswald')).toBeInTheDocument();
        expect(screen.getByText('Checked In')).toBeInTheDocument();
      });

      const actionBtn = screen.getByRole('button', { name: /more actions/i });
      fireEvent.click(actionBtn);

      const checkoutOption = screen.getByRole('menuitem', { name: /check out/i });
      fireEvent.click(checkoutOption);

      await waitFor(() => {
        expect(checkOutSpy).toHaveBeenCalledWith(expect.objectContaining({
          reservation_id: '67a1b2c3d4e5f67890123470',
        }));
      });

      await waitFor(() => {
        expect(screen.getByText('Checked Out')).toBeInTheDocument();
      });
    });

    it('Step 1D: Failed checkout does NOT locally mark reservation checked out', async () => {
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [sampleCheckedInRes],
        success: true,
      });

      vi.spyOn(stayService, 'checkOut').mockRejectedValue(
        new Error('Unsettled balance remaining on stay folio')
      );
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <BrowserRouter>
          <AllBookings />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Clara Oswald')).toBeInTheDocument();
      });

      const actionBtn = screen.getByRole('button', { name: /more actions/i });
      fireEvent.click(actionBtn);

      const checkoutOption = screen.getByRole('menuitem', { name: /check out/i });
      fireEvent.click(checkoutOption);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Unsettled balance remaining on stay folio');
      });

      expect(screen.getByText('Checked In')).toBeInTheDocument();
      expect(screen.queryByText('Checked Out')).not.toBeInTheDocument();
    });
  });

  describe('2. CurrentBookingsTable Authority (Step 1I)', () => {
    it('Empty backend response [] renders empty state without initialBookings fallback', async () => {
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [],
        success: true,
      });

      render(
        <BrowserRouter>
          <CurrentBookingsTable />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no bookings found matching criteria/i)).toBeInTheDocument();
      });
    });

    it('Cancellation calls backend cancelReservation and dispatches canonical ID', async () => {
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [sampleBackendRes],
        success: true,
      });

      const cancelSpy = vi.spyOn(reservationService, 'cancelReservation').mockResolvedValue({
        statusCode: 200,
        data: {
          ...sampleBackendRes,
          status: 'CANCELLED',
        },
        success: true,
      });

      render(
        <BrowserRouter>
          <CurrentBookingsTable />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Arthur Pendelton')).toBeInTheDocument();
      });

      const actionBtn = screen.getByRole('button', { name: /more actions/i });
      fireEvent.click(actionBtn);

      const cancelOption = screen.getByRole('menuitem', { name: /cancel booking/i });
      fireEvent.click(cancelOption);

      const submitBtn = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(cancelSpy).toHaveBeenCalledWith('67a1b2c3d4e5f67890123456', 'Cancelled from dashboard');
      });
    });

    it('Checkout uses backend stayService.checkOut', async () => {
      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [sampleCheckedInRes],
        success: true,
      });

      const checkOutSpy = vi.spyOn(stayService, 'checkOut').mockResolvedValue({
        statusCode: 200,
        data: {
          stay: { _id: 'stay-123', status: 'CHECKED_OUT' },
          reservation: {
            ...sampleCheckedInRes,
            status: 'CHECKED_OUT',
          },
        },
        success: true,
      });

      render(
        <BrowserRouter>
          <CurrentBookingsTable />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Clara Oswald')).toBeInTheDocument();
      });

      const actionBtn = screen.getByRole('button', { name: /more actions/i });
      fireEvent.click(actionBtn);

      const checkOutOption = screen.getByRole('menuitem', { name: /check out/i });
      fireEvent.click(checkOutOption);

      await waitFor(() => {
        expect(checkOutSpy).toHaveBeenCalledWith(expect.objectContaining({
          reservation_id: '67a1b2c3d4e5f67890123470',
        }));
      });
    });
  });

  describe('3. ReservationHistory Read Authority (Step 1H)', () => {
    it('Empty backend response [] renders empty state without falling back to stale data', async () => {
      localStorage.setItem('hotel_reservations', JSON.stringify([{ id: 'OLD-HIST', name: 'Old Ghost', status: 'Checked Out' }]));

      vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
        statusCode: 200,
        data: [],
        success: true,
      });

      render(
        <BrowserRouter>
          <ReservationHistory />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/no reservations found/i)).toBeInTheDocument();
      });

      expect(screen.queryByText('Old Ghost')).not.toBeInTheDocument();
    });
  });

  describe('4. Reservation Availability Backend Authority (Step 1E)', () => {
    it('AddReservation: Queries backend checkAvailability on dates and enforces available room count', async () => {
      const availSpy = vi.spyOn(reservationService, 'checkAvailability').mockResolvedValue({
        statusCode: 200,
        data: [
          {
            room_type_id: '67a1b2c3d4e5f67890123459',
            room_type_name: 'Deluxe Room',
            room_type_code: 'DLX',
            total_rooms: 10,
            booked_rooms: 10,
            available_rooms: 0,
            is_available: false,
          },
        ],
        success: true,
      });

      render(
        <BrowserRouter>
          <AddReservation />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/departure date/i), { target: { value: '2026-09-20' } });

      await waitFor(() => {
        expect(availSpy).toHaveBeenCalled();
      });

      const roomTypeSelect = screen.getByRole('combobox', { name: /Select Room Type/i });
      fireEvent.mouseDown(roomTypeSelect);
      const deluxeOption = screen.getByRole('option', { name: 'Deluxe Room' });
      fireEvent.click(deluxeOption);

      expect(screen.queryByRole('button', { name: '[101]' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '[102]' })).not.toBeInTheDocument();
    });

    it('EditReservation: Queries backend checkAvailability on dates', async () => {
      vi.spyOn(reservationService, 'getReservationById').mockResolvedValue({
        statusCode: 200,
        data: { reservation: sampleBackendRes },
      });

      const availSpy = vi.spyOn(reservationService, 'checkAvailability').mockResolvedValue({
        statusCode: 200,
        data: [
          {
            room_type_id: '67a1b2c3d4e5f67890123459',
            room_type_name: 'Deluxe Room',
            room_type_code: 'DLX',
            total_rooms: 5,
            booked_rooms: 2,
            available_rooms: 3,
            is_available: true,
          },
        ],
        success: true,
      });

      render(
        <MemoryRouter initialEntries={['/reservation/edit/67a1b2c3d4e5f67890123456']}>
          <Routes>
            <Route path="/reservation/edit/:id" element={<EditReservation />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Arthur')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/departure date/i), { target: { value: '2026-11-20' } });

      await waitFor(() => {
        expect(availSpy).toHaveBeenCalled();
      });
    });
  });

  describe('5. Creation & Edit Backend Authority (Steps 1F & 1G)', () => {
    it('AddReservation: Backend failure surfaces error without saving fake local reservation', async () => {
      vi.spyOn(guestService, 'getGuests').mockResolvedValue({
        data: [{
          _id: '67a1b2c3d4e5f67890123457',
          first_name: 'David',
          last_name: 'Miller',
        }],
      });

      vi.spyOn(guestService, 'createGuest').mockResolvedValue({
        data: {
          _id: '67a1b2c3d4e5f67890123457',
          first_name: 'David',
          last_name: 'Miller',
        },
      });

      vi.spyOn(reservationService, 'createReservation').mockRejectedValue(
        new Error('Internal Server Error: Database connection lost')
      );

      render(
        <BrowserRouter>
          <AddReservation />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'David' } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Miller' } });

      fireEvent.submit(screen.getByRole('button', { name: /save booking/i }).closest('form'));

      await waitFor(() => {
        expect(screen.getByText(/Database connection lost/i)).toBeInTheDocument();
      });

      expect(getReservations().length).toBe(0);
    });

    it('EditReservation: Backend failure surfaces error without falsely reporting success', async () => {
      vi.spyOn(reservationService, 'getReservationById').mockResolvedValue({
        statusCode: 200,
        data: { reservation: sampleBackendRes },
      });

      vi.spyOn(reservationService, 'updateReservation').mockRejectedValue(
        new Error('Room maintenance lockout for updated dates')
      );

      render(
        <MemoryRouter initialEntries={['/reservation/edit/67a1b2c3d4e5f67890123456']}>
          <Routes>
            <Route path="/reservation/edit/:id" element={<EditReservation />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Arthur')).toBeInTheDocument();
      });

      const updateBtn = screen.getByRole('button', { name: /update booking/i });
      fireEvent.submit(updateBtn.closest('form'));

      await waitFor(() => {
        expect(screen.getByText(/Room maintenance lockout for updated dates/i)).toBeInTheDocument();
      });
    });
  });
});
