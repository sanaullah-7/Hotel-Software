import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  AccountBalanceWallet as CashIcon,
  ReceiptLong as ReceiptIcon,
  LockClock as LockClockIcon,
  CheckCircle as BalancedIcon,
  Warning as ShortageIcon,
  TrendingUp as OverageIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  PointOfSale as PosIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { shiftService } from '../../../services/shiftService';
import ZReportModal from './components/ZReportModal';

export default function ShiftHandover() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Active shift state
  const [activeShift, setActiveShift] = useState(null);
  const [isLoadingActive, setIsLoadingActive] = useState(true);
  const [activeError, setActiveError] = useState(null);

  // Open Shift Form state
  const [openFloat, setOpenFloat] = useState('');
  const [drawerName, setDrawerName] = useState('');
  const [openNotes, setOpenNotes] = useState('');
  const [isSubmittingOpen, setIsSubmittingOpen] = useState(false);
  const [openFormError, setOpenFormError] = useState(null);

  // Close Shift Dialog state
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [countedCash, setCountedCash] = useState('');
  const [closeNotes, setCloseNotes] = useState('');
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);
  const [closeFormError, setCloseFormError] = useState(null);

  // Immediate post-closure reconciliation display
  const [closedReconciliation, setClosedReconciliation] = useState(null);

  // Shift History state
  const [historyShifts, setHistoryShifts] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Z-Report viewing modal
  const [viewingZReportShift, setViewingZReportShift] = useState(null);

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showNotification = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const formatPKR = (amt) =>
    `PKR ${(Number(amt) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // 1. Fetch authenticated cashier's active shift
  const fetchActiveShift = useCallback(async () => {
    setIsLoadingActive(true);
    setActiveError(null);
    try {
      const res = await shiftService.getActiveShift();
      // res.data is null if no open shift, or the open shift object
      setActiveShift(res?.data || null);
    } catch (err) {
      if (err.status === 401) {
        setActiveError('Authentication session expired. Please sign in again.');
      } else {
        setActiveError(err.message || 'Failed to check active drawer shift');
      }
    } finally {
      setIsLoadingActive(false);
    }
  }, []);

  // 2. Fetch shift audit history
  const fetchShiftHistory = useCallback(
    async (page = 1, status = historyStatusFilter) => {
      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const params = { page, limit: 10 };
        if (status && status !== 'ALL') {
          params.status = status;
        }
        const res = await shiftService.getShifts(params);
        setHistoryShifts(Array.isArray(res?.data) ? res.data : []);
        if (res?.pagination) {
          setHistoryPagination(res.pagination);
        }
      } catch (err) {
        setHistoryError(err.message || 'Failed to load shift history');
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [historyStatusFilter]
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveShift();
      fetchShiftHistory(1);
    }
  }, [isAuthenticated, fetchActiveShift, fetchShiftHistory]);

  // 3. Open Shift Handler
  const handleOpenShift = async (e) => {
    e.preventDefault();
    setOpenFormError(null);

    const floatNum = Number(openFloat);
    if (openFloat === '' || isNaN(floatNum) || floatNum < 0) {
      setOpenFormError('Please enter a valid non-negative opening float amount.');
      return;
    }

    setIsSubmittingOpen(true);
    try {
      const payload = {
        opening_float: floatNum,
        drawer_name: drawerName.trim() || undefined,
        notes: openNotes.trim() || undefined,
      };

      const res = await shiftService.openShift(payload);
      showNotification(`Cash drawer shift opened successfully (${res?.data?.shift_number})`, 'success');
      setOpenFloat('');
      setDrawerName('');
      setOpenNotes('');
      // Refresh active shift and history authoritatively from backend
      await fetchActiveShift();
      await fetchShiftHistory(1);
    } catch (err) {
      if (err.status === 409) {
        setOpenFormError(
          'An active open shift already exists for this cashier. Refreshing current shift state...'
        );
        // Refresh active shift state immediately
        await fetchActiveShift();
      } else {
        setOpenFormError(err.message || 'Failed to open cash shift');
      }
    } finally {
      setIsSubmittingOpen(false);
    }
  };

  // 4. Initiate Blind Cash Count Dialog
  const handleOpenCloseModal = () => {
    setCountedCash('');
    setCloseNotes('');
    setCloseFormError(null);
    setIsCloseModalOpen(true);
  };

  // 5. Submit Blind Cash Count & Seal Shift
  const handleSubmitCloseShift = async (e) => {
    e.preventDefault();
    setCloseFormError(null);

    const countedNum = Number(countedCash);
    if (countedCash === '' || isNaN(countedNum) || countedNum < 0) {
      setCloseFormError('Please enter a valid non-negative counted cash amount.');
      return;
    }

    setIsSubmittingClose(true);
    try {
      const payload = {
        actual_counted_cash: countedNum,
        shift_id: activeShift?._id,
        notes: closeNotes.trim() || undefined,
      };

      const res = await shiftService.closeShift(payload);
      const closedShift = res?.data;

      setIsCloseModalOpen(false);
      setClosedReconciliation(closedShift);
      showNotification(
        `Shift ${closedShift?.shift_number} sealed successfully. Z-Report generated.`,
        'success'
      );

      // Refresh active shift (now null) and history
      await fetchActiveShift();
      await fetchShiftHistory(1);
    } catch (err) {
      if (err.status === 409) {
        setCloseFormError(
          'Shift has already been closed or is currently closing. Refreshing authoritative state...'
        );
        await fetchActiveShift();
        await fetchShiftHistory(1);
      } else {
        setCloseFormError(err.message || 'Failed to close shift');
      }
    } finally {
      setIsSubmittingClose(false);
    }
  };

  // Status Filter change
  const handleFilterChange = (e) => {
    const newStatus = e.target.value;
    setHistoryStatusFilter(newStatus);
    fetchShiftHistory(1, newStatus);
  };

  // Role verification: Cashier / Front desk / Managers
  const isManager =
    user?.role === 'HOTEL_ADMIN' || user?.role === 'PLATFORM_ADMIN';

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Alert severity="warning">
          Please sign in to access the Cash Shift Handover and Drawer Management interface.
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Operational Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1b7f43] text-white flex items-center justify-center shadow-md">
              <PosIcon />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">
                Shift Handover & Cash Drawer
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 m-0 mt-0.5">
                Front desk cash drawer reconciliation, blind cash counting & official Z-Reports
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-500">Authenticated Staff</div>
            <div className="text-sm font-bold text-slate-800">
              {user?.fullName || user?.email || 'Cashier'}
            </div>
          </div>
          <Chip
            label={isManager ? 'Manager / Auditor' : 'Cashier'}
            color={isManager ? 'secondary' : 'default'}
            size="small"
            sx={{ fontWeight: 700, fontSize: '11px' }}
          />
        </div>
      </div>

      {/* Immediate Post-Closure Reconciliation Banner */}
      {closedReconciliation && (
        <div className="bg-white rounded-2xl border-2 border-[#1b7f43] p-6 shadow-md relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ReceiptIcon className="text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900 m-0">
                  Shift Sealed & Reconciled: {closedReconciliation.shift_number}
                </h2>
                <p className="text-xs text-slate-500 m-0">
                  Authoritative Z-Report generated. Review drawer balance below.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="contained"
                size="small"
                startIcon={<PrintIcon />}
                onClick={() => setViewingZReportShift(closedReconciliation)}
                sx={{
                  bgcolor: '#1b7f43',
                  '&:hover': { bgcolor: '#156736' },
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                View & Print Z-Report
              </Button>
              <IconButton
                size="small"
                onClick={() => setClosedReconciliation(null)}
                aria-label="dismiss"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold">Expected Cash in Drawer</div>
              <div className="text-lg font-extrabold font-mono text-slate-900 mt-1">
                {formatPKR(closedReconciliation.expected_cash)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Float ({formatPKR(closedReconciliation.opening_float)}) + Receipts &minus; Refunds &minus; Expenses
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold">Actual Counted Cash</div>
              <div className="text-lg font-extrabold font-mono text-slate-900 mt-1">
                {formatPKR(closedReconciliation.actual_counted_cash)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Blind physical cash count entered</div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                closedReconciliation.discrepancy_amount === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : closedReconciliation.discrepancy_amount < 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider">Reconciliation Variance</span>
                {closedReconciliation.discrepancy_amount === 0 && (
                  <Chip
                    icon={<BalancedIcon fontSize="small" />}
                    label="BALANCED"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
                {closedReconciliation.discrepancy_amount < 0 && (
                  <Chip
                    icon={<ShortageIcon fontSize="small" />}
                    label="SHORTAGE"
                    color="error"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
                {closedReconciliation.discrepancy_amount > 0 && (
                  <Chip
                    icon={<OverageIcon fontSize="small" />}
                    label="OVERAGE"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </div>
              <div className="text-xl font-extrabold font-mono mt-1">
                {closedReconciliation.discrepancy_amount > 0 ? '+' : ''}
                {formatPKR(closedReconciliation.discrepancy_amount)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Shift Dashboard OR Open Shift Form */}
      {isLoadingActive ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
          <CircularProgress size={36} sx={{ color: '#1b7f43' }} />
          <p className="text-sm text-slate-600 font-medium">Checking cashier drawer status...</p>
        </div>
      ) : activeError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchActiveShift}>
              Retry
            </Button>
          }
        >
          {activeError}
        </Alert>
      ) : activeShift ? (
        /* State B: Active Shift Dashboard */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 m-0">Active Cash Shift</h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                    {activeShift.shift_number}
                  </span>
                </div>
                <p className="text-xs text-slate-500 m-0 mt-0.5">
                  Opened by <strong>{activeShift.staff_name || 'Current Cashier'}</strong> &bull;{' '}
                  {activeShift.opened_at ? new Date(activeShift.opened_at).toLocaleString() : 'Just now'}
                </p>
              </div>
            </div>

            <Button
              variant="contained"
              color="error"
              size="medium"
              startIcon={<LockClockIcon />}
              onClick={handleOpenCloseModal}
              sx={{
                bgcolor: '#dc2626',
                '&:hover': { bgcolor: '#b91c1c' },
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
              }}
            >
              Count Cash & Close Drawer
            </Button>
          </div>

          {/* Active Shift Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Opening Float</span>
              <div className="text-lg font-extrabold font-mono text-slate-900 mt-1">
                {formatPKR(activeShift.opening_float)}
              </div>
              <span className="text-[11px] text-slate-400">Initial cash drawer float</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Drawer / Station</span>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {activeShift.drawer_name || 'Front Desk Drawer'}
              </div>
              <span className="text-[11px] text-slate-400">Assigned terminal</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Drawer Status</span>
              <div className="mt-1 flex items-center gap-2">
                <Chip label="OPEN & RECEIVING" color="success" size="small" sx={{ fontWeight: 700 }} />
              </div>
              <span className="text-[11px] text-slate-400">Ready for cash transactions</span>
            </div>
          </div>

          {/* Blind Count Security Notice */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-900">
            <SecurityIcon className="text-emerald-700 mt-0.5 shrink-0" fontSize="small" />
            <div>
              <strong>Financial Integrity & Blind Count Policy:</strong> In accordance with strict internal
              controls, running intake amounts, voucher disbursements, expenses, and expected reconciliation balances remain concealed
              until the cashier physically counts and submits actual counted cash. This ensures unskewed, auditable
              reconciliation upon shift handover.
            </div>
          </div>

          {activeShift.notes && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700">Opening Notes:</span> {activeShift.notes}
            </div>
          )}
        </div>
      ) : (
        /* State A: No Active Shift -> Opening Float Form */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CashIcon />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 m-0">No Active Cash Shift</h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Open a cash drawer shift by entering the opening float before recording cash transactions
              </p>
            </div>
          </div>

          {openFormError && (
            <Alert severity="error" onClose={() => setOpenFormError(null)}>
              {openFormError}
            </Alert>
          )}

          <form noValidate onSubmit={handleOpenShift} className="flex flex-col gap-4 max-w-xl">
            <TextField
              label="Opening Float (Starting Cash)"
              type="number"
              required
              fullWidth
              size="small"
              value={openFloat}
              onChange={(e) => setOpenFloat(e.target.value)}
              placeholder="e.g. 5000"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                  inputProps: { min: 0, step: '0.01' },
                },
              }}
              helperText="Count physical opening currency in drawer (e.g. change fund)"
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#1b7f43' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1b7f43' },
              }}
            />

            <TextField
              label="Drawer / Terminal Name (Optional)"
              type="text"
              fullWidth
              size="small"
              value={drawerName}
              onChange={(e) => setDrawerName(e.target.value)}
              placeholder="e.g. Front Desk Drawer #1"
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#1b7f43' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1b7f43' },
              }}
            />

            <TextField
              label="Shift Notes / Handover Comments (Optional)"
              multiline
              rows={2}
              fullWidth
              size="small"
              value={openNotes}
              onChange={(e) => setOpenNotes(e.target.value)}
              placeholder="Notes on handover, special change denominations, or remarks..."
              sx={{
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#1b7f43' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1b7f43' },
              }}
            />

            <div className="pt-1">
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingOpen}
                startIcon={isSubmittingOpen ? <CircularProgress size={16} color="inherit" /> : <PosIcon />}
                sx={{
                  bgcolor: '#1b7f43',
                  '&:hover': { bgcolor: '#156736' },
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                }}
              >
                {isSubmittingOpen ? 'Opening Cash Drawer...' : 'Open Cash Shift'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Blind Cash-Count Dialog (Closure Confirmation) */}
      <Dialog
        open={isCloseModalOpen}
        onClose={!isSubmittingClose ? () => setIsCloseModalOpen(false) : undefined}
        maxWidth="sm"
        fullWidth
        aria-labelledby="close-shift-dialog-title"
      >
        <DialogTitle
          id="close-shift-dialog-title"
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: '#1b7f43',
            color: '#ffffff',
          }}
        >
          <div className="flex items-center gap-2">
            <LockClockIcon className="text-rose-400" />
            <span className="font-bold text-sm tracking-wide uppercase">
              Shift Closure & Blind Cash Count
            </span>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsCloseModalOpen(false)}
            disabled={isSubmittingClose}
            sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <form noValidate onSubmit={handleSubmitCloseShift}>
          <DialogContent sx={{ p: 3, bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {closeFormError && (
              <Alert severity="error">
                {closeFormError}
              </Alert>
            )}

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 leading-relaxed">
              <strong>Audit Handover Requirement:</strong> Count every note and coin currently in the drawer.
              Enter your exact counted total below. The authoritative ledger will calculate the discrepancy and seal
              this shift.
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Shift Number:</span>
                <span className="font-mono font-bold text-slate-800">{activeShift?.shift_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Drawer:</span>
                <span className="text-slate-800">{activeShift?.drawer_name || 'Front Desk Drawer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Opening Float:</span>
                <span className="font-mono text-slate-800">{formatPKR(activeShift?.opening_float)}</span>
              </div>
            </div>

            <TextField
              label="Actual Counted Cash"
              type="number"
              required
              autoFocus
              fullWidth
              size="small"
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value)}
              placeholder="0.00"
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">PKR</InputAdornment>,
                  inputProps: { min: 0, step: '0.01' },
                },
              }}
              helperText="Physical total of all cash denominations currently in the drawer"
            />

            <TextField
              label="Closing Remarks / Next Cashier Handover Notes"
              multiline
              rows={2}
              fullWidth
              size="small"
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="Notes on handover, currency breakdowns, or explanations..."
            />
          </DialogContent>

          <DialogActions sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
            <Button
              onClick={() => setIsCloseModalOpen(false)}
              disabled={isSubmittingClose}
              color="inherit"
              size="small"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmittingClose}
              startIcon={isSubmittingClose ? <CircularProgress size={16} color="inherit" /> : <LockClockIcon />}
              sx={{
                bgcolor: '#dc2626',
                '&:hover': { bgcolor: '#b91c1c' },
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {isSubmittingClose ? 'Sealing Shift...' : 'Confirm Count & Seal Shift'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Shift Audit History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <HistoryIcon className="text-slate-700" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 m-0">Shift Handover & Z-Report History</h2>
              <p className="text-xs text-slate-500 m-0">
                Authoritative history of cash shifts, closures, and discrepancy audits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="shift-status-filter-label">Status</InputLabel>
              <Select
                labelId="shift-status-filter-label"
                value={historyStatusFilter}
                label="Status"
                onChange={handleFilterChange}
                sx={{ fontSize: '12px' }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="OPEN">Open Only</MenuItem>
                <MenuItem value="CLOSED">Closed Only</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => fetchShiftHistory(historyPagination.page)}
              disabled={isLoadingHistory}
              sx={{ textTransform: 'none', fontSize: '12px' }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {historyError && (
          <Alert severity="error" sx={{ my: 2 }}>
            {historyError}
          </Alert>
        )}

        {isLoadingHistory ? (
          <div className="py-12 flex justify-center">
            <CircularProgress size={32} sx={{ color: '#1b7f43' }} />
          </div>
        ) : historyShifts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            No shifts recorded matching the current filter.
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <Table size="small" aria-label="shifts table">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#475569' }}>
                    Shift #
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#475569' }}>
                    Cashier
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#475569' }}>
                    Drawer
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#475569' }}>
                    Opened / Closed
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#475569' }}
                  >
                    Float
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#475569' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#475569' }}>
                    Reconciliation / Variance
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#475569' }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyShifts.map((sh) => {
                  const isClosed = sh.status === 'CLOSED';
                  const disc = Number(sh.discrepancy_amount || 0);

                  return (
                    <TableRow key={sh._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '12px' }}>
                        {sh.shift_number}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', fontWeight: 500 }}>
                        {sh.staff_name || 'Cashier'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', color: '#64748b' }}>
                        {sh.drawer_name || 'Front Desk'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '11px' }}>
                        <div>{sh.opened_at ? new Date(sh.opened_at).toLocaleDateString() : 'N/A'}</div>
                        <div className="text-slate-400">
                          {sh.closed_at ? new Date(sh.closed_at).toLocaleTimeString() : 'In Progress'}
                        </div>
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {formatPKR(sh.opening_float)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sh.status}
                          size="small"
                          color={isClosed ? 'default' : 'success'}
                          sx={{ fontWeight: 700, fontSize: '10px' }}
                        />
                      </TableCell>
                      <TableCell>
                        {isClosed ? (
                          <div className="flex items-center gap-1.5">
                            {disc === 0 ? (
                              <Chip
                                icon={<BalancedIcon fontSize="small" />}
                                label="BALANCED"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 700, fontSize: '10px' }}
                              />
                            ) : disc < 0 ? (
                              <Chip
                                icon={<ShortageIcon fontSize="small" />}
                                label={`SHORT (${formatPKR(Math.abs(disc))})`}
                                color="error"
                                size="small"
                                sx={{ fontWeight: 700, fontSize: '10px' }}
                              />
                            ) : (
                              <Chip
                                icon={<OverageIcon fontSize="small" />}
                                label={`OVER (+${formatPKR(disc)})`}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 700, fontSize: '10px' }}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">In Progress</span>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {isClosed ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => setViewingZReportShift(sh)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '11px',
                              py: 0.25,
                              px: 1,
                              borderColor: '#1b7f43',
                              color: '#1b7f43',
                              '&:hover': { borderColor: '#156736', bgcolor: '#e5f4eb' },
                            }}
                          >
                            Z-Report
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">Active</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {historyPagination.pages > 1 && (
          <div className="flex justify-end pt-2">
            <Pagination
              count={historyPagination.pages}
              page={historyPagination.page}
              onChange={(_, page) => fetchShiftHistory(page)}
              size="small"
              sx={{ '& .Mui-selected': { bgcolor: '#1b7f43 !important', color: '#ffffff' } }}
            />
          </div>
        )}
      </div>

      {/* Authoritative Z-Report Modal */}
      <ZReportModal
        open={Boolean(viewingZReportShift)}
        onClose={() => setViewingZReportShift(null)}
        shift={viewingZReportShift}
      />

      {/* Global Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
