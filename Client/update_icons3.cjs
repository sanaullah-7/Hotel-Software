const fs = require('fs');

const files = [
    'src/pages/Rooms/Rooms.jsx',
    'src/pages/Rooms/RoomTypes.jsx',
    'src/pages/Rooms/RatePricing.jsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Make sure ViewWeek is imported, remove TableChart if we want, but just add ViewWeek
        if (!content.includes('ViewWeek')) {
            content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'@mui\/icons-material'/g, function(match, p1) {
                let imports = p1.split(',').map(s => s.trim());
                if (!imports.includes('ViewWeek')) imports.push('ViewWeek');
                return "import { " + imports.join(', ') + " } from '@mui/icons-material';";
            });
        }

        // We will replace the whole buttons block
        const buttonRegex = /<div className="flex items-center gap-3">\s*<button[\s\S]*?onClick=\{\(e\).*?setColumnsMenuAnchor[\s\S]*?<FilterList[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleOpen(?:New|Add)\}[\s\S]*?<AddCircle[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{\(\) => set[\s\S]*?<Refresh[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleExportCSV\}[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleExportPDF\}[\s\S]*?<\/button>\s*<\/div>/;
        
        const newButtons = (match) => {
            let refreshMatch = match.match(/onClick=\{\(\) => set\w+\(initial\w+\)\}/);
            let refreshHandler = refreshMatch ? refreshMatch[0] : 'onClick={() => {}}';
            
            let addMatch = match.match(/onClick=\{handleOpen(New|Add)\}/);
            let addHandler = addMatch ? addMatch[0] : 'onClick={() => {}}';

            return '<div className="flex items-center gap-4">\n' +
'              <button \n' +
'                onClick={(e) => setColumnsMenuAnchor(e.currentTarget)} \n' +
'                className="text-[#16a34a] hover:opacity-80 transition-opacity cursor-pointer"\n' +
'                title="Filter Columns"\n' +
'              >\n' +
'                <FilterList sx={{ fontSize: 22 }} />\n' +
'              </button>\n' +
'              <button \n' +
'                ' + addHandler + '\n' +
'                className="text-[#16a34a] hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"\n' +
'                title="Add New"\n' +
'              >\n' +
'                <AddCircle sx={{ fontSize: 22 }} />\n' +
'              </button>\n' +
'              <button \n' +
'                ' + refreshHandler + '\n' +
'                className="text-[#16a34a] hover:opacity-80 transition-opacity cursor-pointer"\n' +
'                title="Refresh"\n' +
'              >\n' +
'                <Refresh sx={{ fontSize: 22 }} />\n' +
'              </button>\n' +
'              <button \n' +
'                onClick={handleExportCSV} \n' +
'                className="text-[#0ea5e9] hover:opacity-80 transition-opacity cursor-pointer" \n' +
'                title="Export CSV"\n' +
'              >\n' +
'                <ViewWeek sx={{ fontSize: 22 }} />\n' +
'              </button>\n' +
'              <button \n' +
'                onClick={handleExportPDF} \n' +
'                className="text-[#ef4444] hover:opacity-80 transition-opacity cursor-pointer" \n' +
'                title="Export PDF"\n' +
'              >\n' +
'                <PictureAsPdf sx={{ fontSize: 22 }} />\n' +
'              </button>\n' +
'            </div>';
        };
        
        content = content.replace(buttonRegex, newButtons);
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
