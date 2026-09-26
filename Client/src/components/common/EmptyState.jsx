import React from 'react';
import { Box, Typography } from '@mui/material';

export default function EmptyState({ message = 'No data available', icon: Icon }) {
  return (
    <Box className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
      {Icon && <Icon className="w-12 h-12 mb-2 text-gray-400" />}
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}
