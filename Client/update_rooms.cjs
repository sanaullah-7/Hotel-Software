const fs = require('fs');

const files = [
    'src/pages/Rooms/AllRooms.jsx',
    'src/pages/Rooms/RoomTypes.jsx',
    'src/pages/Rooms/RatePricing.jsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Remove min-w-max
        content = content.replace(/<table className="w-full text-left whitespace-nowrap min-w-max">/g, '<table className="w-full text-left whitespace-nowrap">');
        content = content.replace(/<table className="w-full text-left border-collapse min-w-max">/g, '<table className="w-full text-left border-collapse">');
        
        // Find table start to only replace inside table (or just global replace if safe, but safer to constrain)
        let tableStart = content.indexOf('<table');
        if (tableStart !== -1) {
            let beforeTable = content.substring(0, tableStart);
            let tableContent = content.substring(tableStart);
            tableContent = tableContent.replace(/px-6/g, 'px-2');
            content = beforeTable + tableContent;
        }

        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    } else {
        console.log('File not found: ' + file);
    }
});
