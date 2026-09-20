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
  { id: 4, expenseId: 'EXP-1004', title: 'Kitchen Equipment', category: 'Maintenance', amount: 2500, date: '2026-09-08', paymentMethod: 'Bank Transfer', addedBy: 'Admin', status: 'Paid' },
  { id: 5, expenseId: 'EXP-1005', title: 'Staff Uniforms', category: 'Supplies', amount: 1800, date: '2026-09-12', paymentMethod: 'Credit Card', addedBy: 'HR', status: 'Paid' },
  { id: 6, expenseId: 'EXP-1006', title: 'Water Bill', category: 'Utilities', amount: 600, date: '2026-09-03', paymentMethod: 'Bank Transfer', addedBy: 'Admin', status: 'Paid' },
  { id: 7, expenseId: 'EXP-1007', title: 'Garden Maintenance', category: 'Maintenance', amount: 450, date: '2026-09-14', paymentMethod: 'Cash', addedBy: 'Manager', status: 'Pending' },
  { id: 8, expenseId: 'EXP-1008', title: 'Laundry Supplies', category: 'Supplies', amount: 320, date: '2026-09-16', paymentMethod: 'Cash', addedBy: 'Housekeeping', status: 'Paid' },
];

export const mockOccupancy = [
  { id: 1, roomNumber: '101', roomType: 'Standard', status: 'Occupied', guest: 'Alice Brown', checkIn: '2026-09-14', checkOut: '2026-09-18' },
  { id: 2, roomNumber: '102', roomType: 'Standard', status: 'Available', guest: '-', checkIn: '-', checkOut: '-' },
  { id: 3, roomNumber: '201', roomType: 'Deluxe', status: 'Reserved', guest: 'Bob Wilson', checkIn: '2026-09-17', checkOut: '2026-09-20' },
  { id: 4, roomNumber: '202', roomType: 'Suite', status: 'Maintenance', guest: '-', checkIn: '-', checkOut: '-' },
  { id: 5, roomNumber: '103', roomType: 'Standard', status: 'Occupied', guest: 'Carol Davis', checkIn: '2026-09-15', checkOut: '2026-09-19' },
  { id: 6, roomNumber: '203', roomType: 'Deluxe', status: 'Occupied', guest: 'David Lee', checkIn: '2026-09-16', checkOut: '2026-09-21' },
  { id: 7, roomNumber: '301', roomType: 'Suite', status: 'Available', guest: '-', checkIn: '-', checkOut: '-' },
  { id: 8, roomNumber: '104', roomType: 'Standard', status: 'Occupied', guest: 'Emma White', checkIn: '2026-09-13', checkOut: '2026-09-17' },
];

// ==================== REPORTS MOCK DATA ====================

export const mockStockItems = [
  { id: 1, itemName: 'Bath Towels', category: 'Linens', quantity: 320, unit: 'Pcs', unitPrice: 12, totalValue: 3840, status: 'In Stock', lastRestocked: '2026-09-10' },
  { id: 2, itemName: 'Shampoo Bottles', category: 'Toiletries', quantity: 15, unit: 'Boxes', unitPrice: 45, totalValue: 675, status: 'Low Stock', lastRestocked: '2026-08-25' },
  { id: 3, itemName: 'Bed Sheets (King)', category: 'Linens', quantity: 200, unit: 'Pcs', unitPrice: 35, totalValue: 7000, status: 'In Stock', lastRestocked: '2026-09-05' },
  { id: 4, itemName: 'Cooking Oil', category: 'Food & Beverage', quantity: 50, unit: 'Liters', unitPrice: 8, totalValue: 400, status: 'In Stock', lastRestocked: '2026-09-12' },
  { id: 5, itemName: 'Light Bulbs (LED)', category: 'Maintenance', quantity: 0, unit: 'Pcs', unitPrice: 5, totalValue: 0, status: 'Out of Stock', lastRestocked: '2026-07-20' },
  { id: 6, itemName: 'Hand Soap', category: 'Toiletries', quantity: 180, unit: 'Bottles', unitPrice: 3, totalValue: 540, status: 'In Stock', lastRestocked: '2026-09-08' },
  { id: 7, itemName: 'Pillow Cases', category: 'Linens', quantity: 25, unit: 'Pcs', unitPrice: 10, totalValue: 250, status: 'Low Stock', lastRestocked: '2026-08-15' },
  { id: 8, itemName: 'Fresh Vegetables', category: 'Food & Beverage', quantity: 75, unit: 'Kg', unitPrice: 6, totalValue: 450, status: 'In Stock', lastRestocked: '2026-09-16' },
  { id: 9, itemName: 'Cleaning Detergent', category: 'Maintenance', quantity: 40, unit: 'Liters', unitPrice: 15, totalValue: 600, status: 'In Stock', lastRestocked: '2026-09-11' },
  { id: 10, itemName: 'Toilet Paper', category: 'Toiletries', quantity: 500, unit: 'Rolls', unitPrice: 1.5, totalValue: 750, status: 'In Stock', lastRestocked: '2026-09-14' },
];

