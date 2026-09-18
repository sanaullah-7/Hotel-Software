const fs = require('fs');
let content = fs.readFileSync('src/pages/Occupancy/Occupancy.jsx', 'utf8');

content = content.replace(/className="flex flex-nowrap gap-2 mt-2 mb-2 items-end w-full overflow-x-auto hide-scrollbar"/, 'className="flex flex-nowrap gap-2 mt-2 pb-1 items-end w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"');

fs.writeFileSync('src/pages/Occupancy/Occupancy.jsx', content);
console.log('Updated scrollbar classes');
