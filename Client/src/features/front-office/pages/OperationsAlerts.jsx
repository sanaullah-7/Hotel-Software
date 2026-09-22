import React, { useState, useMemo, useEffect } from'react';
import { TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem } from'@mui/material';
import {
 Notifications as NotificationsIcon,
 WarningAmber as WarningIcon,
 PendingActions as PendingActionsIcon,
 TaskAlt as TaskAltIcon,
 Hub as HubIcon,
 Star as StarIcon,
 CleaningServices as CleaningServicesIcon,
 Build as BuildIcon,
 Restaurant as RestaurantIcon,
 Security as SecurityIcon,
 Search as SearchIcon,
 Campaign as CampaignIcon,
 Schedule as ScheduleIcon,
 Room as RoomIcon,
 Person as PersonIcon,
 Forum as ForumIcon,
 Flag as FlagIcon,
 Badge as BadgeIcon,
 ReportProblem as ReportProblemIcon,
 Handshake as HandshakeIcon,
 CheckCircle as CheckCircleIcon,
 Close as CloseIcon,
 RestartAlt as RestartAltIcon,
 LocalShipping as LocalShippingIcon,
 Send as SendIcon
} from'@mui/icons-material';
import Notifications from'@mui/icons-material/Notifications';
import Warning from'@mui/icons-material/Warning';
import Schedule from'@mui/icons-material/Schedule';
import CheckCircle from'@mui/icons-material/CheckCircle';
import Search from'@mui/icons-material/Search';
import FileDownload from'@mui/icons-material/FileDownload';
import MoreHoriz from'@mui/icons-material/MoreHoriz';
import AddAlert from'@mui/icons-material/AddAlert';
import Person from'@mui/icons-material/Person';
import ChevronLeft from'@mui/icons-material/ChevronLeft';
import ChevronRight from'@mui/icons-material/ChevronRight';
import Edit from'@mui/icons-material/Edit';
import Delete from'@mui/icons-material/Delete';

// ---- Department visual theme (icon, colors) — reused across load bars + alert cards ----
const DEPARTMENTS = {'VIP Arrivals': { icon: StarIcon, color:'#2e7d32', bg:'#edf7ed' },'Housekeeping': { icon: CleaningServicesIcon, color:'#10b981', bg:'#ecfdf5' },'Maintenance': { icon: BuildIcon, color:'#f97316', bg:'#fff7ed' },'Dining & F&B': { icon: RestaurantIcon, color:'#a855f7', bg:'#f3e8ff' },'Security & Front Desk': { icon: SecurityIcon, color:'#2e7d32', bg:'#edf7ed' },
};
const DEFAULT_DEPARTMENT = 'VIP Arrivals';

const PRIORITY_STYLES = {
 Critical:'bg-[#fee2e2] text-[#dc2626]',
 High:'bg-[#ffedd5] text-[#ea580c]',
 Medium:'bg-[#edf7ed] text-[#2e7d32]',
 Low:'bg-[#f1f5f9] text-[#64748b]',
};

const STATUS_STYLES = {
 Open:'bg-white text-[#dc2626] border border-[#fecaca]','In Progress':'bg-white text-[#ea580c] border border-[#fed7aa]',
 Assigned:'bg-white text-[#2e7d32] border border-[#a7f3d0]',
 Resolved:'bg-white text-[#10b981] border border-[#a7f3d0]',
};

