import React, { useState } from'react';
import {
 Dialog,
 DialogTitle,
 DialogContent,
 DialogActions,
 Button,
 TextField,
 MenuItem,
 IconButton,
 InputAdornment,
 Alert,
} from'@mui/material';
import {
 Close as CloseIcon,
 Payment as PaymentIcon,
 CheckCircle as CheckCircleIcon,
 Receipt as ReceiptIcon,
} from'@mui/icons-material';

const PAYMENT_METHODS = ['Credit Card','Debit Card','Cash','Bank Transfer','UPI','Digital Wallet',
];

function RecordPaymentInnerForm({ invoice, invoices = [], onSave, onClose }) {
 const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoice ? invoice.id : (invoices[0]?.id ||''));
 const currentInvoice = invoice || invoices.find((inv) => inv.id === selectedInvoiceId) || null;

 const maxPayable = currentInvoice ? currentInvoice.balanceDue : 0;

 const [amount, setAmount] = useState(() => (maxPayable > 0 ? maxPayable :''));
 const [paymentMethod, setPaymentMethod] = useState('Credit Card');
 const [transactionRef, setTransactionRef] = useState('');
 const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
 const [notes, setNotes] = useState('');
 const [error, setError] = useState('');

 const numAmount = parseFloat(amount) || 0;
 const remainingAfterPayment = Math.max(0, (maxPayable - numAmount));

 const handleInvoiceChange = (e) => {
 const newId = e.target.value;
 setSelectedInvoiceId(newId);
 const target = invoices.find((inv) => inv.id === newId);
 if (target) {
 setAmount(target.balanceDue);
 }
 };

 const handleSubmit = (e) => {
 e.preventDefault();
 if (!currentInvoice) {
 setError('Please select a valid invoice.');
 return;
 }
 if (!numAmount || numAmount <= 0) {
 setError('Please enter a valid payment amount greater than $0.00.');
 return;
 }
 if (numAmount > maxPayable + 0.001) {
 setError(`Payment amount cannot exceed remaining balance due of $${maxPayable.toFixed(2)}.`);
 return;
 }

 onSave({
 invoiceId: currentInvoice.id,
 amount: numAmount,
 paymentMethod,
 transactionRef: transactionRef.trim() ||`TXN-${Date.now().toString().slice(-6)}`,
 notes: notes.trim(),
 date: paymentDate,
 });
 };

 return (
 <form onSubmit={handleSubmit} className="flex flex-col gap-4">
 {error && <Alert severity="error">{error}</Alert>}

 {/* Invoice Selector if not fixed */}
 {!invoice && (
 <div>
 <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
 Select Invoice to Settle *
 </label>
 <TextField
 select
 fullWidth
 size="small"
 value={selectedInvoiceId}
 onChange={handleInvoiceChange}
 required
 >
 {invoices
 .filter((inv) => inv.balanceDue > 0)
 .map((inv) => (
 <MenuItem key={inv.id} value={inv.id}>
 <div className="flex items-center justify-between w-full">
 <span className="font-semibold text-gray-900">{inv.id}</span>
 <span className="text-gray-600 text-sm ml-2">
 {inv.guestName} — Due: ${inv.balanceDue.toFixed(2)}
 </span>
 </div>
 </MenuItem>
 ))}
 </TextField>
 </div>
 )}

 {/* Invoice Summary Banner */}
 {currentInvoice && (
 <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
 <div>
 <div className="flex items-center gap-2">
 <ReceiptIcon fontSize="small" className="text-[#1b7f43]" />
 <span className="font-bold text-gray-900">{currentInvoice.id}</span>
 <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white text-gray-700 border border-gray-200">
 {currentInvoice.status}
 </span>
 </div>
 <p className="text-gray-600 mt-1">
 Guest: <span className="font-medium text-gray-900">{currentInvoice.guestName}</span> &bull; Room:{''}
 <span className="font-medium text-gray-900">{currentInvoice.roomNumber}</span> ({currentInvoice.roomType})
 </p>
 </div>
 <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
 <p className="text-xs text-gray-500">Remaining Balance Due</p>
 <p className="text-xl font-extrabold text-red-600">${currentInvoice.balanceDue.toFixed(2)}</p>
 </div>
 </div>
 )}

 {/* Payment Amount & Method */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
 Payment Amount ($) *
 </label>
 <TextField
 type="number"
 fullWidth
 size="small"
 value={amount}
 onChange={(e) => {
 setAmount(e.target.value);
 setError('');
 }}
 placeholder="0.00"
 inputProps={{ min: 0.01, max: maxPayable, step:'0.01' }}
 InputProps={{
 startAdornment: <InputAdornment position="start">$</InputAdornment>,
 }}
 required
 helperText={
 <span className="flex items-center justify-between text-xs mt-1">
 <button
 type="button"
 onClick={() => setAmount(maxPayable)}
 className="text-[#1b7f43] font-semibold hover:underline cursor-pointer"
 >
 Pay Full (${maxPayable.toFixed(2)})
 </button>
 <span className="text-gray-500">
 New Bal: ${remainingAfterPayment.toFixed(2)}
 </span>
 </span>
 }
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
 Payment Method *
 </label>
 <TextField
 select
 fullWidth
 size="small"
 value={paymentMethod}
 onChange={(e) => setPaymentMethod(e.target.value)}
 required
 >
 {PAYMENT_METHODS.map((method) => (
 <MenuItem key={method} value={method}>
 {method}
 </MenuItem>
 ))}
 </TextField>
 </div>
 </div>

 {/* Date & Reference */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
 Payment Date *
 </label>
 <TextField
 type="date"
 fullWidth
 size="small"
 value={paymentDate}
 onChange={(e) => setPaymentDate(e.target.value)}
 required
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
 Transaction Reference / Auth Code
 </label>
 <TextField
 fullWidth
 size="small"
 placeholder="e.g. TXN-894102 or POS #4"
 value={transactionRef}
 onChange={(e) => setTransactionRef(e.target.value)}
 helperText="Auto-generated if left blank"
 />
 </div>
 </div>

 {/* Notes */}
 <div>
 <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
 Internal Notes / Cashier Remark
 </label>
 <TextField
 fullWidth
 size="small"
 multiline
 rows={2}
 placeholder="e.g. Front desk collection during check-in"
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 />
 </div>

 {/* Post-Payment Preview Summary */}
 <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs text-gray-700 space-y-1.5">
 <div className="flex justify-between">
 <span>Current Balance:</span>
 <span className="font-semibold">${maxPayable.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-emerald-700 font-medium">
 <span>Payment Applied:</span>
 <span>-${numAmount > 0 ? numAmount.toFixed(2) :'0.00'}</span>
 </div>
 <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-900 text-sm">
 <span>Remaining Balance:</span>
 <span className={remainingAfterPayment === 0 ?'text-emerald-600' :'text-amber-600'}>
 ${remainingAfterPayment.toFixed(2)} {remainingAfterPayment === 0 ?'(Fully Paid)' :'(Partially Paid)'}
 </span>
 </div>
 </div>

 <DialogActions className="!px-0 !pt-2">
 <Button onClick={onClose} color="inherit" className="!normal-case !text-gray-600">
 Cancel
 </Button>
 <button
 type="submit"
 disabled={numAmount <= 0 || numAmount > maxPayable}
 className="px-5 py-2 bg-[#1b7f43] hover:bg-[#156736] disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs transition cursor-pointer"
 >
 Confirm & Record Payment
 </button>
 </DialogActions>
 </form>
 );
}

export default function RecordPaymentModal({
 open,
 onClose,
 invoice,
 invoices = [],
 onRecordPayment,
}) {
 const handleSave = (paymentData) => {
 onRecordPayment(paymentData);
 onClose();
 };

 return (
 <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className:'!rounded-xl !p-1' }}>
 <DialogTitle className="!flex !items-center !justify-between !p-3 !pb-2 border-b border-gray-100">
 <div>
 <h3 className="font-bold text-gray-900 text-base leading-tight">Record Payment</h3>
 <p className="text-[11px] text-gray-500 mt-0.5">Post a guest transaction directly against an invoice</p>
 </div>
 <IconButton size="small" onClick={onClose} className="!text-gray-400 hover:!text-gray-700">
 <CloseIcon sx={{ fontSize: 18 }} />
 </IconButton>
 </DialogTitle>

 <DialogContent className="!p-3.5 !pt-3">
 <RecordPaymentInnerForm
 key={invoice ? invoice.id :'general-record-payment'}
 invoice={invoice}
 invoices={invoices}
 onSave={handleSave}
 onClose={onClose}
 />
 </DialogContent>
 </Dialog>
 );
}
