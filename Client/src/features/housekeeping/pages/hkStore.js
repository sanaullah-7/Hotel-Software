import { addAuditLog } from '../../audit/state/auditStore.js';
import { getRoomByRoomNo } from '../../rooms/state/roomStore.js';
export const INITIAL_ROOMS = [];
export const INITIAL_STAFF = [];

export const getRooms = () => {
  let rooms;
  try {
    const data = localStorage.getItem('hk_rooms');
    rooms = data === null ? INITIAL_ROOMS : JSON.parse(data);
    if (!Array.isArray(rooms)) return INITIAL_ROOMS;
  } catch {
    return INITIAL_ROOMS;
  }
  let changed = false;
  const linked = rooms.map((room) => {
    if (room.roomId || room.id === undefined || room.id === null) return room;
    const canonicalRoom = getRoomByRoomNo(room.id);
    if (!canonicalRoom) return room;
    changed = true;
    return { ...room, roomId: canonicalRoom.id };
  });
  if (changed) localStorage.setItem('hk_rooms', JSON.stringify(linked));
  return linked;
};

export const saveRooms = (rooms) => {
  const linked = rooms.map((room) => {
    if (room.roomId || room.id === undefined || room.id === null) return room;
    const canonicalRoom = getRoomByRoomNo(room.id);
    if (!canonicalRoom) return room;
    return { ...room, roomId: canonicalRoom.id };
  });
  localStorage.setItem('hk_rooms', JSON.stringify(linked));
  window.dispatchEvent(new Event('hk_update'));
    try { addAuditLog({ module: 'Housekeeping', action: 'Updated Record', description: 'INITIAL_ROOMS was called.', importance: 'Normal' }); } catch(e){}
};

export const getStaff = () => {
  const data = localStorage.getItem('hk_staff');
  return data ? JSON.parse(data) : INITIAL_STAFF;
};

export const saveStaff = (staff) => {
  localStorage.setItem('hk_staff', JSON.stringify(staff));
};

export const getMaintenance = () => {
  const data = localStorage.getItem('hk_maintenance');
  return data ? JSON.parse(data) : [];
};

export const saveMaintenance = (maint) => {
  localStorage.setItem('hk_maintenance', JSON.stringify(maint));
};

export const computeStaffStats = (staffId, rooms) => {
  const assignedRooms = rooms.filter(r => r.assignee === staffId || r.assignee === INITIAL_STAFF.find(s=>s.id === staffId)?.name);
  return {
    assignedRooms: assignedRooms.length,
    pending: assignedRooms.filter(r => ['Dirty', 'Assigned', 'Cleaning Required'].includes(r.status)).length,
    cleaning: assignedRooms.filter(r => r.status === 'Cleaning').length,
    inspection: assignedRooms.filter(r => r.status === 'Inspection Required').length,
    completed: assignedRooms.filter(r => r.status === 'Clean / Ready').length,
  };
};
