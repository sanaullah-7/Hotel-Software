import {
  Dialog, DialogContent, DialogActions,
  IconButton, Divider
} from '@mui/material';
import {
  Close, Print, ReceiptLong, Hotel, Person,
  CalendarMonth, Payment, CheckCircle, Warning, AssignmentReturn as RefundIcon, AccessTime
} from '@mui/icons-material';

export default function InvoiceDetailModal({
  open,
  onClose,
  invoice,
  onRecordPayment
}) {
  if (!invoice) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">
            <CheckCircle sx={{ fontSize: 14 }} /> Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AccessTime sx={{ fontSize: 14 }} /> Partially Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
            <Warning sx={{ fontSize: 14 }} /> Overdue
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <RefundIcon sx={{ fontSize: 14 }} /> Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Modal Bar */}
      <div className="bg-[#1b7f43] p-4 px-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
            <ReceiptLong sx={{ fontSize: 22 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight">Invoice Details</h2>
              <span className="font-mono bg-white/20 text-white text-[11px] px-2 py-0.5 rounded-md font-semibold">
                {invoice.invoiceNumber}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              Official guest folio and financial transaction statement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition cursor-pointer mr-1"
          >
            <Print sx={{ fontSize: 15 }} />
            <span>Print Folio</span>
          </button>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </div>

      {/* Invoice Document Body */}
      <DialogContent sx={{ p: { xs: 2.5, md: 4 }, backgroundColor: '#f9fafb' }}>
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200/80 shadow-xs space-y-6">
          
          {/* Header: Hotel Brand & Invoice Meta */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <Hotel sx={{ fontSize: 24, color: '#1b7f43' }} />
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Hotel<span className="text-[#1b7f43]">Admin</span> Resort & Suites
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Club Road, Luxury Hospitality Enclave, Islamabad<br />
                NTN/STRN: 9021482-7 • Phone: +92 51 111-222-333<br />
                Email: billing@hoteladmin.com
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="mb-2">{getStatusBadge(invoice.status)}</div>
              <p className="text-xs text-gray-500">
                <strong className="text-gray-700">Issue Date:</strong> {invoice.issueDate}
              </p>
              <p className="text-xs text-gray-500">
                <strong className="text-gray-700">Due Date:</strong> {invoice.dueDate}
              </p>
              <p className="text-xs text-gray-500">
                <strong className="text-gray-700">Currency:</strong> {invoice.currency || 'PKR'}
              </p>
            </div>
          </div>

          {/* Guest & Booking Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-100 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <Person sx={{ fontSize: 14 }} />
                <span>Billed To (Guest)</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{invoice.guestName}</p>
              <p className="text-gray-600">{invoice.guestEmail || 'N/A'}</p>
              <p className="text-gray-600">{invoice.guestPhone || 'N/A'}</p>
            </div>

            <div className="space-y-1.5 md:border-l md:border-gray-200 md:pl-4">
              <div className="flex items-center gap-1 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <CalendarMonth sx={{ fontSize: 14 }} />
                <span>Reservation & Stay</span>
              </div>
              <p className="text-gray-700">
                <strong className="text-gray-900">Booking ID:</strong> {invoice.bookingId}
              </p>
              <p className="text-gray-700">
                <strong className="text-gray-900">Room:</strong> {invoice.roomNumber} ({invoice.roomType})
              </p>
              <p className="text-gray-700">
                <strong className="text-gray-900">Stay Period:</strong> {invoice.checkIn} → {invoice.checkOut}
              </p>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-2 px-2">Description / Inclusions</th>
                  <th className="py-2 px-2 w-28 text-right whitespace-nowrap">Unit Rate</th>
                  <th className="py-2 px-2 w-14 text-center whitespace-nowrap">Qty</th>
                  <th className="py-2 px-2 w-32 text-right whitespace-nowrap">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {(invoice.items && invoice.items.length > 0 ? invoice.items : [
                  { description: `Room Charges (${invoice.roomType})`, rate: invoice.subtotal, qty: 1, amount: invoice.subtotal }
                ]).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2 px-2 font-medium text-gray-800">{item.description}</td>
                    <td className="py-2 px-2 text-right text-gray-600 font-mono whitespace-nowrap">
                      {item.rate < 0 ? `-PKR ${Math.abs(item.rate).toLocaleString()}` : `PKR ${Number(item.rate).toLocaleString()}`}
                    </td>
                    <td className="py-2 px-2 text-center text-gray-600 whitespace-nowrap">{item.qty}</td>
                    <td className="py-2 px-2 text-right font-bold text-gray-900 font-mono whitespace-nowrap">
                      {item.amount < 0 ? `-PKR ${Math.abs(item.amount).toLocaleString()}` : `PKR ${Number(item.amount).toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals Calculation Box */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-2">
            {/* Left: Notes & Terms */}
            <div className="flex-1 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs space-y-1">
              <span className="font-bold text-gray-700 block">Operational Notes & Remarks</span>
              <p className="text-gray-500 leading-relaxed italic">
                {invoice.notes || 'All accommodation taxes and statutory fees calculated as per regional tax bylaws. Thank you for staying with us.'}
              </p>
            </div>

            {/* Right: Calculations */}
            <div className="w-full sm:w-72 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs space-y-2 font-medium">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-bold text-gray-800 font-mono">PKR {Number(invoice.subtotal).toLocaleString()}</span>
              </div>
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount Applied:</span>
                  <span className="font-bold font-mono">-PKR {Number(invoice.discount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Taxes & Fees (GST/PST):</span>
                <span className="font-bold text-gray-800 font-mono">+PKR {Number(invoice.tax).toLocaleString()}</span>
              </div>
              <Divider sx={{ my: 0.5 }} />
              <div className="flex justify-between text-sm font-extrabold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-[#1b7f43] font-mono">PKR {Number(invoice.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Total Amount Paid:</span>
                <span className="font-bold text-emerald-700 font-mono">PKR {Number(invoice.paidAmount).toLocaleString()}</span>
              </div>
              <div className={`flex justify-between text-sm font-extrabold p-2 rounded-lg ${
                invoice.balanceDue > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20'
              }`}>
                <span>Balance Due:</span>
                <span className="font-mono">PKR {Number(invoice.balanceDue).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Transactions Ledger */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Payment sx={{ fontSize: 16, color: '#1b7f43' }} />
                <span>Recorded Payments on this Invoice ({invoice.payments.length})</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3">Payment ID</th>
                      <th className="py-2 px-3">Date & Time</th>
                      <th className="py-2 px-3">Method</th>
                      <th className="py-2 px-3">Reference</th>
                      <th className="py-2 px-3 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.payments.map((p, pIdx) => (
                      <tr key={pIdx} className="hover:bg-gray-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-gray-800">{p.paymentId}</td>
                        <td className="py-2 px-3 text-gray-600">{p.paymentDate}</td>
                        <td className="py-2 px-3 font-semibold text-gray-700">{p.paymentMethod}</td>
                        <td className="py-2 px-3 text-gray-500 font-mono text-[11px]">{p.transactionRef}</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-700 font-mono">
                          PKR {Number(p.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions sx={{ p: 3, backgroundColor: 'white', borderTop: '1px solid #f3f4f6', justifyContent: 'space-between' }}>
        <div>
          {invoice.balanceDue > 0 && onRecordPayment && (
            <button
              onClick={() => {
                onClose();
                onRecordPayment(invoice);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1b7f43] hover:bg-[#156736] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Payment sx={{ fontSize: 16 }} />
              <span>Record Payment (PKR {Number(invoice.balanceDue).toLocaleString()})</span>
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="px-5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
        >
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
}
