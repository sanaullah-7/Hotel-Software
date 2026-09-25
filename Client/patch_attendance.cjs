const fs = require('fs');
function patch(file, regexStr, replacement) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('addAuditLog')) {
    const depth = file.split('/').length - 3;
    const up = '../'.repeat(depth);
    content = `import { addAuditLog } from '${up}audit/state/auditStore.js';\n` + content;
  }
  if (!content.includes('addAuditLog({')) {
      content = content.replace(new RegExp(regexStr, 'g'), replacement);
      fs.writeFileSync(file, content, 'utf8');
      console.log('patched ' + file);
  }
}

const pattern = "localStorage\\.setItem\\(ATTENDANCE_STORAGE_KEY, JSON\\.stringify\\(nextRecords\\)\\);";
const replace = "localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(nextRecords));\n  try { addAuditLog({ module: 'Human Resources', action: 'Updated Attendance', description: `Attendance records updated.`, importance: 'Normal' }); } catch(e) {}"

patch('src/hooks/HumanResources/useTodaysAttendance.js', pattern, replace);
patch('src/pages/HR/Attendance/TodaysAttendance/useTodaysAttendance.js', pattern, replace);
