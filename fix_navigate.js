const fs = require('fs');
const file = 'Client/src/features/reservations/pages/AddReservation.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/navigate\n\s*};\n\s*const muiInputSx/, "navigate('/reservation/all');\n   };\n\n   const muiInputSx");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed navigate call in AddReservation.jsx');
