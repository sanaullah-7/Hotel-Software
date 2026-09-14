import React, { useState } from 'react';
import { 
  MoreHoriz, Phone, Edit, Delete, Logout, Cancel,
  PersonAdd, Login, AttachMoney, Bed, CreditCard,
  Search, ChevronLeft, ChevronRight, Hotel, FileDownload,
  Notifications, LocalCafe, Build, CleaningServices, Schedule, Warning,
  CheckCircle, BuildCircle
} from '@mui/icons-material';

export default function Dashboard() {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Extended dummy data to demonstrate pagination
  const allBookings = [
    { room: '501', name: 'Ali Khan', checkIn: '10/01/2023', checkOut: '10/05/2023', mobile: '0300 1234567', status: 'Booked' },
    { room: '502', name: 'Fatima Ahmed', checkIn: '10/02/2023', checkOut: '10/06/2023', mobile: '0333 9876543', status: 'Booked' },
    { room: '503', name: 'Ayesha Tariq', checkIn: '10/03/2023', checkOut: '10/07/2023', mobile: '0312 5551234', status: 'CheckOut' },
    { room: '504', name: 'Usman Baloch', checkIn: '10/04/2023', checkOut: '10/08/2023', mobile: '0345 4449876', status: 'Booked' },
    { room: '505', name: 'Zainab Raza', checkIn: '10/05/2023', checkOut: '10/09/2023', mobile: '0301 7776543', status: 'CheckIn' },
    { room: '506', name: 'Bilal Qureshi', checkIn: '10/06/2023', checkOut: '10/10/2023', mobile: '0321 8887654', status: 'Cancelled' },
    { room: '507', name: 'Sana Malik', checkIn: '10/07/2023', checkOut: '10/11/2023', mobile: '0302 3332221', status: 'Booked' },
    { room: '101', name: 'Kamran Akmal', checkIn: '10/08/2023', checkOut: '10/12/2023', mobile: '0311 1122334', status: 'CheckIn' },
    { room: '102', name: 'Hira Mani', checkIn: '10/08/2023', checkOut: '10/15/2023', mobile: '0333 4455667', status: 'Booked' },
    { room: '105', name: 'Fawad Khan', checkIn: '10/09/2023', checkOut: '10/14/2023', mobile: '0300 9988776', status: 'Booked' },
    { room: '201', name: 'Mahira Khan', checkIn: '10/09/2023', checkOut: '10/10/2023', mobile: '0321 6655443', status: 'CheckOut' },
    { room: '205', name: 'Sajal Ali', checkIn: '10/10/2023', checkOut: '10/16/2023', mobile: '0345 1122334', status: 'Booked' },
    { room: '304', name: 'Atif Aslam', checkIn: '10/11/2023', checkOut: '10/12/2023', mobile: '0301 5566778', status: 'CheckIn' },
    { room: '308', name: 'Saba Qamar', checkIn: '10/12/2023', checkOut: '10/15/2023', mobile: '0333 9998887', status: 'Booked' },
  ];

  // Room status summary (replaces the old donut chart with simple data cards)
  const roomStatusData = [
    { label: 'Available', value: 2, icon: CheckCircle, color: 'text-[#4caf50]', bg: 'bg-[#eaf7ee]' },
    { label: 'Occupied', value: 1, icon: Bed, color: 'text-[#42a5f5]', bg: 'bg-[#eaf3fd]' },
    { label: 'Reserved', value: 1, icon: Schedule, color: 'text-[#ffb300]', bg: 'bg-[#fff8e6]' },
    { label: 'Must clean', value: 1, icon: CleaningServices, color: 'text-[#fb8c00]', bg: 'bg-[#fff1e3]' },
    { label: 'Maintenance', value: 1, icon: BuildCircle, color: 'text-[#ef5350]', bg: 'bg-[#fdeceb]' },
  ];
  const totalRooms = roomStatusData.reduce((sum, r) => sum + r.value, 0);

  // Filtering Logic
  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch = booking.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          booking.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter === 'Custom' && customStartDate && customEndDate) {
      const bDate = new Date(booking.checkIn);
      const sDate = new Date(customStartDate);
      const eDate = new Date(customEndDate);
      matchesDate = bDate >= sDate && bDate <= eDate;
    }
    
    return matchesSearch && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredBookings.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="animate-fade-in pb-8 space-y-4">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-2 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Live overview of today's hotel operations</p>
        </div>
        <button className="mt-3 md:mt-0 bg-[var(--primary-main)] hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center">
          + New Reservation
        </button>
      </div>

      {/* 6 SIMPLE CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Reservation Today</span>
            <PersonAdd className="text-blue-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">24</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Occupied Rooms</span>
            <Bed className="text-teal-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">42</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Check-in Today</span>
            <Login className="text-green-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">12</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Checkout Today</span>
            <Logout className="text-orange-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">18</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Revenue Today</span>
            <AttachMoney className="text-purple-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">$1,250</span>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-gray-500 font-semibold text-[11px] whitespace-nowrap truncate pr-1">Payments Today</span>
            <CreditCard className="text-indigo-500 shrink-0" sx={{ fontSize: 16 }} />
          </div>
          <span className="text-lg font-bold text-gray-900">15</span>
        </div>
      </div>

      {/* BOTTOM SECTION: TABLE (left, flexible) + WIDGETS (right, fixed width) */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        
        {/* Current Booking Table (Main Area) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 w-full overflow-visible min-w-0">
          <div className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-x-2 overflow-visible">
            <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
              {dateFilter === 'Daily' ? 'Current' : dateFilter} Booking
            </h3>
            
            <div className="flex flex-row items-center space-x-2 ml-auto">
              {/* Search Bar */}
              <div className="relative w-28 md:w-40 xl:w-52 shrink">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                  }}
                />
              </div>

              {/* Date Filters with Custom Popup Wrapper */}
              <div className="relative shrink-0 flex items-center">
                {/* Segmented Control */}
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        if (tab === 'Custom') {
                          if (dateFilter === 'Custom') {
                            setIsCustomPopupOpen(!isCustomPopupOpen);
                          } else {
                            setDateFilter(tab);
                            setCurrentPage(1);
                            setIsCustomPopupOpen(true);
                          }
                        } else {
                          setDateFilter(tab);
                          setCurrentPage(1);
                          setIsCustomPopupOpen(false);
                        }
                      }}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 ${
                        dateFilter === tab 
                          ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10' 
                          : 'text-gray-500 hover:bg-[#e5f4eb] hover:text-[#1b7f43]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Floating Custom Date Picker Popup */}
                {dateFilter === 'Custom' && isCustomPopupOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] animate-fade-in">
                    <p className="text-[11px] font-bold text-gray-700">Custom Date Range</p>
                    <div className="flex flex-col gap-1.5">
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                        value={customStartDate}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomStartDate(val);
                          setCurrentPage(1);
                          if (val && customEndDate) {
                            setTimeout(() => setIsCustomPopupOpen(false), 150);
                          }
                        }}
                      />
                      <span className="text-gray-400 text-[10px] font-bold text-center">TO</span>
                      <input 
                        type="date" 
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[11px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                        value={customEndDate}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomEndDate(val);
                          setCurrentPage(1);
                          if (customStartDate && val) {
                            setTimeout(() => setIsCustomPopupOpen(false), 150);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CSV Export Button */}
              <button className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0">
                <FileDownload sx={{ fontSize: 14 }} className="text-white" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="inline sm:hidden">CSV</span>
              </button>
            </div>
          </div>
          
          {/* Table Content */}
          <div className="overflow-x-auto hide-scrollbar w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Room No</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Guest Name</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Check In</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Check Out</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Mobile</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700">Status</th>
                  <th className="py-2.5 px-4 text-[12px] font-bold text-gray-700 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((booking, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-4 text-[12px] text-gray-600 font-medium">{booking.room}</td>
                      <td className="py-2.5 px-4 text-[12px] font-medium text-gray-800">{booking.name}</td>
                      <td className="py-2.5 px-4 text-[12px] text-gray-600">{booking.checkIn}</td>
                      <td className="py-2.5 px-4 text-[12px] text-gray-600">{booking.checkOut}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center text-[12px] text-gray-600 font-medium">
                          <Phone className="text-[#1b7f43] mr-1.5" sx={{ fontSize: 13 }} />
                          {booking.mobile}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          booking.status === 'Booked' ? 'bg-[#e2f8e9] text-[#1b7f43]' :
                          booking.status === 'CheckOut' ? 'bg-purple-100 text-purple-700' :
                          booking.status === 'CheckIn' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center relative">
                        <button 
                          onClick={() => setActionMenuOpen(actionMenuOpen === index ? null : index)} 
                          className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreHoriz fontSize="small" />
                        </button>
                        
                        {/* Action Dropdown Menu */}
                        {actionMenuOpen === index && (
                          <div className="absolute right-[calc(100%-10px)] top-0 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 rounded-xl w-36 z-[100] py-1 flex flex-col overflow-hidden animate-fade-in">
                            <button className="flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 text-left">
                              <Edit className="mr-2 text-gray-500" sx={{ fontSize: 15 }} /> Edit
                            </button>
                            <button className="flex items-center px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 text-left font-medium">
                              <Delete className="mr-2 text-red-500" sx={{ fontSize: 15 }} /> Delete
                            </button>
                            <button className="flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 text-left">
                              <Logout className="mr-2 text-gray-500" sx={{ fontSize: 15 }} /> Check Out
                            </button>
                            <button className="flex items-center px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 text-left">
                              <Cancel className="mr-2 text-gray-500" sx={{ fontSize: 15 }} /> Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 text-[13px]">
                      No bookings found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="p-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[12px] text-gray-500">
                Showing <span className="font-semibold text-gray-700">{indexOfFirstRow + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(indexOfLastRow, filteredBookings.length)}</span> of <span className="font-semibold text-gray-700">{filteredBookings.length}</span>
              </span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft fontSize="small" />
                </button>
                
                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-6 h-6 rounded-md text-[12px] font-medium flex items-center justify-center transition-colors ${
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
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight fontSize="small" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: WIDGETS (fixed width, stacked to match wireframe) */}
        <div className="flex flex-col space-y-4 w-full lg:w-[300px] shrink-0">
          
          {/* Room Status Widget - SIMPLE CARDS (no graph) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <Hotel className="text-gray-500 mr-2" sx={{ fontSize: 18 }} />
                <h3 className="text-gray-800 font-bold text-[14px]">Room status</h3>
              </div>
              <span className="text-[11px] font-semibold text-gray-400">{totalRooms} Rooms</span>
            </div>

            <div className="p-4 grid grid-cols-1 gap-2">
              {roomStatusData.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 ${item.bg}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`${item.color} shrink-0`} sx={{ fontSize: 16 }} />
                      <span className="text-[12px] font-semibold text-gray-700 truncate">{item.label}</span>
                    </div>
                    <span className={`text-[13px] font-extrabold ${item.color} shrink-0`}>{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Service Requests Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center mb-1">
                <Notifications className="text-orange-500 mr-2" sx={{ fontSize: 20 }} />
                <h3 className="text-gray-800 font-bold text-[15px]">Service Requests</h3>
              </div>
              <p className="text-[11px] text-gray-500 ml-7">Active requests requiring attention</p>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Stats Box */}
              <div className="bg-[#f8f9fa] rounded-xl p-3 flex justify-between items-center text-center">
                <div className="flex flex-col flex-1 border-r border-gray-200 last:border-r-0">
                  <span className="text-xl font-black text-amber-500">3</span>
                  <span className="text-[9px] font-bold text-gray-500 mt-1">PENDING</span>
                </div>
                <div className="flex flex-col flex-1 border-r border-gray-200 last:border-r-0">
                  <span className="text-xl font-black text-[#42a5f5]">2</span>
                  <span className="text-[9px] font-bold text-gray-500 mt-1">IN PROGRESS</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="text-xl font-black text-[#ef5350]">2</span>
                  <span className="text-[9px] font-bold text-gray-500 mt-1">HIGH PRIORITY</span>
                </div>
              </div>

              {/* Recent Requests List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-gray-800 font-bold text-[13px]">Recent Requests</h4>
                  <button className="text-blue-500 text-[11px] font-semibold hover:underline bg-transparent border-none cursor-pointer">View All</button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto hide-scrollbar pr-1">
                  {/* Item 1 */}
                  <div className="border border-gray-100 rounded-xl p-3 flex items-start gap-3">
                    <div className="bg-orange-50 text-orange-500 rounded-full p-2 shrink-0">
                      <LocalCafe sx={{ fontSize: 16 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[12px] font-bold text-gray-700 truncate pr-2">Extra towels and pillows</h5>
                        <span className="bg-[#fef3c7] text-[#b45309] text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0">Pending</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500">Room 205 &nbsp;&middot;&nbsp; 15m ago</span>
                        <div className="flex items-center text-gray-400 text-[10px]">
                          <Schedule sx={{ fontSize: 12 }} className="mr-0.5" /> 10m
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="border border-gray-100 rounded-xl p-3 flex items-start gap-3">
                    <div className="bg-orange-50 text-orange-500 rounded-full p-2 shrink-0">
                      <Build sx={{ fontSize: 16 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[12px] font-bold text-gray-700 truncate pr-2">Air conditioning not working</h5>
                        <span className="bg-[#dbeafe] text-[#1e40af] text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0">In_progress</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500">Room 312 &nbsp;&middot;&nbsp; 30m ago</span>
                        <div className="flex items-center text-gray-400 text-[10px]">
                          <Schedule sx={{ fontSize: 12 }} className="mr-0.5" /> 45m
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="border border-gray-100 rounded-xl p-3 flex items-start gap-3">
                    <div className="bg-orange-50 text-orange-500 rounded-full p-2 shrink-0">
                      <CleaningServices sx={{ fontSize: 16 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="text-[12px] font-bold text-gray-700 truncate pr-2">Urgent cleaning required</h5>
                        <span className="bg-[#fef3c7] text-[#b45309] text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0">Pending</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-gray-500">Room 105 &nbsp;&middot;&nbsp; 1h ago</span>
                        <div className="flex items-center text-gray-400 text-[10px]">
                          <Schedule sx={{ fontSize: 12 }} className="mr-0.5" /> 1h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex gap-2 mt-1">
                <button className="flex-1 relative border border-[#1b7f43] bg-white text-[#1b7f43] hover:bg-[#e5f4eb] transition-colors rounded-lg py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold">
                  <Schedule sx={{ fontSize: 14 }} /> Handle Pending
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">3</span>
                </button>
                <button className="flex-1 relative border border-[#1b7f43] bg-white text-[#1b7f43] hover:bg-[#e5f4eb] transition-colors rounded-lg py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold">
                  <Warning sx={{ fontSize: 14 }} /> Urgent Only
                  <span className="absolute -top-2 -right-2 bg-slate-700 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">2</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}