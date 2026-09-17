import React, { useState } from 'react';
import { Button, Grid, TextField, Avatar, IconButton } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Save as SaveIcon } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import CustomTextField from '../../components/forms/FormFields';

export default function HotelProfile() {
  const [formData, setFormData] = useState({
    hotelName: 'Luxuria Grand Hotel',
    email: 'info@luxuriagrand.com',
    phone: '+1 234 567 8900',
    website: 'www.luxuriagrand.com',
    address: '123 Luxury Avenue, Paradise City, PC 12345',
    registrationNumber: 'REG-987654321',
    taxNumber: 'TAX-123456789',
    description: 'A five-star luxury hotel providing the best accommodations and services in the city.'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save logic
    console.log('Saved:', formData);
  };

  return (
    <div className="p-6">
      <PageHeader title="Hotel Profile" breadcrumb="Hotel Settings / Hotel Profile" />

      <div className="bg-white rounded-xl shadow-sm p-8 mt-6 max-w-5xl">
        
        {/* Logo / Cover Section */}
        <div className="flex flex-col items-center mb-8 pb-8 border-b">
          <div className="relative">
            <Avatar 
              src="https://via.placeholder.com/150" 
              sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <IconButton 
              color="primary" 
              aria-label="upload picture" 
              component="label"
              sx={{ position: 'absolute', bottom: 0, right: -10, backgroundColor: 'white', '&:hover': { backgroundColor: '#f3f4f6' } }}
            >
              <input hidden accept="image/*" type="file" />
              <PhotoCameraIcon />
            </IconButton>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">{formData.hotelName}</h2>
          <p className="text-gray-500">Update your hotel's primary information and logo</p>
        </div>

        <form noValidate autoComplete="off">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Basic Information</h3>
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Hotel Name" name="hotelName" value={formData.hotelName} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Tax Number (VAT/GST)" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField label="Description" name="description" value={formData.description} onChange={handleInputChange} multiline rows={3} />
            </Grid>
          </Grid>

          <h3 className="text-lg font-bold text-gray-800 mb-4 border-t pt-6">Contact Information</h3>
          <Grid container spacing={3} className="mb-8">
            <Grid item xs={12} sm={4}>
              <CustomTextField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField label="Website URL" name="website" value={formData.website} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField label="Physical Address" name="address" value={formData.address} onChange={handleInputChange} multiline rows={2} required />
            </Grid>
          </Grid>

          <div className="flex gap-4">
            <Button 
              variant="contained" 
              onClick={handleSave} 
              startIcon={<SaveIcon />}
              sx={{ backgroundColor: '#1b7f43', '&:hover': { backgroundColor: '#146635' }, paddingX: 4 }}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
