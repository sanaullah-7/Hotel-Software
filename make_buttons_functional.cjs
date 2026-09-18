const fs = require('fs');

function makeFunctional(fileConfig) {
  const { path, cols, exportTitle, csvPrefix, dataVar, colsMap, stateVarName } = fileConfig;
  let content = fs.readFileSync(path, 'utf8');

  // 1. Add useRef and useEffect
  content = content.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useRef, useEffect } from 'react';");

  // 2. Add states and handlers
  const statesHooks = `
  const [visibleColumns, setVisibleColumns] = useState({
    ${cols.map(c => `'${c}': true`).join(', ')}
  });
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    setVisibleColumns({
      ${cols.map(c => `'${c}': true`).join(', ')}
    });
  };

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\\n';
    
    filtered${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}.forEach(r => {
      const row = activeCols.map(col => {
        let val = '';
${colsMap.map(c => `        if (col === '${c.name}') val = ${c.val};`).join('\n')}
        return \`"\${(val || '').toString().replace(/"/g, '""')}"\`;
      });
      csvContent += row.join(',') + '\\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '${csvPrefix}.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = \`
      <html>
        <head>
          <title>${exportTitle}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
            h2 { color: #0f172a; margin-bottom: 5px; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>${exportTitle}</h2>
          <div class="meta">Generated on: \${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>\${activeCols.map(c => \`<th>\${c}</th>\`).join('')}</tr>
            </thead>
            <tbody>
    \`;
    
    filtered${stateVarName.charAt(0).toUpperCase() + stateVarName.slice(1)}.forEach(r => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
${colsMap.map(c => `        if (col === '${c.name}') val = ${c.val};`).join('\n')}
        html += \`<td>\${val}</td>\`;
      });
      html += '</tr>';
    });
    
    html += \`
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
          </script>
        </body>
      </html>
    \`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };
`;

  // Inject before handleOpenNew
  content = content.replace(/const handleOpenNew = \(\) => \{/, `${statesHooks}\n  const handleOpenNew = () => {`);

  // 3. Replace the topbar icons HTML
  const topbarIconsHTML = `
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterMenuRef}>
              <button onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Filter">
                <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
              </button>
              {showColumnsMenu && (
                <div className="absolute right-0 top-10 w-48 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-50 py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 text-[11px] font-bold text-gray-700">Show/Hide Column</div>
                  <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[var(--primary-main)] [&::-webkit-scrollbar-thumb]:rounded-full">
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer gap-3 text-[13px] text-gray-700 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col]} 
                          onChange={() => toggleColumn(col)} 
                          className="w-4 h-4 accent-[var(--primary-main)] cursor-pointer rounded-sm" 
                        />
                        {col}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleOpenNew} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Record">
              <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <button onClick={handleRefresh} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
              <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <button onClick={handleExportCSV} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
              <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
            </button>
            <button onClick={handleExportPDF} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />
            </button>
          </div>
`;
  content = content.replace(/<div className="flex items-center gap-2">[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Table \*\/\}/, `${topbarIconsHTML}\n        </div>\n        \n        {/* Table */}`);

  // 4. Wrap table headers and columns in {visibleColumns['ColName'] && (...)}
  cols.forEach(col => {
    // Header replace
    // Look for <th ...>ColName</th>
    // We need a precise regex for the th
    const thRegex = new RegExp(`<th className="([^"]+)">${col}<\\/th>`);
    content = content.replace(thRegex, `{visibleColumns['${col}'] && <th className="$1">${col}</th>}`);
  });

  // Table cell replace requires custom logic per file because of formatTime, spans, etc.
  // It's safer to write custom replacements for the tbody per file.

  fs.writeFileSync(path, content, 'utf8');
  console.log(`Updated hooks and header for ${path}`);
}

const configs = [
  {
    path: 'Client/src/pages/Housekeeping/CleaningSchedule.jsx',
    stateVarName: 'tasks',
    exportTitle: 'Cleaning Schedule Report',
    csvPrefix: 'cleaning_schedule',
    cols: ['Room No', 'Task Type', 'Assigned Staff', 'Time Slot', 'Priority', 'Status', 'Notes', 'Actions'],
    colsMap: [
      { name: 'Room No', val: 'r.roomNo' },
      { name: 'Task Type', val: 'r.taskType' },
      { name: 'Assigned Staff', val: 'r.assignedStaff' },
      { name: 'Time Slot', val: 'r.startTime + " - " + r.endTime' },
      { name: 'Priority', val: 'r.priority' },
      { name: 'Status', val: 'r.status' },
      { name: 'Notes', val: 'r.notes' }
    ]
  },
  {
    path: 'Client/src/pages/Housekeeping/LostAndFound.jsx',
    stateVarName: 'items',
    exportTitle: 'Lost and Found Report',
    csvPrefix: 'lost_and_found',
    cols: ['Item Name', 'Location', 'Found Date', 'Finder', 'Status', 'Description', 'Actions'],
    colsMap: [
      { name: 'Item Name', val: 'r.itemName' },
      { name: 'Location', val: 'r.location' },
      { name: 'Found Date', val: 'r.foundDate' },
      { name: 'Finder', val: 'r.finderName' },
      { name: 'Status', val: 'r.status' },
      { name: 'Description', val: 'r.description' }
    ]
  },
  {
    path: 'Client/src/pages/Housekeeping/InspectionChecklist.jsx',
    stateVarName: 'inspections',
    exportTitle: 'Inspection Checklist Report',
    csvPrefix: 'inspection_checklist',
    cols: ['Room No', 'Room Type', 'Inspector', 'Inspection Date', 'Status', 'Score', 'Comments', 'Actions'],
    colsMap: [
      { name: 'Room No', val: 'r.roomNo' },
      { name: 'Room Type', val: 'r.roomType' },
      { name: 'Inspector', val: 'r.inspector' },
      { name: 'Inspection Date', val: 'r.inspectionDate' },
      { name: 'Status', val: 'r.status' },
      { name: 'Score', val: 'r.score' },
      { name: 'Comments', val: 'r.comments' }
    ]
  }
];

configs.forEach(makeFunctional);
