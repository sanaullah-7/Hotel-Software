import React from 'react';
import {
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';

import {
  SectionHeader,
  inputStyle,
  multilineStyle
} from './staffFormStyles';

export default function ContactDetailsSection({
  formData,
  formErrors,
  onChange
}) {
  return (
    <>
      {/* SECTION 3: CONTACT INFORMATION */}
      <SectionHeader
        icon={PhoneOutlinedIcon}
        title="Contact Information"
        badgeBg="#ecfdf5"
        iconColor="#10b981"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Mobile Phone */}
        <div>
          <TextField
            fullWidth
            label="Mobile Phone*"
            name="mobile"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.mobile}
            onChange={onChange}
            error={Boolean(formErrors.mobile)}
            helperText={formErrors.mobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Alternative Phone */}
        <div>
          <TextField
            fullWidth
            label="Alternative Phone"
            name="altPhone"
            type="tel"
            placeholder="+1 (555) 111-2222"
            value={formData.altPhone}
            onChange={onChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SmartphoneOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Email Address (Full width) */}
        <div className="sm:col-span-2">
          <TextField
            fullWidth
            label="Email Address*"
            name="email"
            type="email"
            placeholder="employee@hotelmanagement.com"
            value={formData.email}
            onChange={onChange}
            error={Boolean(formErrors.email)}
            helperText={formErrors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Address (Full width multiline) */}
        <div className="sm:col-span-2">
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Address*"
            name="address"
            placeholder="Street address, Apartment, City, State, ZIP code"
            value={formData.address}
            onChange={onChange}
            error={Boolean(formErrors.address)}
            helperText={formErrors.address}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                  <HomeOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={multilineStyle}
          />
        </div>
      </div>

      {/* SECTION 5: EMERGENCY CONTACT */}
      <SectionHeader
        icon={ContactPhoneOutlinedIcon}
        title="Emergency Contact"
        badgeBg="#fef2f2"
        iconColor="#ef4444"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Emergency Contact Name */}
        <div>
          <TextField
            fullWidth
            label="Emergency Contact Name*"
            name="emergencyName"
            placeholder="Contact person's full name"
            value={formData.emergencyName}
            onChange={onChange}
            error={Boolean(formErrors.emergencyName)}
            helperText={formErrors.emergencyName}
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

        {/* Emergency Contact Phone */}
        <div>
          <TextField
            fullWidth
            label="Emergency Contact Phone*"
            name="emergencyPhone"
            type="tel"
            placeholder="+1 (555) 999-8888"
            value={formData.emergencyPhone}
            onChange={onChange}
            error={Boolean(formErrors.emergencyPhone)}
            helperText={formErrors.emergencyPhone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ContactPhoneOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Relationship (Full width) */}
        <div className="sm:col-span-2">
          <TextField
            fullWidth
            select
            label="Relationship*"
            name="emergencyRelation"
            value={formData.emergencyRelation}
            onChange={onChange}
            error={Boolean(formErrors.emergencyRelation)}
            helperText={formErrors.emergencyRelation}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GroupOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="" disabled className="text-gray-400">
              Select Relationship
            </MenuItem>
            <MenuItem value="Spouse">Spouse</MenuItem>
            <MenuItem value="Parent">Parent</MenuItem>
            <MenuItem value="Sibling">Sibling</MenuItem>
            <MenuItem value="Child">Child</MenuItem>
            <MenuItem value="Relative">Relative</MenuItem>
            <MenuItem value="Friend">Friend</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </div>
      </div>
    </>
  );
}
