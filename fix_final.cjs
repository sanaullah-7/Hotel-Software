const fs = require('fs');
['Client/src/pages/FrontOffice/GuestComplaint.jsx', 'Client/src/pages/Reservation/AllReservations.jsx', 'Client/src/pages/FrontOffice/OperationsAlerts.jsx', 'Client/src/pages/Housekeeping/RoomsAndCleaning.jsx', 'Client/src/pages/Occupancy/Occupancy.jsx', 'Client/src/pages/FrontOffice/CheckInOut.jsx', 'Client/src/pages/Rooms/Rooms.jsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import React, \{ useState \} from [\'"]react[\'"];\r?\n/g, '');
    content = content.replace(/import Search from "@mui\/icons-material\/Search";\r?\n/g, '');
    content = content.replace(/import Person from "@mui\/icons-material\/Person";\r?\n/g, '');
    content = content.replace(/import \{ IconButton, Menu, MenuItem, Dialog, Select, FormControl, InputLabel \} from "@mui\/material";\r?\n/g, 'import { IconButton, Menu, Dialog } from "@mui/material";\n');
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Final fixes');
