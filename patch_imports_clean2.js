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
    
    // Check if my previous regex failed to remove the lines (Windows line endings vs Unix)
    const badLines = [
        "import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';",
        "import WarningIcon from '@mui/icons-material/Warning';",
        "import MoneyOffIcon from '@mui/icons-material/MoneyOff';",
        "import GavelIcon from '@mui/icons-material/Gavel';",
        "import TrendingUpIcon from '@mui/icons-material/TrendingUp';",
        "import CheckCircleIcon from '@mui/icons-material/CheckCircle';",
        "import PendingIcon from '@mui/icons-material/PendingActions';",
        "import PaidIcon from '@mui/icons-material/CheckCircle';",
        "import InvoiceIcon from '@mui/icons-material/ReceiptLong';",
        "import PaymentIcon from '@mui/icons-material/Payment';"
    ];
    badLines.forEach(l => {
        content = content.replace(l + '\n', '');
        content = content.replace(l + '\r\n', '');
    });
    
    if (!content.includes('MoneyOff as MoneyOffIcon')) {
        content = content.replace(/import \{/, "import { HourglassEmpty as HourglassEmptyIcon, Warning as WarningIcon, MoneyOff as MoneyOffIcon, Gavel as GavelIcon, TrendingUp as TrendingUpIcon, ");
    }
    
    fs.writeFileSync(file, content, 'utf8');
  }
});
