import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TagIcon from '@mui/icons-material/Tag';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WcIcon from '@mui/icons-material/Wc';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PublicIcon from '@mui/icons-material/Public';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TranslateIcon from '@mui/icons-material/Translate';
import WorkHistoryOutlinedIcon from '@mui/icons-material/WorkHistoryOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import { addStaffMember } from './staffStore';

// Material Icons matching Luxuria Design

// Section Header with pastel icon badge - Compact padding
const SectionHeader = ({ icon: Icon, title, badgeBg = '#eef2ff', iconColor = '#5d5fef' }) => (
  <div className="flex items-center gap-2.5 mb-3.5 mt-6 first:mt-1">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-105"
      style={{ backgroundColor: badgeBg, color: iconColor }}
    >
      <Icon sx={{ fontSize: 18 }} />
    </div>
    <h3 className="text-[16px] font-bold text-gray-800 tracking-tight">{title}</h3>
  </div>
);

// Consistent styled input SX for standard height and modern Luxuria aesthetics
const inputStyle = {
  '& .MuiOutlinedInput-root': {
    height: '48px',
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    fontSize: '14.5px',
    color: '#1e293b',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: '#e2e8f0',
      borderWidth: '1.2px',
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5d5fef',
      borderWidth: '1.5px',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(93, 95, 239, 0.12)',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    color: '#64748b',
    '&.Mui-focused': {
      color: '#5d5fef',
      fontWeight: 500,
    },
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.85)',
    backgroundColor: '#ffffff',
    padding: '0 4px',
  },
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
  },
};

// Date input specific styling with end calendar icon
const dateInputStyle = {
  ...inputStyle,
  '& input::-webkit-calendar-picker-indicator': {
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    height: '100%',
    cursor: 'pointer',
  },
};

// Multiline textarea style - Compact
const multilineStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '7px',
    backgroundColor: '#ffffff',
    fontSize: '14.5px',
    color: '#1e293b',
    padding: '10px 12px',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: '#e2e8f0',
      borderWidth: '1.2px',
    },
    '&:hover fieldset': {
      borderColor: '#cbd5e1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5d5fef',
      borderWidth: '1.5px',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 3px rgba(93, 95, 239, 0.12)',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    color: '#64748b',
    '&.Mui-focused': {
      color: '#5d5fef',
      fontWeight: 500,
    },
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.85)',
    backgroundColor: '#ffffff',
    padding: '0 4px',
  },
};

// Generate random employee ID
const generateEmployeeId = () => {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const chars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `EMP${digits}${chars}`;
};

