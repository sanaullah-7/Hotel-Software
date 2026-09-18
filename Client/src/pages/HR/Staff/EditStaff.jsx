import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, MenuItem, Select, InputLabel, FormControl, Grid } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import CustomTextField from '../../../components/forms/FormFields';
import { mockStaff } from '../../../utils/mockData';

export default function EditStaff() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    empId: '',
    department: '',
    designation: '',
    joiningDate: '',
    status: 'Active',
    shift: '',
    shiftTime: '',
    basicSalary: '',
    salaryType: '',
    paymentMethod: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Mock fetch existing staff by ID
    const staffMember = mockStaff.find(s => s.id === parseInt(id));
    if (staffMember) {
      const nameParts = staffMember.name.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: staffMember.phone || '',
        email: staffMember.email || '',
        empId: staffMember.empId || '',
        department: staffMember.department || '',
        designation: staffMember.designation || '',
        joiningDate: staffMember.joiningDate || '',
        status: staffMember.status || 'Active',
        shift: staffMember.shift || '',
        shiftTime: staffMember.shiftTime || '',
      }));
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'shift') {
        if (value === 'Morning') updated.shiftTime = '08:00 AM - 04:00 PM';
        else if (value === 'Evening') updated.shiftTime = '04:00 PM - 12:00 AM';
        else updated.shiftTime = '';
      }
      return updated;
    });
  };

  const handleSave = () => {
    navigate('/hr/staff');
  };

  return (
    <div className="p-px">
      <PageHeader title="Edit Staff" breadcrumb="Human Resources / Staff / Edit Staff" />
      
      <div className="bg-white rounded-xl shadow-sm p-px mt-6 max-w-5xl">
        <form noValidate autoComplete="off">
          
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Personal Information</h3>
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6}>
              <CustomTextField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className="mb-4">
                <InputLabel>Gender</InputLabel>
                <Select name="gender" value={formData.gender} label="Gender" onChange={handleInputChange}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField label="Address" name="address" value={formData.address} onChange={handleInputChange} multiline rows={2} />
            </Grid>
          </Grid>

          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Employment Information</h3>
          <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Employee ID" name="empId" value={formData.empId} onChange={handleInputChange} required disabled />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className="mb-4">
                <InputLabel>Department</InputLabel>
                <Select name="department" value={formData.department} label="Department" onChange={handleInputChange}>
                  <MenuItem value="Management">Management</MenuItem>
                  <MenuItem value="Front Office">Front Office</MenuItem>
                  <MenuItem value="Housekeeping">Housekeeping</MenuItem>
                  <MenuItem value="Kitchen">Kitchen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Joining Date" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleInputChange} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className="mb-4">
                <InputLabel>Shift</InputLabel>
                <Select name="shift" value={formData.shift} label="Shift" onChange={handleInputChange}>
                  <MenuItem value="Morning">Morning</MenuItem>
                  <MenuItem value="Evening">Evening</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField label="Shift Time" name="shiftTime" value={formData.shiftTime} onChange={handleInputChange} placeholder="e.g. 08:00 AM - 04:00 PM" disabled={!formData.shift} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth className="mb-4">
                <InputLabel>Employment Status</InputLabel>
                <Select name="status" value={formData.status} label="Employment Status" onChange={handleInputChange}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <div className="flex gap-4">
            <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: '#1b7f43', '&:hover': { backgroundColor: '#146635' } }}>
              Update Staff
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => navigate('/hr/staff')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
