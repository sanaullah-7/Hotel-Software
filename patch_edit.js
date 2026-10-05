const fs = require('fs');
const file = 'Client/src/features/reservations/pages/AllReservations.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace openEditModal
const editReplacement = `
  const openEditModal = (booking) => {
    navigate('/reservation/edit/' + booking.id);
  };
`;
content = content.replace(/const openEditModal = \(booking\) => {[\s\S]*?setIsBookingModalOpen\(true\);\s*setActiveMenuId\(null\);\s*};/, editReplacement.trim());

fs.writeFileSync(file, content, 'utf8');
console.log('Patched AllReservations.jsx openEditModal');
