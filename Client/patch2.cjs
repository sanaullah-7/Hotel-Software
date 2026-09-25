const fs = require('fs');

function patchFile(filePath, modifications) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    // Normalize newlines to \n
    let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    let changed = false;

    // Inject import
    if (!content.includes('addAuditLog')) {
        const depth = filePath.split('/').length - 3;
        const up = '../'.repeat(depth);
        const importStmt = `import { addAuditLog } from '${up}audit/state/auditStore.js';\n`;
        
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIndex = i;
            }
        }
        
        if (lastImportIndex >= 0) {
            lines.splice(lastImportIndex + 1, 0, importStmt);
            content = lines.join('\n');
        } else {
            content = importStmt + content;
        }
    }

    for (const mod of modifications) {
        if (content.includes(mod.target)) {
            content = content.replace(mod.target, mod.replacement);
            changed = true;
        } else {
            console.log(`Target not found in ${filePath}:\n${mod.target.substring(0, 50)}...`);
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

// Guest Store
patchFile('src/features/guests/state/guestStore.js', [
    {
        target: "saveGuests(updated);\n  return newGuest;\n}",
        replacement: "saveGuests(updated);\n  try { addAuditLog({ module: 'Guests', action: 'Added Guest', recordId: nextId, description: `Guest ${newGuest.name} added.`, importance: 'Important' }); } catch(e) {}\n  return newGuest;\n}"
    },
    {
        target: "saveGuests(updated);\n  return updated;\n}",
        replacement: "saveGuests(updated);\n  try { addAuditLog({ module: 'Guests', action: 'Updated Guest', recordId: id, description: `Guest ${id} updated.`, importance: 'Normal' }); } catch(e) {}\n  return updated;\n}"
    },
    {
        target: "saveGuests(updated);\n}",
        replacement: "saveGuests(updated);\n  try { addAuditLog({ module: 'Guests', action: 'Deleted Guest', recordId: id, description: `Guest ${id} deleted.`, importance: 'Critical' }); } catch(e) {}\n}"
    }
]);

// Room Store
patchFile('src/features/rooms/state/roomStore.js', [
    {
        target: "saveRooms([nextRoom, ...rooms]);\n  return nextRoom;\n}",
        replacement: "saveRooms([nextRoom, ...rooms]);\n  try { addAuditLog({ module: 'Rooms', action: 'Added Room', recordId: String(nextRoom.roomNo), description: `Room ${nextRoom.roomNo} added.`, importance: 'Important' }); } catch(e) {}\n  return nextRoom;\n}"
    },
    {
        target: "saveRooms(rooms);\n  return rooms.find((room) => room.id === id);\n}",
        replacement: "saveRooms(rooms);\n  try { addAuditLog({ module: 'Rooms', action: 'Updated Room', recordId: String(id), description: `Room ${id} updated.`, importance: 'Normal' }); } catch(e) {}\n  return rooms.find((room) => room.id === id || room.roomNo === id);\n}"
    },
    {
        target: "saveRooms(getRooms().filter((room) => room.id !== id));\n}",
        replacement: "saveRooms(getRooms().filter((room) => room.id !== id && room.roomNo !== id));\n  try { addAuditLog({ module: 'Rooms', action: 'Deleted Room', recordId: String(id), description: `Room ${id} deleted.`, importance: 'Critical' }); } catch(e) {}\n}"
    }
]);

// Reservations
patchFile('src/features/reservations/pages/AddReservation.jsx', [
    {
        target: "saveReservations([{\n      id: nextId,",
        replacement: "try { addAuditLog({ module: 'Reservation', action: 'Created Reservation', recordId: nextId, description: `Reservation ${nextId} created.`, importance: 'Important' }); } catch(e) {}\n    saveReservations([{\n      id: nextId,"
    }
]);

// Edit Reservation
patchFile('src/features/reservations/pages/AllReservations.jsx', [
    {
        target: "saveReservations(nextBookings);\n    onClose();",
        replacement: "saveReservations(nextBookings);\n    try { addAuditLog({ module: 'Reservation', action: 'Updated Reservation', recordId: editingBooking.bookingId, description: `Reservation ${editingBooking.bookingId} updated.`, importance: 'Important' }); } catch(e) {}\n    onClose();"
    }
]);
