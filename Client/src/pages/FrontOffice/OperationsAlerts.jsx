import Search from '@mui/icons-material/Search';
import FileDownload from '@mui/icons-material/FileDownload';
import AddAlert from '@mui/icons-material/AddAlert';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Person from '@mui/icons-material/Person';
import Edit from '@mui/icons-material/Edit';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import React, { useState, useMemo } from 'react';
import { TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
} from '@mui/icons-material';

// ---- Department visual theme (icon, colors) — reused across load bars + alert cards ----
const DEPARTMENTS = {
  'VIP Arrivals': { icon: StarIcon, color: '#2e7d32', bg: '#edf7ed' },
  'Housekeeping': { icon: CleaningServicesIcon, color: '#10b981', bg: '#ecfdf5' },
  'Maintenance': { icon: BuildIcon, color: '#f97316', bg: '#fff7ed' },
  'Dining & F&B': { icon: RestaurantIcon, color: '#a855f7', bg: '#f3e8ff' },
  'Security & Front Desk': { icon: SecurityIcon, color: '#2e7d32', bg: '#edf7ed' },
};

const PRIORITY_STYLES = {
  Critical: 'bg-[#fee2e2] text-[#dc2626]',
  High: 'bg-[#ffedd5] text-[#ea580c]',
  Medium: 'bg-[#edf7ed] text-[#2e7d32]',
  Low: 'bg-[#f1f5f9] text-[#64748b]',
};

const STATUS_STYLES = {
  Open: 'bg-white text-[#dc2626] border border-[#fecaca]',
  'In Progress': 'bg-white text-[#ea580c] border border-[#fed7aa]',
  Assigned: 'bg-white text-[#2e7d32] border border-[#a7f3d0]',
  Resolved: 'bg-white text-[#10b981] border border-[#a7f3d0]',
};

const initialAlerts = [
  {
    id: 'AL-0087',
    title: 'VIP Presidential Arrival - Final Amenity Placement',
    department: 'VIP Arrivals',
    priority: 'Critical',
    status: 'Open',
    time: '6:00 PM (Jul 24, 2025)',
    location: 'Presidential Suite 501',
    guest: 'Lady Evelyn Montague',
    reportedBy: 'Concierge Team',
    reportedAgo: '5 mins ago',
    description: 'Lady Evelyn Montague landing at private hangar at 5:45 PM. Verify Dom Perignon vintage chilling, organic fruit arrangement, and personalized monogrammed robes in Presidential Suite 501.',
    action: 'Inspect suite amenities and dispatch luxury housefloor deployment kit.',
    assignedTo: 'Concierge Team (Sarah)',
  },
  {
    id: 'AL-0091',
    title: 'AC Cooling Malfunction in Deluxe Ocean Suite',
    department: 'Maintenance',
    priority: 'High',
    status: 'In Progress',
    time: '5:40 PM (Jul 24, 2025)',
    location: 'Suite 214',
    guest: 'Multiple Guests',
    reportedBy: 'Front Desk Team',
    reportedAgo: '12 mins ago',
    description: 'Guest reported ambient room temperature rising to 78°F despite thermostat set to 70°F. Compressor cycle check required immediately.',
    action: 'Dispatch HVAC technician to inspect and repair compressor unit.',
    assignedTo: 'Engineering Lead (David)',
  },
  {
    id: 'AL-0093',
    title: 'Priority Turnover & Deep Sanitization - Early Check-In',
    department: 'Housekeeping',
    priority: 'High',
    status: 'In Progress',
    time: '5:00 PM (Jul 24, 2025)',
    location: 'Villa 108',
    guest: 'VIP Guest (Loudon Party)',
    reportedBy: 'Front Desk',
    reportedAgo: '7 mins ago',
    description: 'Villa 108 scheduled for early VIP check-in at 15:00. Requires complete private pool deck reset and hypoallergenic bedding package.',
    action: 'Ensure private pool deck reset and hypoallergenic bedding staged.',
    assignedTo: 'Housekeeping Supervisor (Maria)',
  },
  {
    id: 'AL-0090',
    title: 'Special Dietary Anniversary Dining Service',
    department: 'Dining & F&B',
    priority: 'Medium',
    status: 'Open',
    time: '4:15 PM (Jul 24, 2025)',
    location: 'Suite 317',
    guest: 'Mr. & Mrs. Ashford',
    reportedBy: 'Butler Service',
    reportedAgo: '10 mins ago',
    description: 'Suite 317 celebrating 25th Anniversary. Severe shellfish & nut allergy — Chef Jean-Luc caution required. Finalize custom tasting menu with Chateau Margaux to be served at 19:30.',
    action: 'Confirm allergen-safe menu plan and pair wine selection setup.',
    assignedTo: 'F&B Manager (Claire)',
  },
  {
    id: 'AL-0089',
    title: 'Luxury Chauffeur Airport Dispatch',
    department: 'Security & Front Desk',
    priority: 'Medium',
    status: 'In Progress',
    time: '3:50 PM (Jul 24, 2025)',
    location: 'Airport VIP Terminal',
    guest: 'Mr. Royce Fenwick',
    reportedBy: 'Concierge',
    reportedAgo: '15 mins ago',
    description: 'Rolls-Royce Phantom requested for terminal pickup at Grand Central VIP for arriving CEO delegation.',
    action: 'Confirm flight window and coordinate chauffeur dispatch timing.',
    assignedTo: 'Transport Lead (Ishaan)',
  },
];

