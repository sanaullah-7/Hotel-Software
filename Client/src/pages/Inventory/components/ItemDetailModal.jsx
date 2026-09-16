import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  IconButton, Divider, TextField, MenuItem, FormControl, InputLabel, Select 
} from '@mui/material';
import { 
  Close, Inventory2, Edit, Save, MeetingRoom, 
  Storefront, CalendarToday, LocalShipping, AttachMoney, 
  ReportProblem, CheckCircle, Warning, InfoOutlined, Warehouse
} from '@mui/icons-material';
import { updateInventoryItem, deleteInventoryItem, getStorageReserveForItem, getInventoryItems } from '../inventoryStore';

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

export default function ItemDetailModal({ 
  open, 
  onClose, 
  item, 
  onReportMissing, 
  onItemUpdated 
}) {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    quantity: item.quantity,
    condition: item.condition,
    status: item.status,
    notes: item.notes || '',
    unitPrice: item.unitPrice,
    location: item.location
  });

  React.useEffect(() => {
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
    }
  }, [item]);

  const handleSave = () => {
    updateInventoryItem(item.id, formData);
    setIsEditing(false);
    if (onItemUpdated) onItemUpdated();
    onClose();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Available</span>;
      case 'Low Stock':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Low Stock</span>;
      case 'Missing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">Missing</span>;
      case 'Out of Stock':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Out of Stock</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
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
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)' 
        }
      }}
    >
      {/* Header */}
      <div className="bg-[#1b7f43] p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
            <Inventory2 sx={{ fontSize: 24 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{item.itemName}</h2>
              <span className="bg-white/20 text-white text-[11px] font-mono px-2 py-0.5 rounded-md">
                {item.id}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-0.5">
              SKU: {item.sku} • Category: {item.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold transition cursor-pointer mr-2"
            >
              <Edit sx={{ fontSize: 14 }} /> Edit Item
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-[#1b7f43] hover:bg-white/90 rounded-lg text-xs font-bold transition cursor-pointer mr-2 shadow-sm"
            >
              <Save sx={{ fontSize: 14 }} /> Save Changes
            </button>
          )}
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </div>

      <DialogContent sx={{ p: 3, backgroundColor: '#f9fafb' }}>
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
                    {item.roomNumber && item.roomNumber !== '-' ? `Room ${item.roomNumber}` : item.location}
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
                      <MenuItem value="Broken">Broken</MenuItem>
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
                      <MenuItem value="Missing">Missing</MenuItem>
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

          {/* Supplier & Audit Trail Column (1 col) */}
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

            {/* Hotel Storage Reserve Card (for Room Items) */}
            {item.locationType === 'Room' && (() => {
              const storageReserve = getStorageReserveForItem(item, getInventoryItems());
              if (!storageReserve) return null;
              return (
                <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                    <Warehouse sx={{ fontSize: 16 }} />
                    <span>Hotel Reserve Stock</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-snug">
                    <strong>{storageReserve.availableUnits} units</strong> available in {storageReserve.location} for immediate room replenishment.
                  </p>
                </div>
              );
            })()}

            {/* Incident Trigger Card */}
            {item.status !== 'Missing' ? (
              <div className="bg-red-50/70 p-4 rounded-xl border border-red-100 space-y-2">
                <div className="flex items-center gap-1.5 text-red-700">
                  <ReportProblem sx={{ fontSize: 16 }} />
                  <span className="text-xs font-bold">Report Missing Item</span>
                </div>
                <p className="text-[11px] text-red-600/90 leading-tight">
                  Item not found during housekeeping turnaround? File an official incident ticket.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onReportMissing) onReportMissing(item);
                  }}
                  className="w-full mt-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Create Incident Ticket
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
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
          onClick={() => {
            if (window.confirm(`Are you sure you want to remove "${item.itemName}" from inventory records?`)) {
              deleteInventoryItem(item.id);
              if (onItemUpdated) onItemUpdated();
              onClose();
            }
          }}
          className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
        >
          Delete Record
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
