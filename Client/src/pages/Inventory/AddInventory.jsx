import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowBack, Save, Inventory2, MeetingRoom, 
  Warehouse, AttachMoney, LocalShipping, NoteAlt, 
  CheckCircle, Refresh, Category, InfoOutlined
} from '@mui/icons-material';
import { 
  TextField, MenuItem, FormControl, InputLabel, Select, Alert, Snackbar 
} from '@mui/material';
import { 
  addInventoryItem, INVENTORY_CATEGORIES, ROOM_NUMBERS, STORAGE_LOCATIONS 
} from './inventoryStore';

const muiInputSx = {
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

export default function AddInventory() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemName: '',
    sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
    category: 'Bathroom',
    locationType: 'Room', // 'Room' | 'Storage' | 'Department'
    roomNumber: '203',
    storageLocation: STORAGE_LOCATIONS[0],
    exactPlacement: 'Bathroom Vanity',
    quantity: '4',
    unitPrice: '12.50',
    minimumStock: '2',
    condition: 'Good',
    supplier: 'Royal Linen & Textile Corp.',
    purchaseDate: new Date().toISOString().split('T')[0],
    description: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [successToastOpen, setSuccessToastOpen] = useState(false);

  const validateForm = () => {
    const errs = {};
    if (!formData.itemName.trim()) {
      errs.itemName = 'Item name is required.';
    }
    if (!formData.category) {
      errs.category = 'Category is required.';
    }
    if (formData.locationType === 'Room' && !formData.roomNumber) {
      errs.roomNumber = 'Room number is required for room-specific inventory.';
    }
    if (Number(formData.quantity) < 0 || formData.quantity === '') {
      errs.quantity = 'Quantity must be zero or a positive number.';
    }
    if (Number(formData.unitPrice) < 0 || formData.unitPrice === '') {
      errs.unitPrice = 'Unit price must be zero or a positive number.';
    }
    if (Number(formData.minimumStock) < 0) {
      errs.minimumStock = 'Minimum stock level must be zero or greater.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const locationString = formData.locationType === 'Room'
      ? `Room ${formData.roomNumber} - ${formData.exactPlacement || 'General'}`
      : `${formData.storageLocation} ${formData.exactPlacement ? `(${formData.exactPlacement})` : ''}`;

    const itemToSave = {
      itemName: formData.itemName.trim(),
      sku: formData.sku.trim(),
      category: formData.category,
      locationType: formData.locationType,
      roomNumber: formData.locationType === 'Room' ? formData.roomNumber : '-',
      location: locationString,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      minimumStock: Number(formData.minimumStock),
      condition: formData.condition,
      supplier: formData.supplier.trim(),
      purchaseDate: formData.purchaseDate,
      description: formData.description.trim(),
      notes: formData.notes.trim()
    };

    addInventoryItem(itemToSave);
    setSuccessToastOpen(true);

    setTimeout(() => {
      navigate('/inventory');
    }, 900);
  };

  return (
    <div className="animate-fade-in pb-12 space-y-4 max-w-[1600px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition shadow-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#1b7f43] hover:bg-[#166b37] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Save sx={{ fontSize: 16 }} />
            <span>Save Inventory Item</span>
          </button>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden mt-4">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-7">
          
          {/* SECTION 1: BASIC ITEM IDENTIFICATION */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <div className="p-1 rounded-md bg-[#e5f4eb] text-[#1b7f43]">
                <Inventory2 sx={{ fontSize: 18 }} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                1. Item Identification & Classification
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <TextField 
                  required 
                  label="Item Name" 
                  name="itemName" 
                  value={formData.itemName} 
                  onChange={handleChange} 
                  error={Boolean(errors.itemName)}
                  helperText={errors.itemName}
                  placeholder="e.g. Bath Towel (Egyptian Cotton), 55 Inch Smart TV, Hair Dryer"
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>

              <div>
                <TextField 
                  label="SKU / Barcode Reference" 
                  name="sku" 
                  value={formData.sku} 
                  onChange={handleChange} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>

              <div>
                <FormControl size="small" fullWidth sx={muiInputSx} error={Boolean(errors.category)}>
                  <InputLabel>Category *</InputLabel>
                  <Select 
                    name="category" 
                    value={formData.category} 
                    label="Category *" 
                    onChange={handleChange}
                  >
                    {INVENTORY_CATEGORIES.filter(c => c !== 'All Categories').map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Physical Condition</InputLabel>
                  <Select 
                    name="condition" 
                    value={formData.condition} 
                    label="Physical Condition" 
                    onChange={handleChange}
                  >
                    <MenuItem value="New">Brand New</MenuItem>
                    <MenuItem value="Good">Good / Operational</MenuItem>
                    <MenuItem value="Fair">Fair / Minor Wear</MenuItem>
                    <MenuItem value="Damaged">Damaged / Needs Servicing</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div>
                <TextField 
                  type="date" 
                  label="Purchase / Register Date" 
                  name="purchaseDate" 
                  value={formData.purchaseDate} 
                  onChange={handleChange} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputLabelProps={{ shrink: true }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION & ASSIGNMENT (ROOM VS STORAGE) */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <div className="p-1 rounded-md bg-blue-50 text-blue-600">
                <MeetingRoom sx={{ fontSize: 18 }} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                  2. Location Assignment & Placement
                </h3>
                <span className="text-[11px] text-gray-400 font-normal">
                  Specify whether this item is installed in a specific guest room or held in hotel-wide storage/closets.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Location Type Selector */}
              <div>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Location Type *</InputLabel>
                  <Select 
                    name="locationType" 
                    value={formData.locationType} 
                    label="Location Type *" 
                    onChange={handleChange}
                  >
                    <MenuItem value="Room">Room-Specific Inventory</MenuItem>
                    <MenuItem value="Storage">Central Storage / Depot</MenuItem>
                    <MenuItem value="Department">Department / Floor Closet</MenuItem>
                  </Select>
                </FormControl>
              </div>

              {/* Conditional Location Inputs */}
              {formData.locationType === 'Room' ? (
                <div>
                  <FormControl size="small" fullWidth sx={muiInputSx} error={Boolean(errors.roomNumber)}>
                    <InputLabel>Assign to Room *</InputLabel>
                    <Select 
                      name="roomNumber" 
                      value={formData.roomNumber} 
                      label="Assign to Room *" 
                      onChange={handleChange}
                    >
                      {ROOM_NUMBERS.map(room => (
                        <MenuItem key={room} value={room}>
                          Room {room}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              ) : (
                <div>
                  <FormControl size="small" fullWidth sx={muiInputSx}>
                    <InputLabel>Storage Facility / Department *</InputLabel>
                    <Select 
                      name="storageLocation" 
                      value={formData.storageLocation} 
                      label="Storage Facility / Department *" 
                      onChange={handleChange}
                    >
                      {STORAGE_LOCATIONS.map(loc => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              )}

              <div>
                <TextField 
                  label="Exact Placement / Sub-Location" 
                  name="exactPlacement" 
                  value={formData.exactPlacement} 
                  onChange={handleChange} 
                  placeholder={formData.locationType === 'Room' ? 'e.g. Bathroom vanity, Wall mount, Bed' : 'e.g. Shelf B2, Top Bin'}
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>

            </div>
          </div>

          {/* SECTION 3: STOCK QUANTITY & PRICING */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <div className="p-1 rounded-md bg-emerald-50 text-emerald-700">
                <AttachMoney sx={{ fontSize: 18 }} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                3. Stock Quantity, Thresholds & Valuation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <TextField 
                  required 
                  type="number" 
                  label="Quantity in Stock" 
                  name="quantity" 
                  value={formData.quantity} 
                  onChange={handleChange} 
                  inputProps={{ min: 0 }}
                  error={Boolean(errors.quantity)}
                  helperText={errors.quantity}
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>

              <div>
                <TextField 
                  required 
                  type="number" 
                  label="Unit Price ($ USD)" 
                  name="unitPrice" 
                  value={formData.unitPrice} 
                  onChange={handleChange} 
                  inputProps={{ min: 0, step: 0.01 }}
                  error={Boolean(errors.unitPrice)}
                  helperText={errors.unitPrice}
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>

              <div>
                <TextField 
                  type="number" 
                  label="Minimum Stock Threshold" 
                  name="minimumStock" 
                  value={formData.minimumStock} 
                  onChange={handleChange} 
                  inputProps={{ min: 0 }}
                  helperText="Alerts when stock drops to or below this level"
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>

              <div>
                <div className="bg-[#f9fafb] p-3 rounded-lg border border-gray-200">
                  <span className="text-[11px] text-gray-400 font-bold uppercase block">Computed Total Value</span>
                  <span className="text-lg font-black text-[#1b7f43]">
                    ${((Number(formData.quantity) || 0) * (Number(formData.unitPrice) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: PROCUREMENT & NOTES */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <div className="p-1 rounded-md bg-purple-50 text-purple-600">
                <LocalShipping sx={{ fontSize: 18 }} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                4. Supplier Details & Additional Notes
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField 
                  label="Supplier / Vendor Name" 
                  name="supplier" 
                  value={formData.supplier} 
                  onChange={handleChange} 
                  placeholder="e.g. Royal Linen Corp, Sony Hospitality"
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <TextField 
                  label="Brief Description / Specs" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="e.g. 600 GSM white plush bath towels with embroidered crest"
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>

              <TextField 
                label="Operational Notes / Maintenance Instructions" 
                name="notes" 
                value={formData.notes} 
                onChange={handleChange} 
                multiline 
                rows={2} 
                placeholder="Any handling instructions, warranty details, or re-stocking procedures..."
                sx={muiInputSx} 
                size="small" 
                fullWidth 
              />
            </div>
          </div>

          {/* FORM FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
            >
              Cancel & Discard
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1b7f43] hover:bg-[#166b37] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Save sx={{ fontSize: 16 }} />
              <span>Save & Register Item</span>
            </button>
          </div>

        </form>
      </div>

      {/* SUCCESS SNACKBAR */}
      <Snackbar
        open={successToastOpen}
        autoHideDuration={2000}
        onClose={() => setSuccessToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: '12px', fontWeight: 'bold' }}>
          Inventory item added successfully!
        </Alert>
      </Snackbar>

    </div>
  );
}
