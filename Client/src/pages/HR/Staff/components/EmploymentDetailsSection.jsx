import React, { useState } from 'react';
import {
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

import staffService from '../../../../features/staff/services/staffService';
import {
  SectionHeader,
  inputStyle,
  dateInputStyle
} from './staffFormStyles';

export default function EmploymentDetailsSection({
  formData,
  formErrors,
  onChange,
  joiningFocused,
  setJoiningFocused,
  departments = [],
  onDepartmentAdded
}) {
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDescription, setNewDeptDescription] = useState('');
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
  const [modalErrors, setModalErrors] = useState({});
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);
  const [serverError, setServerError] = useState(null);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setNewDeptName(val);
    if (modalErrors.name) setModalErrors((prev) => ({ ...prev, name: null }));
    if (!isCodeManuallyEdited) {
      const words = val.trim().split(/\s+/).filter(Boolean);
      let autoCode = '';
      if (words.length > 1) {
        autoCode = words.map((w) => w[0]).join('').toUpperCase().slice(0, 6);
      } else if (words.length === 1) {
        autoCode = words[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
      }
      setNewDeptCode(autoCode);
    }
  };

  const handleCodeChange = (e) => {
    setIsCodeManuallyEdited(true);
    setNewDeptCode(e.target.value.toUpperCase());
    if (modalErrors.code) setModalErrors((prev) => ({ ...prev, code: null }));
  };

  const handleCloseModal = () => {
    if (isSubmittingDept) return;
    setIsAddDeptOpen(false);
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptDescription('');
    setIsCodeManuallyEdited(false);
    setModalErrors({});
    setServerError(null);
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    const errors = {};
    const trimmedName = newDeptName.trim();
    let trimmedCode = newDeptCode.trim().toUpperCase();

    if (!trimmedName) {
      errors.name = 'Department Name is required';
    }

    if (!trimmedCode) {
      trimmedCode = trimmedName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'DEPT';
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setIsSubmittingDept(true);
    setServerError(null);

    try {
      const res = await staffService.createDepartment({
        name: trimmedName,
        code: trimmedCode,
        description: newDeptDescription.trim()
      });

      const created = res?.data;
      if (created && onDepartmentAdded) {
        onDepartmentAdded(created);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Failed to create department:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to create department';
      setServerError(msg);
    } finally {
      setIsSubmittingDept(false);
    }
  };

  return (
    <>
      <SectionHeader
        icon={WorkHistoryOutlinedIcon}
        title="Employment & Role"
        badgeBg="#eff6ff"
        iconColor="#3b82f6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Designation */}
        <div>
          <TextField
            fullWidth
            select
            label="Designation*"
            name="designation"
            value={formData.designation}
            onChange={onChange}
            error={Boolean(formErrors.designation)}
            helperText={formErrors.designation}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WorkHistoryOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="" disabled className="text-gray-400">
              Select Designation
            </MenuItem>
            <MenuItem value="Hotel Manager">Hotel Manager</MenuItem>
            <MenuItem value="Assistant Manager">Assistant Manager</MenuItem>
            <MenuItem value="Front Desk Officer">Front Desk Officer</MenuItem>
            <MenuItem value="Receptionist">Receptionist</MenuItem>
            <MenuItem value="Head Chef">Head Chef</MenuItem>
            <MenuItem value="Sous Chef">Sous Chef</MenuItem>
            <MenuItem value="Housekeeping Supervisor">Housekeeping Supervisor</MenuItem>
            <MenuItem value="Room Attendant">Room Attendant</MenuItem>
            <MenuItem value="Concierge">Concierge</MenuItem>
            <MenuItem value="Security Guard">Security Guard</MenuItem>
            <MenuItem value="Maintenance Technician">Maintenance Technician</MenuItem>
            <MenuItem value="Bartender">Bartender</MenuItem>
            <MenuItem value="Waiter/Waitress">Waiter/Waitress</MenuItem>
          </TextField>
        </div>

        {/* Department */}
        <div>
          <TextField
            fullWidth
            select
            label="Department*"
            name="department"
            value={formData.department}
            onChange={(e) => {
              if (e.target.value === '__add_new__') {
                setIsAddDeptOpen(true);
                return;
              }
              onChange(e);
            }}
            error={Boolean(formErrors.department)}
            helperText={formErrors.department}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="" disabled className="text-gray-400">
              Select Department
            </MenuItem>
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{dept.name}</span>
                    {dept.code && (
                      <span className="text-[11px] bg-gray-100 text-gray-600 font-mono px-1.5 py-0.5 rounded ml-2">
                        {dept.code}
                      </span>
                    )}
                  </div>
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                No departments available
              </MenuItem>
            )}
            <MenuItem
              value="__add_new__"
              sx={{
                borderTop: '1px solid #f1f5f9',
                color: '#059669',
                fontWeight: 600,
                fontSize: '13px',
                py: 1,
                mt: 0.5,
                '&:hover': { backgroundColor: '#ecfdf5' },
              }}
            >
              <AddIcon sx={{ fontSize: 16, mr: 1, color: '#059669' }} />
              + Add New Department...
            </MenuItem>
          </TextField>
        </div>

        {/* Joining Date */}
        <div>
          <TextField
            fullWidth
            label="Joining Date*"
            name="joiningDate"
            type={joiningFocused || formData.joiningDate ? 'date' : 'text'}
            onFocus={() => setJoiningFocused(true)}
            onBlur={() => setJoiningFocused(false)}
            placeholder="Joining Date*"
            value={formData.joiningDate}
            onChange={onChange}
            error={Boolean(formErrors.joiningDate)}
            helperText={formErrors.joiningDate}
            InputLabelProps={{
              shrink: Boolean(joiningFocused || formData.joiningDate),
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    edge="end"
                    tabIndex={-1}
                    onClick={(e) => {
                      const input = e.currentTarget
                        .closest('.MuiOutlinedInput-root')
                        ?.querySelector('input');
                      if (input) {
                        input.focus();
                        if (input.showPicker) input.showPicker();
                      }
                    }}
                  >
                    <CalendarTodayIcon sx={{ color: '#1e293b', fontSize: 20 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={dateInputStyle}
          />
        </div>

        {/* Employee Type */}
        <div>
          <TextField
            fullWidth
            select
            label="Employee Type*"
            name="empType"
            value={formData.empType}
            onChange={onChange}
            error={Boolean(formErrors.empType)}
            helperText={formErrors.empType}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="" disabled className="text-gray-400">
              Select Employee Type
            </MenuItem>
            <MenuItem value="Full-Time">Full-Time</MenuItem>
            <MenuItem value="Part-Time">Part-Time</MenuItem>
            <MenuItem value="Contract">Contract</MenuItem>
            <MenuItem value="Seasonal">Seasonal</MenuItem>
            <MenuItem value="Intern">Intern</MenuItem>
          </TextField>
        </div>

        {/* Shift */}
        <div>
          <TextField
            fullWidth
            select
            label="Shift*"
            name="shift"
            value={formData.shift}
            onChange={onChange}
            error={Boolean(formErrors.shift)}
            helperText={formErrors.shift}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="" disabled className="text-gray-400">
              Select Shift
            </MenuItem>
            <MenuItem value="Morning Shift">Morning Shift (06:00 - 14:00)</MenuItem>
            <MenuItem value="Evening Shift">Evening Shift (14:00 - 22:00)</MenuItem>
            <MenuItem value="Night Shift">Night Shift (22:00 - 06:00)</MenuItem>
            <MenuItem value="Rotational">Rotational</MenuItem>
          </TextField>
        </div>

        {/* Salary / Rate ($) */}
        <div>
          <TextField
            fullWidth
            label="Salary / Rate ($)*"
            name="salary"
            type="number"
            placeholder="e.g. 4500"
            value={formData.salary}
            onChange={onChange}
            error={Boolean(formErrors.salary)}
            helperText={formErrors.salary}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Employment Status */}
        <div>
          <TextField
            fullWidth
            select
            label="Employment Status*"
            name="employmentStatus"
            value={formData.employmentStatus}
            onChange={onChange}
            error={Boolean(formErrors.employmentStatus)}
            helperText={formErrors.employmentStatus}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VerifiedOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="On Leave">On Leave</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
            <MenuItem value="Terminated">Terminated</MenuItem>
          </TextField>
        </div>

        {/* Reports To (Manager) */}
        <div>
          <TextField
            fullWidth
            label="Reports To (Manager)"
            name="reportsTo"
            placeholder="e.g. John Doe (General Manager)"
            value={formData.reportsTo}
            onChange={onChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SupervisorAccountOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>
      </div>

      {/* Quick Add Department Modal */}
      <Dialog
        open={isAddDeptOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            p: 1,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BusinessIcon sx={{ fontSize: 18 }} />
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-gray-800 leading-tight">Add New Department</h4>
              <p className="text-[12px] text-gray-500 mt-0.5">Define a department for staff assignment</p>
            </div>
          </div>
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            size="small"
            sx={{ color: '#94a3b8' }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCreateDepartment} noValidate autoComplete="off">
          <DialogContent sx={{ p: 2, pt: 1.5 }}>
            {serverError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '13px' }}>
                {serverError}
              </Alert>
            )}

            <div className="space-y-3.5">
              <div>
                <TextField
                  fullWidth
                  label="Department Name*"
                  placeholder="e.g. Concierge & Guest Experience"
                  value={newDeptName}
                  onChange={handleNameChange}
                  error={Boolean(modalErrors.name)}
                  helperText={modalErrors.name}
                  autoFocus
                  sx={inputStyle}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  label="Department Code*"
                  placeholder="e.g. CGE"
                  value={newDeptCode}
                  onChange={handleCodeChange}
                  error={Boolean(modalErrors.code)}
                  helperText={modalErrors.code || "Unique short code (e.g., FD, HK, SEC)"}
                  inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
                  sx={inputStyle}
                />
              </div>

              <div>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  placeholder="Brief note about the department responsibilities"
                  value={newDeptDescription}
                  onChange={(e) => setNewDeptDescription(e.target.value)}
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '7px',
                      fontSize: '14px',
                      '& fieldset': { borderColor: '#d1d5db' },
                      '&:hover fieldset': { borderColor: 'var(--primary-main)' },
                      '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)' }
                    }
                  }}
                />
              </div>
            </div>
          </DialogContent>

          <DialogActions sx={{ px: 2, pb: 2, pt: 1, gap: 1 }}>
            <Button
              onClick={handleCloseModal}
              disabled={isSubmittingDept}
              sx={{
                color: '#64748b',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                borderRadius: '8px',
                px: 2
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmittingDept || !newDeptName.trim()}
              startIcon={isSubmittingDept ? <CircularProgress size={16} color="inherit" /> : <AddIcon sx={{ fontSize: 18 }} />}
              sx={{
                backgroundColor: 'var(--primary-main, #059669)',
                '&:hover': { backgroundColor: '#047857' },
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13.5px',
                borderRadius: '8px',
                px: 2.5,
                boxShadow: 'none'
              }}
            >
              {isSubmittingDept ? 'Creating...' : 'Create Department'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
