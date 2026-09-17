const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const correctArrays = `
  const frontOfficeSubItems = [
    { label: 'Operations Alerts', id: 'operations-alerts', path: '/front-office/operations-alerts' },
    { label: 'Check-in/Check-out', id: 'check-in-out', path: '/front-office/check-in-out' },
    { label: 'Guest Complaint', id: 'guest-complaint', path: '/front-office/guest-complaint' },
  ];

  const reservationSubItems = [
    { label: 'All Booking', id: 'all-bookings', path: '/reservation/all' },
    { label: 'Add Booking', id: 'add-booking', path: '/reservation/new' },
    { label: 'Edit Booking', id: 'edit-booking', path: '/reservation/edit' },
    { label: 'Cancel Booking', id: 'cancel-booking', path: '/reservation/cancelled' },
    { label: 'Group Booking', id: 'group-booking', path: '/reservation/group' },
  ];

  const roomsSubItems = [
    { label: 'All Rooms', id: 'all-rooms', path: '/rooms' },
    { label: 'Room Types', id: 'room-types', path: '/rooms/room-types' },
    { label: 'Add Room', id: 'add-room', path: '/rooms/new' },
  ];

  const housekeepingSubItems = [
    { label: 'Room Cleaning', id: 'rooms-cleaning', path: '/housekeeping/rooms-cleaning' },
    { label: 'Cleaning Schedule', id: 'cleaning-schedule', path: '/housekeeping/cleaning-schedule' },
    { label: 'Lost and Found', id: 'lost-and-found', path: '/housekeeping/lost-and-found' },
    { label: 'Inspection Checklist', id: 'inspection-checklist', path: '/housekeeping/inspection-checklist' },
  ];
`;

// Find where `const frontOfficeSubItems = [` starts.
const startIndex = content.indexOf('  const frontOfficeSubItems = [');

// Find where `];` ends for the last array (which is currently reservationSubItems containing the housekeeping stuff)
// Wait, we can just replace everything from `const frontOfficeSubItems` up to `const handleToggleRooms = () => {`
const endIndex = content.indexOf('  const handleToggleRooms = () => {');

if (startIndex !== -1 && endIndex !== -1) {
    content = content.substring(0, startIndex) + correctArrays + "\n" + content.substring(endIndex);
    fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);
    console.log("Success");
} else {
    console.log("Failed to find bounds", { startIndex, endIndex });
}
