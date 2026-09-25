import React, { useState } from 'react';
import {
  PaymentOutlined,
  ReceiptOutlined,
  AttachMoney,
  Add,
  Search,
  CheckCircle,
  Warning,
  AssignmentReturn as RefundIcon,
  RoomServiceOutlined,
  AccountBalanceWalletOutlined
} from '@mui/icons-material';
import AddGuestChargeModal from '../../../inventory/pages/components/AddGuestChargeModal';
import ChargeDetailModal from '../../../inventory/pages/components/ChargeDetailModal';

export default function ChargesPaymentsTab({
  guest,
  charges = [],
  payments = [],
  refunds = [],
  totalInvoiced,
  totalPaid,
  totalDues,
  onChargeAdded
}) {
  const [subTab, setSubTab] = useState('charges'); // 'charges' | 'payments'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddChargeOpen, setIsAddChargeOpen] = useState(false);
  const [selectedChargeForDetail, setSelectedChargeForDetail] = useState(null);

  // Total refunds
  const totalRefunds = refunds.reduce((sum, r) => sum + (Number(r.amount || r.refundAmount) || 0), 0);
  const totalChargesAmount = charges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  // Filter charges
  const filteredCharges = charges.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      String(c.itemName || '').toLowerCase().includes(q) ||
      String(c.chargeType || '').toLowerCase().includes(q) ||
      String(c.roomNumber || '').toLowerCase().includes(q) ||
      String(c.folioId || '').toLowerCase().includes(q)
    );
  });

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      String(p.paymentId || p.id || '').toLowerCase().includes(q) ||
      String(p.paymentMethod || '').toLowerCase().includes(q) ||
      String(p.transactionRef || '').toLowerCase().includes(q) ||
      String(p.roomNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Folio Charges Total
          </span>
          <div className="text-xl font-extrabold text-gray-900">
            ${Number(totalChargesAmount || totalInvoiced).toFixed(2)}
          </div>
          <span className="text-[10.5px] text-gray-400 block mt-0.5">{charges.length} itemized records</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Payments
          </span>
          <div className="text-xl font-extrabold text-emerald-600">
            ${Number(totalPaid).toFixed(2)}
          </div>
          <span className="text-[10.5px] text-gray-400 block mt-0.5">{payments.length} transactions</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Outstanding Balance
          </span>
          <div className={`text-xl font-extrabold ${totalDues > 0 ? 'text-rose-600' : 'text-gray-800'}`}>
            ${Number(totalDues).toFixed(2)}
          </div>
          <span className="text-[10.5px] text-gray-400 block mt-0.5">
            {totalDues > 0 ? 'Due for settlement' : 'Fully settled'}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Refunded
          </span>
          <div className="text-xl font-extrabold text-purple-600">
            ${Number(totalRefunds).toFixed(2)}
          </div>
          <span className="text-[10.5px] text-gray-400 block mt-0.5">{refunds.length} refund records</span>
        </div>
      </div>

      {/* Main Ledger Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
        {/* Sub-Tabs & Controls Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setSubTab('charges')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                subTab === 'charges'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <RoomServiceOutlined sx={{ fontSize: 16 }} />
              <span>Folio & Service Charges ({charges.length})</span>
            </button>
            <button
              onClick={() => setSubTab('payments')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                subTab === 'payments'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <PaymentOutlined sx={{ fontSize: 16 }} />
              <span>Payment Transactions ({payments.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-44 sm:w-56 focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition"
              />
            </div>

            {subTab === 'charges' && (
              <button
                onClick={() => setIsAddChargeOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#1b7f43] text-white rounded-lg text-xs font-semibold hover:brightness-105 transition shadow-2xs cursor-pointer"
              >
                <Add sx={{ fontSize: 16 }} />
                <span>Post Charge</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Folio Charges Table */}
        {subTab === 'charges' && (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Item / Description</th>
                  <th className="py-3 px-4">Charge Type</th>
                  <th className="py-3 px-4">Room / Folio</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                {filteredCharges.map((ch) => (
                  <tr
                    key={ch.id}
                    onClick={() => setSelectedChargeForDetail(ch)}
                    className="hover:bg-gray-50/60 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium text-gray-600">
                      {ch.reportedDate || ch.date || 'Today'}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {ch.itemName}
                      {ch.notes && <span className="text-[10.5px] text-gray-400 block font-normal">{ch.notes}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                        {ch.chargeType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-600">
                      Room {ch.roomNumber || '101'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {ch.quantity || 1}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      ${Number(ch.unitPrice || ch.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900">
                      ${Number(ch.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        ch.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' :
                        ch.status === 'Added to Folio' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {ch.status || 'Added to Folio'}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredCharges.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                      <RoomServiceOutlined sx={{ fontSize: 36 }} className="text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-600">No folio charges recorded</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        No service orders, minibar items, or room charges posted for this guest yet.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Payment Transactions Table */}
        {subTab === 'payments' && (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Refunded</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-medium text-gray-600">
                      {p.paymentDate || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {p.paymentId || p.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800">{p.paymentMethod || 'Credit Card'}</span>
                      {p.gateway && <span className="text-[10px] text-gray-400 block">{p.gateway}</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      {p.transactionRef || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                      ${Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-500">
                      {p.refundedAmount > 0 ? (
                        <span className="text-purple-600 font-bold">${Number(p.refundedAmount).toFixed(2)}</span>
                      ) : (
                        '$0.00'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        p.status === 'Refunded' ? 'bg-purple-50 text-purple-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status || 'Completed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[11px]">
                      {p.recordedBy || p.cashier || 'Front Desk'}
                    </td>
                  </tr>
                ))}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                      <PaymentOutlined sx={{ fontSize: 36 }} className="text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-600">No payment records found</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        No financial payments or settlements recorded for this guest.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Guest Charge Modal */}
      {isAddChargeOpen && (
        <AddGuestChargeModal
          open={isAddChargeOpen}
          onClose={() => setIsAddChargeOpen(false)}
          prefilledData={{
            guestName: guest.name,
            roomNumber: guest.roomNumber || '101'
          }}
          onChargeAdded={() => {
            setIsAddChargeOpen(false);
            if (onChargeAdded) onChargeAdded();
          }}
        />
      )}

      {/* Charge Detail Modal */}
      {selectedChargeForDetail && (
        <ChargeDetailModal
          open={Boolean(selectedChargeForDetail)}
          onClose={() => setSelectedChargeForDetail(null)}
          charge={selectedChargeForDetail}
          onUpdate={() => {
            if (onChargeAdded) onChargeAdded();
          }}
        />
      )}
    </div>
  );
}
