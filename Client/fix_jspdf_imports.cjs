const fs = require('fs');

function fixImport(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Change import jsPDF from 'jspdf'; to import { jsPDF } from 'jspdf';
    content = content.replace(/import jsPDF from 'jspdf';/g, "import { jsPDF } from 'jspdf';");
    
    fs.writeFileSync(filename, content);
}

fixImport('src/pages/Rooms/RoomTypes.jsx');
fixImport('src/pages/Rooms/Rooms.jsx');
fixImport('src/pages/Rooms/RatePricing.jsx');

console.log("Fixed jsPDF imports");
