const fs = require('fs');

function fixPdfExport(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    // 1. Fix import
    content = content.replace(/import 'jspdf-autotable';/, "import autoTable from 'jspdf-autotable';");

    // 2. Fix doc.autoTable to autoTable(doc, ...)
    content = content.replace(/doc\.autoTable\(\{ head: \[tableColumn\], body: tableRows, startY: 20 \}\);/, 
        "autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });");

    fs.writeFileSync(filename, content);
}

fixPdfExport('src/pages/Rooms/RoomTypes.jsx');
fixPdfExport('src/pages/Rooms/Rooms.jsx');

console.log("Fixed PDF export");
