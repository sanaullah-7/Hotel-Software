import React, { useState } from'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { 
 ArrowBack, Save, UploadFile, CalendarMonth, AccessTime,
 Person, Hotel, CreditCard, NoteAlt
} from'@mui/icons-material';
import {
 TextField, MenuItem, FormControl, InputLabel, Select
} from'@mui/material';
import { getReservations, saveReservations } from '../state/reservationStore';
import { addAuditLog } from '../../audit/state/auditStore';
import { getRooms, updateRoom } from '../../../features/rooms/state/roomStore';

export default function EditReservation() {
 const navigate = useNavigate();

 const { id } = useParams();
 
 useEffect(() => {
   if (id) {
     const allRes = getReservations();
     const booking = allRes.find(b => String(b.id) === String(id));
     if (booking) {
       const nameParts = (booking.name || '').split(' ');
       const fName = nameParts[0];
       const lNames = nameParts.slice(1).join(' ');
       setFormData(prev => ({
         ...prev,
         firstName: fName || '',
         lastName: lNames || '',
         email: booking.email || '',
         mobile: booking.mobile || '',
         checkInDate: booking.checkIn || '',
         checkOutDate: booking.checkOut || '',
         purposeOfStay: booking.package || 'Leisure',
         paymentMethod: booking.payment || 'Credit Card'
       }));
       if (booking.avatar) {
         setGuestProfileImage(booking.avatar);
       }
     }
   }
 }, [id]);


 const [formData, setFormData] = useState({
 firstName:'',
 lastName:'',
 email:'',
 gender:'',
 mobile:'',
 city:'',
 idNumber:'',
 nationality:'',
 
 checkInDate:'2026-09-11',
 checkOutDate:'2026-09-16',
 room:'',
 totalPerson:'',
 numberOfRooms:'1',
 purposeOfStay:'',

 paymentMethod:'',
 discountCode:'',
 bookingReference:'BK362096OZ10IX',
 emergencyContactName:'',
 emergencyContactPhone:'',

 address:'',
 specialRequests:'',
 note:'',
 });

 const [selectedFile, setSelectedFile] = useState(null);
 const fileInputRef = React.useRef(null);
 const [guestProfileImage, setGuestProfileImage] = useState(null);
 const profileImageInputRef = React.useRef(null);

 const [cnicBase64, setCnicBase64] = useState(null);
 const handleFileChange = async (e) => {
   if (e.target.files && e.target.files.length > 0) {
     const file = e.target.files[0];
     setSelectedFile(file);
     const compressed = await compressImage(file, 400, 0.6);
     setCnicBase64(compressed);
   }
 };

 const compressImage = (file, maxWidth = 200, quality = 0.6) => {
   return new Promise((resolve) => {
     const reader = new FileReader();
     reader.onloadend = () => {
       const img = new Image();
       img.onload = () => {
         const canvas = document.createElement('canvas');
         const scale = Math.min(1, maxWidth / img.width);
         canvas.width = img.width * scale;
         canvas.height = img.height * scale;
         const ctx = canvas.getContext('2d');
         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         resolve(canvas.toDataURL('image/jpeg', quality));
       };
       img.src = reader.result;
     };
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

 // Dummy list of already registered guests for the dropdown
 const registeredGuests = [
 { id: 1, firstName:'Kamran', lastName:'Akmal', email:'kamran@example.com', gender:'Male', mobile:'0311 1122334', city:'Lahore', idNumber:'42101-1122334-1', nationality:'Pakistani' },
 { id: 2, firstName:'Mahira', lastName:'Khan', email:'mahira@example.com', gender:'Female', mobile:'0321 6655443', city:'Karachi', idNumber:'42201-6655443-2', nationality:'Pakistani' },
 { id: 3, firstName:'Cara', lastName:'Stevens', email:'cara.s2@example.com', gender:'Female', mobile:'0321 8887654', city:'London', idNumber:'USA-9988221', nationality:'British' }
 ];

 const availableRooms = getRooms()
  .filter(room => room.status === 'Open')
  .map(room => ({ id: String(room.id), sourceId: room.id, number: room.roomNo, type: room.roomType }));

 const handleGuestSelect = (e) => {
 const selectedId = e.target.value;
 const guest = registeredGuests.find(g => g.id === selectedId);
 if (guest) {
 setFormData(prev => ({
 ...prev,
 firstName: guest.firstName,
 lastName: guest.lastName,
 email: guest.email,
 gender: guest.gender,
 mobile: guest.mobile,
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
  const reservations = getReservations();
  if (!id) return;
  const selectedRoom = availableRooms.find((room) => room.id === formData.room);
  
  const updatedReservations = reservations.map(res => {
    if (String(res.id) === String(id)) {
      return {
        ...res,
        name: `${formData.firstName} ${formData.lastName}`.trim() || 'Guest',
        avatar: guestProfileImage || res.avatar,
        package: formData.purposeOfStay || res.package,
        room: selectedRoom?.number || res.room,
        roomType: selectedRoom?.type || res.roomType,
        checkIn: formData.checkInDate || res.checkIn,
        checkOut: formData.checkOutDate || res.checkOut,
        payment: formData.paymentMethod ? formData.paymentMethod : res.payment,
        email: formData.email || res.email,
        mobile: formData.mobile || res.mobile,
      };
    }
    return res;
  });
  saveReservations(updatedReservations);

  if (cnicBase64) {
    const INITIAL_DOCS = [{"id":"DOC-1","formNo":"REG-2026-089","guest":"Kamran Akmal","idType":"CNIC","idNumber":"42101-1122334-1","room":"101","date":"2026-05-10","status":"Signed & Verified"}];
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
      guest: `${formData.firstName} ${formData.lastName}`.trim() || 'Guest',
      idType: 'CNIC',
      idNumber: formData.idNumber || 'N/A',
      room: selectedRoom?.number || 'N/A',
      date: new Date().toISOString().split('T')[0],
      status: 'Signed & Verified',
      cnicImage: cnicBase64
    };
    try { localStorage.setItem('hotel_registration_forms', JSON.stringify([newDoc, ...storedDocs])); } catch(e) { console.warn("CNIC storage error", e); }
  }

  navigate('/reservation/all');
   };

 const muiInputSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'8px',
 backgroundColor:'#ffffff',
 fontSize:'12.5px',
 color:'#1f2937','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1.2px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'#1b7f43', borderWidth:'1.5px' },
 },'& .MuiInputLabel-root': {
 fontSize:'12.5px',
 color:'#6b7280','&.Mui-focused': { color:'#1b7f43' }
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
 <Person sx={{ fontSize: 22, color:'#1b7f43' }} />
 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Guest Information</h3>
 </div>

 {/* Upload Profile Field */}
 <div className="flex items-center justify-center">
   <input 
     type="file" 
     accept="image/*" 
     className="hidden" 
     id="profile-upload"
     ref={profileImageInputRef} 
     onChange={handleProfileImageChange} 
   />
   <label htmlFor="profile-upload" className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative group">
     {guestProfileImage ? (
       <img src={guestProfileImage} alt="Profile" className="w-full h-full object-cover" />
     ) : (
       <Person className="text-gray-400" />
     )}
     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
       <span className="text-[10px] text-white font-medium text-center leading-tight">Upload</span>
     </div>
   </label>
   <div className="text-xs text-gray-500 hidden sm:block ml-2">
     Upload<br/>Profile
   </div>
 </div>
 
 {/* Auto-fill Dropdown */}
 <FormControl size="small" sx={{ ...muiInputSx, minWidth: 220 }}>
 <InputLabel>Select / Insert Guest</InputLabel>
 <Select 
 label="Select / Insert Guest" 
 onChange={handleGuestSelect}
 defaultValue=""
 >
 <MenuItem value="" disabled><em>Select existing guest...</em></MenuItem>
 {registeredGuests.map(guest => (
 <MenuItem key={guest.id} value={guest.id}>
 {guest.firstName} {guest.lastName} ({guest.idNumber})
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
 <Hotel sx={{ fontSize: 22, color:'#1b7f43' }} />
 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Stay Details</h3>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="flex gap-2">
 <TextField type="date" label="Arrival Date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
 <TextField type="date" label="Departure Date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
 </div>
 
 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Select Room</InputLabel>
 <Select name="room" value={formData.room} label="Select Room" onChange={handleChange}>
 {availableRooms.map(room => (
 <MenuItem key={room.id} value={room.id}>
 {room.number} - {room.type}
 </MenuItem>
 ))}
 </Select>
 </FormControl>

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
 <CreditCard sx={{ fontSize: 22, color:'#1b7f43' }} />
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
 <NoteAlt sx={{ fontSize: 22, color:'#1b7f43' }} />
 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Additional Details</h3>
 </div>
 <div className="flex items-center gap-3 flex-col space-y-4">
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
   className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer bg-[#fafafa]"
 >
   <UploadFile className="text-gray-400 mb-2" sx={{ fontSize: 32 }} />
   <p className="text-sm font-semibold text-gray-700">Upload Your CNIC</p>
   <p className="text-xs text-gray-400 mt-1">
     {selectedFile ? <span className="text-[#1b7f43] font-medium">{selectedFile.name}</span> : 'No file chosen'}
   </p>
 </label>

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
 Update Booking
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
}
