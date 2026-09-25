import React, { useState } from 'react';
import { 
  Refresh, PictureAsPdf, EditOutlined, DeleteOutlined, Close, Search, 
  KeyboardArrowLeft, KeyboardArrowRight, TableChart, AddCircleOutlined 
} from '@mui/icons-material';
import { 
  TextField, FormControl, InputLabel, Select, MenuItem,
  Typography, Box
} from '@mui/material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const initialRates = [
  { id: 1, roomType: 'Single', ratePlan: 'Standard', baseRate: 50, seasonalRate: 55, promotionalRate: 45, effectiveDate: '2024-01-01', endDate: '2024-12-31', status: 'Active', bookingWindow: '30 days', cancellationPolicy: '24-hour notice', minStay: '1 night', maxOccupancy: 1 },
  { id: 2, roomType: 'Double', ratePlan: 'Standard', baseRate: 75, seasonalRate: 85, promotionalRate: 70, effectiveDate: '2024-01-01', endDate: '2024-12-31', status: 'Inactive', bookingWindow: '30 days', cancellationPolicy: '24-hour notice', minStay: '1 night', maxOccupancy: 2 },
  { id: 3, roomType: 'Suite', ratePlan: 'Standard', baseRate: 120, seasonalRate: 140, promotionalRate: 110, effectiveDate: '2024-01-01', endDate: '2024-12-31', status: 'Active', bookingWindow: '30 days', cancellationPolicy: '48-hour notice', minStay: '2 nights', maxOccupancy: 4 },
  { id: 4, roomType: 'Single', ratePlan: 'Promotional', baseRate: 45, seasonalRate: 50, promotionalRate: 40, effectiveDate: '2024-03-01', endDate: '2024-05-31', status: 'Inactive', bookingWindow: '15 days', cancellationPolicy: 'Non-refundable', minStay: '2 nights', maxOccupancy: 1 },
  { id: 5, roomType: 'Double', ratePlan: 'Promotional', baseRate: 70, seasonalRate: 80, promotionalRate: 65, effectiveDate: '2024-03-01', endDate: '2024-05-31', status: 'Inactive', bookingWindow: '15 days', cancellationPolicy: 'Non-refundable', minStay: '2 nights', maxOccupancy: 2 },
  { id: 6, roomType: 'Suite', ratePlan: 'Promotional', baseRate: 110, seasonalRate: 130, promotionalRate: 100, effectiveDate: '2024-03-01', endDate: '2024-05-31', status: 'Active', bookingWindow: '15 days', cancellationPolicy: 'Non-refundable', minStay: '3 nights', maxOccupancy: 4 },
  { id: 7, roomType: 'Single', ratePlan: 'Corporate', baseRate: 60, seasonalRate: 65, promotionalRate: 55, effectiveDate: '2024-01-01', endDate: '2024-12-31', status: 'Inactive', bookingWindow: 'Any', cancellationPolicy: 'Flexible', minStay: '1 night', maxOccupancy: 1 },
  { id: 8, roomType: 'Double', ratePlan: 'Corporate', baseRate: 85, seasonalRate: 95, promotionalRate: 80, effectiveDate: '2024-01-01', endDate: '2024-12-31', status: 'Inactive', bookingWindow: 'Any', cancellationPolicy: 'Flexible', minStay: '1 night', maxOccupancy: 2 },
  { id: 9, roomType: 'Suite', ratePlan: 'Corporate', baseRate: 140, seasonalRate: 160, promotionalRate: 130, effectiveDate: '2024-01-01', endDate: '2024-12-31', status: 'Active', bookingWindow: 'Any', cancellationPolicy: 'Flexible', minStay: '1 night', maxOccupancy: 4 },
  { id: 10, roomType: 'Single', ratePlan: 'Weekend', baseRate: 55, seasonalRate: 60, promotionalRate: 50, effectiveDate: '2024-06-01', endDate: '2024-08-31', status: 'Inactive', bookingWindow: '14 days', cancellationPolicy: '48-hour notice', minStay: '2 nights', maxOccupancy: 1 },
];

