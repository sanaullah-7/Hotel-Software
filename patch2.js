const fs = require('fs');

// rooms
let r = fs.readFileSync('Client/src/features/rooms/state/roomStore.js', 'utf8');
r = r.replace(/export function getRooms\(\) \{[\s\S]*?return INITIAL_ROOMS;\n\}/, 'export function getRooms() { return memoryCache; }');
r = r.replace(/function saveRooms\(rooms\) \{[\s\S]*?\n\}/, 'function saveRooms(rooms) { memoryCache = Array.isArray(rooms) ? rooms : []; try { window.dispatchEvent(new Event(ROOM_UPDATED_EVENT)); } catch {} }');
r = r.replace(/export const INITIAL_ROOMS/g, '// ');
r = r.replace(/INITIAL_ROOMS/g, '[]');
fs.writeFileSync('Client/src/features/rooms/state/roomStore.js', r);

// guests
let g = fs.readFileSync('Client/src/features/guests/state/guestStore.js', 'utf8');
g = g.replace(/function readGuests\(\) \{[\s\S]*?return \[\];\n\}/, 'function readGuests() { return memoryCache; }');
fs.writeFileSync('Client/src/features/guests/state/guestStore.js', g);

// reservations
let res = fs.readFileSync('Client/src/features/reservations/state/reservationStore.js', 'utf8');
res = res.replace(/function readReservations\(\) \{[\s\S]*?return \[\];\n\}/, 'function readReservations() { return memoryCache; }');
fs.writeFileSync('Client/src/features/reservations/state/reservationStore.js', res);

console.log("Re-patched stores");
