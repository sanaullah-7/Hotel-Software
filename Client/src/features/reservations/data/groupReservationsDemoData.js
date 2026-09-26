export const initialGroups = [
  { id: 1, groupName: 'Corporate Conference', contactPerson: 'John Smith', email: 'john.smith@company.com', phone: '1234567890', checkIn: '02/15/2024', checkOut: '02/20/2024', rooms: 15, guests: 30, status: 'Confirmed', totalPrice: '15000', roomTypes: '', specialRequests: 'Meeting room required, early check-in' },
  { id: 2, groupName: 'Wedding Party', contactPerson: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '9987654321', checkIn: '03/10/2024', checkOut: '03/12/2024', rooms: 8, guests: 20, status: 'Pending', totalPrice: '8000', roomTypes: '', specialRequests: '' },
  { id: 3, groupName: 'Family Reunion', contactPerson: 'Robert Davis', email: 'robert.davis@email.com', phone: '1122334455', checkIn: '04/05/2024', checkOut: '04/08/2024', rooms: 5, guests: 12, status: 'Confirmed', totalPrice: '4500', roomTypes: '', specialRequests: '' },
  { id: 4, groupName: 'Business Trip', contactPerson: 'Emily Chen', email: 'emily.chen@email.com', phone: '2233445566', checkIn: '02/25/2024', checkOut: '03/02/2024', rooms: 3, guests: 3, status: 'Confirmed', totalPrice: '2100', roomTypes: '', specialRequests: '' },
  { id: 5, groupName: 'Graduation Celebration', contactPerson: 'Michael Wilson', email: 'michael.wilson@email.com', phone: '3344556677', checkIn: '05/15/2024', checkOut: '05/18/2024', rooms: 6, guests: 15, status: 'Pending', totalPrice: '3600', roomTypes: '', specialRequests: '' },
  { id: 6, groupName: 'Anniversary Trip', contactPerson: 'Jennifer Brown', email: 'jennifer.brown@email.com', phone: '4455667788', checkIn: '06/10/2024', checkOut: '06/15/2024', rooms: 2, guests: 2, status: 'Confirmed', totalPrice: '3200', roomTypes: '', specialRequests: '' },
  { id: 7, groupName: 'Team Building', contactPerson: 'David Taylor', email: 'david.taylor@email.com', phone: '5566778899', checkIn: '03/20/2024', checkOut: '03/24/2024', rooms: 10, guests: 20, status: 'Confirmed', totalPrice: '6800', roomTypes: '', specialRequests: '' },
  { id: 8, groupName: 'Music Festival', contactPerson: 'Lisa Anderson', email: 'lisa.anderson@email.com', phone: '6677889900', checkIn: '07/01/2024', checkOut: '07/05/2024', rooms: 12, guests: 24, status: 'Pending', totalPrice: '7200', roomTypes: '', specialRequests: '' },
  { id: 9, groupName: 'Educational Tour', contactPerson: 'Thomas Moore', email: 'thomas.moore@email.com', phone: '7788990011', checkIn: '04/22/2024', checkOut: '04/28/2024', rooms: 20, guests: 40, status: 'Confirmed', totalPrice: '12000', roomTypes: '', specialRequests: '' },
  { id: 10, groupName: 'Retreat Workshop', contactPerson: 'Amanda White', email: 'amanda.white@email.com', phone: '8899001122', checkIn: '05/01/2024', checkOut: '05/05/2024', rooms: 7, guests: 14, status: 'Pending', totalPrice: '5600', roomTypes: '', specialRequests: '' },
];

export const statusStyles = {
  Confirmed: 'bg-[#e5f4eb] text-[#1b7f43]',
  Pending: 'bg-orange-100 text-orange-500'
};
