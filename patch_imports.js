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
    
    // Quick auto-imports
    const icons = [
      'HourglassEmptyIcon', 'WarningIcon', 'MoneyOffIcon', 'GavelIcon', 'TrendingUpIcon',
      'CheckCircleIcon', 'PendingIcon', 'PaidIcon', 'InvoiceIcon', 'PaymentIcon'
    ];
    
    // Let's just import all of them from @mui/icons-material
    const importsToAdd = `
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WarningIcon from '@mui/icons-material/Warning';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import GavelIcon from '@mui/icons-material/Gavel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/PendingActions';
import PaidIcon from '@mui/icons-material/CheckCircle';
import InvoiceIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
`;
    if (!content.includes('import HourglassEmptyIcon')) {
      content = content.replace(/import React/, importsToAdd + '\nimport React');
    }
    fs.writeFileSync(file, content, 'utf8');
  }
});
