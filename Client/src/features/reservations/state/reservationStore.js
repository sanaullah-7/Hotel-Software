import { addAuditLog } from '../../audit/state/auditStore.js';
const STORAGE_KEY = 'hotel_reservations';
const UPDATE_EVENT = 'reservations_update';

export function getReservations(defaultReservations = []) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultReservations;
  } catch {
    return defaultReservations;
  }
}

export function saveReservations(reservations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function resetReservations(defaultReservations) {
  saveReservations(defaultReservations);
}

export const RESERVATIONS_UPDATED_EVENT = UPDATE_EVENT;
