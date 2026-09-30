import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack, Save, UploadFile, CalendarMonth, AccessTime,
  Person, Hotel, CreditCard, NoteAlt
} from '@mui/icons-material';
import {
  TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { getReservations, saveReservations } from '../state/reservationStore';
import { addGuest, findGuestByExactIdentity, getGuestById, getGuests } from '../../guests/state/guestStore';
import { addAuditLog } from '../../audit/state/auditStore';
import { validateBookingRequest, getAvailableRooms, saveBookingsWithRoomState } from '../state/reservationLifecycle';
import { normalizeRoomType } from '../../rooms/state/roomStore';

export default function AddReservation() {
  const navigate = useNavigate();

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
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const registeredGuests = getGuests();

  const availableRooms = getAvailableRooms(formData.checkInDate, formData.checkOutDate)
    .map(room => ({ id: String(room.id), sourceId: room.id, number: room.roomNo, type: room.roomType }));

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
        email: guest.email,
        gender: guest.gender || '',
        mobile: guest.phone || guest.mobile || '',
        city: guest.city,
        idNumber: guest.idNumber,
        nationality: guest.nationality
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      avatar: 'https://i.pravatar.cc/150?img=1',
      package: formData.purposeOfStay || 'Standard',
      room: selectedRoom?.roomNo || '—',
      roomType: selectedRoom?.roomType || formData.roomType || 'Not assigned',
      status: 'Booked',
      checkIn: formData.checkInDate,
      checkOut: formData.checkOutDate,
      payment: formData.paymentMethod ? 'Pending' : 'Unpaid',
      email: formData.email,
      mobile: formData.mobile,
    }, ...reservations], selectedRoom ? [selectedRoom.id] : []);
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
    <div className="animate-fade-in max-w-[1600px] mx-auto pt-1">
      {/* FORM CARD */}
      <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 overflow-hidden mt-1">
        <div className="p-2 md:p-8 bg-white">
          <form onSubmit={handleSave} className="space-y-6">
            {/* SECTION 1: GUEST INFORMATION */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Person sx={{ fontSize: 22, color: '#1b7f43' }} />
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Guest Information</h3>
                </div>
                
                {/* Auto-fill Dropdown */}
                <FormControl size="small" sx={{ ...muiInputSx, minWidth: 220 }}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <hr className="border-gray-100" />

            {/* SECTION 2: STAY DETAILS */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Hotel sx={{ fontSize: 22, color: '#1b7f43' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Stay Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData.roomType || ''}
                    label="Select Room Type"
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        roomType: newType,
                        room: prev.room && availableRooms.some((r) => String(r.id) === String(prev.room) && normalizeRoomType(r.type) === normalizeRoomType(newType))
                          ? prev.room
                          : ''
                      }));
                    }}
                  >
                    <MenuItem value=""><em>All Room Types</em></MenuItem>
                    <MenuItem value="Deluxe">Deluxe</MenuItem>
                    <MenuItem value="Delux">Delux</MenuItem>
                    <MenuItem value="Super Delux">Super Delux</MenuItem>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Double">Double</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
                    <MenuItem value="Vila">Vila</MenuItem>
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
                          Room {room.number} ({room.type})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {filteredAvailableRooms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2" aria-label="Quick Select Rooms">
                      {filteredAvailableRooms.map((room) => {
                        const isSelected = String(formData.room) === String(room.id);
                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, room: room.id }))}
                            className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#1b7f43] text-white border-[#1b7f43] shadow-sm'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-[#1b7f43] hover:bg-emerald-50/50'
                            }`}
                          >
                            [{room.number}]
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <TextField required type="number" label="Total Person" name="totalPerson" value={formData.totalPerson} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                <TextField type="number" label="Number of Rooms" name="numberOfRooms" value={formData.numberOfRooms} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                
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
              <div className="flex items-center gap-2 mb-4">
                <CreditCard sx={{ fontSize: 22, color: '#1b7f43' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Payment & Booking</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex items-center gap-2 mb-4">
                <NoteAlt sx={{ fontSize: 22, color: '#1b7f43' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Additional Details</h3>
              </div>
              <div className="space-y-4">
                <TextField label="Address" name="address" value={formData.address} onChange={handleChange} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
                <TextField label="Special Requests (Dietary requirements, accessibility needs, etc.)" name="specialRequests" value={formData.specialRequests} onChange={handleChange} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
                
                {/* File Upload Box */}
                <div 
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer bg-[#fafafa]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <UploadFile className="text-gray-400 mb-2" sx={{ fontSize: 32 }} />
                  <p className="text-sm font-semibold text-gray-700">Upload or drag and drop file here</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedFile ? <span className="text-[#1b7f43] font-medium">{selectedFile.name}</span> : 'No file chosen'}
                  </p>
                </div>

                <TextField label="Note" name="note" value={formData.note} onChange={handleChange} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#1b7f43] hover:bg-[#156736] rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Save sx={{ fontSize: 18 }} />
                Save Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
