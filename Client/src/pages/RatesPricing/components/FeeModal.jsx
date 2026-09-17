import { useState } from 'react';
import {
  Dialog, DialogContent, DialogActions,
  IconButton, TextField, MenuItem, FormControl, InputLabel, Select,
  InputAdornment
} from '@mui/material';
import {
  Close, ReceiptLong, CheckCircle, InfoOutlined
} from '@mui/icons-material';

const muiInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    fontSize: '13px',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    color: '#6b7280',
    '&.Mui-focused': { color: '#1b7f43' }
  }
};

function FeeFormBody({ fee, onClose, onSave }) {
  const isEdit = Boolean(fee && fee.id);

  const [formData, setFormData] = useState(() => ({
    name: fee?.name || '',
    code: fee?.code || '',
    description: fee?.description || '',
    calculationType: fee?.calculationType || 'Fixed Amount',
    value: fee?.value !== undefined ? fee.value : '',
    appliesTo: fee?.appliesTo || 'Per Booking',
    currency: fee?.currency || 'PKR',
    status: fee?.status || 'Active'
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
    if (!formData.name.trim()) newErrors.name = 'Fee Name is required';
    if (!formData.code.trim()) newErrors.code = 'Fee Code is required';
    
    const val = Number(formData.value);
    if (!formData.value || isNaN(val) || val <= 0) {
      newErrors.value = 'Please enter a valid positive fee amount';
    } else if (formData.calculationType === 'Percentage' && val > 100) {
      newErrors.value = 'Percentage fee cannot exceed 100%';
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
      value: Number(formData.value)
    };

    onSave(payload, isEdit ? fee.id : null);
  };

  return (
    <>
      <DialogContent sx={{ p: 4, backgroundColor: '#f9fafb' }}>
        <form id="fee-form" onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-gray-800">
              <InfoOutlined sx={{ fontSize: 18, color: '#1b7f43' }} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Fee Specifications</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <TextField
                    fullWidth
                    size="small"
                    label="Fee Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    required
                    placeholder="e.g., Hotel Service Charge, Extra Bed Fee"
                    sx={muiInputSx}
                  />
                </div>

                <div>
                  <TextField
                    fullWidth
                    size="small"
                    label="Fee Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    error={Boolean(errors.code)}
                    helperText={errors.code}
                    required
                    placeholder="e.g., SERVICE10, EXTRABED"
                    inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 } }}
                    sx={muiInputSx}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormControl fullWidth size="small" sx={muiInputSx}>
                  <InputLabel>Calculation Type</InputLabel>
                  <Select
                    name="calculationType"
                    value={formData.calculationType}
                    label="Calculation Type"
                    onChange={handleChange}
                  >
                    <MenuItem value="Fixed Amount">Fixed Amount (PKR)</MenuItem>
                    <MenuItem value="Percentage">Percentage (%)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label={formData.calculationType === 'Percentage' ? 'Fee Percentage (%)' : 'Fee Amount (PKR)'}
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  error={Boolean(errors.value)}
                  helperText={errors.value}
                  required
                  placeholder={formData.calculationType === 'Percentage' ? '10' : '2000'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <span className="text-xs font-bold text-gray-500">
                          {formData.calculationType === 'Percentage' ? '%' : 'PKR'}
                        </span>
                      </InputAdornment>
                    )
                  }}
                  sx={muiInputSx}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormControl fullWidth size="small" sx={muiInputSx}>
                  <InputLabel>Applies To</InputLabel>
                  <Select
                    name="appliesTo"
                    value={formData.appliesTo}
                    label="Applies To"
                    onChange={handleChange}
                  >
                    <MenuItem value="Per Booking">Per Booking</MenuItem>
                    <MenuItem value="Per Night">Per Night</MenuItem>
                    <MenuItem value="Per Guest">Per Guest</MenuItem>
                    <MenuItem value="Total Bill">Total Bill</MenuItem>
                    <MenuItem value="Room Service">Room Service</MenuItem>
                  </Select>
                </FormControl>

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

              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Fee Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain what this fee covers, terms of application, or billing notes..."
                sx={muiInputSx}
              />
            </div>
          </div>

        </form>
      </DialogContent>

      <DialogActions sx={{ p: 3, backgroundColor: 'white', borderTop: '1px solid #f3f4f6', justifyContent: 'flex-end', gap: 1 }}>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          form="fee-form"
          className="px-6 py-2 text-xs font-bold text-white bg-[#1b7f43] hover:bg-[#156736] rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle sx={{ fontSize: 16 }} />
          {isEdit ? 'Save Changes' : 'Create Fee'}
        </button>
      </DialogActions>
    </>
  );
}

export default function FeeModal({
  open,
  onClose,
  fee,
  onSave
}) {
  const isEdit = Boolean(fee && fee.id);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
        }
      }}
    >
      <div className="bg-[#1b7f43] p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs">
            <ReceiptLong sx={{ fontSize: 22 }} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {isEdit ? 'Edit Fee Item' : 'Create New Fee Surcharge'}
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              {isEdit ? `Updating charge details for ${fee.code}` : 'Set operational service fees, surcharges, and guest facility rates'}
            </p>
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

      <FeeFormBody
        key={fee?.id || 'new-fee'}
        fee={fee}
        onClose={onClose}
        onSave={onSave}
      />
    </Dialog>
  );
}
