import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <Box className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
      <CircularProgress size={32} className="mb-2 text-[#1b7f43]" />
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}
