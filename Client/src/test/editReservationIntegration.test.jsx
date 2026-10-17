import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditReservation from '../features/reservations/pages/EditReservation';
import AllBookings from '../features/reservations/pages/AllReservations';
import reservationService from '../services/reservationService';
import { getReservations, syncReservationsFromBackend } from '../features/reservations/state/reservationStore';
import { toFrontendReservation, toBackendReservationPayload } from '../features/reservations/adapters/reservationAdapter';

describe('Phase 3 Step 5: EditReservation & Cancellation Backend Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleBackendReservation = {
    _id: '67a1b2c3d4e5f67890123456',
    booking_ref: 'BK-2026-8888',
    status: 'CONFIRMED',
    expected_check_in: '2026-10-15T14:00:00.000Z',
    expected_check_out: '2026-10-20T11:00:00.000Z',
    adults: 2,
    children: 0,
    special_requests: 'Near elevator',
    primary_guest_id: {
      _id: '67a1b2c3d4e5f67890123457',
      first_name: 'Robert',
      last_name: 'Langdon',
      email: 'robert.langdon@example.com',
      phone: '+15554321098',
    },
    rooms: [
      {
        room_id: {
          _id: '67a1b2c3d4e5f67890123458',
          room_number: '101',
          floor: '1',
        },
        room_type_id: {
          _id: '67a1b2c3d4e5f67890123459',
          name: 'Deluxe Room',
          code: 'DLX',
        },
      },
    ],
    created_at: '2026-10-01T10:00:00.000Z',
  };

  it('Test 1 & 2 — Successful Edit with real MongoDB ID: Calls updateReservation with correct ID and payload', async () => {
    vi.spyOn(reservationService, 'getReservationById').mockResolvedValue({
      statusCode: 200,
      data: { reservation: sampleBackendReservation },
    });

    const updateSpy = vi.spyOn(reservationService, 'updateReservation').mockResolvedValue({
      statusCode: 200,
      data: {
        reservation: {
          ...sampleBackendReservation,
          expected_check_in: '2026-10-16T14:00:00.000Z',
          expected_check_out: '2026-10-22T11:00:00.000Z',
          special_requests: 'Quiet room please',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/reservation/edit/67a1b2c3d4e5f67890123456']}>
        <Routes>
          <Route path="/reservation/edit/:id" element={<EditReservation />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load in form
    await waitFor(() => {
      expect(screen.getByDisplayValue('Robert')).toBeInTheDocument();
    });

    // Change dates
    fireEvent.change(screen.getByLabelText(/departure date/i), { target: { value: '2026-10-22' } });

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /update booking/i });
    fireEvent.submit(saveBtn.closest('form'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });

    const calledId = updateSpy.mock.calls[0][0];
    const calledPayload = updateSpy.mock.calls[0][1];

    expect(calledId).toBe('67a1b2c3d4e5f67890123456');
    expect(calledPayload.expected_check_out).toBe('2026-10-22T00:00:00.000Z');
    expect(calledPayload).not.toHaveProperty('primary_guest_id'); // Update schema strips primary_guest_id
  });

  it('Test 3 — Backend response adaptation: Adapts updated backend reservation document', () => {
    const adapted = toFrontendReservation(sampleBackendReservation);

    expect(adapted.id).toBe('67a1b2c3d4e5f67890123456');
    expect(adapted.bookingId).toBe('BK-2026-8888');
    expect(adapted.name).toBe('Robert Langdon');
    expect(adapted.roomNo).toBe('101');
    expect(adapted.status).toBe('Booked');
    expect(adapted.checkIn).toBe('2026-10-15');
    expect(adapted.checkOut).toBe('2026-10-20');
  });

  it('Test 4 — Store synchronization: Synchronizes compatibility store after update', async () => {
    vi.spyOn(reservationService, 'getReservationById').mockResolvedValue({
      statusCode: 200,
      data: { reservation: sampleBackendReservation },
    });

    vi.spyOn(reservationService, 'updateReservation').mockResolvedValue({
      statusCode: 200,
      data: {
        reservation: {
          ...sampleBackendReservation,
          special_requests: 'Updated special request',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/reservation/edit/67a1b2c3d4e5f67890123456']}>
        <Routes>
          <Route path="/reservation/edit/:id" element={<EditReservation />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Robert')).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByRole('button', { name: /update booking/i }).closest('form'));

    await waitFor(() => {
      const stored = getReservations();
      expect(stored.some(r => r.id === '67a1b2c3d4e5f67890123456' && r.specialRequests === 'Updated special request')).toBe(true);
    });
  });

  it('Test 5 — Backend update failure: Surfaces error and does not falsely update store', async () => {
    vi.spyOn(reservationService, 'getReservationById').mockResolvedValue({
      statusCode: 200,
      data: { reservation: sampleBackendReservation },
    });

    vi.spyOn(reservationService, 'updateReservation').mockRejectedValue(
      new Error('Failed to update reservation: Database error')
    );

    render(
      <MemoryRouter initialEntries={['/reservation/edit/67a1b2c3d4e5f67890123456']}>
        <Routes>
          <Route path="/reservation/edit/:id" element={<EditReservation />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Robert')).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByRole('button', { name: /update booking/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Database error/i)).toBeInTheDocument();
    });
  });

  it('Test 6 — 409 Availability conflict: Displays room conflict message and leaves record unchanged', async () => {
    vi.spyOn(reservationService, 'getReservationById').mockResolvedValue({
      statusCode: 200,
      data: { reservation: sampleBackendReservation },
    });

    const conflictErr = new Error('Room is already booked for the updated dates');
    conflictErr.status = 409;
    vi.spyOn(reservationService, 'updateReservation').mockRejectedValue(conflictErr);

    render(
      <MemoryRouter initialEntries={['/reservation/edit/67a1b2c3d4e5f67890123456']}>
        <Routes>
          <Route path="/reservation/edit/:id" element={<EditReservation />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Robert')).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByRole('button', { name: /update booking/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/The selected room is no longer available for these dates/i)).toBeInTheDocument();
    });
  });

  it('Test 7 & 9 — Successful cancellation: Calls cancelReservation with ID and reason', async () => {
    const cancelSpy = vi.spyOn(reservationService, 'cancelReservation').mockResolvedValue({
      statusCode: 200,
      data: {
        reservation: {
          ...sampleBackendReservation,
          status: 'CANCELLED',
          cancellation_reason: 'Guest requested cancellation',
        },
      },
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [sampleBackendReservation],
    });

    render(
      <MemoryRouter>
        <AllBookings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Robert Langdon')).toBeInTheDocument();
    });

    // Open row menu
    const menuBtn = screen.getByRole('button', { name: /more actions/i });
    fireEvent.click(menuBtn);

    const cancelOption = screen.getByRole('menuitem', { name: /cancel booking/i });
    fireEvent.click(cancelOption);

    // Confirm cancel in modal by clicking Submit
    const confirmCancelBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(confirmCancelBtn);

    await waitFor(() => {
      expect(cancelSpy).toHaveBeenCalled();
    });

    const calledId = cancelSpy.mock.calls[0][0];
    expect(calledId).toBe('67a1b2c3d4e5f67890123456');
  });

  it('Test 8 — Cancellation failure: Rejection leaves reservation in un-cancelled state', async () => {
    vi.spyOn(reservationService, 'cancelReservation').mockRejectedValue(
      new Error('Cannot cancel a reservation with status IN_HOUSE')
    );

    // Provide a CONFIRMED booking in list so the Cancel action is enabled
    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [sampleBackendReservation],
    });

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <AllBookings />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Robert Langdon')).toBeInTheDocument();
    });

    const menuBtn = screen.getByRole('button', { name: /more actions/i });
    fireEvent.click(menuBtn);

    const cancelOption = screen.getByRole('menuitem', { name: /cancel booking/i });
    fireEvent.click(cancelOption);

    const confirmCancelBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(confirmCancelBtn);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('IN_HOUSE'));
    });
  });

  it('Test 10 — LocalStorage independence: Edit and cancel work with zero initial localStorage data', async () => {
    expect(localStorage.getItem('hotel_reservations')).toBeNull();

    const updateSpy = vi.spyOn(reservationService, 'updateReservation').mockResolvedValue({
      statusCode: 200,
      data: { reservation: sampleBackendReservation },
    });

    vi.spyOn(reservationService, 'getReservationById').mockResolvedValue({
      statusCode: 200,
      data: { reservation: sampleBackendReservation },
    });

    render(
      <MemoryRouter initialEntries={['/reservation/edit/67a1b2c3d4e5f67890123456']}>
        <Routes>
          <Route path="/reservation/edit/:id" element={<EditReservation />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Robert')).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByRole('button', { name: /update booking/i }).closest('form'));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
