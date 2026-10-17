import React, { useState, useEffect } from 'react';
import {
  Close as CloseIcon,
  Payments as PaymentsIcon,
  CheckCircle as SuccessIcon,
  ReceiptLong as ReceiptIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import useModalFocus from '../../../components/common/useModalFocus';

export default function CollectPaymentModal({
  isOpen,
  event = null,
  onClose,
  onCollectPayment
}) {
  const { dialogRef, titleId } = useModalFocus({ open: isOpen, onClose });

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalAmount = Number(event?.amount || 0);
  const currentAdvance = Number(event?.advanceAmount || 0);
  const remainingBalance = Number(event?.balanceAmount ?? Math.max(0, totalAmount - currentAdvance));

  useEffect(() => {
    if (event) {
      // By default suggest paying the full remaining balance
      setPaymentAmount(remainingBalance > 0 ? String(remainingBalance) : '');
      setPaymentMethod('Cash');
      setNotes('');
      setErrorMsg('');
    }
  }, [event, remainingBalance, isOpen]);

  if (!isOpen || !event) return null;

  const enteredAmount = parseFloat(paymentAmount) || 0;
  const newAdvance = currentAdvance + enteredAmount;
  const newRemainingBalance = Math.max(0, totalAmount - newAdvance);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (enteredAmount <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than $0.');
      return;
    }

    if (enteredAmount > remainingBalance) {
      setErrorMsg(`Entered amount ($${enteredAmount.toLocaleString()}) cannot exceed remaining balance of $${remainingBalance.toLocaleString()}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCollectPayment({
        event,
        collectedAmount: enteredAmount,
        newAdvance,
        newRemainingBalance,
        paymentMethod,
        notes
      });
      onClose();
    } catch (err) {
      console.error('Failed to collect payment:', err);
      setErrorMsg(err?.message || 'Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayFull = () => {
    setPaymentAmount(String(remainingBalance));
    setErrorMsg('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn font-sans"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1b7f43] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <PaymentsIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h2 id={titleId} className="text-base font-bold leading-tight">
                Collect Remaining Balance
              </h2>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                {event.name} ({event.id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Financial Overview Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-600">
              <span>Customer:</span>
              <span className="font-semibold text-gray-900">{event.client}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Total Event Price:</span>
              <span className="font-bold text-gray-900">${totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Amount Already Paid:</span>
              <span className="font-semibold text-emerald-700">${currentAdvance.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800 text-sm">Remaining Due Balance:</span>
              <span className="font-bold text-rose-600 text-sm">
                ${remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-lg">
              {errorMsg}
            </div>
          )}

          {remainingBalance === 0 ? (
            <div className="py-4 text-center space-y-2">
              <SuccessIcon className="text-[#1b7f43]" sx={{ fontSize: 40 }} />
              <p className="text-sm font-bold text-gray-800">This event is already fully paid!</p>
              <p className="text-xs text-gray-500">No pending balance is due from the customer.</p>
            </div>
          ) : (
            <>
              {/* Payment Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Payment Amount to Collect ($) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handlePayFull}
                    className="text-[11px] font-semibold text-[#1b7f43] hover:text-[#12572e] underline cursor-pointer"
                  >
                    Pay Full Remaining (${remainingBalance.toLocaleString()})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    max={remainingBalance}
                    step="any"
                    required
                    placeholder="e.g. 8000"
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-[#1b7f43] focus:ring-2 focus:ring-[#1b7f43]/20 transition"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:border-[#1b7f43] focus:ring-2 focus:ring-[#1b7f43]/20 transition cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit/Debit Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Online / Cheque">Online / Cheque</option>
                </select>
              </div>

              {/* Payment Reference / Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Receipt / Transaction Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared at Reception desk, Ref #TXN992"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1b7f43] focus:ring-2 focus:ring-[#1b7f43]/20 transition"
                />
              </div>

              {/* Balance Preview After This Payment */}
              {enteredAmount > 0 && enteredAmount <= remainingBalance && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-900">
                    <ReceiptIcon sx={{ fontSize: 16 }} className="text-[#1b7f43]" />
                    <span>Balance After Payment:</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {newRemainingBalance === 0 ? (
                      <span className="text-[#1b7f43]">Fully Paid ($0 remaining)</span>
                    ) : (
                      `$${newRemainingBalance.toLocaleString()} remaining`
                    )}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {remainingBalance > 0 && (
              <button
                type="submit"
                disabled={isSubmitting || enteredAmount <= 0}
                className="px-5 py-2 bg-[#1b7f43] hover:bg-[#12572e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <PaymentsIcon sx={{ fontSize: 16 }} />
                    <span>Collect ${enteredAmount > 0 ? enteredAmount.toLocaleString() : '0'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
