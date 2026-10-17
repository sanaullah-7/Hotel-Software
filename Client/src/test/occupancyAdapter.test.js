import { describe, it, expect } from 'vitest';
import {
  toFrontendOccupancyRooms,
  toFrontendOccupancySummary,
  formatDateToYMD,
  OCCUPANCY_STATUS,
  STATUS_COLORS,
  HK_COLORS,
  UI_HK_MAP,
} from '../features/occupancy/adapters/occupancyAdapter';

describe('occupancyAdapter Unit Tests', () => {
  const mockRooms = [
    {
      _id: '67a1b2c3d4e5f67890123451',
      room_number: '101',
      floor: '1',
      status: 'OCCUPIED',
      housekeeping_status: 'CLEAN',
      room_type_id: {
        _id: '67a1b2c3d4e5f67890123401',
        name: 'Super Deluxe',
        code: 'SDX',
        base_price: 320,
        base_occupancy: 2,
        max_occupancy: 4,
        amenities: [{ amenity_id: { name: 'wifi' } }, { amenity_id: { name: 'ac' } }],
      },
    },
    {
      _id: '67a1b2c3d4e5f67890123452',
      room_number: '102',
      floor: '1',
      status: 'AVAILABLE',
      housekeeping_status: 'CLEAN',
      room_type_id: {
        _id: '67a1b2c3d4e5f67890123402',
        name: 'Deluxe Room',
        code: 'DLX',
        base_price: 280,
        base_occupancy: 2,
        max_occupancy: 3,
        amenities: [],
      },
    },
    {
      _id: '67a1b2c3d4e5f67890123453',
      room_number: '103',
      floor: '1',
      status: 'CLEANING',
      housekeeping_status: 'DIRTY',
      room_type_id: {
        _id: '67a1b2c3d4e5f67890123403',
        name: 'Standard Room',
        code: 'STD',
        base_price: 180,
        base_occupancy: 1,
        max_occupancy: 2,
      },
    },
    {
      _id: '67a1b2c3d4e5f67890123454',
      room_number: '104',
      floor: '1',
      status: 'MAINTENANCE',
      housekeeping_status: 'OUT_OF_ORDER',
      room_type_id: {
        _id: '67a1b2c3d4e5f67890123404',
        name: 'Suite',
        code: 'STE',
        base_price: 450,
        base_occupancy: 2,
        max_occupancy: 4,
      },
    },
  ];

  const mockStays = [
    {
      _id: '67a1b2c3d4e5f67890123471',
      stay_ref: 'STY-101001',
      status: 'CHECKED_IN',
      actual_check_in: '2026-10-01T15:00:00.000Z',
      actual_check_out: null,
      total_guests: 2,
      notes: 'VIP guest, prefers ocean view',
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123481',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-1234',
        guest_ref: 'GST-001',
        passport_number: 'AB123CD456',
        vip: true,
        loyalty_points: 1250,
      },
      reservation_id: {
        _id: '67a1b2c3d4e5f67890123491',
        booking_ref: 'RES-001001',
        expected_check_in: '2026-10-01T15:00:00.000Z',
        expected_check_out: '2026-10-07T11:00:00.000Z',
        payment_status: 'paid',
        total_amount: 2240,
        booking_source: 'direct',
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123451',
            room_number: '101',
          },
        },
      ],
    },
  ];

  const mockReservations = [
    {
      _id: '67a1b2c3d4e5f67890123492',
      booking_ref: 'RES-001002',
      status: 'CONFIRMED',
      expected_check_in: '2026-10-10T15:00:00.000Z',
      expected_check_out: '2026-10-15T11:00:00.000Z',
      adults: 2,
      primary_guest_id: {
        _id: '67a1b2c3d4e5f67890123482',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-5678',
        guest_ref: 'GST-002',
        vip: false,
      },
      rooms: [
        {
          room_id: {
            _id: '67a1b2c3d4e5f67890123452',
            room_number: '102',
          },
        },
      ],
    },
  ];

  describe('toFrontendOccupancyRooms', () => {
    it('returns empty array if backend rooms are empty', () => {
      const result = toFrontendOccupancyRooms([], [], []);
      expect(result).toEqual([]);
    });

    it('returns empty array if roomsInput is null/undefined', () => {
      expect(toFrontendOccupancyRooms(null)).toEqual([]);
      expect(toFrontendOccupancyRooms(undefined)).toEqual([]);
    });

    it('adapts backend rooms and links active stay for occupied room', () => {
      const result = toFrontendOccupancyRooms(mockRooms, mockStays, mockReservations);
      expect(result).toHaveLength(4);

      const room101 = result.find((r) => r.roomNo === '101');
      expect(room101).toBeDefined();
      expect(room101.id).toBe('67a1b2c3d4e5f67890123451');
      expect(room101.status).toBe('OCCUPIED');
      expect(room101.statusColor).toBe('#ef4444');
      expect(room101.type).toBe('Super Deluxe');
      expect(room101.price).toBe(320);
      expect(room101.housekeeping).toBe('Clean');
      expect(room101.housekeepingColor).toBe('#1b7f43');
      expect(room101.stayId).toBe('67a1b2c3d4e5f67890123471');
      expect(room101.reservationId).toBe('67a1b2c3d4e5f67890123491');

      // Guest details
      expect(room101.guest).toBeDefined();
      expect(room101.guest.name).toBe('John Doe');
      expect(room101.guest.vip).toBe(true);
      expect(room101.guest.id).toBe('AB123CD456');
      expect(room101.guest.email).toBe('john.doe@example.com');
      expect(room101.guest.phone).toBe('+1-555-1234');
      expect(room101.guest.checkIn).toBe('2026-10-01');
      expect(room101.guest.checkOut).toBe('2026-10-07');
      expect(room101.guest.bookingRef).toBe('RES-001001');
      expect(room101.guest.paymentStatus).toBe('paid');
      expect(room101.guest.totalAmount).toBe(2240);
      expect(room101.guest.loyaltyPoints).toBe(1250);
    });

    it('adapts available room and links upcoming confirmed reservation', () => {
      const result = toFrontendOccupancyRooms(mockRooms, mockStays, mockReservations);
      const room102 = result.find((r) => r.roomNo === '102');

      expect(room102).toBeDefined();
      expect(room102.status).toBe('RESERVED');
      expect(room102.statusColor).toBe('#f97316');
      expect(room102.guest.name).toBe('Jane Smith');
      expect(room102.guest.vip).toBe(false);
      expect(room102.guest.checkIn).toBe('2026-10-10');
      expect(room102.guest.checkOut).toBe('2026-10-15');
      expect(room102.guest.bookingRef).toBe('RES-001002');
    });

    it('adapts cleaning and maintenance room statuses correctly', () => {
      const result = toFrontendOccupancyRooms(mockRooms, mockStays, mockReservations);

      const room103 = result.find((r) => r.roomNo === '103');
      expect(room103.status).toBe('CLEANING');
      expect(room103.statusColor).toBe('#3b82f6');
      expect(room103.housekeeping).toBe('Dirty');
      expect(room103.housekeepingColor).toBe('#ef4444');
      expect(room103.guest).toBeNull();

      const room104 = result.find((r) => r.roomNo === '104');
      expect(room104.status).toBe('MAINTENANCE');
      expect(room104.statusColor).toBe('#8b5cf6');
      expect(room104.housekeeping).toBe('Out of Order');
      expect(room104.housekeepingColor).toBe('#6b7280');
      expect(room104.guest).toBeNull();
    });

    it('handles response envelopes with data and pagination properties', () => {
      const roomsEnv = { data: { rooms: mockRooms } };
      const staysEnv = { data: { stays: mockStays } };
      const resEnv = { data: { reservations: mockReservations } };

      const result = toFrontendOccupancyRooms(roomsEnv, staysEnv, resEnv);
      expect(result).toHaveLength(4);
      expect(result[0].roomNo).toBe('101');
    });
  });

  describe('toFrontendOccupancySummary', () => {
    it('calculates summary cards correctly for populated rooms', () => {
      const rooms = toFrontendOccupancyRooms(mockRooms, mockStays, mockReservations);
      const summary = toFrontendOccupancySummary(rooms);

      expect(summary.totalRooms).toBe(4);
      expect(summary.occupiedRooms).toBe(1);
      expect(summary.availableRooms).toBe(0); // 1 occupied, 1 reserved, 1 cleaning, 1 maintenance
      expect(summary.occupancyRate).toBe(25); // 1 / 4 = 25%
    });

    it('returns zeroes for empty room list', () => {
      const summary = toFrontendOccupancySummary([]);
      expect(summary.totalRooms).toBe(0);
      expect(summary.availableRooms).toBe(0);
      expect(summary.occupiedRooms).toBe(0);
      expect(summary.occupancyRate).toBe(0);
    });
  });

  describe('formatDateToYMD', () => {
    it('formats ISO string to YYYY-MM-DD', () => {
      expect(formatDateToYMD('2026-10-05T12:30:00.000Z')).toBe('2026-10-05');
    });

    it('passes through existing YYYY-MM-DD string', () => {
      expect(formatDateToYMD('2026-10-05')).toBe('2026-10-05');
    });

    it('returns empty string for null, undefined, or empty', () => {
      expect(formatDateToYMD(null)).toBe('');
      expect(formatDateToYMD(undefined)).toBe('');
      expect(formatDateToYMD('')).toBe('');
      expect(formatDateToYMD('invalid-date')).toBe('');
    });
  });
});