export const mockMonthlyStockLevels = [
  { name: 'Jan', linens: 4200, toiletries: 2800, foodBeverage: 3600, maintenance: 1800 },
  { name: 'Feb', linens: 3900, toiletries: 3100, foodBeverage: 3200, maintenance: 2100 },
  { name: 'Mar', linens: 4500, toiletries: 2600, foodBeverage: 4000, maintenance: 1600 },
  { name: 'Apr', linens: 4100, toiletries: 3400, foodBeverage: 3800, maintenance: 2200 },
  { name: 'May', linens: 3800, toiletries: 2900, foodBeverage: 4200, maintenance: 1900 },
  { name: 'Jun', linens: 4600, toiletries: 3200, foodBeverage: 3500, maintenance: 2400 },
  { name: 'Jul', linens: 4300, toiletries: 3000, foodBeverage: 4100, maintenance: 2000 },
  { name: 'Aug', linens: 4700, toiletries: 3500, foodBeverage: 3900, maintenance: 2300 },
];

export const mockMonthlyExpenseData = [
  { name: 'Jan', utilities: 3200, maintenance: 2100, salaries: 15000, supplies: 1800, foodBeverage: 4500, total: 26600 },
  { name: 'Feb', utilities: 2800, maintenance: 1800, salaries: 15000, supplies: 2200, foodBeverage: 4200, total: 26000 },
  { name: 'Mar', utilities: 3100, maintenance: 2500, salaries: 15500, supplies: 1500, foodBeverage: 5000, total: 27600 },
  { name: 'Apr', utilities: 3500, maintenance: 1600, salaries: 15500, supplies: 1900, foodBeverage: 4800, total: 27300 },
  { name: 'May', utilities: 2900, maintenance: 2800, salaries: 16000, supplies: 2100, foodBeverage: 4600, total: 28400 },
  { name: 'Jun', utilities: 3800, maintenance: 2200, salaries: 16000, supplies: 1700, foodBeverage: 5200, total: 28900 },
  { name: 'Jul', utilities: 4200, maintenance: 1900, salaries: 16500, supplies: 2400, foodBeverage: 5500, total: 30500 },
  { name: 'Aug', utilities: 4000, maintenance: 2400, salaries: 16500, supplies: 2000, foodBeverage: 5100, total: 30000 },
];

export const mockRevenueData = [
  { name: 'Jan', rooms: 28000, foodBeverage: 8500, spa: 3200, events: 5000, other: 1200, total: 45900 },
  { name: 'Feb', rooms: 25000, foodBeverage: 7800, spa: 2800, events: 3500, other: 1000, total: 40100 },
  { name: 'Mar', rooms: 32000, foodBeverage: 9200, spa: 3600, events: 6500, other: 1500, total: 52800 },
  { name: 'Apr', rooms: 30000, foodBeverage: 8800, spa: 3400, events: 4200, other: 1300, total: 47700 },
  { name: 'May', rooms: 27000, foodBeverage: 8200, spa: 3000, events: 5800, other: 1100, total: 45100 },
  { name: 'Jun', rooms: 35000, foodBeverage: 10500, spa: 4200, events: 7000, other: 1800, total: 58500 },
  { name: 'Jul', rooms: 38000, foodBeverage: 11200, spa: 4800, events: 8500, other: 2000, total: 64500 },
  { name: 'Aug', rooms: 36000, foodBeverage: 10800, spa: 4500, events: 7200, other: 1900, total: 60400 },
];

export const mockMonthlyOccupancyData = [
  { name: 'Jan', occupancyRate: 62, occupied: 93, available: 47, maintenance: 10 },
  { name: 'Feb', occupancyRate: 58, occupied: 87, available: 53, maintenance: 10 },
  { name: 'Mar', occupancyRate: 71, occupied: 107, available: 33, maintenance: 10 },
  { name: 'Apr', occupancyRate: 68, occupied: 102, available: 38, maintenance: 10 },
  { name: 'May', occupancyRate: 65, occupied: 98, available: 42, maintenance: 10 },
  { name: 'Jun', occupancyRate: 78, occupied: 117, available: 23, maintenance: 10 },
  { name: 'Jul', occupancyRate: 85, occupied: 128, available: 12, maintenance: 10 },
  { name: 'Aug', occupancyRate: 82, occupied: 123, available: 17, maintenance: 10 },
];

export const mockExpenseVsRevenueData = [
  { name: 'Jan', revenue: 45900, expense: 26600, netProfit: 19300, profitMargin: 42.0 },
  { name: 'Feb', revenue: 40100, expense: 26000, netProfit: 14100, profitMargin: 35.2 },
  { name: 'Mar', revenue: 52800, expense: 27600, netProfit: 25200, profitMargin: 47.7 },
  { name: 'Apr', revenue: 47700, expense: 27300, netProfit: 20400, profitMargin: 42.8 },
  { name: 'May', revenue: 45100, expense: 28400, netProfit: 16700, profitMargin: 37.0 },
  { name: 'Jun', revenue: 58500, expense: 28900, netProfit: 29600, profitMargin: 50.6 },
  { name: 'Jul', revenue: 64500, expense: 30500, netProfit: 34000, profitMargin: 52.7 },
  { name: 'Aug', revenue: 60400, expense: 30000, netProfit: 30400, profitMargin: 50.3 },
];
