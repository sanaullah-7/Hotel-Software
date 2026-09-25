const fs = require('fs');
const path = require('path');

function processStore(filePath, moduleName, entityNameSingular) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('addAuditLog')) return;

  const auditPath = path.relative(path.dirname(filePath), 'src/features/audit/state/auditStore.js').replace(/\\/g, '/');
  const importStmt = `import { addAuditLog } from '${auditPath.startsWith('.') ? auditPath : './' + auditPath}';\n`;
  content = importStmt + content;

  // Generic add pattern
  content = content.replace(
    new RegExp(`(export const add${entityNameSingular} = \\([\\s\\S]*?\\) => \\{[\\s\\S]*?localStorage\\.setItem.*?\\n\\};)`, 'g'),
    `$1\n  // Audit handled in UI or needs custom injection`
  );
  
  // Actually, string replacement with regex might be dangerous on all files. 
  // I will just use string replacement specifically.
}

const filesToHook = [
  { path: 'src/features/payment-billing/pages/paymentBillingStore.js', module: 'Payment & Billing' },
  { path: 'src/features/inventory/pages/inventoryStore.js', module: 'Inventory' },
  { path: 'src/features/housekeeping/pages/hkStore.js', module: 'Housekeeping' },
  { path: 'src/features/restaurant/pages/restaurantStore.js', module: 'Restaurant' },
];

for (const file of filesToHook) {
  if (!fs.existsSync(file.path)) continue;
  let content = fs.readFileSync(file.path, 'utf8');
  if (content.includes('addAuditLog')) continue;
  
  const auditPath = path.relative(path.dirname(file.path), 'src/features/audit/state/auditStore.js').replace(/\\/g, '/');
  content = `import { addAuditLog } from '${auditPath.startsWith('.') ? auditPath : './' + auditPath}';\n` + content;
  
  // Replace window.dispatchEvent calls with dispatch + audit log
  content = content.replace(
    /window\.dispatchEvent\(new Event\(.*?\)\]?\)?;?/g,
    (match) => `${match}\n    try { addAuditLog({ module: '${file.module}', action: 'Updated Record', description: 'Record was modified.', importance: 'Normal' }); } catch(e){}`
  );
  
  fs.writeFileSync(file.path, content, 'utf8');
}
