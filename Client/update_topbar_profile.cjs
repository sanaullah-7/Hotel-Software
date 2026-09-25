const fs = require('fs');
let file = 'src/layouts/DashboardLayout/Topbar.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/navigate\('\/admin\/profile'\)/g, "navigate('/settings/hotel-profile')");
fs.writeFileSync(file, content, 'utf8');
