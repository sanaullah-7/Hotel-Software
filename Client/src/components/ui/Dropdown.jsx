import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

export default function Dropdown({ label, options = [], value, onChange, className = '', ...props }) {
  return (
    <FormControl size="small" fullWidth className={className}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select value={value} label={label} onChange={onChange} {...props}>
        {options.map((opt) => (
          <MenuItem key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
