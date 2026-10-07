import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack, Save, UploadFile, CalendarMonth, AccessTime,
  Person, Hotel, CreditCard, NoteAlt, CameraAlt
} from '@mui/icons-material';
import {
  TextField, MenuItem, FormControl, InputLabel, Select, Alert, CircularProgress
} from '@mui/material';
import reservationService from '../../../services/reservationService';
import guestService from '../../../services/guestService';
import { toFrontendReservation, toBackendReservationPayload } from '../adapters/reservationAdapter';
import { getReservations, syncReservationsFromBackend } from '../state/reservationStore';
import { addGuest, findGuestByExactIdentity, getGuestById, getGuests } from '../../guests/state/guestStore';
import { addAuditLog } from '../../audit/state/auditStore';
import { normalizeRoomType, getAvailableRoomTypes, toStandardRoomType, getRoomById, getRoomByRoomNo, getRooms } from '../../rooms/state/roomStore';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [backendAvailability, setBackendAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  const [registeredGuests, setRegisteredGuests] = useState(() => getGuests());

  useEffect(() => {
    let isMounted = true;
    guestService.getGuests().then((res) => {
      if (!isMounted) return;
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.guests) ? res.data.guests : []);
      if (list.length > 0) {
        const mapped = list.map((g) => ({
          id: g._id || g.id,
          _id: g._id || g.id,
          name: `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Guest',
          firstName: g.first_name || '',
          lastName: g.last_name || '',
          email: g.email || '',
          phone: g.phone || '',
          mobile: g.phone || '',
          city: g.city || '',
          idNumber: g.national_id || g.passport_number || '',
          nationality: g.nationality || '',
          gender: g.gender || '',
        }));
        setRegisteredGuests(mapped);
      }
    }).catch(() => {
      // Fallback to local guests
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setBackendAvailability(null);
      return;
    }
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      setBackendAvailability(null);
      return;
    }

    let isMounted = true;
    setAvailabilityLoading(true);
    setAvailabilityError(null);

    reservationService.checkAvailability({
      check_in: checkIn.toISOString(),
      check_out: checkOut.toISOString(),
    })
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.availability)
            ? res.data.availability
            : (Array.isArray(res) ? res : []);
        setBackendAvailability(list);
      })
      .catch((err) => {
        if (!isMounted) return;
        setAvailabilityError(err?.message || 'Failed to check room availability.');
        setBackendAvailability([]);
      })
      .finally(() => {
        if (isMounted) setAvailabilityLoading(false);
      });

    return () => { isMounted = false; };
  }, [formData.checkInDate, formData.checkOutDate]);

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

  const allInventoryRooms = getRooms();

  const isRoomAvailableByBackend = (room) => {
    if (backendAvailability === null) {
      return true;
    }
    if (!backendAvailability || backendAvailability.length === 0) {
      return false;
    }
    const matchedType = backendAvailability.find((item) => {
      const typeIdMatch = room.roomTypeId && String(item.room_type_id) === String(room.roomTypeId);
      const typeNameMatch = room.roomType && String(item.room_type_name).toLowerCase() === String(room.roomType).toLowerCase();
      const typeCodeMatch = room.roomType && item.room_type_code && String(item.room_type_code).toLowerCase() === String(room.roomType).toLowerCase();
      return typeIdMatch || typeNameMatch || typeCodeMatch;
    });
    return Boolean(matchedType && matchedType.is_available && (matchedType.available_rooms > 0));
  };

  const availableRooms = allInventoryRooms
    .filter((room) => {
      const roomStatus = String(room.status || '').toLowerCase();
      if (['inactive', 'maintenance', 'out of order'].includes(roomStatus)) return false;
      return isRoomAvailableByBackend(room);
    })
    .map(room => ({
      id: String(room.id || room._id),
      sourceId: room.id || room._id,
      number: room.roomNo,
      type: room.roomType,
      capacity: room.capacity || room.bedCapacity || 2
    }));

  const filteredAvailableRooms = formData.roomType
    ? availableRooms.filter(r => normalizeRoomType(r.type) === normalizeRoomType(formData.roomType))
    : availableRooms;

  const handleGuestSelect = (e) => {
    const selectedId = e.target.value;
    const guest = registeredGuests.find(g => String(g.id) === String(selectedId) || String(g._id) === String(selectedId));
    if (guest) {
      setSelectedGuestId(guest._id || guest.id);
      setFormData(prev => ({
        ...prev,
        firstName: guest.firstName || String(guest.name || '').split(' ')[0] || '',
        lastName: guest.lastName || String(guest.name || '').split(' ').slice(1).join(' '),
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

  const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val.trim());

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Validate form fields
      if (!formData.firstName?.trim()) {
        throw new Error('First Name is required.');
      }
      if (!formData.checkInDate || !formData.checkOutDate) {
        throw new Error('Check-in and Check-out dates are required.');
      }
      if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
        throw new Error('Check-out date must be strictly after check-in date.');
      }

      // 2. Resolve room & roomType
      let targetRoomId = null;
      let targetRoomTypeId = null;
      let selectedRoom = null;

      if (formData.room) {
        selectedRoom = getRoomById(formData.room) || getRoomByRoomNo(formData.room);
        if (selectedRoom) {
          targetRoomId = isObjectId(selectedRoom._id) ? selectedRoom._id : (isObjectId(selectedRoom.id) ? String(selectedRoom.id) : null);
          targetRoomTypeId = selectedRoom.roomTypeId || selectedRoom.room_type_id || null;
        } else if (isObjectId(formData.room)) {
          targetRoomId = formData.room;
        }
      }

      // 3. Resolve or Create guest reference
      let primaryGuestId = null;
      if (isObjectId(selectedGuestId)) {
        primaryGuestId = selectedGuestId.trim();
      } else {
        const guestName = `${formData.firstName} ${formData.lastName}`.trim().toLowerCase();
        const guestEmail = (formData.email || '').trim().toLowerCase();

        // 3a. Check registered guests loaded from backend
        const matchInRegistered = registeredGuests.find(g => {
          const gName = (g.name || `${g.first_name || ''} ${g.last_name || ''}`).trim().toLowerCase();
          const gEmail = (g.email || '').trim().toLowerCase();
          return (guestEmail && gEmail === guestEmail) || (guestName && gName === guestName);
        });

        if (matchInRegistered && isObjectId(matchInRegistered._id || matchInRegistered.id)) {
          primaryGuestId = String(matchInRegistered._id || matchInRegistered.id).trim();
        } else {
          const existingLocal = getGuestById(selectedGuestId) || findGuestByExactIdentity(`${formData.firstName} ${formData.lastName}`.trim(), formData.email);
          if (existingLocal && isObjectId(existingLocal._id || existingLocal.id)) {
            primaryGuestId = String(existingLocal._id || existingLocal.id).trim();
          } else {
            try {
              const guestPayload = {
                first_name: formData.firstName.trim(),
                last_name: formData.lastName?.trim() || 'Guest',
                email: formData.email?.trim() || null,
                phone: formData.mobile?.trim() || null,
                city: formData.city?.trim() || null,
                nationality: formData.nationality?.trim() || null,
                national_id: formData.idNumber?.trim() || null,
              };
              const guestRes = await guestService.createGuest(guestPayload);
              const createdGuest = guestRes?.data;
              if (createdGuest && isObjectId(createdGuest._id)) {
                primaryGuestId = createdGuest._id;
                addGuest({ ...createdGuest, id: createdGuest._id, name: `${createdGuest.first_name} ${createdGuest.last_name}` });
              }
            } catch (guestErr) {
              if (guestErr.status === 409 || guestErr.message?.includes('already exists')) {
                const searchRes = await guestService.getGuests({ search: formData.email || formData.firstName });
                const list = Array.isArray(searchRes?.data) ? searchRes.data : (Array.isArray(searchRes?.data?.guests) ? searchRes.data.guests : []);
                const found = list[0];
                if (found && isObjectId(found._id)) {
                  primaryGuestId = found._id;
                }
              }
              if (!primaryGuestId) {
                throw new Error(guestErr.message || 'Failed to establish valid guest reference.');
              }
            }
          }
        }
      }

      if (!primaryGuestId || !isObjectId(primaryGuestId)) {
        throw new Error('A valid guest reference is required to create a reservation.');
      }

      // 4. Build backend payload via adapter
      const formToAdapt = {
        ...formData,
        primary_guest_id: primaryGuestId,
        room_id: targetRoomId,
        room_type_id: targetRoomTypeId,
        adults: Number(formData.totalPerson || 1),
        children: 0,
        special_requests: formData.specialRequests || formData.note || '',
      };

      const backendPayload = toBackendReservationPayload(formToAdapt, { isCreate: true });

      // 5. Call backend reservation API
      const res = await reservationService.createReservation(backendPayload);
      const createdReservation = res?.data?.reservation || res?.data || res;

      // 6. Adapt response & sync compatibility store
      if (createdReservation) {
        const adapted = toFrontendReservation(createdReservation);
        const currentStored = getReservations();
        syncReservationsFromBackend([createdReservation, ...currentStored]);
        try {
          addAuditLog({
            module: 'Reservation',
            action: 'Created Reservation',
            recordId: adapted.bookingId || adapted.id,
            description: `Reservation ${adapted.bookingId || adapted.id} created for ${adapted.name}.`,
            importance: 'Important'
          });
        } catch {}
      }

      // 7. Save CNIC Document if uploaded
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
          guest: `${formData.firstName} ${formData.lastName}`.trim() || 'New Guest',
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
    } catch (err) {
      setError(err.message || 'Failed to create reservation.');
    } finally {
      setIsSubmitting(false);
    }
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
          {error && (
            <Alert severity="error" className="mb-3 text-xs" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
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
                disabled={isSubmitting}
                className="px-4.5 py-1.5 text-xs font-semibold text-white bg-[#1b7f43] hover:bg-[#156736] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save sx={{ fontSize: 16 }} />
                    Save Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
