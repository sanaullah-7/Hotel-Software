const fs = require('fs');
let content = fs.readFileSync('Client/src/features/payment-billing/pages/PaymentHistory.jsx', 'utf8');

// Replace the entire import section up to line 30
const newImports = `import React, { useState, useMemo } from'react';
import {
 TextField,
 InputAdornment,
 MenuItem,
 Button,
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
 ReceiptLong as ReceiptIcon,
 Visibility as ViewIcon,
 CheckCircle as PaidIcon,
 CreditCard as CreditCardIcon,
 AccountBalanceWallet as CashIcon,
 AssignmentReturn as RefundIcon,
 FileDownload as ExportIcon,
 SwapHoriz as TransactionIcon,
 Payment as PaymentIcon,
 TrendingUp as TrendingUpIcon,
 PendingActions as PendingIcon,
} from'@mui/icons-material';
import {
 getPayments,
 processRefund,
} from'./paymentBillingStore';
import PaymentDetailModal from'./components/PaymentDetailModal';
import ProcessRefundModal from'./components/ProcessRefundModal';`;

// Find where the imports end (first export default)
const splitPoint = content.indexOf('\nexport default function PaymentHistory()');
const rest = content.substring(splitPoint);
const newContent = newImports + '\n' + rest;
fs.writeFileSync('Client/src/features/payment-billing/pages/PaymentHistory.jsx', newContent, 'utf8');
console.log('Done');
