import { addAuditLog } from '../../audit/state/auditStore.js';
import { getRoomByRoomNo } from '../../rooms/state/roomStore.js';
export const INITIAL_ROOMS = [
  { id: '101', roomId: 'R-101', roomNo: '101', guest: 'Alice Wonderland', status: 'Dirty', cleaningType: 'Full Clean', priority: 'High', assignee: 'Bob Builder' },
  { id: '102', roomId: 'R-102', roomNo: '102', guest: 'Sarah Smith', status: 'Clean / Ready', cleaningType: 'Daily', priority: 'Normal', assignee: 'Ava Staff' },
  { id: '105', roomId: 'R-105', roomNo: '105', guest: 'Smita Parikh', status: 'Cleaning', cleaningType: 'Deep Clean', priority: 'High', assignee: 'Frank Miller' },
  { id: '108', roomId: 'R-108', roomNo: '108', guest: 'Guest 108', status: 'Dirty', cleaningType: 'Full Clean', priority: 'Normal', assignee: 'Dina House' },
];
export const INITIAL_STAFF = [
  { id: 'staff-1', name: 'Bob Builder', role: 'Housekeeper' },
  { id: 'staff-2', name: 'Ava Staff', role: 'Housekeeper' },
  { id: 'staff-3', name: 'Frank Miller', role: 'Supervisor' },
  { id: 'staff-4', name: 'Dina House', role: 'Housekeeper' },
];

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
