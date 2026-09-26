import { addAuditLog } from '../../audit/state/auditStore.js';

const STORAGE_KEY_RECORDS = 'hotel_car_parking_records_v1';
const STORAGE_KEY_SPACES = 'hotel_car_parking_spaces_v1';
export const PARKING_UPDATED_EVENT = 'parking_data_update';

// Generate 30 default parking spaces
const generateDefaultSpaces = () => {
  const spaces = [];
  for (let i = 1; i <= 30; i++) {
    spaces.push({
      id: `P-${String(i).padStart(2, '0')}`,
      number: `P-${String(i).padStart(2, '0')}`,
      status: 'Available' // Available, Occupied, Blocked
    });
  }
  return spaces;
};

// Generate 15 dummy records
const generateDummyRecords = () => {
  return [
    { id: 1, guestName: 'Ali Khan', roomNumber: '205', carNumber: 'ABC-123', carType: 'Sedan', parkingSpace: 'P-05', entryDate: new Date().toISOString().split('T')[0], entryTime: '14:30', exitDate: null, exitTime: null, chargeType: 'Daily', chargeAmount: 500, paymentStatus: 'Paid', status: 'Parked' },
    { id: 2, guestName: 'Ahmed Khan', roomNumber: '301', carNumber: 'XYZ-456', carType: 'SUV', parkingSpace: 'P-08', entryDate: new Date().toISOString().split('T')[0], entryTime: '15:10', exitDate: null, exitTime: null, chargeType: 'Hourly', chargeAmount: 300, paymentStatus: 'Pending', status: 'Parked' },
    { id: 3, guestName: 'Usman Ali', roomNumber: '104', carNumber: 'KLM-789', carType: 'Sedan', parkingSpace: 'P-02', entryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], entryTime: '13:15', exitDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], exitTime: '17:30', chargeType: 'Hourly', chargeAmount: 400, paymentStatus: 'Paid', status: 'Checked Out' },
    { id: 4, guestName: 'Sara Ahmed', roomNumber: '405', carNumber: 'DEF-101', carType: 'Hatchback', parkingSpace: 'P-12', entryDate: new Date().toISOString().split('T')[0], entryTime: '09:00', exitDate: null, exitTime: null, chargeType: 'Daily', chargeAmount: 500, paymentStatus: 'Pending', status: 'Parked' },
    { id: 5, guestName: 'Omer Farooq', roomNumber: '210', carNumber: 'GHI-202', carType: 'SUV', parkingSpace: 'P-15', entryDate: new Date(Date.now() - 172800000).toISOString().split('T')[0], entryTime: '11:00', exitDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], exitTime: '10:00', chargeType: 'Daily', chargeAmount: 1000, paymentStatus: 'Paid', status: 'Checked Out' },
    { id: 6, guestName: 'Fatima Noor', roomNumber: '115', carNumber: 'JKL-303', carType: 'Sedan', parkingSpace: 'P-01', entryDate: new Date().toISOString().split('T')[0], entryTime: '08:30', exitDate: null, exitTime: null, chargeType: 'Free', chargeAmount: 0, paymentStatus: 'Paid', status: 'Parked' },
    { id: 7, guestName: 'Hassan Raza', roomNumber: '501', carNumber: 'MNO-404', carType: 'Van', parkingSpace: 'P-20', entryDate: new Date().toISOString().split('T')[0], entryTime: '12:45', exitDate: null, exitTime: null, chargeType: 'Daily', chargeAmount: 500, paymentStatus: 'Pending', status: 'Parked' },
    { id: 8, guestName: 'Zainab Abbas', roomNumber: '305', carNumber: 'PQR-505', carType: 'Sedan', parkingSpace: 'P-10', entryDate: new Date(Date.now() - 259200000).toISOString().split('T')[0], entryTime: '16:20', exitDate: new Date(Date.now() - 172800000).toISOString().split('T')[0], exitTime: '11:15', chargeType: 'Daily', chargeAmount: 500, paymentStatus: 'Paid', status: 'Checked Out' },
    { id: 9, guestName: 'Bilal Malik', roomNumber: '220', carNumber: 'STU-606', carType: 'Bike', parkingSpace: 'P-25', entryDate: new Date().toISOString().split('T')[0], entryTime: '10:10', exitDate: null, exitTime: null, chargeType: 'Hourly', chargeAmount: 100, paymentStatus: 'Paid', status: 'Parked' },
    { id: 10, guestName: 'Ayesha Khan', roomNumber: '412', carNumber: 'VWX-707', carType: 'SUV', parkingSpace: 'P-07', entryDate: new Date().toISOString().split('T')[0], entryTime: '17:50', exitDate: null, exitTime: null, chargeType: 'Daily', chargeAmount: 500, paymentStatus: 'Pending', status: 'Parked' },
    { id: 11, guestName: 'Kamran Ali', roomNumber: '108', carNumber: 'YZA-808', carType: 'Hatchback', parkingSpace: 'P-18', entryDate: new Date(Date.now() - 345600000).toISOString().split('T')[0], entryTime: '14:00', exitDate: new Date(Date.now() - 259200000).toISOString().split('T')[0], exitTime: '09:30', chargeType: 'Daily', chargeAmount: 500, paymentStatus: 'Paid', status: 'Checked Out' },
    { id: 12, guestName: 'Nida Tariq', roomNumber: '315', carNumber: 'BCD-909', carType: 'Sedan', parkingSpace: 'P-03', entryDate: new Date().toISOString().split('T')[0], entryTime: '07:15', exitDate: null, exitTime: null, chargeType: 'Free', chargeAmount: 0, paymentStatus: 'Paid', status: 'Parked' },
    { id: 13, guestName: 'Saad Mahmood', roomNumber: '505', carNumber: 'EFG-111', carType: 'SUV', parkingSpace: 'P-22', entryDate: new Date().toISOString().split('T')[0], entryTime: '19:20', exitDate: null, exitTime: null, chargeType: 'Daily', chargeAmount: 500, paymentStatus: 'Pending', status: 'Parked' },
    { id: 14, guestName: 'Mariam Waqar', roomNumber: '201', carNumber: 'HIJ-222', carType: 'Sedan', parkingSpace: 'P-11', entryDate: new Date(Date.now() - 432000000).toISOString().split('T')[0], entryTime: '12:00', exitDate: new Date(Date.now() - 345600000).toISOString().split('T')[0], exitTime: '14:45', chargeType: 'Daily', chargeAmount: 500, paymentStatus: 'Paid', status: 'Checked Out' },
    { id: 15, guestName: 'Tariq Jamil', roomNumber: '401', carNumber: 'KLM-333', carType: 'Van', parkingSpace: 'P-30', entryDate: new Date().toISOString().split('T')[0], entryTime: '21:00', exitDate: null, exitTime: null, chargeType: 'Hourly', chargeAmount: 200, paymentStatus: 'Pending', status: 'Parked' },
  ];
};

export function getParkingSpaces() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SPACES);
    if (!stored) {
      const defaultSpaces = generateDefaultSpaces();
      
      // Mark spaces as occupied based on dummy records
      const dummyRecords = generateDummyRecords();
      const parkedSpaces = dummyRecords.filter(r => r.status === 'Parked').map(r => r.parkingSpace);
      
      defaultSpaces.forEach(space => {
        if (parkedSpaces.includes(space.number)) {
          space.status = 'Occupied';
        }
      });
      
      localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(defaultSpaces));
      return defaultSpaces;
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
      const defaultRecords = generateDummyRecords();
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(defaultRecords));
      return defaultRecords;
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
