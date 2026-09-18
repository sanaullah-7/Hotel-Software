const fs = require('fs');
let file = 'src/pages/Housekeeping/RoomsAndCleaning.jsx';

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    let tableStart = content.indexOf('<table className="w-full text-left whitespace-nowrap">');
    if (tableStart !== -1) {
        let beforeTable = content.substring(0, tableStart);
        let tableContent = content.substring(tableStart);
        
        tableContent = tableContent.replace(/px-4/g, 'px-2');
        content = beforeTable + tableContent;
    }

    fs.writeFileSync(file, content);
    console.log('Updated px-4 to px-2 in RoomsAndCleaning.jsx');
}
