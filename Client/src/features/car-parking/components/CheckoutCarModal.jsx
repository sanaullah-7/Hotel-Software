import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { checkoutCar } from '../state/carParkingStore';

export default function CheckoutCarModal({ open, onClose, record }) {
  if (!record) return null;

  const handleCheckout = () => {
    const exitDate = new Date().toISOString().split('T')[0];
    const exitTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    checkoutCar(record.id, exitDate, exitTime);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1b7f43', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Check Out Car
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: '24px !important', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '14px' }}>Guest Name:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{record.guestName}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '14px' }}>Car Number:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{record.carNumber}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '14px' }}>Room Number:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{record.roomNumber || 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '14px' }}>Parking Space:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{record.parkingSpace}</Typography>
          </Box>
          
          <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '14px' }}>Entry Time:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{record.entryTime} ({record.entryDate})</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '14px' }}>Exit Time:</Typography>
            <Typography sx={{ fontWeight: 700, color: '#1b7f43', fontSize: '14px' }}>Current Time</Typography>
          </Box>

          <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '14px' }}>Parking Charge:</Typography>
            <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>Rs. {record.chargeAmount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '14px' }}>Payment Status:</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '14px', color: record.paymentStatus === 'Paid' ? '#166534' : '#ef4444' }}>
              {record.paymentStatus}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#1e293b', bgcolor: '#f1f5f9', px: 3, '&:hover': { bgcolor: '#e2e8f0' }, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleCheckout} variant="contained" sx={{ bgcolor: '#ef4444', px: 3, '&:hover': { bgcolor: '#dc2626' }, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}>
          Check Out Car
        </Button>
      </DialogActions>
    </Dialog>
  );
}
