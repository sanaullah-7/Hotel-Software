const fs = require('fs');
let content = fs.readFileSync('src/pages/Occupancy/Occupancy.jsx', 'utf8');

// 1. Remove Occupancy List heading and divider
const headingRegex = /<h1 className="text-\[16px\] font-bold text-gray-700 whitespace-nowrap pl-1">Occupancy List<\/h1>\s*<div className="w-px h-6 bg-gray-200 mx-1"><\/div> \{\/\* Divider \*\/\}/g;
content = content.replace(headingRegex, '');

// 2. Change gap-3 to gap-2 in the wrapper
const wrapperRegex = /<div className="flex flex-nowrap items-center gap-3 shrink-0">/g;
content = content.replace(wrapperRegex, '<div className="flex flex-nowrap items-center gap-2 shrink-0">');

// 3. Make Searchbar smaller (replace minWidth: 200, flexBasis: 200, flexGrow: 1, maxWidth: 320 with smaller values)
const searchSxRegex = /minWidth:\s*200,\s*flexBasis:\s*200,\s*flexGrow:\s*1,\s*maxWidth:\s*320/g;
content = content.replace(searchSxRegex, "minWidth: 140, flexBasis: 140, maxWidth: 160");

// 4. Also ensure other elements are properly aligned. The filters inside already use flex layout. 
// They had `items-end` originally. Let's make sure they look good. The current wrapper has `items-center`.
// Let's replace the `flex flex-nowrap items-center gap-2 shrink-0` with `flex flex-nowrap items-end gap-2 shrink-0` to align inputs properly if they have floating labels.
const itemsCenterRegex = /<div className="flex flex-nowrap items-center gap-2 shrink-0">/g;
content = content.replace(itemsCenterRegex, '<div className="flex flex-nowrap items-end gap-2 shrink-0">');

fs.writeFileSync('src/pages/Occupancy/Occupancy.jsx', content, 'utf8');
console.log('Occupancy.jsx heading removed and searchbar resized successfully!');
