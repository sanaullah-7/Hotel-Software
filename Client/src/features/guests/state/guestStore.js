import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../reservations/state/reservationStore';

const STORAGE_KEY = 'hotel_guests_v1';
export const GUESTS_UPDATED_EVENT = 'guests_update';

const INITIAL_GUESTS = [
  { id: 'GST64188', name: 'John Smith', email: 'john.smith@example.com', phone: '+1234567890', city: 'New York', totalStays: 15, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'GST6419F', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', phone: '+1234567893', city: 'London', totalStays: 28, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 'GST64198', name: 'Carlos Rodriguez', email: 'carlos.rodriguez@example.com', phone: '+1234567895', city: 'Madrid', totalStays: 8, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 'GST64197', name: 'Emma Davis', email: 'emma.davis@example.com', phone: '+1234567897', city: 'Toronto', totalStays: 5, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=4' },
];

function readGuests() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GUESTS));
  } catch {
    return INITIAL_GUESTS;
  }
  return INITIAL_GUESTS;
}

export function getGuests() {
  const savedGuests = readGuests();
  const guestMap = new Map();

  // 1. Seed with all saved guests (they take absolute priority)
  savedGuests.forEach((g) => {
    guestMap.set(String(g.id).toLowerCase(), { ...g });
  });

  // Helper maps for matching reservations to saved guests
  const byId = new Map(savedGuests.map((g) => [String(g.id).toLowerCase(), g]));
  const byEmail = new Map(savedGuests.filter((g) => g.email).map((g) => [g.email.toLowerCase(), g]));

  // 2. Merge reservations
  getReservations().forEach((reservation) => {
    const resGuestId = reservation.guestId
      ? String(reservation.guestId).toLowerCase()
      : `gst-${reservation.id}`.toLowerCase();
    const email = (reservation.email || `${reservation.id}@guest.local`).toLowerCase();

    // Check if matching saved guest exists by ID or email
    const existing = byId.get(resGuestId) || byEmail.get(email) || guestMap.get(resGuestId);

    if (existing) {
      const key = String(existing.id).toLowerCase();
      const current = guestMap.get(key) || existing;
      // Keep saved guest's edited fields! Do NOT let reservation defaults overwrite them.
      guestMap.set(key, {
        id: current.id,
        name: current.name || reservation.name || 'Guest',
        email: current.email || reservation.email || `${reservation.id}@guest.local`,
        phone: current.phone || reservation.mobile || '',
        city: current.city || '',
        totalStays: current.totalStays !== undefined ? current.totalStays : 1,
        status: current.status || 'Active',
        avatar: current.avatar || reservation.avatar || 'https://i.pravatar.cc/150?u=guest',
      });
    } else {
      const newGuestId = reservation.guestId || `GST-${reservation.id}`;
      const key = String(newGuestId).toLowerCase();
      if (!guestMap.has(key)) {
        guestMap.set(key, {
          id: newGuestId,
          name: reservation.name || 'Guest',
          email: reservation.email || `${reservation.id}@guest.local`,
          phone: reservation.mobile || '',
          city: '',
          totalStays: 1,
          status: 'Active',
          avatar: reservation.avatar || 'https://i.pravatar.cc/150?u=guest',
        });
      }
    }
  });

  return Array.from(guestMap.values());
}

export function saveGuests(guests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  window.dispatchEvent(new Event(GUESTS_UPDATED_EVENT));
}

export function addGuest(guest) {
  const nextGuest = { ...guest, id: guest.id || `GST-${Date.now()}`, status: guest.status || 'Active', totalStays: Number(guest.totalStays) || 0 };
  saveGuests([nextGuest, ...readGuests()]);
  return nextGuest;
}

export function updateGuest(id, updates) {
  const normalizedId = String(id).toLowerCase();
  const currentGuests = readGuests();
  const index = currentGuests.findIndex((guest) =>
    String(guest.id).toLowerCase() === normalizedId ||
    String(guest.id).toLowerCase() === `gst-${normalizedId}` ||
    (normalizedId.startsWith('gst-') && String(guest.id).toLowerCase() === normalizedId.replace('gst-', ''))
  );

  let updatedList;
  let updatedGuest;
  if (index >= 0) {
    updatedGuest = { ...currentGuests[index], ...updates };
    updatedList = [...currentGuests];
    updatedList[index] = updatedGuest;
  } else {
    // If not previously in saved guests list, fetch full guest object and merge updates
    const existingFull = getGuestById(id) || {};
    updatedGuest = { ...existingFull, ...updates, id };
    updatedList = [updatedGuest, ...currentGuests];
  }

  saveGuests(updatedList);
  return updatedGuest;
}

export function deleteGuest(id) {
  const normalizedId = String(id).toLowerCase();
  saveGuests(readGuests().filter((guest) => String(guest.id).toLowerCase() !== normalizedId));
}

export function getGuestById(id) {
  if (!id) return null;
  const allGuests = getGuests();
  const normalizedId = String(id).toLowerCase();

  let guest = allGuests.find((g) =>
    String(g.id).toLowerCase() === normalizedId ||
    String(g.id).toLowerCase() === `gst-${normalizedId}` ||
    (normalizedId.startsWith('gst-') && String(g.id).toLowerCase() === normalizedId.replace('gst-', ''))
  );

  if (!guest) {
    const reservations = getReservations();
    const res = reservations.find((r) =>
      String(r.id) === String(id) ||
      `GST-${r.id}`.toLowerCase() === normalizedId ||
      (r.name && r.name.toLowerCase() === normalizedId)
    );
    if (res) {
      guest = {
        id: `GST-${res.id}`,
        name: res.name || 'Guest',
        email: res.email || `${res.id}@guest.local`,
        phone: res.mobile || '',
        city: 'New York',
        totalStays: 1,
        status: 'Active',
        avatar: res.avatar || 'https://i.pravatar.cc/150?u=guest',
      };
    }
  }

  return guest || null;
}

export { RESERVATIONS_UPDATED_EVENT };
