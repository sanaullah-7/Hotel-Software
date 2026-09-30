import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function Dropdown({
  label,
  options = [],
  value,
  onChange,
  className = '',
  fullWidth = true,
  formControlSx,
  optionSx,
  ...props
}) {
  return (
    <FormControl size="small" fullWidth={fullWidth} className={className} sx={formControlSx}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select value={value} label={label} onChange={onChange} {...props}>
        {options.map((opt) => (
          <MenuItem key={opt.value || opt} value={opt.value || opt} sx={optionSx}>
            {opt.label || opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
