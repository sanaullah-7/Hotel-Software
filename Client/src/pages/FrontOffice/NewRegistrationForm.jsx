import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Description from '@mui/icons-material/Description';
import CheckCircle from '@mui/icons-material/CheckCircle';
import RestartAlt from '@mui/icons-material/RestartAlt';
import Person from '@mui/icons-material/Person';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { 
  TextField, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl 
} from '@mui/material';

export default function NewRegistrationForm() {
  const navigate = useNavigate();

  // Initial Form State
  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    address: '',
    city: '',
    country: '',
    arrivalDate: '',
    departureDate: '',
    roomType: '',
    numberOfGuests: 1,
    idType: '',
    idNumber: '',
    specialRequests: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResetForm = () => {
    setFormData(initialFormState);
  };

  const handleRegisterGuest = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Please fill in required fields (First Name, Last Name).');
      return;
    }

    const newForm = {
      formNo: `REG-2023-0${Math.floor(100 + Math.random() * 900)}`,
      guest: `${formData.firstName} ${formData.lastName}`,
      idType: formData.idType || 'National ID / Doc',
      idNumber: formData.idNumber || 'Verified on arrival',
      room: formData.roomType ? `${formData.roomType} Suite` : 'Allocating',
      date: formData.arrivalDate || new Date().toISOString().split('T')[0],
      status: 'Signed & Verified'
    };

    // Persist to localStorage for table synchronization
    const initialForms = [
      { formNo: 'REG-2023-089', guest: 'Kamran Akmal', idType: 'CNIC', idNumber: '42101-1122334-1', room: '101', date: '10/08/2023', status: 'Signed & Verified' },
      { formNo: 'REG-2023-088', guest: 'Cara Stevens', idType: 'Passport', idNumber: 'USA-9988221', room: '102', date: '10/01/2023', status: 'Signed & Verified' },
      { formNo: 'REG-2023-087', guest: 'Airi Satou', idType: 'Passport', idNumber: 'JPN-4455112', room: '105', date: '10/02/2023', status: 'Pending Signature' },
      { formNo: 'REG-2023-086', guest: 'Mahira Khan', idType: 'CNIC', idNumber: '42201-6655443-2', room: '201', date: '10/09/2023', status: 'Signed & Verified' },
      { formNo: 'REG-2023-085', guest: 'Jens Brincker', idType: 'Passport', idNumber: 'GER-8833119', room: '302', date: '10/03/2023', status: 'Signed & Verified' },
    ];

    try {
      const existing = localStorage.getItem('hotel_registration_forms');
      const parsedList = existing ? JSON.parse(existing) : initialForms;
      const updatedList = [newForm, ...parsedList];
      localStorage.setItem('hotel_registration_forms', JSON.stringify(updatedList));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }

    alert(`Guest ${newForm.guest} successfully registered!`);
    handleResetForm();
    navigate('/front-office/registration-forms');
  };

  // Material-UI SX styling with native smooth floating label animation
  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      fontSize: '12.5px',
      color: '#1f2937',
      '& fieldset': {
        borderColor: '#e5e7eb',
        borderWidth: '1.2px',
      },
      '&:hover fieldset': {
        borderColor: '#9ca3af',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1b7f43',
        borderWidth: '1.5px',
      },
    },
    '& .MuiInputLabel-root': {
      fontSize: '12.5px',
      color: '#6b7280',
      '&.Mui-focused': {
        color: '#1b7f43',
      },
    },
  };

  return (
    <div className="animate-fade-in pb-10 space-y-4 max-w-[1600px] mx-auto">
      {/* Spacer to replace missing header and maintain consistent gap from breadcrumbs */}
      <div className="h-2"></div>

      {/* REGISTRATION FORM CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 bg-white">
          <form onSubmit={handleRegisterGuest} className="space-y-5">
            {/* SECTION 1: PERSONAL INFORMATION */}
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 text-[#1b7f43]">
                <Person sx={{ fontSize: 18 }} />
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* First Name */}
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                  sx={muiInputSx}
                />

                {/* Last Name */}
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  sx={muiInputSx}
                />

                {/* Email Address */}
                <TextField
                  fullWidth
                  type="email"
                  size="small"
                  label="Email Address"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  sx={muiInputSx}
                />

                {/* Phone Number */}
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  sx={muiInputSx}
                />

                {/* Gender Dropdown */}
                <FormControl fullWidth size="small" sx={muiInputSx}>
                  <InputLabel id="reg-gender-select-label">Gender</InputLabel>
                  <Select
                    labelId="reg-gender-select-label"
                    id="reg-gender-select"
                    value={formData.gender}
                    label="Gender"
                    onChange={e => handleInputChange('gender', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>

                {/* Address (In same row next to Gender) */}
                <TextField
                  fullWidth
                  size="small"
                  label="Address"
                  value={formData.address}
                  onChange={e => handleInputChange('address', e.target.value)}
                  sx={muiInputSx}
                />

                {/* City */}
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  value={formData.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  sx={muiInputSx}
                />

                {/* Country */}
                <TextField
                  fullWidth
                  size="small"
                  label="Country"
                  value={formData.country}
                  onChange={e => handleInputChange('country', e.target.value)}
                  sx={muiInputSx}
                />
              </div>
            </div>

            {/* SECTION 2: STAY INFORMATION */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1.5 text-[#1b7f43]">
                <CalendarToday sx={{ fontSize: 18 }} />
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Stay Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Arrival Date */}
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Arrival Date"
                  value={formData.arrivalDate}
                  onChange={e => handleInputChange('arrivalDate', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={muiInputSx}
                />

                {/* Departure Date */}
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Departure Date"
                  value={formData.departureDate}
                  onChange={e => handleInputChange('departureDate', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={muiInputSx}
                />

                {/* Room Type Dropdown */}
                <FormControl fullWidth size="small" sx={muiInputSx}>
                  <InputLabel id="reg-room-type-select-label">Room Type</InputLabel>
                  <Select
                    labelId="reg-room-type-select-label"
                    id="reg-room-type-select"
                    value={formData.roomType}
                    label="Room Type"
                    onChange={e => handleInputChange('roomType', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="Deluxe">Deluxe Room</MenuItem>
                    <MenuItem value="Executive">Executive Suite</MenuItem>
                    <MenuItem value="Standard King">Standard King</MenuItem>
                    <MenuItem value="Presidential">Presidential Suite</MenuItem>
                    <MenuItem value="Twin Room">Luxury Twin</MenuItem>
                  </Select>
                </FormControl>

                {/* Number of Guests */}
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  label="Number of Guests"
                  value={formData.numberOfGuests}
                  onChange={e => handleInputChange('numberOfGuests', Math.max(1, parseInt(e.target.value) || 1))}
                  sx={muiInputSx}
                  slotProps={{
                    htmlInput: { min: 1, max: 10 }
                  }}
                />

                {/* ID Type Dropdown */}
                <FormControl fullWidth size="small" sx={muiInputSx}>
                  <InputLabel id="reg-id-type-select-label">ID Type</InputLabel>
                  <Select
                    labelId="reg-id-type-select-label"
                    id="reg-id-type-select"
                    value={formData.idType}
                    label="ID Type"
                    onChange={e => handleInputChange('idType', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="CNIC">CNIC / National ID</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                    <MenuItem value="Driving License">Driving License</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                {/* ID Number */}
                <TextField
                  fullWidth
                  size="small"
                  label="ID Number"
                  value={formData.idNumber}
                  onChange={e => handleInputChange('idNumber', e.target.value)}
                  sx={muiInputSx}
                />

                {/* Special Requests */}
                <div className="sm:col-span-2">
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Special Requests"
                    value={formData.specialRequests}
                    onChange={e => handleInputChange('specialRequests', e.target.value)}
                    sx={muiInputSx}
                  />
                </div>
              </div>
            </div>

            {/* FORM FOOTER BUTTONS */}
            <div className="pt-4 border-t border-gray-100 flex flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/front-office/registration-forms')}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer shadow-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-all flex items-center justify-center cursor-pointer shadow-xs"
              >
                <RestartAlt sx={{ fontSize: 15 }} className="mr-1 text-gray-500" />
                Reset Form
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[var(--primary-main)] hover:brightness-110 text-white text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                <CheckCircle sx={{ fontSize: 15 }} className="mr-1.5" />
                Register Guest
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
