const fs = require('fs');
let file = 'src/pages/Housekeeping/RoomsAndCleaning.jsx';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Reduce px-2 to px-1 on TH and TD
    content = content.replace(/px-2/g, 'px-1');
    
    // Reduce text-[12px] to text-[11px] on TH and TD
    content = content.replace(/text-\[12px\]/g, 'text-[11px]');
    
    // Reduce max-w-[120px] on Notes to max-w-[80px]
    content = content.replace(/max-w-\[120px\]/g, 'max-w-[80px]');

    // Status pills padding and text
    content = content.replace(/px-2\.5 py-1 rounded-full text-\[11px\]/g, 'px-1.5 py-0.5 rounded-full text-[10px]');
    content = content.replace(/px-2 py-1 rounded-md text-\[11px\]/g, 'px-1.5 py-0.5 rounded-md text-[10px]');

    fs.writeFileSync(file, content);
    console.log("Updated RoomsAndCleaning padding to fit without scroll");
}
