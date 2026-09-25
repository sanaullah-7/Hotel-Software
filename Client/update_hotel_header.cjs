const fs = require('fs');
let file = 'src/features/settings/pages/HotelProfile.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="w-9 h-9 rounded-xl bg-\[#ECFDF5\] text-\[#008000\] flex items-center justify-center shrink-0">\s*<ApartmentIcon sx={{ fontSize: 20 }} \/>\s*<\/div>\s*<div>\s*<div className="flex items-center justify-between">/m;

const replacement = `<div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#008000] flex items-center justify-center shrink-0">
   <ApartmentIcon sx={{ fontSize: 20 }} />
   </div>
   <div className="flex-1">
   <div className="flex items-center justify-between w-full">`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content, 'utf8');
