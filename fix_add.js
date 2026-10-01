const fs = require('fs');
const file = 'Client/src/features/reservations/pages/AddReservation.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("    navigate\n   };\n", "    navigate('/reservation/all');\n   };\n");

fs.writeFileSync(file, content, 'utf8');
