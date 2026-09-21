import React, { useState } from'react';
import { 
 Search, CheckCircle, Warning, Edit, VerifiedUser, PlayArrow, AssignmentInd, MoreVert, Cancel, AssignmentTurnedIn
} from'@mui/icons-material';
import { IconButton, Menu, MenuItem, Select, FormControl, Dialog } from'@mui/material';

import { getRooms, getStaff, saveRooms } from'./hkStore';
import { useLocation } from'react-router-dom';

const muiSelectSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'8px',
 backgroundColor:'#ffffff',
 fontSize:'12px',
 color:'#1f2937','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1.2px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'#1b7f43', borderWidth:'1.5px' },
 },'& .MuiSelect-select': {
 padding:'6px 12px',
 }
};

const INITIAL_DATA = [
 { id:'201', type:'Suite', guest:'-', cleaningType:'Deep Cleaning', assignee:'Bob Taylor', completedTime:'Today 10:30', priority:'High', status:'Pending', inspector:'-', inspectionTime:'-' },
 { id:'105', type:'Standard', guest:'Mike Tyson', cleaningType:'Checkout Cleaning', assignee:'Jane Smith', completedTime:'Today 09:00', priority:'Normal', status:'Approved', inspector:'Manager', inspectionTime:'Today 09:15' },
 { id:'302', type:'Deluxe', guest:'-', cleaningType:'Checkout Cleaning', assignee:'Alice Green', completedTime:'Yesterday 16:00', priority:'High', status:'Failed', inspector:'Supervisor', inspectionTime:'Yesterday 16:30' },
];

const CHECKLIST = ['Bedroom cleaned & dusted','Bed properly prepared & linens changed','Bathroom cleaned & sanitized','Towels replaced','Amenities replenished','Floor vacuumed/mopped','Trash removed','Furniture checked for damage','Overall room condition & smell good'
];



