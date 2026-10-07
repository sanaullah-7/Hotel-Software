const fs = require('fs');

const target = 'Client/src/features/payment-billing/pages/paymentBillingStore.js';
let r = fs.readFileSync(target, 'utf8');

r = r.replace(/if\s*\(prevInvoicesRaw\s*!==\s*null\)\s*\/\/\s*localStorage\.setItem\([\s\S]*?else\s+localStorage\.removeItem\([\s\S]*?\);/g, '/* localStorage removed */');

fs.writeFileSync(target, r);
console.log("Fixed paymentBillingStore invoices raw!");