const initialAlerts = [
 {
 id:'AL-0087',
 title:'VIP Presidential Arrival - Final Amenity Placement',
 department:'VIP Arrivals',
 priority:'Critical',
 status:'Open',
 time:'6:00 PM (Jul 24, 2025)',
 location:'Presidential Suite 501',
 guest:'Lady Evelyn Montague',
 reportedBy:'Concierge Team',
 reportedAgo:'5 mins ago',
 description:'Lady Evelyn Montague landing at private hangar at 5:45 PM. Verify Dom Perignon vintage chilling, organic fruit arrangement, and personalized monogrammed robes in Presidential Suite 501.',
 action:'Inspect suite amenities and dispatch luxury housefloor deployment kit.',
 assignedTo:'Concierge Team (Sarah)',
 },
 {
 id:'AL-0091',
 title:'AC Cooling Malfunction in Deluxe Ocean Suite',
 department:'Maintenance',
 priority:'High',
 status:'In Progress',
 time:'5:40 PM (Jul 24, 2025)',
 location:'Suite 214',
 guest:'Multiple Guests',
 reportedBy:'Front Desk Team',
 reportedAgo:'12 mins ago',
 description:'Guest reported ambient room temperature rising to 78°F despite thermostat set to 70°F. Compressor cycle check required immediately.',
 action:'Dispatch HVAC technician to inspect and repair compressor unit.',
 assignedTo:'Engineering Lead (David)',
 },
 {
 id:'AL-0093',
 title:'Priority Turnover & Deep Sanitization - Early Check-In',
 department:'Housekeeping',
 priority:'High',
 status:'In Progress',
 time:'5:00 PM (Jul 24, 2025)',
 location:'Villa 108',
 guest:'VIP Guest (Loudon Party)',
 reportedBy:'Front Desk',
 reportedAgo:'7 mins ago',
 description:'Villa 108 scheduled for early VIP check-in at 15:00. Requires complete private pool deck reset and hypoallergenic bedding package.',
 action:'Ensure private pool deck reset and hypoallergenic bedding staged.',
 assignedTo:'Housekeeping Supervisor (Maria)',
 },
 {
 id:'AL-0090',
 title:'Special Dietary Anniversary Dining Service',
 department:'Dining & F&B',
 priority:'Medium',
 status:'Open',
 time:'4:15 PM (Jul 24, 2025)',
 location:'Suite 317',
 guest:'Mr. & Mrs. Ashford',
 reportedBy:'Butler Service',
 reportedAgo:'10 mins ago',
 description:'Suite 317 celebrating 25th Anniversary. Severe shellfish & nut allergy — Chef Jean-Luc caution required. Finalize custom tasting menu with Chateau Margaux to be served at 19:30.',
 action:'Confirm allergen-safe menu plan and pair wine selection setup.',
 assignedTo:'F&B Manager (Claire)',
 },
 {
 id:'AL-0089',
 title:'Luxury Chauffeur Airport Dispatch',
 department:'Security & Front Desk',
 priority:'Medium',
 status:'In Progress',
 time:'3:50 PM (Jul 24, 2025)',
 location:'Airport VIP Terminal',
 guest:'Mr. Royce Fenwick',
 reportedBy:'Concierge',
 reportedAgo:'15 mins ago',
 description:'Rolls-Royce Phantom requested for terminal pickup at Grand Central VIP for arriving CEO delegation.',
 action:'Confirm flight window and coordinate chauffeur dispatch timing.',
 assignedTo:'Transport Lead (Ishaan)',
 },
];

const PRIORITY_OPTIONS = ['All','Critical','High','Medium','Low'];
const STATUS_OPTIONS = ['All','Open','In Progress','Assigned','Resolved'];

const muiSelectSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'8px',
 backgroundColor:'#ffffff',
 fontSize:'12px',
 height:'32px',
 color:'#1f2937','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1.2px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'#1b7f43', borderWidth:'1.5px' },
 },'& .MuiSelect-select': {
 padding:'0 8px',
 display:'flex',
 alignItems:'center',
 height:'32px',
 },'& .MuiInputLabel-root': {
 fontSize:'13px',
 color:'#6b7280',
 transform:'translate(14px, 7px) scale(1)','&.Mui-focused': { color:'#1b7f43' }
 },'& .MuiInputLabel-root.MuiInputLabel-shrink': {
 transform:'translate(14px, -9px) scale(0.75)',
 },
};

