import { addAuditLog } from '../../audit/state/auditStore.js';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, PersonAdd, Delete, Edit, AssignmentInd, MoreVert, CheckCircle, Cancel, FileDownload, Refresh
} from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Dialog, Select, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';

import opsService from '../../../services/opsService';
import roomService from '../../../services/roomService';
import {
  toStaffAssignmentUIList,
  TASK_TYPE_UI_TO_BACKEND,
  PRIORITY_UI_TO_BACKEND
} from '../adapters/housekeepingAdapter';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '11px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '4px 10px',
  }
};

export default function StaffAssignment() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dateFilter, setDateFilter] = useState('Daily');
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [staffWithStats, setStaffWithStats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRoomToAssign, setSelectedRoomToAssign] = useState('');
  const [assignCleaningType, setAssignCleaningType] = useState('Checkout Cleaning');
  const [assignPriority, setAssignPriority] = useState('High');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, tasksRes, roomsRes] = await Promise.all([
        opsService.getEmployees({ limit: 100 }).catch(err => {
          console.warn('[StaffAssignment] Failed to fetch employees:', err);
          return { data: [] };
        }),
        opsService.getHousekeepingTasks({ limit: 100 }),
        roomService.getRooms({ limit: 100 }).catch(err => {
          console.warn('[StaffAssignment] Failed to fetch rooms:', err);
          return { data: [] };
        })
      ]);

      const loadedEmps = Array.isArray(empRes.data)
        ? empRes.data
        : (empRes.data?.employees || []);

      const loadedTasks = Array.isArray(tasksRes.data)
        ? tasksRes.data
        : (tasksRes.data?.tasks || []);

      const loadedRooms = Array.isArray(roomsRes.data)
        ? roomsRes.data
        : (roomsRes.data?.rooms || []);

      setEmployees(loadedEmps);
      setTasks(loadedTasks);
      setRooms(loadedRooms);

      const uiList = toStaffAssignmentUIList(loadedEmps, loadedTasks, loadedRooms);
      setStaffWithStats(uiList);
    } catch (err) {
      console.error('[StaffAssignment] Failed to load data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load staff workload from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedStaffId(id);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openAssignDialog = (staffId = null) => {
    handleMenuClose();
    if (staffId && typeof staffId === 'string') {
      setSelectedStaffId(staffId);
    }
    setSelectedRoomToAssign('');
    setAssignCleaningType('Checkout Cleaning');
    setAssignPriority('High');
    setNotes('');
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedRoomToAssign || !selectedStaffId) return;
    
    // Find matching employee
    const housekeeper = staffWithStats.find(s => s._id === selectedStaffId || s.id === selectedStaffId);
    if (!housekeeper) return;

    setSubmitting(true);
    setActionError(null);
    try {
      // Find room object to get canonical ID
      const targetRoom = rooms.find(r => r._id === selectedRoomToAssign || String(r.room_number) === String(selectedRoomToAssign));
      const canonicalRoomId = targetRoom?._id || selectedRoomToAssign;

      // Check if an active task already exists for this room
      const existingTask = tasks.find(t => {
        const rId = t.room_id?._id || t.room_id;
        return String(rId) === String(canonicalRoomId) && !t.is_deleted && t.status !== 'CANCELLED' && t.status !== 'VERIFIED';
      });

      if (existingTask) {
        await opsService.updateHousekeepingTask(existingTask._id, {
          assigned_to: housekeeper._id,
          task_type: TASK_TYPE_UI_TO_BACKEND[assignCleaningType] || 'CLEANING',
          priority: PRIORITY_UI_TO_BACKEND[assignPriority] || 'HIGH',
          notes: notes ? `${existingTask.notes || ''} [Notes: ${notes}]`.trim() : existingTask.notes
        });
      } else {
        await opsService.createHousekeepingTask({
          room_id: canonicalRoomId,
          assigned_to: housekeeper._id,
          task_type: TASK_TYPE_UI_TO_BACKEND[assignCleaningType] || 'CLEANING',
          priority: PRIORITY_UI_TO_BACKEND[assignPriority] || 'HIGH',
          notes: notes || undefined
        });
      }

      try { 
        addAuditLog({ 
          module: 'Housekeeping', 
          action: 'Assigned Staff', 
          description: `Room assigned to ${housekeeper.name}.`, 
          importance: 'Normal' 
        }); 
      } catch(e) {}

      window.dispatchEvent(new Event('hk_update'));
      setAssignDialogOpen(false);
      setSelectedStaffId(null);
      setSelectedRoomToAssign('');
      await loadData();
    } catch (err) {
      console.error('[StaffAssignment] Assignment failed:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to assign room to housekeeper');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignAll = async () => {
    const s = staffWithStats.find(st => st.id === selectedStaffId || st._id === selectedStaffId);
    if (!s) return;

    handleMenuClose();
    setSubmitting(true);
    setActionError(null);
    try {
      const activeTasks = tasks.filter(t => {
        const empId = t.assigned_to?._id || t.assigned_to;
        return String(empId) === String(s._id) && !t.is_deleted && t.status !== 'CANCELLED' && t.status !== 'VERIFIED';
      });

      if (activeTasks.length > 0) {
        await Promise.all(activeTasks.map(t => opsService.updateHousekeepingTask(t._id, { assigned_to: null })));
      }

      try { 
        addAuditLog({ 
          module: 'Housekeeping', 
          action: 'Unassigned Staff', 
          description: `All active tasks unassigned from ${s.name}.`, 
          importance: 'Normal' 
        }); 
      } catch(e) {}

      window.dispatchEvent(new Event('hk_update'));
      await loadData();
    } catch (err) {
      console.error('[StaffAssignment] Unassign failed:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to unassign staff tasks');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Housekeeper ID', 'Housekeeper Name', 'Department', 'Role', 'Assigned Rooms', 'Pending', 'Cleaning', 'Inspection Pending', 'Completed', 'Status'];
    const rows = staffWithStats.map(s => [
      s.id,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.role}"`,
      s.assignedRooms,
      s.pending,
      s.cleaning,
      s.inspectionPending,
      s.completed,
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `staff_workload_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold">Active</span>;
      case 'Off Duty': return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">Off Duty</span>;
      default: return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">{status}</span>;
    }
  };

  const filtered = staffWithStats.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.id && s.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in pb-8 space-y-3 max-w-[1200px] mx-auto">
      <div className="mt-2"></div>

      {actionError && (
        <Alert severity="error" className="mb-3" onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {error && (
        <Alert 
          severity="error" 
          className="mb-3"
          action={
            <IconButton color="inherit" size="small" onClick={loadData}>
              <Refresh fontSize="inherit" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 w-full overflow-visible min-w-0">
        <div className="p-3 border-b border-gray-100 flex flex-row items-center justify-between space-x-2 overflow-visible">
          <div className="flex items-center space-x-2">
            <h3 className="text-gray-800 font-bold text-[13.5px] lg:text-[14px] hidden md:block">
              Staff Workload
            </h3>
            {loading && <CircularProgress size={16} sx={{ color: '#1b7f43' }} />}
          </div>
          
          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar */}
            <div className="relative w-32 md:w-48 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 15 }} />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="w-full pl-7 pr-2 py-1 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1 text-gray-500 hover:text-[#1b7f43] hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              title="Refresh staff workload"
            >
              <Refresh sx={{ fontSize: 16 }} />
            </button>

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
                    className={`px-2 py-1 text-[10.5px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 ${
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
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-[10.5px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={customStartDate}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomStartDate(val);
                        if (val && customEndDate) setTimeout(() => setIsCustomPopupOpen(false), 150);
                      }}
                    />
                    <span className="text-gray-400 text-[9.5px] font-bold text-center">TO</span>
                    <input 
                      type="date" 
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-[10.5px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
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
            <button 
              onClick={handleExportCSV}
              className="flex items-center space-x-1 bg-[#1b7f43] hover:brightness-110 text-white px-2 py-1 rounded-lg text-[10.5px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <FileDownload sx={{ fontSize: 13 }} className="text-white" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>
            
            {/* Assign Work Button */}
            <button 
              onClick={() => openAssignDialog(null)}
              className="flex items-center space-x-1 bg-[#1b7f43] hover:brightness-110 text-white px-2 py-1 rounded-lg text-[10.5px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <AssignmentInd sx={{ fontSize: 13 }} className="text-white" />
              <span className="hidden sm:inline">Assign Work</span>
            </button>
          </div>
        </div>

        <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Housekeeper ID</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Housekeeper Name</th>
                <th className="py-2 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide text-center">Assigned Rooms</th>
                <th className="py-2 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide text-center">Pending</th>
                <th className="py-2 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide text-center">Cleaning</th>
                <th className="py-2 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide text-center">Inspection Pending</th>
                <th className="py-2 px-2 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide text-center">Completed</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Status</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <CircularProgress size={24} sx={{ color: '#1b7f43' }} />
                    <p className="mt-2 text-xs font-medium">Loading staff workload...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((row) => (
                  <tr key={row._id || row.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-1.5 px-2.5 text-[11px] font-bold text-gray-500">{row.id}</td>
                    
                    <td className="py-1.5 px-2.5 text-[11px] font-bold text-gray-900">
                      {row.name}
                    </td>

                    <td className="py-1.5 px-2 text-[11.5px] font-bold text-gray-700 text-center">{row.assignedRooms}</td>
                    <td className="py-1.5 px-2 text-[11px] font-bold text-gray-600 text-center">{row.pending}</td>
                    <td className="py-1.5 px-2 text-[11px] font-bold text-amber-600 text-center">{row.cleaning}</td>
                    <td className="py-1.5 px-2 text-[11px] font-bold text-purple-600 text-center">{row.inspectionPending}</td>
                    <td className="py-1.5 px-2 text-[11px] font-bold text-emerald-600 text-center">{row.completed}</td>
                    
                    <td className="py-1.5 px-2.5">
                      {getStatusBadge(row.status)}
                    </td>

                    <td className="py-1.5 px-2 text-center pr-3">
                      <IconButton onClick={(e) => handleMenuClick(e, row._id || row.id)} size="small" sx={{ p: 0.5 }}>
                        <MoreVert sx={{ fontSize: 16 }} />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400 text-[11.5px] font-medium">
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
        PaperProps={{ elevation: 2, sx: { borderRadius: '10px', minWidth: '150px', mt: 0.5, border: '1px solid #f3f4f6' } }}
      >
        <MenuItem onClick={() => openAssignDialog(selectedStaffId)} sx={{ fontSize: '11.5px', fontWeight: 600, color: '#374151' }}>
          <PersonAdd sx={{ fontSize: 15, mr: 1, color: '#1b7f43' }} /> Assign Room
        </MenuItem>
        <MenuItem onClick={handleUnassignAll} sx={{ fontSize: '11.5px', fontWeight: 600, color: '#ef4444' }}>
          <Delete sx={{ fontSize: 15, mr: 1 }} /> Unassign All Tasks
        </MenuItem>
      </Menu>

      <Dialog 
        open={assignDialogOpen} 
        onClose={() => { if (!submitting) { setAssignDialogOpen(false); setSelectedStaffId(null); } }} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <div className="p-5">
          <h2 className="text-base font-bold text-gray-900 mb-0.5">Assign Room</h2>
          <p className="text-[12px] text-gray-500 mb-4">Assign a room cleaning task to this housekeeper.</p>

          <div className="space-y-3 mb-6">
            <div>
              <FormControl fullWidth size="small" sx={muiSelectSx}>
                <InputLabel id="housekeeper-label" sx={{ fontSize: '12px' }}>Housekeeper</InputLabel>
                <Select
                  labelId="housekeeper-label"
                  id="housekeeper-select"
                  label="Housekeeper"
                  inputProps={{ 'aria-label': 'Housekeeper' }}
                  value={selectedStaffId || ''}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                  {staffWithStats.map(s => (
                    <MenuItem key={s._id || s.id} value={s._id || s.id}>
                      {s.name} ({s.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <FormControl fullWidth size="small" sx={muiSelectSx}>
                <InputLabel id="room-number-label" sx={{ fontSize: '12px' }}>Room Number</InputLabel>
                <Select
                  labelId="room-number-label"
                  id="room-number-select"
                  label="Room Number"
                  inputProps={{ 'aria-label': 'Room Number' }}
                  value={selectedRoomToAssign}
                  onChange={(e) => setSelectedRoomToAssign(e.target.value)}
                >
                  {rooms.length > 0 ? (
                    rooms.map(r => (
                      <MenuItem key={r._id || r.id} value={r._id || r.id}>
                        Room {r.room_number || r.id} - {r.room_type || r.type || 'Standard'} ({r.housekeeping_status || r.status || 'Available'})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">No rooms available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormControl fullWidth size="small" sx={muiSelectSx}>
                  <InputLabel sx={{ fontSize: '12px' }}>Cleaning Type</InputLabel>
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
                  <InputLabel sx={{ fontSize: '12px' }}>Priority</InputLabel>
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
              <label className="block text-[11.5px] font-bold text-gray-700 mb-1.5">Notes</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg p-2.5 text-[11.5px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
                rows={2}
                placeholder="Add any specific instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button 
              onClick={() => { setAssignDialogOpen(false); setSelectedStaffId(null); }}
              disabled={submitting}
              className="px-3.5 py-1.5 text-[11.5px] font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleAssign}
              disabled={!selectedRoomToAssign || !selectedStaffId || submitting}
              className="px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-[#1b7f43] hover:bg-[#166b37] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting && <CircularProgress size={12} color="inherit" />}
              Assign
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
