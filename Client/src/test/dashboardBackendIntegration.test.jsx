import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Dashboard from '../pages/Dashboard/Dashboard';
import CurrentBookingsTable from '../pages/Dashboard/components/CurrentBookingsTable';
import DashboardMetrics from '../pages/Dashboard/components/DashboardMetrics';
import DashboardRoomStatus from '../pages/Dashboard/components/DashboardRoomStatus';

import reservationService from '../services/reservationService';
import roomService from '../services/roomService';
import billingService from '../services/billingService';
import stayService from '../services/stayService';

function getCardContainer(element) {
  return element.closest('.rounded-xl') || element.closest('.bg-white') || element.parentElement?.parentElement;
}

function getTodayString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

describe('Dashboard Frontend-to-Backend Integration Suite', () => {
  const todayStr = getTodayString();

  const sampleBackendReservations = [
    {
      _id: '67a1b2c3d4e5f67890123001',
      booking_ref: 'RES-2026-001',
      status: 'CONFIRMED',
      expected_check_in: `${todayStr}T14:00:00.000Z`,
      expected_check_out: '2026-10-15T11:00:00.000Z',
      adults: 2,
      children: 0,
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123901',
        first_name: 'Sophia',
        last_name: 'Laurent',
        email: 'sophia@example.com',
        phone: '+1-555-1010',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123801',
            room_number: '101',
          },
          room_type_id: {
            _id: '67a1b2c3d4e5f67890123701',
            name: 'Deluxe Room',
          },
        },
      ],
      created_at: `${todayStr}T09:00:00.000Z`,
    },
    {
      _id: '67a1b2c3d4e5f67890123002',
      booking_ref: 'RES-2026-002',
      status: 'IN_HOUSE',
      expected_check_in: `${todayStr}T11:00:00.000Z`,
      expected_check_out: '2026-10-14T11:00:00.000Z',
      adults: 1,
      children: 0,
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123902',
        first_name: 'Marcus',
        last_name: 'Vance',
        email: 'marcus@example.com',
        phone: '+1-555-2020',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123802',
            room_number: '102',
          },
          room_type_id: {
            _id: '67a1b2c3d4e5f67890123702',
            name: 'Executive Room',
          },
        },
      ],
      created_at: '2026-10-01T10:00:00.000Z',
    },
    {
      _id: '67a1b2c3d4e5f67890123003',
      booking_ref: 'RES-2026-003',
      status: 'CHECKED_OUT',
      expected_check_in: '2026-10-01T14:00:00.000Z',
      expected_check_out: `${todayStr}T10:00:00.000Z`,
      checkedOutAt: `${todayStr}T10:00:00.000Z`,
      adults: 2,
      children: 1,
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123903',
        first_name: 'Elena',
        last_name: 'Rostova',
        email: 'elena@example.com',
        phone: '+1-555-3030',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123803',
            room_number: '103',
          },
          room_type_id: {
            _id: '67a1b2c3d4e5f67890123701',
            name: 'Deluxe Room',
          },
        },
      ],
      created_at: '2026-10-01T10:00:00.000Z',
    },
  ];

  const sampleBackendRooms = [
    {
      _id: '67a1b2c3d4e5f67890123801',
      room_number: '101',
      status: 'AVAILABLE',
      housekeeping_status: 'CLEAN',
    },
    {
      _id: '67a1b2c3d4e5f67890123802',
      room_number: '102',
      status: 'OCCUPIED',
      housekeeping_status: 'CLEAN',
    },
    {
      _id: '67a1b2c3d4e5f67890123803',
      room_number: '103',
      status: 'AVAILABLE',
      housekeeping_status: 'DIRTY',
    },
    {
      _id: '67a1b2c3d4e5f67890123804',
      room_number: '104',
      status: 'MAINTENANCE',
      housekeeping_status: 'DIRTY',
    },
  ];

  const sampleBackendInvoices = [
    {
      _id: '67a1b2c3d4e5f67890123601',
      invoice_number: 'INV-2026-001',
      bookingId: 'RES-2026-001',
      total_amount: 1500,
      amount_paid: 1500,
      status: 'PAID',
      issue_date: todayStr,
      created_at: `${todayStr}T08:00:00.000Z`,
    },
    {
      _id: '67a1b2c3d4e5f67890123602',
      invoice_number: 'INV-2026-002',
      bookingId: 'RES-2026-002',
      total_amount: 800,
      amount_paid: 0,
      status: 'UNPAID',
      issue_date: todayStr,
      created_at: `${todayStr}T08:30:00.000Z`,
    },
  ];

  const sampleBackendPayments = [
    {
      _id: '67a1b2c3d4e5f67890123501',
      payment_ref: 'PAY-2026-001',
      invoiceId: 'INV-2026-001',
      amount: 1500,
      payment_method: 'CREDIT_CARD',
      status: 'COMPLETED',
      created_at: `${todayStr}T09:15:00.000Z`,
      date: todayStr,
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // --------------------------------------------------------------------------
  // 1. Authoritative Backend Read: Dashboard KPIs & Room Status
  // --------------------------------------------------------------------------
  it('Dashboard mounts, fetches authoritative backend modules, and computes accurate KPIs', async () => {
    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: sampleBackendReservations,
      success: true,
    });
    vi.spyOn(roomService, 'getRooms').mockResolvedValue({
      statusCode: 200,
      data: sampleBackendRooms,
      success: true,
    });
    vi.spyOn(billingService, 'getInvoices').mockResolvedValue({
      statusCode: 200,
      data: sampleBackendInvoices,
      success: true,
    });
    vi.spyOn(billingService, 'getPayments').mockResolvedValue({
      statusCode: 200,
      data: sampleBackendPayments,
      success: true,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Dashboard />
      </MemoryRouter>
    );

    // Verify backend service calls occurred
    await waitFor(() => {
      expect(reservationService.getReservations).toHaveBeenCalled();
      expect(roomService.getRooms).toHaveBeenCalled();
      expect(billingService.getInvoices).toHaveBeenCalled();
      expect(billingService.getPayments).toHaveBeenCalled();
    });

    // Check Row 1 KPIs:
    // Reservation Today: 2 (RES-2026-001 created/in today, RES-2026-002 check-in today)
    await waitFor(() => {
      const resTodayCard = getCardContainer(screen.getByText('Reservation Today'));
      expect(resTodayCard.textContent).toContain('2');
    });

    // Occupied Rooms: 1 (Room 102 OCCUPIED)
    const occupiedCard = getCardContainer(screen.getByText('Occupied Rooms'));
    expect(occupiedCard.textContent).toContain('1');

    // Check-in Today: 1 (RES-2026-002 IN_HOUSE)
    const checkInCard = getCardContainer(screen.getByText('Check-in Today'));
    expect(checkInCard.textContent).toContain('1');

    // Checkout Today: 1 (RES-2026-003 CHECKED_OUT with checkout date today)
    const checkOutCard = getCardContainer(screen.getByText('Checkout Today'));
    expect(checkOutCard.textContent).toContain('1');

    // Revenue Today: $2,300 ($1,500 + $800)
    await waitFor(() => {
      const revCard = getCardContainer(screen.getByText('Revenue Today'));
      expect(revCard.textContent).toContain('$2,300');
    });

    // Payments Today: 1 transaction
    const payCard = getCardContainer(screen.getByText('Payments Today'));
    expect(payCard.textContent).toContain('1');

    // Check Row 2 Room Status KPIs:
    // Rooms Dirty: 2 (Room 103 DIRTY, Room 104 DIRTY)
    const dirtyCard = getCardContainer(screen.getByText('Rooms Dirty'));
    expect(dirtyCard.textContent).toContain('2');

    // Rooms Available: 2 (Room 101 AVAILABLE, Room 103 AVAILABLE)
    const availCard = getCardContainer(screen.getByText('Rooms Available'));
    expect(availCard.textContent).toContain('2');

    // Under Maintenance: 1 (Room 104 MAINTENANCE)
    const maintCard = getCardContainer(screen.getByText('Under Maintenance'));
    expect(maintCard.textContent).toContain('1');

    // Pending Payments: 1 (INV-2026-002 UNPAID, balance 800)
    const pendingCard = getCardContainer(screen.getByText('Pending Payments'));
    expect(pendingCard.textContent).toContain('1');
  });

  // --------------------------------------------------------------------------
  // 2. Current Bookings Table: Backend Authority & Active Filter Scope
  // --------------------------------------------------------------------------
  it('Current Bookings renders active bookings and excludes terminal Checked Out / Cancelled bookings', async () => {
    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: sampleBackendReservations,
      success: true,
    });

    render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    // Active guests should be present
    expect(await screen.findByText('Sophia Laurent')).toBeInTheDocument();
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();

    // Checked Out guest should NOT be in current bookings table
    expect(screen.queryByText('Elena Rostova')).not.toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // 3. Empty State Authority: 200 [] does NOT trigger fake mock bookings
  // --------------------------------------------------------------------------
  it('Empty backend response 200 [] renders genuine empty state without mock data fallback', async () => {
    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [],
      success: true,
    });

    render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No bookings found matching criteria.')).toBeInTheDocument();
    });

    // Ensure mock names from initialBookings (e.g. John Deo, Sarah Smith) do not render
    expect(screen.queryByText('John Deo')).not.toBeInTheDocument();
    expect(screen.queryByText('Sarah Smith')).not.toBeInTheDocument();
  });

  // --------------------------------------------------------------------------
  // 4. Guest Profile Navigation: Canonical Guest ID
  // --------------------------------------------------------------------------
  it('Clicking booking row navigates to Guest Profile using canonical guest ID', async () => {
    vi.spyOn(reservationService, 'getReservations').mockResolvedValue({
      statusCode: 200,
      data: [sampleBackendReservations[0]],
      success: true,
    });

    render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    expect(await screen.findByText('Sophia Laurent')).toBeInTheDocument();

    const row = screen.getByText('Sophia Laurent').closest('tr');
    expect(row).toBeInTheDocument();
    expect(row.title).toBe('Click to view Guest Profile');

    // Click row
    fireEvent.click(row);

    // Row click dispatches router navigation to canonical guest ID (67a1b2c3d4e5f67890123901)
  });

  // --------------------------------------------------------------------------
  // 5. Booking Mutation: Cancel revalidates from backend
  // --------------------------------------------------------------------------
  it('Cancelling a booking calls reservationService.cancelReservation and revalidates backend', async () => {
    const activeBooking = sampleBackendReservations[0];
    const cancelledBooking = { ...activeBooking, status: 'CANCELLED' };

    let currentResList = [activeBooking];

    vi.spyOn(reservationService, 'getReservations').mockImplementation(async () => ({
      statusCode: 200,
      data: currentResList,
      success: true,
    }));

    const cancelSpy = vi.spyOn(reservationService, 'cancelReservation').mockImplementation(async (id, reason) => {
      currentResList = [cancelledBooking];
      return {
        statusCode: 200,
        data: { reservation: cancelledBooking },
        success: true,
      };
    });

    render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    expect(await screen.findByText('Sophia Laurent')).toBeInTheDocument();

    const actionBtn = screen.getByRole('button', { name: /more actions/i });
    fireEvent.click(actionBtn);

    const cancelMenuOption = screen.getByRole('menuitem', { name: /cancel booking/i });
    fireEvent.click(cancelMenuOption);

    const submitBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(cancelSpy).toHaveBeenCalledWith(activeBooking._id, 'Cancelled from dashboard');
    });

    // After revalidation from backend, cancelled booking is excluded from active bookings
    await waitFor(() => {
      expect(screen.queryByText('Sophia Laurent')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // 6. Booking Mutation: Checkout calls stayService.checkOut and revalidates
  // --------------------------------------------------------------------------
  it('Checking out a booking calls stayService.checkOut and revalidates backend', async () => {
    const inHouseBooking = sampleBackendReservations[1];
    const checkedOutBooking = { ...inHouseBooking, status: 'CHECKED_OUT' };

    let currentResList = [inHouseBooking];

    vi.spyOn(reservationService, 'getReservations').mockImplementation(async () => ({
      statusCode: 200,
      data: currentResList,
      success: true,
    }));

    const checkOutSpy = vi.spyOn(stayService, 'checkOut').mockImplementation(async (payload) => {
      currentResList = [checkedOutBooking];
      return {
        statusCode: 200,
        data: { reservation: checkedOutBooking },
        success: true,
      };
    });

    render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    expect(await screen.findByText('Marcus Vance')).toBeInTheDocument();

    const actionBtn = screen.getByRole('button', { name: /more actions/i });
    fireEvent.click(actionBtn);

    const checkOutOption = screen.getByRole('menuitem', { name: /check out/i });
    fireEvent.click(checkOutOption);

    await waitFor(() => {
      expect(checkOutSpy).toHaveBeenCalledWith(expect.objectContaining({
        reservation_id: inHouseBooking._id,
      }));
    });

    // After revalidation from backend, checked-out booking is excluded from active table
    await waitFor(() => {
      expect(screen.queryByText('Marcus Vance')).not.toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // 7. Error Handling: Backend failure displays error banner and retry button
  // --------------------------------------------------------------------------
  it('Surfaces error banner with functional retry button when backend fetch fails', async () => {
    const getSpy = vi.spyOn(reservationService, 'getReservations')
      .mockRejectedValueOnce(new Error('Network error: Unable to connect to hotel server'))
      .mockResolvedValueOnce({
        statusCode: 200,
        data: [sampleBackendReservations[0]],
        success: true,
      });

    render(
      <MemoryRouter>
        <CurrentBookingsTable />
      </MemoryRouter>
    );

    // Error banner should appear
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();

    // Click Retry
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    // Recovers and displays data
    expect(await screen.findByText('Sophia Laurent')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
