const fs = require('fs');

let sidebar = fs.readFileSync('src/layouts/DashboardLayout/Sidebar.jsx', 'utf8');

if (!sidebar.includes('/audit-log')) {
  // Add History icon
  sidebar = sidebar.replace(
    'AutoAwesome as AssistantIcon,',
    `AutoAwesome as AssistantIcon,\n  HistoryToggleOff as AuditIcon,`
  );

  // Add path active check
  sidebar = sidebar.replace(
    'const isAssistantActive = pathname.startsWith(\'/ai-assistant\');',
    `const isAuditActive = pathname.startsWith('/audit-log');\n  const isAssistantActive = pathname.startsWith('/ai-assistant');`
  );

  // Add navigation item between Reports and AI Assistant
  sidebar = sidebar.replace(
    '{/* AI Assistant */}',
    `{/* Audit Log */}
          <li>
            <Link
              to="/audit-log"
              title={!isOpen ? 'Audit Log' : undefined}
              className={\`flex items-center px-2.5 py-2 rounded-xl transition-all duration-200 group \${
                isAuditActive
                  ? 'bg-[#dcefe5] text-[var(--primary-main)]'
                  : 'hover:bg-[#dcefe5] text-gray-600 hover:text-[#1b7f43]'
              } \${isOpen ? 'justify-between' : 'justify-center'}\`}
            >
              <div className="flex items-center min-w-0">
                <div
                  className={\`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 \${
                    isAuditActive
                      ? 'bg-[#cce7d6] text-[var(--primary-main)]'
                      : 'text-gray-400 group-hover:bg-[#cce7d6] group-hover:text-[#1b7f43]'
                  }\`}
                >
                  <AuditIcon sx={{ fontSize: 19 }} />
                </div>

                <span
                  className={\`ml-3 text-[13.5px] whitespace-nowrap transition-opacity duration-200 \${
                    isOpen ? 'opacity-100 block truncate' : 'opacity-0 hidden'
                  } \${
                    isAuditActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-600 group-hover:text-gray-900 font-medium'
                  }\`}
                >
                  Audit Log
                </span>
              </div>
            </Link>
          </li>

          {/* AI Assistant */}`
  );

  fs.writeFileSync('src/layouts/DashboardLayout/Sidebar.jsx', sidebar, 'utf8');
}
