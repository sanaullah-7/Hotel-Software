const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const replacement = `  const reservationSubItems = [
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
  ];`;

// Remove the broken part
content = content.replace(/const reservationSubItems = \[[\s\S]*?\{ label: 'Inspection Checklist', id: 'inspection-checklist', path: '\/housekeeping\/inspection-checklist' \},\n  \];/, replacement);

fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);
