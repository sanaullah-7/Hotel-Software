const fs = require('fs');
let content = fs.readFileSync('Client/src/layouts/DashboardLayout/DashboardLayout.jsx', 'utf8');

// Add import
if (!content.includes('useData')) {
  content = content.replace(
    "import { useAuth } from '../../context/AuthContext';",
    "import { useAuth } from '../../context/AuthContext';\nimport { useData } from '../../context/DataProvider';"
  );
}

// Add hook
if (!content.includes('const { isDataLoaded } = useData();')) {
  content = content.replace(
    "const { isAuthenticated, isLoading } = useAuth();",
    "const { isAuthenticated, isLoading } = useAuth();\n  const { isDataLoaded } = useData();"
  );
}

// Update if (isLoading)
content = content.replace(
  "if (isLoading) {",
  "if (isLoading || (isAuthenticated && !isDataLoaded)) {"
);

content = content.replace(
  "<p className=\"text-sm font-medium text-gray-500\">Verifying session...</p>",
  "<p className=\"text-sm font-medium text-gray-500\">{isLoading ? 'Verifying session...' : 'Loading system data...'}</p>"
);

fs.writeFileSync('Client/src/layouts/DashboardLayout/DashboardLayout.jsx', content);
