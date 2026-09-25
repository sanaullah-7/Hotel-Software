import { addAuditLog } from '../../audit/state/auditStore.js';
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
  const guests = readGuests();
  const byEmail = new Map(guests.map((guest) => [guest.email, guest]));

  getReservations().forEach((reservation) => {
    const email = reservation.email || `${reservation.id}@guest.local`;
    const existing = byEmail.get(email);
    byEmail.set(email, {
      id: existing?.id || `GST-${reservation.id}`,
      name: reservation.name || existing?.name || 'Guest',
      email,
      phone: reservation.mobile || existing?.phone || '',
      city: existing?.city || '',
      totalStays: (existing?.totalStays || 0) + 1,
      status: existing?.status || 'Active',
      avatar: existing?.avatar || 'https://i.pravatar.cc/150?u=guest',
    });
  });

  return Array.from(byEmail.values());
}

export function saveGuests(guests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  window.dispatchEvent(new Event(GUESTS_UPDATED_EVENT));
}

export function addGuest(guest) {
  const nextGuest = { ...guest, id: guest.id || `GST-${Date.now()}`, status: guest.status || 'Active', totalStays: Number(guest.totalStays) || 0 };
  saveGuests([nextGuest, ...readGuests()]);
  try {
    addAuditLog({ module: 'Guests', action: 'Added Guest', recordId: nextGuest.id, description: `Guest ${nextGuest.name} was added.`, importance: 'Important' });
  } catch(e) {}
  return nextGuest;
}

export function updateGuest(id, updates) {
  const guests = readGuests().map((guest) => guest.id === id ? { ...guest, ...updates } : guest);
  saveGuests(guests);
  const updatedGuest = guests.find((guest) => guest.id === id);
  if (updatedGuest) {
    try {
      addAuditLog({ module: 'Guests', action: 'Updated Guest', recordId: id, description: `Guest ${updatedGuest.name} was updated.`, importance: 'Normal' });
    } catch(e) {}
  }
  return updatedGuest;
}

export function deleteGuest(id) {
  const guestToDelete = readGuests().find((guest) => guest.id === id);
  saveGuests(readGuests().filter((guest) => guest.id !== id));
  if (guestToDelete) {
    try {
      addAuditLog({ module: 'Guests', action: 'Deleted Guest', recordId: id, description: `Guest ${guestToDelete.name} was deleted.`, importance: 'Critical' });
    } catch(e) {}
  }
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

  // If still not found, check reservations directly
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
