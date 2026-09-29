const fs = require('fs');
let content = fs.readFileSync('Client/src/features/payment-billing/pages/PendingPayments.jsx', 'utf8');
if (!content.includes('MoneyOffIcon')) {
    content = content.replace(/import React/, "import { MoneyOff as MoneyOffIcon } from '@mui/icons-material';\nimport React");
    fs.writeFileSync('Client/src/features/payment-billing/pages/PendingPayments.jsx', content, 'utf8');
}

let content2 = fs.readFileSync('Client/src/features/payment-billing/pages/Refunds.jsx', 'utf8');
if (!content2.includes('GavelIcon')) {
    content2 = content2.replace(/import React/, "import { Gavel as GavelIcon, MoneyOff as MoneyOffIcon } from '@mui/icons-material';\nimport React");
    fs.writeFileSync('Client/src/features/payment-billing/pages/Refunds.jsx', content2, 'utf8');
}
