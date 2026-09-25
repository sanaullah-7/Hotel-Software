import React, { useState, useMemo } from'react';
import {
 TextField,
 InputAdornment,
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
 HourglassEmpty as PendingIcon,
 Warning as WarningIcon,
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
import RecordPaymentModal from'./components/RecordPaymentModal';

export default function PendingPayments() {
 const [invoices, setInvoices] = useState(() => getInvoices());
 const [searchTerm, setSearchTerm] = useState('');
 const [urgencyFilter, setUrgencyFilter] = useState('All');

 // Modals state
 const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
 const [isDetailOpen, setIsDetailOpen] = useState(false);

 const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
 const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

 // Snackbar
 const [snackbar, setSnackbar] = useState({ open: false, message:'', severity:'success' });

 const reloadData = () => {
 setInvoices(getInvoices());
 };

 // Only invoices with balanceDue > 0
 const pendingInvoices = useMemo(() => {
 return invoices.filter((inv) => inv.balanceDue > 0);
 }, [invoices]);

 // Metrics
 const metrics = useMemo(() => {
 let totalReceivable = 0;
 let overdueAmount = 0;
 let overdueCount = 0;
 let partialAmount = 0;
 let partialCount = 0;

 pendingInvoices.forEach((inv) => {
 totalReceivable += inv.balanceDue || 0;
 if (inv.status ==='Overdue') {
 overdueCount += 1;
 overdueAmount += inv.balanceDue || 0;
 }
 if (inv.status ==='Partially Paid') {
 partialCount += 1;
 partialAmount += inv.balanceDue || 0;
 }
 });

 return {
 totalPendingCount: pendingInvoices.length,
 totalReceivable,
 overdueCount,
 overdueAmount,
 partialCount,
 partialAmount,
 };
 }, [pendingInvoices]);

 // Filtered
 const filteredInvoices = useMemo(() => {
 return pendingInvoices.filter((inv) => {
 const matchesSearch =
 inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
 inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
 inv.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
 String(inv.roomNumber).includes(searchTerm);

 let matchesUrgency = true;
 if (urgencyFilter ==='Overdue') matchesUrgency = inv.status ==='Overdue';
 if (urgencyFilter ==='Partially Paid') matchesUrgency = inv.status ==='Partially Paid';
 if (urgencyFilter ==='Unpaid') matchesUrgency = inv.status ==='Unpaid';

 return matchesSearch && matchesUrgency;
 });
 }, [pendingInvoices, searchTerm, urgencyFilter]);

 const handleRecordPayment = (paymentData) => {
 try {
 recordInvoicePayment(paymentData);
 reloadData();
 setSnackbar({
 open: true,
 message:`Payment of $${paymentData.amount.toFixed(2)} recorded successfully for ${paymentData.invoiceId}!`,
 severity:'success',
 });
 } catch (err) {
 setSnackbar({
 open: true,
 message: err.message ||'Failed to record payment.',
 severity:'error',
 });
 }
 };

 return (
 <div className="space-y-2 pb-2 animate-fade-in pt-1">

 {/* Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
 {/* Total Outstanding */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Total Receivable</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-base font-bold text-gray-900">
 ${metrics.totalReceivable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
 </span>
 <span className="text-[10px] text-amber-600 font-medium">{metrics.totalPendingCount} Folios</span>
 </div>
 </div>

 {/* Overdue Collection */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Overdue Collection</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-base font-bold text-red-600">
 ${metrics.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
 </span>
 <span className="text-[10px] text-red-500 font-medium">{metrics.overdueCount} Urgent</span>
 </div>
 </div>

 {/* Partially Paid */}
 <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
 <div className="flex justify-between items-center mb-0.5">
 <span className="text-gray-500 font-semibold text-[11px] truncate">Partially Paid</span>
 </div>
 <div className="flex items-baseline justify-between">
 <span className="text-base font-bold text-gray-900">
 ${metrics.partialAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
 </span>
 <span className="text-[10px] text-blue-600 font-medium">{metrics.partialCount} Invoices</span>
 </div>
 </div>
 </div>

 {/* Filter and Search */}
 <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
 <div className="relative w-full sm:w-64 shrink-0">
 <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
 <input
 type="text"
 placeholder="Search pending invoice #, guest, room..."
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

 {/* Filter buttons */}
 <div className="flex items-center gap-1 w-full md:w-auto pb-0.5 md:pb-0">
 {[
 { id:'All', label:'All Pending' },
 { id:'Overdue', label:'Overdue Only' },
 { id:'Partially Paid', label:'Partially Paid' },
 { id:'Unpaid', label:'Unpaid Only' },
 ].map((tab) => (
 <button
 key={tab.id}
 onClick={() => setUrgencyFilter(tab.id)}
 className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
 urgencyFilter === tab.id
 ?'bg-[#1b7f43] text-white shadow-xs'
 :'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 {tab.label}
 </button>
 ))}
 </div>
 <button
 className="px-3 py-1 bg-[#1b7f43] hover:bg-[#156736] text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
 onClick={() => {
 setSelectedInvoiceForPayment(null);
 setIsRecordPaymentOpen(true);
 }}
 >
 + Settle an Invoice
 </button>
 </div>

 {/* Pending Invoices Table - Strictly 100% width with NO horizontal scroll */}
 <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden w-full">
 <div className="w-full max-lg:overflow-x-auto lg:overflow-x-hidden min-w-0">
 <table className="w-full table-fixed text-left border-collapse max-lg:min-w-[850px]">
 <colgroup>
 <col style={{ width:'12%' }} />
 <col style={{ width:'18%' }} />
 <col style={{ width:'13%' }} />
 <col style={{ width:'11%' }} />
 <col style={{ width:'9%' }} />
 <col style={{ width:'9%' }} />
 <col style={{ width:'10%' }} />
 <col style={{ width:'9%' }} />
 <col style={{ width:'9%' }} />
 </colgroup>
 <thead>
 <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
 <th className="py-2.5 px-2">Invoice #</th>
 <th className="py-2.5 px-2">Guest Details</th>
 <th className="py-2.5 px-1.5">Room & Booking</th>
 <th className="py-2.5 px-1.5">Due Date</th>
 <th className="py-2.5 px-1 text-right">Invoiced</th>
 <th className="py-2.5 px-1 text-right">Paid</th>
 <th className="py-2.5 px-1 text-right">Balance Due</th>
 <th className="py-2.5 px-1 text-center">Status</th>
 <th className="py-2.5 px-1 text-center">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 text-xs">
 {filteredInvoices.length === 0 ? (
 <tr>
 <td colSpan={9} className="py-12 text-center text-gray-400">
 <PendingIcon className="!text-4xl text-gray-300 mb-2" />
 <p className="text-sm font-semibold text-gray-600">All pending accounts are currently settled!</p>
 <p className="text-[11px] text-gray-400">No outstanding or overdue invoices match your filters</p>
 </td>
 </tr>
 ) : (
 filteredInvoices.map((inv) => {
 const isOverdue = inv.status ==='Overdue';
 return (
 <tr
 key={inv.id}
 className={`hover:bg-gray-50/80 transition-colors ${
 isOverdue ?'bg-red-50/30' :''
 }`}
 >
 <td className="py-2 px-2">
 <span className="font-mono font-bold text-[#1b7f43] block text-xs truncate">{inv.id}</span>
 <span className="block text-[10px] font-mono text-gray-400 truncate leading-tight">
 Issued: {inv.issueDate}
 </span>
 </td>
 <td className="py-2 px-2">
 <div className="min-w-0">
 <span className="font-bold text-gray-900 block text-xs leading-tight break-words">{inv.guestName}</span>
 <span className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
 {inv.guestPhone ? (
 <>
 <PhoneIcon fontSize="inherit" className="text-gray-400 flex-shrink-0" />
 <span className="truncate">{inv.guestPhone}</span>
 </>
 ) : (
 <span className="truncate" title={inv.guestEmail ||'Direct Guest'}>{inv.guestEmail ||'Direct Guest'}</span>
 )}
 </span>
 </div>
 </td>
 <td className="py-2 px-1.5">
 <span className="font-semibold text-gray-800 block text-xs truncate">Room {inv.roomNumber}</span>
 <span className="text-[10px] text-gray-400 block font-mono truncate leading-tight">{inv.roomType} &bull; {inv.bookingId}</span>
 </td>
 <td className="py-2 px-1.5">
 <span className={`font-semibold text-xs block truncate ${isOverdue ?'text-red-600 font-bold' :'text-gray-700'}`}>
 {inv.dueDate}
 </span>
 {isOverdue && (
 <span className="inline-block mt-0.5 px-1 py-0.2 rounded bg-red-100 text-red-700 text-[9px] font-bold truncate max-w-full">
 Past Due
 </span>
 )}
 </td>
 <td className="py-2 px-1 text-right font-medium text-gray-700 font-mono text-xs truncate">
 ${inv.totalAmount?.toFixed(2)}
 </td>
 <td className="py-2 px-1 text-right font-medium text-emerald-600 font-mono text-xs truncate">
 ${inv.paidAmount?.toFixed(2)}
 </td>
 <td className="py-2 px-1 text-right">
 <span className="font-extrabold text-xs text-red-600 font-mono block truncate">
 ${inv.balanceDue?.toFixed(2)}
 </span>
 </td>
 <td className="py-2 px-1 text-center">
 {isOverdue ? (
 <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
 Overdue
 </span>
 ) : (
 <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
 {inv.status}
 </span>
 )}
 </td>
 <td className="py-2 px-1 text-center">
 <div className="flex items-center justify-center gap-1">
 <button
 className="px-2 py-0.5 bg-[#1b7f43] hover:bg-[#156736] text-white font-bold rounded text-[10.5px] cursor-pointer shadow-xs transition"
 onClick={() => {
 setSelectedInvoiceForPayment(inv);
 setIsRecordPaymentOpen(true);
 }}
 >
 Collect
 </button>
 <Tooltip title="View Folio Details">
 <IconButton
 size="small"
 sx={{ padding:'2px' }}
 className="!text-gray-400 hover:!text-gray-700"
 onClick={() => {
 setSelectedInvoiceForDetail(inv);
 setIsDetailOpen(true);
 }}
 >
 <ViewIcon sx={{ fontSize: 15 }} />
 </IconButton>
 </Tooltip>
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
 <InvoiceDetailModal
 open={isDetailOpen}
 onClose={() => setIsDetailOpen(false)}
 invoice={selectedInvoiceForDetail}
 onRecordPaymentClick={(inv) => {
 setSelectedInvoiceForPayment(inv);
 setIsRecordPaymentOpen(true);
 }}
 />

 <RecordPaymentModal
 open={isRecordPaymentOpen}
 onClose={() => setIsRecordPaymentOpen(false)}
 invoice={selectedInvoiceForPayment}
 invoices={invoices}
 onRecordPayment={handleRecordPayment}
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
