import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, PhotoCamera as CameraIcon } from '@mui/icons-material';
import { parkingService } from '../../../services/parkingService';
import { fileService } from '../../../services/fileService';
import { toFrontendSpaces, toBackendRecordPayload } from '../adapters/parkingAdapter';
import { PARKING_UPDATED_EVENT } from '../state/carParkingStore';

export default function AddEditCarModal({ open, onClose, editRecord, onSuccess }) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (open) {
      setErrorMessage(null);
      parkingService.getSpaces()
        .then((backendSpaces) => setSpaces(toFrontendSpaces(backendSpaces)))
        .catch((err) => console.error('Failed to load spaces:', err));

      if (editRecord) {
        setFormData({
          guestName: editRecord.guestName || '',
          roomNumber: editRecord.roomNumber || '',
          carNumber: editRecord.carNumber || '',
          carType: editRecord.carType || 'Sedan',
          parkingSpace: editRecord.parkingSpace || '',
          entryDate: editRecord.entryDate || new Date().toISOString().split('T')[0],
          entryTime: editRecord.entryTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          chargeType: editRecord.chargeType || 'Free',
          chargeAmount: Number(editRecord.chargeAmount || 0),
          paymentStatus: editRecord.paymentStatus || 'Pending',
          carImage: editRecord.carImage || '',
        });
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

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, carImage: previewUrl }));
      setIsUploading(true);
      try {
        const uploadRes = await fileService.uploadFile(file, { folder: 'vehicles', entity_ref: 'VEHICLE' });
        if (uploadRes?.file_url) {
          setFormData((prev) => ({ ...prev, carImage: uploadRes.file_url }));
        }
      } catch (err) {
        console.warn('Vehicle photo upload failed, using local preview:', err);
      } finally {
        setIsUploading(false);
      }
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

  const handleSubmit = async () => {
    if (!formData.guestName || !formData.carNumber || !formData.parkingSpace) {
      setErrorMessage("Guest Name, Car Number, and Parking Space are required.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = toBackendRecordPayload(formData);
      if (editRecord) {
        await parkingService.updateRecord(editRecord.id, payload);
      } else {
        await parkingService.createRecord(payload);
      }

      window.dispatchEvent(new Event(PARKING_UPDATED_EVENT));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving parking record:', err);
      setErrorMessage(err?.message || 'Failed to save parking record. Please verify input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show available spaces, plus the space currently assigned to the record being edited
  const availableSpaces = spaces.filter(
    (s) => s.status === 'Available' || (editRecord && s.number === editRecord.parkingSpace)
  );

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
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 1.5, fontSize: '12px' }}>
            {errorMessage}
          </Alert>
        )}

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
                {availableSpaces.map((space) => (
                  <MenuItem key={space.id} value={space.number} sx={{ fontSize: '12px' }}>
                    {space.number} ({space.status})
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
              {isUploading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                  <CircularProgress size={22} sx={{ color: '#10b981', mb: 1 }} />
                  <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600, fontSize: '11px' }}>
                    Uploading to Cloudinary...
                  </Typography>
                </Box>
              ) : formData.carImage ? (
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
        <Button onClick={onClose} disabled={isSubmitting} sx={{ color: '#1e293b', bgcolor: '#f1f5f9', px: 2.5, py: 0.5, '&:hover': { bgcolor: '#e2e8f0' }, textTransform: 'none', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px' }}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          variant="contained" 
          sx={{ bgcolor: '#1b7f43', px: 2.5, py: 0.5, '&:hover': { bgcolor: '#166534' }, textTransform: 'none', fontWeight: 600, fontSize: '11.5px', borderRadius: '6px', boxShadow: 'none' }}
        >
          {isSubmitting ? <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} /> : null}
          {editRecord ? 'Update Record' : 'Add Parking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
