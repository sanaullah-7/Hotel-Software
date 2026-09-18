const fs = require('fs');

const files = [
    'src/pages/Rooms/Rooms.jsx',
    'src/pages/Rooms/RoomTypes.jsx',
    'src/pages/Rooms/RatePricing.jsx'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Make sure AddCircleOutlined is imported
        if (!content.includes('AddCircleOutlined')) {
            content = content.replace(/import\s+\{([^}]+)\}\s+from\s+'@mui\/icons-material'/g, function(match, p1) {
                let imports = p1.split(',').map(s => s.trim());
                if (!imports.includes('AddCircleOutlined')) imports.push('AddCircleOutlined');
                if (!imports.includes('TableChart')) imports.push('TableChart');
                return "import { " + imports.join(', ') + " } from '@mui/icons-material';";
            });
        }

        const buttonRegex = /<div className="flex items-center gap-[^"]+">\s*<button[\s\S]*?onClick=\{\(e\).*?setColumnsMenuAnchor[\s\S]*?<FilterList[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleOpen(?:New|Add)\}[\s\S]*?<(AddCircle|Add)[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{\(\) => set[\s\S]*?<Refresh[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleExportCSV\}[\s\S]*?<\/button>\s*<button[\s\S]*?onClick=\{handleExportPDF\}[\s\S]*?<\/button>\s*<\/div>/;
        
        const newButtons = (match) => {
            let refreshMatch = match.match(/onClick=\{\(\) => set\w+\(initial\w+\)\}/);
            let refreshHandler = refreshMatch ? refreshMatch[0] : 'onClick={() => {}}';
            
            let addMatch = match.match(/onClick=\{handleOpen(New|Add)\}/);
            let addHandler = addMatch ? addMatch[0] : 'onClick={() => {}}';

            return '<div className="flex items-center gap-2">\n' +
'              <button \n' +
'                onClick={(e) => setColumnsMenuAnchor(e.currentTarget)} \n' +
'                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"\n' +
'                title="Filter"\n' +
'              >\n' +
'                <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />\n' +
'              </button>\n' +
'              <button \n' +
'                ' + addHandler + '\n' +
'                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"\n' +
'                title="Add"\n' +
'              >\n' +
'                <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[#1b7f43]" />\n' +
'              </button>\n' +
'              <button \n' +
'                ' + refreshHandler + '\n' +
'                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"\n' +
'                title="Refresh"\n' +
'              >\n' +
'                <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />\n' +
'              </button>\n' +
'              <button \n' +
'                onClick={handleExportCSV} \n' +
'                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" \n' +
'                title="Export CSV"\n' +
'              >\n' +
'                <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />\n' +
'              </button>\n' +
'              <button \n' +
'                onClick={handleExportPDF} \n' +
'                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" \n' +
'                title="Export PDF"\n' +
'              >\n' +
'                <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />\n' +
'              </button>\n' +
'            </div>';
        };
        
        content = content.replace(buttonRegex, newButtons);
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
