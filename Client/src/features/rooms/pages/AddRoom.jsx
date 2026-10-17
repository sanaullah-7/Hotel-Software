import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, RestartAlt, Hotel, KingBed, 
  SettingsSystemDaydream, CleaningServices, Info, CloudUpload
} from '@mui/icons-material';
import { 
  TextField, Select, MenuItem, InputLabel, FormControl, 
  Switch, FormControlLabel, Alert, CircularProgress, Snackbar
} from '@mui/material';
import roomService from '../../../services/roomService';
import { toFrontendRoom, toBackendRoomPayload, toFrontendRoomType } from '../adapters/roomAdapter';
import { getRooms as getCachedRooms, syncRoomsFromBackend } from '../state/roomStore';

const initialFormData = {
  roomNumber: '',
  roomTypeId: '',
  roomType: '',
  acNonAc: 'AC',
  mealPlan: 'None',
  floorNumber: '1',
  rentPerNight: '',
  roomStatus: 'Available',
  capacity: '',
  bedType: '',
  numberOfBeds: '',
  roomSize: '',
  viewType: '',
  tvType: '',
  bathroomType: '',
  wifiAvailable: false,
  balconyAvailable: false,
  miniBarAvailable: false,
  petFriendly: false,
  accessibilityFeatures: 'None',
  housekeepingStatus: 'Clean',
  maintenanceStatus: '',
  smokingPolicy: '',
  contactMobile: '',
  notes: ''
};

