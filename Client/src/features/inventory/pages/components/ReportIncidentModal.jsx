import React, { useState } from'react';
import { 
 Dialog, DialogContent, DialogActions, 
 IconButton, TextField, MenuItem, FormControl, InputLabel, Select 
} from'@mui/material';
import { Close } from'@mui/icons-material';
import { addMissingIncident, ROOM_NUMBERS, INVENTORY_CATEGORIES } from'../inventoryStore';

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

export default function ReportIncidentModal({ 
 open, 
 onClose, 
 prefilledItem, 
 onIncidentCreated 
}) {
 const [formData, setFormData] = useState({
 itemName:'',
 roomNumber:'203',
 category:'Electronics',
 expectedQty: 2,
 quantity: 1,
 unitValue: 25.00,
 reportedBy:'Housekeeping (Jane Smith)',
 reason:'Item missing during room inspection following guest checkout.',
 assignedTo:'Housekeeping Supervisor (Sarah M.)',
 guestName:'',
 notes:'',
 inventoryItemId:''
 });

 React.useEffect(() => {
 if (prefilledItem) {
 setFormData({
 itemName: prefilledItem.itemName,
 roomNumber: prefilledItem.roomNumber ||'203',
 category: prefilledItem.category ||'Electronics',
 expectedQty: prefilledItem.quantity ? prefilledItem.quantity + 1 : 2,
 quantity: 1,
 unitValue: prefilledItem.unitPrice || 25.00,
 reportedBy:'Housekeeping (Jane Smith)',
 reason:`Discovered missing from ${prefilledItem.location ||'room'}.`,
 assignedTo:'Housekeeping Supervisor (Sarah M.)',
 guestName:'',
 notes: prefilledItem.notes ||'',
 inventoryItemId: prefilledItem.id
 });
 }
 }, [prefilledItem]);

 const handleSubmit = (e) => {
 e.preventDefault();
 addMissingIncident({
 ...formData,
 expectedQty: Number(formData.expectedQty) || 1,
 missingQty: Number(formData.quantity) || 1,
 location:`Room ${formData.roomNumber}`,
 condition:'Missing'
 });
 if (onIncidentCreated) onIncidentCreated();
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
 <div className="bg-red-600 px-4 py-3 text-white flex items-center justify-between">
 <div>
 <h2 className="text-base font-bold">Report Missing Hotel Item</h2>
 <p className="text-[11px] text-white/80">Log missing hotel-owned inventory for audit and investigation</p>
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
 <div className="grid grid-cols-2 gap-2.5">
 <div className="col-span-2">
 <TextField 
 required 
 label="Item Name" 
 size="small" 
 value={formData.itemName} 
 onChange={e => setFormData({ ...formData, itemName: e.target.value })}
 sx={muiSelectSx} 
 fullWidth 
 placeholder="e.g. TV Remote, Bath Towel, Kettle"
 />
 </div>

 <FormControl size="small" fullWidth sx={muiSelectSx}>
 <InputLabel>Room / Location</InputLabel>
 <Select 
 label="Room / Location" 
 value={formData.roomNumber} 
 onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
 >
 {ROOM_NUMBERS.map(r => (
 <MenuItem key={r} value={r}>Room {r}</MenuItem>
 ))}
 </Select>
 </FormControl>

 <FormControl size="small" fullWidth sx={muiSelectSx}>
 <InputLabel>Category</InputLabel>
 <Select 
 label="Category" 
 value={formData.category} 
 onChange={e => setFormData({ ...formData, category: e.target.value })}
 >
 {INVENTORY_CATEGORIES.filter(c => c !=='All Categories').map(c => (
 <MenuItem key={c} value={c}>{c}</MenuItem>
 ))}
 </Select>
 </FormControl>

 <TextField 
 required 
 type="number" 
 label="Expected Qty" 
 size="small" 
 value={formData.expectedQty} 
 inputProps={{ min: 1 }}
 onChange={e => setFormData({ ...formData, expectedQty: Number(e.target.value) })}
 sx={muiSelectSx} 
 fullWidth 
 />

 <TextField 
 required 
 type="number" 
 label="Missing Qty" 
 size="small" 
 value={formData.quantity} 
 inputProps={{ min: 1 }}
 onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
 sx={muiSelectSx} 
 fullWidth 
 />

 <div className="col-span-2">
 <TextField 
 required 
 type="number" 
 label="Est. Unit Loss Value ($ / Rs.)" 
 size="small" 
 value={formData.unitValue} 
 inputProps={{ min: 0, step: 0.01 }}
 onChange={e => setFormData({ ...formData, unitValue: Number(e.target.value) })}
 sx={muiSelectSx} 
 fullWidth 
 />
 </div>

 <TextField 
 label="Reported By" 
 size="small" 
 value={formData.reportedBy} 
 onChange={e => setFormData({ ...formData, reportedBy: e.target.value })}
 sx={muiSelectSx} 
 fullWidth 
 />

 <TextField 
 label="Assigned Investigator" 
 size="small" 
 value={formData.assignedTo} 
 onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
 sx={muiSelectSx} 
 fullWidth 
 />

 <div className="col-span-2">
 <TextField 
 label="Guest in Occupancy (Optional)" 
 size="small" 
 value={formData.guestName} 
 placeholder="e.g. John Doe (Res #1029)"
 onChange={e => setFormData({ ...formData, guestName: e.target.value })}
 sx={muiSelectSx} 
 fullWidth 
 />
 </div>

 <div className="col-span-2">
 <TextField 
 required
 label="Incident Reason / Findings" 
 multiline 
 rows={2} 
 size="small" 
 value={formData.reason} 
 onChange={e => setFormData({ ...formData, reason: e.target.value })}
 sx={muiSelectSx} 
 fullWidth 
 />
 </div>
 </div>
 </DialogContent>

 <DialogActions sx={{ p: 2, backgroundColor:'white', borderTop:'1px solid #f3f4f6' }}>
 <button
 type="button"
 onClick={onClose}
 className="px-3.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition shadow-xs cursor-pointer"
 >
 Create Incident
 </button>
 </DialogActions>
 </form>
 </Dialog>
 );
}
