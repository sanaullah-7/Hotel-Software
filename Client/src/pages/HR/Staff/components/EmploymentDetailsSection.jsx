import React from 'react';
import {
  TextField,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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
  setJoiningFocused
}) {
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
            onChange={onChange}
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
            <MenuItem value="Management">Management</MenuItem>
            <MenuItem value="Front Office">Front Office</MenuItem>
            <MenuItem value="Housekeeping">Housekeeping</MenuItem>
            <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
            <MenuItem value="Kitchen">Kitchen</MenuItem>
            <MenuItem value="Security">Security</MenuItem>
            <MenuItem value="Maintenance">Maintenance</MenuItem>
            <MenuItem value="Accounts & Finance">Accounts & Finance</MenuItem>
            <MenuItem value="Human Resources">Human Resources</MenuItem>
            <MenuItem value="Spa & Wellness">Spa & Wellness</MenuItem>
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
    </>
  );
}
