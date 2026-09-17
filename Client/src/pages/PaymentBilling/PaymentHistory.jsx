import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import {
  getPayments,
  processRefund,
} from './paymentBillingStore';
import PaymentDetailModal from './components/PaymentDetailModal';
import ProcessRefundModal from './components/ProcessRefundModal';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

      const matchesMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [payments, searchTerm, methodFilter, statusFilter]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
            Completed
          </span>
        );
      case 'Partially Refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
            Partially Refunded
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 whitespace-nowrap">
            Refunded
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-800 border border-gray-300 whitespace-nowrap">
            Failed
          </span>
        );
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 whitespace-nowrap">{status}</span>;
    }
  };

  const handleProcessRefund = (refundData) => {
    try {
      processRefund(refundData);
      reloadData();
      setSnackbar({
        open: true,
        message: `Refund of $${refundData.amount.toFixed(2)} processed successfully for ${refundData.paymentId}!`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to process refund.',
        severity: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete immutable ledger of all guest transactions, settlements, and payment method breakdowns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outlined"
            onClick={() => window.print()}
            startIcon={<ExportIcon />}
            className="!normal-case !border-gray-300 !text-gray-700 hover:!bg-gray-50 !font-semibold !rounded-xl !shadow-none"
          >
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Gross Transactions */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Gross Collected</span>
            <TransactionIcon className="text-slate-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">${metrics.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-gray-400 font-medium">{metrics.totalTransactions} TXNs</span>
          </div>
        </div>

        {/* Card Payments */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Card Payments</span>
            <CreditCardIcon className="text-blue-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">${metrics.cardAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-blue-600 font-medium">{metrics.cardCount} Cards</span>
          </div>
        </div>

        {/* Cash & Alternative */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Cash & Alternative</span>
            <CashIcon className="text-purple-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">${metrics.otherAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-purple-600 font-medium">Cash / Wire</span>
          </div>
        </div>

        {/* Net Settled Revenue */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Net Settled</span>
            <PaidIcon className="text-emerald-600 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-emerald-700">${metrics.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">After Refunds</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
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

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Method Filter */}
          <div className="w-48">
            <TextField
              select
              size="small"
              fullWidth
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="All">All Methods</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="Debit Card">Debit Card</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Digital Wallet">Digital Wallet</MenuItem>
            </TextField>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['All', 'Completed', 'Partially Refunded', 'Refunded'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#1b7f43] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-2 whitespace-nowrap">Receipt / Ref #</th>
                <th className="py-2.5 px-2 whitespace-nowrap">Date & Time</th>
                <th className="py-2.5 px-2">Guest Details</th>
                <th className="py-2.5 px-2 whitespace-nowrap">Room & Booking</th>
                <th className="py-2.5 px-1.5 whitespace-nowrap">Invoice #</th>
                <th className="py-2.5 px-1.5 whitespace-nowrap">Method</th>
                <th className="py-2.5 px-1.5 text-right whitespace-nowrap">Amount</th>
                <th className="py-2.5 px-1.5 text-right whitespace-nowrap">Refunded</th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap">Status</th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-16">Actions</th>
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
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#1b7f43] block text-xs whitespace-nowrap">{p.id}</span>
                        <span className="text-[10px] font-mono text-gray-400 block whitespace-nowrap leading-tight">{p.transactionRef}</span>
                      </td>
                      <td className="py-2 px-2 text-gray-700 text-[11px] font-medium whitespace-nowrap">
                        {p.paymentDate}
                      </td>
                      <td className="py-2 px-2">
                        <span className="font-bold text-gray-900 block text-xs leading-tight">{p.guestName}</span>
                        <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">{p.guestEmail || 'Direct Guest'}</span>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 block text-xs whitespace-nowrap">Room {p.roomNumber}</span>
                        <span className="text-[10px] font-mono text-gray-400 block whitespace-nowrap leading-tight">{p.bookingId}</span>
                      </td>
                      <td className="py-2 px-1.5 font-mono font-medium text-gray-700 whitespace-nowrap text-xs">
                        {p.invoiceId}
                      </td>
                      <td className="py-2 px-1.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2 px-1.5 text-right font-extrabold text-emerald-700 font-mono whitespace-nowrap">
                        ${p.amount?.toFixed(2)}
                      </td>
                      <td className="py-2 px-1.5 text-right font-medium text-red-600 font-mono whitespace-nowrap">
                        {p.refundedAmount > 0 ? `-$${p.refundedAmount.toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="py-2 px-1.5 text-center whitespace-nowrap">
                        {renderStatusBadge(p.status)}
                      </td>
                      <td className="py-2 px-1.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-0.5">
                          <Tooltip title="View Receipt">
                            <IconButton
                              size="small"
                              sx={{ padding: '2px' }}
                              className="!text-gray-500 hover:!text-[#1b7f43] hover:!bg-emerald-50"
                              onClick={() => {
                                setSelectedPaymentForDetail(p);
                                setIsDetailOpen(true);
                              }}
                            >
                              <ViewIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          {p.status !== 'Refunded' && refundable > 0 && (
                            <Tooltip title="Process Refund">
                              <IconButton
                                size="small"
                                sx={{ padding: '2px' }}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
