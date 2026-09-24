import React from 'react';
import {
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import {
  SectionHeader,
  inputStyle,
  multilineStyle
} from './staffFormStyles';

export default function EducationSection({
  formData,
  formErrors,
  onChange
}) {
  return (
    <>
      <SectionHeader
        icon={SchoolOutlinedIcon}
        title="Professional Qualifications"
        badgeBg="#fffbeb"
        iconColor="#f59e0b"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Experience (Years) */}
        <div>
          <TextField
            fullWidth
            label="Experience (Years)*"
            name="experience"
            type="number"
            placeholder="e.g. 3"
            value={formData.experience}
            onChange={onChange}
            error={Boolean(formErrors.experience)}
            helperText={formErrors.experience}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TrendingUpIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          />
        </div>

        {/* Education / Qualification */}
        <div>
          <TextField
            fullWidth
            select
            label="Education / Qualification*"
            name="education"
            value={formData.education}
            onChange={onChange}
            error={Boolean(formErrors.education)}
            helperText={formErrors.education}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SchoolOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                </InputAdornment>
              ),
            }}
            sx={inputStyle}
          >
            <MenuItem value="" disabled className="text-gray-400">
              Select Education
            </MenuItem>
            <MenuItem value="High School">High School / Secondary</MenuItem>
            <MenuItem value="Diploma / Associate Degree">
              Diploma / Associate Degree
            </MenuItem>
            <MenuItem value="Bachelor's Degree">Bachelor's Degree</MenuItem>
            <MenuItem value="Master's Degree">Master's Degree</MenuItem>
            <MenuItem value="Doctorate / PhD">Doctorate / PhD</MenuItem>
            <MenuItem value="Vocational / Certification">
              Vocational / Certification
            </MenuItem>
          </TextField>
        </div>

        {/* Skills & Certifications (Full width) */}
        <div className="sm:col-span-2">
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Skills & Certifications"
            name="skills"
            placeholder="List certifications, specialized software skills, culinary licenses, customer service awards, etc."
            value={formData.skills}
            onChange={onChange}
            sx={multilineStyle}
          />
        </div>
      </div>
    </>
  );
}
