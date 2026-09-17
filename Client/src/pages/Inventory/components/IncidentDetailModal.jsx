import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  IconButton, TextField, MenuItem, FormControl, InputLabel, Select,
  Stepper, Step, StepLabel, StepConnector 
} from '@mui/material';
import { 
  Close, ReportProblem, CheckCircle, SwapHoriz, 
  DeleteForever, Search, AccessTime, Person, MeetingRoom,
  Assignment, Notes, HistoryToggleOff, Verified
} from '@mui/icons-material';
import { updateIncidentStatus } from '../inventoryStore';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12.5px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': {
    fontSize: '12.5px',
    color: '#6b7280',
    '&.Mui-focused': { color: '#1b7f43' }
  }
};

const LIFECYCLE_STEPS = [
  'Reported',
  'Under Investigation',
  'Resolution',
  'Resolved'
];

export default function IncidentDetailModal({ 
  open, 
  onClose, 
  incident, 
  onIncidentUpdated 
}) {
  if (!incident) return null;

  const [selectedStatus, setSelectedStatus] = useState(incident.status);
  const [resolutionNotes, setResolutionNotes] = useState(incident.resolutionNotes || '');
  const [assignedTo, setAssignedTo] = useState(incident.assignedTo || 'Housekeeping Supervisor');

  React.useEffect(() => {
    if (incident) {
      setSelectedStatus(incident.status);
      setResolutionNotes(incident.resolutionNotes || '');
      setAssignedTo(incident.assignedTo || 'Housekeeping Supervisor');
    }
  }, [incident]);

  const handleUpdateStatus = (newStatus) => {
    updateIncidentStatus(incident.id, newStatus, {
      resolutionNotes: resolutionNotes || `Status progressed to ${newStatus}`,
      assignedTo: assignedTo,
      user: 'Current Manager'
    });
    if (onIncidentUpdated) onIncidentUpdated();
    onClose();
  };

  const getStepActiveIndex = (status) => {
    switch (status) {
      case 'Reported': return 0;
      case 'Under Investigation': return 1;
      case 'Recovered':
      case 'Replaced':
      case 'Written Off': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reported':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Reported</span>;
      case 'Under Investigation':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Under Investigation</span>;
      case 'Recovered':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Recovered</span>;
      case 'Replaced':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Replaced</span>;
      case 'Written Off':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Written Off</span>;
      case 'Resolved':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Resolved</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
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
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)' 
        }
      }}
    >
      {/* Header */}
      <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <ReportProblem sx={{ fontSize: 24 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">{incident.itemName}</h2>
              <span className="bg-white/15 text-white text-[11px] font-mono px-2 py-0.5 rounded-md">
                {incident.incidentNumber || incident.id}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-0.5">
              Room: <span className="text-white font-bold">{incident.roomNumber}</span> • Category: {incident.category} • Reported: {incident.reportedDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(incident.status)}
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </div>

      <DialogContent sx={{ p: 3, backgroundColor: '#f9fafb' }}>
        
        {/* Lifecycle Stepper Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs mb-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
            Investigation & Resolution Lifecycle
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { title: '1. Reported', active: true, desc: 'Logged on checkout' },
              { title: '2. Investigating', active: ['Under Investigation', 'Recovered', 'Replaced', 'Written Off', 'Resolved'].includes(incident.status), desc: 'Room & cart audits' },
              { title: '3. Resolution', active: ['Recovered', 'Replaced', 'Written Off', 'Resolved'].includes(incident.status), desc: incident.resolutionType || 'Recovery / Reorder' },
              { title: '4. Closed', active: ['Recovered', 'Replaced', 'Written Off', 'Resolved'].includes(incident.status), desc: 'Audit complete' }
            ].map((st, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  st.active 
                    ? 'bg-[#e5f4eb]/60 border-[#1b7f43]/30 text-[#1b7f43]' 
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                <span className="text-xs font-bold block">{st.title}</span>
                <span className="text-[10px] text-gray-500 block truncate">{st.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main Column (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            {/* Incident Summary Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Incident Details</h4>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span className="text-gray-400 block text-[11px]">Room Number</span>
                  <span className="font-bold text-gray-900">Room {incident.roomNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Missing Quantity</span>
                  <span className="font-bold text-red-600">{incident.quantity} Unit(s)</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Reported By</span>
                  <span className="font-semibold text-gray-800">{incident.reportedBy}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Assigned Investigator</span>
                  <span className="font-semibold text-gray-800">{incident.assignedTo || 'Unassigned'}</span>
                </div>
                {incident.guestName && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[11px]">Guest in Occupancy</span>
                    <span className="font-semibold text-gray-800">{incident.guestName}</span>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-gray-50">
                  <span className="text-gray-400 block text-[11px] mb-1">Reason / Inspection Finding</span>
                  <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg">
                    {incident.reason || 'No description provided.'}
                  </p>
                </div>
                {incident.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block text-[11px] mb-1">Investigation Notes</span>
                    <p className="text-xs text-gray-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                      "{incident.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Timeline */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audit Log & Timeline</h4>
              <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                {(incident.timeline || []).map((ev, i) => (
                  <div key={i} className="relative pl-4">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1b7f43] ring-4 ring-emerald-50"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800">{ev.action}</span>
                      <span className="text-[10.5px] text-gray-400">{ev.date}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{ev.detail}</p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">By: {ev.user}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Workflow Column (1 col) */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Update Incident Status</h4>
              
              <div className="space-y-3">
                <TextField 
                  label="Resolution Notes / Audit Log" 
                  multiline 
                  rows={3} 
                  size="small" 
                  value={resolutionNotes} 
                  placeholder="Enter details on recovery, replacement, or write-off reason..."
                  onChange={e => setResolutionNotes(e.target.value)}
                  sx={muiSelectSx} 
                  fullWidth 
                />

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase block">Execute Action:</span>

                  {incident.status !== 'Under Investigation' && incident.status === 'Reported' && (
                    <button
                      onClick={() => handleUpdateStatus('Under Investigation')}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Search sx={{ fontSize: 16 }} /> Start Investigation
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdateStatus('Recovered')}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#1b7f43] hover:bg-[#166b37] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <CheckCircle sx={{ fontSize: 16 }} /> Mark as Recovered (Found)
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Replaced')}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <SwapHoriz sx={{ fontSize: 16 }} /> Mark as Replaced (From Stock)
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Written Off')}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <DeleteForever sx={{ fontSize: 16 }} /> Mark as Written Off
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Impact */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Financial Impact</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-600">Unit Replacement:</span>
                <span className="text-xs font-bold text-gray-900">${Number(incident.unitValue || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-gray-50">
                <span className="text-xs font-bold text-gray-800">Total Loss:</span>
                <span className="text-sm font-extrabold text-red-600">${Number(incident.totalLoss || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
        <button
          onClick={onClose}
          className="px-5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
        >
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
}
