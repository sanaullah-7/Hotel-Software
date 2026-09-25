import React from 'react';
import { TextField } from '@mui/material';

export default function Input({ className = '', ...props }) {
  return (
    <TextField
      size="small"
      fullWidth
      className={className}
      {...props}
    />
  );
}
