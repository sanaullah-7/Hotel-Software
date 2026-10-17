import { beforeEach, describe, expect, it } from 'vitest';
import { getReservations } from '../features/reservations/state/reservationStore';

describe('Phase 3 reservation persistence', () => {
  beforeEach(() => localStorage.clear());

  it('reads valid persisted reservations and preserves them across store reinitialization', () => {
    const reservations = [{ id: 'B-9', guestId: 'G-9', roomId: 'R-9', status: 'Booked' }];
    localStorage.setItem('hotel_reservations', JSON.stringify(reservations));

    expect(getReservations([{ id: 'demo' }])).toEqual(reservations);
    expect(getReservations()).toEqual(reservations);
    expect(JSON.parse(localStorage.getItem('hotel_reservations'))).toEqual(reservations);
  });

  it('treats a persisted empty array as valid state', () => {
    localStorage.setItem('hotel_reservations', '[]');
    expect(getReservations([{ id: 'demo' }])).toEqual([]);
    expect(localStorage.getItem('hotel_reservations')).toBe('[]');
  });

  it('uses supplied first-time defaults only when the key is missing', () => {
    expect(getReservations([{ id: 'first-run' }])).toEqual([{ id: 'first-run' }]);
  });

  it('does not replace malformed persisted data with defaults', () => {
    localStorage.setItem('hotel_reservations', '{broken');
    expect(getReservations([{ id: 'demo' }])).toEqual([]);
    expect(localStorage.getItem('hotel_reservations')).toBe('{broken');
  });
});
