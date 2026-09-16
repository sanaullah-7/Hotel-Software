import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  IconButton, TextField, MenuItem, FormControl, InputLabel, Select 
} from '@mui/material';
import { 
  Close, ReportProblem, Save, MeetingRoom, Inventory2 
} from '@mui/icons-material';
import { addMissingIncident, ROOM_NUMBERS, INVENTORY_CATEGORIES } from '../inventoryStore';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12.5px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '12.5px',
    color: '#6b7280',
    '&.Mui-focused': { color: '#1b7f43' }
  }
};

export default function ReportIncidentModal({ 
  open, 
  onClose, 
  prefilledItem, 
  onIncidentCreated 
}) {
  const [formData, setFormData] = useState({
    itemName: '',
    roomNumber: '203',
    category: 'Electronics',
    quantity: 1,
    unitValue: 25.00,
    reportedBy: 'Housekeeping (Jane Smith)',
    reason: 'Item missing during room inspection following guest checkout.',
    assignedTo: 'Housekeeping Supervisor (Sarah M.)',
    guestName: '',
    notes: '',
    inventoryItemId: ''
  });

  React.useEffect(() => {
    if (prefilledItem) {
      setFormData({
        itemName: prefilledItem.itemName,
        roomNumber: prefilledItem.roomNumber || '203',
        category: prefilledItem.category || 'Electronics',
        quantity: 1,
        unitValue: prefilledItem.unitPrice || 25.00,
        reportedBy: 'Housekeeping (Jane Smith)',
        reason: `Discovered missing from ${prefilledItem.location || 'room'}.`,
        assignedTo: 'Housekeeping Supervisor (Sarah M.)',
        guestName: '',
        notes: prefilledItem.notes || '',
        inventoryItemId: prefilledItem.id
      });
    }
  }, [prefilledItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    addMissingIncident(formData);
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
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)' 
        }
      }}
    >
      <div className="bg-gradient-to-r from-red-600 to-rose-700 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <ReportProblem sx={{ fontSize: 22 }} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Report Missing Inventory Incident</h2>
            <p className="text-xs text-white/80">Log a missing item and start the investigation workflow</p>
          </div>
        </div>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3, backgroundColor: '#f9fafb' }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
              <InputLabel>Room Number</InputLabel>
              <Select 
                label="Room Number" 
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
                {INVENTORY_CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField 
              required 
              type="number" 
              label="Missing Quantity" 
              size="small" 
              value={formData.quantity} 
              inputProps={{ min: 1 }}
              onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
              sx={muiSelectSx} 
              fullWidth 
            />

            <TextField 
              required 
              type="number" 
              label="Est. Unit Value ($)" 
              size="small" 
              value={formData.unitValue} 
              inputProps={{ min: 0, step: 0.01 }}
              onChange={e => setFormData({ ...formData, unitValue: Number(e.target.value) })}
              sx={muiSelectSx} 
              fullWidth 
            />

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

        <DialogActions sx={{ p: 2.5, backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <ReportProblem sx={{ fontSize: 16 }} /> Create Incident
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
