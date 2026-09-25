export const initialBookings = [
  { id: 1, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=11', roomNo: '101', package: 'All inclusive', roomType: 'Delux', status: 'Cancelled', checkIn: '02/25/2023', checkOut: '02/28/2023', payment: 'Paid', email: 'john.deo@example.com', mobile: '+1 (555) 123-4567' },
  { id: 2, name: 'Sarah Smith', avatar: 'https://i.pravatar.cc/150?img=5', roomNo: '102', package: 'Business', roomType: 'Super Delux', status: 'Booked', checkIn: '02/12/2023', checkOut: '02/15/2023', payment: 'Unpaid', email: 'sarah.smith@example.com', mobile: '+1 (555) 234-5678' },
  { id: 3, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=12', roomNo: '103', package: 'All inclusive', roomType: 'Super Delux', status: 'CheckIn', checkIn: '02/25/2023', checkOut: '02/26/2023', payment: 'Paid', email: 'john.deo@example.com', mobile: '+1 (555) 123-4567' },
  { id: 4, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=33', roomNo: '104', package: 'Business', roomType: 'Delux', status: 'Cancelled', checkIn: '02/21/2023', checkOut: '02/23/2023', payment: 'Paid', email: 'jay.soni@example.com', mobile: '+1 (555) 345-6789' },
  { id: 5, name: 'Smita Parikh', avatar: 'https://i.pravatar.cc/150?img=44', roomNo: '105', package: 'All inclusive', roomType: 'Vila', status: 'CheckOut', checkIn: '02/16/2023', checkOut: '02/19/2023', payment: 'Unpaid', email: 'smita.parikh@example.com', mobile: '+1 (555) 456-7890' },
  { id: 6, name: 'Pankaj Singh', avatar: 'https://i.pravatar.cc/150?img=55', roomNo: '106', package: 'Wedding', roomType: 'Double', status: 'Booked', checkIn: '02/11/2023', checkOut: '02/14/2023', payment: 'Unpaid', email: 'pankaj.singh@example.com', mobile: '+1 (555) 567-8901' },
  { id: 7, name: 'Pankaj Singh', avatar: 'https://i.pravatar.cc/150?img=56', roomNo: '201', package: 'Business', roomType: 'Single', status: 'Booked', checkIn: '02/27/2023', checkOut: '02/28/2023', payment: 'Unpaid', email: 'pankaj.singh@example.com', mobile: '+1 (555) 567-8901' },
  { id: 8, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=34', roomNo: '202', package: 'All inclusive', roomType: 'Delux', status: 'Booked', checkIn: '02/17/2023', checkOut: '02/20/2023', payment: 'Paid', email: 'jay.soni@example.com', mobile: '+1 (555) 345-6789' },
  { id: 9, name: 'Smita Parikh', avatar: 'https://i.pravatar.cc/150?img=45', roomNo: '203', package: 'Wedding', roomType: 'Delux', status: 'CheckOut', checkIn: '02/07/2023', checkOut: '02/10/2023', payment: 'Paid', email: 'smita.parikh@example.com', mobile: '+1 (555) 456-7890' },
  { id: 10, name: 'Pooja Patel', avatar: 'https://i.pravatar.cc/150?img=22', roomNo: '204', package: 'Business', roomType: 'Super Delux', status: 'Cancelled', checkIn: '02/09/2023', checkOut: '02/12/2023', payment: 'Unpaid', email: 'pooja.patel@example.com', mobile: '+1 (555) 678-9012' },
];

export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('/')) {
    const [m, d, y] = dateStr.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};
