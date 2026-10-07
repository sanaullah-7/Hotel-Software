const fs = require('fs');

function fixStore(file, getFuncName, syncFuncName) {
  let r = fs.readFileSync(file, 'utf8');
  const startIdx = r.indexOf(\export function \()\);
  let endIdx = r.indexOf(\export function \\);
  if (endIdx === -1) endIdx = r.indexOf(\export function save\);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const newR = r.substring(0, startIdx) + \export function \() { return memoryCache; }\n\n\ + r.substring(endIdx);
    fs.writeFileSync(file, newR);
    console.log("Fixed", file);
  }
}

fixStore('Client/src/features/reservations/state/reservationStore.js', 'getReservations', 'syncReservationsFromBackend');
