const fs = require('fs');

function wrapTds(path, cols, tdPrefixes) {
  let content = fs.readFileSync(path, 'utf8');
  
  cols.forEach((col, idx) => {
    // We use a regex that matches the exact td for that column.
    // However, since we might match multiple, it's safer to just replace the whole tbody inner map
    // or just assume we know exactly what it looks like.
    // Let's use simple string replacement since we just generated this code exactly.
    const tdContent = tdPrefixes[idx];
    content = content.replace(tdContent, `{visibleColumns['${col}'] && ${tdContent}}`);
  });

  // Also fix the colSpan for empty row
  content = content.replace(/colSpan="\d+"/, `colSpan={Object.values(visibleColumns).filter(Boolean).length}`);

  fs.writeFileSync(path, content, 'utf8');
  console.log(`Updated tds for ${path}`);
}

wrapTds('Client/src/pages/Housekeeping/CleaningSchedule.jsx', 
  ['Room No', 'Task Type', 'Assigned Staff', 'Time Slot', 'Priority', 'Status', 'Notes', 'Actions'],
  [
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-800">Room {task.roomNo}</td>`,
    `<td className="py-3 px-3 text-[12px] font-medium text-gray-600">{task.taskType}</td>`,
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-700">{task.assignedStaff || 'Unassigned'}</td>`,
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-700">{formatTime(task.startTime)} - {formatTime(task.endTime)}</td>`,
    `<td className={\`py-3 px-3 text-[13px] font-bold \${getPriorityColor(task.priority)}\`}>{task.priority}</td>`,
    `<td className="py-3 px-3">\n                      <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 \${getStatusStyles(task.status)}\`}>\n                        {task.status}\n                      </span>\n                    </td>`,
    `<td className="py-3 px-3 text-[13px] font-medium text-gray-500 italic max-w-[200px] truncate" title={task.notes}>{task.notes || 'No notes available'}</td>`,
    `<td className="py-3 px-3">\n                      <div className="flex items-center justify-center gap-3">\n                        <button onClick={() => handleOpenEdit(task)} className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">\n                          Edit\n                        </button>\n                        <button onClick={() => handleOpenDelete(task)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">\n                          Delete\n                        </button>\n                      </div>\n                    </td>`
  ]
);

wrapTds('Client/src/pages/Housekeeping/LostAndFound.jsx',
  ['Item Name', 'Location', 'Found Date', 'Finder', 'Status', 'Description', 'Actions'],
  [
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-800">{item.itemName}</td>`,
    `<td className="py-3 px-3 text-[12px] font-medium text-gray-600">{item.location}</td>`,
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-700">{item.foundDate}</td>`,
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-700">{item.finderName || '-'}</td>`,
    `<td className="py-3 px-3">\n                      <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 \${getStatusStyles(item.status)}\`}>\n                        {item.status}\n                      </span>\n                    </td>`,
    `<td className="py-3 px-3 text-[13px] font-medium text-gray-500 italic max-w-[200px] truncate" title={item.description}>{item.description || 'No description available'}</td>`,
    `<td className="py-3 px-3">\n                      <div className="flex items-center justify-center gap-3">\n                        <button onClick={() => handleOpenEdit(item)} className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">\n                          Edit\n                        </button>\n                        <button onClick={() => handleOpenDelete(item)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">\n                          Delete\n                        </button>\n                      </div>\n                    </td>`
  ]
);

wrapTds('Client/src/pages/Housekeeping/InspectionChecklist.jsx',
  ['Room No', 'Room Type', 'Inspector', 'Inspection Date', 'Status', 'Score', 'Comments', 'Actions'],
  [
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-800">Room {record.roomNo}</td>`,
    `<td className="py-3 px-3 text-[12px] font-medium text-gray-600">{record.roomType}</td>`,
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-700">{record.inspector}</td>`,
    `<td className="py-3 px-3 text-[13px] font-bold text-gray-700">{record.inspectionDate || '-'}</td>`,
    `<td className="py-3 px-3">\n                      <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 \${getStatusStyles(record.status)}\`}>\n                        {record.status}\n                      </span>\n                    </td>`,
    `<td className="py-3 px-3">\n                      <span className={\`text-[13px] font-bold \${getScoreColor(record.status)}\`}>{record.score}%</span>\n                    </td>`,
    `<td className="py-3 px-3 text-[13px] font-medium text-gray-500 italic max-w-[200px] truncate" title={record.comments}>{record.comments || 'No comments'}</td>`,
    `<td className="py-3 px-3">\n                      <div className="flex items-center justify-center gap-3">\n                        <button onClick={() => handleOpenEdit(record)} className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">\n                          Edit\n                        </button>\n                        <button onClick={() => handleOpenDelete(record)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">\n                          Delete\n                        </button>\n                      </div>\n                    </td>`
  ]
);
