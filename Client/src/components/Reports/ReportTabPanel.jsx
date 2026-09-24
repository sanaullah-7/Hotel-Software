import React from 'react';
import { Box } from '@mui/material';

export default function ReportTabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 0 }}>{children}</Box>}
    </div>
  );
}
