const fs = require('fs');
const file = 'Client/src/layouts/DashboardLayout/AppBreadcrumbs.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("'edit': 'Edit Booking'")) {
    content = content.replace("'new': 'Add New Booking',", "'new': 'Add New Booking',\n    'edit': 'Edit Booking',");
    fs.writeFileSync(file, content, 'utf8');
    console.log('Patched AppBreadcrumbs.jsx');
}
