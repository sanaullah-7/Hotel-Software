const fs = require('fs');
let r = fs.readFileSync('Client/src/features/reservations/state/reservationStore.js', 'utf8');

// The faulty getReservations function looks like:
// export function getReservations(status) {
//   try {
//     const stored = // localStorage.getItem(STORAGE_KEY);
// ...
// return [];

const startIdx = r.indexOf('export function getReservations');
let endIdx = r.indexOf('export function resolveReservation');

if (startIdx !== -1 && endIdx !== -1) {
  const newR = r.substring(0, startIdx) + 'export function getReservations(status) { return status ? memoryCache.filter(r => r.status === status) : memoryCache; }\n\n' + r.substring(endIdx);
  fs.writeFileSync('Client/src/features/reservations/state/reservationStore.js', newR);
  console.log("Fixed reservationStore!");
}
