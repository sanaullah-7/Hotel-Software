const fs = require('fs');

function patchStore(filePath, moduleName, hooks) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if missing
  if (!content.includes('addAuditLog')) {
    const depth = filePath.split('/').length - 3;
    const up = '../'.repeat(depth);
    content = `import { addAuditLog } from '${up}audit/state/auditStore.js';\n` + content;
  }

  hooks.forEach(hook => {
    // Find the function and its return statement or end
    // We'll replace the exact string of the function's last line or return statement
    if (content.includes(hook.target)) {
      content = content.replace(hook.target, hook.replacement);
    }
  });

  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Guests
patchStore('src/features/guests/state/guestStore.js', 'Guests', [
  {
    target: "  return guest;\n}",
    replacement: "  addAuditLog({ module: 'Guests', action: 'Added Guest', recordId: guest.id, description: `Guest ${guest.name} added.`, importance: 'Important' });\n  return guest;\n}"
  },
  {
    target: "  return { ...guest, ...updates };\n      } \n      return guest;\n    });\n    saveGuests(updated);",
    replacement: "  return { ...guest, ...updates };\n      } \n      return guest;\n    });\n    saveGuests(updated);\n    addAuditLog({ module: 'Guests', action: 'Updated Guest', recordId: id, description: `Guest ${id} updated.`, importance: 'Normal' });"
  },
  {
    target: "  saveGuests(updated);\n}",
    replacement: "  saveGuests(updated);\n  addAuditLog({ module: 'Guests', action: 'Deleted Guest', recordId: id, description: `Guest ${id} deleted.`, importance: 'Critical' });\n}"
  }
]);

// 2. Rooms
patchStore('src/features/rooms/state/roomStore.js', 'Rooms', [
  {
    target: "export function addRoom(room) {\n  const current = getRooms();\n  const updated = [room, ...current];\n  saveRooms(updated);\n}",
    replacement: "export function addRoom(room) {\n  const current = getRooms();\n  const updated = [room, ...current];\n  saveRooms(updated);\n  addAuditLog({ module: 'Rooms', action: 'Added Room', recordId: room.number || room.id, description: `Room added.`, importance: 'Important' });\n}"
  },
  {
    target: "export function updateRoom(id, updatedData) {\n  const current = getRooms();\n  const updated = current.map(r => r.id === id || r.number === id ? { ...r, ...updatedData } : r);\n  saveRooms(updated);\n}",
    replacement: "export function updateRoom(id, updatedData) {\n  const current = getRooms();\n  const updated = current.map(r => r.id === id || r.number === id ? { ...r, ...updatedData } : r);\n  saveRooms(updated);\n  addAuditLog({ module: 'Rooms', action: 'Updated Room', recordId: id, description: `Room ${id} updated.`, importance: 'Normal' });\n}"
  },
  {
    target: "export function deleteRoom(id) {\n  const current = getRooms();\n  const updated = current.filter(r => r.id !== id && r.number !== id);\n  saveRooms(updated);\n}",
    replacement: "export function deleteRoom(id) {\n  const current = getRooms();\n  const updated = current.filter(r => r.id !== id && r.number !== id);\n  saveRooms(updated);\n  addAuditLog({ module: 'Rooms', action: 'Deleted Room', recordId: id, description: `Room ${id} deleted.`, importance: 'Critical' });\n}"
  }
]);

console.log("Patched Guests and Rooms");
