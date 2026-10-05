import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Box, Typography } from '@mui/material';
import RefreshButton from '../../../components/common/RefreshButton';
import {
  Search, AddCircleOutlined,
  TableChart, PictureAsPdf, Close, EditOutlined, DeleteOutlined,
  MeetingRoomOutlined, CleaningServicesOutlined, 
  EventOutlined, AccessTimeOutlined, PersonOutlined, FlagOutlined
} from '@mui/icons-material';
import { getRooms, saveRooms } from './hkStore';
import { getRoomByRoomNo } from '../../rooms/state/roomStore';

const statusStyles = {
  'Scheduled': 'bg-blue-50 text-blue-500',
  'Completed': 'bg-green-50 text-green-600',
  'In Progress': 'bg-orange-50 text-orange-500',
  'Clean / Ready': 'bg-green-50 text-green-600',
  'Cleaning': 'bg-orange-50 text-orange-500',
  'Dirty': 'bg-red-50 text-red-500',
  'Assigned': 'bg-purple-50 text-purple-600',
  'Inspection Required': 'bg-amber-50 text-amber-600',
  'Maintenance': 'bg-gray-100 text-gray-600',
  'DND': 'bg-red-50 text-red-600'
};

const priorityStyles = {
  'Standard': 'bg-blue-100 text-blue-600',
  'Normal': 'bg-blue-100 text-blue-600',
  'High': 'bg-orange-100 text-orange-600',
  'Urgent': 'bg-red-100 text-red-600',
  'Low': 'bg-green-100 text-green-600'
};

function mapCanonicalToRecord(r) {
  const roomNo = String(r.roomNo || r.id || '');
  const guestName = r.guestName !== undefined ? r.guestName : (r.guest && r.guest !== '-' ? r.guest : '');
  const assignedStaff = r.assignedStaff !== undefined ? r.assignedStaff : (r.assignee && r.assignee !== '-' ? r.assignee : '');
  const completionTime = r.completionTime !== undefined ? r.completionTime : (r.completed && r.completed !== '-' ? r.completed : '');
  const scheduledTime = r.scheduledTime !== undefined ? r.scheduledTime : (r.started && r.started !== '-' ? r.started : '');

  let cleaningStatus = r.cleaningStatus;
  if (!cleaningStatus) {
    if (r.status === 'Clean / Ready') cleaningStatus = 'Completed';
    else if (r.status === 'Cleaning') cleaningStatus = 'In Progress';
    else cleaningStatus = 'Scheduled';
  }

  let priority = r.priority || 'Standard';
  if (priority === 'Normal') priority = 'Standard';

  const todayDate = new Date().toISOString().split('T')[0];

  return {
    ...r,
    id: r.id || roomNo,
    roomNo,
    guestName,
    cleaningStatus,
    scheduledDate: r.scheduledDate || todayDate,
    scheduledTime: scheduledTime || '09:00',
    assignedStaff,
    completionTime,
    notes: r.notes || '',
    priority,
    cleaningType: r.cleaningType && r.cleaningType !== '-' ? r.cleaningType : 'Full Clean',
    lastCleanedDate: r.lastCleanedDate || (r.status === 'Clean / Ready' ? 'Today' : ''),
    floor: r.floor || (roomNo.length >= 3 ? roomNo[0] : '1'),
    frequency: r.frequency || 'Daily'
  };
}

function mapFormToCanonical(form, existingRecord = {}) {
  const roomNo = String(form.roomNo || existingRecord.roomNo || existingRecord.id || '').trim();
  const canonicalRoom = getRoomByRoomNo(roomNo);
  const roomId = existingRecord.roomId || (canonicalRoom ? canonicalRoom.id : undefined);

  let status = existingRecord.status;
  if (form.cleaningStatus === 'Completed') {
    status = 'Clean / Ready';
  } else if (form.cleaningStatus === 'In Progress') {
    status = 'Cleaning';
  } else if (form.cleaningStatus === 'Scheduled') {
    status = form.assignedStaff && form.assignedStaff.trim() ? 'Assigned' : 'Dirty';
  } else if (!status) {
    status = 'Dirty';
  }

  return {
    ...existingRecord,
    id: roomNo,
    roomId,
    roomNo,
    guestName: form.guestName || '',
    guest: form.guestName && form.guestName.trim() ? form.guestName : (existingRecord.guest || '-'),
    cleaningStatus: form.cleaningStatus || 'Scheduled',
    status,
    priority: form.priority || 'Standard',
    cleaningType: form.cleaningType || 'Full Clean',
    assignedStaff: form.assignedStaff || '',
    assignee: form.assignedStaff && form.assignedStaff.trim() ? form.assignedStaff : (existingRecord.assignee || '-'),
    scheduledDate: form.scheduledDate || '',
    scheduledTime: form.scheduledTime || '',
    started: form.scheduledTime && form.scheduledTime.trim() ? form.scheduledTime : (existingRecord.started || '-'),
    completionTime: form.completionTime || '',
    completed: form.completionTime && form.completionTime.trim() ? form.completionTime : (existingRecord.completed || '-'),
    notes: form.notes || '',
    floor: form.floor || existingRecord.floor || (roomNo.length >= 3 ? roomNo[0] : '1'),
    lastCleanedDate: existingRecord.lastCleanedDate || (form.cleaningStatus === 'Completed' ? new Date().toLocaleDateString() : ''),
    frequency: existingRecord.frequency || 'Daily'
  };
}

