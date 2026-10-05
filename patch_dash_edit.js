const fs = require('fs');
const file = 'Client/src/pages/Dashboard/components/CurrentBookingsTable.jsx';
let content = fs.readFileSync(file, 'utf8');

const editReplacement = `
  const openEditModal = (booking) => {
    navigate('/reservation/edit/' + booking.id);
  };
`;
content = content.replace(/const openEditModal = \(booking\) => {[\s\S]*?setIsBookingModalOpen\(true\);\s*setActiveMenuId\(null\);\s*};/, editReplacement.trim());

fs.writeFileSync(file, content, 'utf8');
console.log('Patched Dashboard openEditModal');
