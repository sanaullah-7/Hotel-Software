const fs = require('fs');
let content = fs.readFileSync('Sidebar.jsx', 'utf8');

// Strip BOM
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
// Strip any other weird leading chars like 
content = content.replace(/^[^a-zA-Z]*/, '');
content = "import { useState } from 'react';\n" + content.substring(content.indexOf("import { useLocation, Link }"));

fs.writeFileSync('Sidebar.jsx', content);
