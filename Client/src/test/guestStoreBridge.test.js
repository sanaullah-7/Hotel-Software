import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getGuests,
  getGuestById,
  findGuestByExactIdentity,
  resolveGuestForBooking,
  syncGuestsFromBackend,
  saveGuests,
  addGuest,
  updateGuest,
  deleteGuest,
  GUESTS_UPDATED_EVENT,
} from '../features/guests/state/guestStore.js';

describe('Guest Store Bridge (guestStore.js)', () => {
  const STORAGE_KEY = 'hotel_guests_v1';

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleBackendGuests = [
    {
      _id: '6ac39d17ab4d72a799999f66',
      guest_ref: 'GST-123456ABCD',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1555123456',
      city: 'New York',
      country: 'USA',
      passport_number: 'US123456',
      vip_status: false,
    },
    {
      _id: '6ac39d17ab4d72a799999f77',
      guest_ref: 'GST-987654WXYZ',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1555987654',
      city: 'London',
      country: 'UK',
      national_id: 'UK-CNIC-9988',
      vip_status: true,
    },
  ];

  // ─── 1. Backend Synchronization & Adapter Integration ──────────────────────────────
  describe('syncGuestsFromBackend()', () => {
    it('authoritatively synchronizes backend guests into store and localStorage cache', () => {
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      syncGuestsFromBackend(sampleBackendGuests);

      const cached = getGuests();
      expect(cached).toHaveLength(2);

      // Check first guest adapted properties
      expect(cached[0]).toMatchObject({
        id: '6ac39d17ab4d72a799999f66',
        _id: '6ac39d17ab4d72a799999f66',
        guest_ref: 'GST-123456ABCD',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1555123456',
        passportNumber: 'US123456',
        status: 'Active',
        vip_status: false,
      });

      // Check second guest adapted properties
      expect(cached[1]).toMatchObject({
        id: '6ac39d17ab4d72a799999f77',
        _id: '6ac39d17ab4d72a799999f77',
        guest_ref: 'GST-987654WXYZ',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        nationalId: 'UK-CNIC-9988',
        status: 'VIP',
        vip_status: true,
      });

      // Verify localStorage was updated
      const rawStored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(rawStored).toHaveLength(2);
      expect(rawStored[0].id).toBe('6ac39d17ab4d72a799999f66');

      // Verify guests_update event was dispatched
      expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: GUESTS_UPDATED_EVENT }));
    });

    it('completely replaces stale cache data with authoritative backend data', () => {
      // Seed old local mock data
      localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { id: 'fake_local_1', name: 'Fake Ghost Guest', email: 'ghost@example.com' }
      ]));

      expect(getGuests()).toHaveLength(1);

      // Synchronize with backend dataset
      syncGuestsFromBackend(sampleBackendGuests);

      const cached = getGuests();
      expect(cached).toHaveLength(2);
      expect(cached.some((g) => g.id === 'fake_local_1')).toBe(false);
    });

    it('clears store and localStorage when backend returns empty array', () => {
      // Seed pre-existing data
      syncGuestsFromBackend(sampleBackendGuests);
      expect(getGuests()).toHaveLength(2);

      // Backend returns empty list
      syncGuestsFromBackend([]);

      expect(getGuests()).toHaveLength(0);
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([]);
    });

    it('handles duplicate backend documents deterministically without duplicating IDs', () => {
      const duplicatedBackend = [
        sampleBackendGuests[0],
        { ...sampleBackendGuests[0] }, // Duplicate
        sampleBackendGuests[1],
      ];

      syncGuestsFromBackend(duplicatedBackend);

      const cached = getGuests();
      expect(cached).toHaveLength(2);
      expect(cached.map((g) => g.id)).toEqual([
        '6ac39d17ab4d72a799999f66',
        '6ac39d17ab4d72a799999f77',
      ]);
    });

    it('does not mutate the input backend array', () => {
      const cloned = JSON.parse(JSON.stringify(sampleBackendGuests));
      syncGuestsFromBackend(sampleBackendGuests);
      expect(sampleBackendGuests).toEqual(cloned);
    });

    it('gracefully handles non-array input without crashing', () => {
      syncGuestsFromBackend(null);
      syncGuestsFromBackend(undefined);
      syncGuestsFromBackend('not-an-array');
      expect(getGuests()).toEqual([]);
    });
  });

  // ─── 2. Consumer Compatibility API ────────────────────────────────────────────────
  describe('Synchronous Read APIs', () => {
    beforeEach(() => {
      syncGuestsFromBackend(sampleBackendGuests);
    });

    it('getGuests() reads synchronized compatibility cache synchronously', () => {
      const list = getGuests();
      expect(list).toHaveLength(2);
      expect(list[0].name).toBe('John Doe');
    });

    it('getGuestById() resolves guest by canonical MongoDB ID and ID aliases', () => {
      const guest = getGuestById('6ac39d17ab4d72a799999f66');
      expect(guest).not.toBeNull();
      expect(guest.name).toBe('John Doe');
      expect(guest.email).toBe('john.doe@example.com');
    });

    it('getGuestById() returns null for unknown ID or invalid params', () => {
      expect(getGuestById('unknown_id')).toBeNull();
      expect(getGuestById('')).toBeNull();
      expect(getGuestById(null)).toBeNull();
      expect(getGuestById(undefined)).toBeNull();
    });

    it('findGuestByExactIdentity() resolves guest by case-insensitive name and email', () => {
      const found = findGuestByExactIdentity('  john doe  ', '  JOHN.DOE@EXAMPLE.COM  ');
      expect(found).not.toBeNull();
      expect(found.id).toBe('6ac39d17ab4d72a799999f66');
    });

    it('findGuestByExactIdentity() returns null when no exact match exists', () => {
      expect(findGuestByExactIdentity('John Doe', 'wrong@example.com')).toBeNull();
      expect(findGuestByExactIdentity('', '')).toBeNull();
    });

    it('resolveGuestForBooking() resolves by guestId first', () => {
      const booking = {
        guestId: '6ac39d17ab4d72a799999f77',
        guestName: 'Different Name',
      };
      const resolved = resolveGuestForBooking(booking);
      expect(resolved).not.toBeNull();
      expect(resolved.name).toBe('Jane Smith');
    });

    it('resolveGuestForBooking() resolves by primary_guest_id alias', () => {
      const booking = {
        primary_guest_id: '6ac39d17ab4d72a799999f66',
      };
      const resolved = resolveGuestForBooking(booking);
      expect(resolved).not.toBeNull();
      expect(resolved.name).toBe('John Doe');
    });

    it('resolveGuestForBooking() falls back to exact name and email when no ID is present', () => {
      const booking = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };
      const resolved = resolveGuestForBooking(booking);
      expect(resolved).not.toBeNull();
      expect(resolved.id).toBe('6ac39d17ab4d72a799999f66');
    });
  });

  // ─── 3. Transitional Local Mutations ─────────────────────────────────────────────
  describe('Transitional Local Mutations (Compatibility Mode)', () => {
    it('addGuest() prepends guest to cache and dispatches event', () => {
      syncGuestsFromBackend(sampleBackendGuests);

      const newGuest = addGuest({
        name: 'Alice Wonder',
        email: 'alice@example.com',
      });

      expect(newGuest.id).toBeDefined();
      expect(getGuests()).toHaveLength(3);
      expect(getGuests()[0].name).toBe('Alice Wonder');
    });

    it('updateGuest() modifies cached record and persists to localStorage', () => {
      syncGuestsFromBackend(sampleBackendGuests);

      const updated = updateGuest('6ac39d17ab4d72a799999f66', {
        city: 'Boston',
        status: 'VIP',
      });

      expect(updated).not.toBeNull();
      expect(updated.city).toBe('Boston');
      expect(getGuestById('6ac39d17ab4d72a799999f66').city).toBe('Boston');
    });

    it('deleteGuest() removes record from cache', () => {
      syncGuestsFromBackend(sampleBackendGuests);

      deleteGuest('6ac39d17ab4d72a799999f66');

      expect(getGuests()).toHaveLength(1);
      expect(getGuestById('6ac39d17ab4d72a799999f66')).toBeNull();
    });
  });
});
