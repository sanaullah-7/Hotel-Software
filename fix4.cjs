const fs = require('fs');
let file = 'Client/src/layouts/DashboardLayout/Sidebar.jsx';
let content = fs.readFileSync(file, 'utf8');
let lines = content.split('\n');

// we want to remove lines 596, 597, 598 (0-indexed 595, 596, 597)
lines.splice(595, 3);
content = lines.join('\n');

fs.writeFileSync(file, content, 'utf8');
