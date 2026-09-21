import React, { useState } from'react';
import { 
 Dialog, DialogContent, DialogActions, 
 IconButton, TextField
} from'@mui/material';
import { Close } from'@mui/icons-material';
import { updateIncidentStatus } from'../inventoryStore';

const muiSelectSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'6px',
 backgroundColor:'#ffffff',
 fontSize:'12px',
 color:'#1f2937','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'#1b7f43', borderWidth:'1.5px' },
 },'& .MuiInputLabel-root': {
 fontSize:'12px',
 color:'#6b7280','&.Mui-focused': { color:'#1b7f43' }
 }
};

export default function IncidentDetailModal({ 
 open, 
 onClose, 
 incident, 
 onIncidentUpdated,
 onCreateGuestCharge
}) {
 if (!incident) return null;

 const [selectedStatus, setSelectedStatus] = useState(incident.status);
 const [resolutionNotes, setResolutionNotes] = useState(incident.resolutionNotes ||'');
 const [assignedTo, setAssignedTo] = useState(incident.assignedTo ||'Housekeeping Supervisor');

 React.useEffect(() => {
 if (incident) {
 setSelectedStatus(incident.status);
 setResolutionNotes(incident.resolutionNotes ||'');
 setAssignedTo(incident.assignedTo ||'Housekeeping Supervisor');
 }
 }, [incident]);

 const handleUpdateStatus = (newStatus) => {
 updateIncidentStatus(incident.id, newStatus, {
 resolutionNotes: resolutionNotes ||`Status progressed to ${newStatus}`,
 assignedTo: assignedTo,
 user:'Current Manager'
 });
 if (onIncidentUpdated) onIncidentUpdated();
 onClose();
 };

 const getStatusBadge = (status) => {
 switch (status) {
 case'Reported':
 return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Reported</span>;
 case'Under Investigation':
 return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Under Investigation</span>;
 case'Recovered':
 return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Recovered</span>;
 case'Replaced':
 return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Replaced</span>;
 case'Written Off':
 return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Written Off</span>;
 case'Resolved':
 return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Resolved</span>;
 default:
 return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">{status}</span>;
 }
 };

 return (
 <Dialog 
 open={open} 
 onClose={onClose} 
 maxWidth="md" 
 fullWidth
 PaperProps={{
 sx: { 
 borderRadius:'12px',
 overflow:'hidden',
 boxShadow:'0 10px 25px rgba(0,0,0,0.1)' 
 }
 }}
 >
 {/* Header */}
 <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-base font-bold tracking-tight">{incident.itemName}</h2>
 <span className="bg-white/15 text-white text-[11px] font-mono px-1.5 py-0.5 rounded">
 {incident.incidentNumber || incident.id}
 </span>
 </div>
 <p className="text-[11px] text-white/70 mt-0.5">
 Room: <span className="text-white font-bold">{incident.roomNumber}</span> • Category: {incident.category} • Reported: {incident.reportedDate}
 </p>
 </div>
 <div className="flex items-center gap-2">
 {getStatusBadge(incident.status)}
 <IconButton 
 onClick={onClose} 
 size="small" 
 sx={{ color:'white','&:hover': { backgroundColor:'rgba(255,255,255,0.2)' } }}
 >
 <Close sx={{ fontSize: 18 }} />
 </IconButton>
 </div>
 </div>

 <DialogContent sx={{ p: 2.5, backgroundColor:'#f9fafb' }}>
 
 {/* Lifecycle Stepper Bar */}
 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs mb-3">
 <p className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-2">
 Investigation & Resolution Lifecycle
 </p>
 <div className="grid grid-cols-4 gap-2">
 {[
 { title:'1. Reported', active: true, desc:'Logged on checkout' },
 { title:'2. Investigating', active: ['Under Investigation','Recovered','Replaced','Written Off','Resolved'].includes(incident.status), desc:'Room & cart audits' },
 { title:'3. Resolution', active: ['Recovered','Replaced','Written Off','Resolved'].includes(incident.status), desc: incident.resolutionType ||'Recovery / Reorder' },
 { title:'4. Closed', active: ['Recovered','Replaced','Written Off','Resolved'].includes(incident.status), desc:'Audit complete' }
 ].map((st, idx) => (
 <div 
 key={idx} 
 className={`p-2 rounded border text-center transition-all ${
 st.active 
 ?'bg-[#e5f4eb]/60 border-[#1b7f43]/30 text-[#1b7f43]' 
 :'bg-gray-50 border-gray-200 text-gray-400'
 }`}
 >
 <span className="text-xs font-bold block">{st.title}</span>
 <span className="text-[10px] text-gray-500 block truncate">{st.desc}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 
 {/* Main Column (2 cols) */}
 <div className="md:col-span-2 space-y-3">
 {/* Incident Summary Card */}
 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs space-y-2.5">
 <h4 className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Incident Details</h4>
 <div className="grid grid-cols-2 gap-2 text-[12px]">
 <div>
 <span className="text-gray-400 block text-[10.5px]">Room / Location</span>
 <span className="font-bold text-gray-900">Room {incident.roomNumber}</span>
 </div>
 <div>
 <span className="text-gray-400 block text-[10.5px]">Expected vs Missing Qty</span>
 <span className="font-bold text-gray-900">Expected: {incident.expectedQty || 1} • <span className="text-red-600">Missing: {incident.missingQty || incident.quantity || 1}</span></span>
 </div>
 <div>
 <span className="text-gray-400 block text-[10.5px]">Reported By</span>
 <span className="font-semibold text-gray-800">{incident.reportedBy}</span>
 </div>
 <div>
 <span className="text-gray-400 block text-[10.5px]">Assigned Investigator</span>
 <span className="font-semibold text-gray-800">{incident.assignedTo ||'Unassigned'}</span>
 </div>
 {incident.guestName && (
 <div className="col-span-2">
 <span className="text-gray-400 block text-[10.5px]">Guest in Occupancy</span>
 <span className="font-semibold text-gray-800">{incident.guestName}</span>
 </div>
 )}
 <div className="col-span-2 pt-1.5 border-t border-gray-50">
 <span className="text-gray-400 block text-[10.5px] mb-0.5">Reason / Inspection Finding</span>
 <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
 {incident.reason ||'No description provided.'}
 </p>
 </div>
 {incident.notes && (
 <div className="col-span-2">
 <span className="text-gray-400 block text-[10.5px] mb-0.5">Investigation Notes</span>
 <p className="text-xs text-gray-600 italic bg-amber-50/50 p-2 rounded border border-amber-100">"{incident.notes}"
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Audit Timeline */}
 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs space-y-2">
 <h4 className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Audit Log & Timeline</h4>
 <div className="space-y-2.5 pl-2 border-l-2 border-gray-200">
 {(incident.timeline || []).map((ev, i) => (
 <div key={i} className="relative pl-3">
 <div className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-[#1b7f43] ring-3 ring-emerald-50"></div>
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-gray-800">{ev.action}</span>
 <span className="text-[10px] text-gray-400">{ev.date}</span>
 </div>
 <p className="text-xs text-gray-600 mt-0.5">{ev.detail}</p>
 <span className="text-[10px] text-gray-400 block mt-0.5">By: {ev.user}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Action Workflow Column (1 col) */}
 <div className="space-y-3">
 
 {/* Guest Folio Decision Box */}
 <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 shadow-xs space-y-2">
 <div className="flex items-center gap-1.5 text-amber-900">
 <span className="text-xs font-bold">Guest Folio Action</span>
 </div>
 <p className="text-[11px] text-amber-800 leading-snug">
 Missing items are not automatically billed. If hotel investigation determines the guest is responsible:
 </p>
 <button
 onClick={() => {
 if (onCreateGuestCharge) {
 onCreateGuestCharge(incident);
 }
 onClose();
 }}
 className="w-full py-1.5 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-bold transition cursor-pointer shadow-xs"
 >
 + Create Guest Charge
 </button>
 </div>

 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs space-y-2">
 <h4 className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">Update Incident Status</h4>
 
 <div className="space-y-2.5">
 <TextField 
 label="Resolution Notes / Audit Log" 
 multiline 
 rows={2} 
 size="small" 
 value={resolutionNotes} 
 placeholder="Enter details on recovery, replacement, or write-off reason..."
 onChange={e => setResolutionNotes(e.target.value)}
 sx={muiSelectSx} 
 fullWidth 
 />

 <div className="space-y-1.5 pt-1">
 <span className="text-[10.5px] font-bold text-gray-500 uppercase block">Execute Action:</span>

 {incident.status !=='Under Investigation' && incident.status ==='Reported' && (
 <button
 onClick={() => handleUpdateStatus('Under Investigation')}
 className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition cursor-pointer"
 >
 Start Investigation
 </button>
 )}

 <button
 onClick={() => handleUpdateStatus('Recovered')}
 className="w-full py-1.5 px-3 bg-[#1b7f43] hover:bg-[#166b37] text-white rounded text-xs font-semibold transition cursor-pointer"
 >
 Mark as Recovered (Found)
 </button>

 <button
 onClick={() => handleUpdateStatus('Replaced')}
 className="w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition cursor-pointer"
 >
 Mark as Replaced (From Stock)
 </button>

 <button
 onClick={() => handleUpdateStatus('Written Off')}
 className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold transition cursor-pointer"
 >
 Mark as Written Off
 </button>
 </div>
 </div>
 </div>

 {/* Financial Impact */}
 <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
 <span className="text-[10.5px] font-bold text-gray-400 uppercase block mb-1">Financial Impact</span>
 <div className="flex items-baseline justify-between text-xs">
 <span className="text-gray-600">Unit Replacement:</span>
 <span className="font-bold text-gray-900">${Number(incident.unitValue || 0).toFixed(2)}</span>
 </div>
 <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-gray-50">
 <span className="text-xs font-bold text-gray-800">Total Loss:</span>
 <span className="text-xs font-extrabold text-red-600">${Number(incident.totalLoss || 0).toFixed(2)}</span>
 </div>
 </div>
 </div>

 </div>
 </DialogContent>

 <DialogActions sx={{ p: 2, backgroundColor:'white', borderTop:'1px solid #f3f4f6' }}>
 <button
 onClick={onClose}
 className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors cursor-pointer"
 >
 Close
 </button>
 </DialogActions>
 </Dialog>
 );
}
