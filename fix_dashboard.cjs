const fs = require('fs');
let content = fs.readFileSync('Client/src/layouts/DashboardLayout/DashboardLayout.jsx', 'utf8');

const regex = /<<<<<<< HEAD[\s\S]*?>>>>>>> origin\/shayan/;

const replacement = `        {/* Page Content Wrapper */}
        <div className="flex-1 min-h-0 px-1.5 pb-2 overflow-y-auto overflow-x-hidden">
          <div className="mb-4">
            <AppBreadcrumbs />
          </div>`;

content = content.replace(regex, replacement);

fs.writeFileSync('Client/src/layouts/DashboardLayout/DashboardLayout.jsx', content, 'utf8');
