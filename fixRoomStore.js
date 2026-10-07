const fs = require('fs');
let r = fs.readFileSync('Client/src/features/rooms/state/roomStore.js', 'utf8');

const startIdx = r.indexOf('export function getRooms()');
const endIdx = r.indexOf('export function syncRoomsFromBackend(rooms)');

if (startIdx !== -1 && endIdx !== -1) {
  const newR = r.substring(0, startIdx) + 'export function getRooms() { return memoryCache; }\n\n' + r.substring(endIdx);
  fs.writeFileSync('Client/src/features/rooms/state/roomStore.js', newR);
  console.log("Fixed getRooms syntax error!");
}
