import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  CheckCircle as BalancedIcon,
  Warning as ShortageIcon,
  TrendingUp as OverageIcon,
  AccountBalanceWallet as CashIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  ReceiptLong as ReceiptIcon,
} from '@mui/icons-material';
import { printZReport } from '../utils/printHelpers';
import { shiftService } from '../../../../services/shiftService';

export default function ZReportModal({ open, onClose, shift: initialShift, shiftId }) {
  const [shift, setShift] = useState(initialShift || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const hotelName =
    typeof window !== 'undefined'
      ? localStorage.getItem('hotelName') || 'Grand Imperial Hotel & Resort'
      : 'Grand Imperial Hotel & Resort';

  useEffect(() => {
    if (initialShift) {
      setShift(initialShift);
      setError(null);
    } else if (shiftId && open) {
      setIsLoading(true);
      setError(null);
      shiftService
        .getShiftById(shiftId)
        .then((res) => {
          setShift(res?.data || null);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load Z-Report');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [initialShift, shiftId, open]);

  const handlePrint = () => {
    if (shift) {
      printZReport(shift, hotelName);
    }
  };

  const formatPKR = (amt) =>
    `PKR ${(Number(amt) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const discrepancy = Number(shift?.discrepancy_amount || 0);
  const isBalanced = discrepancy === 0;
  const isShortage = discrepancy < 0;
  const isOverage = discrepancy > 0;

  const tender = shift?.tender_summary || {};
  const nonCashTotal = Number(
    (Number(tender.card_total || 0) +
      Number(tender.bank_total || 0) +
      Number(tender.wallet_total || 0) +
      Number(tender.other_total || 0)).toFixed(2)
  );

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="z-report-dialog-title"
    >
      <DialogTitle
        id="z-report-dialog-title"
        component="div"
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#1b7f43',
          color: '#ffffff',
        }}
      >
        <div className="flex items-center gap-2.5">
          <ReceiptIcon className="text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-wide uppercase m-0 leading-tight">
              Authoritative Shift Z-Report
            </h2>
            <p className="text-xs text-slate-400 font-mono m-0 mt-0.5">
              {shift?.shift_number || 'Loading shift...'}
            </p>
          </div>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f8fafc' }}>
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <CircularProgress size={36} sx={{ color: '#1b7f43' }} />
            <p className="text-sm text-slate-600 font-medium">Fetching sealed Z-Report from ledger...</p>
          </div>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && shift && (
          <div className="space-y-4">
            {/* Header / Property Identification */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 m-0">{hotelName}</h3>
                <p className="text-xs text-slate-500 m-0 mt-0.5 uppercase tracking-wider font-semibold">
                  Front Desk Cashier Drawer Audit & Settlement Record
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Chip
                  label={shift.status || 'CLOSED'}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700, letterSpacing: '0.5px' }}
                />
                {isBalanced && (
                  <Chip
                    icon={<BalancedIcon fontSize="small" />}
                    label="BALANCED"
                    color="success"
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
                {isShortage && (
                  <Chip
                    icon={<ShortageIcon fontSize="small" />}
                    label={`SHORTAGE (${formatPKR(Math.abs(discrepancy))})`}
                    color="error"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
                {isOverage && (
                  <Chip
                    icon={<OverageIcon fontSize="small" />}
                    label={`OVERAGE (+${formatPKR(discrepancy)})`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </div>
            </div>

            {/* Shift Operational Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-2">
                  Staff & Station
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Cashier:</span>
                  <strong className="text-slate-800">{shift.staff_name || 'N/A'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Drawer / Terminal:</span>
                  <strong className="text-slate-800">{shift.drawer_name || 'Front Desk'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sealed By:</span>
                  <strong className="text-slate-800">{shift.closed_by_name || shift.staff_name || 'Manager'}</strong>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-2">
                  Shift Timing
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Opened At:</span>
                  <span className="text-slate-700 font-mono">
                    {shift.opened_at ? new Date(shift.opened_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Closed At:</span>
                  <span className="text-slate-700 font-mono">
                    {shift.closed_at ? new Date(shift.closed_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shift Number:</span>
                  <span className="text-slate-700 font-mono font-bold">{shift.shift_number}</span>
                </div>
              </div>
            </div>

            {/* Authoritative Physical Cash Drawer Reconciliation */}
            <div className="bg-white rounded-xl border-2 border-[#1b7f43] shadow-sm overflow-hidden">
              <div className="bg-[#1b7f43] text-white px-4 py-2.5 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CashIcon fontSize="small" className="text-emerald-400" />
                  Physical Cash Drawer Reconciliation
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold ${
                    isBalanced
                      ? 'bg-emerald-600 text-white'
                      : isShortage
                      ? 'bg-rose-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isBalanced
                    ? 'DRAWER BALANCED'
                    : isShortage
                    ? `SHORTAGE: ${formatPKR(Math.abs(discrepancy))}`
                    : `OVERAGE: +${formatPKR(discrepancy)}`}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="px-4 py-2.5 flex justify-between items-center bg-white">
                  <span className="text-slate-600">(+) Opening Float (Starting Cash)</span>
                  <span className="font-mono font-semibold text-slate-800">{formatPKR(shift.opening_float)}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center bg-white">
                  <span className="text-slate-600">(+) Cash Receipts / Collections</span>
                  <span className="font-mono font-semibold text-emerald-600">+{formatPKR(shift.cash_collected)}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center bg-white">
                  <span className="text-slate-600">(-) Cash Refunds Disbursed</span>
                  <span className="font-mono font-semibold text-rose-600">-{formatPKR(shift.cash_refunds)}</span>
                </div>
                <div className="px-4 py-2.5 flex justify-between items-center bg-white">
                  <span className="text-slate-600">(-) Cash Paid Out (Expenses)</span>
                  <span className="font-mono font-semibold text-rose-600">-{formatPKR(shift.cash_paid_out)}</span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center bg-slate-50 border-t-2 border-slate-200">
                  <span className="text-slate-900 font-bold text-sm">(=) Expected Physical Cash in Drawer</span>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {formatPKR(shift.expected_cash)}
                  </span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center bg-slate-100/70">
                  <span className="text-slate-900 font-bold text-sm">(vs) Actual Physical Counted Cash</span>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">
                    {formatPKR(shift.actual_counted_cash)}
                  </span>
                </div>
                <div
                  className={`px-4 py-3 flex justify-between items-center font-bold text-sm ${
                    isBalanced
                      ? 'bg-emerald-50 text-emerald-900'
                      : isShortage
                      ? 'bg-rose-50 text-rose-900'
                      : 'bg-indigo-50 text-indigo-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isBalanced && <BalancedIcon className="text-emerald-600" fontSize="small" />}
                    {isShortage && <ShortageIcon className="text-rose-600" fontSize="small" />}
                    {isOverage && <OverageIcon className="text-indigo-600" fontSize="small" />}
                    Discrepancy (Variance)
                  </span>
                  <span className="font-mono font-extrabold text-base">
                    {discrepancy > 0 ? '+' : ''}
                    {formatPKR(discrepancy)}
                  </span>
                </div>
              </div>
            </div>

            {/* Non-Cash Tender Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CardIcon fontSize="small" className="text-slate-500" />
                  Non-Cash Tender Summary (Bank / Gateway Settlement)
                </span>
                <span className="text-[11px] text-slate-500">
                  Tx Count: <strong>{tender.total_payments_count || 0}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs pt-1">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Card Payments</div>
                  <div className="font-mono font-bold text-slate-800 mt-1">{formatPKR(tender.card_total || 0)}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Bank Transfer</div>
                  <div className="font-mono font-bold text-slate-800 mt-1">{formatPKR(tender.bank_total || 0)}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Digital Wallet</div>
                  <div className="font-mono font-bold text-slate-800 mt-1">{formatPKR(tender.wallet_total || 0)}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[11px] text-slate-500 font-medium">Other Tenders</div>
                  <div className="font-mono font-bold text-slate-800 mt-1">{formatPKR(tender.other_total || 0)}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-slate-100 text-xs text-slate-600 gap-1">
                <span>
                  Total Non-Cash Collections: <strong className="font-mono">{formatPKR(nonCashTotal)}</strong>
                </span>
                <span className="text-slate-900 font-bold">
                  Grand Total Collections (All Tenders):{' '}
                  <strong className="font-mono text-emerald-700">
                    {formatPKR(tender.total_collected_all_tenders || 0)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Notes Section */}
            {shift.notes && (
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs">
                <div className="font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Handover & Closure Notes
                </div>
                <p className="text-slate-800 whitespace-pre-wrap m-0 font-sans">{shift.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Button onClick={onClose} variant="outlined" color="inherit" size="small">
          Close
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          disabled={!shift}
          sx={{
            bgcolor: '#1b7f43',
            '&:hover': { bgcolor: '#156736' },
            fontWeight: 700,
            textTransform: 'none',
          }}
        >
          Print Official Z-Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}
