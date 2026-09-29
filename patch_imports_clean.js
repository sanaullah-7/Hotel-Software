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
    
    // Remove the auto-imports I just added since they were already imported!
    content = content.replace(/import HourglassEmptyIcon from '@mui\/icons-material\/HourglassEmpty';\r?\nimport WarningIcon from '@mui\/icons-material\/Warning';\r?\nimport MoneyOffIcon from '@mui\/icons-material\/MoneyOff';\r?\nimport GavelIcon from '@mui\/icons-material\/Gavel';\r?\nimport TrendingUpIcon from '@mui\/icons-material\/TrendingUp';\r?\nimport CheckCircleIcon from '@mui\/icons-material\/CheckCircle';\r?\nimport PendingIcon from '@mui\/icons-material\/PendingActions';\r?\nimport PaidIcon from '@mui\/icons-material\/CheckCircle';\r?\nimport InvoiceIcon from '@mui\/icons-material\/ReceiptLong';\r?\nimport PaymentIcon from '@mui\/icons-material\/Payment';\r?\n/, '');
    
    // Specifically import MoneyOffIcon and GavelIcon if missing, since they might not be aliased.
    if (!content.includes('MoneyOffIcon')) {
        // Just inject into the big mui/icons-material block
    }
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
