import { addAuditLog } from '../../audit/state/auditStore.js';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, CheckCircle, Warning, Edit, VerifiedUser, AssignmentInd, MoreVert, Cancel, AssignmentTurnedIn, Refresh
} from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Select, FormControl, Dialog, CircularProgress, Alert } from '@mui/material';
import { useLocation } from 'react-router-dom';

import opsService from '../../../services/opsService';
import roomService from '../../../services/roomService';
import inspectionService from '../../../services/inspectionService';
import {
  toInspectionUIList,
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
    padding: '4px 8px',
  }
};

const CHECKLIST = [
  'Bedroom cleaned & dusted',
  'Bed properly prepared & linens changed',
  'Bathroom cleaned & sanitized',
  'Towels replaced',
  'Amenities replenished',
  'Floor vacuumed/mopped',
  'Trash removed',
  'Furniture checked for damage',
  'Overall room condition & smell good'
];

export default function Inspection() {
  const location = useLocation();
  const highlightStatus = location.state?.highlightStatus;

  const [searchQuery, setSearchQuery] = useState('');
  const [inspections, setInspections] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [blinkActive, setBlinkActive] = useState(false);

  useEffect(() => {
    if (highlightStatus) {
      setBlinkActive(true);
      const timer = setTimeout(() => setBlinkActive(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightStatus]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  
  const [editingRowId, setEditingRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({ cleaningType: '', assignee: '', priority: '', inspectionStatus: '', inspector: '' });
  
  const [inspectDialogOpen, setInspectDialogOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [comment, setComment] = useState('');
  const [selectedInspectorId, setSelectedInspectorId] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inspRes, tasksRes, roomsRes, empRes] = await Promise.all([
        inspectionService.getInspections({ limit: 100 }),
        opsService.getHousekeepingTasks({ limit: 100 }),
        roomService.getRooms({ limit: 100 }).catch(err => {
          console.warn('[Inspection] Failed to fetch rooms:', err);
          return { data: [] };
        }),
        opsService.getEmployees({ limit: 100 }).catch(err => {
          console.warn('[Inspection] Failed to fetch employees:', err);
          return { data: [] };
        })
      ]);

      const loadedInsps = Array.isArray(inspRes.data)
        ? inspRes.data
        : (inspRes.data?.inspections || []);

      const loadedTasks = Array.isArray(tasksRes.data)
        ? tasksRes.data
        : (tasksRes.data?.tasks || []);

      const loadedRooms = Array.isArray(roomsRes.data)
        ? roomsRes.data
        : (roomsRes.data?.rooms || []);

      const loadedEmployees = Array.isArray(empRes.data)
        ? empRes.data
        : (empRes.data?.employees || []);

      setStaff(loadedEmployees);
      if (loadedEmployees.length > 0 && !selectedInspectorId) {
        setSelectedInspectorId(loadedEmployees[0]._id);
      }

      const uiList = toInspectionUIList(loadedInsps, loadedTasks, loadedRooms, loadedEmployees);
      setInspections(uiList);
    } catch (err) {
      console.error('[Inspection] Failed to load data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load inspections from server');
    } finally {
      setLoading(false);
    }
  }, [selectedInspectorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditSave = async () => {
    const row = inspections.find(r => r.id === editingRowId);
    if (!row) return;

    setSubmitting(true);
    setActionError(null);
    try {
      if (row.taskId) {
        const updatePayload = {
          task_type: TASK_TYPE_UI_TO_BACKEND[editRowData.cleaningType] || 'CLEANING',
          priority: PRIORITY_UI_TO_BACKEND[editRowData.priority] || 'MEDIUM'
        };
        const matchingStaff = staff.find(s => s.name === editRowData.assignee || `${s.first_name || ''} ${s.last_name || ''}`.trim() === editRowData.assignee);
        if (matchingStaff) {
          updatePayload.assigned_to = matchingStaff._id;
        }
        await opsService.updateHousekeepingTask(row.taskId, updatePayload);
      }

      if (row.inspectionId) {
        await inspectionService.updateInspection(row.inspectionId, {
          status: editRowData.inspectionStatus === 'Approved' ? 'PASSED' : (editRowData.inspectionStatus === 'Failed' ? 'FAILED' : 'PENDING')
        });
      }

      try { addAuditLog({ module: 'Housekeeping', action: 'Updated Room Status', description: `Room ${row.roomNo} status updated.`, importance: 'Normal' }); } catch(e) {}
      window.dispatchEvent(new Event('hk_update'));
      setEditingRowId(null);
      await loadData();
    } catch (err) {
      console.error('[Inspection] Edit save failed:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to update inspection record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    const row = inspections.find(r => r.id === selectedRoomId);
    if (!row) return;

    setSubmitting(true);
    setActionError(null);
    try {
      const inspector = staff.find(s => s._id === selectedInspectorId) || staff[0];
      const payload = {
        room_id: row.roomId || undefined,
        room_number: row.roomNo || undefined,
        task_id: row.taskId || undefined,
        inspector_id: inspector?._id || undefined,
        inspector_name: inspector ? `${inspector.first_name || ''} ${inspector.last_name || ''}`.trim() : 'Supervisor',
        status: 'PASSED',
        passed: true,
        score: 100,
        comments: comment || 'Inspection passed'
      };

      await inspectionService.createInspection(payload);
      try { addAuditLog({ module: 'Housekeeping', action: 'Updated Room Status', description: `Room ${row.roomNo} inspection approved.`, importance: 'Normal' }); } catch(e) {}
      window.dispatchEvent(new Event('hk_update'));
      setInspectDialogOpen(false);
      setSelectedRoomId(null);
      await loadData();
    } catch (err) {
      console.error('[Inspection] Approval failed:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to approve room inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFail = async () => {
    const row = inspections.find(r => r.id === selectedRoomId);
    if (!row) return;

    setSubmitting(true);
    setActionError(null);
    try {
      const inspector = staff.find(s => s._id === selectedInspectorId) || staff[0];
      const payload = {
        room_id: row.roomId || undefined,
        room_number: row.roomNo || undefined,
        task_id: row.taskId || undefined,
        inspector_id: inspector?._id || undefined,
        inspector_name: inspector ? `${inspector.first_name || ''} ${inspector.last_name || ''}`.trim() : 'Supervisor',
        status: 'FAILED',
        passed: false,
        score: 0,
        comments: comment || 'Inspection failed'
      };

      await inspectionService.createInspection(payload);
      try { addAuditLog({ module: 'Housekeeping', action: 'Updated Room Status', description: `Room ${row.roomNo} inspection failed.`, importance: 'Normal' }); } catch(e) {}
      window.dispatchEvent(new Event('hk_update'));
      setInspectDialogOpen(false);
      setSelectedRoomId(null);
      await loadData();
    } catch (err) {
      console.error('[Inspection] Fail action failed:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to mark room inspection as failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRoomId(id);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openInspection = () => {
    handleMenuClose();
    setCheckedItems({});
    setComment('');
    setInspectDialogOpen(true);
  };

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold flex items-center w-fit"><VerifiedUser sx={{ fontSize: 13, mr: 0.5 }} /> Approved</span>;
      case 'Failed': return <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold flex items-center w-fit"><Cancel sx={{ fontSize: 13, mr: 0.5 }} /> Failed</span>;
      default: return <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[10px] font-bold flex items-center w-fit">Pending</span>;
    }
  };

  const filtered = inspections.filter(i => 
    (i.roomNo && i.roomNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (i.id && i.id.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (i.assignee && i.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in pb-8">
      <style>{`
        @keyframes quickBlink {
          0%, 100% { background-color: transparent; }
          50% { background-color: #dcfce7; }
        }
        .blink-quick {
          animation: quickBlink 0.4s ease-in-out infinite;
        }
      `}</style>
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
            <h3 className="text-gray-800 font-bold text-[13.5px] lg:text-[14px]">
              Rooms Pending Inspection
            </h3>
            {loading && <CircularProgress size={16} sx={{ color: '#1b7f43' }} />}
          </div>
          
          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar */}
            <div className="relative w-32 md:w-48 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 15 }} />
              <input 
                type="text" 
                placeholder="Search..." 
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
              title="Refresh inspections"
            >
              <Refresh sx={{ fontSize: 16 }} />
            </button>

            {/* Filter Tabs */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
              <button className="px-2 py-1 text-[10.5px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10">
                Pending Inspection
              </button>
            </div>
          </div>
        </div>

        <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Room Number</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Room Type</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Guest</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Cleaning Type</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Housekeeper</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Cleaning Completed</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Priority</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Inspection Status</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Inspector</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide">Inspection Time</th>
                <th className="py-2 px-2.5 text-[10.5px] font-bold text-gray-700 uppercase tracking-wide text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700 divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">
                    <CircularProgress size={24} sx={{ color: '#1b7f43' }} />
                    <p className="mt-2 text-xs font-medium">Loading inspections...</p>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((row) => {
                  const isMatch = highlightStatus && row.status === highlightStatus;
                  const isEditing = editingRowId === row.id;
                  
                  return (
                    <tr key={row.id} className={`transition-colors ${blinkActive && isMatch ? 'blink-quick' : 'hover:bg-gray-50/30'}`}>
                      <td className="py-1.5 px-2.5 text-[11px] font-bold text-gray-900">{row.roomNo || row.id}</td>
                      <td className="py-1.5 px-2.5 text-[11px] font-medium text-gray-500">{row.type}</td>
                      <td className="py-1.5 px-2.5 text-[11px] font-bold text-gray-800">{row.guest}</td>
                      
                      <td className="py-1.5 px-2 text-[11px] font-semibold text-gray-700">
                        {isEditing ? (
                          <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 105, '& .MuiSelect-select': { padding: '3px 6px', fontSize: '10.5px' } }}>
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
                        ) : row.cleaningType}
                      </td>

                      <td className="py-1.5 px-2 text-[11px] font-medium text-gray-700">
                        {isEditing ? (
                          <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 100, '& .MuiSelect-select': { padding: '3px 6px', fontSize: '10.5px' } }}>
                            <Select 
                              value={editRowData.assignee}
                              onChange={e => setEditRowData({...editRowData, assignee: e.target.value})}
                            >
                              <MenuItem value="-">None</MenuItem>
                              {staff.map(s => {
                                const sName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || s.employee_ref;
                                return <MenuItem key={s._id || s.id} value={sName}>{sName}</MenuItem>;
                              })}
                            </Select>
                          </FormControl>
                        ) : row.assignee}
                      </td>

                      <td className="py-1.5 px-2 text-[11px] font-medium text-gray-500">{row.completedTime}</td>
                      
                      <td className="py-1.5 px-2">
                        {isEditing ? (
                          <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 85, '& .MuiSelect-select': { padding: '3px 6px', fontSize: '10.5px' } }}>
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
                          <span className={`text-[11px] font-bold ${row.priority === 'High' ? 'text-red-500' : 'text-gray-500'}`}>{row.priority}</span>
                        )}
                      </td>

                      <td className="py-1.5 px-2">
                        {isEditing ? (
                          <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 90, '& .MuiSelect-select': { padding: '3px 6px', fontSize: '10.5px' } }}>
                            <Select 
                              value={editRowData.inspectionStatus}
                              onChange={e => setEditRowData({...editRowData, inspectionStatus: e.target.value})}
                            >
                              <MenuItem value="Pending">Pending</MenuItem>
                              <MenuItem value="Approved">Approved</MenuItem>
                              <MenuItem value="Failed">Failed</MenuItem>
                            </Select>
                          </FormControl>
                        ) : getStatusBadge(row.inspectionStatus || 'Pending')}
                      </td>
                      
                      <td className="py-1.5 px-2 text-[11px] font-medium text-gray-700">
                        {isEditing ? (
                          <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 95, '& .MuiSelect-select': { padding: '3px 6px', fontSize: '10.5px' } }}>
                            <Select 
                              value={editRowData.inspector}
                              onChange={e => setEditRowData({...editRowData, inspector: e.target.value})}
                            >
                              <MenuItem value="-">None</MenuItem>
                              {staff.map(s => {
                                const sName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || s.employee_ref;
                                return <MenuItem key={s._id || s.id} value={sName}>{sName}</MenuItem>;
                              })}
                            </Select>
                          </FormControl>
                        ) : row.inspector}
                      </td>

                      <td className="py-1.5 px-2.5 text-[11px] font-medium text-gray-500">{row.inspectionTime}</td>
                      
                      <td className="py-1.5 px-2.5 text-center">
                        {isEditing ? (
                          <div className="flex gap-1 justify-center">
                            <IconButton size="small" onClick={handleEditSave} disabled={submitting}>
                              <CheckCircle sx={{ fontSize: 16, color: '#1b7f43' }}/>
                            </IconButton>
                            <IconButton size="small" onClick={() => setEditingRowId(null)} disabled={submitting}>
                              <Cancel sx={{ fontSize: 16, color: '#ef4444' }}/>
                            </IconButton>
                          </div>
                        ) : (
                          <IconButton 
                            onClick={(e) => handleMenuClick(e, row.id)} 
                            size="small" 
                            sx={{ p: 0.5 }}
                            aria-label={`actions-${row.roomNo || row.id}`}
                          >
                            <MoreVert sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-gray-400 text-[11.5px] font-medium">
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
        PaperProps={{ elevation: 2, sx: { borderRadius: '10px', minWidth: '150px', mt: 0.5, border: '1px solid #f3f4f6' } }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          const room = inspections.find(r => r.id === selectedRoomId);
          if (room) {
            setEditRowData({ 
              cleaningType: room.cleaningType || '', 
              assignee: room.assignee || '', 
              priority: room.priority || 'Normal', 
              inspectionStatus: room.inspectionStatus || 'Pending', 
              inspector: room.inspector || '' 
            });
            setEditingRowId(room.id);
          }
        }} sx={{ fontSize: '11.5px', fontWeight: 600, color: '#374151' }}>
          <Edit sx={{ fontSize: 15, mr: 1, color: '#3b82f6' }} /> Edit Inline
        </MenuItem>
        <MenuItem onClick={openInspection} sx={{ fontSize: '11.5px', fontWeight: 600, color: '#374151' }}>
          <AssignmentTurnedIn sx={{ fontSize: 15, mr: 1, color: '#1b7f43' }} /> Inspect Room
        </MenuItem>
      </Menu>

      <Dialog open={inspectDialogOpen} onClose={() => { if (!submitting) { setInspectDialogOpen(false); setSelectedRoomId(null); } }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <div className="p-5">
          <h2 className="text-base font-bold text-gray-900 mb-0.5">
            Room {inspections.find(r => r.id === selectedRoomId)?.roomNo || selectedRoomId} Inspection
          </h2>
          <p className="text-[12px] text-gray-500 mb-4">Use the checklist below to verify the room condition.</p>
          
          <div className="mb-4">
            <FormControl fullWidth size="small" sx={muiSelectSx}>
              <span className="text-[11px] font-bold text-gray-700 mb-1 block">Assigned Inspector</span>
              <Select
                value={selectedInspectorId}
                onChange={(e) => setSelectedInspectorId(e.target.value)}
                displayEmpty
              >
                {staff.map(s => {
                  const sName = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.name || s.employee_ref;
                  return (
                    <MenuItem key={s._id || s.id} value={s._id || s.id}>
                      {sName} {s.employee_ref ? `(${s.employee_ref})` : ''}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>

          <div className="space-y-2 mb-5">
            {CHECKLIST.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => toggleCheck(idx)}
                className="flex items-center gap-2.5 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${checkedItems[idx] ? 'bg-[#1b7f43] border-[#1b7f43]' : 'border-gray-300'}`}>
                  {checkedItems[idx] && <CheckCircle sx={{ fontSize: 12 }} className="text-white" />}
                </div>
                <span className={`text-[11.5px] font-medium ${checkedItems[idx] ? 'text-gray-900' : 'text-gray-600'}`}>{item}</span>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-[11.5px] font-bold text-gray-700 mb-1.5">Inspector Comments</label>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-2.5 text-[11.5px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
              rows={2.5}
              placeholder="Add any notes about the inspection..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button 
              onClick={() => { setInspectDialogOpen(false); setSelectedRoomId(null); }}
              disabled={submitting}
              className="px-3.5 py-1.5 text-[11.5px] font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleFail}
              disabled={submitting}
              className="px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting && <CircularProgress size={12} color="inherit" />}
              Fail & Reassign
            </button>
            <button 
              onClick={handleApprove}
              disabled={submitting}
              className="px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-[#1b7f43] hover:bg-[#166b37] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting && <CircularProgress size={12} color="inherit" />}
              Approve Room
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
