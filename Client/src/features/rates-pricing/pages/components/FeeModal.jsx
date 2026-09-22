import { useState } from'react';
import {
 Dialog, DialogContent, DialogActions,
 IconButton, TextField, MenuItem, FormControl, InputLabel, Select,
 InputAdornment
} from'@mui/material';
import {
 Close, ReceiptLong, CheckCircle, InfoOutlined
} from'@mui/icons-material';

const muiInputSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'10px',
 backgroundColor:'#ffffff',
 fontSize:'13px','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1.2px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'#1b7f43', borderWidth:'1.5px' },
 },'& .MuiInputLabel-root': {
 fontSize:'13px',
 color:'#6b7280','&.Mui-focused': { color:'#1b7f43' }
 }
};

function FeeFormBody({ fee, onClose, onSave }) {
 const isEdit = Boolean(fee && fee.id);

 const [formData, setFormData] = useState(() => ({
 name: fee?.name ||'',
 code: fee?.code ||'',
 description: fee?.description ||'',
 calculationType: fee?.calculationType ||'Fixed Amount',
 value: fee?.value !== undefined ? fee.value :'',
 appliesTo: fee?.appliesTo ||'Per Booking',
 currency: fee?.currency ||'PKR',
 status: fee?.status ||'Active'
 }));

 const [errors, setErrors] = useState({});

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({
 ...prev,
 [name]: value
 }));
 if (errors[name]) {
 setErrors(prev => ({ ...prev, [name]: null }));
 }
 };

 const validate = () => {
 const newErrors = {};
 if (!formData.name.trim()) newErrors.name ='Fee Name is required';
 if (!formData.code.trim()) newErrors.code ='Fee Code is required';
 
 const val = Number(formData.value);
 if (!formData.value || isNaN(val) || val <= 0) {
 newErrors.value ='Please enter a valid positive fee amount';
 } else if (formData.calculationType ==='Percentage' && val > 100) {
 newErrors.value ='Percentage fee cannot exceed 100%';
 }

 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = (e) => {
 e.preventDefault();
 if (!validate()) return;

 const payload = {
 ...formData,
 code: formData.code.toUpperCase().trim(),
 value: Number(formData.value)
 };

 onSave(payload, isEdit ? fee.id : null);
 };

 return (
 <>
 <DialogContent sx={{ p: 3, backgroundColor:'#f9fafb' }}>
 <form id="fee-form" onSubmit={handleSubmit} className="space-y-3">
 
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Fee Specifications</h3>
 </div>

 <div className="space-y-3">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="sm:col-span-2">
 <TextField
 fullWidth
 size="small"
 label="Fee Name"
 name="name"
 value={formData.name}
 onChange={handleChange}
 error={Boolean(errors.name)}
 helperText={errors.name}
 required
 placeholder="e.g., Hotel Service Charge, Extra Bed Fee"
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 label="Fee Code"
 name="code"
 value={formData.code}
 onChange={handleChange}
 error={Boolean(errors.code)}
 helperText={errors.code}
 required
 placeholder="e.g., SERVICE10, EXTRABED"
 inputProps={{ style: { textTransform:'uppercase', fontFamily:'monospace', fontWeight: 600 } }}
 sx={muiInputSx}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Calculation Type</InputLabel>
 <Select
 name="calculationType"
 value={formData.calculationType}
 label="Calculation Type"
 onChange={handleChange}
 >
 <MenuItem value="Fixed Amount">Fixed Amount (PKR)</MenuItem>
 <MenuItem value="Percentage">Percentage (%)</MenuItem>
 </Select>
 </FormControl>

 <TextField
 fullWidth
 size="small"
 type="number"
 label={formData.calculationType ==='Percentage' ?'Fee Percentage (%)' :'Fee Amount (PKR)'}
 name="value"
 value={formData.value}
 onChange={handleChange}
 error={Boolean(errors.value)}
 helperText={errors.value}
 required
 placeholder={formData.calculationType ==='Percentage' ?'10' :'1500'}
 InputProps={{
 endAdornment: (
 <InputAdornment position="end">
 <span className="text-xs font-bold text-gray-500">
 {formData.calculationType ==='Percentage' ?'%' :'PKR'}
 </span>
 </InputAdornment>
 )
 }}
 sx={muiInputSx}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Applies To</InputLabel>
 <Select
 name="appliesTo"
 value={formData.appliesTo}
 label="Applies To"
 onChange={handleChange}
 >
 <MenuItem value="Per Booking">Per Booking</MenuItem>
 <MenuItem value="Per Night">Per Occupied Night</MenuItem>
 <MenuItem value="Per Guest">Per Guest</MenuItem>
 <MenuItem value="Per Incident">Per Incident / Request</MenuItem>
 <MenuItem value="Total Bill">Total Bill Amount</MenuItem>
 </Select>
 </FormControl>

 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Status</InputLabel>
 <Select
 name="status"
 value={formData.status}
 label="Status"
 onChange={handleChange}
 >
 <MenuItem value="Active">Active</MenuItem>
 <MenuItem value="Inactive">Inactive</MenuItem>
 </Select>
 </FormControl>
 </div>

 <TextField
 fullWidth
 multiline
 rows={2}
 size="small"
 label="Description & Terms"
 name="description"
 value={formData.description}
 onChange={handleChange}
 placeholder="Fee breakdown details, operational rules, or billing terms..."
 sx={muiInputSx}
 />
 </div>
 </div>

 </form>
 </DialogContent>

 <DialogActions sx={{ p: 2.5, backgroundColor:'white', borderTop:'1px solid #f3f4f6', justifyContent:'flex-end', gap: 1 }}>
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
 >
 Cancel
 </button>

 <button
 type="submit"
 form="fee-form"
 className="px-5 py-1.5 text-xs font-bold text-white bg-[#1b7f43] hover:bg-[#156736] rounded-lg shadow-xs transition cursor-pointer"
 >
 {isEdit ?'Save Changes' :'Create Fee'}
 </button>
 </DialogActions>
 </>
 );
}

export default function FeeModal({
 open,
 onClose,
 fee,
 onSave
}) {
 const isEdit = Boolean(fee && fee.id);

 if (!open) return null;

 return (
 <Dialog
 open={open}
 onClose={onClose}
 maxWidth="sm"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 overflow:'hidden',
 boxShadow:'0 20px 50px rgba(0,0,0,0.15)'
 }
 }}
 >
 <div className="bg-[#1b7f43] p-3.5 px-4 text-white flex items-center justify-between">
 <div>
 <h2 className="text-base font-bold tracking-tight">
 {isEdit ?'Edit Surcharge & Fee' :'Configure New Fee'}
 </h2>
 <p className="text-[11px] text-white/80 mt-0.5">
 {isEdit ?`Modifying surcharge details for ${fee.code}` :'Set operational charges, facility fees, and guest service tariffs'}
 </p>
 </div>
 <IconButton
 onClick={onClose}
 size="small"
 sx={{ color:'white','&:hover': { backgroundColor:'rgba(255,255,255,0.2)' } }}
 >
 <Close sx={{ fontSize: 18 }} />
 </IconButton>
 </div>

 <FeeFormBody
 key={fee?.id ||'new-fee'}
 fee={fee}
 onClose={onClose}
 onSave={onSave}
 />
 </Dialog>
 );
}
