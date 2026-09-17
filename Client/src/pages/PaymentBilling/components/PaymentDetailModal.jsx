import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  ReceiptLong as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  History as HistoryIcon,
  AssignmentReturn as RefundIcon,
} from '@mui/icons-material';

export default function PaymentDetailModal({
  open,
  onClose,
  payment,
  onInitiateRefund,
}) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Completed':
        return <Chip size="small" label="Completed" color="success" className="!font-medium" />;
      case 'Refunded':
        return <Chip size="small" label="Refunded" color="error" className="!font-medium" />;
      case 'Partially Refunded':
        return <Chip size="small" label="Partially Refunded" color="warning" className="!font-medium" />;
      case 'Pending':
        return <Chip size="small" label="Pending" color="warning" className="!font-medium" />;
      case 'Failed':
        return <Chip size="small" label="Failed" color="error" className="!font-medium" />;
      default:
        return <Chip size="small" label={status} className="!font-medium" />;
    }
  };

  const refundableAmount = (payment.amount || 0) - (payment.refundedAmount || 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: '!rounded-2xl !p-2' }}>
      <DialogTitle className="!flex !items-center !justify-between !pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#1b7f43] flex items-center justify-center">
            <ReceiptIcon fontSize="small" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">Payment Receipt</h3>
            <p className="text-xs text-gray-500">Official transaction voucher & settlement proof</p>
          </div>
        </div>
        <IconButton size="small" onClick={onClose} className="!text-gray-400 hover:!text-gray-700">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!pt-4 space-y-4">
        {/* Receipt Header Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Transaction ID</p>
            <p className="text-xl font-extrabold text-gray-900">{payment.id}</p>
            <p className="text-xs text-gray-500 mt-0.5">Ref: {payment.transactionRef}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            {getStatusChip(payment.status)}
            <p className="text-2xl font-extrabold text-emerald-700 mt-2">${payment.amount?.toFixed(2)}</p>
          </div>
        </div>

        {/* Transaction Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-3.5 border border-gray-200">
          <div>
            <span className="text-xs text-gray-500 block">Payment Date & Time</span>
            <span className="font-semibold text-gray-900">{payment.paymentDate}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Payment Method</span>
            <span className="font-semibold text-gray-900 flex items-center gap-1">
              <CreditCardIcon fontSize="inherit" className="text-gray-500" />
              {payment.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Cashier / Handler</span>
            <span className="font-semibold text-gray-900">{payment.cashier || 'Front Desk Staff'}</span>
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Gateway / Terminal</span>
            <span className="font-semibold text-gray-900">{payment.gateway || 'Main POS Terminal #1'}</span>
          </div>
        </div>

        {/* Traceability Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Traceability Details</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Guest Info */}
            <div className="border border-gray-200 rounded-xl p-3 bg-white">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-700">
                <PersonIcon fontSize="small" className="text-[#1b7f43]" />
                <span>Guest Information</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{payment.guestName}</p>
              {payment.guestEmail && <p className="text-xs text-gray-500">{payment.guestEmail}</p>}
              {payment.guestPhone && <p className="text-xs text-gray-500">{payment.guestPhone}</p>}
            </div>

            {/* Room & Booking Info */}
            <div className="border border-gray-200 rounded-xl p-3 bg-white">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-700">
                <HotelIcon fontSize="small" className="text-[#1b7f43]" />
                <span>Booking & Room</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Room {payment.roomNumber} ({payment.roomType})
              </p>
              <p className="text-xs text-gray-600">Booking: <span className="font-mono">{payment.bookingId}</span></p>
              <p className="text-xs text-gray-600">Invoice: <span className="font-mono font-bold text-[#1b7f43]">{payment.invoiceId}</span></p>
            </div>
          </div>
        </div>

        {/* Refund Status if applicable */}
        {payment.refundedAmount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-900 space-y-1">
            <div className="flex justify-between font-bold">
              <span>Total Refunded to Guest:</span>
              <span>${payment.refundedAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Net Settled Payment:</span>
              <span>${(payment.amount - payment.refundedAmount).toFixed(2)}</span>
            </div>
          </div>
        )}

        {payment.notes && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <span className="font-semibold text-gray-800">Notes: </span>
            {payment.notes}
          </div>
        )}
      </DialogContent>

      <DialogActions className="!px-4 !py-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          {payment.status !== 'Refunded' && refundableAmount > 0 && onInitiateRefund && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<RefundIcon />}
              onClick={() => {
                onClose();
                onInitiateRefund(payment);
              }}
              className="!normal-case !font-semibold !rounded-lg"
            >
              Refund Payment
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            className="!normal-case !border-gray-300 !text-gray-700 hover:!bg-gray-50 !font-semibold !rounded-lg"
          >
            Print Receipt
          </Button>
          <Button
            variant="contained"
            onClick={onClose}
            className="!bg-[#1b7f43] hover:!bg-[#156736] !text-white !normal-case !font-semibold !rounded-lg cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
