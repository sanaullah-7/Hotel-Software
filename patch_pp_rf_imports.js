const fs = require('fs');
let content = fs.readFileSync('Client/src/features/payment-billing/pages/PendingPayments.jsx', 'utf8');

const newImports = `import React, { useState, useMemo } from'react';
import {
 TextField,
 InputAdornment,
 Button,
 MenuItem,
 Chip,
 IconButton,
 Tooltip,
 Snackbar,
 Alert,
 FormControl,
 Select,
 InputLabel,
} from'@mui/material';
import {
 Search as SearchIcon,
 Clear as ClearIcon,
 HourglassEmpty as PendingIcon,
 HourglassEmpty as HourglassEmptyIcon,
 Warning as WarningIcon,
 MoneyOff as MoneyOffIcon,
 Payment as PaymentIcon,
 Visibility as ViewIcon,
 PriorityHigh as UrgentIcon,
 Phone as PhoneIcon,
 ReceiptLong as InvoiceIcon,
} from'@mui/icons-material';
import {
 getInvoices,
 recordInvoicePayment,
} from'./paymentBillingStore';
import InvoiceDetailModal from'./components/InvoiceDetailModal';
import RecordPaymentModal from'./components/RecordPaymentModal';`;

const splitPoint = content.indexOf('\nexport default function PendingPayments()');
const rest = content.substring(splitPoint);
fs.writeFileSync('Client/src/features/payment-billing/pages/PendingPayments.jsx', newImports + '\n' + rest, 'utf8');

// Also fix Refunds
let rf = fs.readFileSync('Client/src/features/payment-billing/pages/Refunds.jsx', 'utf8');
const rfSplit = rf.indexOf('\nexport default function Refunds()');
const rfRest = rf.substring(rfSplit);
const rfImports = `import React, { useState, useMemo } from'react';
import {
 TextField,
 InputAdornment,
 Button,
 MenuItem,
 Chip,
 IconButton,
 Tooltip,
 Snackbar,
 Alert,
 FormControl,
 Select,
 InputLabel,
} from'@mui/material';
import {
 Search as SearchIcon,
 Clear as ClearIcon,
 AssignmentReturn as RefundIcon,
 CheckCircle as ApprovedIcon,
 CheckCircle as CheckCircleIcon,
 HourglassEmpty as PendingIcon,
 Block as RejectedIcon,
 Visibility as ViewIcon,
 Print as PrintIcon,
 Add as AddIcon,
 MoneyOff as MoneyOffIcon,
 Gavel as GavelIcon,
} from'@mui/icons-material';`;

const rfStoreIdx = rf.indexOf("import {\n getRefunds,");
const rfStoreEnd = rf.indexOf("import ", rfStoreIdx + 1);
const rfStoreSection = rf.substring(rfStoreIdx, rfStoreEnd);
fs.writeFileSync('Client/src/features/payment-billing/pages/Refunds.jsx', rfImports + '\n' + rfStoreSection + rfRest, 'utf8');

console.log('Done');
