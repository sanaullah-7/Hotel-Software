import React, { useState, useMemo } from'react';
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
} from'@mui/icons-material';
import {
 getPayments,
 processRefund,
} from'./paymentBillingStore';
import PaymentDetailModal from'./components/PaymentDetailModal';
import ProcessRefundModal from'./components/ProcessRefundModal';

export default function PaymentHistory() {
 const [payments, setPayments] = useState(() => getPayments());
 const [searchTerm, setSearchTerm] = useState('');
 const [methodFilter, setMethodFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All');

 // Modals state
 const [selectedPaymentForDetail, setSelectedPaymentForDetail] = useState(null);
 const [isDetailOpen, setIsDetailOpen] = useState(false);

 const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState(null);
 const [isRefundOpen, setIsRefundOpen] = useState(false);

 // Snackbar
 const [snackbar, setSnackbar] = useState({ open: false, message:'', severity:'success' });

 const reloadData = () => {
 setPayments(getPayments());
 };

 // Metrics
 const metrics = useMemo(() => {
 let totalCollected = 0;
 let cardAmount = 0;
 let cardCount = 0;
 let otherAmount = 0;
 let otherCount = 0;
 let totalRefunded = 0;

 payments.forEach((p) => {
 const amt = p.amount || 0;
 totalCollected += amt;
 totalRefunded += p.refundedAmount || 0;

 if (p.paymentMethod.includes('Card')) {
 cardAmount += amt;
 cardCount += 1;
 } else {
 otherAmount += amt;
 otherCount += 1;
 }
 });

 return {
 totalTransactions: payments.length,
 totalCollected,
 cardAmount,
 cardCount,
 otherAmount,
 otherCount,
 totalRefunded,
 netRevenue: totalCollected - totalRefunded,
 };
 }, [payments]);

 // Filtered payments
 const filteredPayments = useMemo(() => {
 return payments.filter((p) => {
 const matchesSearch =
 p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
 p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
 p.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 p.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
 p.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
 String(p.roomNumber).includes(searchTerm);

 const matchesMethod = methodFilter ==='All' || p.paymentMethod === methodFilter;
 const matchesStatus = statusFilter ==='All' || p.status === statusFilter;

 return matchesSearch && matchesMethod && matchesStatus;
 });
 }, [payments, searchTerm, methodFilter, statusFilter]);

 const renderStatusBadge = (status) => {
 switch (status) {
 case'Completed':
 return (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
 Completed
 </span>
 );
 case'Partially Refunded':
 return (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
 Partially Refunded
 </span>
 );
 case'Refunded':
 return (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
 Refunded
 </span>
 );
 case'Failed':
 return (
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-800 border border-gray-300">
 Failed
 </span>
 );
 default:
 return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{status}</span>;
 }
 };

 const handleProcessRefund = (refundData) => {
 try {
 processRefund(refundData);
 reloadData();
 setSnackbar({
 open: true,
 message:`Refund of $${refundData.amount.toFixed(2)} processed successfully for ${refundData.paymentId}!`,
 severity:'success',
 });
 } catch (err) {
 setSnackbar({
 open: true,
 message: err.message ||'Failed to process refund.',
 severity:'error',
 });
 }
 };

 return (
 <div className="space-y-2 pb-2 animate-fade-in">
 {/* Metric Cards (Heading Removed) */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
 {/* Gross Transactions */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Gross Collected</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-base font-bold text-gray-900">${metrics.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
 <span className="text-[10px] text-gray-400 font-medium">{metrics.totalTransactions} TXNs</span>
 </div>
 </div>

 {/* Card Payments */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Card Payments</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-base font-bold text-gray-900">${metrics.cardAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
 <span className="text-[10px] text-blue-600 font-medium">{metrics.cardCount} Cards</span>
 </div>
 </div>

 {/* Cash & Alternative */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Cash & Alternative</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-base font-bold text-gray-900">${metrics.otherAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
 <span className="text-[10px] text-purple-600 font-medium">Cash / Wire</span>
 </div>
 </div>

 {/* Net Settled Revenue */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Net Settled</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-base font-bold text-emerald-700">${metrics.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
 <span className="text-[10px] text-emerald-600 font-semibold">After Refunds</span>
 </div>
 </div>
 </div>

 {/* Filter and Search Bar */}
 <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
 <div className="relative w-full sm:w-64 shrink-0">
 <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
 <input
 type="text"
 placeholder="Search TXN #, guest, invoice..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
 />
 {searchTerm && (
 <button
 onClick={() => setSearchTerm('')}
 className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
 >
 <ClearIcon sx={{ fontSize: 14 }} />
 </button>
 )}
 </div>

 <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
 {/* Method Filter */}
 <select
 value={methodFilter}
 onChange={(e) => setMethodFilter(e.target.value)}
 className="py-1.5 px-2.5 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
 >
 <option value="All">All Methods</option>
 <option value="Credit Card">Credit Card</option>
 <option value="Debit Card">Debit Card</option>
 <option value="Cash">Cash</option>
 <option value="Bank Transfer">Bank Transfer</option>
 <option value="UPI">UPI</option>
 <option value="Digital Wallet">Digital Wallet</option>
 </select>

 {/* Status Filter Buttons */}
 <div className="flex items-center gap-1 pb-0.5 md:pb-0">
 {['All','Completed','Partially Refunded','Refunded'].map((status) => (
 <button
 key={status}
 onClick={() => setStatusFilter(status)}
 className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
 statusFilter === status
 ?'bg-[#1b7f43] text-white shadow-xs'
 :'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 {status}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Payment Ledger Table - Strictly 100% width with NO horizontal scroll */}
 <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden w-full">
 <div className="w-full">
 <table className="w-full table-fixed text-left border-collapse">
 <colgroup>
 <col style={{ width:'12%' }} />
 <col style={{ width:'11%' }} />
 <col style={{ width:'16%' }} />
 <col style={{ width:'11%' }} />
 <col style={{ width:'9%' }} />
 <col style={{ width:'10%' }} />
 <col style={{ width:'9%' }} />
 <col style={{ width:'8%' }} />
 <col style={{ width:'8%' }} />
 <col style={{ width:'6%' }} />
 </colgroup>
 <thead>
 <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
 <th className="py-2.5 px-2">Receipt / Ref #</th>
 <th className="py-2.5 px-1.5">Date & Time</th>
 <th className="py-2.5 px-2">Guest Details</th>
 <th className="py-2.5 px-1.5">Room & Booking</th>
 <th className="py-2.5 px-1.5">Invoice #</th>
 <th className="py-2.5 px-1.5">Method</th>
 <th className="py-2.5 px-1 text-right">Amount</th>
 <th className="py-2.5 px-1 text-right">Refunded</th>
 <th className="py-2.5 px-1 text-center">Status</th>
 <th className="py-2.5 px-1 text-center">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-xs">
 {filteredPayments.length === 0 ? (
 <tr>
 <td colSpan={10} className="py-12 text-center text-gray-400">
 <ReceiptIcon className="!text-4xl text-gray-300 mb-2" />
 <p className="text-sm font-semibold text-gray-600">No payment transactions found</p>
 <p className="text-[11px] text-gray-400">Try clearing filters or search terms</p>
 </td>
 </tr>
 ) : (
 filteredPayments.map((p) => {
 const refundable = (p.amount || 0) - (p.refundedAmount || 0);
 return (
 <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
 <td className="py-2 px-2">
 <span className="font-mono font-bold text-[#1b7f43] block text-xs truncate">{p.id}</span>
 <span className="text-[10px] font-mono text-gray-400 block truncate leading-tight">{p.transactionRef}</span>
 </td>
 <td className="py-2 px-1.5 text-gray-700 text-[10.5px] font-medium font-mono">
 <span className="block truncate">{p.paymentDate}</span>
 </td>
 <td className="py-2 px-2">
 <div className="min-w-0">
 <span className="font-bold text-gray-900 block text-xs leading-tight break-words">{p.guestName}</span>
 <span className="text-[10px] text-gray-500 block truncate" title={p.guestEmail ||'Direct Guest'}>{p.guestEmail ||'Direct Guest'}</span>
 </div>
 </td>
 <td className="py-2 px-1.5">
 <span className="font-semibold text-gray-800 block text-xs truncate">Room {p.roomNumber}</span>
 <span className="text-[10px] font-mono text-gray-400 block truncate leading-tight">{p.bookingId}</span>
 </td>
 <td className="py-2 px-1.5 font-mono font-medium text-gray-700 text-xs truncate">
 {p.invoiceId}
 </td>
 <td className="py-2 px-1.5">
 <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 truncate max-w-full">
 {p.paymentMethod}
 </span>
 </td>
 <td className="py-2 px-1 text-right font-extrabold text-emerald-700 font-mono text-xs truncate">
 ${p.amount?.toFixed(2)}
 </td>
 <td className="py-2 px-1 text-right font-medium text-red-600 font-mono text-xs truncate">
 {p.refundedAmount > 0 ?`-$${p.refundedAmount.toFixed(2)}` :'$0.00'}
 </td>
 <td className="py-2 px-1 text-center">
 {renderStatusBadge(p.status)}
 </td>
 <td className="py-2 px-1 text-center">
 <div className="flex items-center justify-center gap-0.5">
 <Tooltip title="View Receipt">
 <IconButton
 size="small"
 sx={{ padding:'2px' }}
 className="!text-gray-500 hover:!text-[#1b7f43] hover:!bg-emerald-50"
 onClick={() => {
 setSelectedPaymentForDetail(p);
 setIsDetailOpen(true);
 }}
 >
 <ViewIcon sx={{ fontSize: 16 }} />
 </IconButton>
 </Tooltip>
 {p.status !=='Refunded' && refundable > 0 && (
 <Tooltip title="Process Refund">
 <IconButton
 size="small"
 sx={{ padding:'2px' }}
 className="!text-red-600 hover:!bg-red-50"
 onClick={() => {
 setSelectedPaymentForRefund(p);
 setIsRefundOpen(true);
 }}
 >
 <RefundIcon sx={{ fontSize: 16 }} />
 </IconButton>
 </Tooltip>
 )}
 </div>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Modals */}
 <PaymentDetailModal
 open={isDetailOpen}
 onClose={() => setIsDetailOpen(false)}
 payment={selectedPaymentForDetail}
 onInitiateRefund={(p) => {
 setSelectedPaymentForRefund(p);
 setIsRefundOpen(true);
 }}
 />

 <ProcessRefundModal
 open={isRefundOpen}
 onClose={() => setIsRefundOpen(false)}
 payment={selectedPaymentForRefund}
 payments={payments}
 onProcessRefund={handleProcessRefund}
 />

 {/* Toast */}
 <Snackbar
 open={snackbar.open}
 autoHideDuration={4500}
 onClose={() => setSnackbar({ ...snackbar, open: false })}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 >
 <Alert
 onClose={() => setSnackbar({ ...snackbar, open: false })}
 severity={snackbar.severity}
 variant="filled"
 className="!font-medium !rounded-xl shadow-lg"
 >
 {snackbar.message}
 </Alert>
 </Snackbar>
 </div>
 );
}
