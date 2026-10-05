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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '8px', overflow: 'hidden' } }}>
      <DialogTitle sx={{ m: 0, px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1b7f43', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
          Check Out Car
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, p: 0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2.5, pt: '16px !important', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '12px' }}>Guest Name:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>{record.guestName}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '12px' }}>Car Number:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>{record.carNumber}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '12px' }}>Room Number:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>{record.roomNumber || 'N/A'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '12px' }}>Parking Space:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>{record.parkingSpace}</Typography>
          </Box>
          
          <Divider sx={{ my: 0.75, borderColor: '#f1f5f9' }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '12px' }}>Entry Time:</Typography>
            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>{record.entryTime} ({record.entryDate})</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '12px' }}>Exit Time:</Typography>
            <Typography sx={{ fontWeight: 700, color: '#1b7f43', fontSize: '12px' }}>Current Time</Typography>
          </Box>

          <Divider sx={{ my: 0.75, borderColor: '#f1f5f9' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '12px' }}>Parking Charge:</Typography>
            <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '12px' }}>Rs. {record.chargeAmount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: '#475569', fontSize: '12px' }}>Payment Status:</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '12px', color: record.paymentStatus === 'Paid' ? '#166534' : '#ef4444' }}>
              {record.paymentStatus}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#1e293b', bgcolor: '#f1f5f9', px: 2.5, py: 0.5, '&:hover': { bgcolor: '#e2e8f0' }, textTransform: 'none', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px' }}>Cancel</Button>
        <Button onClick={handleCheckout} variant="contained" sx={{ bgcolor: '#ef4444', px: 2.5, py: 0.5, '&:hover': { bgcolor: '#dc2626' }, textTransform: 'none', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px', boxShadow: 'none' }}>
          Check Out Car
        </Button>
      </DialogActions>
    </Dialog>
  );
}
