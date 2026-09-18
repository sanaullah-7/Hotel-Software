const fs = require('fs');
let content = fs.readFileSync('src/pages/Reservation/GroupReservations.jsx', 'utf8');

// Remove min-w-max from table
content = content.replace('<table className="w-full text-left whitespace-nowrap min-w-max">', '<table className="w-full text-left whitespace-nowrap">');

// Replace px-6 with px-2 inside the table head and body to reduce gap
let tableStart = content.indexOf('<table className="w-full text-left whitespace-nowrap">');
if (tableStart === -1) {
    tableStart = content.indexOf('<table className="w-full text-left whitespace-nowrap min-w-max">');
}
if (tableStart !== -1) {
    let tableContent = content.substring(tableStart);
    let beforeTable = content.substring(0, tableStart);

    tableContent = tableContent.replace(/px-6/g, 'px-2');
    fs.writeFileSync('src/pages/Reservation/GroupReservations.jsx', beforeTable + tableContent);
    console.log('Updated GroupReservations.jsx');
} else {
    console.log('Table start not found.');
}
