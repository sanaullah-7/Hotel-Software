const fs = require('fs');
const path = require('path');

const addImport = (filePath, content, moduleName) => {
  if (content.includes('addAuditLog')) return content;
  
  // Calculate relative path to auditStore.js
  const auditPath = path.relative(path.dirname(filePath), 'src/features/audit/state/auditStore.js')
    .replace(/\\/g, '/');
  
  const importStmt = `import { addAuditLog } from '${auditPath.startsWith('.') ? auditPath : './' + auditPath}';\n`;
  return importStmt + content;
};

// 1. Rooms
let roomContent = fs.readFileSync('src/features/rooms/state/roomStore.js', 'utf8');
roomContent = addImport('src/features/rooms/state/roomStore.js', roomContent);
roomContent = roomContent.replace(
  /export const addRoom = \(room\) => \{([\s\S]*?localStorage\.setItem.*?)\n\};/g,
  `export const addRoom = (room) => {$1
  addAuditLog({ module: 'Rooms', action: 'Added Room', recordId: room.id, description: \`Room \${room.roomNo} added.\`, importance: 'Important' });
};`
);
roomContent = roomContent.replace(
  /export const updateRoom = \(id, updatedData\) => \{([\s\S]*?localStorage\.setItem.*?)\n\};/g,
  `export const updateRoom = (id, updatedData) => {$1
  addAuditLog({ module: 'Rooms', action: 'Updated Room', recordId: id, description: \`Room \${id} updated.\`, importance: 'Normal' });
};`
);
roomContent = roomContent.replace(
  /export const deleteRoom = \(id\) => \{([\s\S]*?localStorage\.setItem.*?)\n\};/g,
  `export const deleteRoom = (id) => {$1
  addAuditLog({ module: 'Rooms', action: 'Deleted Room', recordId: id, description: \`Room \${id} deleted.\`, importance: 'Critical' });
};`
);
fs.writeFileSync('src/features/rooms/state/roomStore.js', roomContent, 'utf8');

// 2. Guests
let guestContent = fs.readFileSync('src/features/guests/state/guestStore.js', 'utf8');
guestContent = addImport('src/features/guests/state/guestStore.js', guestContent);
guestContent = guestContent.replace(
  /export const addGuest = \(guest\) => \{([\s\S]*?localStorage\.setItem.*?)\n\};/g,
  `export const addGuest = (guest) => {$1
  addAuditLog({ module: 'Guests', action: 'Added Guest', recordId: guest.id, description: \`Guest \${guest.name} added.\`, importance: 'Normal' });
};`
);
guestContent = guestContent.replace(
  /export const updateGuest = \(id, updatedData\) => \{([\s\S]*?localStorage\.setItem.*?)\n\};/g,
  `export const updateGuest = (id, updatedData) => {$1
  addAuditLog({ module: 'Guests', action: 'Updated Guest', recordId: id, description: \`Guest \${id} updated.\`, importance: 'Normal' });
};`
);
fs.writeFileSync('src/features/guests/state/guestStore.js', guestContent, 'utf8');

// 3. Reservations (if exports these functions)
try {
  let resContent = fs.readFileSync('src/features/reservations/state/reservationStore.js', 'utf8');
  resContent = addImport('src/features/reservations/state/reservationStore.js', resContent);
  resContent = resContent.replace(
    /export const addReservation = \(res\) => \{([\s\S]*?localStorage\.setItem.*?)\n\};/g,
    `export const addReservation = (res) => {$1
    addAuditLog({ module: 'Reservation', action: 'Created Reservation', recordId: res.id, description: \`Reservation \${res.id} created.\`, importance: 'Important' });
  };`
  );
  resContent = resContent.replace(
    /export const updateReservation = \(id, updatedData\) => \{([\s\S]*?localStorage\.setItem.*?)\n\};/g,
    `export const updateReservation = (id, updatedData) => {$1
    addAuditLog({ module: 'Reservation', action: 'Updated Reservation', recordId: id, description: \`Reservation \${id} updated.\`, importance: 'Important' });
  };`
  );
  fs.writeFileSync('src/features/reservations/state/reservationStore.js', resContent, 'utf8');
} catch (e) {}

// 4. Hotel Profile
try {
  let profContent = fs.readFileSync('src/features/settings/pages/HotelProfile.jsx', 'utf8');
  if (!profContent.includes('addAuditLog')) {
    profContent = profContent.replace(
      'import FormField from \'../components/FormField\';',
      `import FormField from '../components/FormField';\nimport { addAuditLog } from '../../audit/state/auditStore';`
    );
    profContent = profContent.replace(
      /showToast\('Hotel profile saved successfully!'\);/,
      `showToast('Hotel profile saved successfully!');\n    addAuditLog({ module: 'Hotel Settings', action: 'Updated Hotel Profile', description: 'Hotel name, logo, or contact info was changed.', importance: 'Important' });`
    );
    fs.writeFileSync('src/features/settings/pages/HotelProfile.jsx', profContent, 'utf8');
  }
} catch(e){}

console.log('Instrumentation basic completed');
