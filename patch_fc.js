const fs = require('fs');
const files = [
  'Client/src/features/payment-billing/pages/PendingPayments.jsx',
  'Client/src/features/payment-billing/pages/Refunds.jsx'
];
files.forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/ Snackbar,\r?\n Alert,\r?\n\} from'@mui\/material';/, ` Snackbar,\r\n Alert,\r\n FormControl,\r\n Select,\r\n InputLabel,\r\n} from'@mui/material';`);
  fs.writeFileSync(file, c, 'utf8');
});
console.log('Done');
