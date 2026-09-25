const fs = require('fs');

let routes = fs.readFileSync('src/routes/AppRoutes.jsx', 'utf8');

if (!routes.includes('AuditLog')) {
  // Import
  routes = routes.replace(
    '// Settings Module Pages',
    `import AuditLog from '../features/audit/pages/AuditLog';\n// Settings Module Pages`
  );

  // Route
  routes = routes.replace(
    '{/* Settings Sub-Routes */}',
    `<Route path="/audit-log" element={<DashboardLayout><AuditLog /></DashboardLayout>} />\n        {/* Settings Sub-Routes */}`
  );
  
  fs.writeFileSync('src/routes/AppRoutes.jsx', routes, 'utf8');
}
