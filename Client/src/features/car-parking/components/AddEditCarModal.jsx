import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { getParkingSpaces, addParkingRecord, updateParkingRecord } from '../state/carParkingStore';

export default function AddEditCarModal({ open, onClose, editRecord }) {
  const [formData, setFormData] = useState({
    guestName: '',
    roomNumber: '',
    carNumber: '',
    carType: 'Sedan',
    parkingSpace: '',
    entryDate: new Date().toISOString().split('T')[0],
    entryTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    chargeType: 'Free',
    chargeAmount: 0,
    paymentStatus: 'Pending',
  });
  
  const [spaces, setSpaces] = useState([]);

  useEffect(() => {
    if (open) {
      setSpaces(getParkingSpaces());
      if (editRecord) {
        setFormData(editRecord);
      } else {
        setFormData({
          guestName: '',
          roomNumber: '',
          carNumber: '',
          carType: 'Sedan',
          parkingSpace: '',
          entryDate: new Date().toISOString().split('T')[0],
          entryTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          chargeType: 'Free',
          chargeAmount: 0,
          paymentStatus: 'Pending',
        });
      }
    }
  }, [open, editRecord]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-calculate charge amount based on type
    if (name === 'chargeType') {
      let amount = 0;
      if (value === 'Hourly') amount = 100;
      if (value === 'Daily') amount = 500;
      setFormData({ ...formData, [name]: value, chargeAmount: amount });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = () => {
    if (!formData.guestName || !formData.carNumber || !formData.parkingSpace) {
      alert("Guest Name, Car Number, and Parking Space are required.");
      return;
    }
    
    if (editRecord) {
      updateParkingRecord(editRecord.id, formData);
    } else {
      addParkingRecord(formData);
    }
    
    onClose();
  };

  // Only show available spaces, plus the space currently assigned to the record being edited
  const availableSpaces = spaces.filter(s => s.status === 'Available' || (editRecord && s.number === editRecord.parkingSpace));

  const renderLabel = (text, required = false) => (
    <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 600, color: '#475569', mb: 0.5, mt: 1.5 }}>
      {text} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </Typography>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1b7f43', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          {editRecord ? 'Edit Parking Record' : 'Add Parking'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, bgcolor: 'white' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, mt: 1, borderBottom: '1px solid #f1f5f9', pb: 1 }}>
          Guest Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderLabel('Guest Name', true)}
            <TextField fullWidth placeholder="Guest Name" name="guestName" value={formData.guestName} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Room Number')}
            <TextField fullWidth placeholder="Room Number" name="roomNumber" value={formData.roomNumber} onChange={handleChange} size="small" />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, mt: 3, borderBottom: '1px solid #f1f5f9', pb: 1 }}>
          Car Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderLabel('Car Number (License Plate)', true)}
            <TextField fullWidth placeholder="Car Number" name="carNumber" value={formData.carNumber} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Car Type')}
            <FormControl fullWidth size="small">
              <Select name="carType" value={formData.carType} onChange={handleChange}>
                <MenuItem value="Sedan">Sedan</MenuItem>
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Hatchback">Hatchback</MenuItem>
                <MenuItem value="Van">Van</MenuItem>
                <MenuItem value="Bike">Bike</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {renderLabel('Assign Parking Space', true)}
            <FormControl fullWidth size="small">
              <Select name="parkingSpace" value={formData.parkingSpace} displayEmpty onChange={handleChange}>
                <MenuItem value="" disabled>Select Space</MenuItem>
                {availableSpaces.map(space => (
                  <MenuItem key={space.id} value={space.number}>
                    {space.number}
                  </MenuItem>
                ))}
                {availableSpaces.length === 0 && (
                  <MenuItem disabled value="">No spaces available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Entry Date')}
            <TextField fullWidth name="entryDate" type="date" value={formData.entryDate} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Entry Time')}
            <TextField fullWidth name="entryTime" type="time" value={formData.entryTime} onChange={handleChange} size="small" />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, mt: 3, borderBottom: '1px solid #f1f5f9', pb: 1 }}>
          Charge Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderLabel('Charge Type')}
            <FormControl fullWidth size="small">
              <Select name="chargeType" value={formData.chargeType} onChange={handleChange}>
                <MenuItem value="Free">Free / Rs. 0</MenuItem>
                <MenuItem value="Hourly">Hourly Charge (Rs. 100)</MenuItem>
                <MenuItem value="Daily">Daily Charge (Rs. 500)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Payment Status')}
            <FormControl fullWidth size="small">
              <Select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange}>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#1e293b', bgcolor: '#f1f5f9', px: 3, '&:hover': { bgcolor: '#e2e8f0' }, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#1b7f43', px: 3, '&:hover': { bgcolor: '#166534' }, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}>
          {editRecord ? 'Update Record' : 'Add Parking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