export default function AddStaff() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Focus states for date inputs
  const [dobFocused, setDobFocused] = useState(false);
  const [joiningFocused, setJoiningFocused] = useState(false);

  // Form State matching all Luxuria fields
  const [formData, setFormData] = useState({
    // Section 1: Personal Information
    fullName: '',
    empId: generateEmployeeId(),
    gender: '',
    dob: '',
    nationality: '',
    maritalStatus: '',
    languages: '',

    // Section 2: Employment & Role
    designation: '',
    department: '',
    joiningDate: new Date().toISOString().split('T')[0],
    empType: '',
    shift: '',
    salary: '',
    employmentStatus: 'Active',
    reportsTo: '',

    // Section 3: Contact Information
    mobile: '',
    altPhone: '',
    email: '',
    address: '',

    // Section 4: Professional Qualifications
    experience: '',
    education: '',
    skills: '',

    // Section 5: Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',

    // Section 6: Additional Details
    notes: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle standard input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Regenerate Employee ID
  const handleRegenerateId = () => {
    setFormData(prev => ({ ...prev, empId: generateEmployeeId() }));
  };

  // File Upload Handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const newFiles = files.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Form Validation & Submit
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName || !formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }
    if (formData.email && formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please provide at least a Full Name for the staff member',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    // Persist new staff member to localStorage
    const savedStaff = addStaffMember(formData);

    setTimeout(() => {
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: `Staff member "${savedStaff.name}" (${savedStaff.empId}) successfully registered!`,
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/hr/staff');
      }, 700);
    }, 400);
  };

  return (
    <div className="w-full bg-[#f8fafc] px-0.5 sm:px-1 py-2">
      
      {/* Main White Card Container - Minimized Left & Right Padding */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.03)] px-2.5 sm:px-4 py-3.5 sm:py-4">
        
        {/* Card Header Banner with Icon */}
        {/* <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-[#5d5fef]/10 text-[#5d5fef] flex items-center justify-center shrink-0">
            <BadgeOutlinedIcon sx={{ fontSize: 24 }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Add Staff</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Create employee profile, assign roles, and capture contact information
            </p>
          </div>
        </div> */}

        {/* Form Content */}
        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="mt-2">

          {/* ========================================================= */}
          {/* SECTION 1: PERSONAL INFORMATION */}
          {/* ========================================================= */}
          <SectionHeader
            icon={PersonOutlinedIcon}
            title="Personal Information"
            badgeBg="#eef2ff"
            iconColor="#5d5fef"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Full Name */}
            <div>
              <TextField
                fullWidth
                label="Full Name*"
                name="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleInputChange}
                error={Boolean(formErrors.fullName)}
                helperText={formErrors.fullName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Employee ID */}
            <div>
              <TextField
                fullWidth
                label="Employee ID*"
                name="empId"
                value={formData.empId}
                onChange={handleInputChange}
                error={Boolean(formErrors.empId)}
                helperText={formErrors.empId}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TagIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Generate New ID">
                        <IconButton size="small" onClick={handleRegenerateId} edge="end">
                          <AutorenewIcon sx={{ color: '#5d5fef', fontSize: 19 }} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Gender */}
            <div>
              <TextField
                fullWidth
                select
                label="Gender*"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                error={Boolean(formErrors.gender)}
                helperText={formErrors.gender}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WcIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="" disabled className="text-gray-400">Select Gender</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </div>

            {/* Date of Birth - Clean text on left, Calendar Icon on right */}
            <div>
              <TextField
                fullWidth
                label="Date of Birth*"
                name="dob"
                type={dobFocused || formData.dob ? 'date' : 'text'}
                onFocus={() => setDobFocused(true)}
                onBlur={() => setDobFocused(false)}
                placeholder="Date of Birth*"
                value={formData.dob}
                onChange={handleInputChange}
                error={Boolean(formErrors.dob)}
                helperText={formErrors.dob}
                InputLabelProps={{
                  shrink: Boolean(dobFocused || formData.dob),
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        tabIndex={-1}
                        onClick={(e) => {
                          const input = e.currentTarget.closest('.MuiOutlinedInput-root')?.querySelector('input');
                          if (input) {
                            input.focus();
                            if (input.showPicker) input.showPicker();
                          }
                        }}
                      >
                        <CalendarTodayIcon sx={{ color: '#1e293b', fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={dateInputStyle}
              />
            </div>

            {/* Nationality */}
            <div>
              <TextField
                fullWidth
                label="Nationality*"
                name="nationality"
                placeholder="e.g., American, Pakistani, British"
                value={formData.nationality}
                onChange={handleInputChange}
                error={Boolean(formErrors.nationality)}
                helperText={formErrors.nationality}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Marital Status */}
            <div>
              <TextField
                fullWidth
                select
                label="Marital Status*"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleInputChange}
                error={Boolean(formErrors.maritalStatus)}
                helperText={formErrors.maritalStatus}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FavoriteBorderIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="" disabled className="text-gray-400">Select Status</MenuItem>
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widowed">Widowed</MenuItem>
              </TextField>
            </div>

            {/* Languages Spoken (Full width) */}
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Languages Spoken"
                name="languages"
                placeholder="e.g., English, Spanish, French, Urdu"
                value={formData.languages}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TranslateIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: EMPLOYMENT & ROLE */}
          {/* ========================================================= */}
          <SectionHeader
            icon={WorkHistoryOutlinedIcon}
            title="Employment & Role"
            badgeBg="#eff6ff"
            iconColor="#3b82f6"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Designation */}
            <div>
              <TextField
                fullWidth
                select
                label="Designation*"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                error={Boolean(formErrors.designation)}
                helperText={formErrors.designation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkHistoryOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="" disabled className="text-gray-400">Select Designation</MenuItem>
                <MenuItem value="Hotel Manager">Hotel Manager</MenuItem>
                <MenuItem value="Assistant Manager">Assistant Manager</MenuItem>
                <MenuItem value="Front Desk Officer">Front Desk Officer</MenuItem>
                <MenuItem value="Receptionist">Receptionist</MenuItem>
                <MenuItem value="Head Chef">Head Chef</MenuItem>
                <MenuItem value="Sous Chef">Sous Chef</MenuItem>
                <MenuItem value="Housekeeping Supervisor">Housekeeping Supervisor</MenuItem>
                <MenuItem value="Room Attendant">Room Attendant</MenuItem>
                <MenuItem value="Concierge">Concierge</MenuItem>
                <MenuItem value="Security Guard">Security Guard</MenuItem>
                <MenuItem value="Maintenance Technician">Maintenance Technician</MenuItem>
                <MenuItem value="Bartender">Bartender</MenuItem>
                <MenuItem value="Waiter/Waitress">Waiter/Waitress</MenuItem>
              </TextField>
            </div>

            {/* Department */}
            <div>
              <TextField
                fullWidth
                select
                label="Department*"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                error={Boolean(formErrors.department)}
                helperText={formErrors.department}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="" disabled className="text-gray-400">Select Department</MenuItem>
                <MenuItem value="Management">Management</MenuItem>
                <MenuItem value="Front Office">Front Office</MenuItem>
                <MenuItem value="Housekeeping">Housekeeping</MenuItem>
                <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
                <MenuItem value="Kitchen">Kitchen</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Accounts & Finance">Accounts & Finance</MenuItem>
                <MenuItem value="Human Resources">Human Resources</MenuItem>
                <MenuItem value="Spa & Wellness">Spa & Wellness</MenuItem>
              </TextField>
            </div>

            {/* Joining Date - Clean text on left, Calendar Icon on right */}
            <div>
              <TextField
                fullWidth
                label="Joining Date*"
                name="joiningDate"
                type={joiningFocused || formData.joiningDate ? 'date' : 'text'}
                onFocus={() => setJoiningFocused(true)}
                onBlur={() => setJoiningFocused(false)}
                placeholder="Joining Date*"
                value={formData.joiningDate}
                onChange={handleInputChange}
                error={Boolean(formErrors.joiningDate)}
                helperText={formErrors.joiningDate}
                InputLabelProps={{
                  shrink: Boolean(joiningFocused || formData.joiningDate),
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        tabIndex={-1}
                        onClick={(e) => {
                          const input = e.currentTarget.closest('.MuiOutlinedInput-root')?.querySelector('input');
                          if (input) {
                            input.focus();
                            if (input.showPicker) input.showPicker();
                          }
                        }}
                      >
                        <CalendarTodayIcon sx={{ color: '#1e293b', fontSize: 20 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={dateInputStyle}
              />
            </div>

            {/* Employee Type */}
            <div>
              <TextField
                fullWidth
                select
                label="Employee Type*"
                name="empType"
                value={formData.empType}
                onChange={handleInputChange}
                error={Boolean(formErrors.empType)}
                helperText={formErrors.empType}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="" disabled className="text-gray-400">Select Employee Type</MenuItem>
                <MenuItem value="Full-Time">Full-Time</MenuItem>
                <MenuItem value="Part-Time">Part-Time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Seasonal">Seasonal</MenuItem>
                <MenuItem value="Intern">Intern</MenuItem>
              </TextField>
            </div>

            {/* Shift */}
            <div>
              <TextField
                fullWidth
                select
                label="Shift*"
                name="shift"
                value={formData.shift}
                onChange={handleInputChange}
                error={Boolean(formErrors.shift)}
                helperText={formErrors.shift}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="" disabled className="text-gray-400">Select Shift</MenuItem>
                <MenuItem value="Morning Shift">Morning Shift (06:00 - 14:00)</MenuItem>
                <MenuItem value="Evening Shift">Evening Shift (14:00 - 22:00)</MenuItem>
                <MenuItem value="Night Shift">Night Shift (22:00 - 06:00)</MenuItem>
                <MenuItem value="Rotational">Rotational</MenuItem>
              </TextField>
            </div>

            {/* Salary / Rate ($) */}
            <div>
              <TextField
                fullWidth
                label="Salary / Rate ($)*"
                name="salary"
                type="number"
                placeholder="e.g. 4500"
                value={formData.salary}
                onChange={handleInputChange}
                error={Boolean(formErrors.salary)}
                helperText={formErrors.salary}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Employment Status */}
            <div>
              <TextField
                fullWidth
                select
                label="Employment Status*"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleInputChange}
                error={Boolean(formErrors.employmentStatus)}
                helperText={formErrors.employmentStatus}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VerifiedOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
                <MenuItem value="Terminated">Terminated</MenuItem>
              </TextField>
            </div>

            {/* Reports To (Manager) */}
            <div>
              <TextField
                fullWidth
                label="Reports To (Manager)"
                name="reportsTo"
                placeholder="e.g. John Doe (General Manager)"
                value={formData.reportsTo}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SupervisorAccountOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: CONTACT INFORMATION */}
          {/* ========================================================= */}
          <SectionHeader
            icon={PhoneOutlinedIcon}
            title="Contact Information"
            badgeBg="#ecfdf5"
            iconColor="#10b981"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Mobile Phone */}
            <div>
              <TextField
                fullWidth
                label="Mobile Phone*"
                name="mobile"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.mobile}
                onChange={handleInputChange}
                error={Boolean(formErrors.mobile)}
                helperText={formErrors.mobile}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Alternative Phone */}
            <div>
              <TextField
                fullWidth
                label="Alternative Phone"
                name="altPhone"
                type="tel"
                placeholder="+1 (555) 111-2222"
                value={formData.altPhone}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SmartphoneOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Email Address (Full width) */}
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                label="Email Address*"
                name="email"
                type="email"
                placeholder="employee@hotelmanagement.com"
                value={formData.email}
                onChange={handleInputChange}
                error={Boolean(formErrors.email)}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Address (Full width multiline) */}
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Address*"
                name="address"
                placeholder="Street address, Apartment, City, State, ZIP code"
                value={formData.address}
                onChange={handleInputChange}
                error={Boolean(formErrors.address)}
                helperText={formErrors.address}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <HomeOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={multilineStyle}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 4: PROFESSIONAL QUALIFICATIONS */}
          {/* ========================================================= */}
          <SectionHeader
            icon={SchoolOutlinedIcon}
            title="Professional Qualifications"
            badgeBg="#fffbeb"
            iconColor="#f59e0b"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Experience (Years) */}
            <div>
              <TextField
                fullWidth
                label="Experience (Years)*"
                name="experience"
                type="number"
                placeholder="e.g. 3"
                value={formData.experience}
                onChange={handleInputChange}
                error={Boolean(formErrors.experience)}
                helperText={formErrors.experience}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TrendingUpIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Education / Qualification */}
            <div>
              <TextField
                fullWidth
                select
                label="Education / Qualification*"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                error={Boolean(formErrors.education)}
                helperText={formErrors.education}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="" disabled className="text-gray-400">Select Education</MenuItem>
                <MenuItem value="High School">High School / Secondary</MenuItem>
                <MenuItem value="Diploma / Associate Degree">Diploma / Associate Degree</MenuItem>
                <MenuItem value="Bachelor's Degree">Bachelor's Degree</MenuItem>
                <MenuItem value="Master's Degree">Master's Degree</MenuItem>
                <MenuItem value="Doctorate / PhD">Doctorate / PhD</MenuItem>
                <MenuItem value="Vocational / Certification">Vocational / Certification</MenuItem>
              </TextField>
            </div>

            {/* Skills & Certifications (Full width) */}
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Skills & Certifications"
                name="skills"
                placeholder="List certifications, specialized software skills, culinary licenses, customer service awards, etc."
                value={formData.skills}
                onChange={handleInputChange}
                sx={multilineStyle}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 5: EMERGENCY CONTACT */}
          {/* ========================================================= */}
          <SectionHeader
            icon={ContactPhoneOutlinedIcon}
            title="Emergency Contact"
            badgeBg="#fef2f2"
            iconColor="#ef4444"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Emergency Contact Name */}
            <div>
              <TextField
                fullWidth
                label="Emergency Contact Name*"
                name="emergencyName"
                placeholder="Contact person's full name"
                value={formData.emergencyName}
                onChange={handleInputChange}
                error={Boolean(formErrors.emergencyName)}
                helperText={formErrors.emergencyName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <TextField
                fullWidth
                label="Emergency Contact Phone*"
                name="emergencyPhone"
                type="tel"
                placeholder="+1 (555) 999-8888"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                error={Boolean(formErrors.emergencyPhone)}
                helperText={formErrors.emergencyPhone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ContactPhoneOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              />
            </div>

            {/* Relationship (Full width) */}
            <div className="sm:col-span-2">
              <TextField
                fullWidth
                select
                label="Relationship*"
                name="emergencyRelation"
                value={formData.emergencyRelation}
                onChange={handleInputChange}
                error={Boolean(formErrors.emergencyRelation)}
                helperText={formErrors.emergencyRelation}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupOutlinedIcon sx={{ color: '#64748b', fontSize: 21 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyle}
              >
                <MenuItem value="" disabled className="text-gray-400">Select Relationship</MenuItem>
                <MenuItem value="Spouse">Spouse</MenuItem>
                <MenuItem value="Parent">Parent</MenuItem>
                <MenuItem value="Sibling">Sibling</MenuItem>
                <MenuItem value="Child">Child</MenuItem>
                <MenuItem value="Relative">Relative</MenuItem>
                <MenuItem value="Friend">Friend</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 6: ADDITIONAL DETAILS */}
          {/* ========================================================= */}
          <SectionHeader
            icon={DescriptionOutlinedIcon}
            title="Additional Details"
            badgeBg="#faf5ff"
            iconColor="#a855f7"
          />

          <div className="space-y-4">
            {/* Profile Photo & Identification Documents (Dropzone) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Profile Photo & Identification Documents
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Drag and drop box - Compact */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-[#5d5fef] bg-[#5d5fef]/5 scale-[1.005]'
                    : 'border-gray-300/80 bg-gray-50/60 hover:bg-gray-50 hover:border-[#5d5fef]/60'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-1.5 rounded-full border border-gray-300/90 text-[#5d5fef] font-medium text-xs sm:text-sm bg-white hover:bg-[#5d5fef]/5 hover:border-[#5d5fef] shadow-sm transition-all"
                >
                  Choose file
                </button>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs sm:text-sm">
                  <CloudUploadIcon sx={{ fontSize: 19, color: '#94a3b8' }} />
                  <span>or drag and drop file here</span>
                </div>
              </div>

              {/* Uploaded Files Preview List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {uploadedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        {item.preview ? (
                          <img
                            src={item.preview}
                            alt={item.name}
                            className="w-9 h-9 object-cover rounded-md border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <InsertDriveFileOutlinedIcon sx={{ fontSize: 20 }} />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-400">{item.size}</p>
                        </div>
                      </div>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(item.id)}
                        sx={{ color: '#ef4444', '&:hover': { backgroundColor: '#fee2e2' } }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                placeholder="Additional notes or onboarding remarks..."
                value={formData.notes}
                onChange={handleInputChange}
                sx={multilineStyle}
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* FORM FOOTER ACTION BUTTONS */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#5d5fef] hover:bg-[#4d4fd9] text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer disabled:opacity-60"
            >
              <PersonAddOutlinedIcon sx={{ fontSize: 18 }} />
              <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate('/hr/staff')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg border border-gray-300 transition-all duration-200 cursor-pointer"
            >
              <CloseIcon sx={{ fontSize: 18, color: '#4b5563' }} />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feedback Toast Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '10px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
