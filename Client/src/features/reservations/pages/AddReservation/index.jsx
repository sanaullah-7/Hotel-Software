import React from'react';
import { 
 ArrowBack, Save, UploadFile, CalendarMonth, AccessTime,
 Person, Hotel, CreditCard, NoteAlt
} from'@mui/icons-material';
import {
 TextField, MenuItem, FormControl, InputLabel, Select
} from'@mui/material';
import { registeredGuests, availableRooms } from'./constants';
import { useAddReservation } from'./useAddReservation';

export default function AddReservation() {
 const {
 navigate,
 formData,
 selectedFile,
 fileInputRef,
 handleFileChange,
 handleGuestSelect,
 handleChange,
 handleSave
 } = useAddReservation();

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
 Save Booking
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
}
