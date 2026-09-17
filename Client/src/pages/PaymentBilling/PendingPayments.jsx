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
  HourglassEmpty as PendingIcon,
  Warning as WarningIcon,
  Payment as PaymentIcon,
  Visibility as ViewIcon,
  PriorityHigh as UrgentIcon,
  Phone as PhoneIcon,
  ReceiptLong as InvoiceIcon,
} from '@mui/icons-material';
import {
  getInvoices,
  recordInvoicePayment,
} from './paymentBillingStore';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import RecordPaymentModal from './components/RecordPaymentModal';

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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      if (inv.status === 'Overdue') {
        overdueCount += 1;
        overdueAmount += inv.balanceDue || 0;
      }
      if (inv.status === 'Partially Paid') {
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
      if (urgencyFilter === 'Overdue') matchesUrgency = inv.status === 'Overdue';
      if (urgencyFilter === 'Partially Paid') matchesUrgency = inv.status === 'Partially Paid';
      if (urgencyFilter === 'Unpaid') matchesUrgency = inv.status === 'Unpaid';

      return matchesSearch && matchesUrgency;
    });
  }, [pendingInvoices, searchTerm, urgencyFilter]);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pending Payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Action center for outstanding balances, overdue folios, and direct settlement processing
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
            Settle an Invoice
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Outstanding */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Receivable</span>
            <PendingIcon className="text-amber-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">
              ${metrics.totalReceivable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">{metrics.totalPendingCount} Folios</span>
          </div>
        </div>

        {/* Overdue Collection */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Overdue Collection</span>
            <WarningIcon className="text-red-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-red-600">
              ${metrics.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-red-500 font-medium">{metrics.overdueCount} Urgent</span>
          </div>
        </div>

        {/* Partially Paid */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Partially Paid</span>
            <InvoiceIcon className="text-blue-500 shrink-0" sx={{ fontSize: 17 }} />
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
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
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
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'All', label: 'All Pending' },
            { id: 'Overdue', label: 'Overdue Only' },
            { id: 'Partially Paid', label: 'Partially Paid' },
            { id: 'Unpaid', label: 'Unpaid Only' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setUrgencyFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                urgencyFilter === tab.id
                  ? 'bg-[#1b7f43] text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-2.5 whitespace-nowrap">Invoice #</th>
                <th className="py-2.5 px-2.5">Guest Details</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Room & Booking</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Due Date</th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">Invoiced</th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">Paid</th>
                <th className="py-2.5 px-2 text-right whitespace-nowrap">Balance Due</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Status</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap w-36">Action</th>
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
                  const isOverdue = inv.status === 'Overdue';
                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isOverdue ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#1b7f43] block text-xs whitespace-nowrap">{inv.id}</span>
                        <span className="block text-[10px] font-mono text-gray-400 whitespace-nowrap leading-tight">
                          Issued: {inv.issueDate}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        <span className="font-bold text-gray-900 block text-xs leading-tight">{inv.guestName}</span>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 truncate max-w-[140px]">
                          {inv.guestPhone ? (
                            <>
                              <PhoneIcon fontSize="inherit" className="text-gray-400" />
                              <span className="whitespace-nowrap">{inv.guestPhone}</span>
                            </>
                          ) : (
                            <span className="truncate">{inv.guestEmail || 'Direct Guest'}</span>
                          )}
                        </span>
                      </td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 block text-xs whitespace-nowrap">Room {inv.roomNumber}</span>
                        <span className="text-[10px] text-gray-400 block font-mono whitespace-nowrap leading-tight">{inv.roomType} &bull; {inv.bookingId}</span>
                      </td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <span className={`font-semibold text-xs block whitespace-nowrap ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                          {inv.dueDate}
                        </span>
                        {isOverdue && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-red-100 text-red-700 text-[9.5px] font-bold whitespace-nowrap">
                            Past Due
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-gray-700 font-mono whitespace-nowrap">
                        ${inv.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right font-medium text-emerald-600 font-mono whitespace-nowrap">
                        ${inv.paidAmount?.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right whitespace-nowrap">
                        <span className="font-extrabold text-xs text-red-600 font-mono block whitespace-nowrap">
                          ${inv.balanceDue?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        {isOverdue ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse whitespace-nowrap">
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
                            {inv.status}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="contained"
                            size="small"
                            className="!bg-[#1b7f43] hover:!bg-[#156736] !text-white !normal-case !font-semibold !px-2 !py-0.5 !rounded-md !text-[11px] cursor-pointer whitespace-nowrap"
                            startIcon={<PaymentIcon sx={{ fontSize: 13 }} />}
                            onClick={() => {
                              setSelectedInvoiceForPayment(inv);
                              setIsRecordPaymentOpen(true);
                            }}
                          >
                            Collect
                          </Button>
                          <Tooltip title="View Folio Details">
                            <IconButton
                              size="small"
                              sx={{ padding: '2px' }}
                              className="!text-gray-400 hover:!text-gray-700"
                              onClick={() => {
                                setSelectedInvoiceForDetail(inv);
                                setIsDetailOpen(true);
                              }}
                            >
                              <ViewIcon sx={{ fontSize: 16 }} />
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
