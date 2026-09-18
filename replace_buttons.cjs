const fs = require('fs');

const iconImports = "import { FilterList, AddCircleOutlined, Refresh, TableChart, PictureAsPdf } from '@mui/icons-material';\n";

const newIconsJSX = `
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Filter">
              <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <button onClick={handleOpenNew} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Record">
              <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
              <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
              <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />
            </button>
          </div>
`;

function processFile(filePath, oldButtonText) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add imports
  if (!content.includes('FilterList')) {
    content = content.replace(/import React/, iconImports + 'import React');
  }

  // Replace button
  const regex = new RegExp(
    `<button onClick=\\{handleOpenNew\\} className="bg-\\[var\\(--primary-main\\)\\] text-white px-3 py-1\\.5 rounded-md text-\\[13px\\] font-bold shadow-sm hover:bg-green-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer">\\s*${oldButtonText}\\s*<\\/button>`,
    'g'
  );
  
  if (!regex.test(content)) {
    console.log(`Could not find old button in ${filePath}`);
  } else {
    content = content.replace(regex, newIconsJSX);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

processFile('Client/src/pages/Housekeeping/CleaningSchedule.jsx', 'Add New Task');
processFile('Client/src/pages/Housekeeping/LostAndFound.jsx', 'Add New Item');
processFile('Client/src/pages/Housekeeping/InspectionChecklist.jsx', 'New Inspection');
