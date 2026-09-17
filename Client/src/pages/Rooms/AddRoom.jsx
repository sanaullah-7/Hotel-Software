import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Save from '@mui/icons-material/Save';
import RestartAlt from '@mui/icons-material/RestartAlt';
import Hotel from '@mui/icons-material/Hotel';
import KingBed from '@mui/icons-material/KingBed';
import SettingsSystemDaydream from '@mui/icons-material/SettingsSystemDaydream';
import CleaningServices from '@mui/icons-material/CleaningServices';
import Info from '@mui/icons-material/Info';
import CloudUpload from '@mui/icons-material/CloudUpload';
import { 
  TextField, Select, MenuItem, InputLabel, FormControl, 
  Switch, FormControlLabel 
} from '@mui/material';

export default function AddRoom() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Room Information
    roomNumber: '', roomType: '', acNonAc: '', mealPlan: '', floorNumber: '', rentPerNight: '', roomStatus: '',
    // Bed & Space
    capacity: '', bedType: '', numberOfBeds: '', roomSize: '', viewType: '',
    // Amenities
    tvType: '', bathroomType: '', wifiAvailable: false, balconyAvailable: false, miniBarAvailable: false, petFriendly: false, accessibilityFeatures: 'None',
    // Operations
    housekeepingStatus: '', maintenanceStatus: '', smokingPolicy: '', contactMobile: '',
    // Additional Details
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Room successfully configured and added!');
    navigate('/rooms');
  };

  const handleReset = () => {
    setFormData({
      roomNumber: '', roomType: '', acNonAc: '', mealPlan: '', floorNumber: '', rentPerNight: '', roomStatus: '',
      capacity: '', bedType: '', numberOfBeds: '', roomSize: '', viewType: '',
      tvType: '', bathroomType: '', wifiAvailable: false, balconyAvailable: false, miniBarAvailable: false, petFriendly: false, accessibilityFeatures: 'None',
      housekeepingStatus: '', maintenanceStatus: '', smokingPolicy: '', contactMobile: '', notes: ''
    });
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px', backgroundColor: '#ffffff', fontSize: '13px',
      '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
      '&:hover fieldset': { borderColor: '#9ca3af' },
      '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { fontSize: '13px', color: '#6b7280', '&.Mui-focused': { color: '#1b7f43' } },
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8 animate-fade-in">
      <div className="h-2"></div>
      
      {/* Header section matching other forms */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
        <div className="p-6 md:p-8 bg-white">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* SECTION 1: ROOM INFORMATION */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Hotel sx={{ fontSize: 22, color: '#1b7f43' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Room Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TextField required label="Room Number" name="roomNumber" value={formData.roomNumber} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Room Type</InputLabel>
                  <Select name="roomType" value={formData.roomType} label="Room Type" onChange={handleChange}>
                    <MenuItem value="Standard Single">Standard Single</MenuItem>
                    <MenuItem value="Standard Double">Standard Double</MenuItem>
                    <MenuItem value="Deluxe Double">Deluxe Double</MenuItem>
                    <MenuItem value="Deluxe Suite">Deluxe Suite</MenuItem>
                    <MenuItem value="Presidential Suite">Presidential Suite</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>AC / Non AC</InputLabel>
                  <Select name="acNonAc" value={formData.acNonAc} label="AC / Non AC" onChange={handleChange}>
                    <MenuItem value="AC">AC</MenuItem>
                    <MenuItem value="Non AC">Non AC</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Meal Plan</InputLabel>
                  <Select name="mealPlan" value={formData.mealPlan} label="Meal Plan" onChange={handleChange}>
                    <MenuItem value="EP">EP (Room Only)</MenuItem>
                    <MenuItem value="CP">CP (Breakfast)</MenuItem>
                    <MenuItem value="MAP">MAP (Half Board)</MenuItem>
                    <MenuItem value="AP">AP (Full Board)</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Floor Number" name="floorNumber" value={formData.floorNumber} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <TextField label="Rent per Night ($)" name="rentPerNight" type="number" value={formData.rentPerNight} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <FormControl required size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Room Status</InputLabel>
                  <Select name="roomStatus" value={formData.roomStatus} label="Room Status *" onChange={handleChange}>
                    <MenuItem value="Available">Available</MenuItem>
                    <MenuItem value="Occupied">Occupied</MenuItem>
                    <MenuItem value="Cleaning">Cleaning</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 2: BED & SPACE */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <KingBed sx={{ fontSize: 22, color: '#1b7f43' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Bed & Space Specifications</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TextField label="Capacity (Persons)" name="capacity" type="number" value={formData.capacity} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Bed Type</InputLabel>
                  <Select name="bedType" value={formData.bedType} label="Bed Type" onChange={handleChange}>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Double">Double</MenuItem>
                    <MenuItem value="Queen">Queen</MenuItem>
                    <MenuItem value="King">King</MenuItem>
                    <MenuItem value="Twin">Twin</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Number of Beds" name="numberOfBeds" type="number" value={formData.numberOfBeds} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <TextField label="Room Size (sq ft)" name="roomSize" type="number" value={formData.roomSize} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>View Type</InputLabel>
                  <Select name="viewType" value={formData.viewType} label="View Type" onChange={handleChange}>
                    <MenuItem value="City View">City View</MenuItem>
                    <MenuItem value="Sea View">Sea View</MenuItem>
                    <MenuItem value="Pool View">Pool View</MenuItem>
                    <MenuItem value="Garden View">Garden View</MenuItem>
                    <MenuItem value="No View">No View</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 3: AMENITIES */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SettingsSystemDaydream sx={{ fontSize: 22, color: '#1b7f43' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Amenities & Facilities</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <FormControl required size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>TV Type</InputLabel>
                  <Select name="tvType" value={formData.tvType} label="TV Type *" onChange={handleChange}>
                    <MenuItem value="LED">LED</MenuItem>
                    <MenuItem value="Smart TV">Smart TV</MenuItem>
                    <MenuItem value="None">None</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Bathroom Type</InputLabel>
                  <Select name="bathroomType" value={formData.bathroomType} label="Bathroom Type" onChange={handleChange}>
                    <MenuItem value="Attached - Shower">Attached - Shower</MenuItem>
                    <MenuItem value="Attached - Bathtub">Attached - Bathtub</MenuItem>
                    <MenuItem value="Shared">Shared</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Accessibility Features</InputLabel>
                  <Select name="accessibilityFeatures" value={formData.accessibilityFeatures} label="Accessibility Features" onChange={handleChange}>
                    <MenuItem value="None">None</MenuItem>
                    <MenuItem value="Wheelchair Accessible">Wheelchair Accessible</MenuItem>
                    <MenuItem value="Grab Bars">Grab Bars</MenuItem>
                  </Select>
                </FormControl>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-2">
                <FormControlLabel control={<Switch checked={formData.wifiAvailable} onChange={handleChange} name="wifiAvailable" color="success" />} label={<span className="text-sm text-gray-700">WiFi Available</span>} />
                <FormControlLabel control={<Switch checked={formData.balconyAvailable} onChange={handleChange} name="balconyAvailable" color="success" />} label={<span className="text-sm text-gray-700">Balcony Available</span>} />
                <FormControlLabel control={<Switch checked={formData.miniBarAvailable} onChange={handleChange} name="miniBarAvailable" color="success" />} label={<span className="text-sm text-gray-700">Mini Bar Available</span>} />
                <FormControlLabel control={<Switch checked={formData.petFriendly} onChange={handleChange} name="petFriendly" color="success" />} label={<span className="text-sm text-gray-700">Pet Friendly</span>} />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 4: OPERATIONS & POLICIES */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CleaningServices sx={{ fontSize: 22, color: '#1b7f43' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Operations & Policies</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormControl required size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Housekeeping Status</InputLabel>
                  <Select name="housekeepingStatus" value={formData.housekeepingStatus} label="Housekeeping Status *" onChange={handleChange}>
                    <MenuItem value="Clean">Clean</MenuItem>
                    <MenuItem value="Dirty">Dirty</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Inspected">Inspected</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Maintenance Status</InputLabel>
                  <Select name="maintenanceStatus" value={formData.maintenanceStatus} label="Maintenance Status" onChange={handleChange}>
                    <MenuItem value="None">None</MenuItem>
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="Under Repair">Under Repair</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Smoking Policy</InputLabel>
                  <Select name="smokingPolicy" value={formData.smokingPolicy} label="Smoking Policy" onChange={handleChange}>
                    <MenuItem value="Non-Smoking">Non-Smoking</MenuItem>
                    <MenuItem value="Smoking Allowed">Smoking Allowed</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Contact Mobile" name="contactMobile" value={formData.contactMobile} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 5: ADDITIONAL DETAILS */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Info sx={{ fontSize: 22, color: '#1b7f43' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Additional Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Room Images / Documents</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <CloudUpload sx={{ fontSize: 32, color: '#9ca3af' }} className="mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Click to upload <span className="font-normal text-gray-500">or drag and drop file here</span></p>
                    <p className="text-xs text-gray-400 mt-1">No file chosen</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Notes & Instructions</label>
                  <TextField 
                    name="notes" 
                    multiline 
                    rows={5}
                    value={formData.notes} 
                    onChange={handleChange} 
                    sx={muiInputSx} 
                    placeholder="Special amenities, access instructions, or maintenance history..." 
                    fullWidth 
                  />
                </div>
              </div>
            </div>

          </form>
            <div className="flex items-center space-x-2 *:mt-6 left-0 bottom-0 w-full justify-end">
          <button onClick={handleReset} className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all">
            <RestartAlt sx={{ fontSize: 18 }} />
            <span>Reset</span>
          </button>
          <button onClick={handleSave} className="flex items-center space-x-1.5 bg-[var(--primary-main)] hover:brightness-110 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-all">
            <Save sx={{ fontSize: 18 }} />
            <span>Save Room</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
