import React, { useState } from 'react';
import Search from '@mui/icons-material/Search';
import Download from '@mui/icons-material/Download';
import MoreVert from '@mui/icons-material/MoreVert';
import Visibility from '@mui/icons-material/Visibility';
import Print from '@mui/icons-material/Print';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Inventory2 from '@mui/icons-material/Inventory2';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { 
  Menu, MenuItem, IconButton, Popover
} from '@mui/material';

// Column now shows only a dropdown trigger — clicking it opens the full numbered
// inventory list with date, time, price, and a total at the bottom.
function InventoryCell({ items = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!items || items.length === 0) {
    return <span className="text-[12px] text-gray-400">—</span>;
  }

  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <>
      <button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="flex items-center gap-1 px-2.5 py-1 bg-[#e5f4eb] text-[#1b7f43] rounded-md text-[11px] font-semibold cursor-pointer hover:brightness-95 transition"
      >
        <Inventory2 sx={{ fontSize: 13 }} />
        {items.length} {items.length === 1 ? 'Item' : 'Items'}
        <KeyboardArrowDown sx={{ fontSize: 14 }} />
      </button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div className="p-3 min-w-[260px] max-w-[300px]">
          <div className="flex items-center gap-1.5 mb-2.5 text-gray-700">
            <Inventory2 sx={{ fontSize: 15 }} />
            <span className="text-[12px] font-bold">Full Inventory ({items.length})</span>
          </div>

          <div className="flex flex-col divide-y divide-gray-50">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start justify-between gap-2 py-2 first:pt-0">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-gray-400 shrink-0 pt-0.5">{idx + 1}.</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10.5px] text-gray-400">
                      {item.date} {item.time && `• ${item.time}`}
                    </p>
                  </div>
                </div>
                <span className="text-[12px] font-bold text-gray-900 shrink-0">${item.price}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-gray-100">
            <span className="text-[12px] font-bold text-gray-700">Total</span>
            <span className="text-[13px] font-bold text-[#1b7f43]">${total}</span>
          </div>
        </div>
      </Popover>
    </>
  );
}