const PRIORITY_OPTIONS = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUS_OPTIONS = ['All', 'Open', 'In Progress', 'Assigned', 'Resolved'];

export default function OperationsAlerts() {

  // --- INJECTED MISSING VARIABLES ---
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [checkInData, setCheckInData] = useState([]);
  
  const handleExportCSV = () => {};
  const getStatusBadge = () => <span className="text-xs">Status</span>;
  const handleStatusChange = () => {};
  
  // Use alerts if it exists (OperationsAlerts), else use checkInData (CheckInOut)
  const rowsSource = (typeof alerts !== 'undefined') ? alerts : checkInData;
  const currentRows = rowsSource || [];
  const totalPages = 1;
  const indexOfFirstRow = 0;
  const indexOfLastRow = 10;
  // ----------------------------------
  
  const [alerts, setAlerts] = useState(initialAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDept, setAlertDept] = useState('VIP Arrival');
  const [alertPriority, setAlertPriority] = useState('High');
  const [broadcastSentMsg, setBroadcastSentMsg] = useState('');

  // ---- Derived summary counts (live — react to status changes below) ----
  const activeCount = alerts.filter(a => a.status !== 'Resolved').length;
  const criticalCount = alerts.filter(a => a.priority === 'Critical' && a.status !== 'Resolved').length;
  const inProgressCount = alerts.filter(a => a.status === 'In Progress').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  const departmentLoad = useMemo(() => {
    return Object.keys(DEPARTMENTS).map(dept => {
      const active = alerts.filter(a => a.department === dept && a.status !== 'Resolved').length;
      return { dept, active };
    });
  }, [alerts]);
  const maxLoad = Math.max(1, ...departmentLoad.map(d => d.active));

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (deptFilter !== 'All' && a.department !== deptFilter) return false;
      if (priorityFilter !== 'All' && a.priority !== priorityFilter) return false;
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
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
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, priority: 'Critical' } : a));
  };

  const handleAcknowledge = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'In Progress' } : a));
  };

  const handleResolve = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
  };

  const handleSendBroadcast = () => {
    if (!alertTitle.trim()) return;
    setBroadcastOpen(false);
    setBroadcastSentMsg(`Broadcast sent to all staff: "${alertTitle.trim()}"`);
    setAlertTitle('');
    setTimeout(() => setBroadcastSentMsg(''), 4000);
  };

  return (
    <div className="p-6 min-h-screen">
      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-[20px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5 flex gap-4 items-start">
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#edf7ed] flex items-center justify-center shrink-0 mt-1">
            <NotificationsIcon className="text-[#2e7d32]" sx={{ fontSize: 26 }} />
          </div>
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-start w-full mb-1.5">
              <span className="text-[#64748b] font-bold text-[12px] uppercase leading-tight">Active Alerts</span>
              <span className="bg-[#edf7ed] text-[#2e7d32] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 mt-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse"></span>Live
              </span>
            </div>
            <span className="text-[36px] font-black text-[#0f172a] leading-none mb-1.5 tracking-tight">{activeCount}</span>
            <span className="text-[12px] text-[#94a3b8] font-medium leading-tight pr-4">Requires operational staff attention</span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5 flex gap-4 items-start">
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#fef2f2] flex items-center justify-center shrink-0 mt-1">
            <WarningIcon className="text-[#ef4444]" sx={{ fontSize: 26 }} />
          </div>
          <div className="flex flex-col w-full">
            <span className="text-[#64748b] font-bold text-[12px] uppercase leading-tight mb-1.5">Critical & Urgent</span>
            <span className="text-[36px] font-black text-[#0f172a] leading-none mb-1.5 tracking-tight">{criticalCount}</span>
            <span className="text-[12px] text-[#94a3b8] font-medium leading-tight pr-4">High escalation threshold</span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5 flex gap-4 items-start">
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#fff7ed] flex items-center justify-center shrink-0 mt-1">
            <PendingActionsIcon className="text-[#f97316]" sx={{ fontSize: 26 }} />
          </div>
          <div className="flex flex-col w-full">
            <span className="text-[#64748b] font-bold text-[12px] uppercase leading-tight mb-1.5">In Progress</span>
            <span className="text-[36px] font-black text-[#0f172a] leading-none mb-1.5 tracking-tight">{inProgressCount}</span>
            <span className="text-[12px] text-[#94a3b8] font-medium leading-tight pr-4">Staff actively attending</span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5 flex gap-4 items-start">
          <div className="w-[52px] h-[52px] rounded-[16px] bg-[#ecfdf5] flex items-center justify-center shrink-0 mt-1">
            <TaskAltIcon className="text-[#10b981]" sx={{ fontSize: 26 }} />
          </div>
          <div className="flex flex-col w-full">
            <span className="text-[#64748b] font-bold text-[12px] uppercase leading-tight mb-1.5">Resolved Today</span>
            <span className="text-[36px] font-black text-[#0f172a] leading-none mb-1.5 tracking-tight">{resolvedCount}</span>
            <span className="text-[12px] text-[#94a3b8] font-medium leading-tight pr-4">Avg. time: 32 mins</span>
          </div>
        </div>
      </div>

      {/* OPERATIONS ALERTS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full overflow-visible">
        {/* Table Top Controls matching Dashboard table header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Operational Alerts List
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar matching Dashboard.jsx */}
            <div className="relative w-28 md:w-40 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Segmented Filter Control matching Dashboard.jsx */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {['All', 'Critical', 'In Progress', 'Resolved'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10 font-bold' 
                      : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CSV Export Button matching Dashboard.jsx */}
            <button 
              onClick={handleExportCSV}
              className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <FileDownload sx={{ fontSize: 14 }} className="text-white" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>
            
            <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-xs transition-all flex items-center cursor-pointer shrink-0">
              Mark All Read
            </button>
            
            <button className="bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center cursor-pointer shrink-0">
              <AddAlert sx={{ fontSize: 14 }} className="mr-1" />New Alert
            </button>
          </div>
        </div>

        {/* Table Content with Compact Gaps & No Horizontal Scroll Needed on standard screens */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-2 px-2.5 text-[11px] font-bold text-gray-700 whitespace-nowrap">Alert ID</th>
                <th className="py-2 px-2.5 text-[11px] font-bold text-gray-700">Issue / Subject</th>
                <th className="py-2 px-2 text-[11px] font-bold text-gray-700 whitespace-nowrap">Department</th>
                <th className="py-2 px-2 text-[11px] font-bold text-gray-700 whitespace-nowrap">Location</th>
                <th className="py-2 px-2 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Priority</th>
                <th className="py-2 px-2 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Status</th>
                <th className="py-2 px-2 text-[11px] font-bold text-gray-700 whitespace-nowrap">Assigned To</th>
                <th className="py-2 px-2 text-[11px] font-bold text-gray-700 whitespace-nowrap">Logged</th>
                <th className="py-2 px-1 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((alert, index) => (
                  <tr key={alert.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {/* Alert ID */}
                    <td className="py-2 px-2.5 text-[11px] text-gray-800 font-bold whitespace-nowrap align-top">
                      {alert.id}
                    </td>

                    {/* Issue / Description - 2 lines clamp & reduced width */}
                    <td className="py-2 px-2.5 align-top max-w-[220px]">
                      <div>
                        <p className="text-[11.5px] font-bold text-gray-900 leading-snug truncate">
                          {alert.title}
                        </p>
                        <p 
                          className="text-[10px] text-gray-400 mt-0.5 leading-snug line-clamp-2 max-w-[210px] break-words" 
                          title={alert.description}
                        >
                          {alert.description}
                        </p>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-2 px-2 text-[11px] font-medium text-gray-600 whitespace-nowrap align-top">
                      {alert.category}
                    </td>

                    {/* Location */}
                    <td className="py-2 px-2 whitespace-nowrap align-top">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-[11px] leading-tight">{alert.room}</span>
                        <span className="text-gray-400 text-[9.5px] leading-tight mt-0.5">{alert.roomType}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-2 px-2 whitespace-nowrap align-top text-center">
                      <span className={`inline-block px-1.5 py-0.5 text-[9.5px] font-bold rounded ${
                        alert.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        alert.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        alert.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {alert.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-2 whitespace-nowrap align-top text-center">
                      <span className={`inline-block px-1.5 py-0.5 text-[9.5px] font-bold rounded ${
                        alert.status === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                        alert.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-[#e2f8e9] text-[#1b7f43] border border-[#1b7f43]/20'
                      }`}>
                        {alert.status}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="py-2 px-2 text-[11px] font-medium text-gray-700 whitespace-nowrap align-top">
                      {alert.assignedTo}
                    </td>

                    {/* Logged */}
                    <td className="py-2 px-2 text-[10.5px] text-gray-400 font-medium whitespace-nowrap align-top">
                      {alert.time}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-1 text-center relative whitespace-nowrap align-top">
                      <button 
                        onClick={() => setActionMenuOpen(actionMenuOpen === index ? null : index)} 
                        className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded-full hover:bg-gray-100 cursor-pointer"
                      >
                        <MoreHoriz fontSize="small" />
                      </button>
                      
                      {actionMenuOpen === index && (
                        <div className="absolute right-4 top-2 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 rounded-xl w-32 z-50 py-1 flex flex-col overflow-hidden animate-fade-in text-left">
                          <button 
                            onClick={() => setActionMenuOpen(null)}
                            className="flex items-center px-2.5 py-1.5 text-[11px] font-medium text-[#1b7f43] hover:bg-gray-50 cursor-pointer"
                          >
                            <CheckCircle className="mr-1.5 text-[#1b7f43]" sx={{ fontSize: 14 }} /> Resolve
                          </button>
                          <button 
                            onClick={() => setActionMenuOpen(null)}
                            className="flex items-center px-2.5 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Person className="mr-1.5 text-gray-500" sx={{ fontSize: 14 }} /> Reassign
                          </button>
                          <button 
                            onClick={() => setActionMenuOpen(null)}
                            className="flex items-center px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Edit className="mr-1.5 text-red-500" sx={{ fontSize: 14 }} /> Edit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500 text-[12px]">
                    No operations alerts found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - 10 per page */}
        {totalPages > 0 && (
          <div className="p-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[12px] text-gray-500">
              Showing <span className="font-semibold text-gray-700">{indexOfFirstRow + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(indexOfLastRow, filteredAlerts.length)}</span> of <span className="font-semibold text-gray-700">{filteredAlerts.length}</span> alerts
            </span>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft fontSize="small" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-6 h-6 rounded-md text-[12px] font-medium flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === i + 1 
                      ? 'bg-[#1b7f43] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight fontSize="small" />
              </button>
            </div>
          </div>
        )}

      {/* DEPARTMENT OPERATIONS LOAD */}
      <div className="bg-white rounded-[24px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-7 mb-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <HubIcon sx={{ fontSize: 28 }} className="text-[#2e7d32]" />
            <h2 className="text-[20px] font-black text-[#0f172a]">Department Operations Load</h2>
          </div>
          <span className="text-[#64748b] font-medium text-[13px]">Click a department to filter active tickets</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {departmentLoad.map(({ dept, active }) => {
            const theme = DEPARTMENTS[dept];
            const Icon = theme.icon;
            const isActive = deptFilter === dept;
            return (
              <button
                key={dept}
                onClick={() => setDeptFilter(isActive ? 'All' : dept)}
                className={`text-left border rounded-[16px] p-4 flex flex-col gap-3 transition-all cursor-pointer ${
                  isActive ? 'border-[#2e7d32] ring-1 ring-[#2e7d32]/30 bg-[#f5f6ff]' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: theme.bg }}>
                    <Icon sx={{ fontSize: 20 }} style={{ color: theme.color }} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[#0f172a] font-black text-[14px] leading-tight truncate">{dept}</span>
                    <span className="text-[#64748b] font-medium text-[12px]">{active} active</span>
                  </div>
                </div>
                <div className="w-full bg-[#f1f5f9] rounded-full h-[6px] mt-1">
                  <div
                    className="h-[6px] rounded-full transition-all"
                    style={{ width: `${Math.round((active / maxLoad) * 100)}%`, backgroundColor: active > 0 ? theme.color : '#e2e8f0' }}
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
          <SearchIcon sx={{ fontSize: 18 }} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by task, room, guest, or staff..."
            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] transition-shadow"
          />
        </div>
        <span className="text-[#2e7d32] bg-[#edf7ed] text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap">
          {filteredAlerts.length} matching alert{filteredAlerts.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setBroadcastOpen(true)}
          className="flex items-center gap-1.5 bg-[#2e7d32] hover:brightness-110 text-white px-4 py-2.5 rounded-xl text-[12.5px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
        >
          <CampaignIcon sx={{ fontSize: 16 }} /> Broadcast Alert
        </button>
      </div>

      {broadcastSentMsg && (
        <p className="text-[12px] font-semibold text-[#10b981] flex items-center gap-1.5 mb-3">
          <CheckCircleIcon sx={{ fontSize: 14 }} /> {broadcastSentMsg}
        </p>
      )}

      {/* FILTER CHIPS + DROPDOWNS */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDeptFilter('All')}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer ${
              deptFilter === 'All' ? 'bg-[#2e7d32] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {Object.keys(DEPARTMENTS).map(dept => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer ${
                deptFilter === dept ? 'bg-[#2e7d32] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9.5px] font-bold text-gray-400 uppercase pl-1">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white focus:outline-none focus:border-[#2e7d32] cursor-pointer"
            >
              {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[9.5px] font-bold text-gray-400 uppercase pl-1">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white focus:outline-none focus:border-[#2e7d32] cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 mt-3.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
          >
            <RestartAltIcon sx={{ fontSize: 14 }} /> Reset
          </button>
        </div>
      </div>

      {/* ALERTS LIST */}
      <div className="flex flex-col gap-4">
        {filteredAlerts.map(alert => {
          const theme = DEPARTMENTS[alert.department];
          const Icon = theme.icon;
          const isResolved = alert.status === 'Resolved';

          return (
            <div key={alert.id} className="bg-white rounded-[18px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-5">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center shrink-0" style={{ backgroundColor: theme.bg }}>
                    <Icon sx={{ fontSize: 20 }} style={{ color: theme.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-[14.5px] font-black text-[#0f172a] leading-tight">{alert.title}</h3>
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">{alert.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[alert.priority]}`}>{alert.priority}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[alert.status]}`}>{alert.status}</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><ScheduleIcon sx={{ fontSize: 13 }} className="text-gray-400" />{alert.time}</span>
                      <span className="flex items-center gap-1"><RoomIcon sx={{ fontSize: 13 }} className="text-gray-400" />{alert.location}</span>
                      <span className="flex items-center gap-1"><PersonIcon sx={{ fontSize: 13 }} className="text-gray-400" />{alert.guest}</span>
                      <span className="flex items-center gap-1"><ForumIcon sx={{ fontSize: 13 }} className="text-gray-400" />By {alert.reportedBy} ({alert.reportedAgo})</span>
                    </div>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#2e7d32] border border-[#c7d2fe] bg-[#edf7ed] px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                  <BadgeIcon sx={{ fontSize: 13 }} />{alert.assignedTo}
                </span>
              </div>

              {/* Description */}
              <p className="text-[12.5px] text-gray-500 leading-relaxed mb-3">{alert.description}</p>

              {/* Action Required box */}
              <div className="bg-[#edf7ed] border border-[#e0e7ff] rounded-xl px-3.5 py-2.5 mb-3 flex items-start gap-2">
                <FlagIcon sx={{ fontSize: 15 }} className="text-[#2e7d32] mt-0.5 shrink-0" />
                <p className="text-[12px] text-[#4338ca] leading-snug">
                  <span className="font-bold">Action Required:</span> {alert.action}
                </p>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between gap-3">
                {isResolved ? (
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-[#10b981]">
                    <CheckCircleIcon sx={{ fontSize: 15 }} /> Resolved
                  </span>
                ) : alert.priority !== 'Critical' ? (
                  <button
                    onClick={() => handleEscalate(alert.id)}
                    className="flex items-center gap-1 text-[11.5px] font-bold text-[#ef4444] hover:underline cursor-pointer"
                  >
                    <ReportProblemIcon sx={{ fontSize: 14 }} /> Escalate Urgency
                  </button>
                ) : <span />}

                {!isResolved && (
                  <div className="flex items-center gap-2">
                    {alert.status !== 'In Progress' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="flex items-center gap-1.5 bg-[#2e7d32] hover:brightness-110 text-white px-3.5 py-1.5 rounded-lg text-[11.5px] font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <HandshakeIcon sx={{ fontSize: 14 }} /> Acknowledge &amp; Amend
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="flex items-center gap-1.5 bg-[#10b981] hover:brightness-110 text-white px-3.5 py-1.5 rounded-lg text-[11.5px] font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <TaskAltIcon sx={{ fontSize: 14 }} /> Mark Resolved
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
                  <NotificationsIcon className="text-white" sx={{ fontSize: 24 }} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white text-[18px] font-bold leading-tight mb-1">Dispatch Operations Alert</h2>
                  <p className="text-green-100 text-[12px] font-medium leading-tight">Broadcast critical task to hotel operational staff</p>
                </div>
              </div>
              <button onClick={() => setBroadcastOpen(false)} className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                <CloseIcon sx={{ fontSize: 20 }} />
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
                    InputProps={{ startAdornment: <InputAdornment position="start"><CampaignIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                  />
                </div>
                <div className="hidden md:block"></div>

                {/* Row 2 */}
                <FormControl fullWidth size="small">
                  <InputLabel>Department / Category*</InputLabel>
                  <Select label="Department / Category*" value={alertDept} onChange={(e) => setAlertDept(e.target.value)}>
                    <MenuItem value="VIP Arrival">VIP Arrival</MenuItem>
                    <MenuItem value="Housekeeping">Housekeeping</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                    <MenuItem value="Security">Security</MenuItem>
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
                  InputProps={{ startAdornment: <InputAdornment position="start"><RoomIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                />
                <TextField 
                  fullWidth label="Guest Name (Optional)" variant="outlined" size="small"
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                />

                {/* Row 4 */}
                <div className="col-span-1">
                  <TextField 
                    fullWidth label="Assign To Staff / Team (...)" variant="outlined" size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
                  />
                </div>
                <div className="hidden md:block"></div>

                {/* Row 5 */}
                <div className="col-span-1">
                  <TextField 
                    fullWidth label="Specific Action Required*" variant="outlined" size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><TaskAltIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
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
                <SendIcon sx={{ fontSize: 16 }} />
                Broadcast Alert
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}