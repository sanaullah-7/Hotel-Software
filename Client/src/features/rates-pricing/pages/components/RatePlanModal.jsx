import { useState } from'react';
import {
 Dialog, DialogContent, DialogActions,
 IconButton, TextField, MenuItem, FormControl, InputLabel, Select
} from'@mui/material';
import {
 Close, Sell, CheckCircle, InfoOutlined, MonetizationOn, Bed, Policy
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

function RatePlanFormBody({ plan, onClose, onSave }) {
 const isEdit = Boolean(plan && plan.id);

 const [formData, setFormData] = useState(() => ({
 name: plan?.name ||'',
 code: plan?.code ||'',
 description: plan?.description ||'',
 roomType: plan?.roomType ||'Deluxe Room',
 mealPlan: plan?.mealPlan ||'Room Only',
 baseRate: plan?.baseRate !== undefined ? plan.baseRate :'',
 currency: plan?.currency ||'PKR',
 pricingType: plan?.pricingType ||'Per Night',
 extraAdultRate: plan?.extraAdultRate !== undefined ? plan.extraAdultRate :'',
 extraChildRate: plan?.extraChildRate !== undefined ? plan.extraChildRate :'',
 cancellationPolicy: plan?.cancellationPolicy ||'Flexible',
 cancellationDetails: plan?.cancellationDetails ||'',
 minStayNights: plan?.minStayNights || 1,
 maxStayNights: plan?.maxStayNights || 30,
 status: plan?.status ||'Active'
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
 if (!formData.name.trim()) newErrors.name ='Rate Plan Name is required';
 if (!formData.code.trim()) newErrors.code ='Rate Code is required';
 if (!formData.baseRate || Number(formData.baseRate) <= 0) {
 newErrors.baseRate ='Valid base rate greater than 0 is required';
 }
 if (Number(formData.minStayNights) < 1) {
 newErrors.minStayNights ='Minimum stay must be at least 1 night';
 }
 if (Number(formData.maxStayNights) < Number(formData.minStayNights)) {
 newErrors.maxStayNights ='Max stay cannot be less than min stay';
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
 baseRate: Number(formData.baseRate),
 extraAdultRate: formData.extraAdultRate ? Number(formData.extraAdultRate) : 0,
 extraChildRate: formData.extraChildRate ? Number(formData.extraChildRate) : 0,
 minStayNights: Number(formData.minStayNights),
 maxStayNights: Number(formData.maxStayNights)
 };

 onSave(payload, isEdit ? plan.id : null);
 };

 return (
 <>
 {/* Form Content */}
 <DialogContent sx={{ p: 3, backgroundColor:'#f9fafb' }}>
 <form id="rate-plan-form" onSubmit={handleSubmit} className="space-y-3.5">
 
 {/* Basic Information */}
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Basic Information</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div className="md:col-span-2">
 <TextField
 fullWidth
 size="small"
 label="Rate Plan Name"
 name="name"
 value={formData.name}
 onChange={handleChange}
 error={Boolean(errors.name)}
 helperText={errors.name}
 required
 placeholder="e.g., Best Available Rate, Bed & Breakfast Special"
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 label="Rate Code"
 name="code"
 value={formData.code}
 onChange={handleChange}
 error={Boolean(errors.code)}
 helperText={errors.code}
 required
 placeholder="e.g., BAR, BBF, NRF"
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
 label="Description / Inclusions"
 name="description"
 value={formData.description}
 onChange={handleChange}
 placeholder="Describe key inclusions, complimentary perks, or terms..."
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
 </Select>
 </FormControl>
 </div>
 </div>
 </div>

 {/* Room & Meal Plan Information */}
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Room & Meal Inclusions</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Room Type</InputLabel>
 <Select
 name="roomType"
 value={formData.roomType}
 label="Room Type"
 onChange={handleChange}
 >
 <MenuItem value="All Room Types">All Room Types</MenuItem>
 <MenuItem value="Standard Room">Standard Room</MenuItem>
 <MenuItem value="Deluxe Room">Deluxe Room</MenuItem>
 <MenuItem value="Executive Suite">Executive Suite</MenuItem>
 <MenuItem value="Presidential Suite">Presidential Suite</MenuItem>
 </Select>
 </FormControl>

 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Meal Plan</InputLabel>
 <Select
 name="mealPlan"
 value={formData.mealPlan}
 label="Meal Plan"
 onChange={handleChange}
 >
 <MenuItem value="Room Only">Room Only</MenuItem>
 <MenuItem value="Breakfast Included">Breakfast Included</MenuItem>
 <MenuItem value="Breakfast + Dinner">Breakfast + Dinner</MenuItem>
 <MenuItem value="All Meals Included">All Meals Included</MenuItem>
 </Select>
 </FormControl>
 </div>
 </div>

 {/* Pricing Details */}
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Pricing Configuration</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div>
 <TextField
 fullWidth
 size="small"
 type="number"
 label="Base Rate (PKR)"
 name="baseRate"
 value={formData.baseRate}
 onChange={handleChange}
 error={Boolean(errors.baseRate)}
 helperText={errors.baseRate}
 required
 placeholder="12000"
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 type="number"
 label="Extra Adult Rate (PKR)"
 name="extraAdultRate"
 value={formData.extraAdultRate}
 onChange={handleChange}
 placeholder="2500"
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 type="number"
 label="Extra Child Rate (PKR)"
 name="extraChildRate"
 value={formData.extraChildRate}
 onChange={handleChange}
 placeholder="1200"
 sx={muiInputSx}
 />
 </div>
 </div>
 </div>

 {/* Policies & Restrictions */}
 <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs space-y-3">
 <div className="pb-1.5 border-b border-gray-100 text-gray-800">
 <h3 className="text-xs font-bold uppercase tracking-wider">Cancellation & Restrictions</h3>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div>
 <FormControl fullWidth size="small" sx={muiInputSx}>
 <InputLabel>Cancellation Policy</InputLabel>
 <Select
 name="cancellationPolicy"
 value={formData.cancellationPolicy}
 label="Cancellation Policy"
 onChange={handleChange}
 >
 <MenuItem value="Flexible">Flexible (Free cancellation 24h prior)</MenuItem>
 <MenuItem value="Moderate">Moderate (Free cancellation 3-5 days prior)</MenuItem>
 <MenuItem value="Strict">Strict (7 days notice required)</MenuItem>
 <MenuItem value="Non-Refundable">Non-Refundable (100% deposit charged)</MenuItem>
 </Select>
 </FormControl>
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
 error={Boolean(errors.minStayNights)}
 helperText={errors.minStayNights}
 sx={muiInputSx}
 />
 </div>

 <div>
 <TextField
 fullWidth
 size="small"
 type="number"
 label="Max Stay (Nights)"
 name="maxStayNights"
 value={formData.maxStayNights}
 onChange={handleChange}
 error={Boolean(errors.maxStayNights)}
 helperText={errors.maxStayNights}
 sx={muiInputSx}
 />
 </div>

 <div className="md:col-span-3">
 <TextField
 fullWidth
 multiline
 rows={2}
 size="small"
 label="Cancellation Policy Description"
 name="cancellationDetails"
 value={formData.cancellationDetails}
 onChange={handleChange}
 placeholder="Provide precise guest refund and penalty terms..."
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
 form="rate-plan-form"
 className="px-5 py-1.5 text-xs font-bold text-white bg-[#1b7f43] hover:bg-[#156736] rounded-lg shadow-xs transition cursor-pointer"
 >
 {isEdit ?'Save Changes' :'Create Rate Plan'}
 </button>
 </DialogActions>
 </>
 );
}

export default function RatePlanModal({
 open,
 onClose,
 plan,
 onSave
}) {
 const isEdit = Boolean(plan && plan.id);

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
 {isEdit ?'Edit Rate Plan' :'Create New Rate Plan'}
 </h2>
 <p className="text-[11px] text-white/80 mt-0.5">
 {isEdit ?`Modifying plan specifications for ${plan.code}` :'Configure pricing tiers, room categories, and meal plans'}
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

 <RatePlanFormBody
 key={plan?.id ||'new-rate-plan'}
 plan={plan}
 onClose={onClose}
 onSave={onSave}
 />
 </Dialog>
 );
}
