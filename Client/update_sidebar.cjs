const fs = require('fs');
let content = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

const roomsOld =   const roomsSubItems = [
    { label: 'All Rooms', id: 'all-rooms', path: '/rooms' },
    { label: 'Room Types', id: 'room-types', path: '/rooms/room-types' },
    { label: 'Add Room', id: 'add-room', path: '/rooms/new' },
  ];;

const roomsNew =   const roomsSubItems = [
    { label: 'All Rooms', id: 'all-rooms', path: '/rooms' },
    { label: 'Room Types', id: 'room-types', path: '/rooms/room-types' },
    { label: 'Rate & Pricing', id: 'rate-pricing', path: '/rooms/rate-pricing' },
    { label: 'Add Room', id: 'add-room', path: '/rooms/new' },
  ];;

content = content.replace(roomsOld, roomsNew);

fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', content);
console.log('Sidebar updated');
