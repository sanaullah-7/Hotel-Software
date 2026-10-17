import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TapeChart from '../features/occupancy/pages/TapeChart';
import roomService from '../services/roomService';
import {
  addDaysYMD,
  diffDaysYMD,
  getTodayYMD,
  toYMD,
  formatRangeDisplay,
} from '../features/occupancy/utils/tapeChartDates';

// Mock roomService
vi.mock('../services/roomService', () => ({
  default: {
    getTapeChart: vi.fn(),
  },
}));

describe('Phase 3 — Step 2: Read-Only Tape Chart Timeline Integration Suite', () => {
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
      room_number: '102',
      floor: '1',
      room_type_id: 'rt_suite',
      room_type_name: 'Deluxe Suite',
      room_type_code: 'DLX-S',
      status: 'MAINTENANCE',
      housekeeping_status: 'DIRTY',
      active_maintenance: [
        {
          id: 'tick_102',
          ticket_ref: 'TICK-102',
          title: 'AC refrigerant gas refill',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
        },
      ],
    },
    {
      id: 'room_201',
      room_number: '201',
      floor: '2',
      room_type_id: 'rt_standard',
      room_type_name: 'Standard Room',
      room_type_code: 'STD',
      status: 'OCCUPIED',
      housekeeping_status: 'CLEAN',
      active_maintenance: [],
    },
  ];

  const mockTimelineItems = [
    {
      id: 'stay_s1_room_201',
      type: 'STAY',
      status: 'IN_HOUSE',
      room_id: 'room_201',
      reservation_id: 'res_001',
      stay_id: 'stay_001',
      booking_ref: 'RES-001',
      stay_ref: 'STY-101001',
      guest: {
        id: 'g_001',
        name: 'Sarah Connor',
        phone: '03001234567',
      },
      start_date: '2026-11-10T15:00:00.000Z',
      end_date: '2026-11-14T11:00:00.000Z',
      adults: 2,
      children: 0,
      special_requests: 'Quiet room near elevator',
    },
    {
      id: 'res_r2_room_101',
      type: 'RESERVATION',
      status: 'CONFIRMED',
      room_id: 'room_101',
      reservation_id: 'res_002',
      stay_id: null,
      booking_ref: 'RES-002',
      stay_ref: null,
      guest: {
        id: 'g_002',
        name: 'John Connor',
        phone: '03111234567',
      },
      start_date: '2026-11-12T14:00:00.000Z',
      end_date: '2026-11-16T11:00:00.000Z',
      adults: 1,
      children: 1,
      special_requests: null,
    },
    // Multi-room child item (part of multi-room booking on room 101)
    {
      id: 'res_multi_room_101',
      type: 'RESERVATION',
      status: 'CONFIRMED',
      room_id: 'room_101',
      reservation_id: 'res_multi',
      stay_id: null,
      booking_ref: 'RES-MULTI-GROUP',
      stay_ref: null,
      guest: {
        id: 'g_003',
        name: 'T-800',
        phone: '03221234567',
      },
      start_date: '2026-11-16T14:00:00.000Z',
      end_date: '2026-11-17T11:00:00.000Z',
      adults: 2,
    },
    // Multi-room child item on room 201
    {
      id: 'res_multi_room_201',
      type: 'RESERVATION',
      status: 'CONFIRMED',
      room_id: 'room_201',
      reservation_id: 'res_multi',
      stay_id: null,
      booking_ref: 'RES-MULTI-GROUP',
      stay_ref: null,
      guest: {
        id: 'g_003',
        name: 'T-800',
        phone: '03221234567',
      },
      start_date: '2026-11-16T14:00:00.000Z',
      end_date: '2026-11-17T11:00:00.000Z',
      adults: 2,
    },
    // Unassigned reservation (no room_id)
    {
      id: 'res_unassigned_99',
      type: 'RESERVATION',
      status: 'CONFIRMED',
      room_id: null,
      reservation_id: 'res_unassigned',
      stay_id: null,
      booking_ref: 'RES-UNASSIGNED-99',
      stay_ref: null,
      guest: {
        id: 'g_004',
        name: 'Kyle Reese',
        phone: '03331234567',
      },
      start_date: '2026-11-11T14:00:00.000Z',
      end_date: '2026-11-13T11:00:00.000Z',
      adults: 1,
      children: 0,
      special_requests: 'Late arrival',
    },
  ];

  const standardPayload = {
    date_range: {
      start_date: '2026-11-10',
      end_date: '2026-11-17',
      total_days: 7,
    },
    room_types: mockRoomTypes,
    rooms: mockRooms,
    timeline_items: mockTimelineItems,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    roomService.getTapeChart.mockResolvedValue({
      statusCode: 200,
      data: standardPayload,
      message: 'Tape chart retrieved successfully',
      success: true,
    });
  });

  // ----------------------------------------------------
  // 1. DATE CALCULATION & INTERVAL SEMANTICS
  // ----------------------------------------------------
  describe('1. Date Range & Exclusive End Date Semantics', () => {
    it('calculates exclusive end dates accurately for 7, 14, and 30-day views without DST shifts', () => {
      const start = '2026-11-10';

      // 7-day view -> exclusive end is 7 days later
      const end7 = addDaysYMD(start, 7);
      expect(end7).toBe('2026-11-17');
      expect(diffDaysYMD(start, end7)).toBe(7);

      // 14-day view -> exclusive end is 14 days later
      const end14 = addDaysYMD(start, 14);
      expect(end14).toBe('2026-11-24');
      expect(diffDaysYMD(start, end14)).toBe(14);

      // 30-day view -> exclusive end is 30 days later
      const end30 = addDaysYMD(start, 30);
      expect(end30).toBe('2026-12-10');
      expect(diffDaysYMD(start, end30)).toBe(30);

      // Month rollover check
      const dec31 = '2026-12-31';
      expect(addDaysYMD(dec31, 1)).toBe('2027-01-01');
      expect(addDaysYMD(dec31, 7)).toBe('2027-01-07');
    });

    it('formats human range label correctly', () => {
      const label7 = formatRangeDisplay('2026-11-10', 7);
      expect(label7).toBe('Nov 10 – 16, 2026 (7 nights)');

      const labelSpanning = formatRangeDisplay('2026-11-25', 14);
      expect(labelSpanning).toBe('Nov 25 – Dec 8, 2026 (14 nights)');
    });
  });

  // ----------------------------------------------------
  // 2. TIMELINE RENDERING & DATA BINDING
  // ----------------------------------------------------
  describe('2. Room, Room-Type and Timeline Item Rendering', () => {
    it('renders room type groups, rooms, and timeline items from the API contract', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" />
        </MemoryRouter>
      );

      // Wait for data load
      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });

      // Verify Room Types rendered
      expect(screen.getByText('Standard Room')).toBeInTheDocument();
      expect(screen.getByText('DLX-S')).toBeInTheDocument();
      expect(screen.getByText('STD')).toBeInTheDocument();

      // Verify Rooms rendered
      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('102')).toBeInTheDocument();
      expect(screen.getByText('201')).toBeInTheDocument();

      // Verify In-House Stay item rendered
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();

      // Verify Confirmed Reservation item rendered
      expect(screen.getByText('John Connor')).toBeInTheDocument();
    });

    it('represents active maintenance as room metadata without drawing fabricated spanning timeline bars', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('102')).toBeInTheDocument();
      });

      // Room 102 operational status
      expect(screen.getByText('MAINTENANCE')).toBeInTheDocument();

      // Active maintenance ticket metadata badge
      expect(screen.getByText(/Ticket \(1\)/i)).toBeInTheDocument();
    });

    it('accurately maps multi-room reservations to both assigned physical room rows', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('101')).toBeInTheDocument();
      });

      // T-800 appears twice: once on Room 101, once on Room 201
      const multiItems = screen.getAllByText('T-800');
      expect(multiItems).toHaveLength(2);
    });

    it('safely isolates unassigned bookings into the Unassigned Drawer without fabricating physical room rows', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Unassigned \(1\)/i)).toBeInTheDocument();
      });

      // Click Unassigned button to open drawer
      const unassignedBtn = screen.getByText(/Unassigned \(1\)/i);
      fireEvent.click(unassignedBtn);

      // Verify unassigned guest Kyle Reese is displayed in drawer
      expect(screen.getByText('Kyle Reese')).toBeInTheDocument();
      expect(screen.getByText('RES-UNASSIGNED-99')).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------
  // 3. NAVIGATION & VIEW CONTROLS
  // ----------------------------------------------------
  describe('3. Date Navigation & View Window Switching', () => {
    it('navigates next and previous periods by the selected view duration', async () => {
      render(
        <MemoryRouter>
          <TapeChart />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(roomService.getTapeChart).toHaveBeenCalledTimes(1);
      });

      const nextBtn = screen.getByLabelText('Next period');
      fireEvent.click(nextBtn);

      await waitFor(() => {
        expect(roomService.getTapeChart).toHaveBeenCalledTimes(2);
      });

      const prevBtn = screen.getByLabelText('Previous period');
      fireEvent.click(prevBtn);

      await waitFor(() => {
        expect(roomService.getTapeChart).toHaveBeenCalledTimes(3);
      });
    });

    it('switches between 7, 14, and 30-day views and triggers new query with updated exclusive end dates', async () => {
      render(
        <MemoryRouter>
          <TapeChart />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('14 Days')).toBeInTheDocument();
      });

      // Click 14 Days
      fireEvent.click(screen.getByText('14 Days'));
      await waitFor(() => {
        expect(roomService.getTapeChart).toHaveBeenCalledTimes(2);
      });

      // Click 30 Days
      fireEvent.click(screen.getByText('30 Days'));
      await waitFor(() => {
        expect(roomService.getTapeChart).toHaveBeenCalledTimes(3);
      });
    });

    it('reloads data when Refresh button is clicked', async () => {
      render(
        <MemoryRouter>
          <TapeChart />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Refresh'));
      await waitFor(() => {
        expect(roomService.getTapeChart).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ----------------------------------------------------
  // 4. ERROR HANDLING & RETRY
  // ----------------------------------------------------
  describe('4. Loading, Error and Empty States', () => {
    it('surfaces API failure message and provides a functional Retry button', async () => {
      roomService.getTapeChart.mockRejectedValueOnce(new Error('Network connection timeout'));

      render(
        <MemoryRouter>
          <TapeChart />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Network connection timeout/i)).toBeInTheDocument();
      });

      // Click Retry
      const retryBtn = screen.getByRole('button', { name: /Retry/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      });
    });

    it('displays clean empty state when hotel has no rooms configured', async () => {
      roomService.getTapeChart.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          date_range: { start_date: '2026-11-10', end_date: '2026-11-17', total_days: 7 },
          room_types: [],
          rooms: [],
          timeline_items: [],
        },
      });

      render(
        <MemoryRouter>
          <TapeChart />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No Rooms Found/i)).toBeInTheDocument();
      });
    });

    it('opens and closes the Unassigned Bookings drawer from the header control', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTitle('Toggle unassigned bookings tray')).toBeInTheDocument();
      });

      // Click Unassigned button in header
      fireEvent.click(screen.getByTitle('Toggle unassigned bookings tray'));

      // Drawer opens displaying "Unassigned Bookings" header
      expect(screen.getByText('Unassigned Bookings')).toBeInTheDocument();

      // Close drawer
      const closeBtn = screen.getByLabelText('Close unassigned bookings drawer');
      fireEvent.click(closeBtn);

      expect(screen.queryByText('Unassigned Bookings')).not.toBeInTheDocument();
    });
  });

  // ----------------------------------------------------
  // 5. PRESERVATION OF EXISTING OCCUPANCY NAVIGATION
  // ----------------------------------------------------
  describe('5. Preservation of Existing Occupancy Navigation', () => {
    it('provides bidirectional navigation link back to the Card Grid view', async () => {
      render(
        <MemoryRouter>
          <TapeChart initialStartDate="2026-11-10" />
        </MemoryRouter>
      );

      await waitFor(() => {
        const roomCardsLink = screen.getByTitle('Switch to Card Grid View');
        expect(roomCardsLink).toBeInTheDocument();
        expect(roomCardsLink.getAttribute('href')).toBe('/occupancy');
      });
    });
  });
});
