import { addAuditLog } from '../../audit/state/auditStore.js';
const STORAGE_KEY = 'hotel_room_inventory_v1';
export const ROOM_UPDATED_EVENT = 'room_inventory_update';

export const INITIAL_ROOMS = [];

export function getRooms() {
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

export function getRoomById(id) {
  if (id === undefined || id === null || id === '') return null;
  return getRooms().find((room) => String(room.id) === String(id)) || null;
}

export function getRoomByRoomNo(roomNo) {
  if (roomNo === undefined || roomNo === null || String(roomNo).trim() === '') return null;
  const matches = getRooms().filter((room) => String(room.roomNo).trim() === String(roomNo).trim());
  return matches.length === 1 ? matches[0] : null;
}

export function saveRooms(rooms) {
  assertValidStoredArray();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new Event(ROOM_UPDATED_EVENT));
}

function assertValidStoredArray() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return;
  try {
    if (Array.isArray(JSON.parse(stored))) return;
  } catch { /* Preserve malformed raw data by refusing this write. */ }
  throw new Error('Room storage is malformed and was preserved; reload or recover it before saving.');
}

export function addRoom(room) {
  const rooms = getRooms();
  const nextRoom = {
    ...room,
    id: Date.now(),
    capacity: Number(room.capacity) || 0,
    rent: Number(room.rent) || 0,
  };
  saveRooms([nextRoom, ...rooms]);
  try { addAuditLog({ module: 'Rooms', action: 'Added Room', recordId: String(nextRoom.roomNo), description: `Room ${nextRoom.roomNo} added.`, importance: 'Important' }); } catch(e) {}
  return nextRoom;
}

export function updateRoom(id, updates) {
  const rooms = getRooms().map((room) => (
    room.id === id
      ? { ...room, ...updates, capacity: Number(updates.capacity) || 0, rent: Number(updates.rent) || 0 }
      : room
  ));
  saveRooms(rooms);
  try { addAuditLog({ module: 'Rooms', action: 'Updated Room', recordId: String(id), description: `Room ${id} updated.`, importance: 'Normal' }); } catch(e) {}
  return rooms.find((room) => room.id === id || room.roomNo === id);
}

export function deleteRoom(id) {
  saveRooms(getRooms().filter((room) => room.id !== id && room.roomNo !== id));
  try { addAuditLog({ module: 'Rooms', action: 'Deleted Room', recordId: String(id), description: `Room ${id} deleted.`, importance: 'Critical' }); } catch(e) {}
}
