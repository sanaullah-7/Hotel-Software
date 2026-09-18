const fs = require('fs');

const filesToFix = [
  'Client/src/pages/FrontOffice/GuestComplaint.jsx',
  'Client/src/pages/Reservation/AllReservations.jsx',
  'Client/src/pages/Rooms/Rooms.jsx',
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // GuestComplaint.jsx
    if (file.includes('GuestComplaint.jsx')) {
       content = content.replace(/import Search from "@mui\/icons-material\/Search";\r?\n/g, '');
       content = content.replace(/import Person from "@mui\/icons-material\/Person";\r?\n/g, '');
    }
    
    // AllReservations.jsx
    if (file.includes('AllReservations.jsx')) {
       content = content.replace(/import Search from "@mui\/icons-material\/Search";\r?\n/g, '');
       content = content.replace(/import \{ Menu, MenuItem, IconButton, Popover \} from "@mui\/material";\r?\n/g, 'import { Menu, IconButton, Popover } from "@mui/material";\n');
    }
    
    // Rooms.jsx
    if (file.includes('Rooms.jsx')) {
       content = content.replace(/import Search from "@mui\/icons-material\/Search";\r?\n/g, '');
    }

    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Fixed final final');
