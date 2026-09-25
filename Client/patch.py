import os
import re

def ensure_import(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'addAuditLog' not in content:
        depth = len(file_path.split('/')) - 4
        up = '../' * depth
        import_stmt = f"import {{ addAuditLog }} from '{up}audit/state/auditStore.js';\n"
        # If it's a JSX component, the depth might be different. Let's use a simpler import injection.
        # Find the last import.
        import_matches = list(re.finditer(r'import\s+.*?;?\n', content))
        if import_matches:
            last_import = import_matches[-1]
            content = content[:last_import.end()] + import_stmt + content[last_import.end():]
        else:
            content = import_stmt + content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

def patch_file(file_path, module_name, modifications):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    ensure_import(file_path)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False
    for mod in modifications:
        target = mod['target']
        replacement = mod['replacement']
        if target in content:
            content = content.replace(target, replacement)
            changed = True
        else:
            print(f"Target not found in {file_path}")

    if changed:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

# Guest Store
patch_file('src/features/guests/state/guestStore.js', 'Guests', [
    {
        'target': "saveGuests(updated);\n  return newGuest;\n}",
        'replacement': "saveGuests(updated);\n  try { addAuditLog({ module: 'Guests', action: 'Added Guest', recordId: nextId, description: `Guest ${newGuest.name} added.`, importance: 'Important' }); } catch(e) {}\n  return newGuest;\n}"
    },
    {
        'target': "saveGuests(updated);\n  return updated;\n}",
        'replacement': "saveGuests(updated);\n  try { addAuditLog({ module: 'Guests', action: 'Updated Guest', recordId: id, description: `Guest ${id} updated.`, importance: 'Normal' }); } catch(e) {}\n  return updated;\n}"
    },
    {
        'target': "saveGuests(updated);\n}",
        'replacement': "saveGuests(updated);\n  try { addAuditLog({ module: 'Guests', action: 'Deleted Guest', recordId: id, description: `Guest ${id} deleted.`, importance: 'Critical' }); } catch(e) {}\n}"
    }
])

# Room Store
patch_file('src/features/rooms/state/roomStore.js', 'Rooms', [
    {
        'target': "saveRooms([nextRoom, ...rooms]);\n  return nextRoom;\n}",
        'replacement': "saveRooms([nextRoom, ...rooms]);\n  try { addAuditLog({ module: 'Rooms', action: 'Added Room', recordId: nextRoom.roomNo, description: `Room ${nextRoom.roomNo} added.`, importance: 'Important' }); } catch(e) {}\n  return nextRoom;\n}"
    },
    {
        'target': "saveRooms(rooms);\n  return rooms.find((room) => room.id === id);\n}",
        'replacement': "saveRooms(rooms);\n  try { addAuditLog({ module: 'Rooms', action: 'Updated Room', recordId: id, description: `Room ${id} updated.`, importance: 'Normal' }); } catch(e) {}\n  return rooms.find((room) => room.id === id || room.roomNo === id);\n}"
    },
    {
        'target': "saveRooms(getRooms().filter((room) => room.id !== id));\n}",
        'replacement': "saveRooms(getRooms().filter((room) => room.id !== id && room.roomNo !== id));\n  try { addAuditLog({ module: 'Rooms', action: 'Deleted Room', recordId: id, description: `Room ${id} deleted.`, importance: 'Critical' }); } catch(e) {}\n}"
    }
])

# Reservations
# Since reservation doesn't have an add function in the store, we patch saveReservations but only when new ones are added
# We already tried to patch AddReservation.jsx. Let's do it here.
patch_file('src/features/reservations/pages/AddReservation.jsx', 'Reservation', [
    {
        'target': "saveReservations([{\n      id: nextId,",
        'replacement': "try { addAuditLog({ module: 'Reservation', action: 'Created Reservation', recordId: nextId, description: `Reservation ${nextId} created.`, importance: 'Important' }); } catch(e) {}\n    saveReservations([{\n      id: nextId,"
    }
])

# Edit Reservation
patch_file('src/features/reservations/pages/EditReservation.jsx', 'Reservation', [
    {
        'target': "saveReservations(updated);",
        'replacement': "saveReservations(updated);\n    try { addAuditLog({ module: 'Reservation', action: 'Updated Reservation', recordId: updatedBooking.id, description: `Reservation ${updatedBooking.id} updated.`, importance: 'Important' }); } catch(e) {}"
    }
])

# Cancel Booking
patch_file('src/features/reservations/pages/CancelBooking.jsx', 'Reservation', [
    {
        'target': "saveReservations(updated);",
        'replacement': "saveReservations(updated);\n      try { addAuditLog({ module: 'Reservation', action: 'Cancelled Reservation', recordId: selectedBooking.id, description: `Reservation ${selectedBooking.id} cancelled.`, importance: 'Critical' }); } catch(e) {}"
    }
])
