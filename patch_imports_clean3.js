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
    
    // Remove the bad import I just added completely
    content = content.replace(/import \{ HourglassEmpty as HourglassEmptyIcon, Warning as WarningIcon, MoneyOff as MoneyOffIcon, Gavel as GavelIcon, TrendingUp as TrendingUpIcon, /g, 'import { ');
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
