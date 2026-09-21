import React, { useState } from'react';
import { useNavigate } from'react-router-dom';
import { 
 ArrowBack, Save, UploadFile, CalendarMonth, AccessTime,
 Person, Hotel, CreditCard, NoteAlt
} from'@mui/icons-material';
import {
 TextField, MenuItem, FormControl, InputLabel, Select
} from'@mui/material';

export default function EditReservation() {
 const navigate = useNavigate();

 const [formData, setFormData] = useState({
 // Guest Info
 firstName:'Pooja',
 lastName:'Sarma',
 email:'test@example.com',
 gender:'Female',
 mobile:'123456789',
 city:'Surat',
 idNumber:'P123456789',
 nationality:'Indian',
 
 // Stay Details
 checkInDate:'2020-02-17',
 checkOutDate:'2020-02-19',
 packageType:'Business',
 totalPerson:'3',
 numberOfRooms:'2',
 roomType:'Delux',
 arrivalTime:'Evening (6:00 PM - 10:00 PM)',
 purposeOfStay:'Business',

 // Payment & Booking
 paymentMethod:'Credit Card',
 discountCode:'SAVE10',
 bookingReference:'BK123456ABCD',
 emergencyContactName:'John Doe',
 emergencyContactPhone:'987654321',

 // Additional Details
 address:'101, Elanxa, New Yourk',
 specialRequests:'Non-smoking room, late check-in',
 note:'test commit fields',
 });

 const [selectedFile, setSelectedFile] = useState(null);
 const fileInputRef = React.useRef(null);

 const handleFileChange = (e) => {
 if (e.target.files && e.target.files.length > 0) {
 setSelectedFile(e.target.files[0]);
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
 <div className="animate-fade-in pb-10 max-w-[1600px] mx-auto p-4 sm:p-6">
 
 {/* FORM CARD */}
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
 <div className="p-6 md:p-8 bg-white">
 <form onSubmit={handleSave} className="space-y-6">
 
 {/* SECTION 1: GUEST INFORMATION */}
 <div>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
 <div className="flex items-center gap-2">
 <Person sx={{ fontSize: 22, color:'#1b7f43' }} />
 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Guest Information</h3>
 </div>
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
 <TextField type="date" label="Check In Date" name="checkInDate" value={formData.checkInDate} onChange={handleChange} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
 <TextField type="date" label="Check Out Date" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
 </div>
 
 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Select Package Type</InputLabel>
 <Select name="packageType" value={formData.packageType} label="Select Package Type" onChange={handleChange}>
 <MenuItem value="Business">Business</MenuItem>
 <MenuItem value="All inclusive">All inclusive</MenuItem>
 <MenuItem value="Wedding">Wedding</MenuItem>
 </Select>
 </FormControl>

 <TextField required type="number" label="Total Person" name="totalPerson" value={formData.totalPerson} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
 <TextField type="number" label="Number of Rooms" name="numberOfRooms" value={formData.numberOfRooms} onChange={handleChange} sx={muiInputSx} size="small" fullWidth />
 
 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Select Room Type</InputLabel>
 <Select name="roomType" value={formData.roomType} label="Select Room Type" onChange={handleChange}>
 <MenuItem value="Standard">Standard</MenuItem>
 <MenuItem value="Delux">Delux</MenuItem>
 <MenuItem value="Super Delux">Super Delux</MenuItem>
 <MenuItem value="Suite">Suite</MenuItem>
 <MenuItem value="Vila">Vila</MenuItem>
 </Select>
 </FormControl>

 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Arrival Time</InputLabel>
 <Select name="arrivalTime" value={formData.arrivalTime} label="Arrival Time" onChange={handleChange}>
 <MenuItem value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</MenuItem>
 <MenuItem value="Afternoon (12:00 PM - 6:00 PM)">Afternoon (12:00 PM - 6:00 PM)</MenuItem>
 <MenuItem value="Evening (6:00 PM - 10:00 PM)">Evening (6:00 PM - 10:00 PM)</MenuItem>
 <MenuItem value="Late Night (After 10:00 PM)">Late Night (After 10:00 PM)</MenuItem>
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
 <div className="flex items-center gap-2 mb-6">
 <NoteAlt sx={{ fontSize: 22, color:'#1b7f43' }} />
 <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Additional Details</h3>
 </div>
 <div className="flex flex-col gap-6">
 <TextField label="Address" name="address" value={formData.address} onChange={handleChange} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
 <TextField label="Special Requests" name="specialRequests" value={formData.specialRequests} onChange={handleChange} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
 
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
 {selectedFile ? <span className="text-[#1b7f43] font-medium">{selectedFile.name}</span> :'No file chosen'}
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
 Save Changes
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
}
