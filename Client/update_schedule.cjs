const fs = require('fs');
let file = 'src/pages/Housekeeping/CleaningSchedule.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add getStatusBorderColor helper
    if (!content.includes('getStatusBorderColor')) {
        let newHelper = "  const getStatusBorderColor = (status) => {\\n" +
                        "    switch (status) {\\n" +
                        "      case 'Pending': return '#ea580c';\\n" +
                        "      case 'In Progress': return '#3b82f6';\\n" +
                        "      case 'Completed': return '#16a34a';\\n" +
                        "      case 'Delayed': return '#dc2626';\\n" +
                        "      default: return '#9ca3af';\\n" +
                        "    }\\n" +
                        "  };\\n\\n" +
                        "  const getStatusStyles = (status) => {";
        content = content.replace('const getStatusStyles = (status) => {', newHelper);
    }

    // 2. Change grid and card classes
    content = content.replace('className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"');
    
    // 3. Update the card container to have the top border
    content = content.replace(/className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative"/g, 'className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative border-t-[4px]" style={{ borderTopColor: getStatusBorderColor(task.status) }}');

    // 4. Add 5 more tasks to initialTasks
    if (!content.includes("roomNo: '401'")) {
        const newTasks = ",\n" +
        "  {\n" +
        "    id: 4,\n" +
        "    roomNo: '401',\n" +
        "    taskType: 'Deep Clean',\n" +
        "    assignedStaff: 'Emily Davis',\n" +
        "    startTime: '11:00',\n" +
        "    endTime: '12:30',\n" +
        "    priority: 'High',\n" +
        "    status: 'Pending',\n" +
        "    notes: 'VIP guest arrival'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 5,\n" +
        "    roomNo: '110',\n" +
        "    taskType: 'Quick Clean',\n" +
        "    assignedStaff: 'Michael Lee',\n" +
        "    startTime: '13:00',\n" +
        "    endTime: '13:30',\n" +
        "    priority: 'Low',\n" +
        "    status: 'In Progress',\n" +
        "    notes: 'Towel refresh'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 6,\n" +
        "    roomNo: '215',\n" +
        "    taskType: 'Full Clean',\n" +
        "    assignedStaff: 'Sarah Wilson',\n" +
        "    startTime: '14:00',\n" +
        "    endTime: '15:00',\n" +
        "    priority: 'Medium',\n" +
        "    status: 'Pending',\n" +
        "    notes: 'Regular check-out'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 7,\n" +
        "    roomNo: '305',\n" +
        "    taskType: 'Turn Down',\n" +
        "    assignedStaff: 'John Doe',\n" +
        "    startTime: '19:00',\n" +
        "    endTime: '19:30',\n" +
        "    priority: 'Low',\n" +
        "    status: 'Completed',\n" +
        "    notes: 'Evening service'\n" +
        "  },\n" +
        "  {\n" +
        "    id: 8,\n" +
        "    roomNo: '105',\n" +
        "    taskType: 'Full Clean',\n" +
        "    assignedStaff: 'Jane Smith',\n" +
        "    startTime: '15:30',\n" +
        "    endTime: '16:30',\n" +
        "    priority: 'High',\n" +
        "    status: 'Delayed',\n" +
        "    notes: 'Guest requested later time'\n" +
        "  }";
        
        content = content.replace(/notes: 'No notes available'\s*\}\s*\];/, "notes: 'No notes available'\n  }" + newTasks + "\n];");
    }

    fs.writeFileSync(file, content);
    console.log('Updated CleaningSchedule.jsx');
}
