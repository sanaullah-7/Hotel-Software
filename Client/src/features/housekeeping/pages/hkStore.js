import { addAuditLog } from '../../audit/state/auditStore.js';
export const INITIAL_ROOMS = [
  { id: '101', type: 'Standard', guest: '-', stayStatus: 'Vacant', cleaningType: 'Daily', status: 'Dirty', priority: 'Normal', assignee: '-', started: '-', completed: '-' },
  { id: '102', type: 'Deluxe', guest: 'John Doe', stayStatus: 'Stayover', cleaningType: 'Stayover Cleaning', status: 'Assigned', priority: 'High', assignee: 'Jane Smith', started: '-', completed: '-' },
  { id: '103', type: 'Suite', guest: '-', stayStatus: 'Vacant', cleaningType: 'Deep Cleaning', status: 'Cleaning', priority: 'Urgent', assignee: 'Ali', started: '10:00 AM', completed: '-' },
  { id: '104', type: 'Standard', guest: 'Sarah Connor', stayStatus: 'Checkout', cleaningType: 'Checkout Cleaning', status: 'Inspection Required', priority: 'Normal', assignee: 'Bilal', started: '09:00 AM', completed: '10:30 AM' },
  { id: '105', type: 'Deluxe', guest: '-', stayStatus: 'Vacant', cleaningType: '-', status: 'Clean / Ready', priority: 'Low', assignee: '-', started: '-', completed: 'Yesterday 14:00' }, // This will be "Available"
  { id: '106', type: 'Suite', guest: 'Bruce Wayne', stayStatus: 'Occupied', cleaningType: '-', status: 'Clean / Ready', priority: 'Normal', assignee: '-', started: '-', completed: '09:00 AM' }, // This will be "Occupied"
  { id: '107', type: 'Standard', guest: '-', stayStatus: 'Vacant', cleaningType: 'Maintenance', status: 'Maintenance', priority: 'High', assignee: '-', started: '-', completed: '-' },
  { id: '108', type: 'Deluxe', guest: 'Anna Bell', stayStatus: 'Stayover', cleaningType: '-', status: 'DND', priority: 'Normal', assignee: '-', started: '-', completed: '-' },
];

export const INITIAL_STAFF = [
  { id: 'HK-01', name: 'Ali', status: 'Active' },
  { id: 'HK-02', name: 'Bilal', status: 'Active' },
  { id: 'HK-03', name: 'Bob Taylor', status: 'Active' },
  { id: 'HK-04', name: 'Mike Ross', status: 'Off Duty' },
  { id: 'HK-05', name: 'Jane Smith', status: 'Active' },
  { id: 'HK-06', name: 'Alice Green', status: 'Active' },
];

export const getRooms = () => {
  const isReset = localStorage.getItem('hk_test_reset_v3');
  let data = localStorage.getItem('hk_rooms');
  
  if (!isReset) {
    localStorage.setItem('hk_test_reset_v3', 'true');
    localStorage.setItem('hk_rooms', JSON.stringify(INITIAL_ROOMS));
    data = JSON.stringify(INITIAL_ROOMS);
  }
  
  return data ? JSON.parse(data) : INITIAL_ROOMS;
};

export const saveRooms = (rooms) => {
  localStorage.setItem('hk_rooms', JSON.stringify(rooms));
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
