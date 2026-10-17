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
  ChevronRight,
  Close,
  DownloadOutlined,
  PersonOutlined,
  PhoneOutlined,
  EmailOutlined,
  LocationOnOutlined
} from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import InvoiceDetailModal from '../../../payment-billing/pages/components/InvoiceDetailModal';
import RecordPaymentModal from '../../../payment-billing/pages/components/RecordPaymentModal';
import { billingService } from '../../../../services/billingService';
import { toBackendPaymentPayload } from '../../../payment-billing/adapters/billingAdapter';

/**
 * PrintFolioModal:
 * Professional, A4-ready hotel folio statement & tax invoice print preview.
 * Dynamically adapts between INTERIM BILL (with clear pending balance) and FINAL TAX INVOICE (Paid in Full).
 */
function PrintFolioModal({
  open,
  onClose,
  guest,
  activeStay,
  invoices = [],
  charges = [],
  payments = [],
  totalInvoiced,
  totalPaid,
  totalDues
}) {
  if (!open) return null;

  const dues = Number(totalDues) || 0;
  const isPaidInFull = dues <= 0;
  const currentDate = new Date().toLocaleDateString('en-CA');
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const folioNumber = `FOLIO-${(guest?._id || guest?.id || 'GUEST').slice(-8).toUpperCase()}`;

  const handleTriggerPrint = () => {
    window.print();
  };

  // Compile detailed charge line items so the guest can read all charges clearly
  const displayItems = [];

  // If itemized guest charges exist (e.g. Red Bull, Damaged bed sheet, Room Rent)
  if (charges && charges.length > 0) {
    charges.forEach((chg, idx) => {
      let category = 'INCIDENTAL';
      const type = String(chg.chargeType || chg.type || '').toUpperCase();
      if (type.includes('DAMAGE')) category = 'ROOM DAMAGE';
      else if (type.includes('CONSUMPTION') || type.includes('EXTERNAL')) category = 'BEVERAGE & FOOD';
      else if (type.includes('ROOM')) category = 'ROOM ACCOMMODATION';
      else if (type.includes('SERVICE')) category = 'HOTEL SERVICE';

      displayItems.push({
        id: chg.id || chg._id || `chg-${idx}`,
        date: chg.date || chg.createdAt?.split('T')[0] || currentDate,
        description: chg.item || chg.description || 'Guest Folio Item',
        category,
        quantity: chg.quantity || 1,
        unitPrice: chg.unitPrice || chg.amount || 0,
        amount: Number(chg.amount || 0),
        status: chg.status || 'POSTED'
      });
    });
  }

  // If invoices exist and no specific charges, extract from invoice items or list invoices
  if (displayItems.length === 0 && invoices && invoices.length > 0) {
    invoices.forEach((inv, idx) => {
      if (inv.lineItems && inv.lineItems.length > 0) {
        inv.lineItems.forEach((li, lIdx) => {
          let category = 'ACCOMMODATION';
          const desc = String(li.description || '').toLowerCase();
          if (desc.includes('damage')) category = 'ROOM DAMAGE';
          else if (desc.includes('order') || desc.includes('food') || desc.includes('beverage') || desc.includes('bar')) category = 'CONSUMPTION';

          displayItems.push({
            id: `${inv.id}-${lIdx}`,
            date: inv.issueDate || currentDate,
            description: li.description,
            category,
            quantity: li.quantity || 1,
            unitPrice: li.amount,
            amount: Number(li.amount),
            status: inv.status
          });
        });
      } else {
        displayItems.push({
          id: inv.id || `inv-${idx}`,
          date: inv.issueDate || currentDate,
          description: `Room Accommodation / Invoice ${inv.invoiceNumber} (Room ${inv.roomNumber || activeStay?.roomNumber || '101'})`,
          category: 'ROOM ACCOMMODATION',
          quantity: 1,
          unitPrice: inv.totalAmount,
          amount: Number(inv.totalAmount),
          status: inv.status
        });
      }
    });
  }

  // If still empty fallback to stay
  if (displayItems.length === 0) {
    displayItems.push({
      id: 'default-stay',
      date: currentDate,
      description: `Room Accommodation (${activeStay?.roomType || 'Standard'} Room ${activeStay?.roomNumber || '101'})`,
      category: 'ROOM ACCOMMODATION',
      quantity: 1,
      unitPrice: totalInvoiced || 0,
      amount: Number(totalInvoiced || 0),
      status: isPaidInFull ? 'Paid' : 'Unpaid'
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <style>{`
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          .no-print, .no-print * {
            display: none !important;
            height: 0 !important;
          }
          #printable-folio-container,
          #printable-hotel-folio,
          #printable-hotel-folio * {
            visibility: visible !important;
          }
          #printable-folio-container {
            position: static !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            overflow: visible !important;
          }
          #printable-hotel-folio {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
        }
      `}</style>

      {/* Modal Wrapper */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto border border-gray-200">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-gray-900 px-5 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptLongOutlined className="text-emerald-400" sx={{ fontSize: 20 }} />
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-wide">Guest Folio & Statement Print Preview</h2>
              <p className="text-[10.5px] text-gray-400">
                {isPaidInFull ? 'Official Final Tax Invoice (Paid in full)' : `Interim Folio Statement (Balance Due: $${dues.toFixed(2)})`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PrintOutlined sx={{ fontSize: 15 }} />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Preview"
            >
              <Close sx={{ fontSize: 18 }} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div id="printable-folio-container" className="overflow-y-auto p-3 sm:p-6 bg-gray-100/80 flex justify-center">
          <div
            id="printable-hotel-folio"
            className="w-full max-w-[760px] flex flex-col space-y-3 text-gray-800"
          >
            {/* BOX 1: Hotel Info & Guest Info Box (Bounded cleanly to only this info) */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-2.5 print-card">
              {/* Hotel Header & Status Banner */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-2 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-emerald-700 text-white flex items-center justify-center font-black text-xs tracking-wider">
                      HM
                    </div>
                    <div>
                      <h1 className="text-base font-black uppercase tracking-tight text-gray-900 leading-tight">HOTEL & RESORT</h1>
                      <p className="text-[9.5px] font-semibold text-gray-500 uppercase tracking-wider">Front Office • Guest Billing & Folio</p>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-gray-500 space-y-0.5">
                    <p>Luxury Hospitality Management • Central Boulevard</p>
                    <p>Tel: +92 (51) 111-46835 • Email: billing@hotelmanagement.com</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block">
                    {isPaidInFull ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-600 uppercase tracking-wide">
                        <CheckCircle sx={{ fontSize: 12 }} /> FINAL TAX INVOICE — PAID IN FULL
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9.5px] font-black bg-amber-100 text-amber-900 border border-amber-600 uppercase tracking-wide">
                        <Warning sx={{ fontSize: 12 }} /> INTERIM FOLIO / UNPAID BILL
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[10px] text-gray-600 space-y-0.5 font-mono">
                    <p><span className="text-gray-400 font-sans">Folio #:</span> <strong className="text-gray-900">{folioNumber}</strong></p>
                    <p><span className="text-gray-400 font-sans">Issue Date:</span> {currentDate} {currentTime}</p>
                    <p><span className="text-gray-400 font-sans">Status:</span> <strong className={isPaidInFull ? 'text-emerald-700' : 'text-amber-700'}>{isPaidInFull ? 'SETTLED' : 'PENDING PAYMENT'}</strong></p>
                  </div>
                </div>
              </div>

              {/* Notice for Interim Bill */}
              {!isPaidInFull && (
                <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-[10.5px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Warning sx={{ fontSize: 13 }} className="text-amber-600" />
                    <span><strong>Interim Statement:</strong> Outstanding balance of <strong>${dues.toFixed(2)}</strong> must be settled prior to departure.</span>
                  </div>
                  <span className="font-mono font-bold text-amber-800">DUE: ${dues.toFixed(2)}</span>
                </div>
              )}

              {/* Guest & Stay Context Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                {/* Guest Details */}
                <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Guest Profile</span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">{guest?.name || 'Valued Guest'}</p>
                    {guest?.phone && <p className="text-gray-600 flex items-center gap-1"><PhoneOutlined sx={{ fontSize: 11 }} /> {guest.phone}</p>}
                    {guest?.email && <p className="text-gray-600 flex items-center gap-1"><EmailOutlined sx={{ fontSize: 11 }} /> {guest.email}</p>}
                    {(guest?.city || guest?.address) && (
                      <p className="text-gray-600 flex items-center gap-1"><LocationOnOutlined sx={{ fontSize: 11 }} /> {guest.city || guest.address}</p>
                    )}
                  </div>
                </div>

                {/* Stay & Room Details */}
                <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Room & Reservation Details</span>
                  <div className="space-y-0.5 font-mono text-gray-700">
                    <p><span className="text-gray-400 font-sans">Room Assigned:</span> <strong className="text-gray-900 font-sans">Room {activeStay?.roomNumber || activeStay?.room || guest?.roomNumber || '101'}</strong> ({activeStay?.roomType || 'Standard'})</p>
                    <p><span className="text-gray-400 font-sans">Booking Ref:</span> <span className="font-bold text-gray-900">{activeStay?.bookingId || activeStay?.booking_ref || activeStay?.id || 'RES-OFFICIAL'}</span></p>
                    <p><span className="text-gray-400 font-sans">Stay Period:</span> {activeStay?.checkInDate || activeStay?.checkIn || '2026-10-12'} → {activeStay?.checkOutDate || activeStay?.checkOut || '2026-10-13'}</p>
                    <p><span className="text-gray-400 font-sans">Billing Currency:</span> USD ($)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BOX 2: Itemized Charges Breakdown Table (Separate clean card) */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs print-card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10.5px] font-black uppercase tracking-wider text-gray-900">
                  Itemized Billing Charges & Services
                </h3>
                <span className="text-[10px] text-gray-500 font-medium">
                  {displayItems.length} line items recorded
                </span>
              </div>

              <table className="w-full text-left border-collapse border border-gray-200 text-[10.5px]">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold uppercase text-[9px] border-b border-gray-200">
                    <th className="py-1.5 px-2 w-8 text-center">#</th>
                    <th className="py-1.5 px-2 w-20">Date</th>
                    <th className="py-1.5 px-2">Description & Charge Details</th>
                    <th className="py-1.5 px-2 w-24">Category</th>
                    <th className="py-1.5 px-2 text-center w-10">Qty</th>
                    <th className="py-1.5 px-2 text-right w-20">Rate</th>
                    <th className="py-1.5 px-2 text-right w-20">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/50">
                      <td className="py-1 px-2 text-center text-gray-400 font-mono text-[10px]">{idx + 1}</td>
                      <td className="py-1 px-2 text-gray-600 font-mono text-[10px]">{item.date}</td>
                      <td className="py-1 px-2">
                        <strong className="text-gray-900 block leading-tight">{item.description}</strong>
                      </td>
                      <td className="py-1 px-2">
                        <span className={`inline-block px-1 py-0.2 rounded text-[9px] font-bold ${
                          item.category === 'ROOM DAMAGE'
                            ? 'bg-red-100 text-red-800'
                            : item.category === 'BEVERAGE & FOOD'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="py-1 px-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-1 px-2 text-right font-mono text-gray-600">${Number(item.unitPrice).toFixed(2)}</td>
                      <td className="py-1 px-2 text-right font-mono font-bold text-gray-900">${Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BOX 3: Payments Section (Separate clean card) */}
            {payments && payments.length > 0 && (
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs print-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800">
                    Payments & Settlement Records Applied
                  </h3>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {payments.length} payments recorded
                  </span>
                </div>

                <table className="w-full text-left border-collapse border border-emerald-200 text-[10.5px]">
                  <thead>
                    <tr className="bg-emerald-50/60 text-emerald-900 font-bold uppercase text-[9px] border-b border-emerald-200">
                      <th className="py-1 px-2 w-8 text-center">#</th>
                      <th className="py-1 px-2 w-24">Payment ID</th>
                      <th className="py-1 px-2 w-20">Date</th>
                      <th className="py-1 px-2">Method</th>
                      <th className="py-1 px-2 text-center w-20">Status</th>
                      <th className="py-1 px-2 text-right w-24">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100">
                    {payments.map((p, idx) => (
                      <tr key={p.id || p.paymentId || idx} className="hover:bg-emerald-50/30">
                        <td className="py-1 px-2 text-center text-gray-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="py-1 px-2 font-mono text-gray-700 text-[10px]">{p.paymentId || p.id || `PAY-${idx + 1}`}</td>
                        <td className="py-1 px-2 font-mono text-gray-600 text-[10px]">{p.paymentDate || currentDate}</td>
                        <td className="py-1 px-2 text-gray-800 font-medium">{p.paymentMethod || 'Cash'}</td>
                        <td className="py-1 px-2 text-center">
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            Verified
                          </span>
                        </td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-emerald-700">
                          ${Number(p.amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* BOX 4: Financial Settlement Totals Box & Signatures (Separate clean card) */}
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4 print-card print-avoid-break">
              {/* Financial Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-72 bg-gray-50/90 p-2.5 rounded-lg border border-gray-200 text-[11px] space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Billed Charges:</span>
                    <span className="font-mono font-semibold text-gray-900">${Number(totalInvoiced || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Payments Applied:</span>
                    <span className="font-mono font-semibold text-emerald-600">-${Number(totalPaid || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-1.5 flex justify-between items-center">
                    <span className="font-black text-gray-900 uppercase text-[10.5px]">
                      {isPaidInFull ? 'Balance Due (Paid in Full):' : 'OUTSTANDING BALANCE DUE:'}
                    </span>
                    <span className={`text-sm font-black font-mono ${isPaidInFull ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ${dues.toFixed(2)}
                    </span>
                  </div>
                  {!isPaidInFull && (
                    <p className="text-[9.5px] text-rose-600 font-semibold text-right pt-0.5">
                      Pending final settlement at Front Desk
                    </p>
                  )}
                </div>
              </div>

              {/* Footer & Signatures */}
              <div className="pt-3 border-t border-gray-200 text-[10px] text-gray-500">
                <div className="grid grid-cols-2 gap-8 mb-3">
                  <div>
                    <div className="border-b border-gray-400 h-6 mb-1"></div>
                    <p className="font-bold text-gray-700">Guest Signature</p>
                    <p className="text-[9px] text-gray-400">Acknowledges receipt of above services and charges</p>
                  </div>
                  <div>
                    <div className="border-b border-gray-400 h-6 mb-1"></div>
                    <p className="font-bold text-gray-700">Authorized Front Desk / Cashier</p>
                    <p className="text-[9px] text-gray-400">Hotel Management Operations</p>
                  </div>
                </div>

                <div className="text-center text-[9px] text-gray-400 space-y-0.5">
                  <p>Thank you for choosing Hotel & Resort. We look forward to welcoming you back.</p>
                  <p>All charges are subject to applicable hotel terms, tax rules and regulations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesTab({
  guest,
  invoices = [],
  charges = [],
  payments = [],
  reservations = [],
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
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

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

  const handleRecordPayment = async (paymentData) => {
    try {
      const matched = invoices.find(
        (inv) => inv.id === paymentData.invoiceId || inv.invoiceNumber === paymentData.invoiceId
      );
      const backendPayload = toBackendPaymentPayload(paymentData);
      if (matched?._id) {
        backendPayload.invoice_id = matched._id;
      }
      if (matched?.folio_id) {
        backendPayload.folio_id = matched.folio_id;
      }
      if (guest?._id || guest?.id) {
        backendPayload.guest_id = guest._id || guest.id;
      }

      await billingService.createPayment(backendPayload);
      setSelectedInvoiceForPayment(null);
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to record payment';
      alert(msg);
      throw err;
    }
  };

  /**
   * Print Folio Invoice:
   * Unified trigger for compiling and printing all stay invoices & charges.
   * If dues exist, shows the user-facing alert/toast before opening print preview.
   */
  const handlePrintInvoice = () => {
    const dues = Number(totalDues) || 0;
    if (dues > 0) {
      setToast({
        open: true,
        message: `ℹ️ Generating Interim Bill. Guest has an outstanding balance of $${dues.toFixed(2)}.`,
        severity: 'warning'
      });
    } else {
      setToast({
        open: true,
        message: 'Generating Final Tax Invoice & Receipt (Paid in full).',
        severity: 'success'
      });
    }
    setIsPrintModalOpen(true);
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
      {/* Toast Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', fontSize: '13px', fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

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

            {/* Print Invoice Button */}
            <button
              type="button"
              onClick={handlePrintInvoice}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b7f43] hover:bg-[#156736] text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <PrintOutlined sx={{ fontSize: 16 }} />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="w-full overflow-x-auto min-w-0 hide-scrollbar">
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
                    {inv.financialIntegrity === 'verified' ? `$${Number(inv.paidAmount).toFixed(2)}` : 'Unresolved'}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold">
                    {inv.financialIntegrity !== 'verified' ? <span className="text-amber-600">Unresolved</span> : inv.balanceDue > 0 ? (
                      <span className="text-rose-600">${Number(inv.balanceDue).toFixed(2)}</span>
                    ) : (
                      <span className="text-gray-400 font-normal">$0.00</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(inv.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedInvoiceForDetail(inv)}
                        className="p-1.5 text-gray-400 hover:text-[#1b7f43] hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="View invoice details"
                        aria-label="View invoice details"
                      >
                        <VisibilityOutlined sx={{ fontSize: 17 }} />
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => setSelectedInvoiceForPayment(inv)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Record payment"
                          aria-label="Record payment"
                        >
                          <PaymentOutlined sx={{ fontSize: 17 }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                    <ReceiptLongOutlined sx={{ fontSize: 40 }} className="text-gray-300 mb-2" />
                    <p className="font-bold text-gray-700 text-sm">No invoices found</p>
                    <p className="text-[11px] text-gray-500 mt-1 mb-4 max-w-md mx-auto">
                      {searchQuery || statusFilter !== 'All'
                        ? 'No invoices match your current search filters.'
                        : 'No formal invoices have been compiled or generated for this guest yet.'}
                    </p>
                    {(!searchQuery && statusFilter === 'All') && (
                      <button
                        type="button"
                        onClick={handlePrintInvoice}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b7f43] hover:bg-[#156736] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <PrintOutlined sx={{ fontSize: 16 }} />
                        <span>Print Folio Statement</span>
                      </button>
                    )}
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
                aria-label="Previous page"
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
                aria-label="Next page"
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

      {/* Comprehensive Print Folio / Invoice Modal */}
      {isPrintModalOpen && (
        <PrintFolioModal
          open={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          guest={guest}
          activeStay={reservations?.[0] || null}
          invoices={invoices}
          charges={charges}
          payments={payments}
          totalInvoiced={totalInvoiced}
          totalPaid={totalPaid}
          totalDues={totalDues}
        />
      )}
    </div>
  );
}