export default function AddRoom() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function fetchTypes() {
      setLoadingTypes(true);
      try {
        const res = await roomService.getRoomTypes();
        const rawTypes = Array.isArray(res?.data) ? res.data : [];
        const adapted = rawTypes.map(toFrontendRoomType);
        setRoomTypes(adapted);
        if (adapted.length > 0) {
          setFormData(prev => ({
            ...prev,
            roomTypeId: adapted[0]._id || adapted[0].id,
            roomType: adapted[0].name,
            rentPerNight: adapted[0].rent,
            capacity: adapted[0].capacity,
          }));
        }
      } catch (err) {
        setNotification({
          open: true,
          message: err.message || 'Failed to load Room Types from server',
          severity: 'error'
        });
      } finally {
        setLoadingTypes(false);
      }
    }
    fetchTypes();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'roomTypeId') {
      const found = roomTypes.find(t => (t._id || t.id) === value);
      setFormData(prev => ({
        ...prev,
        roomTypeId: value,
        roomType: found?.name || prev.roomType,
        rentPerNight: found?.rent !== undefined ? found.rent : prev.rentPerNight,
        capacity: found?.capacity !== undefined ? found.capacity : prev.capacity
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.roomNumber.trim()) {
      setNotification({ open: true, message: 'Please enter a Room Number.', severity: 'error' });
      return;
    }
    if (!formData.roomTypeId) {
      setNotification({
        open: true,
        message: 'Please select a Room Type. If none exist, create one in Room Types first.',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = toBackendRoomPayload({
        roomNumber: formData.roomNumber.trim(),
        roomTypeId: formData.roomTypeId,
        floor: formData.floorNumber || '1',
        status: formData.roomStatus === 'Available' ? 'AVAILABLE' : (formData.roomStatus === 'Occupied' ? 'OCCUPIED' : 'MAINTENANCE'),
        housekeepingStatus: formData.housekeepingStatus === 'Clean' ? 'CLEAN' : (formData.housekeepingStatus === 'Dirty' ? 'DIRTY' : 'INSPECTED'),
        contactMobile: formData.contactMobile,
      });

      const res = await roomService.createRoom(payload);
      const created = toFrontendRoom(res.data);
      const cached = getCachedRooms();
      syncRoomsFromBackend([created, ...cached]);

      setNotification({ open: true, message: 'Room successfully created and added!', severity: 'success' });
      setTimeout(() => navigate('/rooms'), 500);
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || (err.status === 409 ? 'A room with this number already exists' : 'Failed to add room'),
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFormData(initialFormData);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px', 
      backgroundColor: '#ffffff', 
      fontSize: '12.5px',
      '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
      '&:hover fieldset': { borderColor: '#9ca3af' },
      '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': { 
      fontSize: '12.5px', 
      color: '#6b7280',
      '&.Mui-focused': { color: '#1b7f43' } 
    },
  };

  return (
    <div className="w-full space-y-2.5 pb-3">
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={() => setNotification(n => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} onClose={() => setNotification(n => ({ ...n, open: false }))}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* FORM CARD */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-3 sm:p-5 bg-white">
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* SECTION 1: ROOM INFORMATION */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                <Hotel sx={{ fontSize: 18, color: '#1b7f43' }} />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Room Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <TextField 
                  id="add-room-number"
                  required
                  label="Room Number*" 
                  name="roomNumber" 
                  value={formData.roomNumber} 
                  onChange={handleChange} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <FormControl size="small" fullWidth sx={muiInputSx} required>
                  <InputLabel id="add-room-type-label">Select Room Type*</InputLabel>
                  <Select
                    labelId="add-room-type-label"
                    id="add-room-type-select"
                    name="roomTypeId"
                    value={formData.roomTypeId}
                    label="Select Room Type*"
                    onChange={handleChange}
                  >
                    {roomTypes.map(rt => (
                      <MenuItem key={rt._id || rt.id} value={rt._id || rt.id}>
                        {rt.name} ({rt.code}) — ${rt.rent}
                      </MenuItem>
                    ))}
                    {roomTypes.length === 0 && !loadingTypes && (
                      <MenuItem disabled value="">
                        No Room Types found. Please configure Room Types first.
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>

                <TextField 
                  id="add-floor-number"
                  label="Floor Number" 
                  name="floorNumber" 
                  value={formData.floorNumber} 
                  onChange={handleChange} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="add-room-status-label">Room Status*</InputLabel>
                  <Select
                    labelId="add-room-status-label"
                    id="add-room-status-select"
                    name="roomStatus"
                    value={formData.roomStatus}
                    label="Room Status*"
                    onChange={handleChange}
                  >
                    <MenuItem value="Available">Available (Open)</MenuItem>
                    <MenuItem value="Occupied">Occupied (Booked)</MenuItem>
                    <MenuItem value="Maintenance">Maintenance (Inactive)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="add-hk-status-label">Housekeeping Status</InputLabel>
                  <Select
                    labelId="add-hk-status-label"
                    id="add-hk-status-select"
                    name="housekeepingStatus"
                    value={formData.housekeepingStatus}
                    label="Housekeeping Status"
                    onChange={handleChange}
                  >
                    <MenuItem value="Clean">Clean</MenuItem>
                    <MenuItem value="Dirty">Dirty</MenuItem>
                    <MenuItem value="Inspected">Inspected</MenuItem>
                  </Select>
                </FormControl>

                <TextField 
                  id="add-rent-per-night"
                  type="number"
                  label="Rent / Night (Base Price)" 
                  name="rentPerNight" 
                  value={formData.rentPerNight} 
                  disabled
                  helperText="Derived from Room Type"
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>
            </div>

            {/* SECTION 2: BEDDING & CAPACITY */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                <KingBed sx={{ fontSize: 18, color: '#1b7f43' }} />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Bedding & Capacity</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <TextField 
                  id="add-capacity"
                  type="number"
                  label="Capacity (Max Guests)" 
                  name="capacity" 
                  value={formData.capacity} 
                  disabled
                  helperText="Derived from Room Type"
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <TextField 
                  id="add-contact-mobile"
                  label="Contact Phone" 
                  name="contactMobile" 
                  value={formData.contactMobile} 
                  onChange={handleChange} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1b7f43] text-white font-semibold text-xs hover:bg-[#156334] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save sx={{ fontSize: 16 }} />
                {isSubmitting ? 'Saving...' : 'Save Room'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer shadow-xs"
              >
                <RestartAlt sx={{ fontSize: 16 }} />
                Reset Form
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
