import React, { useEffect, useState } from'react';
import { useParams, Link, useNavigate } from'react-router-dom';
import { Button, Grid, Chip, Divider } from'@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from'@mui/icons-material';
import PageHeader from'../../../components/common/PageHeader';
import { getStoredStaff, deleteStaffMember } from'./staffStore';

export default function StaffProfile() {
 const { id } = useParams();
 const navigate = useNavigate();
 const [staff, setStaff] = useState(null);

 useEffect(() => {
 const staffList = getStoredStaff();
 const staffMember = staffList.find(s => String(s.id) === String(id) || String(s.empId) === String(id));
 setStaff(staffMember);
 }, [id]);

 const handleDelete = () => {
 deleteStaffMember(id);
 navigate('/hr/staff');
 };

 if (!staff) return <div className="p-4 text-gray-500">Staff member not found.</div>;

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
 {staff.name.charAt(0)}
 </div>
 <div className="text-center md:text-left">
 <h2 className="text-xl font-bold text-gray-800">{staff.name}</h2>
 <p className="text-gray-500 font-medium mb-1">{staff.designation} - {staff.department}</p>
 <div className="flex gap-2 justify-center md:justify-start">
 <Chip label={staff.status} size="small" color={staff.status ==='Active' ?'success' :'default'} />
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
