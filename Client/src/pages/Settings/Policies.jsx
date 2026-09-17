import React, { useState } from 'react';
import { Button, Grid, TextField, Switch, FormControlLabel, Divider } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import PageHeader from '../../components/common/PageHeader';
import CustomTextField from '../../components/forms/FormFields';

export default function Policies() {
  const [policies, setPolicies] = useState({
    checkInTime: '14:00',
    checkOutTime: '11:00',
    lateCheckOutFee: '50',
    cancellationDays: '2',
    cancellationFeePct: '100',
    allowPets: false,
    petFee: '0',
    smokingAllowed: false,
    smokingPenalty: '250',
    freeWifi: true,
    breakfastIncluded: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPolicies(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setPolicies(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    console.log('Policies Saved:', policies);
  };

  return (
    <div className="p-6">
      <PageHeader title="Hotel Policies" breadcrumb="Hotel Settings / Policies" />

      <div className="bg-white rounded-xl shadow-sm p-8 mt-6 max-w-5xl">
        <form noValidate autoComplete="off">
          
          <h3 className="text-lg font-bold text-gray-800 mb-4">Check-In / Check-Out Policies</h3>
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={4}>
              <CustomTextField label="Standard Check-In Time" name="checkInTime" type="time" value={policies.checkInTime} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField label="Standard Check-Out Time" name="checkOutTime" type="time" value={policies.checkOutTime} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField label="Late Check-Out Fee ($)" name="lateCheckOutFee" type="number" value={policies.lateCheckOutFee} onChange={handleInputChange} />
            </Grid>
          </Grid>

          <Divider className="my-6" />

          <h3 className="text-lg font-bold text-gray-800 mb-4">Cancellation Policies</h3>
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Free Cancellation Days (Before Check-in)" name="cancellationDays" type="number" value={policies.cancellationDays} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Cancellation Penalty (%)" name="cancellationFeePct" type="number" value={policies.cancellationFeePct} onChange={handleInputChange} helperText="Percentage of first night or total booking" />
            </Grid>
          </Grid>

          <Divider className="my-6" />

          <h3 className="text-lg font-bold text-gray-800 mb-4">House Rules & Amenities</h3>
          <Grid container spacing={3} className="mb-8">
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel 
                control={<Switch checked={policies.allowPets} onChange={handleToggleChange} name="allowPets" color="primary" />} 
                label="Pets Allowed" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <CustomTextField label="Pet Fee ($/night)" name="petFee" type="number" value={policies.petFee} onChange={handleInputChange} disabled={!policies.allowPets} />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel 
                control={<Switch checked={policies.smokingAllowed} onChange={handleToggleChange} name="smokingAllowed" color="primary" />} 
                label="Smoking Allowed" 
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <CustomTextField label="Smoking Penalty ($)" name="smokingPenalty" type="number" value={policies.smokingPenalty} onChange={handleInputChange} disabled={policies.smokingAllowed} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel 
                control={<Switch checked={policies.freeWifi} onChange={handleToggleChange} name="freeWifi" color="primary" />} 
                label="Free Wi-Fi Included" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel 
                control={<Switch checked={policies.breakfastIncluded} onChange={handleToggleChange} name="breakfastIncluded" color="primary" />} 
                label="Complimentary Breakfast" 
              />
            </Grid>
          </Grid>

          <div className="flex gap-4 border-t pt-6">
            <Button 
              variant="contained" 
              onClick={handleSave} 
              startIcon={<SaveIcon />}
              sx={{ backgroundColor: '#1b7f43', '&:hover': { backgroundColor: '#146635' }, paddingX: 4 }}
            >
              Save Policies
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
