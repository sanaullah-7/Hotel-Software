import React, { useState } from'react';
import { 
 Dialog, DialogContent, DialogActions, 
 IconButton, TextField, MenuItem, FormControl, InputLabel, Select 
} from'@mui/material';
import { Close, Inventory2 } from'@mui/icons-material';
import { 
 addInventoryItem, INVENTORY_CATEGORIES, ROOM_NUMBERS, STORAGE_LOCATIONS 
} from'../inventoryStore';

const muiSelectSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'6px',
 backgroundColor:'var(--bg-paper)',
 fontSize:'12px',
 color:'var(--text-primary)','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'var(--primary-main)', borderWidth:'1.5px' },
 },'& .MuiInputLabel-root': {
 fontSize:'12px',
 color:'var(--text-secondary)','&.Mui-focused': { color:'var(--primary-main)' }
 }
};

export default function AddStockItemModal({ open, onClose, onItemAdded }) {
 const [formData, setFormData] = useState({
 itemName:'',
 sku:`SKU-${Math.floor(100 + Math.random() * 900)}`,
 category:'Linens',
 locationType:'Room',
 roomNumber:'203',
 storageLocation: STORAGE_LOCATIONS[0],
 exactPlacement:'Main Room Area',
 quantity: 4,
 unitPrice: 15.00,
 minimumStock: 2,
 condition:'New',
 supplier:'Royal Linen & Textile Corp.',
 description:'',
 notes:''
 });

 const [errors, setErrors] = useState({});

 const validate = () => {
 const errs = {};
 if (!formData.itemName.trim()) errs.itemName ='Item name is required';
 if (Number(formData.quantity) < 0) errs.quantity ='Quantity cannot be negative';
 if (Number(formData.unitPrice) < 0) errs.unitPrice ='Price cannot be negative';
 setErrors(errs);
 return Object.keys(errs).length === 0;
 };

 const handleSubmit = (e) => {
 e.preventDefault();
 if (!validate()) return;

 const locationString = formData.locationType ==='Room'
 ?`Room ${formData.roomNumber} - ${formData.exactPlacement ||'General'}`
 :`${formData.storageLocation} ${formData.exactPlacement ?`(${formData.exactPlacement})` :''}`;

 addInventoryItem({
 itemName: formData.itemName.trim(),
 sku: formData.sku.trim(),
 category: formData.category,
 locationType: formData.locationType,
 roomNumber: formData.locationType ==='Room' ? formData.roomNumber :'-',
 location: locationString,
 quantity: Number(formData.quantity) || 0,
 unitPrice: Number(formData.unitPrice) || 0,
 minimumStock: Number(formData.minimumStock) || 0,
 condition: formData.condition,
 supplier: formData.supplier.trim(),
 description: formData.description.trim(),
 notes: formData.notes.trim()
 });

 if (onItemAdded) onItemAdded();
 onClose();
 };

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
 <Inventory2 sx={{ fontSize: 20 }} />
 <h2 className="text-base font-bold">Add Hotel Stock Item</h2>
 </div>
 <p className="text-[11px] text-white/80">Record new hotel-owned inventory in room or central storage</p>
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
 
 <div className="grid grid-cols-2 gap-2.5">
 <div className="col-span-2">
 <TextField 
 label="Item Name *" 
 size="small" 
 value={formData.itemName} 
 onChange={e => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
 error={Boolean(errors.itemName)}
 helperText={errors.itemName}
 placeholder="e.g. Bath Towel (Egyptian Cotton), 55 Inch Smart TV"
 sx={muiSelectSx} 
 fullWidth 
 />
 </div>

 <TextField 
 label="SKU Code" 
 size="small" 
 value={formData.sku} 
 onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
 sx={muiSelectSx} 
 fullWidth 
 />

 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Category</InputLabel>
 <Select 
 label="Category" 
 value={formData.category} 
 onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
 >
 {INVENTORY_CATEGORIES.filter(c => c !=='All Categories').map(c => (
 <MenuItem key={c} value={c}>{c}</MenuItem>
 ))}
 </Select>
 </FormControl>
 </div>

 {/* Location Type */}
 <div className="grid grid-cols-2 gap-2.5">
 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Location Type</InputLabel>
 <Select 
 label="Location Type" 
 value={formData.locationType} 
 onChange={e => setFormData(prev => ({ ...prev, locationType: e.target.value }))}
 >
 <MenuItem value="Room">Stationed in Guest Room</MenuItem>
 <MenuItem value="Storage">Central Hotel Storage</MenuItem>
 </Select>
 </FormControl>

 {formData.locationType ==='Room' ? (
 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Room Number</InputLabel>
 <Select 
 label="Room Number" 
 value={formData.roomNumber} 
 onChange={e => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
 >
 {ROOM_NUMBERS.map(r => (
 <MenuItem key={r} value={r}>Room {r}</MenuItem>
 ))}
 </Select>
 </FormControl>
 ) : (
 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Storage Facility</InputLabel>
 <Select 
 label="Storage Facility" 
 value={formData.storageLocation} 
 onChange={e => setFormData(prev => ({ ...prev, storageLocation: e.target.value }))}
 >
 {STORAGE_LOCATIONS.map(s => (
 <MenuItem key={s} value={s}>{s}</MenuItem>
 ))}
 </Select>
 </FormControl>
 )}
 </div>

 {/* Qty, Unit Price, Min Stock */}
 <div className="grid grid-cols-3 gap-2">
 <TextField 
 label="Quantity *" 
 type="number" 
 size="small" 
 value={formData.quantity} 
 onChange={e => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
 sx={muiSelectSx} 
 fullWidth 
 />

 <TextField 
 label="Unit Price ($)" 
 type="number" 
 size="small" 
 value={formData.unitPrice} 
 onChange={e => setFormData(prev => ({ ...prev, unitPrice: Number(e.target.value) }))}
 sx={muiSelectSx} 
 fullWidth 
 />

 <TextField 
 label="Min Stock Alert" 
 type="number" 
 size="small" 
 value={formData.minimumStock} 
 onChange={e => setFormData(prev => ({ ...prev, minimumStock: Number(e.target.value) }))}
 sx={muiSelectSx} 
 fullWidth 
 />
 </div>

 {/* Condition & Supplier */}
 <div className="grid grid-cols-2 gap-2.5">
 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Condition</InputLabel>
 <Select 
 label="Condition" 
 value={formData.condition} 
 onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value }))}
 >
 <MenuItem value="New">Brand New</MenuItem>
 <MenuItem value="Good">Good / Operational</MenuItem>
 <MenuItem value="Fair">Fair / Usable</MenuItem>
 <MenuItem value="Damaged">Damaged / Needs Repair</MenuItem>
 </Select>
 </FormControl>

 <TextField 
 label="Supplier / Brand" 
 size="small" 
 value={formData.supplier} 
 onChange={e => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
 sx={muiSelectSx} 
 fullWidth 
 />
 </div>

 {/* Notes */}
 <TextField 
 label="Stock Notes" 
 multiline 
 rows={2} 
 size="small" 
 value={formData.notes} 
 placeholder="e.g. Batch purchase reference, placement instructions..."
 onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
 sx={muiSelectSx} 
 fullWidth 
 />

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
 Save Stock Item
 </button>
 </DialogActions>
 </form>
 </Dialog>
 );
}
