const fs = require('fs');

function fixImport(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ addAuditLog \} from '\.\.\/audit\/state\/auditStore\.js';/, 
                            "import { addAuditLog } from '../../features/audit/state/auditStore.js';");
  content = content.replace(/import \{ addAuditLog \} from '\.\.\/\.\.\/\.\.\/audit\/state\/auditStore\.js';/, 
                            "import { addAuditLog } from '../../../../features/audit/state/auditStore.js';");
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed ' + file);
}

fixImport('src/hooks/HumanResources/useTodaysAttendance.js');
fixImport('src/pages/HR/Attendance/TodaysAttendance/useTodaysAttendance.js');
