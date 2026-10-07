const fs = require('fs');

const helpers = 
export function getRoomById(id) {
  const rooms = getRooms();
  return rooms.find(r => r.id === id || r._id === id || String(r.roomNo) === String(id)) || null;
}

export function getRoomByRoomNo(roomNo) {
  const rooms = getRooms();
  return rooms.find(r => String(r.roomNo) === String(roomNo)) || null;
}
;

fs.appendFileSync('Client/src/features/rooms/state/roomStore.js', helpers);
