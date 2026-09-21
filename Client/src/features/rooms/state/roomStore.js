const STORAGE_KEY = 'hotel_room_inventory_v1';
export const ROOM_UPDATED_EVENT = 'room_inventory_update';

export const INITIAL_ROOMS = [
  { id: 1, roomNo: '101', roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop', roomType: 'Delux', acNonAc: 'AC', meal: 'All', capacity: 2, status: 'Booked', rent: 25, mobile: '1234567890' },
  { id: 2, roomNo: '102', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType: 'Super Delux', acNonAc: 'Non AC', meal: 'Lunch', capacity: 3, status: 'Open', rent: 50, mobile: '1234567890' },
  { id: 3, roomNo: '103', roomImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=100&h=100&fit=crop', roomType: 'Super Delux', acNonAc: 'AC', meal: 'All', capacity: 2, status: 'Booked', rent: 31, mobile: '1234567890' },
  { id: 4, roomNo: '104', roomImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=100&h=100&fit=crop', roomType: 'Delux', acNonAc: 'Non AC', meal: 'Dinner', capacity: 3, status: 'Inactive', rent: 31, mobile: '1234567890' },
  { id: 5, roomNo: '105', roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=100&h=100&fit=crop', roomType: 'Vila', acNonAc: 'AC', meal: 'Breakfast', capacity: 2, status: 'Open', rent: 50, mobile: '1234567890' },
  { id: 6, roomNo: '106', roomImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop', roomType: 'Double', acNonAc: 'AC', meal: 'None', capacity: 4, status: 'Booked', rent: 45, mobile: '1234567890' },
  { id: 7, roomNo: '201', roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=100&h=100&fit=crop', roomType: 'Single', acNonAc: 'Non AC', meal: 'None', capacity: 4, status: 'Booked', rent: 20, mobile: '1234567890' },
  { id: 8, roomNo: '202', roomImage: 'https://images.unsplash.com/photo-1560185016-5c51088c4b12?w=100&h=100&fit=crop', roomType: 'Delux', acNonAc: 'AC', meal: 'Dinner', capacity: 3, status: 'Inactive', rent: 25, mobile: '1234567890' },
  { id: 9, roomNo: '203', roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop', roomType: 'Delux', acNonAc: 'AC', meal: 'Breakfast', capacity: 2, status: 'Open', rent: 29, mobile: '1234567890' },
  { id: 10, roomNo: '204', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType: 'Super Delux', acNonAc: 'Non AC', meal: 'Lunch', capacity: 6, status: 'Open', rent: 50, mobile: '1234567890' },
];

export function getRooms() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
  } catch {
    return INITIAL_ROOMS;
  }
  return INITIAL_ROOMS;
}

export function saveRooms(rooms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  window.dispatchEvent(new Event(ROOM_UPDATED_EVENT));
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
  return nextRoom;
}

export function updateRoom(id, updates) {
  const rooms = getRooms().map((room) => (
    room.id === id
      ? { ...room, ...updates, capacity: Number(updates.capacity) || 0, rent: Number(updates.rent) || 0 }
      : room
  ));
  saveRooms(rooms);
  return rooms.find((room) => room.id === id);
}

export function deleteRoom(id) {
  saveRooms(getRooms().filter((room) => room.id !== id));
}
