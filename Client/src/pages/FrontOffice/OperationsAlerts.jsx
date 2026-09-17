import React, { useState } from 'react';
import Notifications from '@mui/icons-material/Notifications';
import Warning from '@mui/icons-material/Warning';
import Schedule from '@mui/icons-material/Schedule';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Search from '@mui/icons-material/Search';
import FileDownload from '@mui/icons-material/FileDownload';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import AddAlert from '@mui/icons-material/AddAlert';
import Person from '@mui/icons-material/Person';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';

export default function OperationsAlerts() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Alerts dummy data (expanded for 10 rows per page pagination)
  const alertsData = [
    {
      id: 'ALT-1042',
      title: 'AC Compressor Failure',
      category: 'Maintenance',
      room: 'Room 312',
      roomType: 'Executive King',
      priority: 'Critical',
      status: 'Critical',
      time: '12m ago',
      assignedTo: 'Kashif Raza',
      description: 'Air conditioner stopped cooling, guest reported unusual sound from unit.'
    },
    {
      id: 'ALT-1041',
      title: 'Urgent Room Deep Clean',
      category: 'Housekeeping',
      room: 'Room 105',
      roomType: 'Deluxe Suite',
      priority: 'High',
      status: 'In Progress',
      time: '28m ago',
      assignedTo: 'Rabia Basri',
      description: 'Early VIP arrival in 45 mins. Turn-down and deep sanitation required.'
    },
    {
      id: 'ALT-1040',
      title: 'Keycard Reader Battery Low',
      category: 'Front Desk',
      room: 'Room 507',
      roomType: 'Presidential Suite',
      priority: 'High',
      status: 'In Progress',
      time: '45m ago',
      assignedTo: 'Tariq Mehmood',
      description: 'Door lock blinking red battery warning when tapping card.'
    },
    {
      id: 'ALT-1039',
      title: 'Extra Towels & Iron Box',
      category: 'Room Service',
      room: 'Room 201',
      roomType: 'Luxury King',
      priority: 'Medium',
      status: 'In Progress',
      time: '1h ago',
      assignedTo: 'Farhan Ali',
      description: 'Guest requested iron board and 2 extra bath sheets.'
    },
    {
      id: 'ALT-1038',
      title: 'Bathroom Plumbing Clog',
      category: 'Maintenance',
      room: 'Room 408',
      roomType: 'Standard Twin',
      priority: 'High',
      status: 'Critical',
      time: '1h 15m ago',
      assignedTo: 'Zubair Tariq',
      description: 'Slow drainage in wash basin; technician on way.'
    },
    {
      id: 'ALT-1037',
      title: 'Mini-Bar Restock Verified',
      category: 'F&B Service',
      room: 'Room 102',
      roomType: 'Deluxe Suite',
      priority: 'Low',
      status: 'Resolved',
      time: '2h ago',
      assignedTo: 'Sana Javed',
      description: 'Snacks and beverages replenished after morning check.'
    },
    {
      id: 'ALT-1036',
      title: 'Wi-Fi Router Reset',
      category: 'IT Support',
      room: 'Floor 3 East',
      roomType: 'Corridor AP',
      priority: 'Medium',
      status: 'Resolved',
      time: '3h ago',
      assignedTo: 'Mohsin Naqvi',
      description: 'Access point rebooted, signal restored to 100% capacity.'
    },
    {
      id: 'ALT-1035',
      title: 'Safe Box Lock Error',
      category: 'Front Desk',
      room: 'Room 214',
      roomType: 'Deluxe Twin',
      priority: 'High',
      status: 'In Progress',
      time: '3h 20m ago',
      assignedTo: 'Hamza Malik',
      description: 'Guest locked personal passcodes, master key override dispatched.'
    },
    {
      id: 'ALT-1034',
      title: 'Balcony Door Latch Loose',
      category: 'Maintenance',
      room: 'Room 318',
      roomType: 'Executive King',
      priority: 'Medium',
      status: 'In Progress',
      time: '4h ago',
      assignedTo: 'Kashif Raza',
      description: 'Sliding balcony lock requires screw tightening.'
    },
    {
      id: 'ALT-1033',
      title: 'TV Cable HDMI Signal Lost',
      category: 'IT Support',
      room: 'Room 110',
      roomType: 'Standard King',
      priority: 'Low',
      status: 'Resolved',
      time: '5h ago',
      assignedTo: 'Mohsin Naqvi',
      description: 'Cable replaced with new shielded gold-plated cord.'
    },
    {
      id: 'ALT-1032',
      title: 'Water Heater Inspection',
      category: 'Maintenance',
      room: 'Floor 4 Boiler',
      roomType: 'Utility Zone',
      priority: 'High',
      status: 'Critical',
      time: '6h ago',
      assignedTo: 'Zubair Tariq',
      description: 'Routine water pressure safety test flagged valve pressure.'
    },
    {
      id: 'ALT-1031',
      title: 'Laundry Delivery Delayed',
      category: 'Housekeeping',
      room: 'Room 502',
      roomType: 'Presidential Suite',
      priority: 'Medium',
      status: 'Resolved',
      time: '7h ago',
      assignedTo: 'Rabia Basri',
      description: 'Express dry cleaning delivered and bill added to room folio.'
    }
  ];

  // Filtering
  const filteredAlerts = alertsData.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          alert.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' ? true : 
                       activeTab === 'Critical' ? alert.priority === 'Critical' || alert.status === 'Critical' :
                       activeTab === 'In Progress' ? alert.status === 'In Progress' :
                       activeTab === 'Resolved' ? alert.status === 'Resolved' : true;
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredAlerts.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAlerts.slice(indexOfFirstRow, indexOfLastRow);

  const handleExportCSV = () => {
    const headers = ["Alert ID", "Title", "Category", "Location", "Room Type", "Priority", "Status", "Assigned To", "Time Logged"];
    const rows = filteredAlerts.map(a => [a.id, `"${a.title}"`, a.category, `"${a.room}"`, `"${a.roomType}"`, a.priority, a.status, `"${a.assignedTo}"`, a.time]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `operations_alerts_${activeTab.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in pb-8 space-y-4">
      {/* Spacer to replace missing header and maintain consistent gap from breadcrumbs */}
      <div className="h-2"></div>

      {/* 4 CARDS (COMPACT STYLE MATCHING DASHBOARD.JSX) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {/* Card 1: Active Alerts */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Active Alerts</span>
            <div className="flex items-center space-x-1 shrink-0">
              <span className="inline-flex items-center gap-0.5 bg-[#ede9fe] text-[#6d28d9] text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                <span className="w-1 h-1 rounded-full bg-[#6d28d9] animate-pulse"></span>
                Live
              </span>
              <Notifications className="text-purple-600" sx={{ fontSize: 16 }} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">5</span>
            <span className="text-[10px] text-gray-400 truncate ml-1">Staff attention</span>
          </div>
        </div>

        {/* Card 2: Critical & Urgent */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Critical & Urgent</span>
            <Warning className="text-red-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-red-600">1</span>
            <span className="text-[10px] text-red-400 font-medium truncate ml-1">High escalation</span>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">In Progress</span>
            <Schedule className="text-amber-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-amber-600">3</span>
            <span className="text-[10px] text-gray-400 truncate ml-1">Attending now</span>
          </div>
        </div>

        {/* Card 4: Resolved Today */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Resolved Today</span>
            <CheckCircle className="text-emerald-600 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">2</span>
            <span className="text-[10px] text-[#1b7f43] font-medium truncate ml-1">Avg 32m</span>
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
      </div>
    </div>
  );
}

