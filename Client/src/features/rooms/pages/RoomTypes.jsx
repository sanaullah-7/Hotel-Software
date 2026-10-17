import React, { useState, useEffect, useCallback } from 'react';
import { 
  Refresh, PictureAsPdf, EditOutlined, DeleteOutlined, Close, Search, 
  KeyboardArrowLeft, KeyboardArrowRight, TableChart, AddCircleOutlined 
} from '@mui/icons-material';
import { 
  TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, Alert, CircularProgress, Snackbar 
} from '@mui/material';
import roomService from '../../../services/roomService';
import { toFrontendRoomType, toBackendRoomTypePayload } from '../adapters/roomAdapter';

export default function RoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    code: '', 
    name: '', 
    description: '', 
    base_occupancy: 2, 
    max_occupancy: 4, 
    base_price: 100
  });

  const [editForm, setEditForm] = useState({
    code: '', 
    name: '', 
    description: '', 
    base_occupancy: 2, 
    max_occupancy: 4, 
    base_price: 100
  });

  const loadRoomTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roomService.getRoomTypes();
      const rawTypes = Array.isArray(res?.data) ? res.data : [];
      setRoomTypes(rawTypes.map(toFrontendRoomType));
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || 'Failed to load room types',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoomTypes();
  }, [loadRoomTypes]);

  // Derived state
  const filteredTypes = roomTypes.filter(r => 
    String(r.code || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(r.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
  const currentTypes = filteredTypes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOpenAdd = () => {
    setForm({ 
      code: '', 
      name: '', 
      description: '', 
      base_occupancy: 2, 
      max_occupancy: 4, 
      base_price: 100 
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (type) => {
    setEditingId(type._id || type.id);
    setEditForm({
      code: type.code || '',
      name: type.name || '',
      description: type.description || '',
      base_occupancy: type.base_occupancy ?? 1,
      max_occupancy: type.max_occupancy ?? 2,
      base_price: type.base_price ?? type.rent ?? 0
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setNotification({ open: true, message: 'Room Type name is required', severity: 'error' });
      return;
    }
    if (!form.code.trim()) {
      setNotification({ open: true, message: 'Room Type short code is required', severity: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = toBackendRoomTypePayload(form);
      const res = await roomService.createRoomType(payload);
      const created = toFrontendRoomType(res.data);
      setRoomTypes([created, ...roomTypes]);
      setNotification({ open: true, message: 'Room type created successfully', severity: 'success' });
      setIsAddModalOpen(false);
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || (err.status === 409 ? 'A room type with this code already exists' : 'Failed to create room type'),
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editForm.name.trim()) {
      setNotification({ open: true, message: 'Room Type name is required', severity: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = toBackendRoomTypePayload(editForm);
      const res = await roomService.updateRoomType(editingId, payload);
      const updated = toFrontendRoomType(res.data);
      setRoomTypes(roomTypes.map(r => (r._id === editingId || r.id === editingId) ? updated : r));
      setNotification({ open: true, message: 'Room type updated successfully', severity: 'success' });
      setIsEditModalOpen(false);
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || 'Failed to update room type',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (type) => {
    setTypeToDelete(type);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!typeToDelete) return;
    setIsSubmitting(true);
    try {
      const targetId = typeToDelete._id || typeToDelete.id;
      await roomService.deleteRoomType(targetId);
      setRoomTypes(roomTypes.filter(r => r._id !== targetId && r.id !== targetId));
      setNotification({ open: true, message: 'Room type deleted successfully', severity: 'success' });
      setIsDeleteModalOpen(false);
      setTypeToDelete(null);
    } catch (err) {
      setNotification({
        open: true,
        message: err.status === 409 
          ? 'Room type is in use by existing rooms and cannot be deleted.' 
          : (err.message || 'Failed to delete room type'),
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleExportCSV = () => {
    const headers = ['Code', 'Room Type Name', 'Base Occupancy', 'Max Occupancy', 'Base Price (Rent)'];
    const csvRows = [headers.join(',')];
    roomTypes.forEach(rt => {
      csvRows.push([rt.code, rt.name, rt.base_occupancy, rt.max_occupancy, rt.base_price].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'RoomTypes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    const [{ default: jsPdfDefault, jsPDF: jsPdfNamed }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    const jsPDF = jsPdfNamed || jsPdfDefault;
    const doc = new jsPDF();
    doc.text('Room Types', 14, 15);
    const tableColumn = ['Code', 'Room Type Name', 'Base Occupancy', 'Max Occupancy', 'Base Price (Rent)'];
    const tableRows = roomTypes.map(rt => [rt.code, rt.name, rt.base_occupancy, rt.max_occupancy, rt.base_price]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('RoomTypes.pdf');
  };

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={() => setNotification(n => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} onClose={() => setNotification(n => ({ ...n, open: false }))}>
          {notification.message}
        </Alert>
      </Snackbar>

      <div className="bg-white rounded-lg shadow-xs border border-gray-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-2 sm:p-2.5 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h2 className="text-xs sm:text-sm font-bold text-gray-800">Room Types & Categories</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-36 sm:w-48 pl-7 pr-2.5 py-1 text-xs border border-gray-200 rounded-lg outline-none focus:border-[var(--primary-main)] text-gray-700 bg-white"
              />
              <Search className="absolute left-2 top-1.5 text-gray-400" sx={{ fontSize: 14 }} />
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleOpenAdd} 
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Add Room Type"
              aria-label="Add Room Type"
            >
              <AddCircleOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
            </button>
            <button 
              onClick={loadRoomTypes} 
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Refresh"
              aria-label="Refresh room types"
            >
              <Refresh sx={{ fontSize: 18 }} className={`text-[var(--primary-main)] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleExportCSV} 
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" 
              title="Export CSV"
              aria-label="Export CSV"
            >
              <TableChart sx={{ fontSize: 16 }} className="text-[#0ea5e9]" />
            </button>
            <button 
              onClick={handleExportPDF} 
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" 
              title="Export PDF"
              aria-label="Export PDF"
            >
              <PictureAsPdf sx={{ fontSize: 16 }} className="text-[#ef4444]" />
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <CircularProgress size={28} sx={{ color: 'var(--primary-main)' }} />
          </div>
        )}

        {/* Table view */}
        {!loading && (
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col style={{ width: '15%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50">
                  <th className="py-2 px-2 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="py-2 px-2 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room Type Name</th>
                  <th className="py-2 px-2 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Base Occupancy</th>
                  <th className="py-2 px-2 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Max Capacity</th>
                  <th className="py-2 px-2 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Base Rent / Night</th>
                  <th className="py-2 px-2 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentTypes.map((type) => (
                  <tr key={type._id || type.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2 px-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#1b7f43] text-[11px] font-bold">
                        {type.code}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-[11px] font-semibold text-gray-800">{type.name}</td>
                    <td className="py-2 px-2 text-[11px] text-gray-600">{type.base_occupancy} Guests</td>
                    <td className="py-2 px-2 text-[11px] text-gray-600">{type.max_occupancy} Guests</td>
                    <td className="py-2 px-2 text-[11px] font-bold text-gray-800">${type.base_price || type.rent}</td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleOpenEdit(type)} className="text-[#3b82f6] hover:bg-blue-50 p-1 rounded transition-colors cursor-pointer" title="Edit room type" aria-label="Edit room type">
                          <EditOutlined sx={{ fontSize: 14 }} />
                        </button>
                        <button onClick={() => handleOpenDelete(type)} className="text-[#ef4444] hover:bg-red-50 p-1 rounded transition-colors cursor-pointer" title="Delete room type" aria-label="Delete room type">
                          <DeleteOutlined sx={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentTypes.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-500 text-xs">No room types found. Click + to create a room type.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 px-3 py-1.5 sm:py-2 border-t border-gray-100 bg-white text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>Items per page:</span>
            <select 
              className="border border-gray-200 rounded px-1.5 py-0.5 outline-none text-xs text-gray-700 focus:border-[var(--primary-main)] cursor-pointer"
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <span>
            {filteredTypes.length > 0 ? Math.min((page - 1) * itemsPerPage + 1, filteredTypes.length) : 0} - {Math.min(page * itemsPerPage, filteredTypes.length)} of {filteredTypes.length}
          </span>
          <div className="flex items-center gap-0.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <KeyboardArrowLeft sx={{ fontSize: 17 }} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages || totalPages === 0}
              aria-label="Next page"
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <KeyboardArrowRight sx={{ fontSize: 17 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[550px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Create New Room Type</h2>
              <button onClick={() => setIsAddModalOpen(false)} aria-label="Close" className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 16 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAdd} className="p-4 sm:p-5 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField 
                  id="add-type-code"
                  required 
                  label="Short Code (e.g. DLX)*" 
                  value={form.code} 
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <TextField 
                  id="add-type-name"
                  required 
                  label="Room Type Name*" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <TextField 
                  id="add-type-base-occupancy"
                  required
                  type="number"
                  label="Base Occupancy*" 
                  value={form.base_occupancy} 
                  onChange={e => setForm({...form, base_occupancy: Number(e.target.value)})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <TextField 
                  id="add-type-max-occupancy"
                  required
                  type="number"
                  label="Max Capacity*" 
                  value={form.max_occupancy} 
                  onChange={e => setForm({...form, max_occupancy: Number(e.target.value)})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <TextField 
                  id="add-type-base-price"
                  required
                  type="number"
                  label="Base Rent / Night*" 
                  value={form.base_price} 
                  onChange={e => setForm({...form, base_price: Number(e.target.value)})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><span className="text-gray-900 font-bold text-xs">$</span></InputAdornment>
                  }}
                />

                <TextField 
                  id="add-type-description"
                  label="Description" 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>
              
              <div className="flex items-center gap-2.5 pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg border border-green-200 bg-green-50 text-[var(--primary-main)] font-semibold text-xs hover:bg-green-100 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Room Type'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg border border-transparent bg-rose-50 text-rose-600 font-semibold text-xs hover:bg-rose-100 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[550px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Edit Room Type: {editForm.name}</h2>
              <button onClick={() => setIsEditModalOpen(false)} aria-label="Close" className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 16 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-4 sm:p-5 space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextField 
                  id="edit-type-name"
                  required 
                  label="Room Type Name*" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <TextField 
                  id="edit-type-base-occupancy"
                  required
                  type="number"
                  label="Base Occupancy*" 
                  value={editForm.base_occupancy} 
                  onChange={e => setEditForm({...editForm, base_occupancy: Number(e.target.value)})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <TextField 
                  id="edit-type-max-occupancy"
                  required
                  type="number"
                  label="Max Capacity*" 
                  value={editForm.max_occupancy} 
                  onChange={e => setEditForm({...editForm, max_occupancy: Number(e.target.value)})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <TextField 
                  id="edit-type-base-price"
                  required
                  type="number"
                  label="Base Rent / Night*" 
                  value={editForm.base_price} 
                  onChange={e => setEditForm({...editForm, base_price: Number(e.target.value)})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><span className="text-gray-900 font-bold text-xs">$</span></InputAdornment>
                  }}
                />

                <TextField 
                  id="edit-type-description"
                  label="Description" 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
              </div>
              
              <div className="flex items-center gap-2.5 pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg border border-green-200 bg-green-50 text-[var(--primary-main)] font-semibold text-xs hover:bg-green-100 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Room Type'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg border border-transparent bg-rose-50 text-rose-600 font-semibold text-xs hover:bg-rose-100 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && typeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[320px] overflow-hidden flex flex-col p-4 sm:p-5" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-800 mb-2 text-center">Delete Room Type?</h2>
            
            <p className="text-xs text-gray-600 mb-4 text-center">
              Are you sure you want to delete <span className="font-bold text-gray-800">{typeToDelete.name} ({typeToDelete.code})</span>?
            </p>
            
            <div className="flex justify-center gap-2.5">
              <button 
                onClick={handleDelete} 
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
