const fs = require('fs');

const files = [
  'Client/src/features/payment-billing/pages/Invoices.jsx',
  'Client/src/features/payment-billing/pages/PaymentHistory.jsx',
  'Client/src/features/payment-billing/pages/PendingPayments.jsx',
  'Client/src/features/payment-billing/pages/Refunds.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import \{ FormControl, Select, InputLabel, /g, 'import { ');
    content = content.replace(/from '@mui\/material';/g, "from '@mui/material';\nimport { FormControl, Select, InputLabel } from '@mui/material';");
    fs.writeFileSync(file, content, 'utf8');
  }
});
