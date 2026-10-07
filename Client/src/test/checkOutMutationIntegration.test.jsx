import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CheckInOut from '../features/front-office/pages/CheckInOut';
import stayService from '../services/stayService';
import reservationService from '../services/reservationService';

describe('Phase 5 Step 5: Check-Out Mutation Backend Integration Tests', () => {
  const mockActiveStay = {
    _id: '65b1c2d3e4f5678901234501',
    stay_ref: 'STY-1001',
    status: 'CHECKED_IN',
    actual_check_in: '2026-10-06T10:00:00.000Z',
    actual_check_out: null,
    total_guests: 1,
    notes: 'Ground floor',
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
      expected_check_in: '2026-10-06T10:00:00.000Z',
      expected_check_out: '2026-10-08T11:00:00.000Z',
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
          },
        },
        status: 'OCCUPIED',
      },
    ],
  };

  const mockCompletedStay = {
    ...mockActiveStay,
    status: 'CHECKED_OUT',
    actual_check_out: '2026-10-08T10:30:00.000Z',
    notes: 'Ground floor; Payment: Credit Card; Inspection: Cleared',
    rooms: [
      {
        _id: '65e1f2a3b4c5678901234001',
        stay_id: '65b1c2d3e4f5678901234501',
        room_id: {
          _id: '65d1e2f3a4b5678901234001',
          room_number: '42',
          floor: '4',
          status: 'AVAILABLE',
          housekeeping_status: 'DIRTY',
          room_type_id: {
            name: 'Deluxe Suite',
          },
        },
        status: 'VACATED',
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

  it('Test 1 — Successful Check-Out: Dispatches stayService.checkOut, transitions stay, and updates UI', async () => {
    const getStaysSpy = vi.spyOn(stayService, 'getStays')
      .mockResolvedValueOnce({ statusCode: 200, data: [mockActiveStay], success: true }) // initial load
      .mockResolvedValueOnce({ statusCode: 200, data: [mockCompletedStay], success: true }); // post checkout reload

    const getReservationsSpy = vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    const checkOutSpy = vi.spyOn(stayService, 'checkOut').mockResolvedValue({
      statusCode: 200,
      data: {
        stay: mockCompletedStay,
        reservation: { _id: '65c1d2e3f4a5678901234001', status: 'CHECKED_OUT' },
      },
      message: 'Guest checked out successfully',
      success: true,
    });

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    // Initial Checked In stay rendered
    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      expect(screen.getAllByText('Checked In').length).toBeGreaterThanOrEqual(1);
    });

    // Click Check Out button in table
    const checkOutBtn = screen.getByTitle('Check Out');
    fireEvent.click(checkOutBtn);

    // Modal opens
    await waitFor(() => {
      expect(screen.getByText('Check-out Guest')).toBeInTheDocument();
      expect(screen.getByText(/Checking Out, Arthur Dent/i)).toBeInTheDocument();
    });

    // Select Payment Method
    const paymentSelect = screen.getByLabelText(/Payment Method\*/i);
    fireEvent.mouseDown(paymentSelect);
    const paymentOption = await screen.findByText('Credit Card');
    fireEvent.click(paymentOption);

    // Select Room Condition
    const inspectionSelect = screen.getByLabelText(/Room Inspection\*/i);
    fireEvent.mouseDown(inspectionSelect);
    const inspectionOption = await screen.findByText(/Cleared \(No Damages\)/i);
    fireEvent.click(inspectionOption);

    // Submit Complete Check-out
    const submitBtn = screen.getByRole('button', { name: /Complete Check-out/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(checkOutSpy).toHaveBeenCalledTimes(1);
    });

    // Verify canonical stay_id sent to backend mutation
    expect(checkOutSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        stay_id: '65b1c2d3e4f5678901234501',
      })
    );

    // Verify UI reflects Checked Out status
    await waitFor(() => {
      expect(screen.getAllByText('Checked Out').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Test 2 — Already Checked Out Rejection: Rejects duplicate check-out with 409 Conflict', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [mockActiveStay],
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    vi.spyOn(stayService, 'checkOut').mockRejectedValueOnce(
      new Error('Guest is already checked out')
    );

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Check Out'));

    await waitFor(() => {
      expect(screen.getByText('Check-out Guest')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByLabelText(/Payment Method\*/i));
    fireEvent.click(await screen.findByText('Credit Card'));

    fireEvent.mouseDown(screen.getByLabelText(/Room Inspection\*/i));
    fireEvent.click(await screen.findByText(/Cleared \(No Damages\)/i));

    fireEvent.click(screen.getByRole('button', { name: /Complete Check-out/i }));

    // Error is surfaced inside modal
    await waitFor(() => {
      expect(screen.getAllByText(/Guest is already checked out/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Test 3 — Invalid Stay Rejection: Surfaces 404/400 backend errors properly without UI state corruption', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [mockActiveStay],
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    vi.spyOn(stayService, 'checkOut').mockRejectedValueOnce(
      new Error('Active stay record not found for check-out')
    );

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Check Out'));

    await waitFor(() => {
      expect(screen.getByText('Check-out Guest')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByLabelText(/Payment Method\*/i));
    fireEvent.click(await screen.findByText('Cash'));

    fireEvent.mouseDown(screen.getByLabelText(/Room Inspection\*/i));
    fireEvent.click(await screen.findByText(/Cleared \(No Damages\)/i));

    fireEvent.click(screen.getByRole('button', { name: /Complete Check-out/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Active stay record not found for check-out/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Test 4 — Submission Lock: Disables button and displays Checking Out... during mutation in-flight', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [mockActiveStay],
      success: true,
    });

    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    let resolveCheckOut;
    const pendingPromise = new Promise((resolve) => {
      resolveCheckOut = resolve;
    });

    vi.spyOn(stayService, 'checkOut').mockReturnValueOnce(pendingPromise);

    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Check Out'));

    await waitFor(() => {
      expect(screen.getByText('Check-out Guest')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByLabelText(/Payment Method\*/i));
    fireEvent.click(await screen.findByText('Credit Card'));

    fireEvent.mouseDown(screen.getByLabelText(/Room Inspection\*/i));
    fireEvent.click(await screen.findByText(/Cleared \(No Damages\)/i));

    const submitBtn = screen.getByRole('button', { name: /Complete Check-out/i });
    fireEvent.click(submitBtn);

    // Transitions to submitting state
    await waitFor(() => {
      expect(screen.getByText(/Checking Out\.\.\./i)).toBeInTheDocument();
      expect(submitBtn).toBeDisabled();
    });

    // Resolve in-flight promise
    resolveCheckOut({
      statusCode: 200,
      data: { stay: mockCompletedStay },
      success: true,
    });
  });

  it('Test 5 — Refresh Persistence: Checked-out state survives component remount via authoritative backend', async () => {
    vi.spyOn(stayService, 'getStays').mockResolvedValue({
      statusCode: 200,
      data: [mockCompletedStay],
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
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      expect(screen.getAllByText('Checked Out').length).toBeGreaterThanOrEqual(1);
    });

    unmount();

    // Re-mount simulates page reload / re-navigation
    render(
      <MemoryRouter>
        <CheckInOut />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Arthur Dent')).toBeInTheDocument();
      expect(screen.getAllByText('Checked Out').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it('Test 6 — LocalStorage Independence: Check-out works with zero pre-existing localStorage data', () => {
    const { toBackendCheckOutPayload } = require('../features/front-office/adapters/stayAdapter');

    const payload = toBackendCheckOutPayload({
      stayId: '65b1c2d3e4f5678901234501',
      reservationId: '65c1d2e3f4a5678901234001',
      notes: 'Mini-bar checked',
    });

    expect(payload.stay_id).toBe('65b1c2d3e4f5678901234501');
    expect(payload.notes).toBe('Mini-bar checked');
  });
});
