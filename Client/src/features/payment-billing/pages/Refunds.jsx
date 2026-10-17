import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import {
  syncRefundsFromBackend,
  syncPaymentsFromBackend,
} from './paymentBillingStore';
import { billingService } from '../../../services/billingService';
import {
  toFrontendRefundList,
  toFrontendPaymentList,
  toBackendRefundPayload,
} from '../adapters/billingAdapter';
import ProcessRefundModal from './components/ProcessRefundModal';
import RefundVoucherModal from './components/RefundVoucherModal';

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Backend authoritative data fetching
  const fetchRefundsAndPayments = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [refundsRes, paymentsRes] = await Promise.all([
        billingService.getRefunds().catch((err) => {
          console.error('Failed to fetch refunds:', err);
          return null;
        }),
        billingService.getPayments().catch((err) => {
          console.error('Failed to fetch payments:', err);
          return null;
        }),
      ]);

      if (refundsRes?.data) {
        const rawRefunds = Array.isArray(refundsRes.data.refunds)
          ? refundsRes.data.refunds
          : (Array.isArray(refundsRes.data) ? refundsRes.data : []);
        const adaptedRefunds = toFrontendRefundList(rawRefunds);
        setRefunds(adaptedRefunds);
        syncRefundsFromBackend(adaptedRefunds);
      } else {
        setRefunds([]);
      }

      if (paymentsRes?.data) {
        const rawPayments = Array.isArray(paymentsRes.data.payments)
          ? paymentsRes.data.payments
          : (Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
        const adaptedPayments = toFrontendPaymentList(rawPayments);
        setPayments(adaptedPayments);
        syncPaymentsFromBackend(adaptedPayments);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error('Backend refunds fetch error:', err);
      setError(err.message || 'Failed to load refunds');
      setRefunds([]);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRefundsAndPayments();
  }, [fetchRefundsAndPayments]);

  // Modal state
  const [isProcessRefundOpen, setIsProcessRefundOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState(null);

  const [selectedRefundForVoucher, setSelectedRefundForVoucher] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const reloadData = () => {
    fetchRefundsAndPayments();
  };

  // Metrics
  const metrics = useMemo(() => {
    let totalRefunded = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let pendingAmount = 0;

    refunds.forEach((r) => {
      if (r.status === 'Completed') {
        totalRefunded += r.amount || 0;
        completedCount += 1;
      } else if (r.status === 'Pending Approval') {
        pendingCount += 1;
        pendingAmount += r.amount || 0;
      }
    });

    return {
      totalRefundsCount: refunds.length,
      totalRefunded,
      completedCount,
      pendingCount,
      pendingAmount,
    };
  }, [refunds]);

  // Filtered list
  const filteredRefunds = useMemo(() => {
    return refunds.filter((r) => {
      const matchesSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(r.roomNumber).includes(searchTerm);

      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [refunds, searchTerm, statusFilter]);

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Completed
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Pending Approval
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-red-100 text-red-800 border border-red-200">
            Rejected
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

      await fetchRefundsAndPayments();
      setSnackbar({
        open: true,
        message: `Refund ${refundData.amount ? `$${refundData.amount.toFixed(2)}` : ''} processed successfully!`,
        severity: 'success',
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to process refund.';
      setSnackbar({
        open: true,
        message: msg,
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
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">${metrics.totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-gray-500 font-medium">Total Refunded ({metrics.completedCount} Processed)</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
            <MoneyOffIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{metrics.completedCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Settled Returns</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-green-50 text-green-600">
            <CheckCircleIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">${metrics.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div className="text-[11px] text-gray-500 font-medium">Pending Review ({metrics.pendingCount} Pending)</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
            <PendingIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-gray-900 leading-none mb-1">{metrics.totalRefundsCount}</div>
            <div className="text-[11px] text-gray-500 font-medium">Total Claims</div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
            <GavelIcon sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:w-60 shrink-0">
          <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 15 }} />
          <input
            type="text"
            placeholder="Search refund ID, payment, guest..."
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

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 w-full md:w-auto pb-0.5 md:pb-0">
          {['All', 'Completed', 'Pending Approval'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-green-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button
          className="px-2.5 py-1 bg-green-800 hover:bg-green-700 text-white rounded text-[11px] font-semibold shadow-xs transition cursor-pointer"
          onClick={() => {
            setSelectedPaymentForRefund(null);
            setIsProcessRefundOpen(true);
          }}
        >
          + Process Refund
        </button>
      </div>

      {/* Refunds Table - Strictly 100% width with NO horizontal scroll */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden w-full">
        <div className="w-full max-lg:overflow-x-auto lg:overflow-x-hidden min-w-0">
          <table className="w-full table-fixed text-left border-collapse max-lg:min-w-[850px]">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                <th className="py-2 px-2">Refund ID</th>
                <th className="py-2 px-1.5">Date</th>
                <th className="py-2 px-1.5">Payment & Inv #</th>
                <th className="py-2 px-2">Guest Details</th>
                <th className="py-2 px-1.5">Room</th>
                <th className="py-2 px-2">Reason</th>
                <th className="py-2 px-1.5">Method</th>
                <th className="py-2 px-1 text-right">Amount</th>
                <th className="py-2 px-1 text-center">Status</th>
                <th className="py-2 px-1 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400">
                    <RefundIcon className="!text-3xl text-gray-300 mb-1" />
                    <p className="text-[12px] font-semibold text-gray-600">No refunds recorded</p>
                    <p className="text-[10.5px] text-gray-400">All guest payments are in good standing</p>
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-1.5 px-2">
                      <span className="font-mono font-bold text-green-800 block text-[11px] truncate">
                        {r.id}
                      </span>
                    </td>
                    <td className="py-1.5 px-1.5 text-gray-700 text-[10px] font-medium font-mono">
                      <span className="block truncate">{r.refundDate}</span>
                    </td>
                    <td className="py-1.5 px-1.5">
                      <span className="font-mono font-semibold text-gray-900 block text-[11px] truncate">{r.paymentId}</span>
                      <span className="text-[9.5px] font-mono text-gray-400 block truncate leading-tight">Inv: {r.invoiceId}</span>
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 block text-[11px] leading-tight break-words">{r.guestName}</span>
                        <span className="text-[9.5px] text-gray-400 block truncate" title={r.processedBy || 'Manager'}>By: {r.processedBy || 'Manager'}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-1.5">
                      <span className="font-semibold text-gray-800 block text-[11px] truncate">Room {r.roomNumber}</span>
                      <span className="text-[9.5px] text-gray-400 block truncate leading-tight">{r.roomType}</span>
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="min-w-0">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800 leading-tight truncate max-w-full">
                          {r.reason}
                        </span>
                        {r.notes && (
                          <span className="block text-[9px] text-gray-400 truncate mt-0.5" title={r.notes}>
                            {r.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 px-1.5 text-[9.5px] font-medium text-gray-700 leading-tight">
                      <span className="block truncate">{r.refundMethod}</span>
                    </td>
                    <td className="py-1.5 px-1 text-right font-extrabold text-green-800 text-[11px] font-mono truncate">
                      ${r.amount?.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      {renderStatusBadge(r.status)}
                    </td>
                    <td className="py-1.5 px-1 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <Tooltip title="View Refund Voucher">
                          <IconButton
                            size="small"
                            sx={{ padding: '2px' }}
                            className="!text-gray-500 hover:!text-gray-900"
                            onClick={() => {
                              setSelectedRefundForVoucher(r);
                              setIsVoucherModalOpen(true);
                            }}
                          >
                            <ViewIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Refund Voucher">
                          <IconButton
                            size="small"
                            sx={{ padding: '2px' }}
                            className="!text-green-800 hover:!bg-green-50"
                            onClick={() => {
                              // Print handler
                            }}
                          >
                            <PrintIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ProcessRefundModal
        open={isProcessRefundOpen}
        onClose={() => setIsProcessRefundOpen(false)}
        payment={selectedPaymentForRefund}
        payments={payments}
        onProcessRefund={handleProcessRefund}
      />

      <RefundVoucherModal
        open={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        refund={selectedRefundForVoucher}
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
