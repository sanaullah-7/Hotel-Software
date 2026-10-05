import React, { useState } from 'react';
import { 
  Refresh, PictureAsPdf, EditOutlined, DeleteOutlined, Close, Search, 
  KeyboardArrowLeft, KeyboardArrowRight, CloudUploadOutlined, TableChart, AddCircleOutlined 
} from '@mui/icons-material';
import { 
  TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment 
} from '@mui/material';

const initialRoomTypes = [];

export default function RoomTypes() {
  const [rooms, setRooms] = useState(initialRoomTypes);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    roomNo: '', roomType: 'Delux', acNonAc: 'AC', shortCode: '', capacity: '', status: 'Active', rent: ''
  });

  // Extended form for Edit
  const [editForm, setEditForm] = useState({
    roomNo: '', roomType: 'Delux', acNonAc: 'AC', shortCode: '', mealPlan: 'Lunch', floorNumber: '3', rent: '150', status: 'Active',
    capacity: '4', bedType: 'Queen', numberOfBeds: '2', roomSize: '450', viewType: 'City View',
    tvType: 'Smart TV', bathroomType: 'Deluxe', wifi: 'Yes', balcony: 'Yes', miniBar: 'No', petFriendly: 'No', accessibility: 'Wheelchair Accessible',
    housekeepingStatus: 'Clean', maintenanceStatus: 'Good', smokingPolicy: 'Non-Smoking', mobile: '123456789',
    notes: 'Luxury room with city view and modern amenities'
  });

  // Derived state
  const filteredRooms = rooms.filter(r => 
    r.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const currentRooms = filteredRooms.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOpenAdd = () => {
    setForm({ roomNo: '', roomType: 'Delux', acNonAc: 'AC', shortCode: '', capacity: '', status: 'Active', rent: '' });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingId(room.id);
    setEditForm({
      ...editForm,
      roomNo: room.roomNo,
      roomType: room.roomType,
      acNonAc: room.acNonAc,
      shortCode: room.shortCode || '',
      rent: (room.rent ?? '').toString(),
      status: room.status === 'Active' || room.status === 'Open' ? 'Active' : 'Inactive',
      capacity: (room.capacity ?? '').toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    setRooms([{ ...form, id: Date.now(), roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop' }, ...rooms]);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setRooms(rooms.map(r => r.id === editingId ? { 
      ...r, 
      roomNo: editForm.roomNo, 
      roomType: editForm.roomType, 
      acNonAc: editForm.acNonAc, 
      shortCode: editForm.shortCode || r.shortCode || (editForm.roomType ? editForm.roomType.split(' ').map(w => w[0]).join('').toUpperCase() : 'RM'),
      rent: Number(editForm.rent) || editForm.rent,
      status: editForm.status === 'Active' || editForm.status === 'Open' ? 'Active' : 'Inactive',
      capacity: Number(editForm.capacity) || editForm.capacity
    } : r));
    setIsEditModalOpen(false);
  };

  const handleOpenDelete = (room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setRooms(rooms.filter(r => r.id !== roomToDelete.id));
    setIsDeleteModalOpen(false);
    setRoomToDelete(null);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Active':
      case 'Open': 
        return 'bg-[#ecfdf5] text-[#10b981]';
      case 'Inactive': 
        return 'bg-[#fff7ed] text-[#f97316]';
      default: 
        return 'bg-gray-100 text-gray-600';
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
    const headers = ['Room No', 'Room Type', 'AC/Non AC', 'Short Code', 'Status', 'Bed Capacity', 'Rent'];
    const csvRows = [headers.join(',')];
    rooms.forEach(room => {
      csvRows.push([room.roomNo, room.roomType, room.acNonAc, room.shortCode, room.status, room.capacity, room.rent].join(','));
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
    doc.text('RoomTypes', 14, 15);
    const tableColumn = ['Room No', 'Room Type', 'AC/Non AC', 'Short Code', 'Status', 'Capacity', 'Rent'];
    const tableRows = rooms.map(room => [room.roomNo, room.roomType, room.acNonAc, room.shortCode, room.status, room.capacity, room.rent]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('RoomTypes.pdf');
  };

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-2 sm:p-2.5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-xs sm:text-sm font-bold text-gray-800">Room Types</h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 15 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-7 pr-3 py-1 w-36 sm:w-48 lg:w-56 border border-gray-200 rounded-lg text-xs outline-none focus:border-[var(--primary-main)]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleOpenAdd}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Add"
              aria-label="Add room type"
            >
              <AddCircleOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
            </button>
            <button 
              onClick={() => setRooms(initialRoomTypes)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Refresh"
              aria-label="Refresh room types"
            >
              <Refresh sx={{ fontSize: 18 }} className="text-[var(--primary-main)]" />
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

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '15%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '11%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room No</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room Type</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">AC/Non AC</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Short Code</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bed Capacity</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rent</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-1.5 px-1.5">
                    <div className="flex items-center gap-1.5">
                      <img src={room.roomImage} alt="room" className="w-5.5 h-5.5 rounded-full object-cover shadow-xs border border-gray-200 shrink-0" />
                      <span className="text-[11px] font-bold text-gray-800 truncate">{room.roomNo}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate">{room.roomType}</td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600">{room.acNonAc}</td>
                  <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-700">{room.shortCode}</td>
                  <td className="py-1.5 px-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${getStatusStyles(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600">{room.capacity}</td>
                  <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-700">${room.rent}</td>
                  <td className="py-1.5 px-1.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleOpenEdit(room)} className="text-[#3b82f6] hover:bg-blue-50 p-0.5 rounded transition-colors cursor-pointer" title="Edit" aria-label="Edit room type">
                        <EditOutlined sx={{ fontSize: 14 }} />
                      </button>
                      <button onClick={() => handleOpenDelete(room)} className="text-[#ef4444] hover:bg-red-50 p-0.5 rounded transition-colors cursor-pointer" title="Delete" aria-label="Delete room type">
                        <DeleteOutlined sx={{ fontSize: 14 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentRooms.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500 text-xs">No room types found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
            {Math.min((page - 1) * itemsPerPage + 1, filteredRooms.length)} - {Math.min(page * itemsPerPage, filteredRooms.length)} of {filteredRooms.length}
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

      {/* Simple ADD Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded-full border border-white/30 overflow-hidden flex items-center justify-center bg-white/10 text-[9px]">
                  IMG
                </div>
                <h2 className="text-sm font-bold">New Record</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} aria-label="Close" className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 16 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAdd} className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                <TextField required label="Room No*" value={form.roomNo} onChange={e => setForm({...form, roomNo: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Select Room Type*</InputLabel>
                  <Select value={form.roomType} label="Select Room Type*" onChange={e => setForm({...form, roomType: e.target.value})}>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Double">Double</MenuItem>
                    <MenuItem value="Delux">Delux</MenuItem>
                    <MenuItem value="Super Delux">Super Delux</MenuItem>
                    <MenuItem value="Vila">Vila</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>AC/Non AC*</InputLabel>
                  <Select value={form.acNonAc} label="AC/Non AC*" onChange={e => setForm({...form, acNonAc: e.target.value})}>
                    <MenuItem value="AC">AC</MenuItem>
                    <MenuItem value="Non AC">Non AC</MenuItem>
                  </Select>
                </FormControl>
                <TextField required label="Short Code*" value={form.shortCode} onChange={e => setForm({...form, shortCode: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required type="number" label="Capacity*" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select value={form.status} label="Status*" onChange={e => setForm({...form, status: e.target.value})}>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
                <TextField required type="number" label="Rent*" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} sx={muiInputSx} size="small" fullWidth InputProps={{ endAdornment: <InputAdornment position="end"><span className="text-gray-900 font-bold text-xs">$</span></InputAdornment> }} />
              </div>
              
              <div className="flex items-center gap-2.5 mt-5">
                <button type="submit" className="px-4 py-1.5 rounded-lg border border-green-200 bg-green-50 text-[var(--primary-main)] font-semibold text-xs hover:bg-green-100 transition-colors cursor-pointer shadow-xs">
                  Save
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-1.5 rounded-lg border border-transparent bg-rose-50 text-rose-600 font-semibold text-xs hover:bg-rose-100 transition-colors cursor-pointer shadow-xs">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex flex-col text-white">
                <h2 className="text-sm font-bold">Edit Room - #{editForm.roomNo}</h2>
                <p className="text-white/80 text-[11px] mt-0.5">Update room specifications, amenities, and operational settings</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} aria-label="Close" className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-gray-50/50 space-y-4">
                {/* Section 1: Room Information */}
                <div>
                  <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">Room Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <TextField label="Room Number" value={editForm.roomNo} onChange={e => setEditForm({...editForm, roomNo: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <FormControl size="small" fullWidth sx={muiInputSx}>
                      <InputLabel>Room Type</InputLabel>
                      <Select value={editForm.roomType} label="Room Type" onChange={e => setEditForm({...editForm, roomType: e.target.value})}>
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Double">Double</MenuItem>
                        <MenuItem value="Delux">Delux</MenuItem>
                        <MenuItem value="Super Delux">Super Delux</MenuItem>
                        <MenuItem value="Vila">Vila</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth sx={muiInputSx}>
                      <InputLabel>AC / Non AC</InputLabel>
                      <Select value={editForm.acNonAc} label="AC / Non AC" onChange={e => setEditForm({...editForm, acNonAc: e.target.value})}>
                        <MenuItem value="AC">AC</MenuItem>
                        <MenuItem value="Non AC">Non AC</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField label="Short Code" value={editForm.shortCode} onChange={e => setEditForm({...editForm, shortCode: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Meal Plan" value={editForm.mealPlan} onChange={e => setEditForm({...editForm, mealPlan: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Floor Number" type="number" value={editForm.floorNumber} onChange={e => setEditForm({...editForm, floorNumber: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Rent per Night" type="number" value={editForm.rent} onChange={e => setEditForm({...editForm, rent: e.target.value})} sx={muiInputSx} size="small" fullWidth InputProps={{ endAdornment: <InputAdornment position="end"><span className="text-gray-900 font-bold text-xs">$</span></InputAdornment> }} />
                    <FormControl size="small" fullWidth sx={muiInputSx}>
                      <InputLabel>Room Status</InputLabel>
                      <Select value={editForm.status} label="Room Status" onChange={e => setEditForm({...editForm, status: e.target.value})}>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                {/* Section 2: Bed & Space Specifications */}
                <div>
                  <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">Bed & Space Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <TextField label="Capacity (Persons)" type="number" value={editForm.capacity} onChange={e => setEditForm({...editForm, capacity: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Bed Type" value={editForm.bedType} onChange={e => setEditForm({...editForm, bedType: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Number of Beds" type="number" value={editForm.numberOfBeds} onChange={e => setEditForm({...editForm, numberOfBeds: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Room Size (sq ft)" type="number" value={editForm.roomSize} onChange={e => setEditForm({...editForm, roomSize: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="View Type" value={editForm.viewType} onChange={e => setEditForm({...editForm, viewType: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                  </div>
                </div>

                {/* Section 3: Amenities & Facilities */}
                <div>
                  <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">Amenities & Facilities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <TextField label="TV Type" value={editForm.tvType} onChange={e => setEditForm({...editForm, tvType: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Bathroom Type" value={editForm.bathroomType} onChange={e => setEditForm({...editForm, bathroomType: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <FormControl size="small" fullWidth sx={muiInputSx}>
                      <InputLabel>WiFi Available</InputLabel>
                      <Select value={editForm.wifi} label="WiFi Available" onChange={e => setEditForm({...editForm, wifi: e.target.value})}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth sx={muiInputSx}>
                      <InputLabel>Balcony Available</InputLabel>
                      <Select value={editForm.balcony} label="Balcony Available" onChange={e => setEditForm({...editForm, balcony: e.target.value})}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth sx={muiInputSx}>
                      <InputLabel>Mini Bar Available</InputLabel>
                      <Select value={editForm.miniBar} label="Mini Bar Available" onChange={e => setEditForm({...editForm, miniBar: e.target.value})}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth sx={muiInputSx}>
                      <InputLabel>Pet Friendly</InputLabel>
                      <Select value={editForm.petFriendly} label="Pet Friendly" onChange={e => setEditForm({...editForm, petFriendly: e.target.value})}>
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField label="Accessibility Features" value={editForm.accessibility} onChange={e => setEditForm({...editForm, accessibility: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                  </div>
                </div>

                {/* Section 4: Operations & Policies */}
                <div>
                  <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">Operations & Policies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <TextField label="Housekeeping Status" value={editForm.housekeepingStatus} onChange={e => setEditForm({...editForm, housekeepingStatus: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Maintenance Status" value={editForm.maintenanceStatus} onChange={e => setEditForm({...editForm, maintenanceStatus: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Smoking Policy" value={editForm.smokingPolicy} onChange={e => setEditForm({...editForm, smokingPolicy: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                    <TextField label="Contact Mobile" value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                  </div>
                </div>

                {/* Section 5: Additional Details */}
                <div>
                  <h3 className="text-xs font-bold text-gray-800 mb-2.5 pb-1.5 border-b border-gray-200 uppercase tracking-wider">Additional Details</h3>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 font-medium mb-1">Room Images / Documents</label>
                      <div className="w-full border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                        <CloudUploadOutlined sx={{ fontSize: 26, mb: 0.5 }} className="text-[var(--primary-main)]" />
                        <p className="text-xs font-semibold text-gray-700">Click or drag and drop file here</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">No file chosen</p>
                      </div>
                    </div>

                    <TextField 
                      label="Notes & Instructions" 
                      multiline 
                      rows={3}
                      value={editForm.notes} 
                      onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                      sx={muiInputSx} 
                      fullWidth 
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white border-t border-gray-200 px-4 py-2.5 flex items-center justify-end gap-2.5 shrink-0">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-1.5 rounded-lg border border-transparent bg-rose-50 text-rose-600 font-semibold text-xs hover:bg-rose-100 transition-colors cursor-pointer shadow-xs">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg border border-green-200 bg-green-50 text-[var(--primary-main)] font-semibold text-xs hover:bg-green-100 transition-colors cursor-pointer shadow-xs">
                  Update Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[300px] overflow-hidden flex flex-col p-4 sm:p-5" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-800 mb-3 text-center">Are you sure?</h2>
            
            <div className="space-y-1.5 mb-5 text-xs text-gray-600">
              <p><span className="font-medium text-gray-700">Room No:</span> {roomToDelete.roomNo}</p>
              <p><span className="font-medium text-gray-700">Room Type:</span> {roomToDelete.roomType}</p>
              <p><span className="font-medium text-gray-700">Short Code:</span> {roomToDelete.shortCode}</p>
            </div>
            
            <div className="flex justify-center gap-2.5">
              <button onClick={handleDelete} className="px-4 py-1.5 rounded-lg bg-orange-600 text-white font-semibold text-xs hover:bg-orange-700 transition-colors cursor-pointer shadow-xs">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors cursor-pointer shadow-xs">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
