const fs = require('fs');
let content = fs.readFileSync('src/pages/Occupancy/Occupancy.jsx', 'utf8');

// Change flex-wrap to flex-nowrap overflow-x-auto hidden scrollbar or just flex-nowrap
content = content.replace(/className="flex flex-wrap gap-2 mt-2 items-end w-full"/, 'className="flex flex-nowrap gap-2 mt-2 mb-2 items-end w-full overflow-x-auto hide-scrollbar"');

// Reduce minWidths
content = content.replace(/sx=\{\{ minWidth: 200, flexBasis: 200, flexGrow: 1, maxWidth: 320,/g, 'sx={{ minWidth: 140, flexBasis: 140, flexGrow: 1, maxWidth: 220,');
content = content.replace(/sx=\{\{ minWidth: 125,/g, 'sx={{ minWidth: 110,');
content = content.replace(/sx=\{\{ minWidth: 130,/g, 'sx={{ minWidth: 110,');
content = content.replace(/sx=\{\{ minWidth: 110,/g, 'sx={{ minWidth: 90,');
content = content.replace(/sx=\{\{ minWidth: 120,/g, 'sx={{ minWidth: 100,');
content = content.replace(/sx=\{\{ minWidth: 135,/g, 'sx={{ minWidth: 120,');
content = content.replace(/sx=\{\{ minWidth: 140,/g, 'sx={{ minWidth: 120,');

fs.writeFileSync('src/pages/Occupancy/Occupancy.jsx', content);
console.log('Updated Occupancy filters to single row');
