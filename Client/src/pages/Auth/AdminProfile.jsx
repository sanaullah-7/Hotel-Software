import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { Person, Business, Email, Save } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import hotelConfigService from '../../services/hotelConfigService';

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    hotelName: localStorage.getItem('hotelName') || 'Hotel Admin'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setProfile({
      fullName: user?.fullName || localStorage.getItem('fullName') || 'Admin',
      email: user?.email || localStorage.getItem('email') || 'admin@hotel.com',
      hotelName: localStorage.getItem('hotelName') || 'Hotel Admin'
    });
  }, [user?.fullName, user?.email]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      if (profile.hotelName && profile.hotelName.trim().length >= 2) {
        await hotelConfigService.updateProfile({
          property_name: profile.hotelName.trim(),
          legal_name: profile.fullName?.trim() || undefined,
        });
      }
      localStorage.setItem('fullName', profile.fullName);
      localStorage.setItem('email', profile.email);
      localStorage.setItem('hotelName', profile.hotelName);
      window.dispatchEvent(new Event('storage'));
      setFeedback({ severity: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      console.error('[AdminProfile] Update failed:', err);
      setFeedback({ severity: 'error', message: err?.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box p={4} maxWidth={800} mx="auto">
      <Typography variant="h4" fontWeight="bold" mb={4} sx={{ color: 'var(--primary-main)' }}>
        Admin Profile
      </Typography>
      
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" gap={3} mb={5}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'var(--primary-main)', fontSize: 32 }}>
            {profile.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">{profile.fullName}</Typography>
            <Typography variant="body1" color="text.secondary">{profile.hotelName}</Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary">FULL NAME</Typography>
            <TextField
              fullWidth
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary">EMAIL ADDRESS</Typography>
            <TextField
              fullWidth
              name="email"
              value={profile.email}
              onChange={handleChange}
              InputProps={{ startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary">HOTEL NAME</Typography>
            <TextField
              fullWidth
              name="hotelName"
              value={profile.hotelName}
              onChange={handleChange}
              InputProps={{ startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>

          <Grid item xs={12} mt={2}>
            {feedback && (
              <Box mb={2}>
                <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
                  {feedback.message}
                </Alert>
              </Box>
            )}
            <Button
              variant="contained"
              size="large"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={handleSave}
              sx={{ bgcolor: 'var(--primary-main)', '&:hover': { bgcolor: 'var(--primary-dark)' }, px: 4 }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
