import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FilterList, Add, Refresh, Calculate, PictureAsPdf, EditOutlined, DeleteOutlined, Close, Search, KeyboardArrowLeft, KeyboardArrowRight, AddCircle, TableChart, ViewWeek, AddCircleOutlined, PhoneOutlined } from '@mui/icons-material';;;;;
import { 
  TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment,
  Checkbox, Menu 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Hotel from '@mui/icons-material/Hotel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Bed from '@mui/icons-material/Bed';
import CleaningServices from '@mui/icons-material/CleaningServices';
import BuildCircle from '@mui/icons-material/BuildCircle';
import Search from '@mui/icons-material/Search';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import GridView from '@mui/icons-material/GridView';
import Add from '@mui/icons-material/Add';
import Wifi from '@mui/icons-material/Wifi';
import Tv from '@mui/icons-material/Tv';
import AcUnit from '@mui/icons-material/AcUnit';
import MoreVert from '@mui/icons-material/MoreVert';
import LocalBar from '@mui/icons-material/LocalBar';
import ViewCompact from '@mui/icons-material/ViewCompact';
import Person from '@mui/icons-material/Person';
import SquareFoot from '@mui/icons-material/SquareFoot';
import KingBed from '@mui/icons-material/KingBed';
import SingleBed from '@mui/icons-material/SingleBed';
import Star from '@mui/icons-material/Star';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { IconButton } from '@mui/material';

const initialRooms = [
  { id: 1, roomNo: '101', roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop', roomType: 'Delux', acNonAc: 'AC', meal: 'All', capacity: 2, status: 'Booked', rent: 25, mobile: '1234567890' },
  { id: 2, roomNo: '102', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType: 'Super Delux', acNonAc: 'Non AC', meal: 'Lunch', capacity: 3, status: 'Open', rent: 50, mobile: '1234567890' },
  { id: 3, roomNo: '103', roomImage: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=100&h=100&fit=crop', roomType: 'Super Delux', acNonAc: 'AC', meal: 'All', capacity: 2, status: 'Booked', rent: 31, mobile: '1234567890' },
  { id: 4, roomNo: '104', roomImage: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=100&h=100&fit=crop', roomType: 'Delux', acNonAc: 'Non AC', meal: 'Dinner', capacity: 3, status: 'Inactive', rent: 31, mobile: '1234567890' },
  { id: 5, roomNo: '105', roomImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=100&h=100&fit=crop', roomType: 'Vila', acNonAc: 'AC', meal: 'Breakfast', capacity: 2, status: 'Open', rent: 50, mobile: '1234567890' },
  { id: 6, roomNo: '106', roomImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop', roomType: 'Double', acNonAc: 'AC', meal: 'None', capacity: 4, status: 'Booked', rent: 45, mobile: '1234567890' },
  { id: 7, roomNo: '201', roomImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=100&h=100&fit=crop', roomType: 'Single', acNonAc: 'Non AC', meal: 'None', capacity: 4, status: 'Booked', rent: 20, mobile: '1234567890' },
  { id: 8, roomNo: '202', roomImage: 'https://images.unsplash.com/photo-1560185016-5c51088c4b12?w=100&h=100&fit=crop', roomType: 'Delux', acNonAc: 'AC', meal: 'Dinner', capacity: 3, status: 'Inactive', rent: 25, mobile: '1234567890' },
  { id: 9, roomNo: '203', roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop', roomType: 'Delux', acNonAc: 'AC', meal: 'Breakfast', capacity: 2, status: 'Open', rent: 29, mobile: '1234567890' },
  { id: 10, roomNo: '204', roomImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop', roomType: 'Super Delux', acNonAc: 'Non AC', meal: 'Lunch', capacity: 6, status: 'Open', rent: 50, mobile: '1234567890' },
];

export default function Rooms() {
  const [rooms, setRooms] = useState(initialRooms);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column Visibility
  const [columnsMenuAnchor, setColumnsMenuAnchor] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState({
    roomNo: true, roomType: true, acNonAc: true, meal: true, 
    capacity: true, status: true, rent: true, mobile: true, actions: true
  });

  const [form, setForm] = useState({
    roomNo: '', roomType: 'Delux', acNonAc: 'AC', meal: 'All', capacity: '', status: 'Open', rent: '', mobile: ''
  });

  // Derived state
  const filteredRooms = rooms.filter(r => 
    r.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const currentRooms = filteredRooms.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({ roomNo: '', roomType: 'Delux', acNonAc: 'AC', meal: 'All', capacity: '', status: 'Open', rent: '', mobile: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingId(room.id);
    setForm({ ...room });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setRooms(rooms.map(r => r.id === editingId ? { ...r, ...form } : r));
    } else {
      setRooms([{ ...form, id: Date.now(), roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop' }, ...rooms]);
    }
    setIsModalOpen(false);
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
      case 'Booked': return 'bg-[#eff6ff] text-[#3b82f6]';
      case 'Open': return 'bg-[#ecfdf5] text-[#10b981]';
      case 'Inactive': return 'bg-[#fff7ed] text-[#f97316]';
      default: return 'bg-gray-100 text-gray-600';
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
    const headers = ['Room No', 'Room Type', 'AC/Non AC', 'Meal', 'Bed Capacity', 'Status', 'Rent', 'Mobile'];
    const csvRows = [headers.join(',')];
    rooms.forEach(room => {
      csvRows.push([room.roomNo, room.roomType, room.acNonAc, room.meal, room.bedCapacity, room.status, room.rent, room.mobile].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'AllRooms.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('AllRooms', 14, 15);
    const tableColumn = ['Room No', 'Room Type', 'AC/Non AC', 'Meal', 'Bed Capacity', 'Status', 'Rent', 'Mobile'];
    const tableRows = rooms.map(room => [room.roomNo, room.roomType, room.acNonAc, room.meal, room.bedCapacity, room.status, room.rent, room.mobile]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('AllRooms.pdf');
  };

  return (
    <div className="w-full bg-transparent pt-1 flex flex-col">
      
      <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-2 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-4">
            <h2 className="text-[16px] font-bold text-gray-700">Rooms</h2>
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
                onClick={handleOpenNew}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
                title="Add"
              >
                <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[#1b7f43]" />
              </button>
              <button 
                onClick={() => setRooms(initialRooms)}
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
          PaperProps={{ sx: { width: 220, mt: 1, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
        >
          <div className="px-4 py-2 font-bold text-gray-700 text-[14px] border-b border-gray-100 mb-2">Show/Hide Column</div>
          {Object.keys(visibleColumns).filter(k => k !== 'actions').map(col => (
            <MenuItem key={col} onClick={() => setVisibleColumns({...visibleColumns, [col]: !visibleColumns[col]})}>
              <Checkbox 
                checked={visibleColumns[col]} 
                size="small" 
                sx={{ color: 'var(--primary-main)', '&.Mui-checked': { color: 'var(--primary-main)' } }} 
              />
              <span className="text-[13.5px] capitalize text-gray-700">{col.replace(/([A-Z])/g, ' $1').trim()}</span>
            </MenuItem>
          ))}
        </Menu>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {visibleColumns.roomNo && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Room No</th>}
                {visibleColumns.roomType && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Room Type</th>}
                {visibleColumns.acNonAc && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">AC/Non AC</th>}
                {visibleColumns.meal && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Meal</th>}
                {visibleColumns.capacity && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Bed Capacity</th>}
                {visibleColumns.status && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Status</th>}
                {visibleColumns.rent && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Rent</th>}
                {visibleColumns.mobile && <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Mobile</th>}
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
                  
                  {visibleColumns.meal && (
                    <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.meal}</td>
                  )}
                  
                  {visibleColumns.capacity && (
                    <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.capacity}</td>
                  )}
                  
                  {visibleColumns.status && (
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 rounded text-[11px] font-medium ${getStatusStyles(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                  )}
                  
                  {visibleColumns.rent && (
                    <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.rent}</td>
                  )}
                  
                  {visibleColumns.mobile && (
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-[13.5px] text-gray-600">
                        <PhoneOutlined className="text-[#10b981]" sx={{ fontSize: 16 }} /> {room.mobile}
                      </span>
                    </td>
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
                  <td colSpan="9" className="text-center py-10 text-gray-500 text-[14px]">No rooms found.</td>
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full border-2 border-white/30 overflow-hidden flex items-center justify-center bg-white/10 text-[10px]">
                  IMG
                </div>
                <h2 className="text-[16px] font-bold">
                  {editingId ? `Room #${form.roomNo}` : 'New Record'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
                <TextField 
                  required 
                  label="Room No*" 
                  value={form.roomNo} 
                  onChange={e => setForm({...form, roomNo: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

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

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Select Meal*</InputLabel>
                  <Select value={form.meal} label="Select Meal*" onChange={e => setForm({...form, meal: e.target.value})}>
                    <MenuItem value="None">None</MenuItem>
                    <MenuItem value="Breakfast">Breakfast</MenuItem>
                    <MenuItem value="Lunch">Lunch</MenuItem>
                    <MenuItem value="Dinner">Dinner</MenuItem>
                    <MenuItem value="All">All</MenuItem>
                  </Select>
                </FormControl>

                <TextField 
                  type="number"
                  label="Capacity" 
                  value={form.capacity} 
                  onChange={e => setForm({...form, capacity: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select value={form.status} label="Status*" onChange={e => setForm({...form, status: e.target.value})}>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Booked">Booked</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <TextField 
                  required
                  type="number"
                  label="Rent" 
                  value={form.rent} 
                  onChange={e => setForm({...form, rent: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><span className="text-gray-900 font-bold">$</span></InputAdornment>
                  }}
                />

                <TextField 
                  required
                  label="Mobile*" 
                  value={form.mobile} 
                  onChange={e => setForm({...form, mobile: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><span className="text-gray-700">📞</span></InputAdornment>
                  }}
                />

              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <button type="submit" className="px-2 py-2.5 rounded-full border border-transparent bg-green-50 text-[var(--primary-main)] border-green-200 font-bold text-[13px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
                  Save
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-2 py-2.5 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </form>
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
              <p className="text-[14px] text-gray-600 font-medium">Mobile: {roomToDelete.mobile}</p>
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
