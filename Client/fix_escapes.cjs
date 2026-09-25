const fs = require('fs');

const files = [
  'src/features/settings/pages/HotelProfile.jsx',
  'src/layouts/DashboardLayout/Topbar.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(file, content, 'utf8');
}
