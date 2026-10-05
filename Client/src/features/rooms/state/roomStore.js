import { addAuditLog } from '../../audit/state/auditStore.js';
const STORAGE_KEY = 'hotel_room_inventory_v1';
export const ROOM_UPDATED_EVENT = 'room_inventory_update';

export const INITIAL_ROOMS = [];

export const STANDARD_ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Executive Room',
  'Suite',
  'Family Villa'
];

export function normalizeRoomType(type) {
  const t = String(type || '').trim().toLowerCase();
  if (t === 'delux' || t === 'deluxe' || t === 'deluxe room') return 'deluxe';
  if (t === 'super delux' || t === 'super deluxe' || t === 'executive' || t === 'executive room') return 'super deluxe';
  if (t === 'standard' || t === 'standard room' || t === 'single' || t === 'double') return 'standard';
  if (t === 'suite') return 'suite';
  if (t === 'vila' || t === 'villa' || t === 'family villa') return 'villa';
  return t;
}

export function toStandardRoomType(type) {
  const norm = normalizeRoomType(type);
  if (norm === 'deluxe') return 'Deluxe Room';
  if (norm === 'super deluxe') return 'Executive Room';
  if (norm === 'standard') return 'Standard Room';
  if (norm === 'suite') return 'Suite';
  if (norm === 'villa') return 'Family Villa';
  return type || 'Standard Room';
}

export function getAvailableRoomTypes() {
  return [...STANDARD_ROOM_TYPES];
}

export function getRooms() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      let parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Automatically align and ensure all room types are normalized to standard types
        let updated = false;
        if (!parsed.some((r) => String(r.roomNo) === '108')) {
          const room108 = INITIAL_ROOMS.find((r) => String(r.roomNo) === '108');
          if (room108) {
            parsed = [...parsed, room108];
            updated = true;
          }
        }
        parsed = parsed.map((r) => {
          const standardType = toStandardRoomType(r.roomType);
          if (r.roomType !== standardType) {
            updated = true;
            return { ...r, roomType: standardType };
          }
          return r;
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      return [];
    }
  } catch {
    return [];
  }
  return [];
}

export function getRoomsByRoomType(roomType) {
  const rooms = getRooms();
  if (!roomType || String(roomType).trim() === '') return rooms;
  const target = normalizeRoomType(roomType);
  return rooms.filter((room) => normalizeRoomType(room.roomType) === target);
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