export default function RatePricing() {
  const [rates, setRates] = useState(initialRates);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rateToDelete, setRateToDelete] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    roomType: 'Single', ratePlan: 'Standard', baseRate: '', seasonalRate: '', promotionalRate: '',
    effectiveDate: '', endDate: '', status: 'Active', bookingWindow: '', cancellationPolicy: '',
    minStay: '', maxOccupancy: ''
  });

  // Derived state
  const filteredRates = rates.filter(r => 
    r.roomType.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.ratePlan.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const currentRates = filteredRates.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ 
      roomType: 'Single', ratePlan: 'Standard', baseRate: '', seasonalRate: '', promotionalRate: '',
      effectiveDate: '', endDate: '', status: 'Active', bookingWindow: '', cancellationPolicy: '',
      minStay: '', maxOccupancy: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rate) => {
    setEditingId(rate.id);
    setForm({ ...rate });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setRates(rates.map(r => r.id === editingId ? { ...form, id: editingId } : r));
    } else {
      setRates([{ ...form, id: Date.now() }, ...rates]);
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (rate) => {
    setRateToDelete(rate);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setRates(rates.filter(r => r.id !== rateToDelete.id));
    setIsDeleteModalOpen(false);
    setRateToDelete(null);
  };

  const handleExportCSV = () => {
    const headers = ['Room Type', 'Rate Plan', 'Base Rate', 'Seasonal Rate', 'Promotional Rate', 'Effective Date', 'End Date', 'Status'];
    const csvRows = [headers.join(',')];
    rates.forEach(rate => {
      csvRows.push([rate.roomType, rate.ratePlan, rate.baseRate, rate.seasonalRate, rate.promotionalRate, rate.effectiveDate, rate.endDate, rate.status].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'RatePricing.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Room Rates & Pricing', 14, 15);
    const tableColumn = ['Room Type', 'Rate Plan', 'Base Rate', 'Seasonal Rate', 'Promo Rate', 'Effective', 'End', 'Status'];
    const tableRows = rates.map(rate => [rate.roomType, rate.ratePlan, rate.baseRate, rate.seasonalRate, rate.promotionalRate, rate.effectiveDate, rate.endDate, rate.status]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('RatePricing.pdf');
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active': return 'bg-[#ecfdf5] text-[#10b981]';
      case 'Inactive': return 'bg-[#ffe4e6] text-[#e11d48]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Format date like MM/DD/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      fontSize: '13.5px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
    }
  };

  return (
    <div className="w-full bg-transparent pt-1 flex flex-col">
      <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-2 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-[16px] font-bold text-gray-700">Room Rates</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-64 border border-gray-200 rounded-md text-[13.5px] outline-none focus:border-[var(--primary-main)]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenAdd}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Add"
            >
              <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[#1b7f43]" />
            </button>
            <button 
              onClick={() => setRates(initialRates)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Refresh"
            >
              <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <button 
              onClick={handleExportCSV} 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" 
              title="Export CSV"
            >
              <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
            </button>
            <button 
              onClick={handleExportPDF} 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" 
              title="Export PDF"
            >
              <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Room Type</th>
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Rate Plan</th>
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Base Rate</th>
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Seasonal Rate</th>
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Promotional Rate</th>
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Effective Date</th>
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">End Date</th>
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Status</th>
                <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRates.map((rate) => (
                <tr key={rate.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-[13.5px] text-gray-600">{rate.roomType}</td>
                  <td className="px-5 py-3 text-[13.5px] text-gray-600">{rate.ratePlan}</td>
                  <td className="px-5 py-3 text-[13.5px] text-gray-600">${rate.baseRate}</td>
                  <td className="px-5 py-3 text-[13.5px] text-gray-600">${rate.seasonalRate}</td>
                  <td className="px-5 py-3 text-[13.5px] text-gray-600">${rate.promotionalRate}</td>
                  <td className="px-5 py-3 text-[13.5px] text-gray-600">
                    {formatDate(rate.effectiveDate)}
                  </td>
                  <td className="px-5 py-3 text-[13.5px] text-gray-600">
                    {formatDate(rate.endDate)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-3 py-1 rounded text-[11px] font-medium ${getStatusStyles(rate.status)}`}>
                      {rate.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleOpenEdit(rate)} className="text-[#3b82f6] hover:bg-blue-50 p-1 rounded transition-colors cursor-pointer" title="Edit">
                        <EditOutlined sx={{ fontSize: 18 }} />
                      </button>
                      <button onClick={() => handleOpenDelete(rate)} className="text-[#ef4444] hover:bg-red-50 p-1 rounded transition-colors cursor-pointer" title="Delete">
                        <DeleteOutlined sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentRates.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-500 text-[14px]">No rates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-end gap-6 px-5 py-3 border-t border-gray-100 bg-white text-[13px] text-gray-600">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select 
              className="border border-gray-200 rounded px-2 py-1 outline-none text-gray-700 focus:border-[var(--primary-main)] cursor-pointer"
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <span>
            {Math.min((page - 1) * itemsPerPage + 1, filteredRates.length)} - {Math.min(page * itemsPerPage, filteredRates.length)} of {filteredRates.length}
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <KeyboardArrowLeft sx={{ fontSize: 20 }} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages || totalPages === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <KeyboardArrowRight sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-white">
                {editingId ? form.roomType : 'New Record'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Room Type*</InputLabel>
                  <Select required value={form.roomType} label="Room Type*" onChange={e => setForm({...form, roomType: e.target.value})}>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Double">Double</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
                    <MenuItem value="Delux">Delux</MenuItem>
                    <MenuItem value="Super Delux">Super Delux</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Rate Plan*</InputLabel>
                  <Select required value={form.ratePlan} label="Rate Plan*" onChange={e => setForm({...form, ratePlan: e.target.value})}>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Promotional">Promotional</MenuItem>
                    <MenuItem value="Corporate">Corporate</MenuItem>
                    <MenuItem value="Weekend">Weekend</MenuItem>
                  </Select>
                </FormControl>

                <TextField required type="number" label="Base Rate*" value={form.baseRate} onChange={e => setForm({...form, baseRate: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField type="number" label="Seasonal Rate" value={form.seasonalRate} onChange={e => setForm({...form, seasonalRate: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField type="number" label="Promotional Rate" value={form.promotionalRate} onChange={e => setForm({...form, promotionalRate: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                
                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    Effective Date*
                  </Typography>
                  <TextField
                    required
                    type="date"
                    label=""
                    InputLabelProps={{ shrink: true }}
                    value={form.effectiveDate}
                    onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                    sx={muiInputSx}
                    size="small"
                    fullWidth
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    End Date*
                  </Typography>
                  <TextField
                    required
                    type="date"
                    label=""
                    InputLabelProps={{ shrink: true }}
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    sx={muiInputSx}
                    size="small"
                    fullWidth
                  />
                </Box>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select required value={form.status} label="Status*" onChange={e => setForm({...form, status: e.target.value})}>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <TextField label="Booking Window" value={form.bookingWindow} onChange={e => setForm({...form, bookingWindow: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField label="Cancellation Policy" value={form.cancellationPolicy} onChange={e => setForm({...form, cancellationPolicy: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField label="Minimum Stay" value={form.minStay} onChange={e => setForm({...form, minStay: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField type="number" label="Max Occupancy" value={form.maxOccupancy} onChange={e => setForm({...form, maxOccupancy: e.target.value})} sx={muiInputSx} size="small" fullWidth />
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <button type="submit" className="px-5 py-2 rounded-full border border-green-200 bg-green-50 text-[var(--primary-main)] font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
                  Save
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && rateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[320px] overflow-hidden flex flex-col p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-[22px] font-medium text-gray-800 mb-6 text-center">Are you sure?</h2>
            
            <div className="space-y-3 mb-8">
              <p className="text-[14px] text-gray-600 font-medium">Room Type: {rateToDelete.roomType}</p>
              <p className="text-[14px] text-gray-600 font-medium">Rate Plan: {rateToDelete.ratePlan}</p>
              <p className="text-[14px] text-gray-600 font-medium">Status: {rateToDelete.status}</p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button onClick={handleDelete} className="px-5 py-2.5 rounded-full bg-[#c2410c] text-white font-bold text-[14px] hover:bg-[#9a3412] transition-colors cursor-pointer shadow-sm">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 rounded-full bg-[#166534] text-white font-bold text-[14px] hover:bg-[#14532d] transition-colors cursor-pointer shadow-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