export default function OperationsAlerts() {
 const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('hotel_ops_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return initialAlerts;
  });

  useEffect(() => {
    localStorage.setItem('hotel_ops_alerts', JSON.stringify(alerts));
  }, [alerts]);
 const [searchQuery, setSearchQuery] = useState('');
 const [deptFilter, setDeptFilter] = useState('All');
 const [priorityFilter, setPriorityFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All');
 const [broadcastOpen, setBroadcastOpen] = useState(false);
 const [broadcastMsg, setBroadcastMsg] = useState('');
 const [alertTitle, setAlertTitle] = useState('');
 const [alertDept, setAlertDept] = useState(DEFAULT_DEPARTMENT);
 const [alertPriority, setAlertPriority] = useState('High');
 const [broadcastSentMsg, setBroadcastSentMsg] = useState('');

 // ---- Derived summary counts (live — react to status changes below) ----
 const activeCount = alerts.filter(a => a.status !=='Resolved').length;
 const criticalCount = alerts.filter(a => a.priority ==='Critical' && a.status !=='Resolved').length;
 const inProgressCount = alerts.filter(a => a.status ==='In Progress').length;
 const resolvedCount = alerts.filter(a => a.status ==='Resolved').length;

 const departmentLoad = useMemo(() => {
 return Object.keys(DEPARTMENTS).map(dept => {
 const active = alerts.filter(a => a.department === dept && a.status !=='Resolved').length;
 return { dept, active };
 });
 }, [alerts]);
 const maxLoad = Math.max(1, ...departmentLoad.map(d => d.active));

 const filteredAlerts = useMemo(() => {
 return alerts.filter(a => {
 if (deptFilter !=='All' && a.department !== deptFilter) return false;
 if (priorityFilter !=='All' && a.priority !== priorityFilter) return false;
 if (statusFilter !=='All' && a.status !== statusFilter) return false;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 const matches = a.title.toLowerCase().includes(q) ||
 a.location.toLowerCase().includes(q) ||
 a.guest.toLowerCase().includes(q) ||
 a.id.toLowerCase().includes(q) ||
 a.reportedBy.toLowerCase().includes(q);
 if (!matches) return false;
 }
 return true;
 });
 }, [alerts, deptFilter, priorityFilter, statusFilter, searchQuery]);

 const handleReset = () => {
 setSearchQuery('');
 setDeptFilter('All');
 setPriorityFilter('All');
 setStatusFilter('All');
 };

 const handleEscalate = (id) => {
 setAlerts(prev => prev.map(a => a.id === id ? { ...a, priority:'Critical' } : a));
 };

 const handleAcknowledge = (id) => {
 setAlerts(prev => prev.map(a => a.id === id ? { ...a, status:'In Progress' } : a));
 };

 const handleResolve = (id) => {
 setAlerts(prev => prev.map(a => a.id === id ? { ...a, status:'Resolved' } : a));
 };

 const handleSendBroadcast = () => {
    if (!alertTitle.trim()) return;
    
    const newAlert = {
      id: 'AL-' + Math.floor(1000 + Math.random() * 9000),
      title: alertTitle.trim(),
      department: alertDept,
      priority: alertPriority,
      status: 'Open',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' (' + new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) + ')',
      location: 'Front Desk Broadcast',
      guest: 'Multiple/None',
      reportedBy: 'Front Office',
      reportedAgo: 'Just now',
      description: 'Broadcast message triggered manually via Front Office Dashboard.',
      action: 'Acknowledge and proceed as instructed.',
      assignedTo: alertDept + ' Team'
    };

    setAlerts(prev => [newAlert, ...prev]);
    setBroadcastOpen(false);
    setBroadcastSentMsg(`Broadcast "${alertTitle.trim()}" dispatched and saved successfully.`);
    setAlertTitle('');
    setTimeout(() => setBroadcastSentMsg(''), 4000);
  };

 return (
 <div className="pt-1 min-h-screen">
 {/* TOP SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
          <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 p-3 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[#64748b] font-bold text-[10px] uppercase leading-tight mt-0.5">Active Alerts</span>
                <span className="bg-[#edf7ed] text-[#2e7d32] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse"></span>Live
                </span>
              </div>
              <span className="text-[24px] font-black text-[#0f172a] leading-none tracking-tight">{activeCount}</span>
              <span className="text-[10px] text-[#94a3b8] font-medium leading-tight mt-0.5">Requires operational staff attention</span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
              <NotificationsIcon sx={{ fontSize: 18 }} />
            </div>
          </div>
  
          <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 p-3 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[#64748b] font-bold text-[10px] uppercase leading-tight mb-0.5 mt-0.5">Critical & Urgent</span>
              <span className="text-[24px] font-black text-[#0f172a] leading-none tracking-tight">{criticalCount}</span>
              <span className="text-[10px] text-[#94a3b8] font-medium leading-tight mt-0.5">High escalation threshold</span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600 shrink-0">
              <ReportProblemIcon sx={{ fontSize: 18 }} />
            </div>
          </div>
  
          <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 p-3 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[#64748b] font-bold text-[10px] uppercase leading-tight mb-0.5 mt-0.5">In Progress</span>
              <span className="text-[24px] font-black text-[#0f172a] leading-none tracking-tight">{inProgressCount}</span>
              <span className="text-[10px] text-[#94a3b8] font-medium leading-tight mt-0.5">Staff actively attending</span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-50 text-orange-600 shrink-0">
              <PendingActionsIcon sx={{ fontSize: 18 }} />
            </div>
          </div>
  
          <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 p-3 flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[#64748b] font-bold text-[10px] uppercase leading-tight mb-0.5 mt-0.5">Resolved Today</span>
              <span className="text-[24px] font-black text-[#0f172a] leading-none tracking-tight">{resolvedCount}</span>
              <span className="text-[10px] text-[#94a3b8] font-medium leading-tight mt-0.5">Avg. time: 32 mins</span>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600 shrink-0">
              <TaskAltIcon sx={{ fontSize: 18 }} />
            </div>
          </div>
        </div>
  
        {/* DEPARTMENT OPERATIONS LOAD */}
 <div className="bg-white rounded-[10px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-4 mb-2">
 <div className="flex justify-between items-center border-b border-gray-100 mb-4">
 <div className="flex items-center gap-3">
 <h2 className="text-[20px] font-black text-[#0f172a]">Department Operations Load</h2>
 </div>
 <span className="text-[#64748b] font-medium text-[13px]">Click a department to filter active tickets</span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
 {departmentLoad.map(({ dept, active }) => {
 const theme = DEPARTMENTS[dept] ?? DEPARTMENTS[DEFAULT_DEPARTMENT];
 const Icon = theme.icon;
 const isActive = deptFilter === dept;
 return (
 <button
 key={dept}
 onClick={() => setDeptFilter(isActive ?'All' : dept)}
 className={`text-left border rounded-[16px] p-4 flex flex-col gap-3 transition-all cursor-pointer ${
 isActive ?'border-[#2e7d32] ring-1 ring-[#2e7d32]/30 bg-[#f5f6ff]' :'border-gray-100 hover:border-gray-200'
 }`}
 >
 <div className="flex items-center gap-3">
 
 <div className="flex flex-col min-w-0">
 <span className="text-[#0f172a] font-black text-[14px] leading-tight truncate">{dept}</span>
 <span className="text-[#64748b] font-medium text-[12px]">{active} active</span>
 </div>
 </div>
 <div className="w-full bg-[#f1f5f9] rounded-full h-[6px] mt-1">
 <div
 className="h-[6px] rounded-full transition-all"
 style={{ width:`${Math.round((active / maxLoad) * 100)}%`, backgroundColor: active > 0 ? theme.color :'#e2e8f0' }}
 ></div>
 </div>
 </button>
 );
 })}
 </div>
 </div>

 {/* SEARCH BAR */}
 <div className="flex items-center gap-3 mb-3">
 <div className="relative flex-1">
 
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search alerts by task, room, guest, or staff..."
 className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] transition-shadow"
 />
 </div>
 <span className="text-[#2e7d32] bg-[#edf7ed] text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0">
 {filteredAlerts.length} matching alert{filteredAlerts.length !== 1 ?'s' :''}
 </span>
 <button
 onClick={() => setBroadcastOpen(true)}
 className="flex items-center gap-1.5 bg-[#2e7d32] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-[12.5px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
 >
 Broadcast Alert
 </button>
 </div>

 {broadcastSentMsg && (
 <p className="text-[12px] font-semibold text-[#10b981] flex items-center gap-1.5 mb-3">
 {broadcastSentMsg}
 </p>
 )}

 {/* FILTER CHIPS + DROPDOWNS */}
 <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
 <div className="flex flex-wrap items-center gap-2">
 <button
 onClick={() => setDeptFilter('All')}
 className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer ${
 deptFilter ==='All' ?'bg-[#2e7d32] text-white' :'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
 }`}
 >
 All
 </button>
 {Object.keys(DEPARTMENTS).map(dept => (
 <button
 key={dept}
 onClick={() => setDeptFilter(dept)}
 className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer ${
 deptFilter === dept ?'bg-[#2e7d32] text-white' :'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
 }`}
 >
 {dept}
 </button>
 ))}
 </div>

 <div className="flex items-center gap-2">
 <FormControl size="small" sx={{ minWidth: 100, ...muiSelectSx }}>
 <InputLabel>Priority</InputLabel>
 <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
 {PRIORITY_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>)}
 </Select>
 </FormControl>
 <FormControl size="small" sx={{ minWidth: 100, ...muiSelectSx }}>
 <InputLabel>Status</InputLabel>
 <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
 {STATUS_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>)}
 </Select>
 </FormControl>
 <button
 onClick={handleReset}
 className="flex items-center gap-1 px-3 h-[32px] border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
 >
 Reset
 </button>
 </div>
 </div>

 {/* ALERTS LIST */}
 <div className="flex flex-col gap-2">
 {filteredAlerts.map(alert => {
 const theme = DEPARTMENTS[alert.department] ?? DEPARTMENTS[DEFAULT_DEPARTMENT];
 const Icon = theme.icon;
 const isResolved = alert.status ==='Resolved';

 return (
 <div key={alert.id} className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-5">
 {/* Header row */}
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex items-start gap-3 min-w-0">
 
 <div className="min-w-0">
 <div className="flex items-center flex-wrap gap-2">
 <h3 className="text-[14.5px] font-black text-[#0f172a] leading-tight">{alert.title}</h3>
 <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">{alert.id}</span>
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[alert.priority]}`}>{alert.priority}</span>
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[alert.status]}`}>{alert.status}</span>
 </div>
 <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-gray-500 font-medium">
 <span className="flex items-center gap-1">{alert.time}</span>
 <span className="flex items-center gap-1">{alert.location}</span>
 <span className="flex items-center gap-1">{alert.guest}</span>
 <span className="flex items-center gap-1">By {alert.reportedBy} ({alert.reportedAgo})</span>
 </div>
 </div>
 </div>

 <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#2e7d32] border border-[#c7d2fe] bg-[#edf7ed] px-2.5 py-1 rounded-full shrink-0">
 {alert.assignedTo}
 </span>
 </div>

 {/* Description */}
 <p className="text-[12.5px] text-gray-500 leading-relaxed mb-3">{alert.description}</p>

 {/* Action Required box */}
 <div className="bg-[#edf7ed] border border-[#e0e7ff] rounded-xl px-3.5 py-2.5 mb-3 flex items-start gap-2">
 
 <p className="text-[12px] text-[#4338ca] leading-snug">
 <span className="font-bold">Action Required:</span> {alert.action}
 </p>
 </div>

 {/* Footer row */}
 <div className="flex items-center justify-between gap-3">
 {isResolved ? (
 <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#10b981]">
 Resolved
 </span>
 ) : alert.priority !=='Critical' ? (
 <button
 onClick={() => handleEscalate(alert.id)}
 className="flex items-center gap-1 text-[11.5px] font-bold text-[#ef4444] hover:underline cursor-pointer"
 >
 Escalate Urgency
 </button>
 ) : <span />}

 {!isResolved && (
 <div className="flex items-center gap-2">
 {alert.status !=='In Progress' && (
 <button
 onClick={() => handleAcknowledge(alert.id)}
 className="flex items-center gap-1.5 bg-[#2e7d32] hover:brightness-110 text-white px-3.5 py-1.5 rounded-lg text-[11.5px] font-bold shadow-sm transition-all cursor-pointer"
 >
 Acknowledge
 </button>
 )}
 <button
 onClick={() => handleResolve(alert.id)}
 className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1.5 rounded-lg text-[11.5px] font-bold shadow-sm transition-all cursor-pointer"
 >
 Mark Resolved
 </button>
 </div>
 )}
 </div>
 </div>
 );
 })}

 {filteredAlerts.length === 0 && (
 <div className="bg-white rounded-[18px] border border-gray-100 p-10 text-center text-gray-400 text-[13px]">
 No alerts match your current filters.
 </div>
 )}
 </div>

 {/* BROADCAST ALERT MODAL */}
 {broadcastOpen && (
 <div
 className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
 onClick={() => setBroadcastOpen(false)}
 >
 <div
 className="bg-white rounded-xl shadow-2xl w-full max-w-[650px] overflow-hidden flex flex-col"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 <div className="bg-[#2e7d32] p-5 flex items-start justify-between">
 <div className="flex items-center gap-4">
 <div className="w-[50px] h-[50px] rounded-full border border-white/30 bg-white/10 flex items-center justify-center shrink-0">
 
 </div>
 <div className="flex flex-col">
 <h2 className="text-white text-[18px] font-bold leading-tight mb-1">Dispatch Operations Alert</h2>
 <p className="text-green-100 text-[12px] font-medium leading-tight">Broadcast critical task to hotel operational staff</p>
 </div>
 </div>
 <button onClick={() => setBroadcastOpen(false)} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
 
 </button>
 </div>

 {/* Body */}
 <div className="p-6 overflow-y-auto max-h-[70vh]">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {/* Row 1 */}
 <div className="col-span-1">
 <TextField 
 fullWidth label="Alert Title / Summary*" variant="outlined" size="small"
 value={alertTitle} onChange={(e) => setAlertTitle(e.target.value)}
 InputProps={{ startAdornment: <InputAdornment position="start"></InputAdornment> }}
 />
 </div>
 <div className="hidden md:block"></div>

 {/* Row 2 */}
 <FormControl fullWidth size="small">
 <InputLabel>Department / Category*</InputLabel>
 <Select label="Department / Category*" value={alertDept} onChange={(e) => setAlertDept(e.target.value)}>
 <MenuItem value="VIP Arrivals">VIP Arrivals</MenuItem>
 <MenuItem value="Housekeeping">Housekeeping</MenuItem>
 <MenuItem value="Maintenance">Maintenance</MenuItem>
 <MenuItem value="Dining & F&B">Dining &amp; F&amp;B</MenuItem>
 <MenuItem value="Security & Front Desk">Security &amp; Front Desk</MenuItem>
 </Select>
 </FormControl>
 
 <FormControl fullWidth size="small">
 <InputLabel>Priority Level*</InputLabel>
 <Select label="Priority Level*" value={alertPriority} onChange={(e) => setAlertPriority(e.target.value)}>
 <MenuItem value="High">High</MenuItem>
 <MenuItem value="Medium">Medium</MenuItem>
 <MenuItem value="Low">Low</MenuItem>
 <MenuItem value="Critical">Critical</MenuItem>
 </Select>
 </FormControl>

 {/* Row 3 */}
 <TextField 
 fullWidth label="Room / Location (Optional)" variant="outlined" size="small"
 InputProps={{ startAdornment: <InputAdornment position="start"></InputAdornment> }}
 />
 <TextField 
 fullWidth label="Guest Name (Optional)" variant="outlined" size="small"
 InputProps={{ startAdornment: <InputAdornment position="start"></InputAdornment> }}
 />

 {/* Row 4 */}
 <div className="col-span-1">
 <TextField 
 fullWidth label="Assign To Staff / Team (...)" variant="outlined" size="small"
 InputProps={{ startAdornment: <InputAdornment position="start"></InputAdornment> }}
 />
 </div>
 <div className="hidden md:block"></div>

 {/* Row 5 */}
 <div className="col-span-1">
 <TextField 
 fullWidth label="Specific Action Required*" variant="outlined" size="small"
 InputProps={{ startAdornment: <InputAdornment position="start"></InputAdornment> }}
 />
 </div>
 <div className="hidden md:block"></div>

 {/* Row 6 */}
 <div className="col-span-1 md:col-span-1">
 <TextField 
 fullWidth label="Detailed Operational In..." variant="outlined" multiline rows={3}
 />
 </div>
 </div>
 </div>

 {/* Footer */}
 <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end items-center gap-6 mt-2">
 <button
 onClick={() => setBroadcastOpen(false)}
 className="text-[#1b7f43] text-[13px] font-bold hover:opacity-80 transition-opacity cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={handleSendBroadcast}
 disabled={!alertTitle.trim()}
 className="px-6 py-2.5 rounded-lg bg-[#2e7d32] hover:bg-[#1b5e20] disabled:opacity-50 text-white text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-2"
 >
 
 Broadcast Alert
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
