import { addAuditLog } from '../../audit/state/auditStore.js';

const STORAGE_KEY = 'hotel_guests_v1';
export const GUESTS_UPDATED_EVENT = 'guests_update';
// Kept as an event contract for existing reservation consumers.
export const RESERVATIONS_UPDATED_EVENT = 'reservations_update';

const INITIAL_GUESTS = [];

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

export const getGuests = () => readGuests();

export function getGuestById(id) {
  if (id === undefined || id === null || id === '') return null;
  return readGuests().find((guest) => String(guest.id) === String(id)) || null;
}

export function findGuestByExactIdentity(name, email, guests = readGuests()) {
  if (!name?.trim() || !email?.trim()) return null;
  const matches = guests.filter((guest) =>
    String(guest.name || '').trim().toLowerCase() === name.trim().toLowerCase() &&
    String(guest.email || '').trim().toLowerCase() === email.trim().toLowerCase()
  );
  return matches.length === 1 ? matches[0] : null;
}

export function resolveGuestForBooking(booking) {
  if (!booking) return null;
  const guests = readGuests();
  if (booking.guestId !== undefined && booking.guestId !== null && booking.guestId !== '') {
    return guests.find((guest) => String(guest.id) === String(booking.guestId)) || null;
  }
  return findGuestByExactIdentity(booking.name || booking.guestName, booking.email || booking.guestEmail, guests);
}

export function saveGuests(guests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  window.dispatchEvent(new Event(GUESTS_UPDATED_EVENT));
}

export function addGuest(guest) {
  const nextGuest = { ...guest, id: guest.id || `GST-${Date.now()}`, status: guest.status || 'Active', totalStays: Number(guest.totalStays) || 0 };
  saveGuests([nextGuest, ...readGuests()]);
  try { addAuditLog({ module: 'Guests', action: 'Added Guest', recordId: nextGuest.id, description: `Guest ${nextGuest.name} was added.`, importance: 'Important' }); } catch {}
  return nextGuest;
}

export function updateGuest(id, updates) {
  const guests = readGuests();
  const index = guests.findIndex((guest) => String(guest.id) === String(id));
  if (index < 0) return null;
  const updatedGuest = { ...guests[index], ...updates, id: guests[index].id };
  guests[index] = updatedGuest;
  saveGuests(guests);
  try { addAuditLog({ module: 'Guests', action: 'Updated Guest', recordId: id, description: `Guest ${updatedGuest.name} was updated.`, importance: 'Normal' }); } catch {}
  return updatedGuest;
}

export function deleteGuest(id) {
  const guests = readGuests();
  const updated = guests.filter((guest) => String(guest.id) !== String(id));
  if (updated.length !== guests.length) {
    saveGuests(updated);
    try { addAuditLog({ module: 'Guests', action: 'Deleted Guest', recordId: id, importance: 'Critical' }); } catch {}
  }
}
