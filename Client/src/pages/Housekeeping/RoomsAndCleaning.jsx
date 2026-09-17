import React, { useState, useRef, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import {
  Search, FilterList, AddCircleOutlined, Refresh,
  TableChart, PictureAsPdf, Close, EditOutlined, DeleteOutlined,
  CalendarTodayOutlined, MeetingRoomOutlined, CleaningServicesOutlined, 
  EventOutlined, AccessTimeOutlined, PersonOutlined, FlagOutlined
} from '@mui/icons-material';
import React, { useState } from 'react';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import Bed from '@mui/icons-material/Bed';
import CleaningServices from '@mui/icons-material/CleaningServices';
import CheckCircle from '@mui/icons-material/CheckCircle';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import BuildCircle from '@mui/icons-material/BuildCircle';
import Warning from '@mui/icons-material/Warning';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import MoreVert from '@mui/icons-material/MoreVert';
import TaskAlt from '@mui/icons-material/TaskAlt';
import Block from '@mui/icons-material/Block';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Cancel from '@mui/icons-material/Cancel';
import { IconButton, Menu, MenuItem, Dialog, Select, FormControl, InputLabel } from '@mui/material';

const initialRecords = [
  { id: 1, roomNo: '101', floor: '1', guestName: 'John Doe', cleaningStatus: 'Scheduled', scheduledDate: '08-07-2024', scheduledTime: '09:00', assignedStaff: 'Alice Smith', completionTime: '', notes: 'No special instructions.', priority: 'Standard', cleaningType: 'Full Clean', lastCleanedDate: '08/06/2024', frequency: 'Daily' },
  { id: 2, roomNo: '102', floor: '1', guestName: 'Jane Doe', cleaningStatus: 'Completed', scheduledDate: '08-07-2024', scheduledTime: '10:00', assignedStaff: 'Bob Johnson', completionTime: '10:30', notes: 'Requested extra towels.', priority: 'High', cleaningType: 'Full Clean', lastCleanedDate: '08/06/2024', frequency: 'Daily' },
  { id: 3, roomNo: '103', floor: '1', guestName: 'Emily Clark', cleaningStatus: 'In Progress', scheduledDate: '08-07-2024', scheduledTime: '11:00', assignedStaff: 'Carol Lee', completionTime: '', notes: 'Requires vacuuming.', priority: 'Standard', cleaningType: 'Light Clean', lastCleanedDate: '08/05/2024', frequency: 'Every Other Day' },
  { id: 4, roomNo: '104', floor: '1', guestName: 'Michael Brown', cleaningStatus: 'Scheduled', scheduledDate: '08-07-2024', scheduledTime: '12:00', assignedStaff: 'Diana Green', completionTime: '', notes: 'No specific request...', priority: 'Low', cleaningType: 'Full Clean', lastCleanedDate: '08/04/2024', frequency: 'Weekly' },
  { id: 5, roomNo: '201', floor: '2', guestName: 'Sarah Davis', cleaningStatus: 'Completed', scheduledDate: '08-07-2024', scheduledTime: '13:00', assignedStaff: 'James Wilson', completionTime: '13:45', notes: 'Ensure bathroom is...', priority: 'High', cleaningType: 'Full Clean', lastCleanedDate: '08/06/2024', frequency: 'Daily' },
  { id: 6, roomNo: '202', floor: '2', guestName: 'Robert Martinez', cleaningStatus: 'Scheduled', scheduledDate: '08-07-2024', scheduledTime: '14:00', assignedStaff: 'Linda Anderson', completionTime: '', notes: 'Check for any main...', priority: 'Standard', cleaningType: 'Light Clean', lastCleanedDate: '08/06/2024', frequency: 'Daily' },
  { id: 7, roomNo: '203', floor: '2', guestName: 'Laura Wilson', cleaningStatus: 'In Progress', scheduledDate: '08-07-2024', scheduledTime: '15:00', assignedStaff: 'Frank Taylor', completionTime: '', notes: 'Extra cleaning supp...', priority: 'High', cleaningType: 'Full Clean', lastCleanedDate: '08/05/2024', frequency: 'Every Other Day' },
  { id: 8, roomNo: '204', floor: '2', guestName: 'Jessica Young', cleaningStatus: 'Scheduled', scheduledDate: '08-07-2024', scheduledTime: '16:00', assignedStaff: 'George Thompson', completionTime: '', notes: 'No special instructi...', priority: 'Low', cleaningType: 'Light Clean', lastCleanedDate: '08/03/2024', frequency: 'Weekly' },
];

const statusStyles = {
  'Scheduled': 'bg-blue-50 text-blue-500',
  'Completed': 'bg-green-50 text-green-600',
  'In Progress': 'bg-orange-50 text-orange-500'
};

const priorityStyles = {
  'Standard': 'bg-blue-100 text-blue-600',
  'High': 'bg-orange-100 text-orange-600',
  'Low': 'bg-green-100 text-green-600'
};

export default function RoomsAndCleaning() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState('');
  
  // Columns Menu state
  const [visibleColumns, setVisibleColumns] = useState({
    'Room No': true, Floor: true, 'Guest Name': true,
    'Cleaning Status': true, 'Scheduled Date': true, 'Scheduled Time': true,
    'Assigned Staff': true, 'Completion Time': true, Notes: true,
    Priority: true, 'Cleaning Type': true, 'Last Cleaned Date': true, Frequency: true, Actions: true
  });
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const filterMenuRef = useRef(null);
  
  // Selected Rows
  
  
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
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setSearch('');
    setRecords(initialRecords);
    
    setVisibleColumns({
      'Room No': true, Floor: true, 'Guest Name': true,
      'Cleaning Status': true, 'Scheduled Date': true, 'Scheduled Time': true,
      'Assigned Staff': true, 'Completion Time': true, Notes: true,
      Priority: true, 'Cleaning Type': true, 'Last Cleaned Date': true, Frequency: true, Actions: true
    });
  };

  const filteredRecords = records.filter(r => 
    r.roomNo.toLowerCase().includes(search.toLowerCase()) ||
    r.guestName.toLowerCase().includes(search.toLowerCase()) || 
    r.assignedStaff.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions' );
    let csvContent = activeCols.join(',') + '\n';
    
    filteredRecords.forEach(r => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'Room No') val = r.roomNo;
        else if (col === 'Floor') val = r.floor;
        else if (col === 'Guest Name') val = r.guestName;
        else if (col === 'Cleaning Status') val = r.cleaningStatus;
        else if (col === 'Scheduled Date') val = r.scheduledDate;
        else if (col === 'Scheduled Time') val = r.scheduledTime;
        else if (col === 'Assigned Staff') val = r.assignedStaff;
        else if (col === 'Completion Time') val = r.completionTime;
        else if (col === 'Notes') val = r.notes;
        else if (col === 'Priority') val = r.priority;
        else if (col === 'Cleaning Type') val = r.cleaningType;
        else if (col === 'Last Cleaned Date') val = r.lastCleanedDate;
        else if (col === 'Frequency') val = r.frequency;
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
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions' );
    let html = `
      <html>
        <head>
          <title>Room Cleaning Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
            h2 { color: #0f172a; margin-bottom: 5px; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Room Cleaning Report</h2>
          <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;
    
    filteredRecords.forEach(r => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
        if (col === 'Room No') val = r.roomNo;
        else if (col === 'Floor') val = r.floor;
        else if (col === 'Guest Name') val = r.guestName;
        else if (col === 'Cleaning Status') val = r.cleaningStatus;
        else if (col === 'Scheduled Date') val = r.scheduledDate;
        else if (col === 'Scheduled Time') val = r.scheduledTime;
        else if (col === 'Assigned Staff') val = r.assignedStaff;
        else if (col === 'Completion Time') val = r.completionTime;
        else if (col === 'Notes') val = r.notes;
        else if (col === 'Priority') val = r.priority;
        else if (col === 'Cleaning Type') val = r.cleaningType;
        else if (col === 'Last Cleaned Date') val = r.lastCleanedDate;
        else if (col === 'Frequency') val = r.frequency;
        html += `<td>${val}</td>`;
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
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
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
      completionTime: record.completionTime || '',
      cleaningStatus: record.cleaningStatus,
      priority: record.priority,
      notes: record.notes || '',
      cleaningType: record.cleaningType || 'Full Clean'
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (editingId) {
      setRecords(records.map(r => r.id === editingId ? { ...r, ...form } : r));
    } else {
      setRecords([...records, { ...form, id: records.length + 1, floor: '1', frequency: 'Daily', lastCleanedDate: '' }]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setRecords(records.filter(r => r.id !== recordToDelete.id));
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      fontSize: '13px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '13px',
      color: '#64748b',
      '&.Mui-focused': { color: 'var(--primary-main)' }
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 min-h-screen">
      
      {/* Top Header */}
      <div className="bg-white rounded-t-xl p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h1 className="text-[16px] font-bold text-gray-700 whitespace-nowrap">Room Cleaning</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-10 py-1.5 border border-gray-200 rounded-md text-[13px] w-[250px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors"
            />
            <Search className="absolute right-2.5 top-2 text-gray-400" sx={{ fontSize: 18 }} />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative" ref={filterMenuRef}>
            <button onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Filter">
              <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            {showColumnsMenu && (
              <div className="absolute right-0 top-10 w-48 bg-transparent shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-50 py-2 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100 text-[12px] font-bold text-gray-700">Show/Hide Column</div>
                <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[var(--primary-main)] [&::-webkit-scrollbar-thumb]:rounded-full">
                  {Object.keys(visibleColumns).map(col => (
                    <label key={col} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer gap-3 text-[13px] text-gray-700 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={visibleColumns[col]} 
                        onChange={() => toggleColumn(col)} 
                        className="w-4 h-4 accent-[var(--primary-main)] cursor-pointer rounded-sm" 
                      />
                      {col}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={openNewModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Record">
            <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
          </button>
          <button onClick={handleRefresh} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
            <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
          </button>
          <button onClick={handleExportCSV} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
            <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
          </button>
          <button onClick={handleExportPDF} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
            <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:h-2">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                
                {visibleColumns['Room No'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Room No</th>}
                {visibleColumns['Floor'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Floor</th>}
                {visibleColumns['Guest Name'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Guest Name</th>}
                {visibleColumns['Cleaning Status'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Cleaning Status</th>}
                {visibleColumns['Scheduled Date'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Scheduled Date</th>}
                {visibleColumns['Scheduled Time'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Scheduled Time</th>}
                {visibleColumns['Assigned Staff'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Assigned Staff</th>}
                {visibleColumns['Completion Time'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Completion Time</th>}
                {visibleColumns['Notes'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Notes</th>}
                {visibleColumns['Priority'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Priority</th>}
                {visibleColumns['Cleaning Type'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Cleaning Type</th>}
                {visibleColumns['Last Cleaned Date'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Last Cleaned Date</th>}
                {visibleColumns['Frequency'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Frequency</th>}
                {visibleColumns['Actions'] && <th className="py-4 px-4 text-[12px] font-bold text-gray-700">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr 
                  key={record.id} 
                  onClick={() => openViewModal(record)} 
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${index % 2 !== 0 ? 'bg-gray-50/30' : ''}`}
                >
                  
                  {visibleColumns['Room No'] && <td className="py-3 px-4 text-[12px] text-gray-600">{record.roomNo}</td>}
                  {visibleColumns['Floor'] && <td className="py-3 px-4 text-[12px] text-gray-600">{record.floor}</td>}
                  {visibleColumns['Guest Name'] && <td className="py-3 px-4 text-[12px] text-gray-600">{record.guestName}</td>}
                  
                  {visibleColumns['Cleaning Status'] && (
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${statusStyles[record.cleaningStatus]}`}>
                        {record.cleaningStatus}
                      </span>
                    </td>
                  )}
                  
                  {visibleColumns['Scheduled Date'] && (
                    <td className="py-3 px-4 text-[12px] text-gray-600 flex items-center gap-1.5">
                      <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-500" />
                      {record.scheduledDate}
                    </td>
                  )}
                  {visibleColumns['Scheduled Time'] && <td className="py-3 px-4 text-[12px] text-gray-600">{record.scheduledTime}</td>}
                  {visibleColumns['Assigned Staff'] && <td className="py-3 px-4 text-[12px] text-gray-600">{record.assignedStaff}</td>}
                  {visibleColumns['Completion Time'] && <td className="py-3 px-4 text-[12px] text-gray-600">{record.completionTime}</td>}
                  {visibleColumns['Notes'] && <td className="py-3 px-4 text-[12px] text-gray-500 truncate max-w-[120px]" title={record.notes}>{record.notes}</td>}
                  
                  {visibleColumns['Priority'] && (
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${priorityStyles[record.priority]}`}>
                        {record.priority}
                      </span>
                    </td>
                  )}

                  {visibleColumns['Cleaning Type'] && <td className="py-3 px-4 text-[12px] text-gray-600">{record.cleaningType}</td>}
                  
                  {visibleColumns['Last Cleaned Date'] && (
                    <td className="py-3 px-4 text-[12px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-500" />
                        {record.lastCleanedDate}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Frequency'] && <td className="py-3 px-4 text-[12px] text-gray-600">{record.frequency}</td>}

                  {visibleColumns['Actions'] && (
                    <td className="py-3 px-4 relative">
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(record); }} className="text-blue-400 hover:text-blue-600 transition-colors cursor-pointer" title="Edit">
                          <EditOutlined sx={{ fontSize: 16 }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); confirmDelete(record); }} className="text-orange-400 hover:text-orange-600 transition-colors cursor-pointer" title="Delete">
                          <DeleteOutlined sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="15" className="py-8 text-center text-gray-500 text-sm">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500">Items per page:</span>
              <select className="border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-700 outline-none">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <span className="text-[12px] text-gray-500">1 - {filteredRecords.length} of 16</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50">&lt;</button>
              <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50">&gt;</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit/New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">
                {editingId ? `Room #${form.roomNo}` : 'New Record'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
                <TextField required label="Room No*" name="roomNo" value={form.roomNo} onChange={(e)=>setForm({...form, roomNo: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required label="Guest Name*" name="guestName" value={form.guestName} onChange={(e)=>setForm({...form, guestName: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                
                <TextField required type="date" label="Scheduled Date*" name="scheduledDate" value={form.scheduledDate} onChange={(e)=>setForm({...form, scheduledDate: e.target.value})} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />
                <TextField required type="time" label="Scheduled Time*" name="scheduledTime" value={form.scheduledTime} onChange={(e)=>setForm({...form, scheduledTime: e.target.value})} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />

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

                <div className="md:col-span-2">
                  <TextField label="Notes" name="notes" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} sx={muiInputSx} size="small" fullWidth multiline rows={3} />
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <button type="submit" className="px-6 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
                  Save
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[340px] p-6 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-[22px] font-normal text-gray-800 mb-6 text-left">Are you sure?</h3>
            <div className="text-left space-y-3 mb-8">
              <p className="text-[13.5px] text-gray-700 font-medium grid grid-cols-[130px_1fr]"><span>Room No:</span> <span>{recordToDelete.roomNo}</span></p>
              <p className="text-[13.5px] text-gray-700 font-medium grid grid-cols-[130px_1fr]"><span>Assign Staff:</span> <span>{recordToDelete.assignedStaff}</span></p>
              <p className="text-[13.5px] text-gray-700 font-medium grid grid-cols-[130px_1fr]"><span>Cleaning Type:</span> <span>{recordToDelete.cleaningType}</span></p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button onClick={handleDelete} className="px-8 py-2.5 rounded-[8px] bg-[#c0392b] text-white font-bold text-[14px] hover:bg-[#a93226] transition-colors cursor-pointer">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-8 py-2.5 rounded-[8px] bg-[var(--primary-main)] text-white font-bold text-[14px] hover:bg-green-700 transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[var(--primary-main)] px-5 py-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg border border-white/30">
                  R
                </div>
                <div>
                  <h2 className="text-white text-[16px] font-bold">Room Cleaning</h2>
                  <p className="text-white/80 text-[13px] mt-0.5">{viewRecord.cleaningStatus}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewRecord); }} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
                >
                  <EditOutlined sx={{ fontSize: 16 }} />
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors border border-white/10"
                >
                  <Close sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6 bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Room No */}
                <div className="bg-white rounded-lg p-3.5 border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] flex items-center justify-center text-[var(--primary-main)]">
                    <MeetingRoomOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Room No</p>
                    <p className="text-[14px] font-bold text-gray-800">{viewRecord.roomNo}</p>
                  </div>
                </div>

                {/* Cleaning Status */}
                <div className="bg-white rounded-lg p-3.5 border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] flex items-center justify-center text-[var(--primary-main)]">
                    <CleaningServicesOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cleaning Status</p>
                    <span className={`px-2.5 py-1 rounded-[4px] text-[12px] font-medium ${statusStyles[viewRecord.cleaningStatus]}`}>
                      {viewRecord.cleaningStatus}
                    </span>
                  </div>
                </div>

                {/* Scheduled Date */}
                <div className="bg-white rounded-lg p-3.5 border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] flex items-center justify-center text-[var(--primary-main)]">
                    <EventOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Scheduled Date</p>
                    <p className="text-[14px] font-bold text-gray-800">{viewRecord.scheduledDate}</p>
                  </div>
                </div>

                {/* Scheduled Time */}
                <div className="bg-white rounded-lg p-3.5 border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] flex items-center justify-center text-[var(--primary-main)]">
                    <AccessTimeOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Scheduled Time</p>
                    <p className="text-[14px] font-bold text-gray-800">{viewRecord.scheduledTime}</p>
                  </div>
                </div>

                {/* Assigned Staff */}
                <div className="bg-white rounded-lg p-3.5 border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] flex items-center justify-center text-[var(--primary-main)]">
                    <PersonOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Assigned Staff</p>
                    <p className="text-[14px] font-bold text-gray-800">{viewRecord.assignedStaff}</p>
                  </div>
                </div>

                {/* Priority */}
                <div className="bg-white rounded-lg p-3.5 border border-gray-100 flex items-center gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] flex items-center justify-center text-[var(--primary-main)]">
                    <FlagOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</p>
                    <span className={`px-2.5 py-1 rounded-[4px] text-[12px] font-medium ${priorityStyles[viewRecord.priority]}`}>
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



