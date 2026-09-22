import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, Paper, Grid } from '@mui/material';
import { Person, Business, Email, Save } from '@mui/icons-material';

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: 'admin@hotel.com',
    hotelName: ''
  });

  useEffect(() => {
    setProfile({
      fullName: localStorage.getItem('fullName') || 'Admin',
      email: localStorage.getItem('email') || 'admin@hotel.com',
      hotelName: localStorage.getItem('hotelName') || 'Hotel Admin'
    });
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('fullName', profile.fullName);
    localStorage.setItem('email', profile.email);
    localStorage.setItem('hotelName', profile.hotelName);
    alert('Profile updated successfully! Refresh the page to see changes in the sidebar.');
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
            <Button
              variant="contained"
              size="large"
              startIcon={<Save />}
              onClick={handleSave}
              sx={{ bgcolor: 'var(--primary-main)', '&:hover': { bgcolor: 'var(--primary-dark)' }, px: 4 }}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