export default function RoomsAndCleaning() {
  const [records, setRecords] = useState(() => getRooms().map(mapCanonicalToRecord));
  const [search, setSearch] = useState('');
  
  // Columns state
  const [visibleColumns, setVisibleColumns] = useState({
    Room: true, Guest: true,
    'Cleaning Type': true, Status: true, Priority: true,
    'Assigned Staff': true, 'Completed At': true, Notes: true,
    'Last Cleaned': true, Actions: true
  });
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    roomNo: '', guestName: '', scheduledDate: '', scheduledTime: '',
    assignedStaff: '', completionTime: '', cleaningStatus: 'Scheduled',
    priority: 'Standard', notes: '', cleaningType: 'Full Clean'
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  const openViewModal = (record) => {
    setViewRecord(record);
    setIsViewModalOpen(true);
  };

  useEffect(() => {
    const syncData = () => {
      setRecords(getRooms().map(mapCanonicalToRecord));
    };
    window.addEventListener('storage', syncData);
    window.addEventListener('hk_update', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('hk_update', syncData);
    };
  }, []);

  const handleRefresh = () => {
    setSearch('');
    setRecords(getRooms().map(mapCanonicalToRecord));
    
    setVisibleColumns({
      Room: true, Guest: true,
      'Cleaning Type': true, Status: true, Priority: true,
      'Assigned Staff': true, 'Completed At': true, Notes: true,
      'Last Cleaned': true, Actions: true
    });
  };

  const filteredRecords = records.filter(r => 
    (r.roomNo || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.guestName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.assignedStaff || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\n';
    
    filteredRecords.forEach(r => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'Room') val = r.roomNo;
        else if (col === 'Guest') val = r.guestName;
        else if (col === 'Cleaning Type') val = r.cleaningType;
        else if (col === 'Status') val = r.cleaningStatus;
        else if (col === 'Priority') val = r.priority;
        else if (col === 'Assigned Staff') val = r.assignedStaff;
        else if (col === 'Completed At') val = r.completionTime;
        else if (col === 'Notes') val = r.notes;
        else if (col === 'Last Cleaned') val = r.lastCleanedDate;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'room_cleaning.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = `
    <html>
    <head>
      <title>Room Cleaning Report</title>
      <style>
        body { font-family: sans-serif; padding: 20px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
        th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
        h2 { color: #0f172a; margin-bottom: 5px; }
        .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h2>Room Cleaning Report</h2>
      <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
      <table>
        <thead>
          <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>`;
        
    filteredRecords.forEach(r => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
        if (col === 'Room') val = r.roomNo;
        else if (col === 'Guest') val = r.guestName;
        else if (col === 'Cleaning Type') val = r.cleaningType;
        else if (col === 'Status') val = r.cleaningStatus;
        else if (col === 'Priority') val = r.priority;
        else if (col === 'Assigned Staff') val = r.assignedStaff;
        else if (col === 'Completed At') val = r.completionTime;
        else if (col === 'Notes') val = r.notes;
        else if (col === 'Last Cleaned') val = r.lastCleanedDate;
        html += `<td>${val || ''}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
        </tbody>
      </table>
      <script>
        window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
      </script>
    </body>
    </html>`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm({
      roomNo: '', guestName: '', scheduledDate: '', scheduledTime: '',
      assignedStaff: '', completionTime: '', cleaningStatus: 'Scheduled',
      priority: 'Standard', notes: '', cleaningType: 'Full Clean'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingId(record.id);
    setForm({
      roomNo: record.roomNo,
      guestName: record.guestName,
      scheduledDate: record.scheduledDate,
      scheduledTime: record.scheduledTime,
      assignedStaff: record.assignedStaff,
      completionTime: record.completionTime,
      cleaningStatus: record.cleaningStatus,
      priority: record.priority,
      notes: record.notes,
      cleaningType: record.cleaningType
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const currentCanonicalRooms = getRooms();
    if (editingId) {
      const existing = currentCanonicalRooms.find(r => (r.id === editingId || r.roomNo === editingId));
      const updated = currentCanonicalRooms.map(r =>
        (r.id === editingId || r.roomNo === editingId) ? mapFormToCanonical(form, existing || r) : r
      );
      saveRooms(updated);
      setRecords(getRooms().map(mapCanonicalToRecord));
    } else {
      const newRecord = mapFormToCanonical(form, {
        id: form.roomNo,
        roomNo: form.roomNo,
        floor: form.roomNo ? form.roomNo[0] : '1',
        lastCleanedDate: form.cleaningStatus === 'Completed' ? new Date().toLocaleDateString() : '',
        frequency: 'Daily'
      });
      saveRooms([...currentCanonicalRooms, newRecord]);
      setRecords(getRooms().map(mapCanonicalToRecord));
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    const currentCanonicalRooms = getRooms();
    const updated = currentCanonicalRooms.filter(r => r.id !== recordToDelete.id && r.roomNo !== recordToDelete.roomNo);
    saveRooms(updated);
    setRecords(getRooms().map(mapCanonicalToRecord));
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      backgroundColor: '#ffffff',
      fontSize: '12px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '12px',
      color: '#64748b',
      '&.Mui-focused': { color: '#1b7f43' }
    }
  };

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">
      {/* Card Wrapper */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-bold text-gray-800 whitespace-nowrap">Room Cleaning</h1>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-2.5 pr-7 py-1 border border-gray-200 rounded-md text-xs w-[140px] sm:w-[180px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-colors"
              />
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 15 }} />
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={openNewModal} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Record">
              <AddCircleOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
            </button>
            <RefreshButton onClick={handleRefresh} />
            <button onClick={handleExportCSV} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sky-50 transition-colors cursor-pointer" title="Export CSV">
              <TableChart sx={{ fontSize: 16 }} className="text-sky-600" />
            </button>
            <button onClick={handleExportPDF} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50 transition-colors cursor-pointer" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 16 }} className="text-rose-600" />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full overflow-hidden">
          <table className="table-fixed w-full text-left border-collapse">
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Room</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Guest</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Cleaning Type</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Assigned Staff</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Completed At</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Notes</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Cleaned</th>
                <th className="py-2 px-1 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecords.map((record) => (
                <tr 
                  key={record.id} 
                  onClick={() => openViewModal(record)} 
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer border-b border-gray-50"
                >
                  <td className="py-1.5 px-1.5 text-[11px] font-bold text-gray-900 whitespace-nowrap">{record.roomNo}</td>
                  <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-800 truncate" title={record.guestName}>{record.guestName || '-'}</td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">{record.cleaningType}</td>
                  
                  <td className="py-1.5 px-1.5 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold inline-block ${statusStyles[record.cleaningStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {record.cleaningStatus}
                    </span>
                  </td>
                  
                  <td className="py-1.5 px-1.5 whitespace-nowrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold inline-block ${priorityStyles[record.priority] || 'bg-blue-50 text-blue-600'}`}>
                      {record.priority}
                    </span>
                  </td>

                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate" title={record.assignedStaff}>{record.assignedStaff || '-'}</td>
                  <td className="py-1.5 px-1.5 text-[10.5px] text-gray-600 whitespace-nowrap">{record.completionTime || '-'}</td>
                  <td className="py-1.5 px-1.5 text-[10.5px] text-gray-500 italic truncate" title={record.notes}>{record.notes || '-'}</td>
                  
                  <td className="py-1.5 px-1.5 text-[10.5px] text-gray-600 whitespace-nowrap">
                    {record.lastCleanedDate || '-'}
                  </td>

                  <td className="py-1.5 px-1 relative text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditModal(record); }} 
                        className="text-blue-500 hover:text-blue-700 p-0.5 transition-colors cursor-pointer" 
                        title="Edit"
                      >
                        <EditOutlined sx={{ fontSize: 15 }} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); confirmDelete(record); }} 
                        className="text-rose-500 hover:text-rose-700 p-0.5 transition-colors cursor-pointer" 
                        title="Delete"
                      >
                        <DeleteOutlined sx={{ fontSize: 15 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-gray-400 text-xs">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination footer */}
        <div className="px-3 py-1.5 sm:py-2 mt-auto flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 bg-slate-50/40">
          <span>Showing {filteredRecords.length} of {records.length} records</span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-700">Page 1 of 1</span>
          </div>
        </div>
      </div>

      {/* Edit/New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[580px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1b7f43] px-4 py-2.5 flex items-center justify-between text-white">
              <h2 className="text-sm font-bold">
                {editingId ? `Edit Room #${form.roomNo}` : 'New Room Cleaning Record'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 17 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal} className="p-4 sm:p-5 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <TextField required label="Room No*" name="roomNo" value={form.roomNo} onChange={(e)=>setForm({...form, roomNo: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required label="Guest Name*" name="guestName" value={form.guestName} onChange={(e)=>setForm({...form, guestName: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                
                <TextField
                  required
                  type="date"
                  label="Scheduled Date*"
                  name="scheduledDate"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  sx={muiInputSx}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  required
                  type="time"
                  label="Scheduled Time*"
                  name="scheduledTime"
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                  sx={muiInputSx}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField required label="Assigned Staff*" name="assignedStaff" value={form.assignedStaff} onChange={(e)=>setForm({...form, assignedStaff: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField type="time" label="Completion Time" name="completionTime" value={form.completionTime} onChange={(e)=>setForm({...form, completionTime: e.target.value})} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Cleaning Status*</InputLabel>
                  <Select name="cleaningStatus" value={form.cleaningStatus} label="Cleaning Status*" onChange={(e)=>setForm({...form, cleaningStatus: e.target.value})}>
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Priority</InputLabel>
                  <Select name="priority" value={form.priority} label="Priority" onChange={(e)=>setForm({...form, priority: e.target.value})}>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>

                <div className="sm:col-span-2">
                  <TextField label="Notes" name="notes" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-[#1b7f43] text-white font-semibold text-xs hover:bg-[#166534] transition-colors cursor-pointer shadow-xs">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[340px] p-5 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-800 mb-3 text-left">Are you sure?</h3>
            <div className="text-left space-y-2 mb-5 bg-slate-50 p-3 rounded-lg text-xs">
              <p className="text-gray-700 grid grid-cols-[100px_1fr]"><span className="font-semibold text-gray-500">Room No:</span> <span className="font-bold text-gray-900">{recordToDelete.roomNo}</span></p>
              <p className="text-gray-700 grid grid-cols-[100px_1fr]"><span className="font-semibold text-gray-500">Assign Staff:</span> <span>{recordToDelete.assignedStaff}</span></p>
              <p className="text-gray-700 grid grid-cols-[100px_1fr]"><span className="font-semibold text-gray-500">Cleaning Type:</span> <span>{recordToDelete.cleaningType}</span></p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[560px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[#1b7f43] px-4 py-3 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {viewRecord.roomNo ? viewRecord.roomNo[0] : 'R'}
                </div>
                <div>
                  <h2 className="text-sm font-bold">Room #{viewRecord.roomNo} Cleaning</h2>
                  <p className="text-white/80 text-[11px]">{viewRecord.cleaningStatus}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewRecord); }} 
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  title="Edit"
                >
                  <EditOutlined sx={{ fontSize: 15 }} />
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <Close sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Room No */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#e5f4eb] flex items-center justify-center text-[#1b7f43]">
                    <MeetingRoomOutlined sx={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Room No</p>
                    <p className="text-xs font-bold text-gray-800">{viewRecord.roomNo}</p>
                  </div>
                </div>

                {/* Cleaning Status */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#e5f4eb] flex items-center justify-center text-[#1b7f43]">
                    <CleaningServicesOutlined sx={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusStyles[viewRecord.cleaningStatus]}`}>
                      {viewRecord.cleaningStatus}
                    </span>
                  </div>
                </div>

                {/* Scheduled Date */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#e5f4eb] flex items-center justify-center text-[#1b7f43]">
                    <EventOutlined sx={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                    <p className="text-xs font-bold text-gray-800">{viewRecord.scheduledDate || '-'}</p>
                  </div>
                </div>

                {/* Scheduled Time */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#e5f4eb] flex items-center justify-center text-[#1b7f43]">
                    <AccessTimeOutlined sx={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time</p>
                    <p className="text-xs font-bold text-gray-800">{viewRecord.scheduledTime || '-'}</p>
                  </div>
                </div>

                {/* Assigned Staff */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#e5f4eb] flex items-center justify-center text-[#1b7f43]">
                    <PersonOutlined sx={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Staff</p>
                    <p className="text-xs font-bold text-gray-800">{viewRecord.assignedStaff || '-'}</p>
                  </div>
                </div>

                {/* Priority */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-gray-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#e5f4eb] flex items-center justify-center text-[#1b7f43]">
                    <FlagOutlined sx={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</p>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${priorityStyles[viewRecord.priority]}`}>
                      {viewRecord.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
