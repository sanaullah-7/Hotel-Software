const fs = require('fs');

function patch(file, regexStr, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('addAuditLog')) {
    const depth = file.split('/').length - 3;
    const up = '../'.repeat(depth);
    content = `import { addAuditLog } from '${up}audit/state/auditStore.js';\n` + content;
  }
  content = content.replace(new RegExp(regexStr, 'g'), replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('patched ' + file);
}

patch('src/features/housekeeping/pages/Inspection.jsx',
  "saveRooms\\(newRooms\\);\\s*window\\.dispatchEvent\\(new Event\\('hk_update'\\)\\);",
  "saveRooms(newRooms);\n  try { addAuditLog({ module: 'Housekeeping', action: 'Updated Room Status', description: `Room status updated.`, importance: 'Normal' }); } catch(e) {}\n  window.dispatchEvent(new Event('hk_update'));"
);

patch('src/features/housekeeping/pages/StaffAssignment.jsx',
  "saveRooms\\(newRooms\\);\\s*window\\.dispatchEvent\\(new Event\\('hk_update'\\)\\);",
  "saveRooms(newRooms);\n  try { addAuditLog({ module: 'Housekeeping', action: 'Assigned Staff', description: `Staff assignment updated.`, importance: 'Normal' }); } catch(e) {}\n  window.dispatchEvent(new Event('hk_update'));"
);
