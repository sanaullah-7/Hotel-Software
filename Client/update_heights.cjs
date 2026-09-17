const fs = require('fs');
let file = 'src/pages/Housekeeping/CleaningSchedule.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Decrease card padding
    content = content.replace(/className="bg-white rounded-\[6px\] shadow-sm border border-gray-100 p-5/g, 'className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-3.5');
    content = content.replace(/className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col/g, 'className="bg-white rounded-xl shadow-sm border border-gray-100 p-3.5 flex flex-col');

    // Decrease header margin bottom
    content = content.replace(/className="flex items-start justify-between mb-4"/g, 'className="flex items-start justify-between mb-2.5"');

    // Decrease divider padding and space-y
    content = content.replace(/className="border-t border-gray-50 pt-4 space-y-4 flex-1"/g, 'className="border-t border-gray-50 pt-2.5 space-y-2.5 flex-1"');

    // Decrease margin top for values
    content = content.replace(/className="text-\[13px\] font-bold text-gray-700 mt-0\.5"/g, 'className="text-[13px] font-bold text-gray-700"');
    content = content.replace(/className="text-\[13px\] font-medium text-gray-500 italic mt-0\.5 line-clamp-2"/g, 'className="text-[13px] font-medium text-gray-500 italic line-clamp-2"');
    content = content.replace(/className=\{	ext-\[13px\] font-bold mt-0\.5 \$\{getPriorityColor\(task\.priority\)\}\}/g, 'className={	ext-[13px] font-bold }');

    // Decrease internal item gap
    content = content.replace(/className="flex gap-3 items-start"/g, 'className="flex gap-2.5 items-start"');

    fs.writeFileSync(file, content);
    console.log('Updated card heights in CleaningSchedule.jsx');
}
