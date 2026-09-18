const fs = require('fs');
let file = 'Client/src/pages/Reservation/AllReservations.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import Search from \'@mui\/icons-material\/Search\';\r?\n/g, '');
content = content.replace(/import \{\s*Menu,\s*MenuItem,\s*IconButton,\s*Popover\s*\} from \'@mui\/material\';\r?\n/g, 'import { Menu, IconButton, Popover } from \'@mui/material\';\n');
content = content.replace(/import Search from \"@mui\/icons-material\/Search\";\r?\n/g, '');
content = content.replace(/import \{\s*Menu,\s*MenuItem,\s*IconButton,\s*Popover\s*\} from \"@mui\/material\";\r?\n/g, 'import { Menu, IconButton, Popover } from \"@mui/material\";\n');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed');
