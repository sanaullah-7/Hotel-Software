import React, { useState, useMemo } from 'react';
import {
  TextField,
  InputAdornment,
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
  AssignmentReturn as RefundIcon,
  CheckCircle as ApprovedIcon,
  HourglassEmpty as PendingIcon,
  Block as RejectedIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  getRefunds,
  getPayments,
  processRefund,
} from './paymentBillingStore';
import ProcessRefundModal from './components/ProcessRefundModal';
import RefundVoucherModal from './components/RefundVoucherModal';
import { printRefundVoucher } from './utils/printHelpers';

export default function Refunds() {
  const [refunds, setRefunds] = useState(() => getRefunds());
  const [payments, setPayments] = useState(() => getPayments());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal state
  const [isProcessRefundOpen, setIsProcessRefundOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState(null);

  const [selectedRefundForVoucher, setSelectedRefundForVoucher] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const reloadData = () => {
    setRefunds(getRefunds());
    setPayments(getPayments());
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
            Completed
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
            Pending Approval
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 whitespace-nowrap">
            Rejected
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
        message: `Refund ${refundData.amount ? `$${refundData.amount.toFixed(2)}` : ''} processed successfully!`,
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
    <div className="space-y-2 pb-2 animate-fade-in">
      {/* Top Action Bar (Heading Removed) */}
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        <button
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
          onClick={() => {
            setSelectedPaymentForRefund(null);
            setIsProcessRefundOpen(true);
          }}
        >
          + Process Refund
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Total Refunded */}
        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Refunded</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">
              ${metrics.totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">{metrics.completedCount} Processed</span>
          </div>
        </div>

        {/* Settled Returns */}
        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Settled Returns</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700">
              {metrics.completedCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Settled</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Pending Review</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-amber-600">
              ${metrics.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">{metrics.pendingCount} Pending</span>
          </div>
        </div>

        {/* Total Claims */}
        <div className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Claims</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">
              {metrics.totalRefundsCount}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Historical</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64 shrink-0">
          <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
          <input
            type="text"
            placeholder="Search refund ID, payment, guest..."
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

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-0.5 md:pb-0">
          {['All', 'Completed', 'Pending Approval'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Refunds Table */}
      {/* Refunds Table - Strictly 100% width with NO horizontal scroll */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden w-full">
        <div className="w-full">
          <table className="w-full table-fixed text-left border-collapse">
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
                <th className="py-2.5 px-2">Refund ID</th>
                <th className="py-2.5 px-1.5">Date</th>
                <th className="py-2.5 px-1.5">Payment & Inv #</th>
                <th className="py-2.5 px-2">Guest Details</th>
                <th className="py-2.5 px-1.5">Room</th>
                <th className="py-2.5 px-2">Reason</th>
                <th className="py-2.5 px-1.5">Method</th>
                <th className="py-2.5 px-1 text-right">Amount</th>
                <th className="py-2.5 px-1 text-center">Status</th>
                <th className="py-2.5 px-1 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredRefunds.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <RefundIcon className="!text-4xl text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No refunds recorded</p>
                    <p className="text-[11px] text-gray-400">All guest payments are in good standing</p>
                  </td>
                </tr>
              ) : (
                filteredRefunds.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2 px-2">
                      <span className="font-mono font-bold text-red-600 block text-xs truncate">
                        {r.id}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-gray-700 text-[10.5px] font-medium font-mono">
                      <span className="block truncate">{r.refundDate}</span>
                    </td>
                    <td className="py-2 px-1.5">
                      <span className="font-mono font-semibold text-gray-900 block text-xs truncate">{r.paymentId}</span>
                      <span className="text-[10px] font-mono text-gray-400 block truncate leading-tight">Inv: {r.invoiceId}</span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 block text-xs leading-tight break-words">{r.guestName}</span>
                        <span className="text-[10px] text-gray-400 block truncate" title={r.processedBy || 'Manager'}>By: {r.processedBy || 'Manager'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-1.5">
                      <span className="font-semibold text-gray-800 block text-xs truncate">Room {r.roomNumber}</span>
                      <span className="text-[10px] text-gray-400 block truncate leading-tight">{r.roomType}</span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="min-w-0">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9.5px] font-medium bg-gray-100 text-gray-800 leading-tight truncate max-w-full">
                          {r.reason}
                        </span>
                        {r.notes && (
                          <span className="block text-[9.5px] text-gray-400 truncate mt-0.5" title={r.notes}>
                            {r.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-1.5 text-[10px] font-medium text-gray-700 leading-tight">
                      <span className="block truncate">{r.refundMethod}</span>
                    </td>
                    <td className="py-2 px-1 text-right font-extrabold text-red-600 text-xs font-mono truncate">
                      ${r.amount?.toFixed(2)}
                    </td>
                    <td className="py-2 px-1 text-center">
                      {renderStatusBadge(r.status)}
                    </td>
                    <td className="py-2 px-1 text-center">
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
                            <ViewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Refund Voucher">
                          <IconButton
                            size="small"
                            sx={{ padding: '2px' }}
                            className="!text-red-600 hover:!bg-red-50"
                            onClick={() => {
                              printRefundVoucher(r);
                            }}
                          >
                            <PrintIcon sx={{ fontSize: 16 }} />
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
