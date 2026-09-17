import React, { useState } from 'react';
import Login from '@mui/icons-material/Login';
import Logout from '@mui/icons-material/Logout';
import Search from '@mui/icons-material/Search';
import FileDownload from '@mui/icons-material/FileDownload';
import Phone from '@mui/icons-material/Phone';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import Bed from '@mui/icons-material/Bed';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Schedule from '@mui/icons-material/Schedule';
import Key from '@mui/icons-material/Key';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import HourglassEmpty from '@mui/icons-material/HourglassEmpty';

export default function CheckInOut() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Dataset with realistic Front Office status: Check In, Check Out, Pending, Reserved
  const [checkInData, setCheckInData] = useState([
    {
      room: '101',
      guest: 'Kamran Akmal',
      checkInTime: '10/08/2023 09:00 AM',
      checkOutTime: '10/12/2023 12:00 PM',
      mobile: '0311 1122334',
      keyCard: 'Issued',
      status: 'Check In',
      balance: '$0.00'
    },
    {
      room: '102',
      guest: 'Cara Stevens',
      checkInTime: '10/01/2023 10:15 AM',
      checkOutTime: '10/05/2023 11:00 AM',
      mobile: '0300 1234567',
      keyCard: 'Returned',
      status: 'Check Out',
      balance: '$0.00'
    },
    {
      room: '105',
      guest: 'Airi Satou',
      checkInTime: '10/02/2023 02:00 PM',
      checkOutTime: '10/06/2023 11:30 AM',
      mobile: '0333 9876543',
      keyCard: 'Pending',
      status: 'Pending',
      balance: '$180.00'
    },
    {
      room: '201',
      guest: 'Mahira Khan',
      checkInTime: '10/09/2023 11:00 AM',
      checkOutTime: '10/10/2023 12:00 PM',
      mobile: '0321 6655443',
      keyCard: 'Returned',
      status: 'Check Out',
      balance: '$0.00'
    },
    {
      room: '302',
      guest: 'Jens Brincker',
      checkInTime: '10/03/2023 01:30 PM',
      checkOutTime: '10/07/2023 10:00 AM',
      mobile: '0312 5551234',
      keyCard: 'Issued',
      status: 'Check In',
      balance: '$0.00'
    },
    {
      room: '408',
      guest: 'Angelica Ramos',
      checkInTime: '10/04/2023 12:00 PM',
      checkOutTime: '10/08/2023 02:00 PM',
      mobile: '0345 4449876',
      keyCard: 'Pending',
      status: 'Reserved',
      balance: '$45.00'
    },
    {
      room: '501',
      guest: 'Dr. Ayesha Malik',
      checkInTime: '10/10/2023 03:00 PM',
      checkOutTime: '10/14/2023 12:00 PM',
      mobile: '0321 7766554',
      keyCard: 'Pending',
      status: 'Pending',
      balance: '$320.00'
    },
    {
      room: '507',
      guest: 'Tariq Mehmood',
      checkInTime: '10/05/2023 09:30 AM',
      checkOutTime: '10/09/2023 11:00 AM',
      mobile: '0303 5544332',
      keyCard: 'Issued',
      status: 'Check In',
      balance: '$0.00'
    },
    {
      room: '602',
      guest: 'David Miller',
      checkInTime: '10/06/2023 10:00 AM',
      checkOutTime: '10/11/2023 12:00 PM',
      mobile: '+44 7911 123456',
      keyCard: 'Pending',
      status: 'Reserved',
      balance: '$550.00'
    },
    {
      room: '604',
      guest: 'Hamza Zubair',
      checkInTime: '10/07/2023 08:30 AM',
      checkOutTime: '10/07/2023 06:00 PM',
      mobile: '0300 9988776',
      keyCard: 'Returned',
      status: 'Check Out',
      balance: '$0.00'
    },
    {
      room: '701',
      guest: 'Sana Javed',
      checkInTime: '10/11/2023 02:00 PM',
      checkOutTime: '10/15/2023 12:00 PM',
      mobile: '0344 1122998',
      keyCard: 'Pending',
      status: 'Reserved',
      balance: '$420.00'
    },
    {
      room: '705',
      guest: 'Farhan Ali',
      checkInTime: '10/08/2023 04:00 PM',
      checkOutTime: '10/12/2023 11:00 AM',
      mobile: '0315 3344556',
      keyCard: 'Issued',
      status: 'Check In',
      balance: '$0.00'
    }
  ]);

  // Action handlers
  const handleStatusChange = (index, newStatus) => {
    const updated = [...checkInData];
    updated[index].status = newStatus;
    if (newStatus === 'Check In') updated[index].keyCard = 'Issued';
    if (newStatus === 'Check Out') updated[index].keyCard = 'Returned';
    setCheckInData(updated);
    setActionMenuOpen(null);
  };

  const handleDelete = (index) => {
    const updated = checkInData.filter((_, i) => i !== index);
    setCheckInData(updated);
    setActionMenuOpen(null);
  };

  // Filter logic
  const filteredData = checkInData.filter(item => {
    const matchesSearch = item.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.mobile.includes(searchQuery);
    const matchesTab = activeTab === 'All' ? true : item.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const indexOfLastRow = indexOfFirstRow + rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Check In':
        return 'bg-[#e2f8e9] text-[#1b7f43] border border-[#1b7f43]/20';
      case 'Check Out':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Reserved':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleExportCSV = () => {
    const headers = ["Room No", "Guest Name", "Mobile", "Check In Time", "Check Out Time", "Key Status", "Status", "Balance"];
    const rows = filteredData.map(r => [r.room, `"${r.guest}"`, `"${r.mobile}"`, `"${r.checkInTime}"`, `"${r.checkOutTime}"`, r.keyCard, r.status, r.balance]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `checkin_checkout_${activeTab.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in pb-8 space-y-4">
      {/* Spacer to replace missing header and maintain consistent gap from breadcrumbs */}
      <div className="h-2"></div>

      {/* Small Compact Cards matching Dashboard.jsx */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {/* Card 1: Check In */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Check In</span>
            <Login className="text-emerald-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">
              {checkInData.filter(c => c.status === 'Check In').length}
            </span>
            <span className="text-[10px] text-[#1b7f43] font-medium truncate ml-1">In House</span>
          </div>
        </div>

        {/* Card 2: Check Out */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Check Out</span>
            <Logout className="text-purple-600 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-gray-900">
              {checkInData.filter(c => c.status === 'Check Out').length}
            </span>
            <span className="text-[10px] text-purple-600 font-medium truncate ml-1">Cleared</span>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Pending</span>
            <HourglassEmpty className="text-amber-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-amber-600">
              {checkInData.filter(c => c.status === 'Pending').length}
            </span>
            <span className="text-[10px] text-gray-400 truncate ml-1">Awaiting key</span>
          </div>
        </div>

        {/* Card 4: Reserved */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Reserved</span>
            <BookmarkBorder className="text-blue-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-blue-600">
              {checkInData.filter(c => c.status === 'Reserved').length}
            </span>
            <span className="text-[10px] text-gray-400 truncate ml-1">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full overflow-visible">
        {/* Table Top Controls matching Dashboard table header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Guest Check-In / Check-Out
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar matching Dashboard.jsx */}
            <div className="relative w-28 md:w-40 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
              />
            </div>

            {/* Segmented Filter Control matching Dashboard.jsx */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {['All', 'Check In', 'Check Out', 'Pending', 'Reserved'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
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
              className="flex items-center space-x-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <FileDownload sx={{ fontSize: 14 }} className="text-gray-500" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>

            <button className="bg-[var(--primary-main)] hover:brightness-110 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all flex items-center cursor-pointer shrink-0">
              + Express Check-In
            </button>
          </div>
        </div>

        {/* Table Content without horizontal side-scrolling */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Room No</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Guest Name</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Mobile</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Check In Time</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap">Check Out Time</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Key Card</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Status</th>
                <th className="py-2.5 px-2 text-[11px] font-bold text-gray-700 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((row, index) => {
                  const globalIdx = indexOfFirstRow + index;
                  return (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Room */}
                      <td className="py-2.5 px-3 font-bold text-[12px] text-gray-800 whitespace-nowrap">
                        {row.room}
                      </td>

                      {/* Guest */}
                      <td className="py-2.5 px-3 font-semibold text-[12px] text-gray-900 whitespace-nowrap">
                        {row.guest}
                      </td>

                      {/* Mobile */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center text-[11px] text-gray-600 font-medium">
                          <Phone className="text-[#1b7f43] mr-1" sx={{ fontSize: 12 }} />
                          {row.mobile}
                        </div>
                      </td>

                      {/* Check-in Time */}
                      <td className="py-2.5 px-3 text-[11px] text-gray-600 whitespace-nowrap">
                        {row.checkInTime}
                      </td>

                      {/* Check-out Time */}
                      <td className="py-2.5 px-3 text-[11px] text-gray-600 whitespace-nowrap">
                        {row.checkOutTime}
                      </td>

                      {/* Key Card Status */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          row.keyCard === 'Issued' ? 'bg-green-50 text-green-700 border border-green-200' :
                          row.keyCard === 'Returned' ? 'bg-gray-100 text-gray-600' : 
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {row.keyCard}
                        </span>
                      </td>

                      {/* Status: Check In, Check Out, Pending, Reserved */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${getStatusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>

                      {/* Actions with Popup: Check In, Check Out, Edit, Delete */}
                      <td className="py-2.5 px-2 text-center relative whitespace-nowrap">
                        <button 
                          onClick={() => setActionMenuOpen(actionMenuOpen === globalIdx ? null : globalIdx)} 
                          className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                        >
                          <MoreHoriz fontSize="small" />
                        </button>

                        {actionMenuOpen === globalIdx && (
                          <div className="absolute right-4 top-2 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 rounded-xl w-36 z-50 py-1 flex flex-col overflow-hidden animate-fade-in text-left">
                            {/* Check In Action */}
                            <button 
                              onClick={() => handleStatusChange(globalIdx, 'Check In')}
                              className="flex items-center px-3 py-1.5 text-[11px] font-medium text-[#1b7f43] hover:bg-gray-50 cursor-pointer"
                            >
                              <Login className="mr-2 text-[#1b7f43]" sx={{ fontSize: 14 }} /> Check In
                            </button>

                            {/* Check Out Action */}
                            <button 
                              onClick={() => handleStatusChange(globalIdx, 'Check Out')}
                              className="flex items-center px-3 py-1.5 text-[11px] font-medium text-purple-600 hover:bg-gray-50 cursor-pointer"
                            >
                              <Logout className="mr-2 text-purple-600" sx={{ fontSize: 14 }} /> Check Out
                            </button>

                            {/* Edit Action */}
                            <button 
                              onClick={() => {
                                alert(`Edit details for guest: ${row.guest} (Room ${row.room})`);
                                setActionMenuOpen(null);
                              }}
                              className="flex items-center px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Edit className="mr-2 text-gray-500" sx={{ fontSize: 14 }} /> Edit
                            </button>

                            {/* Delete Action */}
                            <button 
                              onClick={() => handleDelete(globalIdx)}
                              className="flex items-center px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Delete className="mr-2 text-red-500" sx={{ fontSize: 14 }} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 text-[12px]">
                    No check-in/out records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="p-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[12px] text-gray-500">
              Showing <span className="font-semibold text-gray-700">{indexOfFirstRow + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(indexOfLastRow, filteredData.length)}</span> of <span className="font-semibold text-gray-700">{filteredData.length}</span> records
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
                    currentPage === i + 1 ? 'bg-[#1b7f43] text-white' : 'text-gray-600 hover:bg-gray-100'
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
