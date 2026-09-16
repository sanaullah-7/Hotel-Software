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
  AssignmentReturn as RefundIcon,
  ReceiptLong as ReceiptIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import { printRefundVoucher } from '../utils/printHelpers';

export default function RefundVoucherModal({
  open,
  onClose,
  refund,
}) {
  if (!refund) return null;

  const handlePrint = () => {
    printRefundVoucher(refund);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Completed':
        return <Chip size="small" label="Completed" color="success" className="!font-medium" />;
      case 'Pending Approval':
        return <Chip size="small" label="Pending Approval" color="warning" className="!font-medium" />;
      case 'Rejected':
        return <Chip size="small" label="Rejected" color="error" className="!font-medium" />;
      default:
        return <Chip size="small" label={status} className="!font-medium" />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: '!rounded-2xl !p-2' }}
    >
      <DialogTitle className="!flex !items-center !justify-between !pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <RefundIcon fontSize="small" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">Refund Voucher</h3>
            <p className="text-xs text-gray-500">Official disbursement slip & reversal documentation</p>
          </div>
        </div>
        <IconButton size="small" onClick={onClose} className="!text-gray-400 hover:!text-gray-700">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!pt-4 space-y-4">
        {/* Voucher Header Card */}
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-red-800 uppercase tracking-wider">Refund Voucher #</p>
            <p className="text-xl font-extrabold text-gray-900">{refund.id || refund.refundId}</p>
            <p className="text-xs text-gray-500 mt-0.5">Disbursed on {refund.refundDate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Status</p>
            {getStatusChip(refund.status)}
            <p className="text-2xl font-extrabold text-red-600 mt-2">
              ${(refund.amount || refund.refundAmount || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Traceability Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Guest Info */}
          <div className="border border-gray-200 rounded-xl p-3 bg-white">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-700">
              <PersonIcon fontSize="small" className="text-red-600" />
              <span>Guest Details</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{refund.guestName || 'Guest'}</p>
            <p className="text-xs text-gray-500">Room {refund.roomNumber || 'N/A'} ({refund.roomType || 'Standard'})</p>
            <p className="text-xs text-gray-500">Booking Ref: <span className="font-mono">{refund.bookingId || 'N/A'}</span></p>
          </div>

          {/* Audit & Transaction Info */}
          <div className="border border-gray-200 rounded-xl p-3 bg-white">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-700">
              <ReceiptIcon fontSize="small" className="text-red-600" />
              <span>Original Transaction</span>
            </div>
            <p className="text-xs text-gray-600">
              Payment ID: <span className="font-mono font-semibold text-gray-900">{refund.paymentId || 'N/A'}</span>
            </p>
            <p className="text-xs text-gray-600">
              Invoice ID: <span className="font-mono font-semibold text-gray-900">{refund.invoiceId || 'N/A'}</span>
            </p>
            <p className="text-xs text-gray-600">
              Authorized By: <span className="font-medium text-gray-900">{refund.processedBy || 'Manager'}</span>
            </p>
          </div>
        </div>

        {/* Reason & Notes */}
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 uppercase tracking-wider">Refund Reason:</span>
            <span className="font-semibold text-red-700 bg-red-100/70 px-2 py-0.5 rounded">
              {refund.reason || 'General Adjustment'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 uppercase tracking-wider">Disbursement Method:</span>
            <span className="font-medium text-gray-900">{refund.refundMethod || 'Original Payment Method'}</span>
          </div>
          {refund.notes && (
            <div className="pt-2 border-t border-gray-200 text-gray-600">
              <span className="font-bold text-gray-800">Remarks: </span>
              {refund.notes}
            </div>
          )}
        </div>

        {/* Signatures Preview */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-[11px] text-gray-500 text-center">
          <div>
            <div className="border-b border-gray-300 pb-1 mb-1 font-semibold text-gray-800">
              {refund.processedBy || 'Duty Manager'}
            </div>
            <span>Authorized Representative</span>
          </div>
          <div>
            <div className="border-b border-gray-300 pb-1 mb-1 font-semibold text-gray-800">
              {refund.guestName || 'Guest'}
            </div>
            <span>Guest Acknowledgment</span>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="!px-4 !py-3 border-t border-gray-100 flex items-center justify-between">
        <Button onClick={onClose} color="inherit" className="!normal-case !text-gray-600">
          Close
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="contained"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            className="!bg-red-600 hover:!bg-red-700 !text-white !normal-case !font-semibold !px-5 !py-2 !rounded-lg cursor-pointer shadow-sm"
          >
            Print Voucher
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
