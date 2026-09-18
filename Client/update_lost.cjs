const fs = require('fs');
let file = 'src/pages/Housekeeping/LostAndFound.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add getStatusBorderColor helper
    if (!content.includes('getStatusBorderColor')) {
        let newHelper = "  const getStatusBorderColor = (status) => {\n" +
                        "    switch (status) {\n" +
                        "      case 'Found': return '#3b82f6';\n" +
                        "      case 'Returned': return '#16a34a';\n" +
                        "      case 'Claimed': return '#ea580c';\n" +
                        "      case 'Disposed': return '#64748b';\n" +
                        "      default: return '#9ca3af';\n" +
                        "    }\n" +
                        "  };\n\n" +
                        "  const getStatusStyles = (status) => {";
        content = content.replace('const getStatusStyles = (status) => {', newHelper);
    }

    // 2. Change grid
    content = content.replace('className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"');
    
    // 3. Update the card container to have the top border and exact paddings
    content = content.replace(/className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative"/g, 'className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-3.5 flex flex-col relative border-t-[4px]" style={{ borderTopColor: getStatusBorderColor(item.status) }}');

    // 4. Update margins and internal paddings
    content = content.replace(/className="flex items-start justify-between mb-4"/g, 'className="flex items-start justify-between mb-2.5"');
    content = content.replace(/className="border-t border-gray-50 pt-4 space-y-4 flex-1 mt-2"/g, 'className="border-t border-gray-50 pt-2.5 space-y-2.5 flex-1 mt-1"');
    content = content.replace(/className="flex gap-3 items-start"/g, 'className="flex gap-2.5 items-start"');
    content = content.replace(/className="text-\[13px\] font-bold text-gray-700 mt-0\.5"/g, 'className="text-[13px] font-bold text-gray-700"');
    content = content.replace(/className="text-\[13px\] font-medium text-gray-500 italic mt-0\.5 line-clamp-2"/g, 'className="text-[13px] font-medium text-gray-500 italic line-clamp-2"');

    // 5. Add 4 more items to initialItems
    if (!content.includes("itemName: 'Silver Watch'")) {
        const newItems = ",\n" +
        "  {\n" +
        "    id: 5,\n" +
        "    itemName: 'Silver Watch',\n" +
        "    location: 'Gym',\n" +
        "    status: 'Found',\n" +
        "    foundDate: '2026-02-05',\n" +
        "    finderName: 'Alice Green',\n" +
        "    description: 'Men\\'s silver wristwatch'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 6,\n" +
        "    itemName: 'Black Backpack',\n" +
        "    location: 'Lobby',\n" +
        "    status: 'Claimed',\n" +
        "    foundDate: '2026-02-04',\n" +
        "    finderName: 'David Lee',\n" +
        "    description: 'Contains books and a water bottle'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 7,\n" +
        "    itemName: 'Diamond Ring',\n" +
        "    location: '402',\n" +
        "    status: 'Returned',\n" +
        "    foundDate: '2026-02-01',\n" +
        "    finderName: 'Sarah Connor',\n" +
        "    description: 'Gold ring with small diamond'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 8,\n" +
        "    itemName: 'Winter Coat',\n" +
        "    location: 'Restaurant',\n" +
        "    status: 'Disposed',\n" +
        "    foundDate: '2025-11-20',\n" +
        "    finderName: 'Tom White',\n" +
        "    description: 'Unclaimed over 60 days'\n" +
        "  }";
        
        content = content.replace(/description: 'Brown leather wallet with ID cards'\s*\}\s*\];/, "description: 'Brown leather wallet with ID cards'\n  }" + newItems + "\n];");
    }

    fs.writeFileSync(file, content);
    console.log('Updated LostAndFound.jsx');
}
