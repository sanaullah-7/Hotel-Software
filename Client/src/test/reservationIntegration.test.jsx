import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  toFrontendReservation,
  toBackendReservationPayload,
  BACKEND_RESERVATION_STATUS,
  UI_RESERVATION_STATUS_MAP,
  BACKEND_STATUS_MAP,
  formatDateToYMD,
} from '../features/reservations/adapters/reservationAdapter';
import {
  getReservations,
  syncReservationsFromBackend,
  RESERVATIONS_UPDATED_EVENT,
} from '../features/reservations/state/reservationStore';

describe('Phase 3: Reservation Adapter & Store Bridge Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Backend -> Frontend Adapter Transformations', () => {
    it('correctly adapts a normal confirmed reservation with populated guest and room details', () => {
      const backendRes = {
        _id: '65f1a2b3c4d5e6f7a8b9c0d1',
        tenant_id: 'tenant-123',
        booking_ref: 'RES-ABC123',
        status: 'CONFIRMED',
        expected_check_in: '2026-10-10T14:00:00.000Z',
        expected_check_out: '2026-10-15T11:00:00.000Z',
        adults: 2,
        children: 1,
        special_requests: 'High floor, quiet room',
        primary_guest_id: {
          _id: '65f1a2b3c4d5e6f7a8b9c0d2',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+15551234567',
        },
        rooms: [
          {
            room_id: {
              _id: '65f1a2b3c4d5e6f7a8b9c0d3',
              room_number: '305',
              floor: '3',
            },
            room_type_id: {
              _id: '65f1a2b3c4d5e6f7a8b9c0d4',
              name: 'Deluxe Suite',
              code: 'DLX',
            },
            nightly_rate: 150,
          },
        ],
        created_at: '2026-10-01T10:00:00.000Z',
      };

      const adapted = toFrontendReservation(backendRes);

      expect(adapted.id).toBe('65f1a2b3c4d5e6f7a8b9c0d1');
      expect(adapted._id).toBe('65f1a2b3c4d5e6f7a8b9c0d1');
      expect(adapted.canonicalBookingId).toBe('65f1a2b3c4d5e6f7a8b9c0d1');
      expect(adapted.bookingId).toBe('RES-ABC123');
      expect(adapted.bookingRef).toBe('RES-ABC123');

      // Guest mapping
      expect(adapted.guestId).toBe('65f1a2b3c4d5e6f7a8b9c0d2');
      expect(adapted.primary_guest_id).toBe('65f1a2b3c4d5e6f7a8b9c0d2');
      expect(adapted.name).toBe('John Doe');
      expect(adapted.firstName).toBe('John');
      expect(adapted.lastName).toBe('Doe');
      expect(adapted.email).toBe('john.doe@example.com');
      expect(adapted.mobile).toBe('+15551234567');
      expect(adapted.phone).toBe('+15551234567');

      // Room mapping
      expect(adapted.roomId).toBe('65f1a2b3c4d5e6f7a8b9c0d3');
      expect(adapted.roomNo).toBe('305');
      expect(adapted.room).toBe('305');
      expect(adapted.roomTypeId).toBe('65f1a2b3c4d5e6f7a8b9c0d4');
      expect(adapted.roomType).toBe('Deluxe Suite');

      // Dates and Status
      expect(adapted.checkIn).toBe('2026-10-10');
      expect(adapted.checkOut).toBe('2026-10-15');
      expect(adapted.status).toBe('Booked');
      expect(adapted.rawStatus).toBe('CONFIRMED');

      // Guest counts & Extras
      expect(adapted.adults).toBe(2);
      expect(adapted.children).toBe(1);
      expect(adapted.totalPerson).toBe('3');
      expect(adapted.specialRequests).toBe('High floor, quiet room');
    });

    it('correctly maps status enums across all canonical backend states', () => {
      const base = {
        _id: '65f1a2b3c4d5e6f7a8b9c001',
        expected_check_in: '2026-10-10',
        expected_check_out: '2026-10-12',
      };

      expect(toFrontendReservation({ ...base, status: 'PENDING' }).status).toBe('Pending');
      expect(toFrontendReservation({ ...base, status: 'CONFIRMED' }).status).toBe('Booked');
      expect(toFrontendReservation({ ...base, status: 'IN_HOUSE' }).status).toBe('Checked In');
      expect(toFrontendReservation({ ...base, status: 'CHECKED_OUT' }).status).toBe('Checked Out');
      expect(toFrontendReservation({ ...base, status: 'CANCELLED' }).status).toBe('Cancelled');
      expect(toFrontendReservation({ ...base, status: 'NO_SHOW' }).status).toBe('Cancelled');
    });

    it('handles wrapped API response with { reservation, room_details }', () => {
      const wrapped = {
        reservation: {
          _id: '65f1a2b3c4d5e6f7a8b9c099',
          booking_ref: 'RES-WRAP01',
          status: 'IN_HOUSE',
          expected_check_in: '2026-10-12T00:00:00.000Z',
          expected_check_out: '2026-10-16T00:00:00.000Z',
          primary_guest_id: 'guest-id-str',
          adults: 1,
          children: 0,
        },
        room_details: {
          room_id: 'room-id-99',
          room_type_id: 'roomtype-id-99',
        },
      };

      const adapted = toFrontendReservation(wrapped);
      expect(adapted.id).toBe('65f1a2b3c4d5e6f7a8b9c099');
      expect(adapted.status).toBe('Checked In');
      expect(adapted.guestId).toBe('guest-id-str');
      expect(adapted.roomId).toBe('room-id-99');
      expect(adapted.roomTypeId).toBe('roomtype-id-99');
      expect(adapted.checkIn).toBe('2026-10-12');
      expect(adapted.checkOut).toBe('2026-10-16');
    });

    it('correctly maps cancellation reason for cancelled reservations', () => {
      const backendRes = {
        _id: '65f1a2b3c4d5e6f7a8b9c100',
        status: 'CANCELLED',
        cancellation_reason: 'Guest requested cancellation due to flight change',
        expected_check_in: '2026-10-10',
        expected_check_out: '2026-10-12',
      };

      const adapted = toFrontendReservation(backendRes);
      expect(adapted.status).toBe('Cancelled');
      expect(adapted.cancellationReason).toBe('Guest requested cancellation due to flight change');
      expect(adapted.cancellation_reason).toBe('Guest requested cancellation due to flight change');
    });
  });

  describe('2. Frontend -> Backend Adapter Transformations', () => {
    it('transforms frontend form state into valid backend reservation payload', () => {
      const frontendForm = {
        guestId: '65f1a2b3c4d5e6f7a8b9c0d2',
        roomId: '65f1a2b3c4d5e6f7a8b9c0d3',
        roomTypeId: '65f1a2b3c4d5e6f7a8b9c0d4',
        checkIn: '2026-10-10',
        checkOut: '2026-10-15',
        adults: 2,
        children: 1,
        specialRequests: 'Near elevator please',
        status: 'Booked',
      };

      const payload = toBackendReservationPayload(frontendForm);

      expect(payload.primary_guest_id).toBe('65f1a2b3c4d5e6f7a8b9c0d2');
      expect(payload.room_id).toBe('65f1a2b3c4d5e6f7a8b9c0d3');
      expect(payload.room_type_id).toBe('65f1a2b3c4d5e6f7a8b9c0d4');
      expect(payload.expected_check_in).toBe(new Date('2026-10-10').toISOString());
      expect(payload.expected_check_out).toBe(new Date('2026-10-15').toISOString());
      expect(payload.adults).toBe(2);
      expect(payload.children).toBe(1);
      expect(payload.special_requests).toBe('Near elevator please');
      expect(payload.status).toBe('CONFIRMED');
    });

    it('correctly maps various frontend status labels to backend canonical status enum', () => {
      expect(toBackendReservationPayload({ checkIn: '2026-10-10', checkOut: '2026-10-12', status: 'Pending' }).status).toBe('PENDING');
      expect(toBackendReservationPayload({ checkIn: '2026-10-10', checkOut: '2026-10-12', status: 'Booked' }).status).toBe('CONFIRMED');
      expect(toBackendReservationPayload({ checkIn: '2026-10-10', checkOut: '2026-10-12', status: 'Checked In' }).status).toBe('IN_HOUSE');
      expect(toBackendReservationPayload({ checkIn: '2026-10-10', checkOut: '2026-10-12', status: 'Checked Out' }).status).toBe('CHECKED_OUT');
      expect(toBackendReservationPayload({ checkIn: '2026-10-10', checkOut: '2026-10-12', status: 'Cancelled' }).status).toBe('CANCELLED');
    });

    it('includes cancellation reason when provided in frontend form', () => {
      const frontendForm = {
        checkIn: '2026-10-10',
        checkOut: '2026-10-12',
        status: 'Cancelled',
        cancellationReason: 'Emergency trip cancellation',
      };

      const payload = toBackendReservationPayload(frontendForm);
      expect(payload.status).toBe('CANCELLED');
      expect(payload.cancellation_reason).toBe('Emergency trip cancellation');
    });
  });

  describe('3. Edge Cases & Safety', () => {
    it('handles null / undefined / empty input safely', () => {
      expect(toFrontendReservation(null)).toBeNull();
      expect(toFrontendReservation(undefined)).toBeNull();
      expect(toBackendReservationPayload(null)).toEqual({});
      expect(toBackendReservationPayload(undefined)).toEqual({});
    });

    it('handles reservation without populated guest (string ID / missing names)', () => {
      const minimalBackendRes = {
        _id: '65f1a2b3c4d5e6f7a8b9c555',
        primary_guest_id: '65f1a2b3c4d5e6f7a8b9c999',
        expected_check_in: '2026-11-01',
        expected_check_out: '2026-11-03',
        status: 'CONFIRMED',
      };

      const adapted = toFrontendReservation(minimalBackendRes);
      expect(adapted.guestId).toBe('65f1a2b3c4d5e6f7a8b9c999');
      expect(adapted.primary_guest_id).toBe('65f1a2b3c4d5e6f7a8b9c999');
      expect(adapted.name).toBe('Guest');
      expect(adapted.status).toBe('Booked');
    });

    it('handles unassigned room (empty rooms array)', () => {
      const unassignedRes = {
        _id: '65f1a2b3c4d5e6f7a8b9c666',
        expected_check_in: '2026-11-01',
        expected_check_out: '2026-11-03',
        status: 'PENDING',
        rooms: [],
      };

      const adapted = toFrontendReservation(unassignedRes);
      expect(adapted.roomId).toBe('');
      expect(adapted.roomNo).toBe('—');
      expect(adapted.roomType).toBe('Standard Room');
    });

    it('handles unknown backend status by falling back safely', () => {
      const unknownStatusRes = {
        _id: '65f1a2b3c4d5e6f7a8b9c777',
        status: 'UNKNOWN_CUSTOM_STATUS',
        expected_check_in: '2026-11-01',
        expected_check_out: '2026-11-03',
      };

      const adapted = toFrontendReservation(unknownStatusRes);
      expect(adapted.status).toBe('Pending');
      expect(adapted.rawStatus).toBe('UNKNOWN_CUSTOM_STATUS');
    });

    it('formats dates consistently without timezone shift', () => {
      expect(formatDateToYMD('2026-10-15')).toBe('2026-10-15');
      expect(formatDateToYMD('2026-10-15T00:00:00.000Z')).toBe('2026-10-15');
      expect(formatDateToYMD(null)).toBe('');
      expect(formatDateToYMD(undefined)).toBe('');
    });
  });

  describe('4. Transitional Reservation Store Bridge', () => {
    it('synchronizes backend reservations to compatibility store and dispatches event', () => {
      const eventListener = vi.fn();
      window.addEventListener(RESERVATIONS_UPDATED_EVENT, eventListener);

      const backendReservations = [
        {
          _id: '65f1a2b3c4d5e6f7a8b9c801',
          booking_ref: 'RES-SYNC01',
          status: 'CONFIRMED',
          expected_check_in: '2026-10-20T00:00:00.000Z',
          expected_check_out: '2026-10-25T00:00:00.000Z',
          adults: 2,
          children: 0,
          primary_guest_id: {
            _id: '65f1a2b3c4d5e6f7a8b9cg01',
            first_name: 'Alice',
            last_name: 'Smith',
            email: 'alice@example.com',
            phone: '1234567890',
          },
          rooms: [
            {
              room_id: { _id: '65f1a2b3c4d5e6f7a8b9cr01', room_number: '101' },
              room_type_id: { _id: '65f1a2b3c4d5e6f7a8b9ct01', name: 'Deluxe Room' },
            },
          ],
        },
      ];

      // Call store bridge
      syncReservationsFromBackend(backendReservations);

      // Verify event was fired
      expect(eventListener).toHaveBeenCalledTimes(1);

      // Verify downstream getReservations() returns updated data from compatibility cache
      const stored = getReservations();
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('65f1a2b3c4d5e6f7a8b9c801');
      expect(stored[0].bookingId).toBe('RES-SYNC01');
      expect(stored[0].name).toBe('Alice Smith');
      expect(stored[0].roomNo).toBe('101');
      expect(stored[0].status).toBe('Booked');

      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, eventListener);
    });

    it('overwrites stale localStorage cache with authoritative backend data', () => {
      // Set initial stale data in localStorage
      const staleBookings = [
        { id: 'stale-1', bookingId: 'OLD-001', name: 'Old Ghost Guest', status: 'Booked' },
      ];
      localStorage.setItem('hotel_reservations', JSON.stringify(staleBookings));

      expect(getReservations()).toHaveLength(1);
      expect(getReservations()[0].name).toBe('Old Ghost Guest');

      // Now backend returns empty list (or different bookings)
      const freshBackendList = [
        {
          _id: 'fresh-backend-1',
          booking_ref: 'RES-FRESH',
          status: 'CONFIRMED',
          expected_check_in: '2026-10-20',
          expected_check_out: '2026-10-22',
        },
      ];

      syncReservationsFromBackend(freshBackendList);

      const refreshed = getReservations();
      expect(refreshed).toHaveLength(1);
      expect(refreshed[0].id).toBe('fresh-backend-1');
      expect(refreshed[0].bookingId).toBe('RES-FRESH');
      expect(refreshed.find((r) => r.id === 'stale-1')).toBeUndefined();
    });

    it('gracefully handles non-array input to syncReservationsFromBackend without crashing', () => {
      expect(() => syncReservationsFromBackend(null)).not.toThrow();
      expect(() => syncReservationsFromBackend(undefined)).not.toThrow();
      expect(() => syncReservationsFromBackend({})).not.toThrow();
    });
  });
});
