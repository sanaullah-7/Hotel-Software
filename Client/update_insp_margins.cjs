const fs = require('fs');
let file = 'src/pages/Housekeeping/InspectionChecklist.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/className="text-\[12px\] text-gray-500 mt-1"/g, 'className="text-[12px] text-gray-500 mt-0.5"');
content = content.replace(/className=\{\	ext-\[16px\] font-bold mt-0\.5 \$\{getScoreColor\(record\.status\)\}\\}/g, 'className={	ext-[16px] font-bold }');
content = content.replace(/className="text-\[13px\] font-medium text-gray-600 italic mt-0\.5 line-clamp-3"/g, 'className="text-[13px] font-medium text-gray-600 italic line-clamp-3"');

fs.writeFileSync(file, content);
