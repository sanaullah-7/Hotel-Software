import React from 'react';
import {
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TagIcon from '@mui/icons-material/Tag';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WcIcon from '@mui/icons-material/Wc';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PublicIcon from '@mui/icons-material/Public';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TranslateIcon from '@mui/icons-material/Translate';

import {
  SectionHeader,
  inputStyle,
  dateInputStyle
} from './staffFormStyles';

export default function PersonalInfoSection({
  formData,
  formErrors,
  onChange,
  onRegenerateId,
  dobFocused,
  setDobFocused
}) {
  return (
    <>
      <SectionHeader
        icon={PersonOutlinedIcon}
        title="Personal Information"
        badgeBg="#eef2ff"
        iconColor="#5d5fef"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Full Name */}
        <div>
          <TextField
            fullWidth
            label="Full Name*"
            name="fullName"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={onChange}
            error={Boolean(formErrors.fullName)}
            helperText={formErrors.fullName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Employee ID */}
        <div>
          <TextField
            fullWidth
            label="Employee ID*"
            name="empId"
            value={formData.empId}
            onChange={onChange}
            error={Boolean(formErrors.empId)}
            helperText={formErrors.empId}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TagIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Generate New ID">
                    <IconButton size="small" onClick={onRegenerateId} edge="end">
                      <AutorenewIcon sx={{ color: '#5d5fef', fontSize: 19 }} />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Gender */}
        <div>
          <TextField
            fullWidth
            select
            label="Gender*"
            name="gender"
            value={formData.gender}
            onChange={onChange}
            error={Boolean(formErrors.gender)}
            helperText={formErrors.gender}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WcIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="" disabled className="text-gray-400">
              Select Gender
            </MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </div>

        {/* Date of Birth */}
        <div>
          <TextField
            fullWidth
            label="Date of Birth*"
            name="dob"
            type={dobFocused || formData.dob ? 'date' : 'text'}
            onFocus={() => setDobFocused(true)}
            onBlur={() => setDobFocused(false)}
            placeholder="Date of Birth*"
            value={formData.dob}
            onChange={onChange}
            error={Boolean(formErrors.dob)}
            helperText={formErrors.dob}
            InputLabelProps={{
              shrink: Boolean(dobFocused || formData.dob),
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

        {/* Nationality */}
        <div>
          <TextField
            fullWidth
            label="Nationality*"
            name="nationality"
            placeholder="e.g., American, Pakistani, British"
            value={formData.nationality}
            onChange={onChange}
            error={Boolean(formErrors.nationality)}
            helperText={formErrors.nationality}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PublicIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Marital Status */}
        <div>
          <TextField
            fullWidth
            select
            label="Marital Status*"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={onChange}
            error={Boolean(formErrors.maritalStatus)}
            helperText={formErrors.maritalStatus}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FavoriteBorderIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="" disabled className="text-gray-400">
              Select Status
            </MenuItem>
            <MenuItem value="Single">Single</MenuItem>
            <MenuItem value="Married">Married</MenuItem>
            <MenuItem value="Divorced">Divorced</MenuItem>
            <MenuItem value="Widowed">Widowed</MenuItem>
          </TextField>
        </div>

        {/* Languages Spoken (Full width) */}
        <div className="sm:col-span-2">
          <TextField
            fullWidth
            label="Languages Spoken"
            name="languages"
            placeholder="e.g., English, Spanish, French, Urdu"
            value={formData.languages}
            onChange={onChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TranslateIcon sx={{ color: '#64748b', fontSize: 21 }} />
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
