import React, { useState, useRef, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Popover, IconButton, Menu } from '@mui/material';
import {
  Search, FilterList, AddCircleOutlined, Refresh,
  TableChart, PictureAsPdf, MoreHoriz,
  EditOutlined, DeleteOutlined, LogoutOutlined, CancelOutlined,
  Close, FaceOutlined, CalendarTodayOutlined,
  EmailOutlined, PhoneOutlined, Person, SubjectOutlined, LocalOfferOutlined,
  Inventory2, KeyboardArrowDown, ChevronLeft, ChevronRight, CheckCircle, MoreVert, Download, Logout, Edit, Delete
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Download from '@mui/icons-material/Download';
import MoreVert from '@mui/icons-material/MoreVert';
import Visibility from '@mui/icons-material/Visibility';
import Print from '@mui/icons-material/Print';
import Cancel from '@mui/icons-material/Cancel';
import Add from '@mui/icons-material/Add';
import Inventory2 from '@mui/icons-material/Inventory2';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Logout from '@mui/icons-material/Logout';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Menu, IconButton, Popover } from '@mui/material';

function InventoryCell({ items = [] }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  if (!items || items.length === 0) {
    return <span className="text-[12px] text-gray-400">—</span>;
  }

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

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
                <span className="text-[12px] font-bold text-gray-900 shrink-0">${item.price || 0}</span>
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

export default function AllReservations() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const mockReservations = [
    {
      id: 'RES-001',
      guestName: 'Kamran Akmal',
      mobile: '0311 1122334',
      room: '101 - Standard',
      reservationDate: '2026-09-10',
      checkIn: '2026-09-12 14:00',
      checkOut: '2026-09-15 12:00',
      inventory: [
        { name: 'Water Bottle', price: '2.50', date: '2026-09-12', time: '15:30' },
        { name: 'Extra Towel', price: '0.00', date: '2026-09-13', time: '09:00' }
      ],
      totalPrice: 450,
      remainingPrice: 0,
      paymentStatus: 'Paid',
    },
    {
      id: 'RES-002',
      guestName: 'Mahira Khan',
      mobile: '0321 6655443',
      room: '205 - Deluxe',
      reservationDate: '2026-09-11',
      checkIn: '2026-09-13 15:00',
      checkOut: '2026-09-18 11:00',
      inventory: [],
      totalPrice: 850,
      remainingPrice: 850,
      paymentStatus: 'Pending',
    },
    {
      id: 'RES-003',
      guestName: 'Cara Stevens',
      mobile: '0321 8887654',
      room: '301 - Suite',
      reservationDate: '2026-09-12',
      checkIn: '2026-09-12 12:30',
      checkOut: '2026-09-14 12:00',
      inventory: [
        { name: 'Coke', price: '3.00', date: '2026-09-12', time: '14:00' },
        { name: 'Chips', price: '2.00', date: '2026-09-12', time: '14:00' },
        { name: 'Laundry', price: '15.00', date: '2026-09-13', time: '08:30' }
      ],
      totalPrice: 600,
      remainingPrice: 300,
      paymentStatus: 'Partial',
    }
  ];

  const filteredReservations = mockReservations.filter(res => {
    const matchesSearch = res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.room.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'All' || res.paymentStatus === activeTab;
    return matchesSearch && matchesTab;
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
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">Pending</span>;
      case 'Partial':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">Partial</span>;
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
            All Reservations
          </h3>

          <div className="flex flex-row items-center space-x-2 ml-auto">
            {/* Search Bar */}
            <div className="relative w-28 md:w-40 xl:w-52 shrink">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
              <input 
                type="text" 
                placeholder="Search reservations..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow truncate bg-white"
              />
            </div>

            {/* Segmented Filter Control */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {['All', 'Paid', 'Pending', 'Partial'].map(tab => (
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
            
            {/* CSV Button */}
            <button className="flex items-center space-x-1 bg-[var(--primary-main)] hover:brightness-110 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-sm transition-all shrink-0 cursor-pointer"
              >
              <Download sx={{ fontSize: 14 }} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="inline sm:hidden">CSV</span>
            </button>

            {/* New Reservation Button */}
            <button 
              onClick={() => navigate('/reservation/new')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1b7f43] text-white hover:bg-[#156736] rounded-lg text-[11px] font-bold shadow-xs transition-colors shrink-0"
            >
              <span>+ New Reservation</span>
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
                // Calculate stay length
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
                    <td className="py-2.5 px-2 text-[13px] font-medium text-gray-700">
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
                    No reservations found matching your search.
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
          <EditOutlined sx={{ fontSize: 16, mr: 1.5, color: '#3b82f6' }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', mb: 0.5 }}>
          <CheckCircle sx={{ fontSize: 16, mr: 1.5, color: '#1b7f43' }} /> Check In
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', mb: 0.5 }}>
          <LogoutOutlined sx={{ fontSize: 16, mr: 1.5, color: '#f59e0b' }} /> Check Out
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
          <DeleteOutlined sx={{ fontSize: 16, mr: 1.5 }} /> Delete
        </MenuItem>
      </Menu>
    </div>
  );
}
