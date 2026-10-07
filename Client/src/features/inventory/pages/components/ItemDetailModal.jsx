import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogActions, 
  IconButton, TextField, MenuItem, FormControl, InputLabel, Select, Alert, CircularProgress 
} from '@mui/material';
import { Close } from '@mui/icons-material';
import inventoryService from '../../../../services/inventoryService';
import { adaptInventoryItemToBackend } from '../../adapters/inventoryAdapter';

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

export default function ItemDetailModal({ 
  open, 
  onClose, 
  item, 
  onReportMissing, 
  onItemUpdated 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    quantity: item?.quantity || 0,
    condition: item?.condition || 'Good',
    status: item?.status || 'Available',
    notes: item?.notes || '',
    unitPrice: item?.unitPrice || 0,
    location: item?.location || ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        quantity: item.quantity,
        condition: item.condition,
        status: item.status,
        notes: item.notes || '',
        unitPrice: item.unitPrice,
        location: item.location
      });
      setIsEditing(false);
      setErrorMessage('');
    }
  }, [item]);

  if (!open || !item) return null;

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Update metadata via PATCH
      const metadataPayload = adaptInventoryItemToBackend({
        ...item,
        condition: formData.condition,
        notes: formData.notes,
        unitPrice: formData.unitPrice,
        location: formData.location,
        status: formData.status === 'Out of Stock' ? 'ACTIVE' : formData.status
      });
      await inventoryService.updateInventoryItem(item.id, metadataPayload);

      // 2. If quantity was changed in edit form, execute authoritative stock adjustment SET
      const originalQty = Number(item.quantity) || 0;
      const newQty = Number(formData.quantity) || 0;
      if (originalQty !== newQty) {
        await inventoryService.adjustStock(item.id, {
          adjustment_type: 'SET',
          quantity: newQty,
          reason: 'AUDIT',
          notes: 'Stock count updated via Item Detail modal'
        });
      }

      setIsEditing(false);
      if (onItemUpdated) onItemUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update inventory item:', err);
      setErrorMessage(err?.message || 'Failed to update inventory item.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to deactivate "${item.itemName}" from inventory records?`)) {
      setLoading(true);
      try {
        await inventoryService.deactivateInventoryItem(item.id);
        if (onItemUpdated) onItemUpdated();
        onClose();
      } catch (err) {
        setErrorMessage(err?.message || 'Failed to deactivate item.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Available</span>;
      case 'Low Stock':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Low Stock</span>;
      case 'Missing':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">Missing</span>;
      case 'Out of Stock':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">Out of Stock</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
        }
      }}
    >
      {/* Header */}
      <div className="bg-[#1b7f43] px-4 py-3 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">{item.itemName}</h2>
            <span className="bg-white/20 text-white text-[11px] font-mono px-1.5 py-0.5 rounded">
              {item.sku || item.id}
            </span>
          </div>
          <p className="text-[11px] text-white/80 mt-0.5">
            SKU: {item.sku} • Category: {item.category}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-2.5 py-1 bg-white/15 hover:bg-white/25 text-white rounded text-xs font-semibold transition cursor-pointer"
            >
              Edit Item
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-2.5 py-1 bg-white text-[#1b7f43] hover:bg-white/90 rounded text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </div>
      </div>

      <DialogContent sx={{ p: 2.5, backgroundColor: '#f9fafb' }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', fontSize: '12px' }}>
            {errorMessage}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main Info Column (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            {/* Overview Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item Details & Specs</h4>
              
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-gray-400 block text-[11px] font-medium">Category</span>
                  <span className="font-bold text-gray-800">{item.category}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] font-medium">Location Type</span>
                  <span className="font-bold text-gray-800">{item.locationType}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] font-medium">Room / Area</span>
                  <span className="font-bold text-gray-800">
                    {item.roomNumber && item.roomNumber !== '-' && item.roomNumber !== '—' ? `Room ${item.roomNumber}` : item.location}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] font-medium">Exact Placement</span>
                  <span className="font-semibold text-gray-700">{item.location}</span>
                </div>
              </div>

              {item.description && (
                <div className="pt-2 border-t border-gray-50">
                  <span className="text-gray-400 block text-[11px] font-medium mb-1">Description</span>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}
            </div>

            {/* Editable / Live Operational Fields Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {item.locationType === 'Room' ? `Room ${item.roomNumber} Allocation & Live Status` : 'Storage Inventory & Par Levels'}
              </h4>
              
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <TextField 
                    label={item.locationType === 'Room' ? 'Quantity Placed in Room' : 'Quantity in Storage'} 
                    type="number" 
                    size="small" 
                    value={formData.quantity} 
                    onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    sx={muiSelectSx} 
                    fullWidth 
                  />
                  <TextField 
                    label="Unit Price ($)" 
                    type="number" 
                    size="small" 
                    value={formData.unitPrice} 
                    onChange={e => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    sx={muiSelectSx} 
                    fullWidth 
                  />
                  <FormControl size="small" fullWidth sx={muiSelectSx}>
                    <InputLabel>Condition</InputLabel>
                    <Select 
                      label="Condition" 
                      value={formData.condition} 
                      onChange={e => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Good">Good</MenuItem>
                      <MenuItem value="Fair">Fair</MenuItem>
                      <MenuItem value="Damaged">Damaged</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth sx={muiSelectSx}>
                    <InputLabel>Status</InputLabel>
                    <Select 
                      label="Status" 
                      value={formData.status} 
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <MenuItem value="Available">Available</MenuItem>
                      <MenuItem value="Low Stock">Low Stock</MenuItem>
                      <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                    </Select>
                  </FormControl>
                  <div className="col-span-2">
                    <TextField 
                      label="Operational Notes" 
                      multiline 
                      rows={2} 
                      size="small" 
                      value={formData.notes} 
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      sx={muiSelectSx} 
                      fullWidth 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <span className="text-gray-400 block text-[11px] font-medium">
                      {item.locationType === 'Room' ? `Stationed in Room ${item.roomNumber}` : 'In Storage Stock'}
                    </span>
                    <span className="text-base font-extrabold text-gray-900">
                      {item.quantity} {item.quantity === 1 ? 'Unit' : 'Units'}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {item.locationType === 'Room' ? `Room Standard Par: ${item.minimumStock || 1}` : `Min Par Level: ${item.minimumStock}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px] font-medium">Condition</span>
                    <span className="font-bold text-gray-800">{item.condition}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px] font-medium">Operational Status</span>
                    <div className="mt-1">{getStatusBadge(item.status)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px] font-medium">Total Item Value</span>
                    <span className="text-base font-bold text-[#1b7f43]">
                      ${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                    </span>
                  </div>

                  {item.notes && (
                    <div className="col-span-2 pt-2 border-t border-gray-50">
                      <span className="text-gray-400 block text-[11px] font-medium mb-0.5">Notes</span>
                      <p className="text-xs text-gray-600 italic">"{item.notes}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Supplier & Actions Column (1 col) */}
          <div className="space-y-4">
            {/* Procurement Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Procurement</h4>
              <div className="space-y-2.5 text-[12px]">
                <div>
                  <span className="text-gray-400 block text-[10.5px] font-medium">Supplier</span>
                  <span className="font-bold text-gray-800">{item.supplier || 'Standard Procurement'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10.5px] font-medium">Unit Price</span>
                  <span className="font-bold text-gray-800">${Number(item.unitPrice).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10.5px] font-medium">Purchase Date</span>
                  <span className="text-gray-700 font-medium">{item.purchaseDate || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10.5px] font-medium">Last Audited</span>
                  <span className="text-gray-700 font-medium">{item.lastUpdated || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Incident Trigger Card */}
            {item.status !== 'Missing' ? (
              <div className="bg-red-50/70 p-3 rounded-lg border border-red-100 space-y-1.5">
                <span className="text-xs font-bold text-red-700 block">Report Missing Item</span>
                <p className="text-[11px] text-red-600/90 leading-tight">
                  Item not found during housekeeping turnaround? File an official incident ticket.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onReportMissing) onReportMissing(item);
                  }}
                  className="w-full mt-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition cursor-pointer"
                >
                  Create Incident Ticket
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <span className="text-xs font-bold text-amber-800 block mb-1">Active Incident</span>
                <p className="text-[11px] text-amber-700">
                  This item is currently flagged as missing. Check the "Missing Inventory" tab to track investigation and recovery.
                </p>
              </div>
            )}
          </div>

        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: 'white', borderTop: '1px solid #f3f4f6', justifyContent: 'space-between' }}>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          Deactivate Record
        </button>

        <button
          onClick={onClose}
          className="px-5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
        >
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
}