export default function ReservationHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Daily');
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const mockReservations = [
    { id: 'RES-001', guestName: 'John Doe', mobile: '0311 0000000', room: '105 - Standard', reservationDate: '2026-08-01', checkIn: '2026-08-10 14:00', checkOut: '2026-08-15 12:00', inventory: [
      { name: 'Coke Can', date: '2026-08-10', time: '14:20', price: 3 },
      { name: 'Dinner (Chicken Karahi)', date: '2026-08-11', time: '20:15', price: 18 },
      { name: 'Lays Chips', date: '2026-08-12', time: '17:00', price: 2 },
    ], paymentStatus: 'Paid', totalPrice: 500, remainingPrice: 0 },
    { id: 'RES-002', guestName: 'Sarah Smith', mobile: '0300 1234567', room: '302 - Suite', reservationDate: '2026-08-20', checkIn: '2026-08-25 15:00', checkOut: '2026-08-28 11:00', inventory: [], paymentStatus: 'Paid', totalPrice: 900, remainingPrice: 0 },
    { id: 'RES-003', guestName: 'Ahsan Khan', mobile: '0333 4455667', room: '101 - Standard', reservationDate: '2026-07-15', checkIn: '2026-07-20 13:00', checkOut: '2026-07-22 11:00', inventory: [
      { name: 'Breakfast (Continental)', date: '2026-07-21', time: '08:30', price: 12 },
    ], paymentStatus: 'Paid', totalPrice: 300, remainingPrice: 0 },
    { id: 'RES-004', guestName: 'Maria Garcia', mobile: '0344 7788990', room: '205 - Deluxe', reservationDate: '2026-07-10', checkIn: '2026-07-22 14:30', checkOut: '2026-07-25 12:00', inventory: [], paymentStatus: 'Refunded', totalPrice: 600, remainingPrice: 0 },
    { id: 'RES-005', guestName: 'Liam Johnson', mobile: '0312 9988776', room: '310 - Suite', reservationDate: '2026-06-25', checkIn: '2026-07-01 12:00', checkOut: '2026-07-05 10:00', inventory: [
      { name: 'Coke Can', date: '2026-07-01', time: '12:10', price: 3 },
      { name: 'Dinner (BBQ Platter)', date: '2026-07-01', time: '20:30', price: 25 },
      { name: 'Water Bottle (1.5L)', date: '2026-07-02', time: '08:00', price: 2 },
      { name: 'Lays Chips', date: '2026-07-03', time: '16:45', price: 2 },
    ], paymentStatus: 'Paid', totalPrice: 1200, remainingPrice: 0 },
    { id: 'RES-006', guestName: 'Ayesha Tariq', mobile: '0321 4433221', room: '102 - Standard', reservationDate: '2026-06-12', checkIn: '2026-06-18 15:00', checkOut: '2026-06-20 12:00', inventory: [], paymentStatus: 'Paid', totalPrice: 250, remainingPrice: 0 },
    { id: 'RES-007', guestName: 'David Lee', mobile: '0301 5566778', room: '212 - Deluxe', reservationDate: '2026-06-05', checkIn: '2026-06-15 14:00', checkOut: '2026-06-18 11:00', inventory: [
      { name: 'Club Sandwich', date: '2026-06-15', time: '14:30', price: 9 },
      { name: 'Coke Can', date: '2026-06-16', time: '13:00', price: 3 },
    ], paymentStatus: 'Paid', totalPrice: 550, remainingPrice: 0 },
    { id: 'RES-008', guestName: 'Fatima Ali', mobile: '0334 1122112', room: '115 - Standard', reservationDate: '2026-05-20', checkIn: '2026-05-25 13:30', checkOut: '2026-05-27 12:00', inventory: [], paymentStatus: 'Cancelled', totalPrice: 300, remainingPrice: 300 },
    { id: 'RES-009', guestName: 'Oliver Twist', mobile: '0345 8899000', room: '305 - Suite', reservationDate: '2026-05-15', checkIn: '2026-05-20 14:00', checkOut: '2026-05-25 10:00', inventory: [
      { name: 'Dinner (Grilled Fish)', date: '2026-05-20', time: '20:00', price: 22 },
    ], paymentStatus: 'Paid', totalPrice: 1500, remainingPrice: 0 },
    { id: 'RES-010', guestName: 'Hassan Raza', mobile: '0311 6655443', room: '201 - Deluxe', reservationDate: '2026-05-01', checkIn: '2026-05-10 12:00', checkOut: '2026-05-12 12:00', inventory: [], paymentStatus: 'Paid', totalPrice: 400, remainingPrice: 0 },
    { id: 'RES-011', guestName: 'Emma Watson', mobile: '0300 9988776', room: '108 - Standard', reservationDate: '2026-04-25', checkIn: '2026-05-02 15:00', checkOut: '2026-05-05 11:00', inventory: [
      { name: 'Coke Can', date: '2026-05-02', time: '15:10', price: 3 },
      { name: 'Lays Chips', date: '2026-05-02', time: '15:12', price: 2 },
      { name: 'Dinner (Chicken Karahi)', date: '2026-05-03', time: '20:15', price: 18 },
      { name: 'Breakfast (Continental)', date: '2026-05-04', time: '08:30', price: 12 },
    ], paymentStatus: 'Refunded', totalPrice: 350, remainingPrice: 0 },
    { id: 'RES-012', guestName: 'Zainab Abbas', mobile: '0322 3344556', room: '220 - Deluxe', reservationDate: '2026-04-10', checkIn: '2026-04-15 14:00', checkOut: '2026-04-18 12:00', inventory: [], paymentStatus: 'Paid', totalPrice: 700, remainingPrice: 0 },
    { id: 'RES-013', guestName: 'Michael Scott', mobile: '0333 7777777', room: '312 - Suite', reservationDate: '2026-04-01', checkIn: '2026-04-10 13:00', checkOut: '2026-04-15 11:00', inventory: [
      { name: 'Club Sandwich', date: '2026-04-10', time: '13:20', price: 9 },
    ], paymentStatus: 'Paid', totalPrice: 1250, remainingPrice: 0 },
    { id: 'RES-014', guestName: 'Sana Javed', mobile: '0345 1231234', room: '110 - Standard', reservationDate: '2026-03-20', checkIn: '2026-03-25 14:00', checkOut: '2026-03-27 12:00', inventory: [], paymentStatus: 'Paid', totalPrice: 200, remainingPrice: 0 },
    { id: 'RES-015', guestName: 'Usman Khawaja', mobile: '0313 5554443', room: '208 - Deluxe', reservationDate: '2026-03-15', checkIn: '2026-03-20 15:00', checkOut: '2026-03-24 10:00', inventory: [
      { name: 'Dinner (BBQ Platter)', date: '2026-03-20', time: '20:30', price: 25 },
      { name: 'Coke Can', date: '2026-03-21', time: '11:00', price: 3 },
    ], paymentStatus: 'Cancelled', totalPrice: 800, remainingPrice: 800 },
  ];

  const filteredReservations = mockReservations.filter(res => {
    const matchesSearch = res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.room.toLowerCase().includes(searchQuery.toLowerCase());
    
    // In a real app, you would filter by res.reservationDate based on activeTab (Daily, Weekly, etc)
    // and customStartDate / customEndDate. For now we just return matchesSearch for the UI demo.
    return matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleActionClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowId(id);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedRowId(null);
  };

  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'Paid':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Paid</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">Cancelled</span>;
      case 'Refunded':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">Refunded</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-4 animate-fade-in">
      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-visible">
          <h3 className="text-gray-800 font-bold text-[14px] lg:text-[15px] whitespace-nowrap">
            Reservation History
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar */}
            <div className="relative w-28 md:w-40 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate bg-white"
              />
            </div>
            
            {/* Segmented Filter Control & Custom Popup */}
            <div className="relative flex bg-white border border-gray-200 rounded-lg overflow-visible shrink-0">
              {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                    if (tab === 'Custom') {
                      setIsCustomPopupOpen(!isCustomPopupOpen);
                    } else {
                      setIsCustomPopupOpen(false);
                    }
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

              {/* Floating Custom Date Picker Popup */}
              {activeTab === 'Custom' && isCustomPopupOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[100] bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] animate-fade-in">
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
            
            {/* CSV Button */}
            <button className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
              >
              <Download sx={{ fontSize: 14 }} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Res <br/> ID</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Guest <br/> Name</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Mobile <br/> No</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Room no/ <br/> Type</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Reservation <br/> Date</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Check-In</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Check-Out</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Inventory</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Total <br/> Price</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Remaining</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider leading-tight">Payment</th>
                <th className="py-3 px-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center leading-tight">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReservations.map((res) => {
                const start = new Date(res.checkIn.split(' ')[0]);
                const end = new Date(res.checkOut.split(' ')[0]);
                const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
                const stayText = days > 0 ? `${days} stay${days > 1 ? 's' : ''}` : 'Same day';

                return (
                  <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-2 text-[13px] font-bold text-gray-800">{res.id}</td>
                    <td className="py-2.5 px-2 text-[13px] font-semibold text-gray-700">{res.guestName}</td>
                    <td className="py-2.5 px-2 text-[13px] text-gray-600">{res.mobile}</td>
                    <td className="py-2.5 px-2 text-[13px] text-gray-600">
                      {res.room.split(' - ')[0]} <br/> <span className="text-[10px] text-gray-400">{res.room.split(' - ')[1] || ''}</span>
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-gray-600">
                          {res.checkIn.split(' ')[0]} / <br/> {res.checkOut.split(' ')[0]}
                        </span>
                        <span className="text-[11px] font-medium text-[#1b7f43]">
                          {stayText}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-[13px] font-medium text-gray-700">{res.checkIn}</td>
                    <td className="py-2.5 px-2 text-[13px] font-medium text-gray-700">{res.checkOut}</td>
                    <td className="py-2.5 px-2">
                      <InventoryCell items={res.inventory} />
                    </td>
                    <td className="py-2.5 px-2 text-[13px] font-bold text-gray-900">${res.totalPrice}</td>
                    <td className="py-2.5 px-2 text-[13px] font-semibold text-red-500">${res.remainingPrice}</td>
                    <td className="py-2.5 px-2">{getPaymentStatusBadge(res.paymentStatus)}</td>
                  <td className="py-2.5 px-2 text-center relative">
                    <IconButton size="small" onClick={(e) => handleActionClick(e, res.id)}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
                );
              })}
              
              {paginatedReservations.length === 0 && (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-sm text-gray-500">
                    No reservations found.
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
              Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, filteredReservations.length)}</span> of <span className="font-semibold text-gray-700">{filteredReservations.length}</span>
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

      {/* Action Menu Popup */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, minWidth: 150, borderRadius: '12px', padding: '4px' }
        }}
      >
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', mb: 0.5 }}>
          <Visibility sx={{ fontSize: 16, mr: 1.5, color: '#3b82f6' }} /> View Details
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px' }}>
          <Print sx={{ fontSize: 16, mr: 1.5, color: '#6b7280' }} /> Print Invoice
        </MenuItem>
      </Menu>
    </div>
  );
}