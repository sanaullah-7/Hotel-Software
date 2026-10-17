import { addAuditLog } from '../../audit/state/auditStore.js';
import { toFrontendGuest } from '../adapters/guestAdapter.js';

const STORAGE_KEY = 'hotel_guests_v1';
export const GUESTS_UPDATED_EVENT = 'guests_update';
// Kept as an event contract for existing reservation consumers.
export const RESERVATIONS_UPDATED_EVENT = 'reservations_update';

function readGuests() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    return [];
  }
  return [];
}

/**
 * Synchronous compatibility read of cached guests.
 * Populated authoritatively via syncGuestsFromBackend() or legacy compatibility cache.
 * @returns {Array<Object>}
 */
export const getGuests = () => readGuests();

/**
 * Synchronous lookup of a single guest by canonical MongoDB ID or frontend ID alias.
 * @param {string} id
 * @returns {Object|null}
 */
export function getGuestById(id) {
  if (id === undefined || id === null || id === '') return null;
  const idStr = String(id).trim();
  return (
    readGuests().find((guest) =>
      String(guest.id) === idStr ||
      String(guest._id) === idStr ||
      String(guest.guestId) === idStr
    ) || null
  );
}

/**
 * Finds a guest by matching exact full name and email address.
 * @param {string} name
 * @param {string} email
 * @param {Array<Object>} [guests]
 * @returns {Object|null}
 */
export function findGuestByExactIdentity(name, email, guests = readGuests()) {
  if (!name?.trim() || !email?.trim()) return null;
  const targetName = name.trim().toLowerCase();
  const targetEmail = email.trim().toLowerCase();

  const matches = guests.filter((guest) =>
    String(guest.name || '').trim().toLowerCase() === targetName &&
    String(guest.email || '').trim().toLowerCase() === targetEmail
  );
  return matches.length === 1 ? matches[0] : null;
}

/**
 * Resolves the guest record associated with a booking/reservation.
 * Matches by explicit guest ID first, then falls back to exact name + email match.
 * @param {Object} booking
 * @returns {Object|null}
 */
export function resolveGuestForBooking(booking) {
  if (!booking) return null;
  const guests = readGuests();

  const rawGuestId = booking.guestId ?? booking.primary_guest_id ?? booking.guest?._id ?? booking.guest?.id;
  if (rawGuestId !== undefined && rawGuestId !== null && String(rawGuestId).trim() !== '') {
    const targetId = String(rawGuestId).trim();
    return (
      guests.find((guest) =>
        String(guest.id) === targetId ||
        String(guest._id) === targetId ||
        String(guest.guestId) === targetId
      ) || null
    );
  }

  const name = booking.name || booking.guestName || (booking.guest?.name);
  const email = booking.email || booking.guestEmail || (booking.guest?.email);
  return findGuestByExactIdentity(name, email, guests);
}

/**
 * Updates localStorage compatibility cache and dispatches the update event.
 * @param {Array<Object>} guests
 */
export function saveGuests(guests) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(guests) ? guests : []));
  } catch {
    // Ignore storage quota or private-mode errors
  }
  try {
    window.dispatchEvent(new Event(GUESTS_UPDATED_EVENT));
  } catch {
    // Ignore environments without DOM window
  }
}

/**
 * Authoritatively synchronizes backend Guest records into the transitional compatibility store.
 * Adapts raw backend documents into frontend models and updates the localStorage compatibility cache.
 * @param {Array<Object>} backendGuests - Array of MongoDB guest documents or populated objects
 */
export function syncGuestsFromBackend(backendGuests) {
  if (!Array.isArray(backendGuests)) {
    return;
  }

  const adaptedList = [];
  const seenIds = new Set();

  for (const raw of backendGuests) {
    const adapted = toFrontendGuest(raw);
    if (adapted && (adapted.id || adapted._id)) {
      const idStr = String(adapted.id || adapted._id);
      if (!seenIds.has(idStr)) {
        seenIds.add(idStr);
        adaptedList.push(adapted);
      }
    }
  }

  saveGuests(adaptedList);
}

// ─── Transitional Local Mutations (Kept for downstream compatibility) ────────

export function addGuest(guest) {
  const nextGuest = {
    ...guest,
    id: guest.id || guest._id || `GST-${Date.now()}`,
    status: guest.status || (guest.vip_status ? 'VIP' : 'Active'),
    totalStays: Number(guest.totalStays) || 0,
  };
  saveGuests([nextGuest, ...readGuests()]);
  try {
    addAuditLog({
      module: 'Guests',
      action: 'Added Guest',
      recordId: nextGuest.id,
      description: `Guest ${nextGuest.name || nextGuest.first_name || 'Guest'} was added.`,
      importance: 'Important',
    });
  } catch {}
  return nextGuest;
}

export function updateGuest(id, updates) {
  const guests = readGuests();
  const idStr = String(id);
  const index = guests.findIndex((guest) =>
    String(guest.id) === idStr || String(guest._id) === idStr
  );
  if (index < 0) return null;
  const updatedGuest = { ...guests[index], ...updates, id: guests[index].id };
  guests[index] = updatedGuest;
  saveGuests(guests);
  try {
    addAuditLog({
      module: 'Guests',
      action: 'Updated Guest',
      recordId: id,
      description: `Guest ${updatedGuest.name || updatedGuest.first_name || 'Guest'} was updated.`,
      importance: 'Normal',
    });
  } catch {}
  return updatedGuest;
}

export function deleteGuest(id) {
  const guests = readGuests();
  const idStr = String(id);
  const updated = guests.filter((guest) =>
    String(guest.id) !== idStr && String(guest._id) !== idStr
  );
  if (updated.length !== guests.length) {
    saveGuests(updated);
    try {
      addAuditLog({
        module: 'Guests',
        action: 'Deleted Guest',
        recordId: id,
        importance: 'Critical',
      });
    } catch {}
  }
}
