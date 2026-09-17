const fs = require('fs');

function updateFile(filename, nameForExport, csvHeaders, csvRowMapper, pdfHeaders, pdfRowMapper) {
    let content = fs.readFileSync(filename, 'utf8');

    // 1. Add imports
    if (!content.includes('jspdf')) {
        content = content.replace(/import React.*?from 'react';/, "import React, { useState } from 'react';\nimport jsPDF from 'jspdf';\nimport 'jspdf-autotable';");
    }

    // 2. Add Export functions just before the first return in the component
    // We can search for \n  return (\n    <div
    const exportFunctions = \
  const handleExportCSV = () => {
    const headers = \;
    const csvRows = [headers.join(',')];
    rooms.forEach(room => {
      csvRows.push(\.join(','));
    });
    const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', '\.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('\', 14, 15);
    const tableColumn = \;
    const tableRows = rooms.map(room => \);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('\.pdf');
  };
\;
    if (!content.includes('handleExportCSV')) {
        content = content.replace(/  return \(/, exportFunctions + '\n  return (');
    }

    // 3. Update buttons
    content = content.replace(
      /<button className="text-\\[#3b82f6\\] hover:bg-blue-50 p-1\.5 rounded-full transition-colors cursor-pointer">\\s*<Calculate sx=\{\{ fontSize: 22 \}\} \/>\\s*<\/button>/g,
      '<button onClick={handleExportCSV} className="text-[#3b82f6] hover:bg-blue-50 p-1.5 rounded-full transition-colors cursor-pointer" title="Export CSV"><Calculate sx={{ fontSize: 22 }} /></button>'
    );
    
    content = content.replace(
      /<button className="text-\\[#ef4444\\] hover:bg-red-50 p-1\.5 rounded-full transition-colors cursor-pointer">\\s*<PictureAsPdf sx=\{\{ fontSize: 22 \}\} \/>\\s*<\/button>/g,
      '<button onClick={handleExportPDF} className="text-[#ef4444] hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer" title="Export PDF"><PictureAsPdf sx={{ fontSize: 22 }} /></button>'
    );

    fs.writeFileSync(filename, content);
}

updateFile(
  'src/pages/Rooms/RoomTypes.jsx', 
  'RoomTypes',
  "['Room No', 'Room Type', 'AC/Non AC', 'Short Code', 'Status', 'Bed Capacity', 'Rent']",
  "[room.roomNo, room.roomType, room.acNonAc, room.shortCode, room.status, room.capacity, room.rent]",
  "['Room No', 'Room Type', 'AC/Non AC', 'Short Code', 'Status', 'Capacity', 'Rent']",
  "[room.roomNo, room.roomType, room.acNonAc, room.shortCode, room.status, room.capacity, room.rent]"
);

updateFile(
  'src/pages/Rooms/Rooms.jsx', 
  'AllRooms',
  "['Room No', 'Room Type', 'AC/Non AC', 'Meal', 'Bed Capacity', 'Status', 'Rent', 'Mobile']",
  "[room.roomNo, room.roomType, room.acNonAc, room.meal, room.bedCapacity, room.status, room.rent, room.mobile]",
  "['Room No', 'Room Type', 'AC/Non AC', 'Meal', 'Bed Capacity', 'Status', 'Rent', 'Mobile']",
  "[room.roomNo, room.roomType, room.acNonAc, room.meal, room.bedCapacity, room.status, room.rent, room.mobile]"
);

console.log("Updated both files");
