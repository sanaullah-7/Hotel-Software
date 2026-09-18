const fs = require('fs');

const files = [
    'src/pages/Rooms/Rooms.jsx',
    'src/pages/Rooms/RoomTypes.jsx',
    'src/pages/Rooms/RatePricing.jsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // 1. Make sure AddCircle and TableChart are imported
        if (!content.includes('AddCircle')) {
            content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'@mui\/icons-material'/g, function(match, p1) {
                let imports = p1.split(',').map(s => s.trim());
                if (!imports.includes('AddCircle')) imports.push('AddCircle');
                if (!imports.includes('TableChart')) imports.push('TableChart');
                return import {  } from '@mui/icons-material';
            });
        }

        // 2. Replace the button row
        const buttonRegex = /<div className="flex items-center gap-3">\s*<button[\s\S]*?onClick=\{\(e\).*?setColumnsMenuAnchor[\s\S]*?<FilterList[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleOpen(?:New|Add)\}[\s\S]*?<Add[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{\(\) => set[\s\S]*?<Refresh[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleExportCSV\}[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleExportPDF\}[\s\S]*?<\/button>\s*<\/div>/;
        
        const newButtons = (match) => {
            // we need to extract the specific refresh handler: e.g. setRooms(initialRooms) or setRates(initialRates)
            let refreshMatch = match.match(/onClick=\{\(\) => set\w+\(initial\w+\)\}/);
            let refreshHandler = refreshMatch ? refreshMatch[0] : 'onClick={() => {}}';
            
            let addMatch = match.match(/onClick=\{handleOpen(New|Add)\}/);
            let addHandler = addMatch ? addMatch[0] : 'onClick={() => {}}';

            return <div className="flex items-center gap-3">
              <button 
                onClick={(e) => setColumnsMenuAnchor(e.currentTarget)} 
                className="text-[#10b981] hover:bg-green-50 p-1 rounded-full transition-colors cursor-pointer"
                title="Filter Columns"
              >
                <FilterList sx={{ fontSize: 24 }} />
              </button>
              <button 
                
                className="text-[#10b981] hover:text-[#059669] transition-colors cursor-pointer flex items-center justify-center rounded-full"
                title="Add New"
              >
                <AddCircle sx={{ fontSize: 28 }} />
              </button>
              <button 
                
                className="text-[#10b981] hover:bg-green-50 p-1 rounded-full transition-colors cursor-pointer"
                title="Refresh"
              >
                <Refresh sx={{ fontSize: 24 }} />
              </button>
              <button 
                onClick={handleExportCSV} 
                className="text-[#0ea5e9] hover:bg-blue-50 p-1 rounded-full transition-colors cursor-pointer" 
                title="Export CSV"
              >
                <TableChart sx={{ fontSize: 24 }} />
              </button>
              <button 
                onClick={handleExportPDF} 
                className="text-[#ef4444] hover:bg-red-50 p-1 rounded-full transition-colors cursor-pointer" 
                title="Export PDF"
              >
                <PictureAsPdf sx={{ fontSize: 24 }} />
              </button>
            </div>;
        };
        
        content = content.replace(buttonRegex, newButtons);
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
