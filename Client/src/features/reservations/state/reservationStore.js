import { addAuditLog } from '../../audit/state/auditStore.js';
import { getGuests } from '../../guests/state/guestStore.js';
import { getRooms, toStandardRoomType } from '../../rooms/state/roomStore.js';
import { toFrontendReservation } from '../adapters/reservationAdapter.js';

let memoryCache = [];
const UPDATE_EVENT = 'reservations_update';

export function migrateBookingRelationships(bookings, guests = getGuests(), rooms = getRooms()) {
  let linkedGuests = 0;
  let linkedRooms = 0;
  let ambiguous = 0;
  let changed = false;
  const migrated = bookings.map((booking) => {
    let next = booking;
    if (booking.guestId) {
      if (!guests.some((guest) => String(guest.id) === String(booking.guestId))) ambiguous += 1;
    } else {
      const name = String(booking.name || booking.guestName || '').trim().toLowerCase();
      const email = String(booking.email || booking.guestEmail || '').trim().toLowerCase();
      const matches = name && email ? guests.filter((guest) =>
        String(guest.name || '').trim().toLowerCase() === name && String(guest.email || '').trim().toLowerCase() === email
      ) : [];
      if (matches.length === 1) {
        next = { ...next, guestId: matches[0].id };
        linkedGuests += 1;
      } else if (matches.length > 1) ambiguous += 1;
    }

    if (next.roomId !== undefined && next.roomId !== null && next.roomId !== '') {
      if (!rooms.some((room) => String(room.id) === String(next.roomId))) ambiguous += 1;
    } else {
      const roomNo = next.roomNo ?? next.roomNumber ?? next.room;
      if (roomNo !== undefined && roomNo !== null && String(roomNo).trim()) {
        const matches = rooms.filter((room) => String(room.roomNo).trim() === String(roomNo).trim());
        if (matches.length === 1) {
          next = { ...next, roomId: matches[0].id };
          linkedRooms += 1;
        } else if (matches.length > 1) ambiguous += 1;
      }
    }

    if (next.roomType) {
      const standardType = toStandardRoomType(next.roomType);
      if (next.roomType !== standardType) {
        next = { ...next, roomType: standardType };
      }
    }

    if (next !== booking) changed = true;
    return next;
  });
  return { bookings: migrated, linkedGuests, linkedRooms, ambiguous, changed };
}

export function getReservations(status) { return status ? memoryCache.filter(r => r.status === status) : memoryCache; }

export function syncReservationsFromBackend(reservations) {
  if (Array.isArray(reservations)) {
    try {
      const adapted = reservations.map((res) => toFrontendReservation(res));
      const { bookings } = migrateBookingRelationships(adapted);
      // localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
      window.dispatchEvent(new Event(UPDATE_EVENT));
    } catch {
      // Ignore quota or private mode write errors
    }
  }
}

export function saveReservations(reservations) {
  const { bookings } = migrateBookingRelationships(reservations);
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function resetReservations(defaultReservations) {
  saveReservations(defaultReservations);
}

export const RESERVATIONS_UPDATED_EVENT = UPDATE_EVENT;
