const fs = require('fs');

let r = fs.readFileSync('Client/src/features/rooms/state/roomStore.js', 'utf8');
const startIdxR = r.indexOf('export function getRooms');
const endIdxR = r.indexOf('export function syncRoomsFromBackend');
if (startIdxR !== -1 && endIdxR !== -1) {
  const newR = r.substring(0, startIdxR) + 'export function getRooms() { return memoryCache; }\n\n' + r.substring(endIdxR);
  fs.writeFileSync('Client/src/features/rooms/state/roomStore.js', newR);
}

let res = fs.readFileSync('Client/src/features/reservations/state/reservationStore.js', 'utf8');
const startIdx = res.indexOf('export function getReservations');
let endIdx = res.indexOf('export function syncReservationsFromBackend');
if (endIdx === -1) endIdx = res.indexOf('export function resolveReservation');

if (startIdx !== -1 && endIdx !== -1) {
  const newR = res.substring(0, startIdx) + 'export function getReservations(status) { return status ? memoryCache.filter(r => r.status === status) : memoryCache; }\n\n' + res.substring(endIdx);
  fs.writeFileSync('Client/src/features/reservations/state/reservationStore.js', newR);
}

console.log("Restored fixes!");
