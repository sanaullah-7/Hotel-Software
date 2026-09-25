const fs = require('fs');
const path = require('path');

const filesToHook = [
  { path: 'src/features/payment-billing/pages/paymentBillingStore.js', module: 'Payment & Billing' },
  { path: 'src/features/inventory/pages/inventoryStore.js', module: 'Inventory' },
  { path: 'src/features/housekeeping/pages/hkStore.js', module: 'Housekeeping' },
  { path: 'src/features/restaurant/pages/restaurantStore.js', module: 'Restaurant' },
  { path: 'src/features/rates-pricing/pages/ratesPricingStore.js', module: 'Rate & Pricing' }
];

for (const file of filesToHook) {
  if (!fs.existsSync(file.path)) continue;
  let content = fs.readFileSync(file.path, 'utf8');
  if (content.includes('addAuditLog')) continue;
  
  const auditPath = path.relative(path.dirname(file.path), 'src/features/audit/state/auditStore.js').replace(/\\/g, '/');
  content = `import { addAuditLog } from '${auditPath.startsWith('.') ? auditPath : './' + auditPath}';\n` + content;
  
  // Replace window.dispatchEvent with dispatch + audit based on function name context (hacky but works for demo)
  content = content.replace(
    /(export const (\w+) = [\s\S]*?)window\.dispatchEvent\(new Event\((.*?)\)\);/g,
    (match, prefix, funcName, eventName) => {
      let action = 'Updated Record';
      let importance = 'Normal';
      
      if (funcName.startsWith('add')) action = 'Created Record';
      if (funcName.startsWith('delete') || funcName.startsWith('remove')) {
        action = 'Deleted Record';
        importance = 'Critical';
      }
      if (funcName.includes('Status')) action = 'Status Changed';
      if (funcName.includes('Payment') || funcName.includes('Refund')) importance = 'Important';
      
      return `${match}\n    try { addAuditLog({ module: '${file.module}', action: '${action}', description: '${funcName} was called.', importance: '${importance}' }); } catch(e){}`;
    }
  );
  
  fs.writeFileSync(file.path, content, 'utf8');
}
