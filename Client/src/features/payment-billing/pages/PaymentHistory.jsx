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
  FormControl,
  Select,
  InputLabel,
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
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import {
  syncPaymentsFromBackend,
  dispatchFinancialEvent,
  REFUNDS_UPDATED_EVENT,
} from './paymentBillingStore';
import { billingService } from '../../../services/billingService';
import { toFrontendPaymentList, toBackendRefundPayload } from '../adapters/billingAdapter';
import PaymentDetailModal from './components/PaymentDetailModal';
import ProcessRefundModal from './components/ProcessRefundModal';

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Backend authoritative data fetching
  const fetchPayments = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await billingService.getPayments();
      const rawList = Array.isArray(res?.data?.payments)
        ? res.data.payments
        : (Array.isArray(res?.data)
          ? res.data
          : (Array.isArray(res?.payments) ? res.payments : null));
      if (Array.isArray(rawList)) {
        const adapted = toFrontendPaymentList(rawList);
        setPayments(adapted);
        syncPaymentsFromBackend(adapted);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.warn('Backend payments fetch failed:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load payments from server.';
      setError(errMsg);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Modals state
  const [selectedPaymentForDetail, setSelectedPaymentForDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState(null);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const reloadData = () => {
    fetchPayments();
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Completed
          </span>
        );
      case 'Partially Refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Partially Refunded
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-red-100 text-red-800 border border-red-200">
            Refunded
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-gray-200 text-gray-800 border border-gray-300">
            Failed
          </span>
        );
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const handleProcessRefund = async (refundData) => {
    try {
      const matched = payments.find(
        (p) => p.id === refundData.paymentId || p.paymentId === refundData.paymentId
      );
      const backendPayload = toBackendRefundPayload(refundData);
      if (matched?._id) {
        backendPayload.payment_id = matched._id;
      }

      await billingService.createRefund(backendPayload);

      await fetchPayments();
      dispatchFinancialEvent(REFUNDS_UPDATED_EVENT, {
        domain: 'refunds',
        action: 'process_refund',
        paymentId: refundData.paymentId,
        amount: refundData.amount,
      });

      setSnackbar({
        open: true,
        message: `Refund of $${refundData.amount.toFixed(2)} processed successfully for ${refundData.paymentId}!`,
        severity: 'success',
      });
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to process refund.';
      setSnackbar({
        open: true,
        message: errMsg,
        severity: 'error',
      });
      throw err;
    }
  };

  return (
    <div className="space-y-2 pb-2 animate-fade-in pt-1">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-1">
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">${metrics.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-gray-500 font-medium">Gross Collected ({metrics.totalTransactions} TXNs)</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
            <PaymentIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">${metrics.cardAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-gray-500 font-medium">Card Payments ({metrics.cardCount} Cards)</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600">
            <ReceiptIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">${metrics.otherAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-gray-500 font-medium">Cash & Alternative</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
            <PendingIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">${metrics.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-gray-500 font-medium">Net Settled Revenue</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-green-50 text-green-600">
            <TrendingUpIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:w-60 shrink-0">
          <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 15 }} />
          <input
            type="text"
            placeholder="Search TXN #, guest, invoice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-7 py-1 bg-white border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ClearIcon sx={{ fontSize: 13 }} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="py-1 px-2 border border-gray-200 rounded-lg text-[10.5px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-[#1b7f43]"
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
            {['All', 'Completed', 'Partially Refunded', 'Refunded'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#1b7f43] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
        <div className="w-full max-lg:overflow-x-auto lg:overflow-x-hidden min-w-0">
          <table className="w-full table-fixed text-left border-collapse max-lg:min-w-[850px]">
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                <th className="py-2 px-2">Receipt / Ref #</th>
                <th className="py-2 px-1.5">Date & Time</th>
                <th className="py-2 px-2">Guest Details</th>
                <th className="py-2 px-1.5">Room & Booking</th>
                <th className="py-2 px-1.5">Invoice #</th>
                <th className="py-2 px-1.5">Method</th>
                <th className="py-2 px-1 text-right">Amount</th>
                <th className="py-2 px-1 text-right">Refunded</th>
                <th className="py-2 px-1 text-center">Status</th>
                <th className="py-2 px-1 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400">
                    <ReceiptIcon className="!text-3xl text-gray-300 mb-1" />
                    <p className="text-[12px] font-semibold text-gray-600">
                      {payments.length === 0 ? 'No payments recorded' : 'No payment transactions found'}
                    </p>
                    <p className="text-[10.5px] text-gray-400">
                      {payments.length === 0 ? 'No guest transactions posted yet' : 'Try clearing filters or search terms'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const refundable = (p.amount || 0) - (p.refundedAmount || 0);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-1.5 px-2">
                        <span className="font-mono font-bold text-[#1b7f43] block text-[11px] truncate">{p.id}</span>
                        <span className="text-[9.5px] font-mono text-gray-400 block truncate leading-tight">{p.transactionRef}</span>
                      </td>
                      <td className="py-1.5 px-1.5 text-gray-700 text-[10px] font-medium font-mono">
                        <span className="block truncate">{p.paymentDate}</span>
                      </td>
                      <td className="py-1.5 px-2">
                        <div className="min-w-0">
                          <span className="font-bold text-gray-900 block text-[11px] leading-tight break-words">{p.guestName}</span>
                          <span className="text-[9.5px] text-gray-500 block truncate" title={p.guestEmail || 'Direct Guest'}>{p.guestEmail || 'Direct Guest'}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-1.5">
                        <span className="font-semibold text-gray-800 block text-[11px] truncate">Room {p.roomNumber}</span>
                        <span className="text-[9.5px] font-mono text-gray-400 block truncate leading-tight">{p.bookingId}</span>
                      </td>
                      <td className="py-1.5 px-1.5 font-mono font-medium text-gray-700 text-[11px] truncate">
                        {p.invoiceId}
                      </td>
                      <td className="py-1.5 px-1.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-gray-100 text-gray-800 truncate max-w-full">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-1.5 px-1 text-right font-extrabold text-emerald-700 font-mono text-[11px] truncate">
                        ${p.amount?.toFixed(2)}
                      </td>
                      <td className="py-1.5 px-1 text-right font-medium text-red-600 font-mono text-[11px] truncate">
                        {p.refundedAmount > 0 ? `-$${p.refundedAmount.toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="py-1.5 px-1 text-center">
                        {renderStatusBadge(p.status)}
                      </td>
                      <td className="py-1.5 px-1 text-center">
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
                              <ViewIcon sx={{ fontSize: 15 }} />
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
                                <RefundIcon sx={{ fontSize: 15 }} />
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
