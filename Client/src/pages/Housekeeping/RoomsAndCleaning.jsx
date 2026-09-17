import React, { useState } from 'react';
import { 
  Search, Add, Bed, CleaningServices, CheckCircle, VerifiedUser,
  BuildCircle, Warning, Edit, Delete, ChevronLeft, ChevronRight,
  MoreVert, TaskAlt, Block, NotificationsActive, Cancel
} from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Dialog, Select, FormControl, InputLabel } from '@mui/material';

const STATUS_TABS = ['All Rooms', 'Dirty', 'Cleaning', 'Inspection Required', 'Clean / Ready', 'Occupied', 'DND', 'Out of Order'];

const INITIAL_DATA = [
  { id: '101', type: 'Standard', guest: 'John Doe', stayStatus: 'Stayover', cleaningType: 'Daily', status: 'Dirty', priority: 'Normal', assignee: 'Jane Smith', started: '-', completed: '-' },
  { id: '102', type: 'Deluxe', guest: 'Sarah Connor', stayStatus: 'Checkout', cleaningType: 'Checkout Cleaning', status: 'Cleaning', priority: 'High', assignee: 'Alice Green', started: '10:00 AM', completed: '-' },
  { id: '201', type: 'Suite', guest: '-', stayStatus: 'Vacant', cleaningType: 'Deep Cleaning', status: 'Inspection Required', priority: 'Normal', assignee: 'Bob Taylor', started: '09:00 AM', completed: '10:30 AM' },
  { id: '205', type: 'Standard', guest: 'Mike Tyson', stayStatus: 'Occupied', cleaningType: '-', status: 'Clean / Ready', priority: 'Normal', assignee: '-', started: '-', completed: '09:00 AM' },
  { id: '301', type: 'Deluxe', guest: 'Anna Bell', stayStatus: 'Stayover', cleaningType: '-', status: 'DND', priority: 'Normal', assignee: '-', started: '-', completed: '-' },
  { id: '305', type: 'Suite', guest: '-', stayStatus: 'Vacant', cleaningType: 'Maintenance', status: 'Out of Order', priority: 'Low', assignee: '-', started: '-', completed: '-' },
];

import { getRooms, saveRooms, getMaintenance, saveMaintenance, getStaff } from './hkStore';
import { useLocation } from 'react-router-dom';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '6px 12px',
  }
};

