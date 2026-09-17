export const mockStaff = [
  { id: 1, empId: 'EMP-001', name: 'John Doe', designation: 'Manager', department: 'Management', phone: '+1 234 567 8900', email: 'john.doe@hotel.com', shift: 'Morning', shiftTime: '08:00 AM - 04:00 PM', joiningDate: '2023-01-15', status: 'Active', address: '11, Shyam apt, NY' },
  { id: 2, empId: 'EMP-002', name: 'Jane Smith', designation: 'Receptionist', department: 'Front Office', phone: '+1 234 567 8901', email: 'jane.smith@hotel.com', shift: 'Evening', shiftTime: '04:00 PM - 12:00 AM', joiningDate: '2023-03-22', status: 'Active', address: '22, tilak appt, CA' },
  { id: 3, empId: 'EMP-003', name: 'Mike Johnson', designation: 'Housekeeper', department: 'Housekeeping', phone: '+1 234 567 8902', email: 'mike.j@hotel.com', shift: 'Morning', shiftTime: '08:00 AM - 04:00 PM', joiningDate: '2023-05-10', status: 'On Leave', address: '201, Shyam apt, TX' },
  { id: 4, empId: 'EMP-004', name: 'Sarah Williams', designation: 'Chef', department: 'Kitchen', phone: '+1 234 567 8903', email: 'sarah.w@hotel.com', shift: 'Evening', shiftTime: '04:00 PM - 12:00 AM', joiningDate: '2022-11-05', status: 'Inactive', address: '11, Shyam apt, NY' },
];

export const mockLeaveRequests = [
  { id: 1, empId: 'EMP-003', name: 'Mike Johnson', leaveType: 'Sick Leave', fromDate: '2026-09-15', toDate: '2026-09-17', days: 3, reason: 'Fever', requestDate: '2026-09-14', status: 'Approved' },
  { id: 2, empId: 'EMP-002', name: 'Jane Smith', leaveType: 'Casual Leave', fromDate: '2026-09-20', toDate: '2026-09-21', days: 2, reason: 'Family event', requestDate: '2026-09-16', status: 'Pending' },
];

export const mockAttendance = [
  { id: 1, empId: 'EMP-001', name: 'John Doe', department: 'Management', shift: 'Morning', shiftTime: '08:00 AM - 04:00 PM', checkIn: '07:55 AM', checkOut: '04:05 PM', workingHours: '8h 10m', status: 'Present', date: '2026-09-16' },
  { id: 2, empId: 'EMP-002', name: 'Jane Smith', department: 'Front Office', shift: 'Evening', shiftTime: '04:00 PM - 12:00 AM', checkIn: '03:50 PM', checkOut: '--:--', workingHours: '--', status: 'Present', date: '2026-09-16' },
  { id: 3, empId: 'EMP-003', name: 'Mike Johnson', department: 'Housekeeping', shift: 'Morning', shiftTime: '08:00 AM - 04:00 PM', checkIn: '--:--', checkOut: '--:--', workingHours: '0h', status: 'On Leave', date: '2026-09-16' },
  { id: 4, empId: 'EMP-004', name: 'Sarah Williams', department: 'Kitchen', shift: 'Evening', shiftTime: '04:00 PM - 12:00 AM', checkIn: '--:--', checkOut: '--:--', workingHours: '0h', status: 'Absent', date: '2026-09-16' },
];

export const mockSalaries = [
  { id: 1, empId: 'EMP-001', name: 'John Doe', department: 'Management', designation: 'Manager', basicSalary: 5000, allowances: 500, deductions: 100, netSalary: 5400, paymentStatus: 'Paid', paymentDate: '2026-09-01' },
  { id: 2, empId: 'EMP-002', name: 'Jane Smith', department: 'Front Office', designation: 'Receptionist', basicSalary: 3000, allowances: 200, deductions: 50, netSalary: 3150, paymentStatus: 'Pending', paymentDate: '' },
];

export const mockExpenses = [
  { id: 1, expenseId: 'EXP-1001', title: 'Electricity Bill', category: 'Utilities', amount: 1200, date: '2026-09-05', paymentMethod: 'Bank Transfer', addedBy: 'Admin', status: 'Paid' },
  { id: 2, expenseId: 'EXP-1002', title: 'Plumbing Repair', category: 'Maintenance', amount: 350, date: '2026-09-10', paymentMethod: 'Cash', addedBy: 'Manager', status: 'Paid' },
  { id: 3, expenseId: 'EXP-1003', title: 'New Towels', category: 'Supplies', amount: 800, date: '2026-09-15', paymentMethod: 'Credit Card', addedBy: 'Housekeeping', status: 'Pending' },
];

export const mockOccupancy = [
  { id: 1, roomNumber: '101', roomType: 'Standard', status: 'Occupied', guest: 'Alice Brown', checkIn: '2026-09-14', checkOut: '2026-09-18' },
  { id: 2, roomNumber: '102', roomType: 'Standard', status: 'Available', guest: '-', checkIn: '-', checkOut: '-' },
  { id: 3, roomNumber: '201', roomType: 'Deluxe', status: 'Reserved', guest: 'Bob Wilson', checkIn: '2026-09-17', checkOut: '2026-09-20' },
  { id: 4, roomNumber: '202', roomType: 'Suite', status: 'Maintenance', guest: '-', checkIn: '-', checkOut: '-' },
];
