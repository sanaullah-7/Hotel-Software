import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowBack, Save, UploadFile, CalendarMonth, AccessTime,
  Person, Hotel, CreditCard, NoteAlt, CameraAlt
} from '@mui/icons-material';
import {
  TextField, MenuItem, FormControl, InputLabel, Select, Alert, CircularProgress
} from '@mui/material';
import reservationService from '../../../services/reservationService';
import { fileService } from '../../../services/fileService';
import { registrationFormService } from '../../../services/registrationFormService';
import { toFrontendReservation, toBackendReservationPayload } from '../adapters/reservationAdapter';
import { getReservations, syncReservationsFromBackend } from '../state/reservationStore';
import { addAuditLog } from '../../audit/state/auditStore';
import { getRooms, getRoomById, getRoomByRoomNo, normalizeRoomType, getAvailableRoomTypes, toStandardRoomType } from '../../../features/rooms/state/roomStore';
import { getGuests } from '../../guests/state/guestStore';
import { validateStayDates } from '../state/bookingRules';

export default function EditReservation() {
  const navigate = useNavigate();
  const { id } = useParams();
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

    checkInDate: '',
    checkOutDate: '',
    roomType: '',
    room: '',        // stores canonical room.id (string)
    totalPerson: '',
    numberOfRooms: '1',
    package: 'Standard (Room Only)',
    purposeOfStay: '',

    paymentMethod: '',
    discountCode: '',
    bookingReference: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    address: '',
    specialRequests: '',
    note: '',
  });

  // Track the existing booking's original roomId so we can release it when changed
  const [originalBooking, setOriginalBooking] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef(null);
  const [guestProfileImage, setGuestProfileImage] = useState(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const profileImageInputRef = React.useRef(null);
  const [cnicFileUrl, setCnicFileUrl] = useState(null);
  const [isUploadingCnic, setIsUploadingCnic] = useState(false);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendAvailability, setBackendAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  // Load booking from backend or canonical compatibility store on mount
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadBooking() {
      setIsLoading(true);
      setError(null);
      try {
        let booking = null;
        if (/^[0-9a-fA-F]{24}$/.test(String(id).trim())) {
          try {
            const res = await reservationService.getReservationById(String(id).trim());
            const backendRes = res?.data?.reservation || res?.data || res;
            if (backendRes) {
              booking = toFrontendReservation(backendRes);
            }
          } catch (fetchErr) {
            console.warn('Backend fetch by id failed, checking local compatibility store:', fetchErr);
          }
        }

        if (!booking) {
          const allRes = getReservations();
          booking = allRes.find(b => String(b.id) === String(id) || String(b._id) === String(id) || String(b.bookingId) === String(id));
        }

        if (!booking && isMounted) {
          setError('Reservation not found.');
          return;
        }

        if (isMounted && booking) {
          setOriginalBooking(booking);

          const nameParts = (booking.name || '').split(' ');
          const fName = booking.firstName || nameParts[0] || '';
          const lNames = booking.lastName || nameParts.slice(1).join(' ') || '';

          // Pre-select the room by its canonical id
          const roomId = booking.roomId !== undefined && booking.roomId !== null ? String(booking.roomId) : '';

          setFormData(prev => ({
            ...prev,
            firstName: fName || '',
            lastName: lNames || '',
            email: booking.email || '',
            mobile: booking.mobile || booking.phone || '',
            gender: booking.gender || '',
            city: booking.city || '',
            idNumber: booking.idNumber || booking.passport || '',
            nationality: booking.nationality || '',
            checkInDate: booking.checkIn || '',
            checkOutDate: booking.checkOut || '',
            roomType: booking.roomType || '',
            room: roomId,
            totalPerson: booking.totalPerson || String(booking.adults || 1),
            numberOfRooms: booking.numRooms || '1',
            package: (booking.package === 'Standard' ? 'Standard (Room Only)' : booking.package) || 'Standard (Room Only)',
            purposeOfStay: booking.purposeOfStay || booking.purpose || 'Leisure',
            paymentMethod: booking.payment || 'Credit Card',
            discountCode: booking.discountCode || '',
            bookingReference: booking.bookingRef || booking.bookingId || String(booking.id),
            emergencyContactName: booking.emergencyName || '',
            emergencyContactPhone: booking.emergencyPhone || '',
            address: booking.address || '',
            specialRequests: booking.specialRequests || booking.special_requests || '',
            note: booking.note || '',
          }));

          if (booking.avatar) {
            setGuestProfileImage(booking.avatar);
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load reservation.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBooking();
    return () => { isMounted = false; };
  }, [id]);

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

  // Available rooms computed from backend-authoritative availability check
  const computeAvailableRooms = () => {
    const allRooms = getRooms();
    const currentRoomId = originalBooking?.roomId ? String(originalBooking.roomId) : null;
    const currentRoom = currentRoomId ? allRooms.find((r) => String(r.id) === currentRoomId || String(r._id) === currentRoomId) : null;

    if (!formData.checkInDate || !formData.checkOutDate) {
      return currentRoom ? [{
        id: String(currentRoom.id || currentRoom._id),
        sourceId: currentRoom.id || currentRoom._id,
        number: currentRoom.roomNo,
        type: currentRoom.roomType,
        capacity: currentRoom.capacity || currentRoom.bedCapacity || 2
      }] : [];
    }

    return allRooms
      .filter((room) => {
        const roomId = String(room.id || room._id);
        // The currently assigned room to this reservation remains selectable for this booking
        if (currentRoomId && roomId === currentRoomId) return true;

        const roomStatus = String(room.status || '').toLowerCase();
        if (['inactive', 'maintenance', 'out of order'].includes(roomStatus)) return false;

        if (backendAvailability === null) return true;
        if (!backendAvailability || backendAvailability.length === 0) return false;

        const matchedType = backendAvailability.find((item) => {
          const typeIdMatch = room.roomTypeId && String(item.room_type_id) === String(room.roomTypeId);
          const typeNameMatch = room.roomType && String(item.room_type_name).toLowerCase() === String(room.roomType).toLowerCase();
          const typeCodeMatch = room.roomType && item.room_type_code && String(item.room_type_code).toLowerCase() === String(room.roomType).toLowerCase();
          return typeIdMatch || typeNameMatch || typeCodeMatch;
        });
        return Boolean(matchedType && matchedType.is_available && (matchedType.available_rooms > 0));
      })
      .map((room) => ({
        id: String(room.id || room._id),
        sourceId: room.id || room._id,
        number: room.roomNo,
        type: room.roomType,
        capacity: room.capacity || room.bedCapacity || 2
      }));
  };

  const availableRooms = computeAvailableRooms();

  const filteredAvailableRooms = formData.roomType
    ? availableRooms.filter(r => normalizeRoomType(r.type) === normalizeRoomType(formData.roomType))
    : availableRooms;

  // ─── TASK 2: Guests from canonical guestStore ────────────────────────────────
  const registeredGuests = getGuests();

  const handleGuestSelect = (e) => {
    const selectedId = e.target.value;
    const guest = registeredGuests.find(g => String(g.id) === String(selectedId));
    if (!guest) return;

    // Split stored full name for the form fields
    const nameParts = (guest.name || '').split(' ');
    const fName = nameParts[0] || '';
    const lName = nameParts.slice(1).join(' ');

    setFormData(prev => ({
      ...prev,
      firstName: fName,
      lastName: lName,
      email: guest.email || '',
      mobile: guest.phone || '',
      city: guest.city || '',
    }));
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

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsUploadingCnic(true);
      try {
        const uploadRes = await fileService.uploadFile(file, { folder: 'guest_documents', entity_ref: 'CNIC' });
        if (uploadRes?.file_url) {
          setCnicFileUrl(uploadRes.file_url);
        }
      } catch (err) {
        console.warn('CNIC file upload failed:', err);
      } finally {
        setIsUploadingCnic(false);
      }
    }
  };

  const handleProfileImageChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setGuestProfileImage(previewUrl);
      setIsUploadingProfile(true);
      try {
        const uploadRes = await fileService.uploadFile(file, { folder: 'guests', entity_ref: 'GUEST_PROFILE' });
        if (uploadRes?.file_url) {
          setGuestProfileImage(uploadRes.file_url);
        }
      } catch (err) {
        console.warn('Profile image upload failed, keeping preview:', err);
      } finally {
        setIsUploadingProfile(false);
      }
    }
  };

  // ─── TASK 3: Save via backend update API ──────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.firstName?.trim()) {
        throw new Error('Guest First Name is required.');
      }
      if (!formData.lastName?.trim()) {
        throw new Error('Guest Last Name is required.');
      }
      if (!formData.email?.trim()) {
        throw new Error('Guest Email Address is required.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        throw new Error('Please enter a valid guest email address (e.g. guest@example.com).');
      }
      if (!formData.mobile?.trim()) {
        throw new Error('Guest Mobile / Phone number is required.');
      }
      if (!formData.checkInDate) {
        throw new Error('Arrival Date is required.');
      }
      if (!formData.checkOutDate) {
        throw new Error('Departure Date is required.');
      }
      const checkInObj = new Date(formData.checkInDate);
      const checkOutObj = new Date(formData.checkOutDate);
      if (isNaN(checkInObj.getTime()) || isNaN(checkOutObj.getTime())) {
        throw new Error('Please enter valid Arrival and Departure dates.');
      }
      if (checkOutObj <= checkInObj) {
        throw new Error('Departure Date must be strictly after Arrival Date.');
      }
      if (!formData.roomType?.trim()) {
        throw new Error('Please select a Room Type.');
      }
      if (!formData.totalPerson || Number(formData.totalPerson) < 1) {
        throw new Error('Total Person must be at least 1.');
      }

      // Resolve the newly selected room & roomType from canonical inventory
      let targetRoomId = null;
      let targetRoomTypeId = null;
      let selectedRoom = null;

      if (formData.room) {
        selectedRoom = getRoomById(formData.room) || getRoomByRoomNo(formData.room);
        if (selectedRoom) {
          targetRoomId = /^[0-9a-fA-F]{24}$/.test(String(selectedRoom._id))
            ? selectedRoom._id
            : (/^[0-9a-fA-F]{24}$/.test(String(selectedRoom.id)) ? String(selectedRoom.id) : null);
          targetRoomTypeId = selectedRoom.roomTypeId || selectedRoom.room_type_id || null;
        } else if (/^[0-9a-fA-F]{24}$/.test(formData.room)) {
          targetRoomId = formData.room;
        }
      }

      const formToAdapt = {
        ...formData,
        room_id: targetRoomId,
        room_type_id: targetRoomTypeId,
        adults: Number(formData.totalPerson || 1),
        children: 0,
        special_requests: formData.specialRequests || formData.note || '',
      };

      const backendPayload = toBackendReservationPayload(formToAdapt, { isUpdate: true });

      const canonicalId = originalBooking?._id || originalBooking?.canonicalBookingId || originalBooking?.id || id;

      const res = await reservationService.updateReservation(canonicalId, backendPayload);
      const updatedBackend = res?.data?.reservation || res?.data || res;

      if (updatedBackend) {
        const adapted = toFrontendReservation(updatedBackend);
        const currentStored = getReservations();
        const exists = currentStored.some(b =>
          String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)
        );
        const updatedList = exists
          ? currentStored.map(b =>
              (String(b.id) === String(adapted.id) || String(b._id) === String(adapted.id) || String(b.bookingId) === String(adapted.bookingId)) ? adapted : b
            )
          : [adapted, ...currentStored];
        syncReservationsFromBackend(updatedList);
        try {
          addAuditLog({
            module: 'Reservation',
            action: 'Edited Reservation',
            recordId: adapted.bookingId || adapted.id,
            description: `Reservation ${adapted.bookingId || adapted.id} updated for ${adapted.name}.`,
            importance: 'Normal',
          });
        } catch {}
      }

      const gId = originalBooking?.guestId || originalBooking?.primary_guest_id;
      // Update guest avatar if changed
      if (guestProfileImage && !guestProfileImage.startsWith('blob:') && gId) {
        try {
          await guestService.updateGuest(gId, { avatar: guestProfileImage });
          await guestService.createGuestDocument(gId, {
            document_url: guestProfileImage,
            document_type: 'Profile Picture',
            document_number: formData.idNumber || 'N/A',
            name: `${formData.firstName || ''} ${formData.lastName || ''} Profile Picture`.trim(),
            room_number: selectedRoom ? String(selectedRoom.roomNo) : (originalBooking?.roomNo || 'N/A'),
            status: 'Signed & Verified'
          });
        } catch {}
      }

      // Optional CNIC document storage
      const finalCnic = (cnicFileUrl && !cnicFileUrl.startsWith('blob:')) ? cnicFileUrl : '';
      if (finalCnic || selectedFile) {
        try {
          const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Guest';
          await registrationFormService.createRegistrationForm({
            firstName: formData.firstName,
            lastName: formData.lastName,
            guest: fullName,
            idType: 'CNIC',
            idNumber: formData.idNumber || 'N/A',
            room: selectedRoom ? String(selectedRoom.roomNo) : (originalBooking?.roomNo || 'N/A'),
            document_url: finalCnic,
            status: 'Signed & Verified'
          });
          if (gId && finalCnic) {
            await guestService.createGuestDocument(gId, {
              document_url: finalCnic,
              document_type: 'CNIC',
              document_number: formData.idNumber || 'N/A',
              name: `${fullName} CNIC`,
              room_number: selectedRoom ? String(selectedRoom.roomNo) : (originalBooking?.roomNo || 'N/A'),
              status: 'Signed & Verified'
            });
          }
        } catch (err) {
          console.warn('Backend registration form creation error:', err);
        }
      }

      navigate('/reservation/all');
    } catch (err) {
      if (err.status === 409 || err.message?.includes('already booked')) {
        setError('The selected room is no longer available for these dates.');
      } else {
        setError(err.message || 'Failed to update reservation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const muiInputSx = {'& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12.5px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  }, '& .MuiInputLabel-root': {
    fontSize: '12.5px',
    color: '#6b7280',
    '&.Mui-focused': { color: '#1b7f43' }
  }};

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

                {/* TASK 2: Guest dropdown now reads from canonical hotel_guests_v1 */}
                <FormControl size="small" sx={{ ...muiInputSx, minWidth: 200 }}>
                  <InputLabel>Select / Insert Guest</InputLabel>
                  <Select
                    label="Select / Insert Guest"
                    onChange={handleGuestSelect}
                    defaultValue=""
                  >
                    <MenuItem value="" disabled><em>Select existing guest...</em></MenuItem>
                    {registeredGuests.map(guest => (
                      <MenuItem key={guest.id} value={String(guest.id)}>
                        {guest.name}{guest.email ? ` — ${guest.email}` : ''}
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
                    <div className="w-14 h-14 rounded-full border-2 border-gray-200 group-hover:border-[#1b7f43] transition-colors overflow-hidden bg-white shadow-2xs flex items-center justify-center relative">
                      {isUploadingProfile ? (
                        <CircularProgress size={22} sx={{ color: '#1b7f43' }} />
                      ) : guestProfileImage ? (
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
                  <TextField required label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                  <TextField required label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
                  <TextField required label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />

                  <FormControl size="small" fullWidth sx={muiInputSx}>
                    <InputLabel>Gender</InputLabel>
                    <Select name="gender" value={formData.gender} label="Gender" onChange={handleChange}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField required label="Mobile *" name="mobile" value={formData.mobile} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
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
                  <TextField required type="date" label="Arrival Date *" name="checkInDate" value={formData.checkInDate} onChange={handleChange} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
                  <TextField required type="date" label="Departure Date *" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
                </div>

                {/* Cascading Room Type Dropdown */}
                <FormControl required size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="edit-res-room-type-label">Select Room Type *</InputLabel>
                  <Select
                    labelId="edit-res-room-type-label"
                    id="edit-res-room-type"
                    name="roomType"
                    value={formData.roomType}
                    label="Select Room Type *"
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value=""><em>Select Room Type...</em></MenuItem>
                    {availableRoomTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Cascading Room Number Dropdown + Pills with Capacity */}
                <div>
                  <FormControl size="small" fullWidth sx={muiInputSx}>
                    <InputLabel id="edit-res-room-no-label">Select Room Number</InputLabel>
                    <Select
                      labelId="edit-res-room-no-label"
                      id="edit-res-room-no"
                      name="room"
                      value={formData.room}
                      label="Select Room Number"
                      onChange={handleChange}
                    >
                      <MenuItem value=""><em>Keep current room</em></MenuItem>
                      {filteredAvailableRooms.map(room => (
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

                <TextField required type="number" label="Total Person *" name="totalPerson" value={formData.totalPerson} onChange={handleChange} sx={muiInputSx} size="small" fullWidth inputProps={{ min: 1 }} />
                <TextField type="number" label="Number of Rooms" name="numberOfRooms" value={formData.numberOfRooms} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />

                {/* Package Dropdown */}
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="edit-res-package-label">Select Package</InputLabel>
                  <Select
                    labelId="edit-res-package-label"
                    id="edit-res-package"
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
                  {isUploadingCnic ? (
                    <div className="flex items-center gap-2 py-1">
                      <CircularProgress size={20} sx={{ color: '#1b7f43' }} />
                      <span className="text-xs font-semibold text-[#1b7f43]">Uploading to Cloudinary...</span>
                    </div>
                  ) : (
                    <>
                      <UploadFile className="text-gray-400 mb-1" sx={{ fontSize: 24 }} />
                      <p className="text-xs font-semibold text-gray-700">Upload Your CNIC / Identification</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {cnicFileUrl ? (
                          <span className="text-[#1b7f43] font-medium">✓ Uploaded ({selectedFile?.name || 'Document'})</span>
                        ) : selectedFile ? (
                          <span className="text-[#1b7f43] font-medium">{selectedFile.name}</span>
                        ) : (
                          'No file chosen (PNG, JPG, PDF)'
                        )}
                      </p>
                    </>
                  )}
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save sx={{ fontSize: 16 }} />
                    Update Booking
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
