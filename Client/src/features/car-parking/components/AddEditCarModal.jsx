import React, { useState, useEffect, useRef } from 'react';
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
import { Close as CloseIcon, DirectionsCar as CarIcon, PhotoCamera as CameraIcon } from '@mui/icons-material';
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
    carImage: '',
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
    carImage: '',
        });
      }
    }
  }, [open, editRecord]);

  
  const compressImage = (file, maxWidth = 400, quality = 0.6) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const compressed = await compressImage(file, 400, 0.6);
      setFormData(prev => ({ ...prev, carImage: compressed }));
    }
  };

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
    <Typography variant="body2" sx={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', mb: 0.5, mt: 0.5 }}>
      {text} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </Typography>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px', overflow: 'hidden' } }}>
      <DialogTitle sx={{ m: 0, px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1b7f43', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
          {editRecord ? 'Edit Parking Record' : 'Add Parking'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }, p: 0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2.5, bgcolor: 'white' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '12px', color: '#1e293b', mb: 1, mt: 0.5, borderBottom: '1px solid #f1f5f9', pb: 0.5 }}>
          Guest Information
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            {renderLabel('Guest Name', true)}
            <TextField fullWidth placeholder="Guest Name" name="guestName" value={formData.guestName} onChange={handleChange} size="small" inputProps={{ style: { fontSize: '12px', padding: '6px 10px' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Room Number')}
            <TextField fullWidth placeholder="Room Number" name="roomNumber" value={formData.roomNumber} onChange={handleChange} size="small" inputProps={{ style: { fontSize: '12px', padding: '6px 10px' } }} />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '12px', color: '#1e293b', mb: 1, mt: 2, borderBottom: '1px solid #f1f5f9', pb: 0.5 }}>
          Car Details
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            {renderLabel('Car Number (License Plate)', true)}
            <TextField fullWidth placeholder="Car Number" name="carNumber" value={formData.carNumber} onChange={handleChange} size="small" inputProps={{ style: { fontSize: '12px', padding: '6px 10px' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Car Type')}
            <FormControl fullWidth size="small">
              <Select name="carType" value={formData.carType} onChange={handleChange} sx={{ fontSize: '12px', '& .MuiSelect-select': { py: '6px' } }}>
                <MenuItem value="Sedan" sx={{ fontSize: '12px' }}>Sedan</MenuItem>
                <MenuItem value="SUV" sx={{ fontSize: '12px' }}>SUV</MenuItem>
                <MenuItem value="Hatchback" sx={{ fontSize: '12px' }}>Hatchback</MenuItem>
                <MenuItem value="Van" sx={{ fontSize: '12px' }}>Van</MenuItem>
                <MenuItem value="Bike" sx={{ fontSize: '12px' }}>Bike</MenuItem>
                <MenuItem value="Other" sx={{ fontSize: '12px' }}>Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {renderLabel('Assign Parking Space', true)}
            <FormControl fullWidth size="small">
              <Select name="parkingSpace" value={formData.parkingSpace} displayEmpty onChange={handleChange} sx={{ fontSize: '12px', '& .MuiSelect-select': { py: '6px' } }}>
                <MenuItem value="" disabled sx={{ fontSize: '12px' }}>Select Space</MenuItem>
                {availableSpaces.map(space => (
                  <MenuItem key={space.id} value={space.number} sx={{ fontSize: '12px' }}>
                    {space.number}
                  </MenuItem>
                ))}
                {availableSpaces.length === 0 && (
                  <MenuItem disabled value="" sx={{ fontSize: '12px' }}>No spaces available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Entry Date')}
            <TextField fullWidth name="entryDate" type="date" value={formData.entryDate} onChange={handleChange} size="small" inputProps={{ style: { fontSize: '12px', padding: '6px 10px' } }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Entry Time')}
            <TextField fullWidth name="entryTime" type="time" value={formData.entryTime} onChange={handleChange} size="small" inputProps={{ style: { fontSize: '12px', padding: '6px 10px' } }} />
          </Grid>
          <Grid item xs={12}>
            {renderLabel('Car Image')}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="car-image-upload"
              onChange={handleImageUpload} 
              style={{ display: 'none' }}
            />
            <label 
              htmlFor="car-image-upload"
              style={{
                width: '100%',
                border: '1.5px dashed #e2e8f0',
                borderRadius: '6px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#fafafa',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            >
              {formData.carImage ? (
                <img src={formData.carImage} alt="Car" style={{ maxHeight: '110px', objectFit: 'contain', borderRadius: '4px' }} />
              ) : (
                <>
                  <CameraIcon sx={{ color: '#94a3b8', fontSize: 24, mb: 0.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '11.5px', color: '#475569' }}>Upload Car Image</Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '10px' }}>Click to browse</Typography>
                </>
              )}
            </label>
          </Grid>

        </Grid>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '12px', color: '#1e293b', mb: 1, mt: 2, borderBottom: '1px solid #f1f5f9', pb: 0.5 }}>
          Charge Details
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            {renderLabel('Charge Type')}
            <FormControl fullWidth size="small">
              <Select name="chargeType" value={formData.chargeType} onChange={handleChange} sx={{ fontSize: '12px', '& .MuiSelect-select': { py: '6px' } }}>
                <MenuItem value="Free" sx={{ fontSize: '12px' }}>Free / Rs. 0</MenuItem>
                <MenuItem value="Hourly" sx={{ fontSize: '12px' }}>Hourly Charge (Rs. 100)</MenuItem>
                <MenuItem value="Daily" sx={{ fontSize: '12px' }}>Daily Charge (Rs. 500)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLabel('Payment Status')}
            <FormControl fullWidth size="small">
              <Select name="paymentStatus" value={formData.paymentStatus} onChange={handleChange} sx={{ fontSize: '12px', '& .MuiSelect-select': { py: '6px' } }}>
                <MenuItem value="Pending" sx={{ fontSize: '12px' }}>Pending</MenuItem>
                <MenuItem value="Paid" sx={{ fontSize: '12px' }}>Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 2.5, py: 1.5, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} sx={{ color: '#1e293b', bgcolor: '#f1f5f9', px: 2.5, py: 0.5, '&:hover': { bgcolor: '#e2e8f0' }, textTransform: 'none', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px' }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#1b7f43', px: 2.5, py: 0.5, '&:hover': { bgcolor: '#166534' }, textTransform: 'none', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px', boxShadow: 'none' }}>
          {editRecord ? 'Update Record' : 'Add Parking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
