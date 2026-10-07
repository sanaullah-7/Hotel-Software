import { addAuditLog } from '../../audit/state/auditStore.js';
let memoryCache = [];
export const ROOM_UPDATED_EVENT = 'room_inventory_update';



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

export function getRooms() { return memoryCache; }

export function syncRoomsFromBackend(rooms) {
  if (Array.isArray(rooms)) {
    try {
      // localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
      window.dispatchEvent(new Event(ROOM_UPDATED_EVENT));
    } catch {
      // Ignore quota or private mode write errors
    }
  }
}

export function saveRooms(rooms) { memoryCache = Array.isArray(rooms) ? rooms : []; try { window.dispatchEvent(new Event(ROOM_UPDATED_EVENT)); } catch {} }

export function addRoom(room) {
  const rooms = getRooms();
  const nextRoom = {
    ...room,
    id: room.id || room._id || Date.now(),
    capacity: Number(room.capacity) || 0,
    rent: Number(room.rent) || 0,
  };
  saveRooms([nextRoom, ...rooms]);
  try { addAuditLog({ module: 'Rooms', action: 'Added Room', recordId: String(nextRoom.roomNo), description: `Room ${nextRoom.roomNo} added.`, importance: 'Important' }); } catch(e) {}
  return nextRoom;
}

export function updateRoom(id, updates) {
  const rooms = getRooms().map((room) => (
    (room.id === id || room._id === id || String(room.roomNo) === String(id))
      ? { ...room, ...updates, capacity: Number(updates.capacity) || 0, rent: Number(updates.rent) || 0 }
      : room
  ));
  saveRooms(rooms);
  try { addAuditLog({ module: 'Rooms', action: 'Updated Room', recordId: String(id), description: `Room ${id} updated.`, importance: 'Normal' }); } catch(e) {}
  return rooms.find((room) => room.id === id || room._id === id || room.roomNo === id);
}

export function deleteRoom(id) {
  saveRooms(getRooms().filter((room) => room.id !== id && room._id !== id && room.roomNo !== id));
  try { addAuditLog({ module: 'Rooms', action: 'Deleted Room', recordId: String(id), description: `Room ${id} deleted.`, importance: 'Critical' }); } catch(e) {}
}

export function getRoomById(id) {
  const rooms = getRooms();
  return rooms.find(r => r.id === id || r._id === id || String(r.roomNo) === String(id)) || null;
}

export function getRoomByRoomNo(roomNo) {
  const rooms = getRooms();
  return rooms.find(r => String(r.roomNo) === String(roomNo)) || null;
}

export function getRoomsByRoomType(type) {
  const rooms = getRooms();
  if (!type || type === 'All') return rooms;
  const target = normalizeRoomType(type);
  return rooms.filter((r) => normalizeRoomType(r.roomType) === target);
}
