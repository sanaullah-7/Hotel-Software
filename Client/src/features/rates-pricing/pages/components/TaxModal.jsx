import { useState } from'react';
import {
 Dialog, DialogContent, DialogActions,
 IconButton, TextField, MenuItem, FormControl, InputLabel, Select,
 InputAdornment
} from'@mui/material';
import {
 Close, AccountBalance, CheckCircle, InfoOutlined
} from'@mui/icons-material';

const muiInputSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'10px',
 backgroundColor:'var(--bg-paper)',
 fontSize:'13px','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1.2px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'var(--primary-main)', borderWidth:'1.5px' },
 },'& .MuiInputLabel-root': {
 fontSize:'13px',
 color:'var(--text-secondary)','&.Mui-focused': { color:'var(--primary-main)' }
 }
};

function TaxFormBody({ tax, onClose, onSave }) {
 const isEdit = Boolean(tax && tax.id);

 const [formData, setFormData] = useState(() => ({
 name: tax?.name ||'',
 code: tax?.code ||'',
 description: tax?.description ||'',
 calculationType: tax?.calculationType ||'Percentage',
 value: tax?.value !== undefined ? tax.value :'',
 appliesTo: tax?.appliesTo ||'Room Charges',
 taxNature: tax?.taxNature ||'Exclusive',
 currency: tax?.currency ||'PKR',
 status: tax?.status ||'Active'
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
 if (!formData.name.trim()) newErrors.name ='Tax Name is required';
 if (!formData.code.trim()) newErrors.code ='Tax Code is required';
 
 const val = Number(formData.value);
 if (!formData.value || isNaN(val) || val <= 0) {
 newErrors.value ='Please enter a valid positive tax value';
 } else if (formData.calculationType ==='Percentage' && val > 100) {
 newErrors.value ='Tax percentage cannot exceed 100%';
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

 onSave(payload, isEdit ? tax.id : null);
 };

 return (
 <>
 <DialogContent sx={{ p: 3, backgroundColor:'#f9fafb' }}>
 <form id="tax-form" onSubmit={handleSubmit} className="space-y-3">
 
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Tax Identification & Rate</h3>
 </div>

 <div className="space-y-3">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="sm:col-span-2">
 <TextField
 fullWidth
 size="small"
 label="Tax Name"
 name="name"
 value={formData.name}
 onChange={handleChange}
 error={Boolean(errors.name)}
 helperText={errors.name}
 required
 placeholder="e.g., General Sales Tax (GST)"
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 label="Tax Code"
 name="code"
 value={formData.code}
 onChange={handleChange}
 error={Boolean(errors.code)}
 helperText={errors.code}
 required
 placeholder="e.g., GST15"
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
 <MenuItem value="Percentage">Percentage (%)</MenuItem>
 <MenuItem value="Fixed Amount">Fixed Amount (PKR)</MenuItem>
 </Select>
 </FormControl>

 <TextField
 fullWidth
 size="small"
 type="number"
 label={formData.calculationType ==='Percentage' ?'Tax Rate (%)' :'Tax Amount (PKR)'}
 name="value"
 value={formData.value}
 onChange={handleChange}
 error={Boolean(errors.value)}
 helperText={errors.value}
 required
 placeholder={formData.calculationType ==='Percentage' ?'15' :'500'}
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
 <MenuItem value="Room Charges">Room Charges</MenuItem>
 <MenuItem value="Food & Beverage">Food & Beverage</MenuItem>
 <MenuItem value="Total Invoice">Total Invoice</MenuItem>
 <MenuItem value="Per Night">Per Occupied Night</MenuItem>
 <MenuItem value="Per Guest">Per Guest</MenuItem>
 </Select>
 </FormControl>

 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Inclusive / Exclusive</InputLabel>
 <Select
 name="taxNature"
 value={formData.taxNature}
 label="Inclusive / Exclusive"
 onChange={handleChange}
 >
 <MenuItem value="Exclusive">Exclusive (Added to bill)</MenuItem>
 <MenuItem value="Inclusive">Inclusive (Included in price)</MenuItem>
 </Select>
 </FormControl>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
 label="Description & Legal Notes"
 name="description"
 value={formData.description}
 onChange={handleChange}
 placeholder="Statutory law reference, government Gazette notice, or billing notes..."
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
 form="tax-form"
 className="px-5 py-1.5 text-xs font-bold text-white bg-[#1b7f43] hover:bg-[#156736] rounded-lg shadow-xs transition cursor-pointer"
 >
 {isEdit ?'Save Changes' :'Create Tax'}
 </button>
 </DialogActions>
 </>
 );
}

export default function TaxModal({
 open,
 onClose,
 tax,
 onSave
}) {
 const isEdit = Boolean(tax && tax.id);

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
 {isEdit ?'Edit Tax Definition' :'Configure New Tax'}
 </h2>
 <p className="text-[11px] text-white/80 mt-0.5">
 {isEdit ?`Modifying tax calculation for ${tax.code}` :'Set statutory levies, VAT/GST rules, and rate applications'}
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

 <TaxFormBody
 key={tax?.id ||'new-tax'}
 tax={tax}
 onClose={onClose}
 onSave={onSave}
 />
 </Dialog>
 );
}
