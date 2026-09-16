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
