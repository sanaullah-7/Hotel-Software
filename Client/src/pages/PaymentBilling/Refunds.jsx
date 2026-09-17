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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Refunds</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track guest reimbursements, cancellation refunds, disputes, and manager approvals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="contained"
            className="!bg-red-600 hover:!bg-red-700 !text-white !font-semibold !normal-case !px-5 !py-2.5 !rounded-xl !shadow-sm cursor-pointer"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedPaymentForRefund(null);
              setIsProcessRefundOpen(true);
            }}
          >
            Process Refund
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Refunded */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Refunded</span>
            <RefundIcon className="text-rose-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">
              ${metrics.totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">{metrics.completedCount} Processed</span>
          </div>
        </div>

        {/* Settled Returns */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Settled Returns</span>
            <ApprovedIcon className="text-emerald-600 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700">
              {metrics.completedCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Settled</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Pending Review</span>
            <PendingIcon className="text-amber-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-amber-600">
              ${metrics.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">{metrics.pendingCount} Pending</span>
          </div>
        </div>

        {/* Total Claims */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Claims</span>
            <RefundIcon className="text-indigo-500 shrink-0" sx={{ fontSize: 17 }} />
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
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
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
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Completed', 'Pending Approval'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-2 whitespace-nowrap">Refund ID</th>
                <th className="py-2.5 px-1.5 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-1.5 whitespace-nowrap">Payment & Inv #</th>
                <th className="py-2.5 px-2">Guest Details</th>
                <th className="py-2.5 px-1.5 whitespace-nowrap">Room</th>
                <th className="py-2.5 px-2">Reason</th>
                <th className="py-2.5 px-1.5">Method</th>
                <th className="py-2.5 px-1.5 text-right whitespace-nowrap">Amount</th>
                <th className="py-2.5 px-1 text-center whitespace-nowrap">Status</th>
                <th className="py-2.5 px-1 text-center whitespace-nowrap w-14">Actions</th>
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
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className="font-mono font-bold text-red-600 block text-xs whitespace-nowrap">
                        {r.id}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-gray-700 text-[11px] font-medium whitespace-nowrap font-mono">
                      {r.refundDate}
                    </td>
                    <td className="py-2 px-1.5 whitespace-nowrap">
                      <span className="font-mono font-semibold text-gray-900 block text-xs whitespace-nowrap">{r.paymentId}</span>
                      <span className="text-[10px] font-mono text-gray-400 block whitespace-nowrap leading-tight">Inv: {r.invoiceId}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className="font-bold text-gray-900 block text-xs leading-tight">{r.guestName}</span>
                      <span className="text-[10px] text-gray-400 block truncate max-w-[110px]">By: {r.processedBy || 'Manager'}</span>
                    </td>
                    <td className="py-2 px-1.5 whitespace-nowrap">
                      <span className="font-semibold text-gray-800 block text-xs whitespace-nowrap">Room {r.roomNumber}</span>
                      <span className="text-[10px] text-gray-400 block whitespace-nowrap leading-tight">{r.roomType}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 leading-snug">
                        {r.reason}
                      </span>
                      {r.notes && (
                        <span className="block text-[10px] text-gray-400 truncate max-w-[120px] mt-0.5">
                          {r.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-1.5 text-[10.5px] font-medium text-gray-700 leading-tight">
                      {r.refundMethod}
                    </td>
                    <td className="py-2 px-1.5 text-right font-extrabold text-red-600 text-xs font-mono whitespace-nowrap">
                      ${r.amount?.toFixed(2)}
                    </td>
                    <td className="py-2 px-1 text-center whitespace-nowrap">
                      {renderStatusBadge(r.status)}
                    </td>
                    <td className="py-2 px-1 text-center whitespace-nowrap">
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
