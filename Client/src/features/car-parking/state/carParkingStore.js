import { addAuditLog } from '../../audit/state/auditStore.js';

const STORAGE_KEY_RECORDS = 'hotel_car_parking_records_v1';
const STORAGE_KEY_SPACES = 'hotel_car_parking_spaces_v1';
export const PARKING_UPDATED_EVENT = 'parking_data_update';

// Fresh hotels start with 0 parking spaces (empty until configured)
const generateDefaultSpaces = () => [];

// Fresh hotels start with 0 parking records
const generateDummyRecords = () => [];

export function getParkingSpaces() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SPACES);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading parking spaces:', error);
    return [];
  }
}

export function saveParkingSpaces(spaces) {
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(spaces));
  window.dispatchEvent(new Event(PARKING_UPDATED_EVENT));
}

export function getParkingRecords() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading parking records:', error);
    return [];
  }
}

export function saveParkingRecords(records) {
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
  window.dispatchEvent(new Event(PARKING_UPDATED_EVENT));
}

export function addParkingRecord(recordData) {
  const records = getParkingRecords();
  const spaces = getParkingSpaces();
  
  const newRecord = {
    ...recordData,
    id: Date.now(), // Generate a unique ID
    status: 'Parked'
  };
  
  records.push(newRecord);
  
  // Update space status to Occupied
  const spaceIndex = spaces.findIndex(s => s.number === newRecord.parkingSpace);
  if (spaceIndex !== -1) {
    spaces[spaceIndex].status = 'Occupied';
    saveParkingSpaces(spaces);
  }
  
  saveParkingRecords(records);
  
  addAuditLog({
    action: 'Add Parking',
    module: 'Car Parking',
    description: `Added car ${newRecord.carNumber} for guest ${newRecord.guestName} to space ${newRecord.parkingSpace}`,
  });
  
  return newRecord;
}

export function updateParkingRecord(id, updatedData) {
  const records = getParkingRecords();
  const spaces = getParkingSpaces();
  
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    const oldSpace = records[index].parkingSpace;
    records[index] = { ...records[index], ...updatedData };
    
    // If parking space was changed, update spaces
    if (updatedData.parkingSpace && oldSpace !== updatedData.parkingSpace) {
      const oldSpaceIndex = spaces.findIndex(s => s.number === oldSpace);
      if (oldSpaceIndex !== -1) spaces[oldSpaceIndex].status = 'Available';
      
      const newSpaceIndex = spaces.findIndex(s => s.number === updatedData.parkingSpace);
      if (newSpaceIndex !== -1) spaces[newSpaceIndex].status = 'Occupied';
      
      saveParkingSpaces(spaces);
    }
    
    saveParkingRecords(records);
    
    addAuditLog({
      action: 'Edit Parking',
      module: 'Car Parking',
      description: `Updated parking record for car ${records[index].carNumber}`,
    });
  }
}

export function deleteParkingRecord(id) {
  const records = getParkingRecords();
  const spaces = getParkingSpaces();
  
  const record = records.find(r => r.id === id);
  if (record && record.status === 'Parked') {
    // Release the parking space
    const spaceIndex = spaces.findIndex(s => s.number === record.parkingSpace);
    if (spaceIndex !== -1) {
      spaces[spaceIndex].status = 'Available';
      saveParkingSpaces(spaces);
    }
  }
  
  const filteredRecords = records.filter(r => r.id !== id);
  saveParkingRecords(filteredRecords);
  
  if (record) {
    addAuditLog({
      action: 'Delete Parking',
      module: 'Car Parking',
      description: `Deleted parking record for car ${record.carNumber}`,
    });
  }
}

export function checkoutCar(id, exitDate, exitTime) {
  const records = getParkingRecords();
  const spaces = getParkingSpaces();
  
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    records[index].status = 'Checked Out';
    records[index].exitDate = exitDate;
    records[index].exitTime = exitTime;
    
    // Release the parking space
    const spaceIndex = spaces.findIndex(s => s.number === records[index].parkingSpace);
    if (spaceIndex !== -1) {
      spaces[spaceIndex].status = 'Available';
      saveParkingSpaces(spaces);
    }
    
    saveParkingRecords(records);
    
    addAuditLog({
      action: 'Checkout Car',
      module: 'Car Parking',
      description: `Checked out car ${records[index].carNumber} from space ${records[index].parkingSpace}`,
    });
  }
}

export function addParkingSpace(number) {
  const spaces = getParkingSpaces();
  spaces.push({
    id: number,
    number: number,
    status: 'Available'
  });
  saveParkingSpaces(spaces);
  
  addAuditLog({
    action: 'Add Parking Space',
    module: 'Car Parking',
    description: `Added new parking space ${number}`,
  });
}

export function deleteParkingSpace(number) {
  const spaces = getParkingSpaces();
  const filteredSpaces = spaces.filter(s => s.number !== number);
  saveParkingSpaces(filteredSpaces);
  
  addAuditLog({
    action: 'Delete Parking Space',
    module: 'Car Parking',
    description: `Deleted parking space ${number}`,
  });
}

export function updateParkingSpaceStatus(number, status) {
  const spaces = getParkingSpaces();
  const index = spaces.findIndex(s => s.number === number);
  if (index !== -1) {
    spaces[index].status = status;
    saveParkingSpaces(spaces);
    
    addAuditLog({
      action: 'Update Parking Space',
      module: 'Car Parking',
      description: `Updated space ${number} status to ${status}`,
    });
  }
}
