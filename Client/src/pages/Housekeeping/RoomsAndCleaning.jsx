import React, { useState } from 'react';
import {
  Search,
  Add,
  Bed,
  CleaningServices,
  CheckCircle,
  VerifiedUser,
  BuildCircle,
  Warning,
  Edit,
  Delete,
  ChevronLeft,
  ChevronRight,
  MoreVert,
  TaskAlt,
  Block,
  NotificationsActive,
  Cancel
} from '@mui/icons-material';

import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

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
  const [anchorEl, setAnchorEl] =   useState(null);
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
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}