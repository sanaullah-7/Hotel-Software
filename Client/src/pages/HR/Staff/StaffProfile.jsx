import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Grid, Chip, Divider, CircularProgress } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PageHeader from '../../../components/common/PageHeader';
import staffService from '../../../features/staff/services/staffService';
import staffAdapter from '../../../features/staff/adapters/staffAdapter';

export default function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await staffService.getEmployeeById(id);
        if (isMounted) {
          const empData = res?.data;
          if (empData) {
            setStaff(staffAdapter.toUI(empData));
          } else {
            setStaff(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load employee:', err);
          setError(err?.response?.data?.message || err?.message || 'Employee not found');
          setStaff(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchStaff();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    try {
      await staffService.deleteEmployee(id);
      navigate('/hr/staff');
    } catch (err) {
      console.error('Failed to terminate employee:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center gap-3 text-gray-500">
        <CircularProgress size={20} color="success" />
        <span className="text-sm">Loading staff member details...</span>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-0">
        <PageHeader title="Staff Profile" breadcrumb="Human Resources / Staff / Profile" />
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4 text-center max-w-lg mx-auto border border-gray-100">
          <p className="text-gray-600 mb-4">{error || 'Staff member not found.'}</p>
          <Button variant="outlined" component={Link} to="/hr/staff" sx={{ color: '#1b7f43', borderColor: '#1b7f43' }}>
            Back to Staff Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-2">
        <PageHeader title="Staff Profile" breadcrumb="Human Resources / Staff / Profile" />
        <div className="flex gap-2">
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />} 
            component={Link} 
            to={`/hr/staff/${staff.id}/edit`}
          >
            Edit Staff
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<DeleteIcon />} 
            onClick={handleDelete}
          >
            Delete Staff
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-2 max-w-5xl">
        {/* Profile Header */}
        <div className="bg-gray-50 p-2 sm:p-3 flex flex-col md:flex-row items-center gap-4 border-b">
          <div className="w-20 h-20 rounded-full bg-[#1b7f43] text-white flex items-center justify-center text-3xl font-bold shadow-md">
            {staff.name ? staff.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-800">{staff.name}</h2>
            <p className="text-gray-500 font-medium mb-1">{staff.designation} - {staff.department}</p>
            <div className="flex gap-2 justify-center md:justify-start">
              <Chip label={staff.status} size="small" color={staff.status === 'Active' ? 'success' : 'default'} />
              <Chip label={`ID: ${staff.empId}`} size="small" variant="outlined" />
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="p-2 sm:p-3">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3"><span className="text-gray-500">Phone:</span><span className="col-span-2 font-medium">{staff.phone}</span></div>
                <div className="grid grid-cols-3"><span className="text-gray-500">Email:</span><span className="col-span-2 font-medium">{staff.email}</span></div>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Employment Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3"><span className="text-gray-500">Joining Date:</span><span className="col-span-2 font-medium">{staff.joiningDate}</span></div>
                <div className="grid grid-cols-3"><span className="text-gray-500">Shift:</span><span className="col-span-2 font-medium">{staff.shift} ({staff.shiftTime})</span></div>
              </div>
            </Grid>
          </Grid>

          <Divider className="my-8" />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h3>
              <div className="bg-gray-50 p-px rounded-lg flex justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-500">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">2</div>
                  <div className="text-sm text-gray-500">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <div className="text-sm text-gray-500">Late</div>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Leave Summary</h3>
              <div className="bg-gray-50 p-px rounded-lg flex justify-between">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-500">Total Leaves</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-700">4</div>
                  <div className="text-sm text-gray-500">Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-500">Remaining</div>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}
