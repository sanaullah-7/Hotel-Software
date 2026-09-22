import React, { useState, useEffect } from'react';
import { 
 Dialog, DialogContent, DialogActions, 
 IconButton, TextField, MenuItem, FormControl, InputLabel, Select 
} from'@mui/material';
import { Close, Receipt } from'@mui/icons-material';
import { 
 addGuestCharge, getInventoryItems, ROOM_NUMBERS 
} from'../inventoryStore';

const muiSelectSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'6px',
 backgroundColor:'#ffffff',
 fontSize:'12px',
 color:'#1f2937','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'#1b7f43', borderWidth:'1.5px' },
 },'& .MuiInputLabel-root': {
 fontSize:'12px',
 color:'#6b7280','&.Mui-focused': { color:'#1b7f43' }
 }
};

const SUGGESTED_GUESTS = [
 { name:'Ahmed Khan', room:'205' },
 { name:'John Smith', room:'302' },
 { name:'Sarah Johnson', room:'101' },
 { name:'David Miller', room:'201' },
 { name:'Elena Rostova', room:'301' },
 { name:'Robert Vance', room:'203' },
 { name:'Carlos Rodriguez', room:'102' },
 { name:'Sophia Montgomery', room:'204' }
];

export default function AddGuestChargeModal({
 open,
 onClose,
 prefilledData = null,
 onChargeAdded
}) {
 const [inventoryItems, setInventoryItems] = useState([]);
 
 const [formData, setFormData] = useState({
 guestName:'Ahmed Khan',
 roomNumber:'205',
 chargeType:'Consumption',
 selectedInventoryId:'',
 itemName:'Coca-Cola (330ml Can)',
 quantity: 1,
 unitPrice: 150,
 status:'Added to Folio',
 notes:''
 });

 const [errors, setErrors] = useState({});

 useEffect(() => {
 const items = getInventoryItems();
 setInventoryItems(items);
 }, [open]);

 useEffect(() => {
 if (prefilledData) {
 setFormData({
 guestName: prefilledData.guestName ||'Ahmed Khan',
 roomNumber: prefilledData.roomNumber ||'205',
 chargeType: prefilledData.chargeType ||'Damage',
 selectedInventoryId: prefilledData.inventoryItemId ||'',
 itemName: prefilledData.itemName ||'',
 quantity: prefilledData.quantity || 1,
 unitPrice: prefilledData.unitPrice || 0,
 status: prefilledData.status ||'Added to Folio',
 notes: prefilledData.notes ||''
 });
 }
 }, [prefilledData, open]);

 const handleGuestSelect = (guestName) => {
 const matched = SUGGESTED_GUESTS.find(g => g.name === guestName);
 if (matched) {
 setFormData(prev => ({
 ...prev,
 guestName: matched.name,
 roomNumber: matched.room
 }));
 } else {
 setFormData(prev => ({ ...prev, guestName }));
 }
 };

 const handleChargeTypeChange = (type) => {
 setFormData(prev => {
 let defaultItem = prev.itemName;
 let defaultPrice = prev.unitPrice;
 let defaultInvId = prev.selectedInventoryId;

 if (type ==='Consumption') {
 defaultItem = defaultItem ||'Minibar Beverage';
 if (defaultPrice === 0) defaultPrice = 150;
 } else if (type ==='Damage') {
 defaultItem = defaultItem ||'Damaged Hotel Linen';
 if (defaultPrice === 0) defaultPrice = 2500;
 } else if (type ==='External Order') {
 defaultItem ='External Pizza / Food Order';
 defaultPrice = 2000;
 defaultInvId ='';
 } else if (type ==='Other') {
 defaultItem ='Guest Laundry Service';
 defaultPrice = 1200;
 defaultInvId ='';
 }

 return {
 ...prev,
 chargeType: type,
 itemName: defaultItem,
 unitPrice: defaultPrice,
 selectedInventoryId: defaultInvId
 };
 });
 };

 const handleInventoryItemSelect = (itemId) => {
 if (!itemId) {
 setFormData(prev => ({ ...prev, selectedInventoryId:'' }));
 return;
 }
 const item = inventoryItems.find(i => i.id === itemId);
 if (item) {
 setFormData(prev => ({
 ...prev,
 selectedInventoryId: item.id,
 itemName: item.itemName,
 unitPrice: item.unitPrice
 }));
 }
 };

 const validate = () => {
 const errs = {};
 if (!formData.guestName.trim()) errs.guestName ='Guest name is required';
 if (!formData.roomNumber) errs.roomNumber ='Room number is required';
 if (!formData.itemName.trim()) errs.itemName ='Item or charge description is required';
 if (Number(formData.quantity) <= 0) errs.quantity ='Quantity must be at least 1';
 if (Number(formData.unitPrice) < 0) errs.unitPrice ='Price cannot be negative';
 setErrors(errs);
 return Object.keys(errs).length === 0;
 };

 const handleSubmit = (e) => {
 e.preventDefault();
 if (!validate()) return;

 const totalAmount = (Number(formData.quantity) || 1) * (Number(formData.unitPrice) || 0);

 const chargePayload = {
 guestName: formData.guestName.trim(),
 roomNumber: formData.roomNumber,
 chargeType: formData.chargeType,
 itemName: formData.itemName.trim(),
 inventoryItemId: (formData.chargeType ==='Consumption' || formData.chargeType ==='Damage') ? formData.selectedInventoryId || null : null,
 quantity: Number(formData.quantity) || 1,
 unitPrice: Number(formData.unitPrice) || 0,
 amount: totalAmount,
 status: formData.status,
 date:'Today',
 reportedDate: new Date().toISOString().split('T')[0],
 folioId:`FOL-${formData.roomNumber}-${Math.floor(10 + Math.random() * 90)}`,
 notes: formData.notes.trim()
 };

 addGuestCharge(chargePayload);

 if (onChargeAdded) onChargeAdded();
 onClose();
 };

 const totalCalculated = (Number(formData.quantity) || 1) * (Number(formData.unitPrice) || 0);

 return (
 <Dialog 
 open={open} 
 onClose={onClose} 
 maxWidth="sm" 
 fullWidth
 PaperProps={{
 sx: { 
 borderRadius:'12px',
 overflow:'hidden',
 boxShadow:'0 10px 25px rgba(0,0,0,0.1)' 
 }
 }}
 >
 <div className="bg-[#1b7f43] px-4 py-3 text-white flex items-center justify-between">
 <div>
 <div className="flex items-center gap-2">
 <Receipt sx={{ fontSize: 20 }} />
 <h2 className="text-base font-bold">Record Guest Folio Charge</h2>
 </div>
 <p className="text-[11px] text-white/80">Add consumption, damage, external order, or service charge to guest's folio</p>
 </div>
 <IconButton 
 onClick={onClose} 
 size="small" 
 sx={{ color:'white','&:hover': { backgroundColor:'rgba(255,255,255,0.2)' } }}
 >
 <Close sx={{ fontSize: 18 }} />
 </IconButton>
 </div>

 <form onSubmit={handleSubmit}>
 <DialogContent sx={{ p: 2.5, backgroundColor:'#f9fafb' }}>
 <div className="space-y-3">
 
 {/* Quick Guest Bar */}
 <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-xs">
 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
 Quick Occupant Select:
 </span>
 <div className="flex flex-wrap gap-1">
 {SUGGESTED_GUESTS.map((g) => (
 <button
 key={g.name}
 type="button"
 onClick={() => handleGuestSelect(g.name)}
 className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
 formData.guestName === g.name 
 ?'bg-[#1b7f43] text-white' 
 :'bg-gray-100 hover:bg-gray-200 text-gray-700'
 }`}
 >
 {g.name} (Rm {g.room})
 </button>
 ))}
 </div>
 </div>

 {/* Guest Name & Room */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 <TextField 
 label="Guest Name *" 
 size="small" 
 value={formData.guestName} 
 onChange={e => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
 error={Boolean(errors.guestName)}
 helperText={errors.guestName}
 sx={muiSelectSx} 
 fullWidth 
 />

 <FormControl fullWidth size="small" sx={muiSelectSx} error={Boolean(errors.roomNumber)}>
 <InputLabel>Room Number *</InputLabel>
 <Select 
 label="Room Number *" 
 value={formData.roomNumber} 
 onChange={e => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
 >
 {ROOM_NUMBERS.map(r => (
 <MenuItem key={r} value={r}>Room {r}</MenuItem>
 ))}
 </Select>
 </FormControl>
 </div>

 {/* Charge Type */}
 <div>
 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Charge Type *</InputLabel>
 <Select 
 label="Charge Type *" 
 value={formData.chargeType} 
 onChange={e => handleChargeTypeChange(e.target.value)}
 >
 <MenuItem value="Consumption">Consumption (Minibar, Room Items, Snacks)</MenuItem>
 <MenuItem value="Damage">Damage (Broken Item, Stained Linen, Property)</MenuItem>
 <MenuItem value="External Order">External Order (Food Delivery, External Taxi, Concierge)</MenuItem>
 <MenuItem value="Other">Other (Laundry, Extra Service, Late Checkout)</MenuItem>
 </Select>
 </FormControl>
 </div>

 {/* Hotel Inventory Item (When Consumption or Damage) */}
 {(formData.chargeType ==='Consumption' || formData.chargeType ==='Damage') && (
 <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
 <span className="text-[10.5px] font-bold text-[#1b7f43] block mb-1.5">
 Link to Hotel Inventory Stock (Auto-pricing & stock deduction):
 </span>
 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Select Hotel Stock Item</InputLabel>
 <Select 
 label="Select Hotel Stock Item" 
 value={formData.selectedInventoryId} 
 onChange={e => handleInventoryItemSelect(e.target.value)}
 >
 <MenuItem value="">Custom / Unlisted Item</MenuItem>
 {inventoryItems.map(item => (
 <MenuItem key={item.id} value={item.id}>
 {item.itemName} ({item.category} • Rs. {item.unitPrice})
 </MenuItem>
 ))}
 </Select>
 </FormControl>
 </div>
 )}

 {/* Charge Item / Description */}
 <TextField 
 label="Charge / Item Description *" 
 size="small" 
 value={formData.itemName} 
 placeholder="e.g. Coca-Cola, Bedsheet, Pizza Order, Laundry..."
 onChange={e => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
 error={Boolean(errors.itemName)}
 helperText={errors.itemName}
 sx={muiSelectSx} 
 fullWidth 
 />

 {/* Qty, Unit Price & Total Amount */}
 <div className="grid grid-cols-3 gap-2 items-center">
 <TextField 
 label="Quantity *" 
 type="number" 
 size="small" 
 value={formData.quantity} 
 onChange={e => setFormData(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
 error={Boolean(errors.quantity)}
 sx={muiSelectSx} 
 fullWidth 
 />

 <TextField 
 label="Unit Price / Rate *" 
 type="number" 
 size="small" 
 value={formData.unitPrice} 
 onChange={e => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
 error={Boolean(errors.unitPrice)}
 sx={muiSelectSx} 
 fullWidth 
 />

 <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
 <span className="text-[10px] font-bold text-gray-400 block uppercase">Total Charge</span>
 <span className="text-sm font-extrabold text-[#1b7f43] block">
 Rs. {totalCalculated.toLocaleString()}
 </span>
 </div>
 </div>

 {/* Folio Status */}
 <div>
 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Folio Billing Status *</InputLabel>
 <Select 
 label="Folio Billing Status *" 
 value={formData.status} 
 onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
 >
 <MenuItem value="Added to Folio">Added to Folio (Billed to Room Account)</MenuItem>
 <MenuItem value="Pending">Pending (Awaiting Guest Approval)</MenuItem>
 <MenuItem value="Paid">Paid (Immediately Settled)</MenuItem>
 </Select>
 </FormControl>
 </div>

 {/* Notes / Folio Remarks */}
 <TextField 
 label="Folio Notes / Remarks" 
 multiline 
 rows={2} 
 size="small" 
 value={formData.notes} 
 placeholder="e.g. Minibar checkout audit, vendor receipt reference, damage inspection report..."
 onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
 sx={muiSelectSx} 
 fullWidth 
 />

 {/* Explanation Note */}
 <div className="text-[10.5px] text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-1.5">
 <span className="font-bold text-gray-700">Folio Pipeline:</span>
 <span>Guest Charge → Room Folio → Master Invoice → Checkout Settlement.</span>
 </div>

 </div>
 </DialogContent>

 <DialogActions sx={{ p: 2, backgroundColor:'white', borderTop:'1px solid #f3f4f6' }}>
 <button
 type="button"
 onClick={onClose}
 className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-4 py-1.5 text-xs font-bold text-white bg-[#1b7f43] hover:bg-[#166b37] rounded transition cursor-pointer shadow-xs"
 >
 Save & Add to Guest Folio
 </button>
 </DialogActions>
 </form>
 </Dialog>
 );
}
