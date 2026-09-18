const fs = require('fs');

const file = 'src/pages/Rooms/Rooms.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove min-w-max
    content = content.replace(/<table className="w-full text-left whitespace-nowrap min-w-max">/g, '<table className="w-full text-left whitespace-nowrap">');
    content = content.replace(/<table className="w-full text-left border-collapse min-w-max">/g, '<table className="w-full text-left border-collapse">');
    
    // Find table start to only replace inside table
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
