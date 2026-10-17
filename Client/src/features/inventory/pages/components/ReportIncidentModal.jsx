import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogActions, 
  IconButton, TextField, MenuItem, FormControl, InputLabel, Select, Alert 
} from '@mui/material';
import { Close } from '@mui/icons-material';
import inventoryService from '../../../../services/inventoryService';
import roomService from '../../../../services/roomService';
import { adaptIncidentToBackend } from '../../adapters/inventoryAdapter';
import { INVENTORY_CATEGORIES } from '../inventoryStore';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: 'var(--bg-paper)',
    fontSize: '12px',
    color: 'var(--text-primary)',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--primary-main)' }
  }
};

export default function ReportIncidentModal({ 
  open, 
  onClose, 
  prefilledItem, 
  onIncidentCreated 
}) {
  const [allItems, setAllItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    itemName: '',
    roomNumber: '',
    category: 'Electronics',
    expectedQty: 2,
    quantity: 1,
    unitValue: 25.00,
    reportedBy: 'Housekeeping',
    reason: 'Item missing during room inspection following guest checkout.',
    assignedTo: 'Housekeeping Supervisor',
    guestName: '',
    notes: '',
    inventoryItemId: ''
  });

  useEffect(() => {
    if (open) {
      setApiError('');
      Promise.all([
        inventoryService.getInventoryItems({ limit: 200 }),
        roomService.getRooms({ limit: 200 }).catch(() => null)
      ])
        .then(([res, roomsRes]) => {
          let firstRoom = '';
          if (roomsRes) {
            const loadedRooms = Array.isArray(roomsRes?.data?.rooms)
              ? roomsRes.data.rooms
              : Array.isArray(roomsRes?.data)
                ? roomsRes.data
                : [];
            setRooms(loadedRooms);
            if (loadedRooms.length > 0) {
              firstRoom = String(loadedRooms[0].room_number || loadedRooms[0].roomNumber || '');
            }
          }

          if (res?.data && Array.isArray(res.data)) {
            setAllItems(res.data);
            if (!prefilledItem && res.data.length > 0) {
              setFormData(f => ({
                ...f,
                inventoryItemId: f.inventoryItemId || res.data[0]._id,
                itemName: f.itemName || res.data[0].name,
                unitValue: f.unitValue || res.data[0].unit_cost || 25,
                category: f.category || res.data[0].category || 'General',
                roomNumber: f.roomNumber || res.data[0].room_number || firstRoom
              }));
            } else if (firstRoom) {
              setFormData(f => ({ ...f, roomNumber: f.roomNumber || firstRoom }));
            }
          }
        })
        .catch(() => {});

      if (prefilledItem) {
        setFormData({
          itemName: prefilledItem.itemName || prefilledItem.name || '',
          roomNumber: prefilledItem.roomNumber || '203',
          category: prefilledItem.category || 'Electronics',
          expectedQty: prefilledItem.quantity ? prefilledItem.quantity + 1 : 2,
          quantity: 1,
          unitValue: prefilledItem.unitPrice || prefilledItem.unit_cost || 25.00,
          reportedBy: 'Housekeeping (Jane Smith)',
          reason: `Discovered missing from ${prefilledItem.location || 'room'}.`,
          assignedTo: 'Housekeeping Supervisor (Sarah M.)',
          guestName: '',
          notes: prefilledItem.notes || '',
          inventoryItemId: prefilledItem._id || prefilledItem.id
        });
      }
    }
  }, [open, prefilledItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');

    try {
      // Find item ID
      let itemId = formData.inventoryItemId;
      if (!itemId && allItems.length > 0) {
        const found = allItems.find(i => i.name.toLowerCase() === formData.itemName.toLowerCase());
        itemId = found ? found._id : allItems[0]._id;
      }

      if (!itemId) {
        throw new Error('Please select a valid inventory item to report.');
      }

      const payload = adaptIncidentToBackend({
        ...formData,
        inventoryItemId: itemId,
        missingQty: Number(formData.quantity) || 1,
        unitValue: Number(formData.unitValue) || 0,
        notes: formData.reason || formData.notes
      });

      await inventoryService.createIncident(payload);

      if (onIncidentCreated) onIncidentCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create incident:', err);
      setApiError(err?.message || 'Failed to report inventory incident.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
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
          sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
        >
          <Close sx={{ fontSize: 18 }} />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5, backgroundColor: '#f9fafb' }}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '12px' }}>
              {apiError}
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <div className="col-span-2">
              {allItems.length > 0 && !prefilledItem ? (
                <FormControl size="small" fullWidth sx={muiSelectSx}>
                  <InputLabel>Select Inventory Item *</InputLabel>
                  <Select
                    label="Select Inventory Item *"
                    value={formData.inventoryItemId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selected = allItems.find(i => i._id === selectedId);
                      setFormData(f => ({
                        ...f,
                        inventoryItemId: selectedId,
                        itemName: selected ? selected.name : f.itemName,
                        category: selected ? selected.category : f.category,
                        unitValue: selected ? selected.unit_cost : f.unitValue,
                        roomNumber: selected?.room_number || f.roomNumber
                      }));
                    }}
                  >
                    {allItems.map(it => (
                      <MenuItem key={it._id} value={it._id}>
                        {it.name} ({it.sku}) — {it.location_type === 'ROOM' ? `Room ${it.room_number || ''}` : 'Storage'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
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
              )}
            </div>

            <FormControl size="small" fullWidth sx={muiSelectSx}>
              <InputLabel>Room / Location</InputLabel>
              <Select 
                label="Room / Location" 
                value={formData.roomNumber} 
                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
              >
                {(() => {
                  const roomOptions = Array.from(
                    new Set([
                      ...rooms.map(r => String(r.room_number || r.roomNumber || '')).filter(Boolean),
                      ...allItems.map(i => String(i.room_number || i.roomNumber || '')).filter(Boolean),
                      ...(formData.roomNumber ? [formData.roomNumber] : [])
                    ])
                  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

                  if (roomOptions.length === 0) {
                    return <MenuItem disabled value="">No rooms configured</MenuItem>;
                  }

                  return roomOptions.map(r => (
                    <MenuItem key={r} value={r}>Room {r}</MenuItem>
                  ));
                })()}
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

        <DialogActions sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Create Incident'}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
