import { 
  Add, Refresh, PictureAsPdf, EditOutlined, DeleteOutlined, Close,
  KeyboardArrowLeft, KeyboardArrowRight, TableChart, 
  AddCircleOutlined, PhoneOutlined, Inventory2, FormatListBulleted, GridView 
} from '@mui/icons-material';
import { 
  TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, Alert, CircularProgress, Snackbar
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import roomService from '../../../services/roomService';
import { toFrontendRoom, toBackendRoomPayload, toFrontendRoomType } from '../adapters/roomAdapter';
import { syncRoomsFromBackend, getRooms as getCachedRooms, ROOM_UPDATED_EVENT } from '../state/roomStore';
import RoomInventoryModal from '../../inventory/pages/components/RoomInventoryModal';
import { getInventoryItems } from '../../inventory/pages/inventoryStore';
import SearchInput from '../../../components/common/SearchInput';

export default function Rooms() {
  const [rooms, setRooms] = useState(() => getCachedRooms() || []);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [selectedRoomForStock, setSelectedRoomForStock] = useState(null);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [form, setForm] = useState({
    roomNo: '', 
    roomTypeId: '', 
    roomType: '', 
    floor: '1', 
    acNonAc: 'AC', 
    meal: 'All', 
    capacity: '', 
    status: 'Open', 
    housekeepingStatus: 'Clean',
    rent: '', 
    mobile: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, typesRes] = await Promise.all([
        roomService.getRooms().catch(err => ({ data: [] })),
        roomService.getRoomTypes().catch(err => ({ data: [] }))
      ]);

      const rawRooms = Array.isArray(roomsRes?.data) ? roomsRes.data : [];
      const adaptedRooms = rawRooms.map(toFrontendRoom);
      setRooms(adaptedRooms);
      syncRoomsFromBackend(adaptedRooms);

      const rawTypes = Array.isArray(typesRes?.data) ? typesRes.data : [];
      const adaptedTypes = rawTypes.map(toFrontendRoomType);
      setRoomTypes(adaptedTypes);
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || 'Failed to load rooms from backend',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived state
  const filteredRooms = rooms.filter(r => {
    const roomNoStr = String(r.roomNo || '');
    const roomTypeStr = String(r.roomType || '');
    const matchesSearch = roomNoStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          roomTypeStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
                          r.status === statusFilter ||
                          (statusFilter === 'Open' && (r.status === 'Open' || r.status === 'Available' || r.rawStatus === 'AVAILABLE')) ||
                          (statusFilter === 'Booked' && (r.status === 'Booked' || r.status === 'Occupied' || r.rawStatus === 'OCCUPIED')) ||
                          (statusFilter === 'Inactive' && (r.status === 'Inactive' || r.status === 'Maintenance' || r.rawStatus === 'MAINTENANCE' || r.rawStatus === 'OUT_OF_ORDER' || r.rawStatus === 'CLEANING'));
    return matchesSearch && matchesStatus;
  });
  
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const currentRooms = filteredRooms.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOpenNew = () => {
    setEditingId(null);
    const defaultTypeId = roomTypes[0]?._id || roomTypes[0]?.id || '';
    const defaultType = roomTypes[0] || null;
    setForm({ 
      roomNo: '', 
      roomTypeId: defaultTypeId, 
      roomType: defaultType?.name || '', 
      floor: '1',
      acNonAc: 'AC', 
      meal: 'All', 
      capacity: defaultType?.capacity || 2, 
      status: 'Open', 
      housekeepingStatus: 'Clean',
      rent: defaultType?.rent || 0, 
      mobile: '' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingId(room._id || room.id);
    setForm({
      ...room,
      roomTypeId: room.roomTypeId || room.room_type_id || '',
      floor: room.floor || '1',
      status: room.status || 'Open',
      housekeepingStatus: room.housekeepingStatus || 'Clean',
    });
    setIsModalOpen(true);
  };

  const handleRoomTypeChange = (e) => {
    const selectedId = e.target.value;
    const foundType = roomTypes.find(t => (t._id || t.id) === selectedId);
    setForm(prev => ({
      ...prev,
      roomTypeId: selectedId,
      roomType: foundType?.name || prev.roomType,
      rent: foundType?.rent !== undefined ? foundType.rent : prev.rent,
      capacity: foundType?.capacity !== undefined ? foundType.capacity : prev.capacity
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.roomNo.trim()) {
      setNotification({ open: true, message: 'Room number is required', severity: 'error' });
      return;
    }
    if (!form.roomTypeId) {
      setNotification({ open: true, message: 'Please select a valid Room Type. If none exist, create one in Room Types first.', severity: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = toBackendRoomPayload(form);
      if (editingId) {
        const res = await roomService.updateRoom(editingId, payload);
        const updated = toFrontendRoom(res.data);
        const updatedList = rooms.map(r => ((r._id === editingId || r.id === editingId) ? updated : r));
        setRooms(updatedList);
        syncRoomsFromBackend(updatedList);
        setNotification({ open: true, message: 'Room updated successfully', severity: 'success' });
      } else {
        const res = await roomService.createRoom(payload);
        const created = toFrontendRoom(res.data);
        const updatedList = [created, ...rooms];
        setRooms(updatedList);
        syncRoomsFromBackend(updatedList);
        setNotification({ open: true, message: 'Room created successfully', severity: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || (err.status === 409 ? 'A room with this number already exists' : 'Failed to save room'),
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;
    setIsSubmitting(true);
    try {
      const targetId = roomToDelete._id || roomToDelete.id;
      await roomService.deleteRoom(targetId);
      const updatedList = rooms.filter(r => r._id !== targetId && r.id !== targetId);
      setRooms(updatedList);
      syncRoomsFromBackend(updatedList);
      setNotification({ open: true, message: 'Room deleted successfully', severity: 'success' });
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
    } catch (err) {
      setNotification({
        open: true,
        message: err.status === 409 
          ? 'Occupied rooms cannot be deleted from inventory.' 
          : (err.message || 'Failed to delete room'),
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Booked':
      case 'OCCUPIED': return 'bg-[#eff6ff] text-[#3b82f6]';
      case 'Open':
      case 'AVAILABLE': return 'bg-[#ecfdf5] text-[#10b981]';
      case 'Inactive':
      case 'MAINTENANCE':
      case 'CLEANING':
      case 'OUT_OF_ORDER': return 'bg-[#fff7ed] text-[#f97316]';
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
      csvRows.push([room.roomNo, room.roomType, room.acNonAc, room.meal, room.capacity, room.status, room.rent, room.mobile].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'AllRooms.csv');
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
    doc.text('AllRooms', 14, 15);
    const tableColumn = ['Room No', 'Room Type', 'AC/Non AC', 'Meal', 'Bed Capacity', 'Status', 'Rent', 'Mobile'];
    const tableRows = rooms.map(room => [room.roomNo, room.roomType, room.acNonAc, room.meal, room.capacity, room.status, room.rent, room.mobile]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('AllRooms.pdf');
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
            <h2 className="text-xs sm:text-sm font-bold text-gray-800">Rooms</h2>
            <SearchInput
              placeholder="Search..."
              value={searchTerm}
              onChange={setSearchTerm}
              iconPosition="left"
              size="sm"
              width="w-36 sm:w-48"
              inputClassName="border-gray-200 text-xs py-1"
            />

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
                  className={`px-2 py-1 text-[10px] sm:text-[10.5px] font-medium transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
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
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleOpenNew} 
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Add"
              aria-label="Add room"
            >
              <AddCircleOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
            </button>
            <button 
              onClick={loadData} 
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer"
              title="Refresh"
              aria-label="Refresh rooms"
            >
              <Refresh sx={{ fontSize: 18 }} className={`text-[var(--primary-main)] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center rounded-lg border border-gray-200 p-0.5" aria-label="Room view selector">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Table view"
                aria-label="Table view"
                className={`p-1 rounded-md transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <FormatListBulleted sx={{ fontSize: 15 }} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Card view"
                aria-label="Card view"
                className={`p-1 rounded-md transition-colors cursor-pointer ${viewMode === 'cards' ? 'bg-[#e5f4eb] text-[#1b7f43]' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <GridView sx={{ fontSize: 15 }} />
              </button>
            </div>
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

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center py-10">
            <CircularProgress size={28} sx={{ color: 'var(--primary-main)' }} />
          </div>
        )}

        {/* Card View */}
        {!loading && viewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 p-2.5">
            {currentRooms.map((room) => (
              <article key={room.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
                <img src={room.roomImage} alt={`Room ${room.roomNo}`} className="w-full h-20 object-cover" />
                <div className="p-2.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <p className="text-xs font-bold text-gray-800">Room {room.roomNo}</p>
                      <p className="text-[10px] text-gray-500">{room.roomType}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${getStatusStyles(room.status)}`}>{room.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-0.5 text-[10.5px] text-gray-600">
                    <span>Floor {room.floor}</span><span>{room.capacity} Guests</span>
                    <span>{room.housekeepingStatus}</span><span className="font-semibold text-gray-800">${room.rent}/night</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-gray-500"><PhoneOutlined sx={{ fontSize: 11 }} />{room.mobile || '—'}</span>
                    <div className="flex gap-0.5">
                      <button onClick={() => setSelectedRoomForStock(room.roomNo)} className="text-[#1b7f43] hover:bg-[#e5f4eb] p-1 rounded cursor-pointer" title="View room stock" aria-label="View room stock"><Inventory2 sx={{ fontSize: 14 }} /></button>
                      <button onClick={() => handleOpenEdit(room)} className="text-[#3b82f6] hover:bg-blue-50 p-1 rounded cursor-pointer" title="Edit room" aria-label="Edit room"><EditOutlined sx={{ fontSize: 14 }} /></button>
                      <button onClick={() => handleOpenDelete(room)} className="text-[#ef4444] hover:bg-red-50 p-1 rounded cursor-pointer" title="Delete room" aria-label="Delete room"><DeleteOutlined sx={{ fontSize: 14 }} /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {currentRooms.length === 0 && <p className="col-span-full py-6 text-center text-gray-500 text-xs">No rooms found.</p>}
          </div>
        )}

        {/* Table view */}
        {!loading && viewMode === 'table' && (
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <colgroup>
                <col style={{ width: '14%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/50">
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room No</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room Type</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Floor</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Housekeeping</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Bed Capacity</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rent</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-1.5 px-1.5 cursor-pointer" onClick={() => setSelectedRoomForStock(room.roomNo)}>
                      <div className="flex items-center gap-1.5">
                        <img src={room.roomImage} alt="room" className="w-5.5 h-5.5 rounded-full object-cover shadow-xs border border-gray-200 shrink-0" />
                        <span className="text-[11px] font-bold text-gray-800 hover:text-[#1b7f43] hover:underline transition-colors truncate" title="Click to view room stock">{room.roomNo}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate">{room.roomType}</td>
                    <td className="py-1.5 px-1.5 text-[11px] text-gray-600">{room.floor || '1'}</td>
                    <td className="py-1.5 px-1.5 text-[11px] text-gray-600">{room.housekeepingStatus}</td>
                    <td className="py-1.5 px-1.5 text-[11px] text-gray-600">{room.capacity}</td>
                    <td className="py-1.5 px-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${getStatusStyles(room.status)}`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-700">${room.rent}</td>
                    <td className="py-1.5 px-1.5">
                      <span className="flex items-center gap-1 text-[10.5px] text-gray-600 truncate">
                        <PhoneOutlined className="text-[#10b981] shrink-0" sx={{ fontSize: 12 }} /> {room.mobile || '—'}
                      </span>
                    </td>
                    <td className="py-1.5 px-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedRoomForStock(room.roomNo)} className="text-[#1b7f43] hover:bg-[#e5f4eb] p-0.5 rounded transition-colors cursor-pointer" title="View room stock" aria-label="View room stock">
                          <Inventory2 sx={{ fontSize: 14 }} />
                        </button>
                        <button onClick={() => handleOpenEdit(room)} className="text-[#3b82f6] hover:bg-blue-50 p-0.5 rounded transition-colors cursor-pointer" title="Edit room" aria-label="Edit room">
                          <EditOutlined sx={{ fontSize: 14 }} />
                        </button>
                        <button onClick={() => handleOpenDelete(room)} className="text-[#ef4444] hover:bg-red-50 p-0.5 rounded transition-colors cursor-pointer" title="Delete room" aria-label="Delete room">
                          <DeleteOutlined sx={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentRooms.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-6 text-gray-500 text-xs">No rooms found.</td>
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
            {filteredRooms.length > 0 ? Math.min((page - 1) * itemsPerPage + 1, filteredRooms.length) : 0} - {Math.min(page * itemsPerPage, filteredRooms.length)} of {filteredRooms.length}
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <div className="w-6 h-6 rounded-full border border-white/30 overflow-hidden flex items-center justify-center bg-white/10 text-[9px]">
                  IMG
                </div>
                <h2 className="text-sm font-bold">
                  {editingId ? `Room #${form.roomNo}` : 'New Record'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 16 }} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                <TextField 
                  id="room-form-room-no"
                  required 
                  label="Room No*" 
                  value={form.roomNo} 
                  onChange={e => setForm({...form, roomNo: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <FormControl size="small" fullWidth sx={muiInputSx} required>
                  <InputLabel id="room-form-room-type-label">Select Room Type*</InputLabel>
                  <Select
                    labelId="room-form-room-type-label"
                    id="room-form-room-type-select"
                    value={form.roomTypeId || ''}
                    label="Select Room Type*"
                    onChange={handleRoomTypeChange}
                  >
                    {roomTypes.map((type) => (
                      <MenuItem key={type._id || type.id} value={type._id || type.id}>
                        {type.name} ({type.code}) — ${type.rent}
                      </MenuItem>
                    ))}
                    {roomTypes.length === 0 && (
                      <MenuItem disabled value="">
                        No Room Types configured. Please add one in Room Types first.
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="room-form-ac-label">AC/Non AC*</InputLabel>
                  <Select
                    labelId="room-form-ac-label"
                    id="room-form-ac-select"
                    value={form.acNonAc || 'AC'}
                    label="AC/Non AC*"
                    onChange={e => setForm({...form, acNonAc: e.target.value})}
                  >
                    <MenuItem value="AC">AC</MenuItem>
                    <MenuItem value="Non AC">Non AC</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="room-form-meal-label">Select Meal*</InputLabel>
                  <Select
                    labelId="room-form-meal-label"
                    id="room-form-meal-select"
                    value={form.meal || 'All'}
                    label="Select Meal*"
                    onChange={e => setForm({...form, meal: e.target.value})}
                  >
                    <MenuItem value="None">None</MenuItem>
                    <MenuItem value="Breakfast">Breakfast</MenuItem>
                    <MenuItem value="Lunch">Lunch</MenuItem>
                    <MenuItem value="Dinner">Dinner</MenuItem>
                    <MenuItem value="All">All</MenuItem>
                  </Select>
                </FormControl>

                <TextField 
                  id="room-form-floor"
                  label="Floor" 
                  value={form.floor} 
                  onChange={e => setForm({...form, floor: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel id="room-form-status-label">Status*</InputLabel>
                  <Select
                    labelId="room-form-status-label"
                    id="room-form-status-select"
                    value={form.status}
                    label="Status*"
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    <MenuItem value="Open">Available (Open)</MenuItem>
                    <MenuItem value="Booked">Occupied (Booked)</MenuItem>
                    <MenuItem value="Inactive">Maintenance / Cleaning (Inactive)</MenuItem>
                  </Select>
                </FormControl>

                <TextField 
                  id="room-form-capacity"
                  type="number"
                  label="Capacity" 
                  value={form.capacity} 
                  onChange={e => setForm({...form, capacity: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />

                <TextField 
                  id="room-form-rent"
                  type="number"
                  label="Rent" 
                  value={form.rent} 
                  onChange={e => setForm({...form, rent: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><span className="text-gray-900 font-bold text-xs">$</span></InputAdornment>
                  }}
                />

                <TextField 
                  id="room-form-mobile"
                  label="Mobile*" 
                  value={form.mobile} 
                  onChange={e => setForm({...form, mobile: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><span className="text-gray-700 text-xs">📞</span></InputAdornment>
                  }}
                />

              </div>
              
              <div className="flex items-center gap-2.5 mt-5">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg border border-green-200 bg-green-50 text-[var(--primary-main)] font-semibold text-xs hover:bg-green-100 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
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
      {isDeleteModalOpen && roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[300px] overflow-hidden flex flex-col p-4 sm:p-5" onClick={e => e.stopPropagation()}>
            <h2 className="text-base font-bold text-gray-800 mb-3 text-center">Are you sure?</h2>
            
            <div className="space-y-1.5 mb-5 text-xs text-gray-600">
              <p><span className="font-medium text-gray-700">Room No:</span> {roomToDelete.roomNo}</p>
              <p><span className="font-medium text-gray-700">Type:</span> {roomToDelete.roomType}</p>
            </div>
            
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
