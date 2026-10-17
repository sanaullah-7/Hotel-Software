import { beforeEach, describe, expect, it } from 'vitest';
import { getGuests, resolveGuestForBooking, saveGuests } from '../features/guests/state/guestStore';
import { getReservations, migrateBookingRelationships, saveReservations } from '../features/reservations/state/reservationStore';
import { getBookingDues, getInvoices, saveInvoices } from '../features/payment-billing/pages/paymentBillingStore';
import { getRooms, saveRooms } from '../features/rooms/state/roomStore';
import { getRooms as getHousekeepingRooms } from '../features/housekeeping/pages/hkStore';

describe('Phase 1 stable data relationships', () => {
  beforeEach(() => localStorage.clear());

  it('migrates only unique exact guest identity and room number relationships once', () => {
    saveGuests([{ id: 'G-1', name: 'Alex Guest', email: 'alex@example.com' }]);
    saveRooms([{ id: 'R-1', roomNo: '101', status: 'Open' }]);
    const legacy = [{ id: 'B-1', name: 'Alex Guest', email: 'alex@example.com', room: '101' }];
    const first = migrateBookingRelationships(legacy);
    expect(first.bookings[0]).toMatchObject({ guestId: 'G-1', roomId: 'R-1' });
    expect(first.changed).toBe(true);
    saveReservations(legacy);
    const persisted = localStorage.getItem('hotel_reservations');
    const nextRead = getReservations();
    expect(nextRead).toMatchObject([{ guestId: 'G-1', roomId: 'R-1' }]);
    expect(localStorage.getItem('hotel_reservations')).toBe(persisted);
  });

  it('preserves ambiguous and unmatched legacy booking relationships without fake entities', () => {
    saveGuests([
      { id: 'G-1', name: 'Alex Guest', email: 'alex@example.com' },
      { id: 'G-2', name: 'Alex Guest', email: 'alex@example.com' },
    ]);
    saveRooms([
      { id: 'R-1', roomNo: '101' },
      { id: 'R-2', roomNo: '101' },
    ]);
    const legacy = [{ id: 'B-1', name: 'Alex Guest', email: 'alex@example.com', room: '101' }];
    const result = migrateBookingRelationships(legacy);
    expect(result.bookings).toEqual(legacy);
    expect(result.ambiguous).toBe(2);
    expect(localStorage.getItem('hotel_guests_v1')).toContain('G-1');
    expect(getGuests()).toHaveLength(2);
    expect(resolveGuestForBooking(legacy[0])).toBeNull();
  });

  it('resolves an explicit guest ID and does not fall through from an invalid ID', () => {
    saveGuests([{ id: 'G-1', name: 'Alex Guest', email: 'alex@example.com' }]);
    expect(resolveGuestForBooking({ guestId: 'G-1', name: 'Other', email: 'other@example.com' }).id).toBe('G-1');
    expect(resolveGuestForBooking({ guestId: 'missing', name: 'Alex Guest', email: 'alex@example.com' })).toBeNull();
  });

  it('does not associate invoices to bookings by name or email or invent dues', () => {
    saveInvoices([{ id: 'I-1', bookingId: 'legacy-ref', guestName: 'Alex Guest', guestEmail: 'alex@example.com', balanceDue: 12 }]);
    expect(getBookingDues({ id: 'B-1', name: 'Alex Guest', email: 'alex@example.com', remainingPrice: 8 })).toBeNull();
  });

  it('migrates an invoice only through one exact existing booking reference', () => {
    saveReservations([{ id: 'B-1', bookingId: 'legacy-ref' }]);
    saveInvoices([{ id: 'I-1', bookingId: 'legacy-ref', balanceDue: 12 }]);
    expect(getInvoices()[0].bookingId).toBe('B-1');
    expect(getBookingDues({ id: 'B-1' })).toBeNull();
  });

  it('preserves existing housekeeping records and links exact unique canonical rooms', () => {
    saveRooms([{ id: 'R-101', roomNo: '101' }]);
    localStorage.setItem('hk_rooms', JSON.stringify([{ id: '101', status: 'Dirty' }, { id: '999', status: 'Clean / Ready' }]));
    const rooms = getHousekeepingRooms();
    expect(rooms).toEqual([{ id: '101', status: 'Dirty', roomId: 'R-101' }, { id: '999', status: 'Clean / Ready' }]);
    expect(localStorage.getItem('hotel_rooms')).toBeNull();
  });

  it('resolves a booking dues invoice by canonical booking id only', () => {
    saveInvoices([{ id: 'I-1', bookingId: 'B-1', guestName: 'Someone Else', guestEmail: 'different@example.com', balanceDue: 7 }]);
    expect(getBookingDues({ id: 'B-1', name: 'Alex Guest', email: 'alex@example.com' })).toBeNull();
    expect(getBookingDues({ id: 'B-2', name: 'Someone Else', email: 'different@example.com', dues: 3 })).toBeNull();
  });
});
