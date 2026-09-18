const fs = require('fs');
let file = 'src/pages/Housekeeping/RoomsAndCleaning.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Remove min-w-max from table
    content = content.replace('<table className="w-full text-left whitespace-nowrap min-w-max">', '<table className="w-full text-left whitespace-nowrap">');
    content = content.replace('<table className="w-full text-left border-collapse min-w-max">', '<table className="w-full text-left border-collapse">');

    // Replace px-6 with px-2 inside the table head and body to reduce gap
    let tableStart = content.indexOf('<table');
    if (tableStart !== -1) {
        let beforeTable = content.substring(0, tableStart);
        let tableContent = content.substring(tableStart);
        
        tableContent = tableContent.replace(/px-6/g, 'px-2');
        // Let's also check if it uses px-5 and change to px-2 just in case
        // tableContent = tableContent.replace(/px-5/g, 'px-2');
        
        content = beforeTable + tableContent;
    }

    fs.writeFileSync(file, content);
    console.log('Updated RoomsAndCleaning.jsx');
} else {
    console.log('File not found');
}
