const fs = require('fs');
let content = fs.readFileSync('src/pages/Occupancy/Occupancy.jsx', 'utf8');

// 1. Fix the flex wrap issue on the filters row
content = content.replace(
  '<div className="flex flex-wrap gap-2 mt-2 items-end w-full">',
  '<div className="flex flex-nowrap gap-2 mt-2 pb-1 items-end w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">'
);

// 2. Remove the extra search input from the table header
const oldHeaderRegex = /<h1 className="text-\[16px\] font-bold text-gray-700">Occupancy List<\/h1>[\s\S]*?<SearchIcon[^>]*>[\s\S]*?<\/div>/;
content = content.replace(oldHeaderRegex, '<h1 className="text-[16px] font-bold text-gray-700">Occupancy List</h1>');

fs.writeFileSync('src/pages/Occupancy/Occupancy.jsx', content, 'utf8');
console.log('Occupancy.jsx filters fixed to one line and duplicate search removed.');
