import React, { useState } from 'react';
import {
  ReportProblem, CheckCircle, PendingActions, 
  Search, FileDownload, MoreHoriz, Add,
  SentimentVeryDissatisfied, Room, Person, Phone,
  ChevronLeft, ChevronRight, AccessTime, Edit, Delete
} from '@mui/icons-material';

export default function GuestComplaint() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const rowsPerPage = 5;

  // Complaints Dummy Data
  const complaintsData = [
    {
      id: 'CMP-2091',
      guestName: 'Muhammad Salman',
      phone: '+92 301 4455667',
      room: 'Room 408',
      category: 'Noise Disturbance',
      severity: 'High',
      status: 'Open',
      loggedAt: '15 mins ago',
      assignedTo: 'Security / Front Desk',
      description: 'Loud music coming from adjacent suite late night. Needs immediate intervention.',
    },
    {
      id: 'CMP-2090',
      guestName: 'Sarah Jenkins',
      phone: '+1 415 889 2210',
      room: 'Room 214',
      category: 'Plumbing',
      severity: 'Critical',
      status: 'In Progress',
      loggedAt: '40 mins ago',
      assignedTo: 'Kashif Raza (Maintenance)',
      description: 'Hot water not flowing in master bathroom shower.',
    },
    {
      id: 'CMP-2089',
      guestName: 'Ahmed Bilal',
      phone: '+92 333 1239876',
      room: 'Room 102',
      category: 'Housekeeping',
      severity: 'Medium',
      status: 'In Progress',
      loggedAt: '2 hours ago',
      assignedTo: 'Rabia Basri (Housekeeping)',
      description: 'Mini bar restock incomplete and extra pillows not provided as requested.',
    },
    {
      id: 'CMP-2088',
      guestName: 'Dr. Ayesha Malik',
      phone: '+92 321 7766554',
      room: 'Room 501',
      category: 'Billing / WiFi',
      severity: 'Low',
      status: 'Resolved',
      loggedAt: 'Yesterday',
      assignedTo: 'Front Desk Duty Manager',
      description: 'High-speed conference WiFi login voucher code was not working, replaced with VIP pass.',
    },
    {
      id: 'CMP-2087',
      guestName: 'David Miller',
      phone: '+44 7911 123456',
      room: 'Room 315',
      category: 'Air Conditioning',
      severity: 'High',
      status: 'Resolved',
      loggedAt: 'Yesterday',
      assignedTo: 'Maintenance Team',
      description: 'AC remote control battery dead and temperature stuck at 26C. Serviced and resolved.',
    },
  ];

  // Filtering
  const filteredComplaints = complaintsData.filter((item) => {
    const matchesTab = 
      activeTab === 'All' ? true :
      activeTab === 'Open' ? item.status === 'Open' :
      activeTab === 'In Progress' ? item.status === 'In Progress' :
      activeTab === 'Resolved' ? item.status === 'Resolved' : true;

    const matchesSearch = 
      item.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + rowsPerPage);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'High':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      default:
        return 'bg-blue-50 text-blue-600 border border-blue-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-rose-100 text-rose-700';
      case 'In Progress':
        return 'bg-amber-100 text-amber-700';
      case 'Resolved':
        return 'bg-emerald-100 text-[#1b7f43]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-4 animate-fade-in">
      {/* Spacer to replace missing header and maintain consistent gap from breadcrumbs */}
      <div className="h-2"></div>

      {/* 4 CARDS (COMPACT STYLE MATCHING DASHBOARD.JSX) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {/* Total Open Tickets */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Total Open Tickets</span>
            <div className="flex items-center space-x-1 shrink-0">
              <ReportProblem className="text-rose-600" sx={{ fontSize: 16 }} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">4</span>
            <span className="text-[10px] text-rose-600 font-medium truncate ml-1">Requires attention</span>
          </div>
        </div>

        {/* In Progress / Under Review */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Under Investigation</span>
            <PendingActions className="text-amber-600 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">2</span>
            <span className="text-[10px] text-amber-600 font-medium truncate ml-1">Staff assigned</span>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Resolved Today</span>
            <CheckCircle className="text-[#1b7f43] shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">8</span>
            <span className="text-[10px] text-[#1b7f43] font-medium truncate ml-1">Avg 24m</span>
          </div>
        </div>

        {/* Guest Satisfaction Score */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Resolution Rate</span>
            <SentimentVeryDissatisfied className="text-indigo-600 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">92%</span>
            <span className="text-[10px] text-indigo-600 font-medium truncate ml-1">96% target</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full overflow-visible">
        {/* Table Top Controls matching Dashboard table header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Guest Complaints & Incident Log
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar matching Dashboard.jsx */}
            <div className="relative w-28 md:w-40 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
              />
            </div>

            {/* Segmented Filter Control matching Dashboard.jsx */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {['All', 'Open', 'In Progress', 'Resolved'].map(tab => (
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
              className="flex items-center space-x-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <FileDownload sx={{ fontSize: 14 }} className="text-gray-500" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>
            
            <button className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer">
              <Add sx={{ fontSize: 14 }} className="text-white" />
              <span>New Ticket</span>
            </button>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Ticket ID</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Guest & Room</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Issue Category</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Description</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Severity</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Assigned Staff</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700 text-center">Status</th>
                <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedComplaints.length > 0 ? (
                paginatedComplaints.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {/* Ticket ID & Time */}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-[12px] text-gray-900">{item.id}</div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                        <AccessTime sx={{ fontSize: 10 }} />
                        {item.loggedAt}
                      </div>
                    </td>

                    {/* Guest & Room */}
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-[12px] text-gray-900">{item.guestName}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span className="font-medium text-[#1b7f43] bg-emerald-50 px-1.5 py-0.5 rounded">
                          {item.room}
                        </span>
                        <span>{item.phone}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-4 text-[12px] text-gray-800 font-medium">
                      {item.category}
                    </td>

                    {/* Description */}
                    <td className="py-2.5 px-4 max-w-[200px] whitespace-normal">
                      <p className="text-gray-600 text-[11px] line-clamp-2" title={item.description}>
                        {item.description}
                      </p>
                    </td>

                    {/* Severity */}
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-2.5 px-4 text-[12px] text-gray-700 font-medium">
                      {item.assignedTo}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-center relative">
                      <button 
                        onClick={() => setActionMenuOpen(actionMenuOpen === index ? null : index)} 
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <MoreHoriz sx={{ fontSize: 18 }} />
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
                            className="flex items-center px-2.5 py-1.5 text-[11px] font-medium text-amber-600 hover:bg-amber-50 cursor-pointer"
                          >
                            <PendingActions className="mr-1.5 text-amber-600" sx={{ fontSize: 14 }} /> In Progress
                          </button>
                          <button 
                            onClick={() => setActionMenuOpen(null)}
                            className="flex items-center px-2.5 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Edit className="mr-1.5 text-gray-500" sx={{ fontSize: 14 }} /> Edit
                          </button>
                          <button 
                            onClick={() => setActionMenuOpen(null)}
                            className="flex items-center px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Delete className="mr-1.5 text-red-500" sx={{ fontSize: 14 }} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 text-[12px]">
                    No complaints found matching current criteria.
import React, { useState, useRef, useEffect } from 'react';
import {
  Search, FilterList, AddCircleOutlined, Refresh, 
  TableChart, PictureAsPdf, Close,
  PersonOutlined, Hotel, CalendarToday,
  EditOutlined, DeleteOutlined, SubjectOutlined, LocalOfferOutlined, FlagOutlined, NotesOutlined, MeetingRoomOutlined, Person
} from '@mui/icons-material';
import React, { useState } from 'react';
import ReportProblem from '@mui/icons-material/ReportProblem';
import CheckCircle from '@mui/icons-material/CheckCircle';
import PendingActions from '@mui/icons-material/PendingActions';
import Search from '@mui/icons-material/Search';
import FileDownload from '@mui/icons-material/FileDownload';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Add from '@mui/icons-material/Add';
import SentimentVeryDissatisfied from '@mui/icons-material/SentimentVeryDissatisfied';
import Room from '@mui/icons-material/Room';
import Person from '@mui/icons-material/Person';
import Phone from '@mui/icons-material/Phone';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import AccessTime from '@mui/icons-material/AccessTime';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';

const initialComplaints = [
  { id: 1, date: '05/20/2024', guestName: 'John Doe', roomNo: '101', type: 'Plumbing', description: 'Leaking tap ...', priority: 'Medium', status: 'Open' },
  { id: 2, date: '05/19/2024', guestName: 'Jane Smith', roomNo: '205', type: 'Housekeeping', description: 'Towels not r...', priority: 'Low', status: 'Resolved' },
  { id: 3, date: '05/18/2024', guestName: 'Robert Brown', roomNo: '302', type: 'Electrical', description: 'Waitlight not...', priority: 'High', status: 'In Progress' },
  { id: 4, date: '05/21/2024', guestName: 'Emily Johns...', roomNo: '105', type: 'Noise', description: 'Loud noise f...', priority: 'Medium', status: 'Open' },
  { id: 5, date: '05/22/2024', guestName: 'Michael Wils...', roomNo: '210', type: 'Air Conditio...', description: 'AC not cooli...', priority: 'High', status: 'In Progress' },
  { id: 6, date: '05/23/2024', guestName: 'Sarah Miller', roomNo: '315', type: 'Housekeeping', description: 'Room not cl...', priority: 'Medium', status: 'Open' },
  { id: 7, date: '05/24/2024', guestName: 'David Ander...', roomNo: '118', type: 'Plumbing', description: 'Shower drai...', priority: 'High', status: 'Resolved' }
];

const priorityStyles = {
  Low: 'bg-[#cffafe] text-[#06b6d4]',
  Medium: 'bg-[#ffedd5] text-[#f97316]',
  High: 'bg-[#fce7f3] text-[#ec4899]'
};

const statusStyles = {
  Open: 'bg-[#fce7f3] text-[#ec4899]',
  Resolved: 'bg-[#d1fae5] text-[#10b981]',
  'In Progress': 'bg-[#ffedd5] text-[#f97316]'
};

export default function GuestComplaint() {
  const [complaints, setComplaints] = useState(initialComplaints);
  const [search, setSearch] = useState('');
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    Date: true,
    'Guest Name': true,
    'Room No': true,
    'Complaint Type': true,
    Description: true,
    Priority: true,
    Status: true,
    Actions: true
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null);

  const openViewModal = (complaint) => {
    setViewingComplaint(complaint);
    setIsViewModalOpen(true);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const filterMenuRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    guestName: '', roomNo: '', date: new Date().toISOString().split('T')[0], 
    type: 'General', priority: 'Low', status: 'Open', description: ''
  });

  const isFormValid = form.guestName.trim() && form.roomNo.trim() && form.description.trim() && form.date;

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm({ guestName: '', roomNo: '', date: new Date().toISOString().split('T')[0], type: 'General', priority: 'Low', status: 'Open', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (complaint) => {
    setEditingId(complaint.id);
    // Convert MM/DD/YYYY to YYYY-MM-DD for date input
    const [m, d, y] = complaint.date.split('/');
    const formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    
    setForm({
      guestName: complaint.guestName,
      roomNo: complaint.roomNo,
      date: formattedDate,
      type: complaint.type,
      priority: complaint.priority,
      status: complaint.status,
      description: complaint.description
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!isFormValid) return;
    
    const [y, m, d] = form.date.split('-');
    const formattedDate = `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
    
    if (editingId) {
      setComplaints(complaints.map(c => 
        c.id === editingId ? {
          ...c,
          date: formattedDate,
          guestName: form.guestName,
          roomNo: form.roomNo,
          type: form.type,
          priority: form.priority,
          status: form.status,
          description: form.description
        } : c
      ));
    } else {
      const newId = complaints.length ? Math.max(...complaints.map(c => c.id)) + 1 : 1;
      setComplaints([
        {
          id: newId,
          date: formattedDate,
          guestName: form.guestName,
          roomNo: form.roomNo,
          type: form.type,
          priority: form.priority,
          status: form.status,
          description: form.description
        },
        ...complaints
      ]);
    }
    setIsModalOpen(false);
  };

  const handleRefresh = () => {
    setSearch('');
    setComplaints(initialComplaints);
    setVisibleColumns({
      Date: true, 'Guest Name': true, 'Room No': true,
      'Complaint Type': true, Description: true,
      Priority: true, Status: true, Actions: true
    });
  };

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\n';
    
    filteredComplaints.forEach(c => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'Date') val = c.date;
        else if (col === 'Guest Name') val = c.guestName;
        else if (col === 'Room No') val = c.roomNo;
        else if (col === 'Complaint Type') val = c.type;
        else if (col === 'Description') val = c.description;
        else if (col === 'Priority') val = c.priority;
        else if (col === 'Status') val = c.status;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'guest_complaints.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = `
      <html>
        <head>
          <title>Guest Complaints Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
            h2 { color: #0f172a; margin-bottom: 5px; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Guest Complaints Report</h2>
          <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;
    
    filteredComplaints.forEach(c => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
        if (col === 'Date') val = c.date;
        else if (col === 'Guest Name') val = c.guestName;
        else if (col === 'Room No') val = c.roomNo;
        else if (col === 'Complaint Type') val = c.type;
        else if (col === 'Description') val = c.description;
        else if (col === 'Priority') val = c.priority;
        else if (col === 'Status') val = c.status;
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredComplaints = complaints.filter(c => 
    c.guestName.toLowerCase().includes(search.toLowerCase()) || 
    c.roomNo.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 w-full max-w-[1400px] mx-auto animate-fade-in relative min-h-screen">
      
      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible relative">
        
        {/* Header Options */}
        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-gray-100 gap-4 overflow-visible">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <h2 className="text-gray-600 font-semibold text-[17px] whitespace-nowrap">Guest Complaint Management</h2>
            <div className="relative w-full md:w-64 flex-1">
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-400 rounded-md text-[13px] text-gray-700 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer" sx={{ fontSize: 20 }} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <div className="relative" ref={filterMenuRef}>
              <button 
                onClick={() => setShowColumnsMenu(!showColumnsMenu)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                title="Show/Hide Column"
              >
                <FilterList className="text-[var(--primary-main)]" sx={{ fontSize: 20 }} />
              </button>
              
              {showColumnsMenu && (
                <div className="absolute right-0 top-12 mt-1 w-52 bg-[#f8f9fa] shadow-xl border border-gray-200 rounded z-50 overflow-hidden flex flex-col max-h-80">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <span className="text-[13px] font-bold text-gray-800">Show/Hide Column</span>
                  </div>
                  <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${visibleColumns[col] ? 'bg-[#1b7f43] border-[#1b7f43]' : 'bg-white border-gray-300'}`}>
                          {visibleColumns[col] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-[14px] text-gray-700">{col}</span>
                        <input type="checkbox" checked={visibleColumns[col]} onChange={() => toggleColumn(col)} className="hidden" />
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button onClick={openNewModal} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-green-50 transition-colors cursor-pointer">
              <AddCircleOutlined sx={{ fontSize: 24 }} className="text-[#1b7f43]" />
            </button>
            <button onClick={handleRefresh} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
              <Refresh sx={{ fontSize: 24 }} className="text-[var(--primary-main)]" />
            </button>
            <button onClick={handleExportCSV} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
              <TableChart sx={{ fontSize: 22 }} className="text-[#0ea5e9]" />
            </button>
            <button onClick={handleExportPDF} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 22 }} className="text-[#ef4444]" />
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto w-full pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                {visibleColumns['Date'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Date</th>}
                {visibleColumns['Guest Name'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Guest Name</th>}
                {visibleColumns['Room No'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Room No</th>}
                {visibleColumns['Complaint Type'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Complaint Type</th>}
                {visibleColumns['Description'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Description</th>}
                {visibleColumns['Priority'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Priority</th>}
                {visibleColumns['Status'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b]">Status</th>}
                {visibleColumns['Actions'] && <th className="py-5 px-6 text-[13px] font-bold text-[#1e293b] text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(complaint => (
                <tr key={complaint.id} onClick={() => openViewModal(complaint)} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                  {visibleColumns['Date'] && (
                    <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium flex items-center gap-2">
                      <CalendarToday sx={{ fontSize: 16 }} className="text-gray-700" />
                      {complaint.date}
                    </td>
                  )}
                  {visibleColumns['Guest Name'] && <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium">{complaint.guestName}</td>}
                  {visibleColumns['Room No'] && <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium">{complaint.roomNo}</td>}
                  {visibleColumns['Complaint Type'] && <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium">{complaint.type}</td>}
                  {visibleColumns['Description'] && <td className="py-4 px-6 text-[13.5px] text-[#475569] font-medium">{complaint.description}</td>}
                  {visibleColumns['Priority'] && (
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-md text-[12px] font-bold ${priorityStyles[complaint.priority]}`}>
                        {complaint.priority}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Status'] && (
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-md text-[12px] font-bold ${statusStyles[complaint.status]}`}>
                        {complaint.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Actions'] && (
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(complaint); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group">
                          <EditOutlined className="text-[var(--primary-main)] group-hover:text-[var(--primary-main)]" sx={{ fontSize: 20 }} />
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group">
                          <DeleteOutlined className="text-[#f97316] group-hover:text-orange-600" sx={{ fontSize: 20 }} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-8 text-center text-gray-400 text-[14px]">
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold text-gray-800">{filteredComplaints.length > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(startIndex + rowsPerPage, filteredComplaints.length)}
            </span>{' '}
            of <span className="font-semibold text-gray-800">{filteredComplaints.length}</span> tickets
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft sx={{ fontSize: 16 }} />
            </button>
            <span className="font-semibold text-gray-800 px-1">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
      </div>
            {/* View Complaint Modal */}
      {isViewModalOpen && viewingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[var(--primary-main)] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-green-400 flex items-center justify-center text-white shadow-sm">
                  <Person sx={{ fontSize: 24 }} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white text-[20px] font-bold leading-tight">{viewingComplaint.guestName}</h2>
                  <span className="text-white/80 text-[13px]">{viewingComplaint.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewingComplaint); }} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit Complaint"
                >
                  <EditOutlined sx={{ fontSize: 16 }} />
                </button>
                <button 
                  onClick={() => setIsViewModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <Close sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
            
            {/* Body Cards */}
            <div className="p-6 bg-white max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Complaint Type */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <SubjectOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Complaint Type</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingComplaint.type}</span>
                  </div>
                </div>
                
                {/* Room No */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <MeetingRoomOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Room No</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingComplaint.roomNo}</span>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <FlagOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Priority</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${priorityStyles[viewingComplaint.priority]}`}>
                      {viewingComplaint.priority}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <LocalOfferOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Status</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${statusStyles[viewingComplaint.status]}`}>
                      {viewingComplaint.status}
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarToday sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Date</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingComplaint.date}</span>
                  </div>
                </div>

                {/* Description (spans full width) */}
                <div className="col-span-1 md:col-span-2 flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0 mt-1">
                    <NotesOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Description</span>
                    <span className="text-[14px] font-medium text-gray-700 whitespace-pre-wrap">{viewingComplaint.description}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[750px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[17px] font-bold">{editingId ? form.guestName || 'Edit Complaint' : 'New Complaint'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Guest Name */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Guest Name*</label>
                  <input 
                    type="text" 
                    value={form.guestName}
                    onChange={(e) => setForm({...form, guestName: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <PersonOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>
                {/* Room No */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Room No*</label>
                  <input 
                    type="text"
                    value={form.roomNo}
                    onChange={(e) => setForm({...form, roomNo: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <Hotel className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>
                {/* Date */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Date*</label>
                  <input 
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all text-gray-700" 
                  />
                </div>
                {/* Complaint Type */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Complaint Type*</label>
                  <select 
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent"
                  >
                    <option>General</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>Housekeeping</option>
                    <option>Noise</option>
                    <option>Air Conditioning</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {/* Priority */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Priority*</label>
                  <select 
                    value={form.priority}
                    onChange={(e) => setForm({...form, priority: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {/* Status */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Status*</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all appearance-none bg-transparent"
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="relative">
                <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Description*</label>
                <textarea 
                  rows="3" 
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all resize-y"
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 flex gap-3">
              <button 
                onClick={handleSave}
                disabled={!isFormValid}
                className="px-6 py-2 rounded-full text-[13.5px] font-bold shadow-sm transition-colors cursor-pointer border"
                style={isFormValid ? { backgroundColor: '#ffffff', color: '#1b7f43', borderColor: '#e2e8f0' } : { backgroundColor: '#e2e8f0', color: '#94a3b8', borderColor: 'transparent', cursor: 'not-allowed' }}
              >
                Save
              </button>
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}





