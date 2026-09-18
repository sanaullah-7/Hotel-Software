const fs = require('fs');

function processFile(filePath, stateVarName, itemName, searchFields, title, newBtnText) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add TablePagination to imports
  content = content.replace(
    /import \{([^}]*?)\} from '@mui\/material';/,
    (match, p1) => {
      if (!p1.includes('TablePagination')) {
        return `import {${p1}, TablePagination } from '@mui/material';`;
      }
      return match;
    }
  );

  // Add state hooks
  const stateHooks = `
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
`;
  content = content.replace(
    new RegExp(`const \\[${stateVarName}, set${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}\\] = useState\\(initial[a-zA-Z]+\\);`),
    `$&${stateHooks}`
  );

  // Add filter and pagination logic
  const filterLogic = `
  const filtered${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)} = ${stateVarName}.filter(item => 
    ${searchFields.map(f => `(item.${f} || '').toString().toLowerCase().includes(searchTerm.toLowerCase())`).join(' ||\n    ')}
  );
  
  const paginated${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)} = filtered${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
`;
  // Insert before handleOpenNew
  content = content.replace(
    /const handleOpenNew = \(\) => \{/,
    `${filterLogic}\n  const handleOpenNew = () => {`
  );

  // Replace mapping array in JSX
  content = content.replace(
    new RegExp(`${stateVarName}\\.map\\(`, 'g'),
    `paginated${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}.map(`
  );
  
  content = content.replace(
    new RegExp(`${stateVarName}\\.length === 0`, 'g'),
    `filtered${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}.length === 0`
  );

  // Update table header with search input
  const tableHeaderRegex = /<div className="flex flex-nowrap items-center gap-2 shrink-0">[\s\S]*?<\/div>/;
  const newTableHeader = `<div className="flex flex-nowrap items-center gap-4 shrink-0">
             <h1 className="text-[18px] font-bold text-gray-800 whitespace-nowrap">${title}</h1>
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="px-3 py-1.5 border border-gray-200 rounded-md text-[13px] w-[250px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors"
             />
          </div>`;
  content = content.replace(tableHeaderRegex, newTableHeader);

  // Add TablePagination
  const paginationCode = `
        </div>
        <TablePagination
          component="div"
          count={filtered${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Items per page:"
          sx={{
            '.MuiTablePagination-toolbar': { minHeight: '40px', padding: '0 16px' },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '13px', color: '#64748b', margin: 0 },
            '.MuiTablePagination-select': { fontSize: '13px', color: '#1f2937' },
          }}
        />
      </div>`;
      
  content = content.replace(
    /<\/div>\s*<\/div>\s*\{\/\* Add \/ Edit Task Modal \*\/\}/,
    `${paginationCode}\n\n      {/* Add / Edit Task Modal */}`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

processFile(
  'Client/src/pages/Housekeeping/CleaningSchedule.jsx', 
  'tasks', 
  'task', 
  ['roomNo', 'taskType', 'assignedStaff', 'status'], 
  "Today's Cleaning Schedule"
);

processFile(
  'Client/src/pages/Housekeeping/LostAndFound.jsx', 
  'items', 
  'item', 
  ['itemName', 'location', 'finderName', 'status'], 
  "Lost & Found Management"
);

processFile(
  'Client/src/pages/Housekeeping/InspectionChecklist.jsx', 
  'inspections', 
  'record', 
  ['roomNo', 'roomType', 'inspector', 'status'], 
  "Inspection Checklist"
);
