import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  AssignmentReturn as RefundIcon,
  CheckCircle as CheckCircleIcon,
  ReceiptLong as ReceiptIcon,
} from '@mui/icons-material';

const REFUND_REASONS = [
  'Booking Cancellation',
  'Double Charge / Billing Error',
  'Guest Complaint / Room Issue',
  'Early Check-out Adjustment',
  'Service Dissatisfaction',
  'Deposit Return',
  'Other',
];

const REFUND_METHODS = [
  'Original Payment Method',
  'Credit Card Reverse',
  'Cash',
  'Bank Transfer',
  'Digital Wallet',
];

function ProcessRefundInnerForm({ payment, payments = [], onSave, onClose }) {
  // Filter eligible payments that have remaining refundable amount
  const eligiblePayments = payments.filter((p) => {
    const refundable = (p.amount || 0) - (p.refundedAmount || 0);
    return refundable > 0 && p.status !== 'Refunded' && p.status !== 'Failed';
  });

  const [selectedPaymentId, setSelectedPaymentId] = useState(
    payment ? payment.id : (eligiblePayments[0]?.id || '')
  );

  const currentPayment = payment || eligiblePayments.find((p) => p.id === selectedPaymentId) || null;
  const maxRefundable = currentPayment
    ? (currentPayment.amount || 0) - (currentPayment.refundedAmount || 0)
    : 0;

  const [amount, setAmount] = useState(() => (maxRefundable > 0 ? maxRefundable : ''));
  const [reason, setReason] = useState('Booking Cancellation');
  const [refundMethod, setRefundMethod] = useState('Original Payment Method');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const remainingPaidAfterRefund = Math.max(0, (currentPayment?.amount || 0) - (currentPayment?.refundedAmount || 0) - numAmount);

  const handlePaymentChange = (e) => {
    const newId = e.target.value;
    setSelectedPaymentId(newId);
    const target = eligiblePayments.find((p) => p.id === newId);
    if (target) {
      const refBal = (target.amount || 0) - (target.refundedAmount || 0);
      setAmount(refBal);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentPayment) {
      setError('Please select an eligible payment to refund.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid refund amount greater than $0.00.');
      return;
    }
    if (numAmount > maxRefundable + 0.001) {
      setError(`Refund amount cannot exceed maximum refundable limit of $${maxRefundable.toFixed(2)}.`);
      return;
    }

    onSave({
      paymentId: currentPayment.id,
      invoiceId: currentPayment.invoiceId,
      guestName: currentPayment.guestName,
      roomNumber: currentPayment.roomNumber,
      roomType: currentPayment.roomType,
      amount: numAmount,
      reason,
      refundMethod,
      notes: notes.trim(),
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert severity="error">{error}</Alert>}

      {/* Select payment if not pre-passed */}
      {!payment && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Select Payment Transaction *
          </label>
          <TextField
            select
            fullWidth
            size="small"
            value={selectedPaymentId}
            onChange={handlePaymentChange}
            required
          >
            {eligiblePayments.map((p) => {
              const refBal = (p.amount || 0) - (p.refundedAmount || 0);
              return (
                <MenuItem key={p.id} value={p.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-gray-900">{p.id}</span>
                    <span className="text-gray-600 text-sm ml-2">
                      {p.guestName} ({p.paymentMethod}) — Refundable: ${refBal.toFixed(2)}
                    </span>
                  </div>
                </MenuItem>
              );
            })}
          </TextField>
        </div>
      )}

      {/* Payment Details Banner */}
      {currentPayment && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptIcon fontSize="small" className="text-amber-700" />
              <span className="font-bold text-gray-900">{currentPayment.id}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-white text-gray-700 border border-gray-200">
                {currentPayment.paymentMethod}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              Guest: <span className="font-medium text-gray-900">{currentPayment.guestName}</span> &bull; Invoice:{' '}
              <span className="font-medium text-gray-900">{currentPayment.invoiceId}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Original Amount: ${currentPayment.amount.toFixed(2)} &bull; Previously Refunded: ${(currentPayment.refundedAmount || 0).toFixed(2)}
            </p>
          </div>
          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200">
            <p className="text-xs text-gray-500">Max Refundable Amount</p>
            <p className="text-xl font-extrabold text-amber-700">${maxRefundable.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Refund Amount & Method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Refund Amount ($) *
          </label>
          <TextField
            type="number"
            fullWidth
            size="small"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            placeholder="0.00"
            inputProps={{ min: 0.01, max: maxRefundable, step: '0.01' }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            required
            helperText={
              <span className="flex items-center justify-between text-xs mt-1">
                <button
                  type="button"
                  onClick={() => setAmount(maxRefundable)}
                  className="text-amber-700 font-semibold hover:underline cursor-pointer"
                >
                  Full Refund (${maxRefundable.toFixed(2)})
                </button>
                <span className="text-gray-500">
                  Retained: ${remainingPaidAfterRefund.toFixed(2)}
                </span>
              </span>
            }
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Refund Method *
          </label>
          <TextField
            select
            fullWidth
            size="small"
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value)}
            required
          >
            {REFUND_METHODS.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Reason for Refund *
        </label>
        <TextField
          select
          fullWidth
          size="small"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        >
          {REFUND_REASONS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {/* Notes / Authorization remark */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Manager Authorization / Remarks
        </label>
        <TextField
          fullWidth
          size="small"
          multiline
          rows={2}
          placeholder="e.g. Approved by Duty Manager as per standard 24-hour cancellation policy"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Refund Impact Summary */}
      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs text-gray-700 space-y-1.5">
        <div className="flex justify-between">
          <span>Max Available to Refund:</span>
          <span className="font-semibold">${maxRefundable.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-red-600 font-semibold">
          <span>Refund to Process:</span>
          <span>-${numAmount > 0 ? numAmount.toFixed(2) : '0.00'}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-900 text-sm">
          <span>Refund Type:</span>
          <span className={numAmount === maxRefundable ? 'text-red-600' : 'text-amber-600'}>
            {numAmount === maxRefundable ? 'Full Refund' : 'Partial Refund'}
          </span>
        </div>
      </div>

      <DialogActions className="!px-0 !pt-2">
        <Button onClick={onClose} color="inherit" className="!normal-case !text-gray-600">
          Cancel
        </Button>
        <button
          type="submit"
          disabled={numAmount <= 0 || numAmount > maxRefundable}
          className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs transition cursor-pointer"
        >
          Confirm & Issue Refund
        </button>
      </DialogActions>
    </form>
  );
}

export default function ProcessRefundModal({
  open,
  onClose,
  payment,
  payments = [],
  onProcessRefund,
}) {
  const handleSave = (refundData) => {
    onProcessRefund(refundData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: '!rounded-xl !p-1' }}>
      <DialogTitle className="!flex !items-center !justify-between !p-3 !pb-2 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">Process Guest Refund</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">Reverse transaction and adjust invoice balances</p>
        </div>
        <IconButton size="small" onClick={onClose} className="!text-gray-400 hover:!text-gray-700">
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!p-3.5 !pt-3">
        <ProcessRefundInnerForm
          key={payment ? payment.id : 'general-process-refund'}
          payment={payment}
          payments={payments}
          onSave={handleSave}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
