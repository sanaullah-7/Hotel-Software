import { addAuditLog } from '../../audit/state/auditStore.js';
const STORAGE_KEY = 'hotel_room_inventory_v1';
export const ROOM_UPDATED_EVENT = 'room_inventory_update';

export const INITIAL_ROOMS = [
  { id: 1, roomNo: '101', roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop', roomType: 'Deluxe Room', acNonAc: 'AC', meal: 'All', capacity: 2, status: 'Booked', rent: 25, mobile: '1234567890' },
  { id: 2, roomNo: '102', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType: 'Deluxe Room', acNonAc: 'Non AC', meal: 'Lunch', capacity: 3, status: 'Open', rent: 50, mobile: '1234567890' },
  { id: 3, roomNo: '103', roomImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=100&h=100&fit=crop', roomType: 'Executive Room', acNonAc: 'AC', meal: 'All', capacity: 2, status: 'Booked', rent: 31, mobile: '1234567890' },
  { id: 4, roomNo: '104', roomImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=100&h=100&fit=crop', roomType: 'Standard Room', acNonAc: 'Non AC', meal: 'Dinner', capacity: 3, status: 'Inactive', rent: 31, mobile: '1234567890' },
  { id: 5, roomNo: '105', roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=100&h=100&fit=crop', roomType: 'Deluxe Room', acNonAc: 'AC', meal: 'Breakfast', capacity: 2, status: 'Open', rent: 50, mobile: '1234567890' },
  { id: 6, roomNo: '106', roomImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop', roomType: 'Double', acNonAc: 'AC', meal: 'None', capacity: 4, status: 'Booked', rent: 45, mobile: '1234567890' },
  { id: 7, roomNo: '201', roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=100&h=100&fit=crop', roomType: 'Single', acNonAc: 'Non AC', meal: 'None', capacity: 4, status: 'Booked', rent: 20, mobile: '1234567890' },
  { id: 8, roomNo: '202', roomImage: 'https://images.unsplash.com/photo-1560185016-5c51088c4b12?w=100&h=100&fit=crop', roomType: 'Executive Room', acNonAc: 'AC', meal: 'Dinner', capacity: 3, status: 'Inactive', rent: 25, mobile: '1234567890' },
  { id: 9, roomNo: '203', roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop', roomType: 'Single', acNonAc: 'AC', meal: 'Breakfast', capacity: 2, status: 'Open', rent: 29, mobile: '1234567890' },
  { id: 10, roomNo: '204', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType: 'Executive Room', acNonAc: 'Non AC', meal: 'Lunch', capacity: 6, status: 'Open', rent: 50, mobile: '1234567890' },
  { id: 11, roomNo: '108', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType: 'Deluxe Room', acNonAc: 'AC', meal: 'Breakfast', capacity: 2, status: 'Open', rent: 50, mobile: '1234567890' },
];

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
    return INITIAL_ROOMS;
  }
  return INITIAL_ROOMS;
}

export function getRoomsByRoomType(roomType) {
  const rooms = getRooms();
  if (!roomType || String(roomType).trim() === '') return rooms;
  const target = normalizeRoomType(roomType);
  return rooms.filter((room) => normalizeRoomType(room.roomType) === target);
}

export function getRoomById(id) {
  if (id === undefined || id === null || id === '') return null;
  return getRooms().find((room) => String(room.id) === String(id) || String(room._id) === String(id)) || null;
}

export function getRoomByRoomNo(roomNo) {
  if (roomNo === undefined || roomNo === null || String(roomNo).trim() === '') return null;
  const matches = getRooms().filter((room) => String(room.roomNo).trim() === String(roomNo).trim());
  return matches.length === 1 ? matches[0] : (matches[0] || null);
}

export function syncRoomsFromBackend(rooms) {
  if (Array.isArray(rooms)) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
      window.dispatchEvent(new Event(ROOM_UPDATED_EVENT));
    } catch {
      // Ignore quota or private mode write errors
    }
  }
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
