const fs = require('fs');

let r = fs.readFileSync('Client/src/features/reservations/state/reservationStore.js', 'utf8');
const startIdx = r.indexOf('export function getReservations()');
let endIdx = r.indexOf('export function syncReservationsFromBackend');

if (startIdx !== -1 && endIdx !== -1) {
  const newR = r.substring(0, startIdx) + 'export function getReservations() { return memoryCache; }\n\n' + r.substring(endIdx);
  fs.writeFileSync('Client/src/features/reservations/state/reservationStore.js', newR);
  console.log("Fixed reservationStore!");
}
