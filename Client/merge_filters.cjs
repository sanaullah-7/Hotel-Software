const fs = require('fs');
let content = fs.readFileSync('src/pages/Occupancy/Occupancy.jsx', 'utf8');

const regex = /\{\/\* SEARCH AND FILTERS ROW[\s\S]*?<div className="flex flex-nowrap gap-2 mt-2 pb-1 items-end w-full overflow-x-auto \[&::-webkit-scrollbar\]:hidden \[-ms-overflow-style:none\] \[scrollbar-width:none\]">([\s\S]*?)<\/div>\s*\{\/\* ROOM CARDS \*\/\}[\s\S]*?\{\/\* Table Header \*\/\}[\s\S]*?<div className="p-3 flex items-center justify-between border-b border-gray-100">([\s\S]*?)<\/div>\s*\{\/\* Table \*\/\}/;

const match = content.match(regex);
if (match) {
    const filtersInner = match[1].trim();
    // Match 2 is the inside of the Table Header (title + icons)
    const iconsInner = `<div className="flex items-center gap-2">
              <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><FilterAltOffIcon sx={{ fontSize: 16 }} /></button>
              <button className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"><VisibilityIcon sx={{ fontSize: 16 }} /></button>
            </div>`;

    const newHeader = `{/* ROOM CARDS & TABLE */}
        <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-4">
          {/* Table Header with Filters */}
          <div className="p-2.5 flex items-center justify-between border-b border-gray-100 gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex flex-nowrap items-center gap-3 shrink-0">
              <h1 className="text-[16px] font-bold text-gray-700 whitespace-nowrap pl-1">Occupancy List</h1>
              <div className="w-px h-6 bg-gray-200 mx-1"></div> {/* Divider */}
              ${filtersInner}
            </div>
            
            <div className="shrink-0">
              ${iconsInner}
            </div>
          </div>

          {/* Table */}`;

    content = content.replace(regex, newHeader);
    fs.writeFileSync('src/pages/Occupancy/Occupancy.jsx', content, 'utf8');
    console.log('Successfully merged filters into table header!');
} else {
    console.log('No match found.');
}
