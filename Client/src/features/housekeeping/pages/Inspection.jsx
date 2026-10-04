import { addAuditLog } from '../../audit/state/auditStore.js';
import React, { useState } from 'react';
import { 
  Search, CheckCircle, Warning, Edit, VerifiedUser, PlayArrow, AssignmentInd, MoreVert, Cancel, AssignmentTurnedIn
} from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Select, FormControl, Dialog } from '@mui/material';

import { getRooms, getStaff, saveRooms } from './hkStore';
import { useLocation } from 'react-router-dom';

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
  const [inspections, setInspections] = useState(getRooms().filter(r => r.status === 'Inspection Required'));
  const [staff, setStaff] = useState(getStaff());

  const [blinkActive, setBlinkActive] = useState(false);

  React.useEffect(() => {
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

  React.useEffect(() => {
    const syncData = () => setInspections(getRooms().filter(r => r.status === 'Inspection Required'));
    window.addEventListener('storage', syncData);
    window.addEventListener('hk_update', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('hk_update', syncData);
    };
  }, []);

  const handleEditSave = () => {
    const allRooms = getRooms();
    const newRooms = allRooms.map(r => r.id === editingRowId ? { 
      ...r, 
      cleaningType: editRowData.cleaningType, 
      assignee: editRowData.assignee, 
      priority: editRowData.priority,
      inspectionStatus: editRowData.inspectionStatus,
      inspector: editRowData.inspector
    } : r);
    setInspections(newRooms.filter(r => r.status === 'Inspection Required'));
    saveRooms(newRooms);
    try { addAuditLog({ module: 'Housekeeping', action: 'Updated Room Status', description: `Room status updated.`, importance: 'Normal' }); } catch(e) {}
    window.dispatchEvent(new Event('hk_update'));
    setEditingRowId(null);
  };

  const handleApprove = () => {
    const allRooms = getRooms();
    const newRooms = allRooms.map(r => r.id === selectedRoomId ? { 
      ...r, 
      status: 'Clean / Ready', 
      inspectionStatus: 'Approved',
      inspector: 'Supervisor',
      inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inspectionComments: comment 
    } : r);
    saveRooms(newRooms);
    try { addAuditLog({ module: 'Housekeeping', action: 'Updated Room Status', description: `Room status updated.`, importance: 'Normal' }); } catch(e) {}
    window.dispatchEvent(new Event('hk_update'));
    setInspectDialogOpen(false);
    setSelectedRoomId(null);
  };

  const handleFail = () => {
    const allRooms = getRooms();
    const newRooms = allRooms.map(r => r.id === selectedRoomId ? { 
      ...r, 
      status: 'Cleaning Required', 
      inspectionStatus: 'Failed',
      inspector: 'Supervisor',
      inspectionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inspectionComments: comment 
    } : r);
    saveRooms(newRooms);
    try { addAuditLog({ module: 'Housekeeping', action: 'Updated Room Status', description: `Room status updated.`, importance: 'Normal' }); } catch(e) {}
    window.dispatchEvent(new Event('hk_update'));
    setInspectDialogOpen(false);
    setSelectedRoomId(null);
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
    i.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 w-full overflow-visible min-w-0">
        <div className="p-3 border-b border-gray-100 flex flex-row items-center justify-between space-x-2 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[13.5px] lg:text-[14px]">
            Rooms Pending Inspection
          </h3>
          
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
              {filtered.length > 0 ? (
                filtered.map((row) => {
                  const isMatch = highlightStatus && row.status === highlightStatus;
                  const isEditing = editingRowId === row.id;
                  
                  return (
                    <tr key={row.id} className={`transition-colors ${blinkActive && isMatch ? 'blink-quick' : 'hover:bg-gray-50/30'}`}>
                      <td className="py-1.5 px-2.5 text-[11px] font-bold text-gray-900">{row.id}</td>
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
                              {staff.map(s => (
                                <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
                              ))}
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
                              <MenuItem value="Supervisor">Supervisor</MenuItem>
                              <MenuItem value="Manager">Manager</MenuItem>
                              <MenuItem value="Head Housekeeper">Head Housekeeper</MenuItem>
                            </Select>
                          </FormControl>
                        ) : row.inspector}
                      </td>

                      <td className="py-1.5 px-2.5 text-[11px] font-medium text-gray-500">{row.inspectionTime}</td>
                      
                      <td className="py-1.5 px-2.5 text-center">
                        {isEditing ? (
                          <div className="flex gap-1 justify-center">
                            <IconButton size="small" onClick={handleEditSave}><CheckCircle sx={{ fontSize: 16, color: '#1b7f43' }}/></IconButton>
                            <IconButton size="small" onClick={() => setEditingRowId(null)}><Cancel sx={{ fontSize: 16, color: '#ef4444' }}/></IconButton>
                          </div>
                        ) : (
                          row.status === 'Inspection Required' && (
                            <IconButton onClick={(e) => handleMenuClick(e, row.id)} size="small" sx={{ p: 0.5 }}>
                              <MoreVert sx={{ fontSize: 16 }} />
                            </IconButton>
                          )
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

      <Dialog open={inspectDialogOpen} onClose={() => { setInspectDialogOpen(false); setSelectedRoomId(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <div className="p-5">
          <h2 className="text-base font-bold text-gray-900 mb-0.5">Room {selectedRoomId} Inspection</h2>
          <p className="text-[12px] text-gray-500 mb-4">Use the checklist below to verify the room condition.</p>
          
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
              className="px-3.5 py-1.5 text-[11.5px] font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleFail}
              className="px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
            >
              Fail & Reassign
            </button>
            <button 
              onClick={handleApprove}
              className="px-3.5 py-1.5 text-[11.5px] font-bold text-white bg-[#1b7f43] hover:bg-[#166b37] rounded-lg transition-colors shadow-sm"
            >
              Approve Room
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