export default function Inspection() {
 const location = useLocation();
 const highlightStatus = location.state?.highlightStatus;

 const [searchQuery, setSearchQuery] = useState('');
 const [inspections, setInspections] = useState(getRooms().filter(r => r.status ==='Inspection Required'));
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
 const [editRowData, setEditRowData] = useState({ cleaningType:'', assignee:'', priority:'', inspectionStatus:'', inspector:'' });
 
 const [inspectDialogOpen, setInspectDialogOpen] = useState(false);
 const [checkedItems, setCheckedItems] = useState({});
 const [comment, setComment] = useState('');

 React.useEffect(() => {
 const syncData = () => setInspections(getRooms().filter(r => r.status ==='Inspection Required'));
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
 setInspections(newRooms.filter(r => r.status ==='Inspection Required'));
 saveRooms(newRooms);
 window.dispatchEvent(new Event('hk_update'));
 setEditingRowId(null);
 };

 const handleApprove = () => {
 const allRooms = getRooms();
 const newRooms = allRooms.map(r => r.id === selectedRoomId ? { 
 ...r, 
 status:'Clean / Ready', 
 inspectionStatus:'Approved',
 inspector:'Supervisor',
 inspectionTime: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
 inspectionComments: comment 
 } : r);
 saveRooms(newRooms);
 window.dispatchEvent(new Event('hk_update'));
 setInspectDialogOpen(false);
 setSelectedRoomId(null);
 };

 const handleFail = () => {
 const allRooms = getRooms();
 const newRooms = allRooms.map(r => r.id === selectedRoomId ? { 
 ...r, 
 status:'Cleaning Required', 
 inspectionStatus:'Failed',
 inspector:'Supervisor',
 inspectionTime: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
 inspectionComments: comment 
 } : r);
 saveRooms(newRooms);
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
 case'Approved': return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[11px] font-bold flex items-center w-fit"><VerifiedUser sx={{ fontSize: 14, mr: 0.5 }} /> Approved</span>;
 case'Failed': return <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[11px] font-bold flex items-center w-fit"><Cancel sx={{ fontSize: 14, mr: 0.5 }} /> Failed</span>;
 default: return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-[11px] font-bold flex items-center w-fit">Pending</span>;
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
 }`}</style>
 <div className="mt-4"></div>
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 w-full overflow-visible min-w-0">
 <div className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-x-2 overflow-visible">
 <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px]">
 Rooms Pending Inspection
 </h3>
 
 <div className="flex flex-row items-center space-x-2 ml-auto">
 {/* Search Bar */}
 <div className="relative w-32 md:w-48 xl:w-52 shrink">
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
 <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
 <button className="px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10">
 Pending Inspection
 </button>
 </div>
 </div>
 </div>

 <div className="">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-gray-50/50 border-b border-gray-100">
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room Number</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room Type</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Guest</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cleaning Type</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Housekeeper</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cleaning Completed</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Priority</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inspection Status</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inspector</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Inspection Time</th>
 <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-50">
 {filtered.length > 0 ? (
 filtered.map((row) => {
 const isMatch = highlightStatus && row.status === highlightStatus;
 const isEditing = editingRowId === row.id;
 
 return (
 <tr key={row.id} className={`transition-colors ${blinkActive && isMatch ?'blink-quick' :'hover:bg-gray-50/50'}`}>
 <td className="py-3 px-3 text-[13px] font-bold text-gray-900">{row.id}</td>
 <td className="py-3 px-3 text-[12px] font-medium text-gray-500">{row.type}</td>
 <td className="py-3 px-3 text-[13px] font-bold text-gray-800">{row.guest}</td>
 
 <td className="py-2 px-2 text-[13px] font-semibold text-gray-700">
 {isEditing ? (
 <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 110,'& .MuiSelect-select': { padding:'4px 8px', fontSize:'11px' } }}>
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

 <td className="py-2 px-2 text-[13px] font-medium text-gray-700">
 {isEditing ? (
 <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 105,'& .MuiSelect-select': { padding:'4px 8px', fontSize:'11px' } }}>
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

 <td className="py-2 px-2 text-[12px] font-medium text-gray-500">{row.completedTime}</td>
 
 <td className="py-2 px-2">
 {isEditing ? (
 <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 90,'& .MuiSelect-select': { padding:'4px 8px', fontSize:'11px' } }}>
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
 <span className={`text-[12px] font-bold ${row.priority ==='High' ?'text-red-500' :'text-gray-500'}`}>{row.priority}</span>
 )}
 </td>

 <td className="py-2 px-2">
 {isEditing ? (
 <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 95,'& .MuiSelect-select': { padding:'4px 8px', fontSize:'11px' } }}>
 <Select 
 value={editRowData.inspectionStatus}
 onChange={e => setEditRowData({...editRowData, inspectionStatus: e.target.value})}
 >
 <MenuItem value="Pending">Pending</MenuItem>
 <MenuItem value="Approved">Approved</MenuItem>
 <MenuItem value="Failed">Failed</MenuItem>
 </Select>
 </FormControl>
 ) : getStatusBadge(row.inspectionStatus ||'Pending')}
 </td>
 
 <td className="py-2 px-2 text-[12px] font-medium text-gray-700">
 {isEditing ? (
 <FormControl size="small" sx={{ ...muiSelectSx, minWidth: 100,'& .MuiSelect-select': { padding:'4px 8px', fontSize:'11px' } }}>
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

 <td className="py-3 px-3 text-[12px] font-medium text-gray-500">{row.inspectionTime}</td>
 
 <td className="py-3 px-3 text-center">
 {isEditing ? (
 <div className="flex gap-1 justify-center">
 <IconButton size="small" onClick={handleEditSave}><CheckCircle sx={{ fontSize: 18, color:'#1b7f43' }}/></IconButton>
 <IconButton size="small" onClick={() => setEditingRowId(null)}><Cancel sx={{ fontSize: 18, color:'#ef4444' }}/></IconButton>
 </div>
 ) : (
 row.status ==='Inspection Required' && (
 <IconButton onClick={(e) => handleMenuClick(e, row.id)} size="small">
 <MoreVert sx={{ fontSize: 18 }} />
 </IconButton>
 )
 )}
 </td>
 </tr>
 );
 })
 ) : (
 <tr>
 <td colSpan={11} className="py-12 text-center text-gray-400 text-[13px] font-medium">
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
 transformOrigin={{ horizontal:'right', vertical:'top' }}
 anchorOrigin={{ horizontal:'right', vertical:'bottom' }}
 PaperProps={{ elevation: 2, sx: { borderRadius:'12px', minWidth:'160px', mt: 1, border:'1px solid #f3f4f6' } }}
 >
 <MenuItem onClick={() => {
 handleMenuClose();
 const room = inspections.find(r => r.id === selectedRoomId);
 if (room) {
 setEditRowData({ 
 cleaningType: room.cleaningType ||'', 
 assignee: room.assignee ||'', 
 priority: room.priority ||'Normal', 
 inspectionStatus: room.inspectionStatus ||'Pending', 
 inspector: room.inspector ||'' 
 });
 setEditingRowId(room.id);
 }
 }} sx={{ fontSize:'12.5px', fontWeight: 600, color:'#374151' }}>
 <Edit sx={{ fontSize: 16, mr: 1.5, color:'#3b82f6' }} /> Edit Inline
 </MenuItem>
 <MenuItem onClick={openInspection} sx={{ fontSize:'12.5px', fontWeight: 600, color:'#374151' }}>
 <AssignmentTurnedIn sx={{ fontSize: 16, mr: 1.5, color:'#1b7f43' }} /> Inspect Room
 </MenuItem>
 </Menu>

 <Dialog open={inspectDialogOpen} onClose={() => { setInspectDialogOpen(false); setSelectedRoomId(null); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius:'16px' } }}>
 <div className="p-6">
 <h2 className="text-lg font-bold text-gray-900 mb-1">Room {selectedRoomId} Inspection</h2>
 <p className="text-[13px] text-gray-500 mb-6">Use the checklist below to verify the room condition.</p>
 
 <div className="space-y-3 mb-6">
 {CHECKLIST.map((item, idx) => (
 <div 
 key={idx} 
 onClick={() => toggleCheck(idx)}
 className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
 >
 <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${checkedItems[idx] ?'bg-[#1b7f43] border-[#1b7f43]' :'border-gray-300'}`}>
 {checkedItems[idx] && <CheckCircle sx={{ fontSize: 14 }} className="text-white" />}
 </div>
 <span className={`text-[13px] font-medium ${checkedItems[idx] ?'text-gray-900' :'text-gray-600'}`}>{item}</span>
 </div>
 ))}
 </div>

 <div className="mb-8">
 <label className="block text-[13px] font-bold text-gray-700 mb-2">Inspector Comments</label>
 <textarea
 className="w-full border border-gray-200 rounded-xl p-3 text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b7f43]/20"
 rows={3}
 placeholder="Add any notes about the inspection..."
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 />
 </div>

 <div className="flex items-center justify-end gap-3">
 <button 
 onClick={() => { setInspectDialogOpen(false); setSelectedRoomId(null); }}
 className="px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
 >
 Cancel
 </button>
 <button 
 onClick={handleFail}
 className="px-4 py-2 text-[13px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm"
 >
 Fail & Reassign
 </button>
 <button 
 onClick={handleApprove}
 className="px-4 py-2 text-[13px] font-bold text-white bg-[#1b7f43] hover:bg-[#166b37] rounded-xl transition-colors shadow-sm"
 >
 Approve Room
 </button>
 </div>
 </div>
 </Dialog>
 </div>
 );
}
