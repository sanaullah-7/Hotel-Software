const fs = require('fs');
let content = fs.readFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx', 'utf8');

// Replace all sortable th patterns with plain static headers
// Pattern: onClick + cursor-pointer + hover class + sort icon block ? just plain th with label

// Replace the className that has cursor-pointer/hover styles
content = content.replace(/onClick=\{.*?handleSort\(["'][^"']+["']\)\}\s*/g, '');
content = content.replace(/className="py-3\.5 px-3 cursor-pointer hover:text-\[#5d5fef\] transition-colors"/g, 'className="py-3.5 px-3"');
content = content.replace(/className="py-3\.5 px-3 cursor-pointer hover:text-\[#1b7f43\] transition-colors"/g, 'className="py-3.5 px-3"');

// Remove the sort icon blocks: {sortField === "xxx" ? (...) : (...)} 
// These are inside <div className="flex items-center gap-1">
content = content.replace(/\{sortField === ["'][^"']+["'] \? \(\s*sortOrder === ["']asc["'] \? \(\s*<ArrowUpwardIcon[^/]*\/>\s*\) : \(\s*<ArrowDownwardIcon[^/]*\/>\s*\)\s*\) : \(\s*<span className="text-slate-300 text-xs">[^<]*<\/span>\s*\)\}/g, '');

// Clean up leftover <div className="flex items-center gap-1"> that now just wrap a <span> — replace with just the span directly
content = content.replace(/<div className="flex items-center gap-1">\s*<span>([^<]+)<\/span>\s*<\/div>/g, '<span>$1</span>');

fs.writeFileSync('Client/src/pages/HR/Attendance/TodaysAttendance/AttendanceTable.jsx', content, 'utf8');
console.log('Done. sortField refs remaining:', (content.match(/sortField/g) || []).length);
