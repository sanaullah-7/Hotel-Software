import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TapeChart from '../features/occupancy/pages/TapeChart';
import roomService from '../services/roomService';
import reservationService from '../services/reservationService';
import stayService from '../services/stayService';

// Mock services
vi.mock('../services/roomService', () => ({
  default: {
    getTapeChart: vi.fn(),
  },
}));

vi.mock('../services/reservationService', () => ({
  default: {
    reassignRoom: vi.fn(),
    createReservation: vi.fn(),
    checkAvailability: vi.fn().mockResolvedValue({ data: [] }),
    getReservations: vi.fn(),
  },
}));

vi.mock('../services/stayService', () => ({
  default: {
    transferRoom: vi.fn(),
    checkIn: vi.fn(),
    checkOut: vi.fn(),
    getStays: vi.fn(),
  },
}));

vi.mock('../services/guestService', () => ({
  default: {
    getGuests: vi.fn(),
    createGuest: vi.fn(),
  },
}));

describe('Phase 3 — Step 4: Safe Room Reassignment and Active-Stay Transfer Integration Suite', () => {
  const mockRooms = [
    {
      id: 'room_101',
      _id: 'room_101',
      room_number: '101',
      floor: '1',
      room_type_id: 'rt_suite',
      room_type_name: 'Deluxe Suite',
      status: 'AVAILABLE',
      housekeeping_status: 'CLEAN',
      active_maintenance: [],
    },
    {
      id: 'room_102',
      _id: 'room_102',
      room_number: '102',
      floor: '1',
      room_type_id: 'rt_standard',
      room_type_name: 'Standard Room',
      status: 'AVAILABLE',
      housekeeping_status: 'CLEAN',
      active_maintenance: [],
    },
    {
      id: 'room_103',
      _id: 'room_103',
      room_number: '103',
      floor: '1',
      room_type_id: 'rt_standard',
      room_type_name: 'Standard Room',
      status: 'OUT_OF_ORDER',
      housekeeping_status: 'CLEAN',
      active_maintenance: [],
    },
  ];

  const mockTimelineReservation = {
    id: 'res_5001_room_room_101',
    type: 'RESERVATION',
    item_type: 'RESERVATION',
    status: 'CONFIRMED',
    room_id: 'room_101',
    reservation_id: '5001',
    stay_id: null,
    booking_ref: 'RES-5001',
    guest: { id: 'g_1', name: 'Alice Smith', phone: '03001234567' },
    start_date: '2026-11-10T00:00:00.000Z',
    end_date: '2026-11-14T00:00:00.000Z',
    adults: 2,
    children: 0,
  };

  const mockTimelineStay = {
    id: 'stay_6001_room_room_101',
    type: 'STAY',
    item_type: 'STAY',
    status: 'IN_HOUSE',
    room_id: 'room_101',
    reservation_id: '5002',
    stay_id: '6001',
    stay_ref: 'STY-6001',
    booking_ref: 'RES-5002',
    guest: { id: 'g_2', name: 'Bob Johnson', phone: '03007654321' },
    start_date: '2026-11-10T00:00:00.000Z',
    end_date: '2026-11-15T00:00:00.000Z',
    adults: 1,
    children: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    reservationService.checkAvailability.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Workflow A: clicking future reservation block opens Reassignment modal with valid candidate rooms', async () => {
    roomService.getTapeChart.mockResolvedValue({
      date_range: { start_date: '2026-11-10', end_date: '2026-11-17', total_days: 7 },
      room_types: [],
      rooms: mockRooms,
      timeline_items: [mockTimelineReservation],
    });

    render(
      <MemoryRouter>
        <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // 1. Click explicit reassign action button
    fireEvent.click(screen.getByTestId('action-btn-res_5001_room_room_101'));

    // 2. Verify modal opened in Reassign mode
    expect(screen.getByText('Reassign Reservation Room')).toBeInTheDocument();
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveTextContent('Alice Smith');
    expect(modalDialog).toHaveTextContent('RES-5001');

    // 3. Verify destination options exclude current room 101 and OUT_OF_ORDER room 103
    const select = screen.getByTestId('destination-room-select');
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.textContent);
    
    // Should have placeholder and Room 102
    expect(options.some((o) => o.includes('Room 102'))).toBe(true);
    expect(options.some((o) => o.includes('Room 101'))).toBe(false); // Current room excluded
    expect(options.some((o) => o.includes('Room 103'))).toBe(false); // OUT_OF_ORDER excluded
  });

  it('Workflow A: successfully reassigns reservation and triggers authoritative Tape Chart refresh', async () => {
    roomService.getTapeChart.mockResolvedValue({
      date_range: { start_date: '2026-11-10', end_date: '2026-11-17', total_days: 7 },
      room_types: [],
      rooms: mockRooms,
      timeline_items: [mockTimelineReservation],
    });
    reservationService.reassignRoom.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('action-btn-res_5001_room_room_101'));

    // Select room 102
    const select = screen.getByTestId('destination-room-select');
    fireEvent.change(select, { target: { value: 'room_102' } });

    // Click Confirm Reassignment
    const confirmBtn = screen.getByTestId('confirm-transfer-button');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(reservationService.reassignRoom).toHaveBeenCalledWith('5001', {
        room_id: 'room_102',
      });
      // Verifies Tape Chart was refreshed after successful reassignment
      expect(roomService.getTapeChart).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('Workflow A: displays backend 409 conflict error when destination room is booked and preserves modal', async () => {
    roomService.getTapeChart.mockResolvedValue({
      date_range: { start_date: '2026-11-10', end_date: '2026-11-17', total_days: 7 },
      room_types: [],
      rooms: mockRooms,
      timeline_items: [mockTimelineReservation],
    });
    reservationService.reassignRoom.mockRejectedValue({
      response: {
        data: {
          message: 'Room 102 is already booked for the selected dates',
        },
      },
    });

    render(
      <MemoryRouter>
        <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('action-btn-res_5001_room_room_101'));

    const select = screen.getByTestId('destination-room-select');
    fireEvent.change(select, { target: { value: 'room_102' } });

    fireEvent.click(screen.getByTestId('confirm-transfer-button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Room 102 is already booked for the selected dates');
      // Modal stays open so user can pick another room
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('Workflow B: clicking active stay block opens Transfer Active Stay modal with reason field', async () => {
    roomService.getTapeChart.mockResolvedValue({
      date_range: { start_date: '2026-11-10', end_date: '2026-11-17', total_days: 7 },
      room_types: [],
      rooms: mockRooms,
      timeline_items: [mockTimelineStay],
    });

    render(
      <MemoryRouter>
        <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    // Click stay action button
    fireEvent.click(screen.getByTestId('action-btn-stay_6001_room_room_101'));

    // Modal title indicates Active Stay Transfer
    expect(screen.getByText('Transfer Active Stay')).toBeInTheDocument();
    const modalDialog = screen.getByRole('dialog');
    expect(modalDialog).toHaveTextContent('STY-6001');
    expect(modalDialog).toHaveTextContent('Bob Johnson');
    expect(screen.getByTestId('transfer-reason-input')).toBeInTheDocument();
  });

  it('Workflow B: successfully transfers active stay with reason and triggers authoritative refresh', async () => {
    roomService.getTapeChart.mockResolvedValue({
      date_range: { start_date: '2026-11-10', end_date: '2026-11-17', total_days: 7 },
      room_types: [],
      rooms: mockRooms,
      timeline_items: [mockTimelineStay],
    });
    stayService.transferRoom.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('action-btn-stay_6001_room_room_101'));

    fireEvent.change(screen.getByTestId('destination-room-select'), { target: { value: 'room_102' } });
    fireEvent.change(screen.getByTestId('transfer-reason-input'), {
      target: { value: 'Guest requested corner room' },
    });

    fireEvent.click(screen.getByTestId('confirm-transfer-button'));

    await waitFor(() => {
      expect(stayService.transferRoom).toHaveBeenCalledWith('6001', {
        room_id: 'room_102',
        reason: 'Guest requested corner room',
        source_room_id: 'room_101',
      });
      expect(roomService.getTapeChart).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('Workflow B: surfaces cleanliness gate rejection when destination is dirty', async () => {
    roomService.getTapeChart.mockResolvedValue({
      date_range: { start_date: '2026-11-10', end_date: '2026-11-17', total_days: 7 },
      room_types: [],
      rooms: mockRooms,
      timeline_items: [mockTimelineStay],
    });
    stayService.transferRoom.mockRejectedValue({
      response: {
        data: {
          message: 'Room 102 is currently DIRTY and cannot be assigned without manager override',
        },
      },
    });

    render(
      <MemoryRouter>
        <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('action-btn-stay_6001_room_room_101'));
    fireEvent.change(screen.getByTestId('destination-room-select'), { target: { value: 'room_102' } });
    fireEvent.click(screen.getByTestId('confirm-transfer-button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Room 102 is currently DIRTY and cannot be assigned without manager override'
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('preserves existing empty-cell reservation creation without interference from block clicks', async () => {
    roomService.getTapeChart.mockResolvedValue({
      date_range: { start_date: '2026-11-10', end_date: '2026-11-17', total_days: 7 },
      room_types: [],
      rooms: mockRooms,
      timeline_items: [mockTimelineReservation],
    });

    render(
      <MemoryRouter>
        <TapeChart initialStartDate="2026-11-10" initialViewDays={7} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    // Clicking an eligible empty cell opens ReservationFormModal (Step 3 feature)
    const emptyCellBtn = screen.getByTestId('empty-cell-102-2026-11-10');
    fireEvent.click(emptyCellBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Add New Booking').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Reassign Reservation Room')).not.toBeInTheDocument();
  });
});
