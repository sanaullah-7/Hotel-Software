const fs = require('fs');
const path = require('path');

function replaceExact(file, searchStr, replaceStr) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`Failed to find target in ${file}`);
  }
}

// 1. guestStore.js
replaceExact(
  'src/features/guests/state/guestStore.js',
  `export function addGuest(guest) {
  const current = getGuests();
  const nextId = 'GST' + Math.random().toString(16).slice(2, 7).toUpperCase();
  const newGuest = { ...guest, id: nextId };
  const updated = [newGuest, ...current];
  saveGuests(updated);
  return newGuest;
}`,
  `export function addGuest(guest) {
  const current = getGuests();
  const nextId = 'GST' + Math.random().toString(16).slice(2, 7).toUpperCase();
  const newGuest = { ...guest, id: nextId };
  const updated = [newGuest, ...current];
  saveGuests(updated);
  
  try {
    addAuditLog({ module: 'Guests', action: 'Added Guest', recordId: nextId, description: \`Guest \${newGuest.name} was added.\`, importance: 'Important' });
  } catch(e) {}
  
  return newGuest;
}`
);

replaceExact(
  'src/features/guests/state/guestStore.js',
  `export function updateGuest(id, updates) {
  const current = getGuests();
  const updated = current.map(guest => {
    if (guest.id === id) {
      return { ...guest, ...updates };
    }
    return guest;
  });
  saveGuests(updated);
  return updated;
}`,
  `export function updateGuest(id, updates) {
  const current = getGuests();
  const guest = current.find(g => g.id === id);
  const updated = current.map(g => {
    if (g.id === id) {
      return { ...g, ...updates };
    }
    return g;
  });
  saveGuests(updated);
  if (guest) {
    try {
      addAuditLog({ module: 'Guests', action: 'Updated Guest', recordId: id, description: \`Guest \${guest.name} was updated.\`, importance: 'Normal' });
    } catch(e) {}
  }
  return updated;
}`
);

replaceExact(
  'src/features/guests/state/guestStore.js',
  `export function deleteGuest(id) {
  const current = getGuests();
  const updated = current.filter(guest => guest.id !== id);
  saveGuests(updated);
}`,
  `export function deleteGuest(id) {
  const current = getGuests();
  const guest = current.find(g => g.id === id);
  const updated = current.filter(g => g.id !== id);
  saveGuests(updated);
  if (guest) {
    try {
      addAuditLog({ module: 'Guests', action: 'Deleted Guest', recordId: id, description: \`Guest \${guest.name} was deleted.\`, importance: 'Critical' });
    } catch(e) {}
  }
}`
);

// 2. roomStore.js
replaceExact(
  'src/features/rooms/state/roomStore.js',
  `export function addRoom(room) {
  const rooms = getRooms();
  const nextRoom = {
    ...room,
    id: Date.now(),
    capacity: Number(room.capacity) || 0,
    rent: Number(room.rent) || 0,
  };
  saveRooms([nextRoom, ...rooms]);
  return nextRoom;
}`,
  `export function addRoom(room) {
  const rooms = getRooms();
  const nextRoom = {
    ...room,
    id: Date.now(),
    capacity: Number(room.capacity) || 0,
    rent: Number(room.rent) || 0,
  };
  saveRooms([nextRoom, ...rooms]);
  try {
    addAuditLog({ module: 'Rooms', action: 'Added Room', recordId: String(nextRoom.roomNo), description: \`Room \${nextRoom.roomNo} was added.\`, importance: 'Important' });
  } catch(e) {}
  return nextRoom;
}`
);

replaceExact(
  'src/features/rooms/state/roomStore.js',
  `export function updateRoom(id, updates) {
  const rooms = getRooms().map((room) => (
    room.id === id
      ? { ...room, ...updates, capacity: Number(updates.capacity) || 0, rent: Number(updates.rent) || 0 }
      : room
  ));
  saveRooms(rooms);
  return rooms.find((room) => room.id === id);
}`,
  `export function updateRoom(id, updates) {
  const currentRooms = getRooms();
  const targetRoom = currentRooms.find(r => r.id === id || r.roomNo === id);
  const rooms = currentRooms.map((room) => (
    room.id === id || room.roomNo === id
      ? { ...room, ...updates, capacity: Number(updates.capacity) || 0, rent: Number(updates.rent) || 0 }
      : room
  ));
  saveRooms(rooms);
  if (targetRoom) {
    try {
      addAuditLog({ module: 'Rooms', action: 'Updated Room', recordId: String(targetRoom.roomNo), description: \`Room \${targetRoom.roomNo} was updated.\`, importance: 'Normal' });
    } catch(e) {}
  }
  return rooms.find((room) => room.id === id || room.roomNo === id);
}`
);

replaceExact(
  'src/features/rooms/state/roomStore.js',
  `export function deleteRoom(id) {
  saveRooms(getRooms().filter((room) => room.id !== id));
}`,
  `export function deleteRoom(id) {
  const currentRooms = getRooms();
  const targetRoom = currentRooms.find(r => r.id === id || r.roomNo === id);
  saveRooms(currentRooms.filter((room) => room.id !== id && room.roomNo !== id));
  if (targetRoom) {
    try {
      addAuditLog({ module: 'Rooms', action: 'Deleted Room', recordId: String(targetRoom.roomNo), description: \`Room \${targetRoom.roomNo} was deleted.\`, importance: 'Critical' });
    } catch(e) {}
  }
}`
);
