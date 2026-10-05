const fs = require('fs');
const file = 'Client/src/features/reservations/pages/AddReservation.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/navigate\r?\n\s*\};/, "navigate('/reservation/all');\n   };");

fs.writeFileSync(file, content, 'utf8');
