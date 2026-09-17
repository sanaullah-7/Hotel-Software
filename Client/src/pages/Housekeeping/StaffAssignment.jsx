import React, { useState } from 'react';
import { 
  Search, PersonAdd, Delete, Edit, AssignmentInd, MoreVert, CheckCircle, Cancel, FileDownload
} from '@mui/icons-material';

import { IconButton, Menu, MenuItem, Dialog, Select, FormControl, InputLabel } from '@mui/material';

import { getRooms, getStaff, saveRooms, saveStaff, computeStaffStats } from './hkStore';

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

export default function StaffAssignment() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dateFilter, setDateFilter] = useState('Daily');
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [rooms, setRooms] = useState(getRooms());
  const [staff, setStaff] = useState(getStaff());

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editStaffData, setEditStaffData] = useState({ name: '', status: '' });

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRoomToAssign, setSelectedRoomToAssign] = useState('');
  const [assignCleaningType, setAssignCleaningType] = useState('Checkout Cleaning');
  const [assignPriority, setAssignPriority] = useState('High');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    const syncData = () => {
      setRooms(getRooms());
      setStaff(getStaff());
    };
    window.addEventListener('storage', syncData);
    window.addEventListener('hk_update', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('hk_update', syncData);
    };
  }, []);

  const staffWithStats = staff.map(s => ({
    ...s,
    ...computeStaffStats(s.name, rooms)
  }));

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaffId(id);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openAssignDialog = () => {
    handleMenuClose();
    setSelectedRoomToAssign('');
    setAssignCleaningType('Checkout Cleaning');
    setAssignPriority('High');
    setNotes('');
    setAssignDialogOpen(true);
  };

  const handleEditSave = () => {
    const newStaff = staff.map(s => s.id === editingStaffId ? {
      ...s,
      name: editStaffData.name,
      status: editStaffData.status
    } : s);
    setStaff(newStaff);
    saveStaff(newStaff);
    window.dispatchEvent(new Event('hk_update'));
    setEditingStaffId(null);
  };

  const handleAssign = () => {
    if (!selectedRoomToAssign || !selectedStaffId) return;
    const housekeeper = staff.find(s => s.id === selectedStaffId);
    if (!housekeeper) return;
    
    const newRooms = rooms.map(r => r.id === selectedRoomToAssign ? {
      ...r,
      status: 'Assigned',
      assignee: housekeeper.name,
      cleaningType: assignCleaningType,
      priority: assignPriority,
      notes
    } : r);
    
    setRooms(newRooms);
    saveRooms(newRooms);
    window.dispatchEvent(new Event('hk_update'));
    setAssignDialogOpen(false);
    setSelectedStaffId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[11px] font-bold">Active</span>;
      case 'Off Duty': return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold">Off Duty</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-bold">{status}</span>;
    }
  };

  const filtered = staffWithStats.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.includes(searchQuery)
  );

  return (
    <div className="animate-fade-in pb-8 space-y-4 max-w-[1200px] mx-auto">
      <div className="mt-4"></div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 w-full overflow-visible min-w-0">
        <div className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-x-2 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap hidden md:block">
            Staff Workload
          </h3>
          
          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar */}
            <div className="relative w-32 md:w-48 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Date Filters with Custom Popup Wrapper */}
            <div className="relative shrink-0 hidden lg:flex items-center">
              <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === 'Custom') {
                        if (dateFilter === 'Custom') {
                          setIsCustomPopupOpen(!isCustomPopupOpen);
                        } else {
                          setDateFilter(tab);
                          setIsCustomPopupOpen(true);
                        }
                      } else {
                        setDateFilter(tab);
                        setIsCustomPopupOpen(false);
                      }
                    }}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 ${
                      dateFilter === tab 
                        ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10' 
                        : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {dateFilter === 'Custom' && isCustomPopupOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] animate-fade-in">
                  <p className="text-[11px] font-bold text-gray-700">Custom Date Range</p>
                  <div className="flex flex-col gap-1.5">
                    <input 
                      type="date" 
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={customStartDate}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomStartDate(val);
                        if (val && customEndDate) setTimeout(() => setIsCustomPopupOpen(false), 150);
                      }}
                    />
                    <span className="text-gray-400 text-[10px] font-bold text-center">TO</span>
                    <input 
                      type="date" 
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={customEndDate}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomEndDate(val);
                        if (customStartDate && val) setTimeout(() => setIsCustomPopupOpen(false), 150);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CSV Export Button */}
            <button className="flex items-center space-x-1 bg-[#1b7f43] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer">
              <FileDownload sx={{ fontSize: 14 }} className="text-white" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>
            
            {/* Assign Work Button */}
            <button 
              onClick={openAssignDialog}
              className="flex items-center space-x-1 bg-[#1b7f43] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <AssignmentInd sx={{ fontSize: 14 }} className="text-white" />
              <span className="hidden sm:inline">Assign Work</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Housekeeper ID</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Housekeeper Name</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Assigned Rooms</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Pending</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Cleaning</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Inspection Pending</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Completed</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? (
                filtered.map((row) => {
                  const isEditing = editingStaffId === row.id;

                  return (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2 px-2 text-[13px] font-bold text-gray-500 pl-4">{row.id}</td>
                    
                    <td className="py-2 px-2 text-[13px] font-bold text-gray-900">
                      {isEditing ? (
                        <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 110, '& .MuiSelect-select': { padding: '4px 8px', fontSize: '11px' } }}>
                          <Select 
                            value={editStaffData.name}
                            onChange={e => setEditStaffData({...editStaffData, name: e.target.value})}
                          >
                            {['Ali', 'Bilal', 'Bob Taylor', 'Mike Ross', 'Jane Smith', 'Alice Green', 'Sarah', 'John', 'Zain', 'Emma'].map(name => (
                              <MenuItem key={name} value={name}>{name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : row.name}
                    </td>

                    <td className="py-2 px-2 text-[14px] font-bold text-gray-700 text-center">{row.assignedRooms}</td>
                    <td className="py-2 px-2 text-[13px] font-bold text-gray-600 text-center">{row.pending}</td>
                    <td className="py-2 px-2 text-[13px] font-bold text-amber-600 text-center">{row.cleaning}</td>
                    <td className="py-2 px-2 text-[13px] font-bold text-purple-600 text-center">{row.inspection}</td>
                    <td className="py-2 px-2 text-[13px] font-bold text-emerald-600 text-center">{row.completed}</td>
                    
                    <td className="py-2 px-2">
                      {isEditing ? (
                        <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 90, '& .MuiSelect-select': { padding: '4px 8px', fontSize: '11px' } }}>
                          <Select 
                            value={editStaffData.status}
                            onChange={e => setEditStaffData({...editStaffData, status: e.target.value})}
                          >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Off Duty">Off Duty</MenuItem>
                          </Select>
                        </FormControl>
                      ) : getStatusBadge(row.status)}
                    </td>

                    <td className="py-2 px-2 text-center pr-4">
                      {isEditing ? (
                        <div className="flex gap-1 justify-center">
                           <IconButton size="small" onClick={handleEditSave}><CheckCircle sx={{ fontSize: 18, color: '#1b7f43' }}/></IconButton>
                           <IconButton size="small" onClick={() => setEditingStaffId(null)}><Cancel sx={{ fontSize: 18, color: '#ef4444' }}/></IconButton>
                        </div>
                      ) : (
                        <IconButton onClick={(e) => handleMenuClick(e, row.id)} size="small">
                          <MoreVert sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 text-[13px] font-medium">
                    No staff found.
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
        <MenuItem onClick={() => {
          handleMenuClose();
          const s = staff.find(st => st.id === selectedStaffId);
          if (s) {
            setEditStaffData({ name: s.name, status: s.status });
            setEditingStaffId(s.id);
          }
        }} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
          <Edit sx={{ fontSize: 16, mr: 1.5, color: '#3b82f6' }} /> Edit Inline
        </MenuItem>
        <MenuItem onClick={openAssignDialog} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
          <PersonAdd sx={{ fontSize: 16, mr: 1.5, color: '#1b7f43' }} /> Assign Room
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}>
          <Edit sx={{ fontSize: 16, mr: 1.5, color: '#d97706' }} /> Reassign Work
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ fontSize: '12.5px', fontWeight: 600, color: '#ef4444' }}>
          <Delete sx={{ fontSize: 16, mr: 1.5 }} /> Unassign All
        </MenuItem>
      </Menu>

      <Dialog open={assignDialogOpen} onClose={() => { setAssignDialogOpen(false); setSelectedStaffId(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Assign Room</h2>
          <p className="text-[13px] text-gray-500 mb-6">Assign a dirty room to this housekeeper.</p>

          <div className="space-y-4 mb-8">
            <div>
              <FormControl fullWidth size="small" sx={muiSelectSx}>
                <InputLabel>Housekeeper</InputLabel>
                <Select
                  label="Housekeeper"
                  value={selectedStaffId || ''}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  {staff.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.name} ({s.id})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <FormControl fullWidth size="small" sx={muiSelectSx}>
                <InputLabel>Room Number</InputLabel>
                <Select
                  label="Room Number"
                  value={selectedRoomToAssign}
                  onChange={(e) => setSelectedRoomToAssign(e.target.value)}
                >
                  {rooms.filter(r => r.status === 'Dirty' || r.status === 'Cleaning Required' || r.status === 'Clean / Ready').map(r => (
                    <MenuItem key={r.id} value={r.id}>{r.id} - {r.type} ({r.status})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
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
              <label className="block text-[13px] font-bold text-gray-700 mb-2">Notes</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
                rows={3}
                placeholder="Add any specific instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={() => { setAssignDialogOpen(false); setSelectedStaffId(null); }}
              className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAssign}
              disabled={!selectedRoomToAssign}
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
