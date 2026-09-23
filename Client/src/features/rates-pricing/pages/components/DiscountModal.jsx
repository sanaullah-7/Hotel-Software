import { useState } from'react';
import {
 Dialog, DialogContent, DialogActions,
 IconButton, TextField, MenuItem, FormControl, InputLabel, Select,
 InputAdornment
} from'@mui/material';
import {
 Close, LocalOffer, CheckCircle, InfoOutlined, Percent, DateRange
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

function DiscountFormBody({ discount, onClose, onSave }) {
 const isEdit = Boolean(discount && discount.id);

 const [formData, setFormData] = useState(() => ({
 name: discount?.name ||'',
 code: discount?.code ||'',
 description: discount?.description ||'',
 discountType: discount?.discountType ||'Percentage',
 discountValue: discount?.discountValue !== undefined ? discount.discountValue :'',
 currency: discount?.currency ||'PKR',
 applicableRatePlan: discount?.applicableRatePlan ||'All Rate Plans',
 applicableRoomType: discount?.applicableRoomType ||'All Room Types',
 startDate: discount?.startDate || new Date().toISOString().split('T')[0],
 endDate: discount?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
 minStayNights: discount?.minStayNights || 1,
 maxRedemptions: discount?.maxRedemptions || 100,
 status: discount?.status ||'Active'
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
 if (!formData.name.trim()) newErrors.name ='Discount Name is required';
 if (!formData.code.trim()) newErrors.code ='Discount Code is required';
 
 const val = Number(formData.discountValue);
 if (!formData.discountValue || isNaN(val) || val <= 0) {
 newErrors.discountValue ='Please enter a valid positive discount value';
 } else if (formData.discountType ==='Percentage' && val > 100) {
 newErrors.discountValue ='Percentage discount cannot exceed 100%';
 }

 if (!formData.startDate) newErrors.startDate ='Start date is required';
 if (!formData.endDate) newErrors.endDate ='End date is required';

 if (formData.startDate && formData.endDate) {
 if (new Date(formData.endDate) < new Date(formData.startDate)) {
 newErrors.endDate ='End date cannot be earlier than start date';
 }
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
 discountValue: Number(formData.discountValue),
 minStayNights: Number(formData.minStayNights || 1),
 maxRedemptions: Number(formData.maxRedemptions || 100)
 };

 onSave(payload, isEdit ? discount.id : null);
 };

 return (
 <>
 <DialogContent sx={{ p: 3, backgroundColor:'#f9fafb' }}>
 <form id="discount-form" onSubmit={handleSubmit} className="space-y-3.5">
 
 {/* Section 1: Basic Info */}
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Basic Voucher Information</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div className="md:col-span-2">
 <TextField
 fullWidth
 size="small"
 label="Discount Name"
 name="name"
 value={formData.name}
 onChange={handleChange}
 error={Boolean(errors.name)}
 helperText={errors.name}
 required
 placeholder="e.g., Weekend Leisure Offer, Summer Flash Sale"
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 label="Promo / Voucher Code"
 name="code"
 value={formData.code}
 onChange={handleChange}
 error={Boolean(errors.code)}
 helperText={errors.code}
 required
 placeholder="e.g., WEEKEND10"
 inputProps={{ style: { textTransform:'uppercase', fontFamily:'monospace', fontWeight: 600 } }}
 sx={muiInputSx}
 />
 </div>

 <div className="md:col-span-2">
 <TextField
 fullWidth
 multiline
 rows={2}
 size="small"
 label="Description / Terms"
 name="description"
 value={formData.description}
 onChange={handleChange}
 placeholder="Explain discount eligibility, terms of use, or package restrictions..."
 sx={muiInputSx}
 />
 </div>

 <div>
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
 <MenuItem value="Expired">Expired</MenuItem>
 </Select>
 </FormControl>
 </div>
 </div>
 </div>

 {/* Section 2: Discount Calculation */}
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Discount Calculation</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Discount Type</InputLabel>
 <Select
 name="discountType"
 value={formData.discountType}
 label="Discount Type"
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
 label={formData.discountType ==='Percentage' ?'Discount Percentage (%)' :'Discount Value (PKR)'}
 name="discountValue"
 value={formData.discountValue}
 onChange={handleChange}
 error={Boolean(errors.discountValue)}
 helperText={errors.discountValue}
 required
 placeholder={formData.discountType ==='Percentage' ?'10' :'2500'}
 InputProps={{
 endAdornment: (
 <InputAdornment position="end">
 <span className="text-xs font-bold text-gray-500">
 {formData.discountType ==='Percentage' ?'%' :'PKR'}
 </span>
 </InputAdornment>
 )
 }}
 sx={muiInputSx}
 />
 </div>
 </div>

 {/* Section 3: Applicability */}
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Applicability & Scope</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Applicable Rate Plan</InputLabel>
 <Select
 name="applicableRatePlan"
 value={formData.applicableRatePlan}
 label="Applicable Rate Plan"
 onChange={handleChange}
 >
 <MenuItem value="All Rate Plans">All Rate Plans</MenuItem>
 <MenuItem value="Best Available Rate">Best Available Rate</MenuItem>
 <MenuItem value="Bed & Breakfast Package">Bed & Breakfast Package</MenuItem>
 <MenuItem value="Corporate Executive Rate">Corporate Executive Rate</MenuItem>
 <MenuItem value="Breakfast & Dinner Special">Breakfast & Dinner Special</MenuItem>
 <MenuItem value="Presidential All-Inclusive VIP">Presidential All-Inclusive VIP</MenuItem>
 </Select>
 </FormControl>

 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Applicable Room Type</InputLabel>
 <Select
 name="applicableRoomType"
 value={formData.applicableRoomType}
 label="Applicable Room Type"
 onChange={handleChange}
 >
 <MenuItem value="All Room Types">All Room Types</MenuItem>
 <MenuItem value="Standard Room">Standard Room</MenuItem>
 <MenuItem value="Deluxe Room">Deluxe Room</MenuItem>
 <MenuItem value="Executive Suite">Executive Suite</MenuItem>
 <MenuItem value="Presidential Suite">Presidential Suite</MenuItem>
 </Select>
 </FormControl>
 </div>
 </div>

 {/* Section 4: Validity & Usage */}
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Validity & Redemptions</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
 <div>
 <TextField
 fullWidth
 size="small"
 type="date"
 label="Start Date"
 name="startDate"
 value={formData.startDate}
 onChange={handleChange}
 error={Boolean(errors.startDate)}
 helperText={errors.startDate}
 InputLabelProps={{ shrink: true }}
 required
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 type="date"
 label="End Date"
 name="endDate"
 value={formData.endDate}
 onChange={handleChange}
 error={Boolean(errors.endDate)}
 helperText={errors.endDate}
 InputLabelProps={{ shrink: true }}
 required
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 type="number"
 label="Min Stay (Nights)"
 name="minStayNights"
 value={formData.minStayNights}
 onChange={handleChange}
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 type="number"
 label="Max Redemptions"
 name="maxRedemptions"
 value={formData.maxRedemptions}
 onChange={handleChange}
 sx={muiInputSx}
 />
 </div>
 </div>
 </div>

 </form>
 </DialogContent>

 {/* Actions */}
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
 form="discount-form"
 className="px-5 py-1.5 text-xs font-bold text-white bg-[#1b7f43] hover:bg-[#156736] rounded-lg shadow-xs transition cursor-pointer"
 >
 {isEdit ?'Save Changes' :'Create Discount'}
 </button>
 </DialogActions>
 </>
 );
}

export default function DiscountModal({
 open,
 onClose,
 discount,
 onSave
}) {
 const isEdit = Boolean(discount && discount.id);

 if (!open) return null;

 return (
 <Dialog
 open={open}
 onClose={onClose}
 maxWidth="md"
 fullWidth
 PaperProps={{
 sx: {
 borderRadius:'16px',
 overflow:'hidden',
 boxShadow:'0 20px 50px rgba(0,0,0,0.15)'
 }
 }}
 >
 {/* Header */}
 <div className="bg-[#1b7f43] p-3.5 px-4 text-white flex items-center justify-between">
 <div>
 <h2 className="text-base font-bold tracking-tight">
 {isEdit ?'Edit Discount Voucher' :'Create New Discount Voucher'}
 </h2>
 <p className="text-[11px] text-white/80 mt-0.5">
 {isEdit ?`Updating promo terms for ${discount.code}` :'Configure discount codes, rate plan markdown, and validity dates'}
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

 <DiscountFormBody
 key={discount?.id ||'new-discount'}
 discount={discount}
 onClose={onClose}
 onSave={onSave}
 />
 </Dialog>
 );
}
