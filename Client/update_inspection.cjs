const fs = require('fs');
let file = 'src/pages/Housekeeping/InspectionChecklist.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add getStatusBorderColor helper
    if (!content.includes('getStatusBorderColor')) {
        let newHelper = "  const getStatusBorderColor = (status) => {\n" +
                        "    switch (status) {\n" +
                        "      case 'Passed': return '#16a34a';\n" +
                        "      case 'Failed': return '#ef4444';\n" +
                        "      case 'Pending': return '#f97316';\n" +
                        "      default: return '#9ca3af';\n" +
                        "    }\n" +
                        "  };\n\n" +
                        "  const getStatusStyles = (status) => {";
        content = content.replace('const getStatusStyles = (status) => {', newHelper);
    }

    // 2. Change grid
    content = content.replace('className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"');
    
    // 3. Update the card container
    content = content.replace(/className="bg-white rounded-\[6px\] shadow-sm border border-gray-100 p-5 flex flex-col relative"/g, 'className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-3.5 flex flex-col relative h-fit border-t-[4px]" style={{ borderTopColor: getStatusBorderColor(record.status) }}');
    content = content.replace(/className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative"/g, 'className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-3.5 flex flex-col relative h-fit border-t-[4px]" style={{ borderTopColor: getStatusBorderColor(record.status) }}');

    // 4. Update margins and internal paddings
    content = content.replace(/className="flex items-start justify-between mb-4"/g, 'className="flex items-start justify-between mb-2.5"');
    content = content.replace(/className="border-t border-gray-50 pt-4 space-y-4 flex-1"/g, 'className="border-t border-gray-50 pt-2.5 space-y-2.5"');
    content = content.replace(/className="border-t border-gray-50 pt-4 space-y-4"/g, 'className="border-t border-gray-50 pt-2.5 space-y-2.5"');
    content = content.replace(/className="flex gap-3 items-start"/g, 'className="flex gap-2.5 items-start"');
    
    content = content.replace(/className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-50"/g, 'className="flex items-center justify-end gap-3 mt-2.5 pt-2.5 border-t border-gray-50"');
    
    // Decrease margin top for values
    content = content.replace(/className="text-\[13px\] font-bold text-gray-700 mt-0\.5"/g, 'className="text-[13px] font-bold text-gray-700"');
    content = content.replace(/className="text-\[13px\] font-medium text-gray-500 italic mt-0\.5 line-clamp-2"/g, 'className="text-[13px] font-medium text-gray-500 italic line-clamp-2"');
    content = content.replace(/className=\{	ext-\[14px\] font-black mt-1 \$\{getScoreColor\(record\.status\)\}\}/g, 'className={	ext-[14px] font-black }');

    // 5. Add 4 more items to initialInspections
    if (!content.includes("roomNo: '305'")) {
        const newItems = ",\n" +
        "  {\n" +
        "    id: 5,\n" +
        "    roomNo: '305',\n" +
        "    roomType: 'Suite',\n" +
        "    inspector: 'John Smith',\n" +
        "    status: 'Passed',\n" +
        "    inspectionDate: '2026-02-04',\n" +
        "    score: 98,\n" +
        "    comments: 'Perfect condition, minibar restocked.'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 6,\n" +
        "    roomNo: '110',\n" +
        "    roomType: 'Deluxe',\n" +
        "    inspector: 'Jane Doe',\n" +
        "    status: 'Failed',\n" +
        "    inspectionDate: '2026-02-03',\n" +
        "    score: 55,\n" +
        "    comments: 'Carpet needs vacuuming, missing towels.'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 7,\n" +
        "    roomNo: '402',\n" +
        "    roomType: 'Standard',\n" +
        "    inspector: 'Mike Ross',\n" +
        "    status: 'Pending',\n" +
        "    inspectionDate: '2026-02-05',\n" +
        "    score: 0,\n" +
        "    comments: 'Scheduled for tomorrow morning.'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 8,\n" +
        "    roomNo: '215',\n" +
        "    roomType: 'Suite',\n" +
        "    inspector: 'Sarah Connor',\n" +
        "    status: 'Passed',\n" +
        "    inspectionDate: '2026-02-01',\n" +
        "    score: 92,\n" +
        "    comments: 'Very clean, all amenities present.'\n" +
        "  }";
        
        content = content.replace(/comments: 'Awaiting inspector availability.'\s*\}\s*\];/, "comments: 'Awaiting inspector availability.'\n  }" + newItems + "\n];");
    }

    fs.writeFileSync(file, content);
    console.log('Updated InspectionChecklist.jsx');
}
