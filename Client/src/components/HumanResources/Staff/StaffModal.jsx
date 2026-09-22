import React, { useState, useEffect } from'react';
import {
 Dialog,
 DialogContent,
 TextField,
 MenuItem,
 InputAdornment,
 IconButton,
 Avatar,
 Slide
} from'@mui/material';
import CloseIcon from'@mui/icons-material/Close';
import PhoneOutlinedIcon from'@mui/icons-material/PhoneOutlined';
import MailOutlineIcon from'@mui/icons-material/MailOutlined';
import CalendarTodayOutlinedIcon from'@mui/icons-material/CalendarTodayOutlined';
import { updateStaffMember } from'../../../services/HumanResources/staffService';
import '../../../features/assigned-ui/formStyles.css';

const Transition = React.forwardRef(function Transition(props, ref) {
 return <Slide direction="down" ref={ref} {...props} />;
});

// Outlined input styling matching Luxuria Material theme
const inputStyle = {'& .MuiOutlinedInput-root': {
 borderRadius:'7px',
 backgroundColor:'#ffffff',
 fontSize:'14.5px',
 color:'#1e293b','& fieldset': {
 borderColor:'#d1d5db',
 borderWidth:'1.2px',
 },'&:hover fieldset': {
 borderColor:'var(--primary-main)',
 },'&.Mui-focused fieldset': {
 borderColor:'var(--primary-main)',
 borderWidth:'1.5px',
 },'&.Mui-focused': {
 boxShadow:'0 0 0 1px var(--primary-main)',
 },
 },'& .MuiInputLabel-root': {
 fontSize:'14px',
 color:'#4b5563','&.Mui-focused': {
 color:'var(--primary-main)',
 fontWeight: 500,
 },
 },'& .MuiInputLabel-shrink': {
 transform:'translate(14px, -9px) scale(0.85)',
 backgroundColor:'#ffffff',
 padding:'0 4px',
 },
};

const designationsList = ['Cook','Kitchen Manager','Casino Host','Driver','Purchase Officer','Receptionist','Hotel Manager','Assistant Manager','Front Desk Officer','Head Chef','Sous Chef','Housekeeping Supervisor','Room Attendant','Concierge','Security Guard','Maintenance Technician','Bartender','Waiter/Waitress'
];

