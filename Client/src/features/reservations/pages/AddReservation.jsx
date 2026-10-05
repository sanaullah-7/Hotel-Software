import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack, Save, UploadFile, CalendarMonth, AccessTime,
  Person, Hotel, CreditCard, NoteAlt, CameraAlt
} from '@mui/icons-material';
import {
  TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { getReservations } from '../state/reservationStore';
import { addGuest, findGuestByExactIdentity, getGuestById, getGuests } from '../../guests/state/guestStore';
import { addAuditLog } from '../../audit/state/auditStore';
import { validateBookingRequest, getAvailableRooms, saveBookingsWithRoomState } from '../state/reservationLifecycle';
import { normalizeRoomType, getAvailableRoomTypes, toStandardRoomType } from '../../rooms/state/roomStore';

export default function AddReservation() {
  const navigate = useNavigate();
  const availableRoomTypes = getAvailableRoomTypes();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    mobile: '',
    city: '',
    idNumber: '',
    nationality: '',
    
    checkInDate: '2026-09-11',
    checkOutDate: '2026-09-16',
    roomType: '',
    room: '',
    totalPerson: '',
    numberOfRooms: '1',
    package: 'Standard (Room Only)',
    purposeOfStay: '',

    paymentMethod: '',
    discountCode: '',
    bookingReference: 'BK362096OZ10IX',
    emergencyContactName: '',
    emergencyContactPhone: '',

    address: '',
    specialRequests: '',
    note: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const fileInputRef = useRef(null);
  const [guestProfileImage, setGuestProfileImage] = useState(null);
  const profileImageInputRef = useRef(null);
  const [cnicBase64, setCnicBase64] = useState(null);

  const compressImage = (file, maxWidth = 200, quality = 0.6) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(1, maxWidth / (img.width || 1));
          canvas.width = (img.width || 1) * scale;
          canvas.height = (img.height || 1) * scale;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(reader.result);
          }
        };
        img.onerror = () => resolve(reader.result);
        img.src = reader.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleProfileImageChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const compressed = await compressImage(file, 150, 0.5);
      setGuestProfileImage(compressed);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const compressed = await compressImage(file, 400, 0.6);
      setCnicBase64(compressed);
    }
  };

  const registeredGuests = getGuests();

  const availableRooms = getAvailableRooms(formData.checkInDate, formData.checkOutDate)
    .map(room => ({
      id: String(room.id),
      sourceId: room.id,
      number: room.roomNo,
      type: room.roomType,
      capacity: room.capacity || room.bedCapacity || 2
    }));

  const filteredAvailableRooms = formData.roomType
    ? availableRooms.filter(r => normalizeRoomType(r.type) === normalizeRoomType(formData.roomType))
    : availableRooms;

  const handleGuestSelect = (e) => {
    const selectedId = e.target.value;
    const guest = registeredGuests.find(g => String(g.id) === String(selectedId));
    if (guest) {
      setSelectedGuestId(guest.id);
      setFormData(prev => ({
        ...prev,
        firstName: String(guest.name || '').split(' ')[0] || '',
        lastName: String(guest.name || '').split(' ').slice(1).join(' '),
        email: guest.email || '',
        gender: guest.gender || '',
        mobile: guest.phone || guest.mobile || '',
        city: guest.city || '',
        idNumber: guest.idNumber || '',
        nationality: guest.nationality || ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'roomType' && prev.room) {
        const stillValid = availableRooms.some(
          r => String(r.id) === String(prev.room) && normalizeRoomType(r.type) === normalizeRoomType(value)
        );
        if (!stillValid) next.room = '';
      }
      return next;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    let selectedRoom;
    try {
      selectedRoom = validateBookingRequest({ roomId: formData.room, checkIn: formData.checkInDate, checkOut: formData.checkOutDate });
    } catch (error) {
      window.alert(error.message);
      return;
    }
    const reservations = getReservations();
    const nextId = reservations.length
      ? Math.max(...reservations.map((reservation) => Number(reservation.id) || 0)) + 1
      : 1;
    const guestName = `${formData.firstName} ${formData.lastName}`.trim();
    const selectedGuest = getGuestById(selectedGuestId);
    const guest = selectedGuest || findGuestByExactIdentity(guestName, formData.email) || addGuest({
      name: guestName, email: formData.email, phone: formData.mobile, city: formData.city,
      gender: formData.gender, idNumber: formData.idNumber, nationality: formData.nationality,
    });

    try { addAuditLog({ module: 'Reservation', action: 'Created Reservation', recordId: nextId, description: `Reservation ${nextId} created.`, importance: 'Important' }); } catch(e) {}
    saveBookingsWithRoomState([{
      id: nextId,
      guestId: guest.id,
      roomId: selectedRoom?.id,
      name: guestName || 'New Guest',
      avatar: guestProfileImage || 'https://i.pravatar.cc/150?img=1',
      package: formData.package || formData.purposeOfStay || 'Standard',
      room: selectedRoom?.roomNo || '—',
      roomType: toStandardRoomType(formData.roomType || selectedRoom?.roomType || 'Standard Room'),
      status: 'Booked',
      checkIn: formData.checkInDate,
      checkOut: formData.checkOutDate,
      createdAt: new Date().toISOString().split('T')[0],
      bookingDate: new Date().toISOString().split('T')[0],
      payment: formData.paymentMethod ? 'Pending' : 'Unpaid',
      email: formData.email,
      mobile: formData.mobile,
    }, ...reservations], selectedRoom ? [selectedRoom.id] : []);

    // Save CNIC Document if uploaded
    if (cnicBase64) {
      const INITIAL_DOCS = [
        {"id":"DOC-1","formNo":"REG-2026-089","guest":"Kamran Akmal","idType":"CNIC","idNumber":"42101-1122334-1","room":"101","date":"2026-05-10","status":"Signed & Verified"},
        {"id":"DOC-2","formNo":"REG-2026-088","guest":"Cara Stevens","idType":"Passport","idNumber":"USA-9988221","room":"102","date":"2026-05-01","status":"Signed & Verified"},
        {"id":"DOC-3","formNo":"REG-2026-087","guest":"Airi Satou","idType":"Passport","idNumber":"JPN-4455112","room":"105","date":"2026-05-02","status":"Pending Signature"},
        {"id":"DOC-4","formNo":"REG-2026-086","guest":"Mahira Khan","idType":"CNIC","idNumber":"42201-6655443-2","room":"201","date":"2026-05-09","status":"Signed & Verified"},
        {"id":"DOC-5","formNo":"REG-2026-085","guest":"Jens Brincker","idType":"Passport","idNumber":"GER-8833119","room":"302","date":"2026-05-03","status":"Signed & Verified"},
        {"id":"DOC-6","formNo":"REG-2026-001","guest":"John Smith","idType":"Passport","idNumber":"USA-4491028","room":"101","date":"2026-05-20","status":"Signed & Verified"},
        {"id":"DOC-7","formNo":"REG-2026-002","guest":"Sarah Johnson","idType":"Passport","idNumber":"UK-8891002","room":"205","date":"2026-05-19","status":"Signed & Verified"}
      ];
      let storedDocs = [];
      try {
        const rawDocs = localStorage.getItem('hotel_registration_forms');
        storedDocs = rawDocs ? JSON.parse(rawDocs) : INITIAL_DOCS;
      } catch {
        storedDocs = INITIAL_DOCS;
      }
      const newDoc = {
        id: 'DOC-' + Date.now(),
        formNo: 'REG-' + Date.now(),
        guest: guestName || 'New Guest',
        idType: 'CNIC',
        idNumber: formData.idNumber || 'N/A',
        room: selectedRoom?.roomNo || 'N/A',
        date: new Date().toISOString().split('T')[0],
        status: 'Signed & Verified',
        cnicImage: cnicBase64
      };
      try { localStorage.setItem('hotel_registration_forms', JSON.stringify([newDoc, ...storedDocs])); } catch(err) { console.warn("CNIC storage error", err); }
    }

    navigate('/reservation/all');
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      fontSize: '12.5px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
      '&:hover fieldset': { borderColor: '#9ca3af' },
      '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '12.5px',
      color: '#6b7280',
      '&.Mui-focused': { color: '#1b7f43' }
    }
  };

  return (
    <div className="w-full space-y-2.5 pb-3">
      {/* FORM CARD */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-3 sm:p-5 bg-white">
          <form onSubmit={handleSave} className="space-y-4">
            {/* SECTION 1: GUEST INFORMATION */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Person sx={{ fontSize: 18, color: '#1b7f43' }} />
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Guest Information</h3>
                </div>

                {/* Auto-fill Dropdown */}
                <FormControl size="small" sx={{ ...muiInputSx, minWidth: 200 }}>
                  <InputLabel>Select / Insert Guest</InputLabel>
                  <Select 
                    label="Select / Insert Guest" 
                    onChange={handleGuestSelect}
                    value={selectedGuestId}
                  >
                    <MenuItem value="" disabled><em>Select existing guest...</em></MenuItem>
                    {registeredGuests.map(guest => (
                      <MenuItem key={guest.id} value={guest.id}>
                        {guest.name} ({guest.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Guest Profile Picture & Inputs Layout */}
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Professional Profile Upload Area */}
                <div className="flex flex-col items-center justify-center self-center md:self-start bg-gray-50/70 border border-gray-100 rounded-lg p-2.5 min-w-[110px]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="profile-upload"
                    ref={profileImageInputRef} 
                    onChange={handleProfileImageChange} 
                  />
                  <div 
                    className="relative group cursor-pointer" 
                    onClick={() => profileImageInputRef.current?.click()}
                    title="Click to upload profile photo"
                  >
                    <div className="w-14 h-14 rounded-full border-2 border-gray-200 group-hover:border-[#1b7f43] transition-colors overflow-hidden bg-white shadow-2xs flex items-center justify-center">
                      {guestProfileImage ? (
                        <img src={guestProfileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Person sx={{ fontSize: 32, color: '#9ca3af' }} />
                      )}
                    </div>
                    {/* Mini Camera Badge */}
                    <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#1b7f43] text-white flex items-center justify-center shadow-xs border border-white group-hover:bg-[#156334] group-hover:scale-110 transition-all">
                      <CameraAlt sx={{ fontSize: 10 }} />
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-700 mt-1.5">Guest Photo</span>
                  <button 
                    type="button" 
                    onClick={() => profileImageInputRef.current?.click()} 
                    className="text-[10px] text-[#1b7f43] font-medium hover:underline mt-0.5 cursor-pointer"
                  >
                    {guestProfileImage ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 w-full">
                  <TextField required label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                  <TextField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                  <TextField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                  
                  <FormControl size="small" fullWidth sx={muiInputSx}>
                    <InputLabel>Gender</InputLabel>
                    <Select name="gender" value={formData.gender} label="Gender" onChange={handleChange}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField label="Mobile" name="mobile" value={formData.mobile} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                  <TextField label="City" name="city" value={formData.city} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                  <TextField label="ID/Passport Number" name="idNumber" value={formData.idNumber} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                  <TextField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 2: STAY DETAILS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Hotel sx={{ fontSize: 18, color: '#1b7f43' }} />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Stay Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex gap-2">
                  <TextField type="date" label="Arrival Date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
                  <TextField type="date" label="Departure Date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
                </div>
                
                {/* Cascading Room Type Dropdown */}
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="add-res-room-type-label">Select Room Type</InputLabel>
                  <Select
                    labelId="add-res-room-type-label"
                    id="add-res-room-type"
                    name="roomType"
                    value={formData.roomType}
                    label="Select Room Type"
                    onChange={handleChange}
                  >
                    <MenuItem value=""><em>All Room Types (Show All)</em></MenuItem>
                    {availableRoomTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Cascading Room Number Dropdown + Pills */}
                <div>
                  <FormControl size="small" fullWidth sx={muiInputSx}>
                    <InputLabel id="add-res-room-no-label">Select Room Number</InputLabel>
                    <Select
                      labelId="add-res-room-no-label"
                      id="add-res-room-no"
                      name="room"
                      value={formData.room}
                      label="Select Room Number"
                      onChange={handleChange}
                    >
                      <MenuItem value=""><em>Select Room Number</em></MenuItem>
                      {filteredAvailableRooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          Room {room.number} ({room.capacity})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {filteredAvailableRooms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5" aria-label="Quick Select Rooms">
                      {filteredAvailableRooms.map((room) => {
                        const isSelected = String(formData.room) === String(room.id);
                        return (
                          <button
                            key={room.id}
                            type="button"
                            aria-label={`[${room.number}]`}
                            onClick={() => setFormData((prev) => ({ ...prev, room: room.id }))}
                            className={`px-1.5 py-0.5 text-[10.5px] font-bold rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'bg-[#1b7f43] text-white border-[#1b7f43] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#1b7f43] hover:bg-emerald-50/50'
                            }`}
                          >
                            <span>[{room.number}]</span>
                            <span className="text-[9.5px] font-normal opacity-90">({room.capacity})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <TextField required type="number" label="Total Person" name="totalPerson" value={formData.totalPerson} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <TextField type="number" label="Number of Rooms" name="numberOfRooms" value={formData.numberOfRooms} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />

                {/* Package Dropdown */}
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="add-res-package-label">Select Package</InputLabel>
                  <Select
                    labelId="add-res-package-label"
                    id="add-res-package"
                    name="package"
                    value={formData.package}
                    label="Select Package"
                    onChange={handleChange}
                  >
                    <MenuItem value="Standard (Room Only)">Standard (Room Only)</MenuItem>
                    <MenuItem value="Bed & Breakfast">Bed & Breakfast (Breakfast only)</MenuItem>
                    <MenuItem value="Business">Business (Breakfast + Wi-Fi + Lounge)</MenuItem>
                    <MenuItem value="All inclusive">All inclusive (Breakfast, Lunch, Dinner)</MenuItem>
                    <MenuItem value="Wedding">Wedding / Event</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Purpose of Stay</InputLabel>
                  <Select name="purposeOfStay" value={formData.purposeOfStay} label="Purpose of Stay" onChange={handleChange}>
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Leisure">Leisure</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 3: PAYMENT & BOOKING */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard sx={{ fontSize: 18, color: '#1b7f43' }} />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Payment & Booking</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select name="paymentMethod" value={formData.paymentMethod} label="Payment Method" onChange={handleChange}>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>

                <TextField label="Discount Code" name="discountCode" value={formData.discountCode} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <TextField label="Booking Reference" name="bookingReference" value={formData.bookingReference} onChange={handleChange} sx={muiInputSx} size="small" fullWidth disabled />
                <TextField label="Emergency Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <TextField label="Emergency Contact Phone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* SECTION 4: ADDITIONAL DETAILS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <NoteAlt sx={{ fontSize: 18, color: '#1b7f43' }} />
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Additional Details</h3>
              </div>
              <div className="flex flex-col gap-2.5">
                <TextField label="Address" name="address" value={formData.address} onChange={handleChange} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
                <TextField label="Special Requests (Dietary requirements, accessibility needs, etc.)" name="specialRequests" value={formData.specialRequests} onChange={handleChange} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
                
                {/* File Upload Box */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*,.pdf"
                  className="hidden" 
                  id="cnic-upload"
                />
                <label 
                  htmlFor="cnic-upload"
                  className="w-full border-2 border-dashed border-gray-200 rounded-lg p-3.5 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer bg-[#fafafa]"
                >
                  <UploadFile className="text-gray-400 mb-1" sx={{ fontSize: 24 }} />
                  <p className="text-xs font-semibold text-gray-700">Upload Your CNIC</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {selectedFile ? <span className="text-[#1b7f43] font-medium">{selectedFile.name}</span> : 'No file chosen'}
                  </p>
                </label>

                <TextField label="Note" name="note" value={formData.note} onChange={handleChange} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4.5 py-1.5 text-xs font-semibold text-white bg-[#1b7f43] hover:bg-[#156736] rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save sx={{ fontSize: 16 }} />
                Save Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
