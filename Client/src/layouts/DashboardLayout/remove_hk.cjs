const fs = require('fs');
let content = fs.readFileSync('Sidebar.backup.jsx', 'utf8');

// Remove import
content = content.replace(/\s*CleaningServices as HousekeepingIcon,/g, '');

// Remove path/states
content = content.replace(/\s*const isHousekeepingPath = location\.pathname\.startsWith\('\/housekeeping'\);/g, '');
content = content.replace(/\s*const \[isHousekeepingOpen, setIsHousekeepingOpen\] = useState\(isHousekeepingPath\);/g, '');
content = content.replace(/\s*const isHousekeepingActive = isHousekeepingPath;/g, '');
content = content.replace(/\s*const housekeepingSubItems = \[[\s\S]*?\];/g, '');

// Remove handle
content = content.replace(/\s*const handleToggleHousekeeping = \(\) => \{[\s\S]*?\};\n/g, '');

// Remove UI block
content = content.replace(/\s*\{\/\* Housekeeping Dropdown Menu Item \*\/\}[\s\S]*?\{\/\* Rooms Module \*\/\}/g, '\n\n          {/* Rooms Module */}');

fs.writeFileSync('Sidebar.jsx', content);
