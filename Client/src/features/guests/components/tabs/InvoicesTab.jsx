import React, { useState } from 'react';
import {
  ReceiptLongOutlined,
  Search,
  VisibilityOutlined,
  PaymentOutlined,
  PrintOutlined,
  CalendarTodayOutlined,
  MeetingRoomOutlined,
  CheckCircle,
  Warning,
  AccessTime,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import InvoiceDetailModal from '../../../payment-billing/pages/components/InvoiceDetailModal';
import RecordPaymentModal from '../../../payment-billing/pages/components/RecordPaymentModal';
import { recordInvoicePayment } from '../../../payment-billing/pages/paymentBillingStore';

export default function InvoicesTab({
  guest,
  invoices = [],
  totalInvoiced,
  totalPaid,
  totalDues,
  onInvoicesUpdated
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // Filter invoices
  const filtered = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      String(inv.invoiceNumber || inv.id || '').toLowerCase().includes(q) ||
      String(inv.bookingId || '').toLowerCase().includes(q) ||
      String(inv.roomNumber || '').toLowerCase().includes(q) ||
      String(inv.roomType || '').toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All' ||
      String(inv.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleRecordPayment = (paymentData) => {
    try {
      recordInvoicePayment(paymentData);
      setSelectedInvoiceForPayment(null);
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">
            <CheckCircle sx={{ fontSize: 13 }} /> Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AccessTime sx={{ fontSize: 13 }} /> Partially Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <Warning sx={{ fontSize: 13 }} /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {status || 'Unpaid'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Table Container Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
        {/* Header Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ReceiptLongOutlined className="text-[#1b7f43]" sx={{ fontSize: 20 }} />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Formal Billing Invoices</h3>
              <p className="text-[11px] text-gray-500">
                {invoices.length} invoices generated • Total: ${Number(totalInvoiced).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search invoice number..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-44 sm:w-56 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition"
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-xs">
              {['All', 'Paid', 'Partially Paid', 'Unpaid'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white text-[#1b7f43] font-bold shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Issue & Due Date</th>
                <th className="py-3 px-4">Stay / Room</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {currentItems.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="flex items-center gap-1 font-medium text-gray-800">
                      <CalendarTodayOutlined sx={{ fontSize: 13 }} className="text-gray-400" />
                      {inv.issueDate || 'N/A'}
                    </div>
                    <span className="text-[10.5px] text-gray-400 block">Due: {inv.dueDate || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <MeetingRoomOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                      Room {inv.roomNumber || '101'}
                    </div>
                    <span className="text-[10.5px] text-gray-500 block font-mono">{inv.bookingId || 'BK-N/A'}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900">
                    ${Number(inv.totalAmount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600">
                    ${Number(inv.paidAmount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold">
                    {inv.balanceDue > 0 ? (
                      <span className="text-rose-600">${Number(inv.balanceDue).toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">$0.00</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setSelectedInvoiceForDetail(inv)}
                        className="p-1 text-gray-400 hover:text-[#1b7f43] hover:bg-emerald-50 rounded transition cursor-pointer"
                        title="View invoice details"
                      >
                        <VisibilityOutlined sx={{ fontSize: 16 }} />
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => setSelectedInvoiceForPayment(inv)}
                          className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition cursor-pointer"
                          title="Record payment"
                        >
                          <PaymentOutlined sx={{ fontSize: 16 }} />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedInvoiceForDetail(inv);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                        title="Print invoice"
                      >
                        <PrintOutlined sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                    <ReceiptLongOutlined sx={{ fontSize: 36 }} className="text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No invoices found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {searchQuery || statusFilter !== 'All'
                        ? 'No invoices match your current search filters.'
                        : 'No formal invoices have been compiled or generated for this guest.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filtered.length > itemsPerPage && (
          <div className="p-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filtered.length)} of {filtered.length} invoices
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft sx={{ fontSize: 16 }} />
              </button>
              <span className="px-2 font-bold text-gray-800">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoiceForDetail && (
        <InvoiceDetailModal
          open={Boolean(selectedInvoiceForDetail)}
          onClose={() => setSelectedInvoiceForDetail(null)}
          invoice={selectedInvoiceForDetail}
          onRecordPayment={() => {
            const target = selectedInvoiceForDetail;
            setSelectedInvoiceForDetail(null);
            setSelectedInvoiceForPayment(target);
          }}
        />
      )}

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          open={Boolean(selectedInvoiceForPayment)}
          onClose={() => setSelectedInvoiceForPayment(null)}
          invoice={selectedInvoiceForPayment}
          onSave={handleRecordPayment}
        />
      )}
    </div>
  );
}