export default function EditStaffModal({ open, onClose, staff, onSaveSuccess }) {
 const [formData, setFormData] = useState({
 name:'',
 designation:'',
 phone:'',
 email:'',
 joiningDate:'',
 address:''
 });

 const [dateFocused, setDateFocused] = useState(false);
 const [errors, setErrors] = useState({});

 useEffect(() => {
 if (staff) {
 setFormData({
 name: staff.name ||'',
 designation: staff.designation ||'',
 phone: staff.phone ||'',
 email: staff.email ||'',
 joiningDate: staff.joiningDate ||'',
 address: staff.address ||''
 });
 setErrors({});
 }
 }, [staff, open]);

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 if (errors[name]) {
 setErrors(prev => ({ ...prev, [name]: null }));
 }
 };

 const handleSave = (e) => {
 e.preventDefault();
 const newErrors = {};
 if (!formData.name.trim()) newErrors.name ='Name is required';
 if (!formData.designation) newErrors.designation ='Designation is required';
 if (!formData.phone.trim()) newErrors.phone ='Mobile is required';
 if (!formData.email.trim()) {
 newErrors.email ='Email is required';
 } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
 newErrors.email ='Invalid email';
 }

 if (Object.keys(newErrors).length > 0) {
 setErrors(newErrors);
 return;
 }

 if (staff) {
 const updatedList = updateStaffMember(staff.id, {
 name: formData.name.trim(),
 designation: formData.designation,
 phone: formData.phone.trim(),
 email: formData.email.trim(),
 joiningDate: formData.joiningDate,
 address: formData.address.trim()
 });
 const updatedStaff = updatedList.find(s => String(s.id) === String(staff.id)) || {
 ...staff,
 ...formData
 };
 if (onSaveSuccess) onSaveSuccess(updatedStaff);
 }
 onClose();
 };

 if (!staff) return null;

 return (
 <Dialog
 className="assigned-form-surface"
 open={open}
 onClose={onClose}
 TransitionComponent={Transition}
 maxWidth="sm"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 overflow:'hidden',
 boxShadow:'0 25px 50px -12px rgba(0, 0, 0, 0.25)',
 }
 }}
 >
 {/* Header Bar matching Luxuria exact design */}
 <div className="assigned-modal-header px-5 py-3.5 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Avatar
 src={staff.avatar ||`https://i.pravatar.cc/150?u=${staff.id}`}
 alt={staff.name}
 sx={{
 width: 44,
 height: 44,
 border:'2px solid rgba(255,255,255,0.85)',
 boxShadow:'0 2px 6px rgba(0,0,0,0.15)'
 }}
 />
 <h2 className="text-white text-[17px] font-bold tracking-tight leading-snug">
 {formData.name || staff.name}
 </h2>
 </div>

 {/* Circular translucent close button */}
 <button
 type="button"
 onClick={onClose}
 aria-label="Close dialog"
 className="assigned-modal-close w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer"
 >
 <CloseIcon sx={{ fontSize: 18 }} />
 </button>
 </div>

 {/* Dialog Form Body */}
 <form onSubmit={handleSave} noValidate>
 <DialogContent sx={{ p:'24px 24px 16px 24px' }}>
 <div className="space-y-4">
 {/* Row 1: Name & Designation */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <TextField
 fullWidth
 label="Name*"
 name="name"
 value={formData.name}
 onChange={handleChange}
 error={Boolean(errors.name)}
 helperText={errors.name}
 sx={inputStyle}
 />
 </div>

 <div>
 <TextField
 fullWidth
 select
 label="Designation*"
 name="designation"
 value={formData.designation}
 onChange={handleChange}
 error={Boolean(errors.designation)}
 helperText={errors.designation}
 sx={inputStyle}
 >
 {designationsList.map((item) => (
 <MenuItem key={item} value={item}>{item}</MenuItem>
 ))}
 {formData.designation && !designationsList.includes(formData.designation) && (
 <MenuItem value={formData.designation}>{formData.designation}</MenuItem>
 )}
 </TextField>
 </div>
 </div>

 {/* Row 2: Mobile & Email with right-side icons */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <TextField
 fullWidth
 label="Mobile*"
 name="phone"
 value={formData.phone}
 onChange={handleChange}
 error={Boolean(errors.phone)}
 helperText={errors.phone}
 InputProps={{
 endAdornment: (
 <InputAdornment position="end">
 <PhoneOutlinedIcon sx={{ color:'#1e293b', fontSize: 20 }} />
 </InputAdornment>
 ),
 }}
 sx={inputStyle}
 />
 </div>

 <div>
 <TextField
 fullWidth
 label="Email*"
 name="email"
 value={formData.email}
 onChange={handleChange}
 error={Boolean(errors.email)}
 helperText={errors.email}
 InputProps={{
 endAdornment: (
 <InputAdornment position="end">
 <MailOutlineIcon sx={{ color:'#1e293b', fontSize: 20 }} />
 </InputAdornment>
 ),
 }}
 sx={inputStyle}
 />
 </div>
 </div>

 {/* Row 3: Joining date with calendar icon */}
 <div>
 <TextField
 fullWidth
 label="Joining date*"
 name="joiningDate"
 type={dateFocused || formData.joiningDate ?'date' :'text'}
 onFocus={() => setDateFocused(true)}
 onBlur={() => setDateFocused(false)}
 value={formData.joiningDate}
 onChange={handleChange}
 InputLabelProps={{
 shrink: Boolean(dateFocused || formData.joiningDate)
 }}
 InputProps={{
 endAdornment: (
 <InputAdornment position="end">
 <IconButton
 size="small"
 edge="end"
 tabIndex={-1}
 onClick={(e) => {
 const input = e.currentTarget.closest('.MuiOutlinedInput-root')?.querySelector('input');
 if (input) {
 input.focus();
 if (input.showPicker) input.showPicker();
 }
 }}
 >
 <CalendarTodayOutlinedIcon sx={{ color:'#1e293b', fontSize: 19 }} />
 </IconButton>
 </InputAdornment>
 ),
 }}
 sx={inputStyle}
 />
 </div>

 {/* Row 4: Address multiline */}
 <div>
 <TextField
 fullWidth
 multiline
 rows={3}
 label="Address"
 name="address"
 value={formData.address}
 onChange={handleChange}
 sx={inputStyle}
 />
 </div>
 </div>
 </DialogContent>

 {/* Footer Buttons exactly matching Luxuria pill design */}
 <div className="px-6 pb-6 pt-2 flex items-center gap-3">
 <button
 type="submit"
 className="assigned-primary-button px-7 py-2 rounded-full font-semibold text-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-200 cursor-pointer"
 >
 Save
 </button>
 <button
 type="button"
 onClick={onClose}
 className="px-7 py-2 rounded-full bg-white hover:bg-red-500 text-red-500 hover:text-white font-semibold text-sm border border-red-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-200 cursor-pointer"
 >
 Cancel
 </button>
 </div>
 </form>
 </Dialog>
 );
}
