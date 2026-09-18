const fs = require('fs');
let content = fs.readFileSync('src/pages/Occupancy/Occupancy.jsx', 'utf8');

const labelStyles = 
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    color: '#6b7280',
    transform: 'translate(14px, 7px) scale(1)',
    '&.Mui-focused': { color: '#1b7f43' }
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  },;

content = content.replace(/const dateFieldSx = \{[\s\S]*?cursor: 'pointer',[\s\S]*?transition: '0\.2s',\s*\},/, 
  match => match + labelStyles);

content = content.replace(/<div className="flex flex-col gap-1">\s*<span className="text-\[10px\] font-semibold text-gray-500 pl-0\.5">\s*Check-in From\s*<\/span>\s*<TextField type="date" size="small"\s*value=\{checkInDate\} onChange=\{\(e\) => setCheckInDate\(e\.target\.value\)\}\s*sx=\{\{ minWidth: 120, \.\.\.dateFieldSx \}\}\s*\/>\s*<\/div>/, 
  '<TextField type="date" size="small" label="Check-in From" InputLabelProps={{ shrink: true }} value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} sx={{ minWidth: 120, ...dateFieldSx }} />');

content = content.replace(/<div className="flex flex-col gap-1">\s*<span className="text-\[10px\] font-semibold text-gray-500 pl-0\.5">\s*Check-out To\s*<\/span>\s*<TextField type="date" size="small"\s*value=\{checkOutDate\} onChange=\{\(e\) => setCheckOutDate\(e\.target\.value\)\}\s*sx=\{\{ minWidth: 120, \.\.\.dateFieldSx \}\}\s*\/>\s*<\/div>/, 
  '<TextField type="date" size="small" label="Check-out To" InputLabelProps={{ shrink: true }} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} sx={{ minWidth: 120, ...dateFieldSx }} />');

fs.writeFileSync('src/pages/Occupancy/Occupancy.jsx', content);
console.log('Fixed date fields');
