import React from 'react';
import {
  CircularProgress,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from '@mui/material';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';

import { departmentsList, rolesList, paymentMethodsList } from './constants';

export const SalaryModals = ({
  isAddModalOpen,
  setIsAddModalOpen,
  handleSaveNewSalary,
  formData,
  setFormData,
  isEditModalOpen,
  setIsEditModalOpen,
  handleSaveEditSalary,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  selectedRecord,
  handleConfirmDelete,
  // Payment Modal Props
  isPaymentModalOpen,
  setIsPaymentModalOpen,
  paymentRecord,
  paymentForm,
  setPaymentForm,
  isSavingPayment,
  handleSavePayment,
  // History Modal Props
  isHistoryModalOpen,
  setIsHistoryModalOpen,
  historyEmployee,
  historyList,
  isHistoryLoading,
  handleDownloadPayslip,
}) => {
  return (
    <>
      {/* 1. Dialog: Record Salary Payment (Full or Partial) */}
      <Dialog
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        <div className="bg-[#1b7f43] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <PaymentsOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white leading-tight">
                Record Salary Disbursement
              </h3>
              <p className="text-[11px] text-green-100">
                {paymentRecord?.name} ({paymentRecord?.empId})
              </p>
            </div>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsPaymentModalOpen(false)}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          {paymentRecord && (
            <form onSubmit={handleSavePayment} className="space-y-4">
              {/* Summary Breakdown Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10.5px] text-slate-500 font-medium">Net Payable</div>
                  <div className="text-sm font-bold text-slate-800">
                    ${Number(paymentRecord.netSalary || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-slate-500 font-medium">Already Paid</div>
                  <div className="text-sm font-bold text-emerald-600">
                    ${Number(paymentRecord.paidAmount || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] text-slate-500 font-medium">Remaining Due</div>
                  <div className="text-sm font-bold text-amber-600">
                    ${Number(paymentRecord.remainingBalance || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Payment Type Selection */}
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>
                  Disbursement Type
                </FormLabel>
                <RadioGroup
                  row
                  value={paymentForm.paymentType}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentType: e.target.value,
                      amount:
                        e.target.value === 'FULL'
                          ? paymentRecord.remainingBalance > 0
                            ? paymentRecord.remainingBalance
                            : paymentRecord.netSalary
                          : '',
                    })
                  }
                  sx={{ mt: 0.5 }}
                >
                  <FormControlLabel
                    value="FULL"
                    control={<Radio size="small" sx={{ color: '#1b7f43', '&.Mui-checked': { color: '#1b7f43' } }} />}
                    label={
                      <span className="text-xs font-semibold text-slate-800">
                        Full Settlement ($
                        {paymentRecord.remainingBalance > 0
                          ? paymentRecord.remainingBalance.toLocaleString()
                          : paymentRecord.netSalary.toLocaleString()}
                        )
                      </span>
                    }
                  />
                  <FormControlLabel
                    value="PARTIAL"
                    control={<Radio size="small" sx={{ color: '#1b7f43', '&.Mui-checked': { color: '#1b7f43' } }} />}
                    label={
                      <span className="text-xs font-semibold text-slate-800">
                        Partial Payment (Custom Amount)
                      </span>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {/* Amount Input (If Partial) */}
              {paymentForm.paymentType === 'PARTIAL' && (
                <div>
                  <TextField
                    fullWidth
                    size="small"
                    label="Payment Amount (USD) *"
                    type="number"
                    placeholder={`Max $${paymentRecord.remainingBalance.toLocaleString()}`}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    required
                    inputProps={{ min: 1, max: paymentRecord.remainingBalance }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyOutlinedIcon sx={{ color: '#1b7f43', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <span className="text-[10.5px] text-slate-500 mt-1 block">
                    Remaining unpaid balance will remain marked as <strong>Partial</strong>.
                  </span>
                </div>
              )}

              {/* Payment Method & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Payment Method *"
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    required
                  >
                    {paymentMethodsList.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                <div>
                  <TextField
                    fullWidth
                    size="small"
                    label="Disbursement Date *"
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventOutlinedIcon sx={{ color: '#64748b', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </div>
              </div>

              {/* Notes / Reference */}
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Payment Notes / Transaction Ref"
                  placeholder="e.g. Bank Ref #98124, Paid via Cheque #442"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <NotesOutlinedIcon sx={{ color: '#64748b', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPayment}
                  className="px-5 py-2 rounded-lg bg-[#1b7f43] hover:bg-[#156635] text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingPayment && <CircularProgress size={14} color="inherit" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Dialog: Salary Payment History Ledger */}
      <Dialog
        open={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        <div className="bg-[#0284c7] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <HistoryOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white leading-tight">
                Historical Salary Ledger
              </h3>
              <p className="text-[11px] text-sky-100">
                {historyEmployee?.name} • ID: {historyEmployee?.empId} • Dept: {historyEmployee?.department}
              </p>
            </div>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsHistoryModalOpen(false)}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {isHistoryLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500">
              <CircularProgress size={32} sx={{ color: '#0284c7', mb: 2 }} />
              <div className="text-xs font-medium">Fetching complete salary payment ledger...</div>
            </div>
          ) : historyList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
              <div className="text-xs font-semibold text-slate-600">No Salary History Found</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No past payroll records have been processed for {historyEmployee?.name} yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-slate-100">
              <table className="w-full border-collapse text-left text-[11px] min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wide border-b border-slate-200">
                    <th className="py-2 px-3">Period / Run</th>
                    <th className="py-2 px-3">Net Pay</th>
                    <th className="py-2 px-3">Amount Paid</th>
                    <th className="py-2 px-3">Balance</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3">Method & Date</th>
                    <th className="py-2 px-3 text-center">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {historyList.map((item) => {
                    const periodDate = item.period_start
                      ? new Date(item.period_start).toLocaleDateString('default', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Past Cycle';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-800">{periodDate}</div>
                          <div className="text-[10px] text-slate-400">{item.run_ref}</div>
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          ${item.netSalary.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-semibold text-emerald-600">
                          ${item.paidAmount.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-medium text-amber-600">
                          ${item.remainingBalance.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.paymentStatus === 'Paid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircleOutlinedIcon sx={{ fontSize: 11 }} /> Paid
                            </span>
                          ) : item.paymentStatus === 'Partial' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <HourglassBottomOutlinedIcon sx={{ fontSize: 11 }} /> Partial
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <PendingOutlinedIcon sx={{ fontSize: 11 }} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          <div>{(item.paymentMethod || 'BANK_TRANSFER').replace('_', ' ')}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.paymentDate
                              ? new Date(item.paymentDate).toLocaleDateString()
                              : item.process_date
                              ? new Date(item.process_date).toLocaleDateString()
                              : 'Pending'}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Tooltip title="Download Historical Payslip">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPayslip(item)}
                              sx={{
                                color: '#0284c7',
                                '&:hover': { backgroundColor: '#f0f9ff' },
                                padding: '3px',
                              }}
                            >
                              <FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close Ledger
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Dialog: Add New Employee Salary */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        <div className="bg-[#5d5fef] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <PaymentsOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">New Employee Salary</h3>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsAddModalOpen(false)}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <form onSubmit={handleSaveNewSalary} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  placeholder="Employee Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Employee ID"
                  placeholder="e.g. EMP-101"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <TagOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  placeholder="test@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <MailOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departmentsList
                    .filter((d) => d !== 'All')
                    .map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                </TextField>
              </div>

              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {rolesList.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Basic Salary"
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PaymentsOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Bonus"
                  type="number"
                  placeholder="e.g. 200"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <AttachMoneyOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Deductions"
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <RemoveCircleOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Dialog: Edit Employee Salary */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        <div className="bg-[#5d5fef] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <PaymentsOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">Edit Employee Salary</h3>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsEditModalOpen(false)}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </div>

        <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <form onSubmit={handleSaveEditSalary} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Employee ID"
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <TagOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <MailOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                >
                  {departmentsList
                    .filter((d) => d !== 'All')
                    .map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                </TextField>
              </div>

              <div>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  {rolesList.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Basic Salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <PaymentsOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Bonus"
                  type="number"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <AttachMoneyOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  size="small"
                  label="Deductions"
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <RemoveCircleOutlineOutlinedIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2 rounded-full bg-[#e11d48] hover:bg-[#be123c] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Dialog: Delete Confirmation */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 2,
            textAlign: 'center',
          },
        }}
      >
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-3">
          <WarningAmberOutlinedIcon sx={{ fontSize: 28 }} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Reset Salary Record?</h3>
        <p className="text-xs text-slate-500 mb-5">
          Are you sure you want to reset salary record for{' '}
          <strong className="text-slate-700">{selectedRecord?.name}</strong>?
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </Dialog>
    </>
  );
};

export default SalaryModals;
