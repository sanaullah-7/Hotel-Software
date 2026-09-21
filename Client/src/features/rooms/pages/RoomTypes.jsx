import React, { useState } from'react';
import { jsPDF } from'jspdf';
import autoTable from'jspdf-autotable';
import { FilterList, Add, Refresh, Calculate, PictureAsPdf, EditOutlined, DeleteOutlined, Close, Search, KeyboardArrowLeft, KeyboardArrowRight, CloudUploadOutlined, AddCircle, TableChart, ViewWeek, AddCircleOutlined } from'@mui/icons-material';;;;
import { 
 TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment,
 Checkbox, Menu 
} from'@mui/material';

const initialRoomTypes = [
 { id: 1, roomNo:'101', roomImage:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop', roomType:'Delux', acNonAc:'AC', shortCode:'DL', capacity: 2, status:'Active', rent: 25 },
 { id: 2, roomNo:'102', roomImage:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType:'Super Delux', acNonAc:'Non AC', shortCode:'SDL', capacity: 3, status:'Inactive', rent: 50 },
 { id: 3, roomNo:'103', roomImage:'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=100&h=100&fit=crop', roomType:'Super Delux', acNonAc:'AC', shortCode:'SDL', capacity: 2, status:'Active', rent: 31 },
 { id: 4, roomNo:'104', roomImage:'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=100&h=100&fit=crop', roomType:'Delux', acNonAc:'Non AC', shortCode:'DL', capacity: 3, status:'Inactive', rent: 31 },
 { id: 5, roomNo:'105', roomImage:'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=100&h=100&fit=crop', roomType:'Vila', acNonAc:'AC', shortCode:'VL', capacity: 2, status:'Inactive', rent: 50 },
 { id: 6, roomNo:'106', roomImage:'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop', roomType:'Double', acNonAc:'AC', shortCode:'DB', capacity: 4, status:'Active', rent: 45 },
 { id: 7, roomNo:'201', roomImage:'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=100&h=100&fit=crop', roomType:'Single', acNonAc:'Non AC', shortCode:'SL', capacity: 4, status:'Active', rent: 20 },
 { id: 8, roomNo:'202', roomImage:'https://images.unsplash.com/photo-1560185016-5c51088c4b12?w=100&h=100&fit=crop', roomType:'Delux', acNonAc:'AC', shortCode:'DL', capacity: 3, status:'Inactive', rent: 25 },
 { id: 9, roomNo:'203', roomImage:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop', roomType:'Delux', acNonAc:'AC', shortCode:'DL', capacity: 2, status:'Inactive', rent: 29 },
 { id: 10, roomNo:'204', roomImage:'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType:'Super Delux', acNonAc:'Non AC', shortCode:'SDL', capacity: 6, status:'Inactive', rent: 50 },
];

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

 // Column Visibility
 const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
 const [visibleColumns, setVisibleColumns] = useState({
 roomNo: true, roomType: true, acNonAc: true, shortCode: true, 
 status: true, capacity: true, rent: true, actions: true
 });

 const [form, setForm] = useState({
 roomNo:'', roomType:'Delux', acNonAc:'AC', shortCode:'', capacity:'', status:'Active', rent:''
 });

 // Extended form for Edit
 const [editForm, setEditForm] = useState({
 roomNo:'', roomType:'Delux', acNonAc:'AC', mealPlan:'Lunch', floorNumber:'3', rent:'150', status:'Open',
 capacity:'4', bedType:'Queen', numberOfBeds:'2', roomSize:'450', viewType:'City View',
 tvType:'Smart TV', bathroomType:'Deluxe', wifi:'Yes', balcony:'Yes', miniBar:'No', petFriendly:'No', accessibility:'Wheelchair Accessible',
 housekeepingStatus:'Clean', maintenanceStatus:'Good', smokingPolicy:'Non-Smoking', mobile:'123456789',
 notes:'Luxury room with city view and modern amenities'
 });

 // Derived state
 const filteredRooms = rooms.filter(r => 
 r.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
 r.roomType.toLowerCase().includes(searchTerm.toLowerCase())
 );
 
 const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
 const currentRooms = filteredRooms.slice((page - 1) * itemsPerPage, page * itemsPerPage);

 const handleOpenAdd = () => {
 setForm({ roomNo:'', roomType:'Delux', acNonAc:'AC', shortCode:'', capacity:'', status:'Active', rent:'' });
 setIsAddModalOpen(true);
 };

 const handleOpenEdit = (room) => {
 setEditingId(room.id);
 // Populate simple fields and preserve some defaults for extended fields
 setEditForm({
 ...editForm,
 roomNo: room.roomNo,
 roomType: room.roomType,
 acNonAc: room.acNonAc,
 rent: room.rent.toString(),
 status: room.status ==='Active' ?'Open' :'Inactive',
 capacity: room.capacity.toString(),
 });
 setIsEditModalOpen(true);
 };

 const handleSaveAdd = (e) => {
 e.preventDefault();
 setRooms([{ ...form, id: Date.now(), roomImage:'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop' }, ...rooms]);
 setIsAddModalOpen(false);
 };

 const handleSaveEdit = (e) => {
 e.preventDefault();
 setRooms(rooms.map(r => r.id === editingId ? { 
 ...r, 
 roomNo: editForm.roomNo, 
 roomType: editForm.roomType, 
 acNonAc: editForm.acNonAc, 
 rent: editForm.rent,
 status: editForm.status ==='Open' ?'Active' :'Inactive',
 capacity: editForm.capacity
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
 case'Active': return'bg-[#ecfdf5] text-[#10b981]';
 case'Inactive': return'bg-[#fff7ed] text-[#f97316]';
 default: return'bg-gray-100 text-gray-600';
 }
 };

 const muiInputSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'8px',
 backgroundColor:'#ffffff',
 fontSize:'13.5px',
 color:'#1f2937','& fieldset': { borderColor:'#e2e8f0', borderWidth:'1px' },'&:hover fieldset': { borderColor:'#cbd5e1' },'&.Mui-focused fieldset': { borderColor:'var(--primary-main)', borderWidth:'1.5px' },
 }
 };


 const handleExportCSV = () => {
 const headers = ['Room No','Room Type','AC/Non AC','Short Code','Status','Bed Capacity','Rent'];
 const csvRows = [headers.join(',')];
 rooms.forEach(room => {
 csvRows.push([room.roomNo, room.roomType, room.acNonAc, room.shortCode, room.status, room.capacity, room.rent].join(','));
 });
 const blob = new Blob([csvRows.join('\n')], { type:'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.setAttribute('download','RoomTypes.csv');
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 const handleExportPDF = () => {
 const doc = new jsPDF();
 doc.text('RoomTypes', 14, 15);
 const tableColumn = ['Room No','Room Type','AC/Non AC','Short Code','Status','Capacity','Rent'];
 const tableRows = rooms.map(room => [room.roomNo, room.roomType, room.acNonAc, room.shortCode, room.status, room.capacity, room.rent]);
 autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
 doc.save('RoomTypes.pdf');
 };

 return (
 <div className="w-full bg-transparent pt-1 flex flex-col">
 
 <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
 
 {/* Header Bar */}
 <div className="p-2 flex items-center justify-between border-b border-gray-100">
 <div className="flex items-center gap-4">
 <h2 className="text-[16px] font-bold text-gray-700">Room Types</h2>
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
 onClick={(e) => setColumnsMenuAnchor(e.currentTarget)} 
 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
 title="Filter"
 >
 <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
 </button>
 <button 
 onClick={handleOpenAdd}
 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
 title="Add"
 >
 <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[#1b7f43]" />
 </button>
 <button 
 onClick={() => setRooms(initialRoomTypes)}
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

 {/* Column Visibility Menu */}
 <Menu
 anchorEl={columnsMenuAnchor}
 open={Boolean(columnsMenuAnchor)}
 onClose={() => setColumnsMenuAnchor(null)}
 PaperProps={{ sx: { width: 220, mt: 1, borderRadius:'8px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' } }}
 >
 <div className="px-4 py-2 font-bold text-gray-700 text-[14px] border-b border-gray-100 mb-2">Show/Hide Column</div>
 {Object.keys(visibleColumns).filter(k => k !=='actions').map(col => (
 <MenuItem key={col} onClick={() => setVisibleColumns({...visibleColumns, [col]: !visibleColumns[col]})}>
 <Checkbox 
 checked={visibleColumns[col]} 
 size="small" 
 sx={{ color:'var(--primary-main)','&.Mui-checked': { color:'var(--primary-main)' } }} 
 />
 <span className="text-[13.5px] capitalize text-gray-700">{col.replace(/([A-Z])/g,' $1').trim()}</span>
 </MenuItem>
 ))}
 </Menu>

 {/* Table */}
 <div className="flex-1">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="border-b border-gray-100">
 {visibleColumns.roomNo && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Room No</th>}
 {visibleColumns.roomType && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Room Type</th>}
 {visibleColumns.acNonAc && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">AC/Non AC</th>}
 {visibleColumns.shortCode && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Short Code</th>}
 {visibleColumns.status && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Status</th>}
 {visibleColumns.capacity && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Bed Capacity</th>}
 {visibleColumns.rent && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Rent</th>}
 {visibleColumns.actions && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700 text-center">Actions</th>}
 </tr>
 </thead>
 <tbody>
 {currentRooms.map((room) => (
 <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
 
 {visibleColumns.roomNo && (
 <td className="px-5 py-3">
 <div className="flex items-center gap-3">
 <img src={room.roomImage} alt="room" className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-200" />
 <span className="text-[13.5px] font-medium text-gray-700">{room.roomNo}</span>
 </div>
 </td>
 )}
 
 {visibleColumns.roomType && (
 <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.roomType}</td>
 )}
 
 {visibleColumns.acNonAc && (
 <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.acNonAc}</td>
 )}

 {visibleColumns.shortCode && (
 <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.shortCode}</td>
 )}
 
 {visibleColumns.status && (
 <td className="px-5 py-3">
 <span className={`px-3 py-1 rounded text-[11px] font-medium ${getStatusStyles(room.status)}`}>
 {room.status}
 </span>
 </td>
 )}
 
 {visibleColumns.capacity && (
 <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.capacity}</td>
 )}
 
 {visibleColumns.rent && (
 <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.rent}</td>
 )}
 
 {visibleColumns.actions && (
 <td className="px-5 py-3 text-center">
 <div className="flex items-center justify-center gap-3">
 <button onClick={() => handleOpenEdit(room)} className="text-[#3b82f6] hover:bg-blue-50 p-1 rounded transition-colors cursor-pointer">
 <EditOutlined sx={{ fontSize: 18 }} />
 </button>
 <button onClick={() => handleOpenDelete(room)} className="text-[#ef4444] hover:bg-red-50 p-1 rounded transition-colors cursor-pointer">
 <DeleteOutlined sx={{ fontSize: 18 }} />
 </button>
 </div>
 </td>
 )}
 
 </tr>
 ))}
 {currentRooms.length === 0 && (
 <tr>
 <td colSpan="8" className="text-center py-10 text-gray-500 text-[14px]">No room types found.</td>
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
 className="border border-gray-200 rounded px-2 py-1 outline-none text-gray-700 focus:border-[var(--primary-main)]"
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

 {/* Simple ADD Modal */}
 {isAddModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
 <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
 <div className="bg-[var(--primary-main)] px-5 py-4 flex items-center justify-between">
 <div className="flex items-center gap-3 text-white">
 <div className="w-8 h-8 rounded-full border-2 border-white/30 overflow-hidden flex items-center justify-center bg-white/10 text-[10px]">
 IMG
 </div>
 <h2 className="text-[16px] font-bold">New Record</h2>
 </div>
 <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
 <Close sx={{ fontSize: 18 }} />
 </button>
 </div>
 
 <form onSubmit={handleSaveAdd} className="p-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
 <TextField required type="number" label="Rent*" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} sx={muiInputSx} size="small" fullWidth InputProps={{ endAdornment: <InputAdornment position="end"><span className="text-gray-900 font-bold">$</span></InputAdornment> }} />
 </div>
 
 <div className="flex items-center gap-3 mt-8">
 <button type="submit" className="px-2 py-2.5 rounded-full border border-transparent bg-green-50 text-[var(--primary-main)] border-green-200 font-bold text-[13px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
 Save
 </button>
 <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-2 py-2.5 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
 Cancel
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Massive EDIT Modal (as specified) */}
 {isEditModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
 <div className="bg-white rounded-xl shadow-2xl w-full max-w-[900px] h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
 <div className="bg-[var(--primary-main)] px-2 py-4 flex items-center justify-between shrink-0">
 <div className="flex flex-col text-white">
 <h2 className="text-[18px] font-bold">Edit Room - #{editForm.roomNo}</h2>
 <p className="text-white/80 text-[12.5px] mt-0.5">Update room specifications, amenities, and operational settings</p>
 </div>
 <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
 <Close sx={{ fontSize: 20 }} />
 </button>
 </div>
 
 <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50">
 
 {/* Section 1: Room Information */}
 <div className="mb-8">
 <h3 className="text-[15px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Room Information</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 <TextField label="Room Number" value={editForm.roomNo} onChange={e => setEditForm({...editForm, roomNo: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Room Type" value={editForm.roomType} onChange={e => setEditForm({...editForm, roomType: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>AC / Non AC</InputLabel>
 <Select value={editForm.acNonAc} label="AC / Non AC" onChange={e => setEditForm({...editForm, acNonAc: e.target.value})}>
 <MenuItem value="AC">AC</MenuItem>
 <MenuItem value="Non AC">Non AC</MenuItem>
 </Select>
 </FormControl>
 <TextField label="Meal Plan" value={editForm.mealPlan} onChange={e => setEditForm({...editForm, mealPlan: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Floor Number" type="number" value={editForm.floorNumber} onChange={e => setEditForm({...editForm, floorNumber: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Rent per Night" type="number" value={editForm.rent} onChange={e => setEditForm({...editForm, rent: e.target.value})} sx={muiInputSx} size="small" fullWidth InputProps={{ endAdornment: <InputAdornment position="end"><span className="text-gray-900 font-bold">$</span></InputAdornment> }} />
 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Room Status</InputLabel>
 <Select value={editForm.status} label="Room Status" onChange={e => setEditForm({...editForm, status: e.target.value})}>
 <MenuItem value="Open">Open</MenuItem>
 <MenuItem value="Booked">Booked</MenuItem>
 <MenuItem value="Inactive">Inactive</MenuItem>
 </Select>
 </FormControl>
 </div>
 </div>

 {/* Section 2: Bed & Space Specifications */}
 <div className="mb-8">
 <h3 className="text-[15px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Bed & Space Specifications</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 <TextField label="Capacity (Persons)" type="number" value={editForm.capacity} onChange={e => setEditForm({...editForm, capacity: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Bed Type" value={editForm.bedType} onChange={e => setEditForm({...editForm, bedType: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Number of Beds" type="number" value={editForm.numberOfBeds} onChange={e => setEditForm({...editForm, numberOfBeds: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Room Size (sq ft)" type="number" value={editForm.roomSize} onChange={e => setEditForm({...editForm, roomSize: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="View Type" value={editForm.viewType} onChange={e => setEditForm({...editForm, viewType: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 </div>
 </div>

 {/* Section 3: Amenities & Facilities */}
 <div className="mb-8">
 <h3 className="text-[15px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Amenities & Facilities</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
 <div className="mb-8">
 <h3 className="text-[15px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Operations & Policies</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 <TextField label="Housekeeping Status" value={editForm.housekeepingStatus} onChange={e => setEditForm({...editForm, housekeepingStatus: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Maintenance Status" value={editForm.maintenanceStatus} onChange={e => setEditForm({...editForm, maintenanceStatus: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Smoking Policy" value={editForm.smokingPolicy} onChange={e => setEditForm({...editForm, smokingPolicy: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 <TextField label="Contact Mobile" value={editForm.mobile} onChange={e => setEditForm({...editForm, mobile: e.target.value})} sx={muiInputSx} size="small" fullWidth />
 </div>
 </div>

 {/* Section 5: Additional Details */}
 <div className="mb-8">
 <h3 className="text-[15px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Additional Details</h3>
 <div className="flex flex-col gap-5">
 
 <div>
 <label className="block text-[13px] text-gray-600 font-medium mb-1.5">Room Images / Documents</label>
 <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
 <CloudUploadOutlined sx={{ fontSize: 40, mb: 1 }} className="text-[var(--primary-main)]" />
 <p className="text-[14px] font-medium text-gray-700">Click or drag and drop file here</p>
 <p className="text-[12.5px] mt-1">No file chosen</p>
 </div>
 </div>

 <TextField 
 label="Notes & Instructions" 
 multiline 
 rows={4}
 value={editForm.notes} 
 onChange={e => setEditForm({...editForm, notes: e.target.value})} 
 sx={muiInputSx} 
 fullWidth 
 />

 </div>
 </div>

 </form>
 
 <div className="bg-white border-t border-gray-200 px-2 py-4 flex items-center justify-end gap-3 shrink-0">
 <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-2 py-2.5 rounded-xl border border-transparent bg-red-50 text-red-600 font-bold text-[13.5px] hover:bg-red-100 transition-colors cursor-pointer shadow-sm">
 Cancel
 </button>
 <button type="submit" className="px-2 py-2.5 rounded-xl border border-transparent bg-[var(--primary-main)] text-white font-bold text-[13.5px] hover:brightness-110 transition-all cursor-pointer shadow-sm">
 Update Room
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Delete Confirmation Modal */}
 {isDeleteModalOpen && roomToDelete && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
 <div className="bg-white rounded-2xl shadow-xl w-full max-w-[320px] overflow-hidden flex flex-col p-6" onClick={e => e.stopPropagation()}>
 <h2 className="text-[22px] font-medium text-gray-800 mb-6 text-center">Are you sure?</h2>
 
 <div className="space-y-3 mb-8">
 <p className="text-[14px] text-gray-600 font-medium">Room No: {roomToDelete.roomNo}</p>
 <p className="text-[14px] text-gray-600 font-medium">Room Type: {roomToDelete.roomType}</p>
 <p className="text-[14px] text-gray-600 font-medium">Short Code: {roomToDelete.shortCode}</p>
 </div>
 
 <div className="flex justify-center gap-3">
 <button onClick={handleDelete} className="px-2 py-2.5 rounded-full bg-[#c2410c] text-white font-bold text-[14px] hover:bg-[#9a3412] transition-colors cursor-pointer shadow-sm">
 Delete
 </button>
 <button onClick={() => setIsDeleteModalOpen(false)} className="px-2 py-2.5 rounded-full bg-[#166534] text-white font-bold text-[14px] hover:bg-[#14532d] transition-colors cursor-pointer shadow-sm">
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}
