const fs = require('fs');

['src/pages/Housekeeping/CleaningSchedule.jsx', 'src/pages/Housekeeping/LostAndFound.jsx'].forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Reduce footer margin and padding
        content = content.replace(/className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-50"/g, 'className="flex items-center justify-end gap-3 mt-2.5 pt-2.5 border-t border-gray-50"');
        
        // Also remove flex-1 from the middle section and add h-fit to the card so they don't stretch unnecessarily
        content = content.replace(/flex-1/g, ''); 
        content = content.replace(/flex flex-col relative/g, 'flex flex-col relative h-fit');

        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
