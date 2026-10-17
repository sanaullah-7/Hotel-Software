import { describe, it, expect } from 'vitest';
import {
  toFrontendStay,
  toFrontendStayList,
  toFrontendFrontOfficeRows,
  toBackendCheckInPayload,
  toBackendCheckOutPayload,
  formatDateToYMD,
  formatTimeToHHMM,
  BACKEND_STAY_STATUS,
  UI_STAY_STATUS_MAP,
  BACKEND_STAY_STATUS_MAP,
} from '../features/front-office/adapters/stayAdapter.js';

describe('Phase 5 Step 2: Stay & Front Office Data Adapter Unit Tests', () => {
  const mockMongoStayId = '65b1c2d3e4f5678901234567';
  const mockMongoGuestId = '65a1b2c3d4e5f67890123456';
  const mockMongoReservationId = '65c1d2e3f4a5678901234578';
  const mockMongoRoomId = '65d1e2f3a4b5678901234589';

  describe('1. Date and Time Formatters (Pure Helpers)', () => {
    it('formats ISO date strings and Date objects to YYYY-MM-DD', () => {
      expect(formatDateToYMD('2026-10-06T14:30:00.000Z')).toBe('2026-10-06');
      expect(formatDateToYMD('2026-12-25')).toBe('2026-12-25');
      expect(formatDateToYMD(new Date('2026-05-15T00:00:00.000Z'))).toBe('2026-05-15');
    });

    it('returns empty string for null, undefined, empty, or invalid dates', () => {
      expect(formatDateToYMD(null)).toBe('');
      expect(formatDateToYMD(undefined)).toBe('');
      expect(formatDateToYMD('')).toBe('');
      expect(formatDateToYMD('invalid-date')).toBe('');
    });

    it('formats ISO timestamps to UTC HH:mm', () => {
      expect(formatTimeToHHMM('2026-10-06T14:30:00.000Z')).toBe('14:30');
      expect(formatTimeToHHMM('2026-10-06T09:05:00.000Z')).toBe('09:05');
      expect(formatTimeToHHMM(null)).toBe('');
      expect(formatTimeToHHMM(undefined)).toBe('');
      expect(formatTimeToHHMM('invalid')).toBe('');
    });
  });

  describe('2. Canonical Stay Document Transformation', () => {
    it('transforms a complete backend Stay with populated relationships into Front Office view model', () => {
      const backendStay = {
        _id: mockMongoStayId,
        stay_ref: 'STY-123456ABC',
        status: 'CHECKED_IN',
        actual_check_in: '2026-10-03T14:00:00.000Z',
        actual_check_out: null,
        total_guests: 2,
        notes: 'VIP guest - champagne requested',
        created_at: '2026-10-03T14:00:00.000Z',
        primary_guest_id: {
          _id: mockMongoGuestId,
          guest_ref: 'GST-998877',
          first_name: 'Alexander',
          last_name: 'Hamilton',
          email: 'alex.h@treasury.gov',
          phone: '+1-555-0199',
        },
        reservation_id: {
          _id: mockMongoReservationId,
          booking_ref: 'RES-445566',
          expected_check_in: '2026-10-03T14:00:00.000Z',
          expected_check_out: '2026-10-07T11:00:00.000Z',
        },
        rooms: [
          {
            _id: '65e1f2a3b4c5678901234599',
            stay_id: mockMongoStayId,
            room_id: {
              _id: mockMongoRoomId,
              room_number: '404',
              floor: '4',
              status: 'OCCUPIED',
              housekeeping_status: 'CLEAN',
              room_type_id: {
                name: 'Presidential Suite',
                code: 'PRES',
              },
            },
            status: 'OCCUPIED',
          },
        ],
      };

      const result = toFrontendStay(backendStay);

      // Verify canonical IDs
      expect(result.id).toBe(mockMongoStayId);
      expect(result.stayId).toBe(mockMongoStayId);
      expect(result.stayRef).toBe('STY-123456ABC');
      expect(result.reservationId).toBe(mockMongoReservationId);
      expect(result.bookingId).toBe('RES-445566');
      expect(result.bookingRef).toBe('RES-445566');

      // Verify Guest details
      expect(result.guestId).toBe(mockMongoGuestId);
      expect(result.guestRef).toBe('GST-998877');
      expect(result.firstName).toBe('Alexander');
      expect(result.lastName).toBe('Hamilton');
      expect(result.name).toBe('Alexander Hamilton');
      expect(result.email).toBe('alex.h@treasury.gov');
      expect(result.phone).toBe('+1-555-0199');

      // Verify Room details
      expect(result.roomId).toBe(mockMongoRoomId);
      expect(result.room).toBe('404');
      expect(result.roomNo).toBe('404');
      expect(result.roomFloor).toBe('4');
      expect(result.roomType).toBe('Presidential Suite');
      expect(result.roomStatus).toBe('OCCUPIED');

      // Verify Status & Dates
      expect(result.status).toBe('Checked In');
      expect(result.rawStatus).toBe('CHECKED_IN');
      expect(result.checkIn).toBe('2026-10-03');
      expect(result.checkOut).toBe('2026-10-07');
      expect(result.checkInTime).toBe('14:00');
      expect(result.checkOutTime).toBe('');

      // Verify Operational Metadata
      expect(result.totalGuests).toBe(2);
      expect(result.notes).toBe('VIP guest - champagne requested');
      expect(result.isLegacyUnmapped).toBe(false);
    });

    it('transforms a checked-out Stay document with actual_check_out timestamp', () => {
      const checkedOutStay = {
        _id: mockMongoStayId,
        stay_ref: 'STY-999888',
        status: 'CHECKED_OUT',
        actual_check_in: '2026-10-01T12:00:00.000Z',
        actual_check_out: '2026-10-05T10:30:00.000Z',
        total_guests: 1,
        primary_guest_id: {
          _id: mockMongoGuestId,
          first_name: 'Sarah',
          last_name: 'Connor',
          email: 'sarah@sky.net',
        },
        reservation_id: {
          _id: mockMongoReservationId,
          booking_ref: 'RES-112233',
        },
        rooms: [
          {
            room_id: {
              _id: mockMongoRoomId,
              room_number: '101',
              status: 'AVAILABLE',
              housekeeping_status: 'DIRTY',
            },
          },
        ],
      };

      const result = toFrontendStay(checkedOutStay);

      expect(result.status).toBe('Checked Out');
      expect(result.rawStatus).toBe('CHECKED_OUT');
      expect(result.checkIn).toBe('2026-10-01');
      expect(result.checkOut).toBe('2026-10-05');
      expect(result.checkInTime).toBe('12:00');
      expect(result.checkOutTime).toBe('10:30');
      expect(result.room).toBe('101');
      expect(result.housekeepingStatus).toBe('DIRTY');
    });

    it('handles wrapped API response envelopes like { stay: { ... } }', () => {
      const apiResponse = {
        stay: {
          _id: mockMongoStayId,
          stay_ref: 'STY-WRAPPED',
          status: 'CHECKED_IN',
          total_guests: 1,
        },
      };

      const result = toFrontendStay(apiResponse);
      expect(result.id).toBe(mockMongoStayId);
      expect(result.stayRef).toBe('STY-WRAPPED');
      expect(result.status).toBe('Checked In');
    });
  });

  describe('3. Single stayRoom Check-In Response Envelope', () => {
    it('handles checkIn API response shape with stayRoom property', () => {
      const checkInResponse = {
        stay: {
          _id: mockMongoStayId,
          stay_ref: 'STY-NEW',
          status: 'CHECKED_IN',
          actual_check_in: '2026-10-06T15:00:00.000Z',
        },
        stayRoom: {
          _id: '65f1a2b3c4d5678901234500',
          room_id: mockMongoRoomId,
          status: 'OCCUPIED',
        },
        room: {
          _id: mockMongoRoomId,
          room_number: '205',
          status: 'OCCUPIED',
        },
        reservation: {
          _id: mockMongoReservationId,
          booking_ref: 'RES-889900',
          status: 'IN_HOUSE',
        },
      };

      const result = toFrontendStay(checkInResponse);
      expect(result.id).toBe(mockMongoStayId);
      expect(result.stayRef).toBe('STY-NEW');
      expect(result.status).toBe('Checked In');
    });
  });

  describe('4. Missing & Optional Relationships (Null-Safety)', () => {
    it('safely handles missing or unpopulated Guest reference', () => {
      const stayWithoutGuest = {
        _id: mockMongoStayId,
        stay_ref: 'STY-NOGUEST',
        primary_guest_id: mockMongoGuestId, // String ID only, not populated
        status: 'CHECKED_IN',
      };

      const result = toFrontendStay(stayWithoutGuest);
      expect(result.id).toBe(mockMongoStayId);
      expect(result.guestId).toBe(mockMongoGuestId);
      expect(result.name).toBe('Guest');
      expect(result.email).toBe('');
      expect(result.phone).toBe('');
    });

    it('safely handles missing or unpopulated Reservation reference', () => {
      const stayWithoutRes = {
        _id: mockMongoStayId,
        stay_ref: 'STY-NORES',
        reservation_id: mockMongoReservationId,
        status: 'CHECKED_IN',
      };

      const result = toFrontendStay(stayWithoutRes);
      expect(result.reservationId).toBe(mockMongoReservationId);
      expect(result.bookingRef).toBe('RES-234578');
    });

    it('safely handles missing or unpopulated Room reference', () => {
      const stayWithoutRoom = {
        _id: mockMongoStayId,
        stay_ref: 'STY-NOROOM',
        status: 'CHECKED_IN',
        rooms: [],
      };

      const result = toFrontendStay(stayWithoutRoom);
      expect(result.roomId).toBe('');
      expect(result.room).toBe('—');
      expect(result.roomNo).toBe('—');
      expect(result.roomType).toBe('Standard');
    });

    it('returns null for null, undefined, or invalid stay input', () => {
      expect(toFrontendStay(null)).toBeNull();
      expect(toFrontendStay(undefined)).toBeNull();
      expect(toFrontendStay('invalid')).toBeNull();
      expect(toFrontendStay(123)).toBeNull();
    });
  });

  describe('5. Status Normalization', () => {
    it('correctly maps all backend stay and reservation statuses to UI labels', () => {
      expect(UI_STAY_STATUS_MAP[BACKEND_STAY_STATUS.CHECKED_IN]).toBe('Checked In');
      expect(UI_STAY_STATUS_MAP[BACKEND_STAY_STATUS.CHECKED_OUT]).toBe('Checked Out');
      expect(UI_STAY_STATUS_MAP['IN_HOUSE']).toBe('Checked In');
      expect(UI_STAY_STATUS_MAP['CONFIRMED']).toBe('Booked');
      expect(UI_STAY_STATUS_MAP['PENDING']).toBe('Pending');
      expect(UI_STAY_STATUS_MAP['CANCELLED']).toBe('Cancelled');
      expect(UI_STAY_STATUS_MAP['NO_SHOW']).toBe('Cancelled');

      expect(BACKEND_STAY_STATUS_MAP['Checked In']).toBe('CHECKED_IN');
      expect(BACKEND_STAY_STATUS_MAP['Checked Out']).toBe('CHECKED_OUT');
      expect(BACKEND_STAY_STATUS_MAP['In House']).toBe('CHECKED_IN');
    });
  });

  describe('6. toFrontendStayList Transformation', () => {
    it('transforms an array of stays', () => {
      const stays = [
        { _id: '1', stay_ref: 'STY-1', status: 'CHECKED_IN' },
        { _id: '2', stay_ref: 'STY-2', status: 'CHECKED_OUT' },
      ];

      const list = toFrontendStayList(stays);
      expect(list).toHaveLength(2);
      expect(list[0].id).toBe('1');
      expect(list[1].id).toBe('2');
    });

    it('transforms paginated API envelope { stays: [...] }', () => {
      const response = {
        stays: [
          { _id: '1', stay_ref: 'STY-1', status: 'CHECKED_IN' },
        ],
        pagination: { page: 1, limit: 10, total: 1 },
      };

      const list = toFrontendStayList(response);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('1');
    });

    it('transforms API envelope with data property { data: [...] }', () => {
      const response = {
        data: [
          { _id: '2', stay_ref: 'STY-2', status: 'CHECKED_OUT' },
        ],
      };

      const list = toFrontendStayList(response);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('2');
    });

    it('returns empty array for empty, null, or undefined inputs', () => {
      expect(toFrontendStayList(null)).toEqual([]);
      expect(toFrontendStayList(undefined)).toEqual([]);
      expect(toFrontendStayList([])).toEqual([]);
      expect(toFrontendStayList({})).toEqual([]);
    });
  });

  describe('7. Backend Payload Builders (Pure Transformers)', () => {
    it('builds clean backend check-in payload from frontend form data', () => {
      const frontendCheckInData = {
        reservationId: mockMongoReservationId,
        roomId: mockMongoRoomId,
        guestId: mockMongoGuestId,
        totalGuests: 2,
        notes: 'Early arrival requested',
      };

      const payload = toBackendCheckInPayload(frontendCheckInData);

      expect(payload).toEqual({
        reservation_id: mockMongoReservationId,
        room_id: mockMongoRoomId,
        primary_guest_id: mockMongoGuestId,
        total_guests: 2,
        notes: 'Early arrival requested',
      });
    });

    it('builds minimal check-in payload when optional fields are omitted', () => {
      const minimalData = {
        reservationId: mockMongoReservationId,
      };

      const payload = toBackendCheckInPayload(minimalData);

      expect(payload).toEqual({
        reservation_id: mockMongoReservationId,
        total_guests: 1,
      });
    });

    it('builds clean backend check-out payload with stay_id and notes', () => {
      const checkoutData = {
        stayId: mockMongoStayId,
        notes: 'Settled all charges, smooth checkout',
      };

      const payload = toBackendCheckOutPayload(checkoutData);

      expect(payload).toEqual({
        stay_id: mockMongoStayId,
        notes: 'Settled all charges, smooth checkout',
      });
    });

    it('builds backend check-out payload with reservation_id fallback when stay_id not passed', () => {
      const checkoutData = {
        reservationId: mockMongoReservationId,
      };

      const payload = toBackendCheckOutPayload(checkoutData);

      expect(payload).toEqual({
        reservation_id: mockMongoReservationId,
      });
    });

    it('returns empty object for invalid payload inputs', () => {
      expect(toBackendCheckInPayload(null)).toEqual({});
      expect(toBackendCheckOutPayload(null)).toEqual({});
    });
  });

  describe('8. Canonical Mongo Identity Guarantee', () => {
    it('preserves exact MongoDB ObjectIds without inventing synthetic identifiers', () => {
      const stayDoc = {
        _id: '67a8b9c0d1e2f34567890123',
        stay_ref: 'STY-CANONICAL-TEST',
        primary_guest_id: { _id: '67a8b9c0d1e2f34567890124', first_name: 'Real', last_name: 'User' },
        reservation_id: { _id: '67a8b9c0d1e2f34567890125', booking_ref: 'RES-CANONICAL' },
      };

      const adapted = toFrontendStay(stayDoc);

      expect(adapted.id).toBe('67a8b9c0d1e2f34567890123');
      expect(adapted._id).toBe('67a8b9c0d1e2f34567890123');
      expect(adapted.stayId).toBe('67a8b9c0d1e2f34567890123');
      expect(adapted.guestId).toBe('67a8b9c0d1e2f34567890124');
      expect(adapted.reservationId).toBe('67a8b9c0d1e2f34567890125');

      // Guarantee no Date.now() synthetic string pattern
      expect(String(adapted.id)).not.toMatch(/^STY-\d{13}/);
      expect(String(adapted.guestId)).not.toMatch(/^GST-\d{13}/);
    });
  });

  describe('9. toFrontendFrontOfficeRows Consolidated Mapping', () => {
    it('merges stays and non-stayed reservations without duplicate rows', () => {
      const stays = [
        {
          _id: mockMongoStayId,
          stay_ref: 'STY-101',
          reservation_id: { _id: mockMongoReservationId, booking_ref: 'RES-101' },
          primary_guest_id: { _id: mockMongoGuestId, first_name: 'InHouse', last_name: 'Guest' },
          status: 'CHECKED_IN',
        },
      ];

      const reservations = [
        // This reservation is already in stays, so should NOT produce duplicate row
        {
          _id: mockMongoReservationId,
          booking_ref: 'RES-101',
          status: 'IN_HOUSE',
        },
        // This reservation is NOT in stays (upcoming arrival)
        {
          _id: '65c1d2e3f4a5678901234999',
          booking_ref: 'RES-UPCOMING',
          status: 'CONFIRMED',
          primary_guest_id: { _id: '65a1b2c3d4e5f67890123999', first_name: 'Arrival', last_name: 'Guest' },
          expected_check_in: '2026-10-06T14:00:00.000Z',
          expected_check_out: '2026-10-08T11:00:00.000Z',
          adults: 2,
        },
      ];

      const rows = toFrontendFrontOfficeRows(stays, reservations);

      expect(rows).toHaveLength(2);
      expect(rows[0].status).toBe('Checked In');
      expect(rows[0].bookingId).toBe('RES-101');
      expect(rows[0].stayId).toBe(mockMongoStayId);

      expect(rows[1].status).toBe('Booked');
      expect(rows[1].bookingId).toBe('RES-UPCOMING');
      expect(rows[1].stayId).toBe('');
      expect(rows[1].name).toBe('Arrival Guest');
    });
  });
});
