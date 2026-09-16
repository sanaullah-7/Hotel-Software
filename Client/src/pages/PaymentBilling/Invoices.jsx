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
  ReceiptLong as InvoiceIcon,
  Payment as PaymentIcon,
  Visibility as ViewIcon,
  CheckCircle as PaidIcon,
  HourglassEmpty as PendingIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import {
  getInvoices,
  getPayments,
  recordInvoicePayment,
} from './paymentBillingStore';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import RecordPaymentModal from './components/RecordPaymentModal';

export default function Invoices() {
  const [invoices, setInvoices] = useState(() => getInvoices());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Sync state helper
  const reloadData = () => {
    setInvoices(getInvoices());
  };

  // Status Chip Renderer
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
            Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
            Partially Paid
          </span>
        );
      case 'Unpaid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap">
            Unpaid
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse whitespace-nowrap">
            Overdue
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300 whitespace-nowrap">
            Draft
          </span>
        );
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 whitespace-nowrap">{status}</span>;
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalBalanceDue = 0;
    let overdueCount = 0;
    let overdueAmount = 0;

    invoices.forEach((inv) => {
      totalInvoiced += inv.totalAmount || 0;
      totalPaid += inv.paidAmount || 0;
      totalBalanceDue += inv.balanceDue || 0;
      if (inv.status === 'Overdue') {
        overdueCount += 1;
        overdueAmount += inv.balanceDue || 0;
      }
    });

    return {
      totalInvoiced,
      totalPaid,
      totalBalanceDue,
      overdueCount,
      overdueAmount,
      collectionRate: totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : 0,
    };
  }, [invoices]);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(inv.roomNumber).includes(searchTerm);

      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handleRecordPayment = (paymentData) => {
    try {
      recordInvoicePayment(paymentData);
      reloadData();
      setSnackbar({
        open: true,
        message: `Payment of $${paymentData.amount.toFixed(2)} recorded successfully for ${paymentData.invoiceId}!`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to record payment.',
        severity: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage guest folios, monitor collection rates, and issue itemized statements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="contained"
            className="!bg-[#1b7f43] hover:!bg-[#156736] !text-white !font-semibold !normal-case !px-5 !py-2.5 !rounded-xl !shadow-sm cursor-pointer"
            startIcon={<PaymentIcon />}
            onClick={() => {
              setSelectedInvoiceForPayment(null);
              setIsRecordPaymentOpen(true);
            }}
          >
            Record Payment
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Invoiced */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Invoiced</span>
            <InvoiceIcon className="text-slate-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">${metrics.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-gray-400 font-medium">{invoices.length} Folios</span>
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Collected Revenue</span>
            <PaidIcon className="text-emerald-600 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-emerald-700">${metrics.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">{metrics.collectionRate}%</span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Outstanding Balance</span>
            <PendingIcon className="text-amber-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">${metrics.totalBalanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-amber-600 font-medium">Pending</span>
          </div>
        </div>

        {/* Overdue Invoices */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Overdue Invoices</span>
            <WarningIcon className="text-red-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-red-600">${metrics.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-red-500 font-medium">{metrics.overdueCount} Past Due</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64 shrink-0">
          <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
          <input
            type="text"
            placeholder="Search invoice #, guest, room..."
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
          {['All', 'Paid', 'Partially Paid', 'Unpaid', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
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

      {/* Invoices Table Container */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-2 whitespace-nowrap">Invoice #</th>
                <th className="py-2.5 px-2 whitespace-nowrap">Issue / Due</th>
                <th className="py-2.5 px-2">Guest Details</th>
                <th className="py-2.5 px-2 whitespace-nowrap">Room</th>
                <th className="py-2.5 px-1.5 text-right whitespace-nowrap">Subtotal</th>
                <th className="py-2.5 px-1.5 text-right whitespace-nowrap">Tax & Fee</th>
                <th className="py-2.5 px-1.5 text-right whitespace-nowrap">Total</th>
                <th className="py-2.5 px-1.5 text-right whitespace-nowrap">Paid</th>
                <th className="py-2.5 px-1.5 text-right whitespace-nowrap">Balance</th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap">Status</th>
                <th className="py-2.5 px-1.5 text-center whitespace-nowrap w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">
                    <InvoiceIcon className="!text-4xl text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No invoices match your criteria</p>
                    <p className="text-[11px] text-gray-400">Try adjusting your search query or status filter</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className="font-mono font-bold text-[#1b7f43] block text-xs whitespace-nowrap">
                        {inv.id}
                      </span>
                      <span className="block text-[10px] font-mono text-gray-400 whitespace-nowrap leading-tight">
                        {inv.bookingId}
                      </span>
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className="font-medium text-gray-900 block text-xs whitespace-nowrap">{inv.issueDate}</span>
                      <span className="text-[10px] text-gray-400 block whitespace-nowrap leading-tight">Due: {inv.dueDate}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className="font-bold text-gray-900 block text-xs leading-tight">{inv.guestName}</span>
                      <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">{inv.guestEmail || 'Direct Check-in'}</span>
                    </td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className="font-semibold text-gray-800 block text-xs whitespace-nowrap">Room {inv.roomNumber}</span>
                      <span className="text-[10px] text-gray-400 block whitespace-nowrap leading-tight">{inv.roomType}</span>
                    </td>
                    <td className="py-2 px-1.5 text-right font-medium text-gray-600 font-mono whitespace-nowrap">
                      ${inv.subtotal?.toFixed(2)}
                    </td>
                    <td className="py-2 px-1.5 text-right font-medium text-gray-600 font-mono whitespace-nowrap">
                      ${inv.taxesAndFees?.toFixed(2)}
                    </td>
                    <td className="py-2 px-1.5 text-right font-bold text-gray-900 font-mono whitespace-nowrap">
                      ${inv.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-2 px-1.5 text-right font-bold text-emerald-600 font-mono whitespace-nowrap">
                      ${inv.paidAmount?.toFixed(2)}
                    </td>
                    <td className="py-2 px-1.5 text-right font-bold text-red-600 font-mono whitespace-nowrap">
                      ${inv.balanceDue?.toFixed(2)}
                    </td>
                    <td className="py-2 px-1.5 text-center whitespace-nowrap">
                      {renderStatusBadge(inv.status)}
                    </td>
                    <td className="py-2 px-1.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-0.5">
                        <Tooltip title="View Folio / Print">
                          <IconButton
                            size="small"
                            sx={{ padding: '2px' }}
                            className="!text-gray-500 hover:!text-[#1b7f43] hover:!bg-emerald-50"
                            onClick={() => {
                              setSelectedInvoiceForDetail(inv);
                              setIsDetailOpen(true);
                            }}
                          >
                            <ViewIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {inv.balanceDue > 0 && (
                          <Tooltip title="Record Payment">
                            <IconButton
                              size="small"
                              sx={{ padding: '2px' }}
                              className="!text-emerald-600 hover:!bg-emerald-50"
                              onClick={() => {
                                setSelectedInvoiceForPayment(inv);
                                setIsRecordPaymentOpen(true);
                              }}
                            >
                              <PaymentIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
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

      {/* Notification Snackbar */}
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
