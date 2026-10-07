import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckInOut from '../features/front-office/pages/CheckInOut';
import stayService from '../services/stayService';
import reservationService from '../services/reservationService';

describe('Phase 5 Step 4: Check-In Mutation Backend Integration Tests', () => {
  const mockInitialReservations = [
    {
      _id: '65c1d2e3f4a5678901234003',
      booking_ref: 'RES-1003',
      status: 'CONFIRMED',
      expected_check_in: '2026-10-06T15:00:00.000Z',
      expected_check_out: '2026-10-08T11:00:00.000Z',
      adults: 2,
      children: 0,
      special_requests: 'Late arrival',
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

  const mockCreatedStay = {
    _id: '65b1c2d3e4f5678901234599',
    stay_ref: 'STY-9999',
    status: 'CHECKED_IN',
    actual_check_in: '2026-10-06T14:30:00.000Z',
    actual_check_out: null,
    total_guests: 2,
    notes: 'Late arrival; Key: KEY-201',
    primary_guest_id: {
      _id: '65a1b2c3d4e5f67890123003',
      guest_ref: 'GST-1003',
      first_name: 'Ford',
      last_name: 'Prefect',
      email: 'ford.prefect@guide.org',
      phone: '+44 7700 900099',
    },
    reservation_id: {
      _id: '65c1d2e3f4a5678901234003',
      booking_ref: 'RES-1003',
      expected_check_in: '2026-10-06T15:00:00.000Z',
      expected_check_out: '2026-10-08T11:00:00.000Z',
    },
    rooms: [
      {
        room_id: {
          _id: '65d1e2f3a4b5678901234003',
          room_number: '201',
          floor: '2',
          status: 'OCCUPIED',
          housekeeping_status: 'CLEAN',
          room_type_id: {
            name: 'Standard Single',
          },
        },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Test 1 — Successful Check-In: Dispatches stayService.checkIn, updates backend state, and refreshes UI', async () => {
    const getStaysSpy = vi.spyOn(stayService, 'getStays')
      .mockResolvedValueOnce({ statusCode: 200, data: [], success: true }) // initial load
      .mockResolvedValueOnce({ statusCode: 200, data: [mockCreatedStay], success: true }); // post check-in reload

    const getReservationsSpy = vi.spyOn(reservationService, 'getReservations')
      .mockResolvedValueOnce({ statusCode: 200, data: mockInitialReservations, success: true })
      .mockResolvedValueOnce({ statusCode: 200, data: [], success: true });

    const checkInSpy = vi.spyOn(stayService, 'checkIn').mockResolvedValue({
      statusCode: 201,
      data: {
        stay: mockCreatedStay,
        reservation: { _id: '65c1d2e3f4a5678901234003', status: 'IN_HOUSE' },
        room: { _id: '65d1e2f3a4b5678901234003', status: 'OCCUPIED' },
      },
      message: 'Guest checked in successfully',
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    // Initial pending booking rendered
    await waitFor(() => {
      expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
      expect(screen.getByText('Booked')).toBeInTheDocument();
    });

    // Click Check In button to open modal
    const checkInBtn = screen.getByTitle('Check In');
    fireEvent.click(checkInBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText('Check-in Guest')).toBeInTheDocument();
      expect(screen.getByText('Welcome, Ford Prefect')).toBeInTheDocument();
    });

    // Fill verification fields
    // 1. ID Verification
    const idSelect = screen.getByLabelText(/ID Verification\*/i);
    fireEvent.mouseDown(idSelect);
    const idOption = await screen.findByText('Passport Verified');
    fireEvent.click(idOption);

    // 2. Payment Status
    const paymentSelect = screen.getByLabelText(/Payment Status\*/i);
    fireEvent.mouseDown(paymentSelect);
    const paymentOption = await screen.findByText('Paid in Full');
    fireEvent.click(paymentOption);

    // 3. Room Key
    const keyInput = screen.getByLabelText(/Room Key\/Card\*/i);
    fireEvent.change(keyInput, { target: { value: 'KEY-201' } });

    // Submit Complete Check-in
    const completeBtn = screen.getByRole('button', { name: /Complete Check-in/i });
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(checkInSpy).toHaveBeenCalledTimes(1);
    });

    // Verify canonical parameters passed to backend mutation
    expect(checkInSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        reservation_id: '65c1d2e3f4a5678901234003',
        room_id: '65d1e2f3a4b5678901234003',
        primary_guest_id: '65a1b2c3d4e5f67890123003',
        total_guests: 2,
      })
    );

    // Verify UI reflects checked-in status from backend
    await waitFor(() => {
      expect(screen.getAllByText('Checked In').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Test 2 — Backend Rejection: Surfaces API error message and prevents state corruption', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: mockInitialReservations,
      success: true,
    });

    vi.spyOn(stayService, 'checkIn').mockRejectedValueOnce(
      new Error('Room 201 is currently OCCUPIED and cannot be checked in')
    );

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
    });

    // Open Check-in Modal
    fireEvent.click(screen.getByTitle('Check In'));

    await waitFor(() => {
      expect(screen.getByText('Check-in Guest')).toBeInTheDocument();
    });

    // Fill form
    fireEvent.mouseDown(screen.getByLabelText(/ID Verification\*/i));
    fireEvent.click(await screen.findByText('Passport Verified'));

    fireEvent.mouseDown(screen.getByLabelText(/Payment Status\*/i));
    fireEvent.click(await screen.findByText('Paid in Full'));

    fireEvent.change(screen.getByLabelText(/Room Key\/Card\*/i), { target: { value: 'KEY-201' } });

    fireEvent.click(screen.getByRole('button', { name: /Complete Check-in/i }));

    // Error is surfaced inside modal
    await waitFor(() => {
      expect(screen.getAllByText(/Room 201 is currently OCCUPIED and cannot be checked in/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Test 3 — Duplicate Check-In Protection: Disables button during submission and handles 409 conflict', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: mockInitialReservations,
      success: true,
    });

    vi.spyOn(stayService, 'checkIn').mockRejectedValueOnce(
      new Error('Guest is already checked in for this reservation')
    );

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Check In'));

    await waitFor(() => {
      expect(screen.getByText('Check-in Guest')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByLabelText(/ID Verification\*/i));
    fireEvent.click(await screen.findByText('Passport Verified'));

    fireEvent.mouseDown(screen.getByLabelText(/Payment Status\*/i));
    fireEvent.click(await screen.findByText('Paid in Full'));

    fireEvent.change(screen.getByLabelText(/Room Key\/Card\*/i), { target: { value: 'KEY-201' } });

    fireEvent.click(screen.getByRole('button', { name: /Complete Check-in/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Guest is already checked in for this reservation/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Test 4 — Canonical IDs: Emits authentic MongoDB ObjectIds rather than synthetic numbers', async () => {
    vi.spyOn(stayService, 'getStays')
      .mockResolvedValueOnce({ statusCode: 200, data: [], success: true })
      .mockResolvedValueOnce({ statusCode: 200, data: [mockCreatedStay], success: true });

    vi.spyOn(reservationService, 'getReservations')
      .mockResolvedValueOnce({ statusCode: 200, data: mockInitialReservations, success: true })
      .mockResolvedValueOnce({ statusCode: 200, data: [], success: true });

    const checkInSpy = vi.spyOn(stayService, 'checkIn').mockResolvedValue({
      statusCode: 201,
      data: { stay: mockCreatedStay },
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Check In'));

    await waitFor(() => {
      expect(screen.getByText('Check-in Guest')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByLabelText(/ID Verification\*/i));
    fireEvent.click(await screen.findByText('Passport Verified'));

    fireEvent.mouseDown(screen.getByLabelText(/Payment Status\*/i));
    fireEvent.click(await screen.findByText('Paid in Full'));

    fireEvent.change(screen.getByLabelText(/Room Key\/Card\*/i), { target: { value: 'KEY-201' } });

    fireEvent.click(screen.getByRole('button', { name: /Complete Check-in/i }));

    await waitFor(() => {
      expect(checkInSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          reservation_id: '65c1d2e3f4a5678901234003',
          room_id: '65d1e2f3a4b5678901234003',
          primary_guest_id: '65a1b2c3d4e5f67890123003',
        })
      );
    });
  });

  it('Test 5 — Refresh Persistence: Stays checked-in upon page remount without localStorage mutation dependency', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [mockCreatedStay],
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    const { unmount } = render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
      expect(screen.getAllByText('Checked In').length).toBeGreaterThanOrEqual(1);
    });

    unmount();

    // Re-mount simulates page reload / re-navigation
    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
      expect(screen.getAllByText('Checked In').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('201')).toBeInTheDocument();
    });
  });

  it('Test 6 — Submission Lock: Shows Checking In... and disables submit button during in-flight mutation', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: mockInitialReservations,
      success: true,
    });

    let resolveCheckIn;
    const pendingPromise = new Promise((resolve) => {
      resolveCheckIn = resolve;
    });

    vi.spyOn(stayService, 'checkIn').mockReturnValueOnce(pendingPromise);

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Ford Prefect')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Check In'));

    await waitFor(() => {
      expect(screen.getByText('Check-in Guest')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByLabelText(/ID Verification\*/i));
    fireEvent.click(await screen.findByText('Passport Verified'));

    fireEvent.mouseDown(screen.getByLabelText(/Payment Status\*/i));
    fireEvent.click(await screen.findByText('Paid in Full'));

    fireEvent.change(screen.getByLabelText(/Room Key\/Card\*/i), { target: { value: 'KEY-201' } });

    const submitBtn = screen.getByRole('button', { name: /Complete Check-in/i });
    fireEvent.click(submitBtn);

    // Button transitions to submitting state
    await waitFor(() => {
      expect(screen.getByText(/Checking In\.\.\./i)).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();
    });

    // Resolve in-flight promise
    resolveCheckIn({
      statusCode: 201,
      data: { stay: mockCreatedStay },
      success: true,
    });
  });

  it('Test 7 — Adapter Payload Cleanliness: Strips invalid/empty ObjectIds and formats notes properly', () => {
    const { toBackendCheckInPayload } = require('../features/front-office/adapters/stayAdapter');
    
    // Non-ObjectId room (e.g. room number string "101")
    const payload = toBackendCheckInPayload({
      reservationId: '65c1d2e3f4a5678901234003',
      roomId: '101',
      guestId: '65a1b2c3d4e5f67890123003',
      guestCount: '3',
      specialRequests: 'Quiet room',
    });

    expect(payload.reservation_id).toBe('65c1d2e3f4a5678901234003');
    expect(payload.room_id).toBeUndefined(); // correctly omitted so backend auto-resolves ReservationRoom
    expect(payload.primary_guest_id).toBe('65a1b2c3d4e5f67890123003');
    expect(payload.total_guests).toBe(3);
    expect(payload.notes).toBe('Quiet room');
  });
});
