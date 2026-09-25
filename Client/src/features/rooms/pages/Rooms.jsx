import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Add, Refresh, PictureAsPdf, EditOutlined, DeleteOutlined, Close, Search, 
  KeyboardArrowLeft, KeyboardArrowRight, TableChart, 
  AddCircleOutlined, PhoneOutlined, Inventory2, FormatListBulleted, GridView 
} from '@mui/icons-material';
import { 
  TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment 
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getRooms, addRoom, updateRoom, deleteRoom, INITIAL_ROOMS, ROOM_UPDATED_EVENT } from '../state/roomStore';
import RoomInventoryModal from '../../inventory/pages/components/RoomInventoryModal';
import { getInventoryItems } from '../../inventory/pages/inventoryStore';

export default function Rooms() {
  const [rooms, setRooms] = useState(getRooms());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [selectedRoomForStock, setSelectedRoomForStock] = useState(null);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    roomNo: '', roomType: 'Delux', acNonAc: 'AC', meal: 'All', capacity: '', status: 'Open', rent: '', mobile: ''
  });

  useEffect(() => {
    const syncRooms = () => setRooms(getRooms());
    window.addEventListener(ROOM_UPDATED_EVENT, syncRooms);
    window.addEventListener('storage', syncRooms);
    return () => {
      window.removeEventListener(ROOM_UPDATED_EVENT, syncRooms);
      window.removeEventListener('storage', syncRooms);
    };
  }, []);

  // Derived state
  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.roomType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                          r.status === statusFilter ||
                          (statusFilter === 'Open' && (r.status === 'Open' || r.status === 'Available')) ||
                          (statusFilter === 'Booked' && (r.status === 'Booked' || r.status === 'Occupied')) ||
                          (statusFilter === 'Inactive' && (r.status === 'Inactive' || r.status === 'Maintenance' || r.status === 'Out of Order'));
    return matchesSearch && matchesStatus;
  });
  
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
      updateRoom(editingId, form);
    } else {
      addRoom({ ...form, roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop' });
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    deleteRoom(roomToDelete.id);
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
        <div className="p-2 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-[16px] font-bold text-gray-700">Rooms</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 20 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-48 lg:w-64 border border-gray-200 rounded-md text-[13.5px] outline-none focus:border-[var(--primary-main)]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-xs overflow-hidden">
              {[
                { label: 'All', value: 'All' },
                { label: 'Available', value: 'Open' },
                { label: 'Booked', value: 'Booked' },
                { label: 'Maintenance', value: 'Inactive' },
              ].map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => { setStatusFilter(f.value); setPage(1); }}
                  className={`px-3 py-1 text-[12px] md:text-[13px] font-medium transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
                    statusFilter === f.value 
                      ? 'bg-[#e5f4eb] text-[#1b7f43] font-bold' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleOpenNew} 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Add"
            >
              <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[#1b7f43]" />
            </button>
            <button 
              onClick={() => { setRooms(INITIAL_ROOMS); setSearchTerm(''); setStatusFilter('All'); }} 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Refresh"
            >
              <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <div className="flex items-center rounded-lg border border-gray-200 p-0.5" aria-label="Room view selector">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table view"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <FormatListBulleted sx={{ fontSize: 18 }} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Card view"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'cards' ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <GridView sx={{ fontSize: 18 }} />
              </button>
            </div>
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

        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {currentRooms.map((room) => (
              <article key={room.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <img src={room.roomImage} alt={`Room ${room.roomNo}`} className="w-full h-28 object-cover" />
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold text-gray-800">Room {room.roomNo}</p>
                      <p className="text-[12px] text-gray-500">{room.roomType}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getStatusStyles(room.status)}`}>{room.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-[12px] text-gray-600">
                    <span>{room.acNonAc}</span><span>{room.capacity} Guests</span>
                    <span>{room.meal} meal</span><span>${room.rent}/night</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-1 text-[12px] text-gray-500"><PhoneOutlined sx={{ fontSize: 14 }} />{room.mobile}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedRoomForStock(room.roomNo)} className="text-[#1b7f43] hover:bg-[#e5f4eb] p-1.5 rounded cursor-pointer" title="View room stock"><Inventory2 sx={{ fontSize: 18 }} /></button>
                      <button onClick={() => handleOpenEdit(room)} className="text-[#3b82f6] hover:bg-blue-50 p-1.5 rounded cursor-pointer" title="Edit room"><EditOutlined sx={{ fontSize: 18 }} /></button>
                      <button onClick={() => handleOpenDelete(room)} className="text-[#ef4444] hover:bg-red-50 p-1.5 rounded cursor-pointer" title="Delete room"><DeleteOutlined sx={{ fontSize: 18 }} /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {currentRooms.length === 0 && <p className="col-span-full py-10 text-center text-gray-500 text-[14px]">No rooms found.</p>}
          </div>
        )}

        {/* Table view */}
        {viewMode === 'table' && (
          <div className="flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Room No</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Room Type</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">AC/Non AC</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Meal</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Bed Capacity</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Status</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Rent</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700">Mobile</th>
                  <th className="px-5 py-3.5 text-[12.5px] font-bold text-gray-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRooms.map((room) => (
                  <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 cursor-pointer" onClick={() => setSelectedRoomForStock(room.roomNo)}>
                      <div className="flex items-center gap-3">
                        <img src={room.roomImage} alt="room" className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-200" />
                        <span className="text-[13.5px] font-bold text-gray-800 hover:text-[#1b7f43] hover:underline transition-colors" title="Click to view room stock">{room.roomNo}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.roomType}</td>
                    <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.acNonAc}</td>
                    <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.meal}</td>
                    <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.capacity}</td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 rounded text-[11px] font-medium ${getStatusStyles(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[13.5px] text-gray-600">{room.rent}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-[13.5px] text-gray-600">
                        <PhoneOutlined className="text-[#10b981]" sx={{ fontSize: 16 }} /> {room.mobile}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSelectedRoomForStock(room.roomNo)} className="text-[#1b7f43] hover:bg-[#e5f4eb] p-1 rounded transition-colors cursor-pointer" title="View room stock">
                          <Inventory2 sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={() => handleOpenEdit(room)} className="text-[#3b82f6] hover:bg-blue-50 p-1 rounded transition-colors cursor-pointer" title="Edit room">
                          <EditOutlined sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={() => handleOpenDelete(room)} className="text-[#ef4444] hover:bg-red-50 p-1 rounded transition-colors cursor-pointer" title="Delete room">
                          <DeleteOutlined sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
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
        )}

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
      {isDeleteModalOpen && roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[320px] overflow-hidden flex flex-col p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-[22px] font-medium text-gray-800 mb-6 text-center">Are you sure?</h2>
            
            <div className="space-y-3 mb-8">
              <p className="text-[14px] text-gray-600 font-medium">Room No: {roomToDelete.roomNo}</p>
              <p className="text-[14px] text-gray-600 font-medium">Mobile: {roomToDelete.mobile}</p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button onClick={handleDelete} className="px-5 py-2 rounded-full bg-[#c2410c] text-white font-bold text-[14px] hover:bg-[#9a3412] transition-colors cursor-pointer shadow-sm">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2 rounded-full bg-[#166534] text-white font-bold text-[14px] hover:bg-[#14532d] transition-colors cursor-pointer shadow-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Stock / Inventory Breakdown Modal */}
      <RoomInventoryModal
        open={Boolean(selectedRoomForStock)}
        onClose={() => setSelectedRoomForStock(null)}
        roomNumber={selectedRoomForStock}
        inventoryItems={getInventoryItems()}
      />

    </div>
  );
}