export default function RoomsAndCleaning() {
  const location = useLocation();
  const highlightStatus = location.state?.highlightStatus;

  const [activeTab, setActiveTab] = useState('All Rooms');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState(getRooms());
  const [staff, setStaff] = useState(getStaff());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const [blinkActive, setBlinkActive] = useState(false);

  React.useEffect(() => {
    if (highlightStatus) {
      setBlinkActive(true);
      const timer = setTimeout(() => setBlinkActive(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightStatus]);

  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [maintDesc, setMaintDesc] = useState('');
  const [maintPriority, setMaintPriority] = useState('Normal');

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStaffToAssign, setSelectedStaffToAssign] = useState('');
  const [assignCleaningType, setAssignCleaningType] = useState('Daily');
  const [assignPriority, setAssignPriority] = useState('Normal');

  const [editingRowId, setEditingRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({ cleaningType: '', priority: '', status: '' });

  React.useEffect(() => {
    const syncData = () => setRooms(getRooms());
    window.addEventListener('storage', syncData);
    // Custom event for same-window updates
    window.addEventListener('hk_update', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('hk_update', syncData);
    };
  }, []);

  const updateRoomStatus = (id, newStatus, extra = {}) => {
    const newRooms = rooms.map(r => r.id === id ? { ...r, status: newStatus, ...extra } : r);
    setRooms(newRooms);
    saveRooms(newRooms);
    window.dispatchEvent(new Event('hk_update'));
  };

  const handleReportMaintenance = () => {
    const maintList = getMaintenance();
    maintList.push({
      roomNumber: selectedRoomId,
      description: maintDesc,
      priority: maintPriority,
      reportedBy: 'Housekeeping',
      dateTime: new Date().toLocaleString(),
      status: 'Open'
    });
    saveMaintenance(maintList);
    updateRoomStatus(selectedRoomId, 'Maintenance', { cleaningType: 'Maintenance' });
    setMaintenanceDialogOpen(false);
    setSelectedRoomId(null);
  };

  const handleAssignHousekeeper = () => {
    if (!selectedStaffToAssign) return;
    const housekeeper = staff.find(s => s.id === selectedStaffToAssign);
    updateRoomStatus(selectedRoomId, 'Assigned', { 
      assignee: housekeeper.name,
      cleaningType: assignCleaningType,
      priority: assignPriority
    });
    setAssignDialogOpen(false);
    setSelectedRoomId(null);
  };

  const handleEditSave = () => {
    updateRoomStatus(editingRowId, editRowData.status || rooms.find(r => r.id === editingRowId)?.status, { 
      cleaningType: editRowData.cleaningType, 
      priority: editRowData.priority,
      assignee: editRowData.assignee
    });
    setEditingRowId(null);
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRoomId(id);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Clean / Ready': return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[11px] font-bold">Clean</span>;
      case 'Dirty': return <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[11px] font-bold">Dirty</span>;
      case 'Cleaning': return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-[11px] font-bold">Cleaning</span>;
      case 'Inspection Required': return <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-[11px] font-bold">Inspect</span>;
      case 'Occupied': return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] font-bold">Occupied</span>;
      case 'DND': return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold">DND</span>;
      case 'Maintenance':
      case 'Out of Order': return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">OOO</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold">{status}</span>;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesTab = activeTab === 'All Rooms' || room.status === activeTab;
    const matchesSearch = room.id.includes(searchQuery) || room.guest.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="animate-fade-in pb-8 space-y-4 max-w-[1600px] mx-auto">
      <style>{`
        @keyframes quickBlink {
          0%, 100% { background-color: transparent; }
          50% { background-color: #dcfce7; }
        }
        .blink-quick {
          animation: quickBlink 0.4s ease-in-out infinite;
        }
      `}</style>
      <div className="mt-4"></div>
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {[
          { label: 'Dirty', val: rooms.filter(r => r.status === 'Dirty').length, color: 'text-red-600' },
          { label: 'Cleaning', val: rooms.filter(r => r.status === 'Cleaning').length, color: 'text-amber-600' },
          { label: 'Inspection', val: rooms.filter(r => r.status === 'Inspection Required').length, color: 'text-purple-600' },
          { label: 'Clean', val: rooms.filter(r => r.status === 'Clean / Ready').length, color: 'text-emerald-600' },
          { label: 'Occupied', val: rooms.filter(r => r.status === 'Occupied').length, color: 'text-blue-600' },
          { label: 'DND', val: rooms.filter(r => r.status === 'DND').length, color: 'text-gray-600' },
          { label: 'OOO', val: rooms.filter(r => r.status === 'Out of Order').length, color: 'text-slate-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-gray-500 font-semibold text-[11px] uppercase tracking-wider">{stat.label}</span>
            <span className={`text-xl font-black ${stat.color} mt-1`}>{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Table Section matching Dashboard style */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 w-full overflow-visible min-w-0">
        <div className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-x-2 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Room Status
          </h3>
          
          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar */}
            <div className="relative w-32 md:w-48 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0 hidden md:flex">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10' 
                      : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                  }`}
                >
                  {tab === 'Inspection Required' ? 'Inspection' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room Number</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room Type</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Stay Status</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cleaning Type</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room Status</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Assigned Housekeeper</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cleaning Started</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cleaning Completed</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => {
                  let isMatch = false;
                  if (highlightStatus) {
                    if (highlightStatus === 'Occupied' || highlightStatus === 'Available') {
                      isMatch = room.stayStatus === (highlightStatus === 'Available' ? 'Vacant' : highlightStatus);
                    } else {
                      isMatch = room.status === highlightStatus;
                    }
                  }
                  
                  const isEditing = editingRowId === room.id;

                  return (
                  <tr key={room.id} className={`transition-colors ${blinkActive && isMatch ? 'blink-quick' : 'hover:bg-gray-50/50'}`}>
                    <td className="py-3 px-3 text-[13px] font-bold text-gray-900">{room.id}</td>
                    <td className="py-3 px-3 text-[12px] font-medium text-gray-500">{room.type}</td>
                    <td className="py-3 px-3 text-[13px] font-bold text-gray-800">{room.guest}</td>
                    <td className="py-3 px-3 text-[12px] font-medium text-gray-500">{room.stayStatus}</td>
                    
                    <td className="py-2 px-2 text-[13px] font-semibold text-gray-700">
                      {isEditing ? (
                        <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 110, '& .MuiSelect-select': { padding: '4px 8px', fontSize: '11px' } }}>
                          <Select 
                            value={editRowData.cleaningType}
                            onChange={e => setEditRowData({...editRowData, cleaningType: e.target.value})}
                          >
                            <MenuItem value="-">None</MenuItem>
                            <MenuItem value="Daily">Daily</MenuItem>
                            <MenuItem value="Checkout Cleaning">Checkout Cleaning</MenuItem>
                            <MenuItem value="Deep Cleaning">Deep Cleaning</MenuItem>
                            <MenuItem value="Touch-up">Touch-up</MenuItem>
                          </Select>
                        </FormControl>
                      ) : room.cleaningType}
                    </td>

                    <td className="py-2 px-2">
                      {isEditing ? (
                        <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 110, '& .MuiSelect-select': { padding: '4px 8px', fontSize: '11px' } }}>
                          <Select 
                            value={editRowData.status}
                            onChange={e => setEditRowData({...editRowData, status: e.target.value})}
                          >
                            {STATUS_TABS.filter(t => t !== 'All Rooms').map(tab => (
                              <MenuItem key={tab} value={tab}>{tab}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : getStatusBadge(room.status)}
                    </td>

                    <td className="py-2 px-2">
                      {isEditing ? (
                        <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 90, '& .MuiSelect-select': { padding: '4px 8px', fontSize: '11px' } }}>
                          <Select 
                            value={editRowData.priority}
                            onChange={e => setEditRowData({...editRowData, priority: e.target.value})}
                          >
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Normal">Normal</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                            <MenuItem value="Urgent">Urgent</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <span className={`text-[12px] font-bold ${room.priority === 'High' ? 'text-red-500' : 'text-gray-500'}`}>{room.priority}</span>
                      )}
                    </td>

                    <td className="py-2 px-2 text-[13px] font-medium text-gray-700">
                      {isEditing ? (
                        <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 105, '& .MuiSelect-select': { padding: '4px 8px', fontSize: '11px' } }}>
                          <Select 
                            value={editRowData.assignee}
                            onChange={e => setEditRowData({...editRowData, assignee: e.target.value})}
                          >
                            <MenuItem value="-">None</MenuItem>
                            {staff.map(s => (
                              <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : room.assignee}
                    </td>
                    <td className="py-3 px-3 text-[12px] font-medium text-gray-500">{room.started}</td>
                    <td className="py-3 px-3 text-[12px] font-medium text-gray-500">{room.completed}</td>
                    
                    <td className="py-3 px-3 text-center">
                      {isEditing ? (
                        <div className="flex gap-1 justify-center">
                           <IconButton size="small" onClick={handleEditSave}><CheckCircle sx={{ fontSize: 18, color: '#1b7f43' }}/></IconButton>
                           <IconButton size="small" onClick={() => setEditingRowId(null)}><Cancel sx={{ fontSize: 18, color: '#ef4444' }}/></IconButton>
                        </div>
                      ) : (
                        <IconButton onClick={(e) => handleMenuClick(e, room.id)} size="small">
                          <MoreVert sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400 text-[13px] font-medium">
                    No rooms found matching your criteria.
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
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ elevation: 2, sx: { borderRadius: '12px', minWidth: '160px', mt: 1, border: '1px solid #f3f4f6' } }}
      >
        {(() => {
          const room = rooms.find(r => r.id === selectedRoomId);
          if (!room) return null;

          const menuItems = [];

          menuItems.push(
            <MenuItem key="edit" onClick={() => { 
              handleMenuClose(); 
              setEditRowData({ cleaningType: room.cleaningType || '', priority: room.priority || 'Normal', status: room.status || '', assignee: room.assignee || '-' });
              setEditingRowId(room.id); 
            }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
              <Edit sx={{ fontSize: 16, mr: 1.5, color: '#3b82f6' }} /> Edit Inline
            </MenuItem>
          );

          if (room.status === 'Dirty') {
            menuItems.push(
              <MenuItem key="assign" onClick={() => { handleMenuClose(); setSelectedStaffToAssign(''); setAssignDialogOpen(true); }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                <TaskAlt sx={{ fontSize: 16, mr: 1.5, color: '#1b7f43' }} /> Assign Housekeeper
              </MenuItem>
            );
          }
          
          if (room.status === 'Assigned' || room.status === 'Cleaning Required') {
            menuItems.push(
              <MenuItem key="start" onClick={() => { handleMenuClose(); updateRoomStatus(room.id, 'Cleaning', { started: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }); setSelectedRoomId(null); }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                <CleaningServices sx={{ fontSize: 16, mr: 1.5, color: '#d97706' }} /> Start Cleaning
              </MenuItem>,
              <MenuItem key="reassign" onClick={() => { handleMenuClose(); setSelectedStaffToAssign(''); setAssignDialogOpen(true); }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                <TaskAlt sx={{ fontSize: 16, mr: 1.5, color: '#1b7f43' }} /> Reassign Housekeeper
              </MenuItem>
            );
          }

          if (room.status === 'Cleaning') {
            menuItems.push(
              <MenuItem key="mark-clean" onClick={() => { handleMenuClose(); updateRoomStatus(room.id, 'Inspection Required', { completed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }); }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                <CheckCircle sx={{ fontSize: 16, mr: 1.5, color: '#059669' }} /> Mark Cleaned
              </MenuItem>
            );
          }

          if (room.status === 'Inspection Required') {
            menuItems.push(
              <MenuItem key="inspect" onClick={() => { handleMenuClose(); window.location.href='/housekeeping/inspection'; }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                <VerifiedUser sx={{ fontSize: 16, mr: 1.5, color: '#7c3aed' }} /> Inspect Room
              </MenuItem>
            );
          }

          if (room.status === 'Clean / Ready') {
            menuItems.push(
              <MenuItem key="view" onClick={handleMenuClose} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
                <Search sx={{ fontSize: 16, mr: 1.5, color: '#2563eb' }} /> View Details
              </MenuItem>
            );
          }

          // Maintenance is always available except maybe Clean/Ready, but let's just make it available
          menuItems.push(
            <MenuItem key="maintenance" onClick={() => { handleMenuClose(); setMaintDesc(''); setMaintPriority('Normal'); setMaintenanceDialogOpen(true); }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#ef4444' }}>
              <BuildCircle sx={{ fontSize: 16, mr: 1.5 }} /> Report Maintenance
            </MenuItem>
          );
          
          if (room.status === 'DND') {
            menuItems.push(
              <MenuItem key="dnd" onClick={() => { handleMenuClose(); updateRoomStatus(room.id, 'Dirty'); }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#6b7280' }}>
                <Block sx={{ fontSize: 16, mr: 1.5 }} /> Remove DND
              </MenuItem>
            );
          } else {
            menuItems.push(
              <MenuItem key="dnd" onClick={() => { handleMenuClose(); updateRoomStatus(room.id, 'DND'); }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#6b7280' }}>
                <Block sx={{ fontSize: 16, mr: 1.5 }} /> Mark as DND
              </MenuItem>
            );
          }

          return menuItems;
        })()}
      </Menu>

      <Dialog open={maintenanceDialogOpen} onClose={() => setMaintenanceDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Report Maintenance</h2>
          <p className="text-[13px] text-gray-500 mb-6">Report an issue for Room {selectedRoomId}.</p>
          
          <div className="space-y-4 mb-8">
            <div>
              <FormControl fullWidth size="small" sx={muiSelectSx}>
                <InputLabel>Priority</InputLabel>
                <Select
                  label="Priority"
                  value={maintPriority}
                  onChange={(e) => setMaintPriority(e.target.value)}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">Issue Description</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/20"
                rows={3}
                placeholder="Describe the issue..."
                value={maintDesc}
                onChange={(e) => setMaintDesc(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={() => setMaintenanceDialogOpen(false)}
              className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleReportMaintenance}
              disabled={!maintDesc}
              className="px-4 py-2 text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              Submit Report
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog open={assignDialogOpen} onClose={() => { setAssignDialogOpen(false); setSelectedRoomId(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Assign Housekeeper</h2>
          <p className="text-[13px] text-gray-500 mb-6">Assign a housekeeper to Room {selectedRoomId}.</p>
          
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormControl fullWidth size="small" sx={muiSelectSx}>
                  <InputLabel>Cleaning Type</InputLabel>
                  <Select
                    label="Cleaning Type"
                    value={assignCleaningType}
                    onChange={(e) => setAssignCleaningType(e.target.value)}
                  >
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Checkout Cleaning">Checkout Cleaning</MenuItem>
                    <MenuItem value="Deep Cleaning">Deep Cleaning</MenuItem>
                    <MenuItem value="Stayover Cleaning">Stayover Cleaning</MenuItem>
                    <MenuItem value="VIP Cleaning">VIP Cleaning</MenuItem>
                    <MenuItem value="Extra Cleaning">Extra Cleaning</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div>
                <FormControl fullWidth size="small" sx={muiSelectSx}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    label="Priority"
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value)}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            
            <div>
              <FormControl fullWidth size="small" sx={muiSelectSx}>
                <InputLabel>Select Housekeeper</InputLabel>
                <Select
                  label="Select Housekeeper"
                  value={selectedStaffToAssign}
                  onChange={(e) => setSelectedStaffToAssign(e.target.value)}
                >
                  {staff.filter(s => s.status === 'Active').map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name} ({s.id})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={() => { setAssignDialogOpen(false); setSelectedRoomId(null); }}
              className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAssignHousekeeper}
              disabled={!selectedStaffToAssign}
              className="px-4 py-2 text-[13px] font-bold text-white bg-[#1b7f43] hover:bg-[#166b37] rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              Assign
            </button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
        
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



