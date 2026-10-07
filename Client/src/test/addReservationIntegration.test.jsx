import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddReservation from '../features/reservations/pages/AddReservation';
import reservationService from '../services/reservationService';
import guestService from '../services/guestService';
import { getReservations } from '../features/reservations/state/reservationStore';
import { toFrontendReservation, toBackendReservationPayload } from '../features/reservations/adapters/reservationAdapter';

describe('Phase 3 Step 4: AddReservation Backend Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      data: [{
        _id: '67a1b2c3d4e5f67890123457',
        first_name: 'David',
        last_name: 'Miller',
        email: 'david.miller@example.com',
      }],
    });
    vi.spyOn(guestService, 'createGuest').mockResolvedValue({
      data: {
        _id: '67a1b2c3d4e5f67890123457',
        first_name: 'David',
        last_name: 'Miller',
        email: 'david.miller@example.com',
      },
    });
  });

  const mockCreatedBackendReservation = {
    _id: '67a1b2c3d4e5f67890123456',
    booking_ref: 'BK-2026-9999',
    status: 'CONFIRMED',
    expected_check_in: '2026-10-15T00:00:00.000Z',
    expected_check_out: '2026-10-20T00:00:00.000Z',
    adults: 2,
    children: 0,
    special_requests: 'Late check-in',
    primary_guest_id: {
      _id: '67a1b2c3d4e5f67890123457',
      first_name: 'David',
      last_name: 'Miller',
      email: 'david.miller@example.com',
      phone: '+15551234567',
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
    created_at: '2026-10-05T12:00:00.000Z',
  };

  it('Test 1 — Successful creation: Calls reservationService.createReservation with valid payload', async () => {
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      data: [{
        _id: '67a1b2c3d4e5f67890123457',
        first_name: 'David',
        last_name: 'Miller',
        email: 'david.miller@example.com',
      }],
    });

    const createSpy = vi.spyOn(reservationService, 'createReservation').mockResolvedValue({
      statusCode: 201,
      data: { reservation: mockCreatedBackendReservation },
    });

    // Pre-populate room in localStorage/roomStore for room selection lookup
    localStorage.setItem('hotel_rooms', JSON.stringify([
      {
        _id: '67a1b2c3d4e5f67890123458',
        id: '67a1b2c3d4e5f67890123458',
        roomNo: '101',
        type: 'Deluxe Room',
        roomTypeId: '67a1b2c3d4e5f67890123459',
        status: 'Available',
      },
    ]));

    render(
      <BrowserRouter>
        <AddReservation />
      </BrowserRouter>
    );

    // Fill form
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    fireEvent.change(firstNameInput, { target: { value: 'David' } });
    fireEvent.change(lastNameInput, { target: { value: 'Miller' } });
    fireEvent.change(emailInput, { target: { value: 'david.miller@example.com' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /save booking/i });
    fireEvent.submit(submitBtn.closest('form'));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });

    const calledPayload = createSpy.mock.calls[0][0];
    expect(calledPayload.primary_guest_id).toBe('67a1b2c3d4e5f67890123457');
    expect(calledPayload.expected_check_in).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(calledPayload.expected_check_out).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(calledPayload.adults).toBeGreaterThanOrEqual(1);
    expect(calledPayload).not.toHaveProperty('status'); // Joi create schema disallows status
  });

  it('Test 2 — Backend response adaptation: Adapts created backend reservation to frontend format', () => {
    const adapted = toFrontendReservation(mockCreatedBackendReservation);

    expect(adapted.id).toBe('67a1b2c3d4e5f67890123456');
    expect(adapted.bookingId).toBe('BK-2026-9999');
    expect(adapted.name).toBe('David Miller');
    expect(adapted.roomNo).toBe('101');
    expect(adapted.roomNumber).toBe('101');
    expect(adapted.roomType).toBe('Deluxe Room');
    expect(adapted.status).toBe('Booked');
    expect(adapted.checkIn).toBe('2026-10-15');
    expect(adapted.checkOut).toBe('2026-10-20');
  });

  it('Test 3 — Compatibility synchronization: Synchronizes compatibility store after creation', async () => {
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      data: [{
        _id: '67a1b2c3d4e5f67890123457',
        first_name: 'David',
        last_name: 'Miller',
      }],
    });

    vi.spyOn(reservationService, 'createReservation').mockResolvedValue({
      statusCode: 201,
      data: { reservation: mockCreatedBackendReservation },
    });

    render(
      <BrowserRouter>
        <AddReservation />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'David' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Miller' } });

    fireEvent.submit(screen.getByRole('button', { name: /save booking/i }).closest('form'));

    await waitFor(() => {
      const stored = getReservations();
      expect(stored.some(r => r.id === '67a1b2c3d4e5f67890123456' || r.bookingId === 'BK-2026-9999')).toBe(true);
    });
  });

  it('Test 4 — Backend failure: Surfaces error and does NOT create fake local reservation', async () => {
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      data: [{
        _id: '67a1b2c3d4e5f67890123457',
        first_name: 'David',
        last_name: 'Miller',
      }],
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

    const stored = getReservations();
    expect(stored.length).toBe(0);
  });

  it('Test 5 — Conflict / 409: Surfaces room conflict error without creating fake local reservation', async () => {
    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      data: [{
        _id: '67a1b2c3d4e5f67890123457',
        first_name: 'David',
        last_name: 'Miller',
      }],
    });

    const conflictErr = new Error('Room is already booked for the selected date range');
    conflictErr.status = 409;
    vi.spyOn(reservationService, 'createReservation').mockRejectedValue(conflictErr);

    render(
      <BrowserRouter>
        <AddReservation />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'David' } });
    fireEvent.submit(screen.getByRole('button', { name: /save booking/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/already booked/i)).toBeInTheDocument();
    });

    expect(getReservations().length).toBe(0);
  });

  it('Test 6 — LocalStorage independence: Creation does not depend on pre-existing hotel_reservations', async () => {
    expect(localStorage.getItem('hotel_reservations')).toBeNull();

    vi.spyOn(guestService, 'getGuests').mockResolvedValue({
      data: [{
        _id: '67a1b2c3d4e5f67890123457',
        first_name: 'Sarah',
        last_name: 'Connor',
      }],
    });

    const createSpy = vi.spyOn(reservationService, 'createReservation').mockResolvedValue({
      statusCode: 201,
      data: { reservation: mockCreatedBackendReservation },
    });

    render(
      <BrowserRouter>
        <AddReservation />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Sarah' } });
    fireEvent.submit(screen.getByRole('button', { name: /save booking/i }).closest('form'));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });
  });

  it('Test 7 — Guest reference: Request sends 24-hex ObjectId for primary_guest_id', () => {
    const payload = toBackendReservationPayload({
      primary_guest_id: '67a1b2c3d4e5f67890123457',
      checkInDate: '2026-10-15',
      checkOutDate: '2026-10-20',
      totalPerson: '2',
    }, { isCreate: true });

    expect(payload.primary_guest_id).toBe('67a1b2c3d4e5f67890123457');
    expect(/^[0-9a-fA-F]{24}$/.test(payload.primary_guest_id)).toBe(true);
  });

  it('Test 8 — Room reference: Request sends backend room_id and room_type_id', () => {
    const payload = toBackendReservationPayload({
      primary_guest_id: '67a1b2c3d4e5f67890123457',
      room_id: '67a1b2c3d4e5f67890123458',
      room_type_id: '67a1b2c3d4e5f67890123459',
      checkInDate: '2026-10-15',
      checkOutDate: '2026-10-20',
    }, { isCreate: true });

    expect(payload.room_id).toBe('67a1b2c3d4e5f67890123458');
    expect(payload.room_type_id).toBe('67a1b2c3d4e5f67890123459');
  });

  it('Test 9 — Date payload: expected_check_in and expected_check_out are ISO format without day offset', () => {
    const payload = toBackendReservationPayload({
      primary_guest_id: '67a1b2c3d4e5f67890123457',
      checkInDate: '2026-10-15',
      checkOutDate: '2026-10-20',
    }, { isCreate: true });

    expect(payload.expected_check_in).toBe('2026-10-15T00:00:00.000Z');
    expect(payload.expected_check_out).toBe('2026-10-20T00:00:00.000Z');
  });
});
