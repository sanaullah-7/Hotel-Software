import React from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
  Alert
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const modalInputStyle = {
  '& .MuiOutlinedInput-root': {
    height: '46px',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    color: '#1e293b',
    '& fieldset': {
      borderColor: '#e2e8f0',
      borderWidth: '1.2px',
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5d5fef',
      borderWidth: '1.5px',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(93, 95, 239, 0.12)',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '13.5px',
    color: '#64748b',
    '&.Mui-focused': {
      color: '#5d5fef',
      fontWeight: 500,
    },
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.85)',
    backgroundColor: '#ffffff',
    padding: '0 4px',
  },
};

export const ApplyLeaveModal = ({
  isOpen,
  onClose,
  editingItem,
  modalForm,
  setModalForm,
  handleSaveModal,
  employees = [],
  isSubmitting = false,
  error = null
}) => {
  const handleDateChange = (field, val) => {
    setModalForm((prev) => {
      const next = { ...prev, [field]: val };
      if (next.from && next.to) {
        try {
          const d1 = new Date(next.from);
          const d2 = new Date(next.to);
          if (!isNaN(d1) && !isNaN(d2) && d2 >= d1) {
            next.days = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
          }
        } catch {}
      }
      return next;
    });
  };

  return (
    <Dialog
      className="assigned-form-surface"
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      {/* Modal Header Banner */}
      <div className="assigned-modal-header px-5 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <PersonOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />
          </div>
          <h3 className="text-base font-bold tracking-tight">
            {editingItem ? 'Edit Leave Request' : 'New Leave Request'}
          </h3>
        </div>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: '#ffffff',
            backgroundColor: 'rgba(255,255,255,0.15)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </div>

      {/* Modal Body Form */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {error && (
          <div className="mb-4">
            <Alert severity="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSaveModal} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee Selection */}
            <div>
              {editingItem ? (
                <TextField
                  fullWidth
                  label="Employee"
                  value={modalForm.name || ''}
                  disabled
                  sx={modalInputStyle}
                />
              ) : (
                <TextField
                  fullWidth
                  select
                  label="Employee*"
                  value={modalForm.employee_id || ''}
                  onChange={(e) => {
                    const empId = e.target.value;
                    const selectedEmp = employees.find(
                      (emp) => String(emp.id) === String(empId) || String(emp._id) === String(empId)
                    );
                    setModalForm((prev) => ({
                      ...prev,
                      employee_id: empId,
                      name: selectedEmp?.name || prev.name,
                      department: selectedEmp?.department || prev.department,
                      designation: selectedEmp?.designation || prev.designation,
                    }));
                  }}
                  required
                  sx={modalInputStyle}
                >
                  <MenuItem value="" disabled>
                    Select Employee
                  </MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id || emp._id} value={emp.id || emp._id}>
                      {emp.name} ({emp.empId || emp.employee_ref}) — {emp.designation || 'Staff'}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </div>

            {/* Department */}
            <div>
              <TextField
                fullWidth
                label="Department"
                value={modalForm.department || ''}
                disabled
                sx={modalInputStyle}
              />
            </div>

            {/* Leave Type */}
            <div>
              <TextField
                fullWidth
                select
                label="Leave Type*"
                value={modalForm.leaveType}
                onChange={(e) => setModalForm((prev) => ({ ...prev, leaveType: e.target.value }))}
                sx={modalInputStyle}
              >
                <MenuItem value="Special Leave">Special Leave</MenuItem>
                <MenuItem value="Personal Leave">Personal Leave</MenuItem>
                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                <MenuItem value="Annual Leave">Annual Leave</MenuItem>
                <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
                <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
              </TextField>
            </div>

            {/* Status */}
            <div>
              <TextField
                fullWidth
                select
                label="Status*"
                value={modalForm.status}
                onChange={(e) => setModalForm((prev) => ({ ...prev, status: e.target.value }))}
                sx={modalInputStyle}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </TextField>
            </div>

            {/* Start Date */}
            <div>
              <TextField
                fullWidth
                label="Start Date*"
                type="date"
                value={modalForm.from}
                onChange={(e) => handleDateChange('from', e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarTodayIcon sx={{ color: '#1e293b', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={modalInputStyle}
              />
            </div>

            {/* End Date */}
            <div>
              <TextField
                fullWidth
                label="End Date*"
                type="date"
                value={modalForm.to}
                onChange={(e) => handleDateChange('to', e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <CalendarTodayIcon sx={{ color: '#1e293b', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={modalInputStyle}
              />
            </div>

            {/* No of days */}
            <div>
              <TextField
                fullWidth
                label="No of days*"
                type="number"
                value={modalForm.days}
                onChange={(e) => setModalForm((prev) => ({ ...prev, days: Number(e.target.value) }))}
                sx={modalInputStyle}
              />
            </div>

            {/* Approved By */}
            <div>
              <TextField
                fullWidth
                select
                label="Approved By (Optional)"
                value={modalForm.approved_by || ''}
                onChange={(e) => {
                  const approverId = e.target.value;
                  const approverEmp = employees.find(
                    (emp) => String(emp.id) === String(approverId) || String(emp._id) === String(approverId)
                  );
                  setModalForm((prev) => ({
                    ...prev,
                    approved_by: approverId,
                    approvedBy: approverEmp?.name || ''
                  }));
                }}
                sx={modalInputStyle}
              >
                <MenuItem value="">None / Pending</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id || emp._id} value={emp.id || emp._id}>
                    {emp.name} ({emp.empId || emp.employee_ref})
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>

          {/* Reason */}
          <div>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason*"
              placeholder="Specify the reason for leave..."
              value={modalForm.reason}
              onChange={(e) => setModalForm((prev) => ({ ...prev, reason: e.target.value }))}
              required
              sx={{
                ...modalInputStyle,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '7px',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  color: '#1e293b',
                  padding: '10px 12px',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#5d5fef' }
                }
              }}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="assigned-primary-button px-6 py-2 text-sm font-medium rounded-full shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="assigned-secondary-button px-6 py-2 text-sm font-medium rounded-full transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
