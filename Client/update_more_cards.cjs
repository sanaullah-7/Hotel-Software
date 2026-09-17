const fs = require('fs');

// 1. Update InspectionChecklist.jsx
let f1 = 'src/pages/Housekeeping/InspectionChecklist.jsx';
if (fs.existsSync(f1)) {
    let content = fs.readFileSync(f1, 'utf8');
    if (!content.includes("roomNo: '501'")) {
        const newItems = ",\n" +
        "  {\n" +
        "    id: 9,\n" +
        "    roomNo: '501',\n" +
        "    roomType: 'Penthouse',\n" +
        "    inspector: 'John Smith',\n" +
        "    status: 'Pending',\n" +
        "    inspectionDate: '2026-02-06',\n" +
        "    score: 0,\n" +
        "    comments: 'VIP arrival tomorrow, deep inspection needed.'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 10,\n" +
        "    roomNo: '105',\n" +
        "    roomType: 'Deluxe',\n" +
        "    inspector: 'Jane Doe',\n" +
        "    status: 'Passed',\n" +
        "    inspectionDate: '2026-02-02',\n" +
        "    score: 96,\n" +
        "    comments: 'Immaculate condition.'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 11,\n" +
        "    roomNo: '312',\n" +
        "    roomType: 'Standard',\n" +
        "    inspector: 'Sarah Connor',\n" +
        "    status: 'Failed',\n" +
        "    inspectionDate: '2026-02-04',\n" +
        "    score: 45,\n" +
        "    comments: 'AC not working, bathroom lights flickering.'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 12,\n" +
        "    roomNo: '418',\n" +
        "    roomType: 'Suite',\n" +
        "    inspector: 'Mike Ross',\n" +
        "    status: 'Passed',\n" +
        "    inspectionDate: '2026-02-01',\n" +
        "    score: 90,\n" +
        "    comments: 'Passed with minor marks on mirror.'\n" +
        "  }";
        
        content = content.replace(/comments: 'Very clean, all amenities present.'\s*\}\s*\];/, "comments: 'Very clean, all amenities present.'\n  }" + newItems + "\n];");
        fs.writeFileSync(f1, content);
        console.log('Added 4 to InspectionChecklist');
    }
}

// 2. Update CleaningSchedule.jsx
let f2 = 'src/pages/Housekeeping/CleaningSchedule.jsx';
if (fs.existsSync(f2)) {
    let content = fs.readFileSync(f2, 'utf8');
    if (!content.includes("roomNo: '501'")) {
        const newItems = ",\n" +
        "  {\n" +
        "    id: 9,\n" +
        "    roomNo: '501',\n" +
        "    taskType: 'Deep Clean',\n" +
        "    assignedStaff: 'Emily Davis',\n" +
        "    startTime: '08:00',\n" +
        "    endTime: '10:00',\n" +
        "    priority: 'High',\n" +
        "    status: 'In Progress',\n" +
        "    notes: 'VIP check-in today'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 10,\n" +
        "    roomNo: '312',\n" +
        "    taskType: 'Full Clean',\n" +
        "    assignedStaff: 'Robert Brown',\n" +
        "    startTime: '10:00',\n" +
        "    endTime: '11:00',\n" +
        "    priority: 'Medium',\n" +
        "    status: 'Pending',\n" +
        "    notes: 'Standard service'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 11,\n" +
        "    roomNo: '418',\n" +
        "    taskType: 'Turn Down',\n" +
        "    assignedStaff: 'Jane Smith',\n" +
        "    startTime: '18:30',\n" +
        "    endTime: '19:00',\n" +
        "    priority: 'Low',\n" +
        "    status: 'Completed',\n" +
        "    notes: 'Refresh towels'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 12,\n" +
        "    roomNo: '108',\n" +
        "    taskType: 'Quick Clean',\n" +
        "    assignedStaff: 'Michael Lee',\n" +
        "    startTime: '12:00',\n" +
        "    endTime: '12:30',\n" +
        "    priority: 'Medium',\n" +
        "    status: 'Pending',\n" +
        "    notes: 'Guest requested early'\n" +
        "  }";
        
        content = content.replace(/notes: 'Guest requested later time'\s*\}\s*\];/, "notes: 'Guest requested later time'\n  }" + newItems + "\n];");
        fs.writeFileSync(f2, content);
        console.log('Added 4 to CleaningSchedule');
    }
}

// 3. Update LostAndFound.jsx
let f3 = 'src/pages/Housekeeping/LostAndFound.jsx';
if (fs.existsSync(f3)) {
    let content = fs.readFileSync(f3, 'utf8');
    if (!content.includes("itemName: 'Laptop Charger'")) {
        const newItems = ",\n" +
        "  {\n" +
        "    id: 9,\n" +
        "    itemName: 'Laptop Charger',\n" +
        "    location: 'Conference Room',\n" +
        "    status: 'Found',\n" +
        "    foundDate: '2026-02-06',\n" +
        "    finderName: 'Maria Garcia',\n" +
        "    description: 'Black Dell 65W charger'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 10,\n" +
        "    itemName: 'AirPods Pro',\n" +
        "    location: 'Pool Area',\n" +
        "    status: 'Claimed',\n" +
        "    foundDate: '2026-02-05',\n" +
        "    finderName: 'John Doe',\n" +
        "    description: 'White case with blue cover'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 11,\n" +
        "    itemName: 'Umbrella',\n" +
        "    location: 'Lobby',\n" +
        "    status: 'Returned',\n" +
        "    foundDate: '2026-02-03',\n" +
        "    finderName: 'Alice Green',\n" +
        "    description: 'Large black golf umbrella'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 12,\n" +
        "    itemName: 'Reading Glasses',\n" +
        "    location: 'Restaurant',\n" +
        "    status: 'Found',\n" +
        "    foundDate: '2026-02-07',\n" +
        "    finderName: 'Tom White',\n" +
        "    description: 'Black frame, left on table 12'\n" +
        "  }";
        
        content = content.replace(/description: 'Unclaimed over 60 days'\s*\}\s*\];/, "description: 'Unclaimed over 60 days'\n  }" + newItems + "\n];");
        fs.writeFileSync(f3, content);
        console.log('Added 4 to LostAndFound');
    }
}
