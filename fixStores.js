const fs = require('fs');
const path = require('path');

const stores = [
  'Client/src/features/guests/state/guestStore.js',
  'Client/src/features/rooms/state/roomStore.js',
  'Client/src/features/reservations/state/reservationStore.js'
];

stores.forEach(store => {
  const fullPath = path.resolve(__dirname, store);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Drop INITIAL_ constants
    content = content.replace(/export const INITIAL_[a-zA-Z0-9_]+\s*=\s*\[[\s\S]*?\];/g, '');

    // 2. Drop STORAGE_KEY constants
    content = content.replace(/const STORAGE_KEY\s*=\s*'.*?';/g, 'let memoryCache = [];');

    // 3. Replace read functions manually
    content = content.replace(/function readGuests.*?catch.*?return \[\];\s*\}\s*return \[\];\s*\}/gs, 'function readGuests() { return memoryCache; }');
    content = content.replace(/function readRooms.*?catch.*?return INITIAL_ROOMS;\s*\}\s*return INITIAL_ROOMS;\s*\}/gs, 'function readRooms() { return memoryCache; }');
    content = content.replace(/function readReservations.*?catch.*?return \[\];\s*\}\s*return \[\];\s*\}/gs, 'function readReservations() { return memoryCache; }');

    // 4. Replace save functions manually
    content = content.replace(/function saveGuests\(guests\)\s*\{\s*try\s*\{\s*localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(Array\.isArray\(guests\) \? guests : \[\]\)\);\s*\}\s*catch\s*\{\s*\}\s*try\s*\{\s*window\.dispatchEvent\(new Event\(GUESTS_UPDATED_EVENT\)\);\s*\}\s*catch\s*\{\s*\}\s*\}/gs, 
      'function saveGuests(guests) { memoryCache = Array.isArray(guests) ? guests : []; try { window.dispatchEvent(new Event(GUESTS_UPDATED_EVENT)); } catch {} }');

    content = content.replace(/function saveRooms\(rooms\)\s*\{\s*assertValidStoredArray\(\);\s*try\s*\{\s*localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(rooms\)\);\s*window\.dispatchEvent\(new Event\(ROOM_UPDATED_EVENT\)\);\s*\}\s*catch\s*\{\s*\}\s*\}/gs,
      'function saveRooms(rooms) { memoryCache = Array.isArray(rooms) ? rooms : []; try { window.dispatchEvent(new Event(ROOM_UPDATED_EVENT)); } catch {} }');

    content = content.replace(/function saveRooms\(rooms\)\s*\{\s*assertValidStoredArray\(\);\s*localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(rooms\)\);\s*window\.dispatchEvent\(new Event\(ROOM_UPDATED_EVENT\)\);\s*\}/gs,
      'function saveRooms(rooms) { memoryCache = Array.isArray(rooms) ? rooms : []; try { window.dispatchEvent(new Event(ROOM_UPDATED_EVENT)); } catch {} }');
      
    content = content.replace(/function saveReservations\(data\)\s*\{\s*try\s*\{\s*localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(data\)\);\s*\}\s*catch\s*\{\s*\}\s*try\s*\{\s*window\.dispatchEvent\(new Event\(RESERVATION_UPDATED_EVENT\)\);\s*\}\s*catch\s*\{\s*\}\s*\}/gs,
      'function saveReservations(data) { memoryCache = Array.isArray(data) ? data : []; try { window.dispatchEvent(new Event(RESERVATION_UPDATED_EVENT)); } catch {} }');

    content = content.replace(/localStorage\.setItem/g, '// localStorage.setItem');
    content = content.replace(/localStorage\.getItem/g, '// localStorage.getItem');

    fs.writeFileSync(fullPath, content);
    console.log('Fixed', store);
  } else {
    console.log('Not found', store);
  }
});
