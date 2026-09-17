import React, { useState, useRef, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
  Search, FilterList, AddCircleOutlined, Refresh,
  TableChart, PictureAsPdf, MoreHoriz,
  EditOutlined, DeleteOutlined, LogoutOutlined, CancelOutlined,
  Close, FaceOutlined, CalendarTodayOutlined,
  EmailOutlined, PhoneOutlined, Person, SubjectOutlined, LocalOfferOutlined
} from '@mui/icons-material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Search from '@mui/icons-material/Search';
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
import { 
  Menu, MenuItem, IconButton, Popover 
} from '@mui/material';

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
const initialBookings = [
  { id: 1, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=11', package: 'All inclusive', roomType: 'Delux', status: 'Cancelled', checkIn: '02/25/2023', checkOut: '02/28/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 2, name: 'Sarah Smith', avatar: 'https://i.pravatar.cc/150?img=5', package: 'Business', roomType: 'Super Delux', status: 'Booked', checkIn: '02/12/2023', checkOut: '02/15/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 3, name: 'John Deo', avatar: 'https://i.pravatar.cc/150?img=12', package: 'All inclusive', roomType: 'Super Delux', status: 'CheckIn', checkIn: '02/25/2023', checkOut: '02/26/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 4, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=33', package: 'Business', roomType: 'Delux', status: 'Cancelled', checkIn: '02/21/2023', checkOut: '02/23/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 5, name: 'Smita Pari...', avatar: 'https://i.pravatar.cc/150?img=44', package: 'All inclusive', roomType: 'Vila', status: 'CheckOut', checkIn: '02/16/2023', checkOut: '02/19/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 6, name: 'Pankaj Sin...', avatar: 'https://i.pravatar.cc/150?img=55', package: 'Wedding', roomType: 'Double', status: 'Booked', checkIn: '02/11/2023', checkOut: '02/14/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 7, name: 'Pankaj Sin...', avatar: 'https://i.pravatar.cc/150?img=56', package: 'Business', roomType: 'Single', status: 'Booked', checkIn: '02/27/2023', checkOut: '02/28/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
  { id: 8, name: 'Jay Soni', avatar: 'https://i.pravatar.cc/150?img=34', package: 'All inclusive', roomType: 'Delux', status: 'Booked', checkIn: '02/17/2023', checkOut: '02/20/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 9, name: 'Smita Pari...', avatar: 'https://i.pravatar.cc/150?img=45', package: 'Wedding', roomType: 'Delux', status: 'CheckOut', checkIn: '02/07/2023', checkOut: '02/10/2023', payment: 'Paid', email: 'test@email.com', mobile: '1234567890' },
  { id: 10, name: 'Pooja Patel', avatar: 'https://i.pravatar.cc/150?img=22', package: 'Business', roomType: 'Super Delux', status: 'Cancelled', checkIn: '02/09/2023', checkOut: '02/12/2023', payment: 'Unpaid', email: 'test@email.com', mobile: '1234567890' },
];

const statusStyles = {
  Cancelled: 'bg-orange-100 text-orange-500',
  Booked: 'bg-green-100 text-green-600',
  CheckIn: 'bg-blue-100 text-blue-500',
  CheckOut: 'bg-purple-100 text-purple-500'
};

const paymentStyles = {
  Paid: 'bg-green-100 text-green-600',
  Unpaid: 'bg-orange-100 text-orange-500'
};

export default function AllBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  
  // Columns Menu state
  const [visibleColumns, setVisibleColumns] = useState({
    Name: true, Package: true, 'Room Type': true, Status: true,
    'Check In': true, 'Check Out': true, Payment: true,
    Email: true, Mobile: true, Actions: true
  });
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const filterMenuRef = useRef(null);

  // Action Menu state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);
  
  // Booking Form State
  const [form, setForm] = useState({
    firstName: '', lastName: '', package: 'All inclusive', roomType: 'Delux',
    payment: '', status: 'Booked', dates: '', email: '', mobile: ''
  });

  const isFormValid = form.firstName.trim() && form.lastName.trim() && form.dates.trim() && form.email.trim() && form.mobile.trim() && form.payment !== '';

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setSearch('');
    setBookings(initialBookings);
    setVisibleColumns({
      Name: true, Package: true, 'Room Type': true, Status: true,
      'Check In': true, 'Check Out': true, Payment: true,
      Email: true, Mobile: true, Actions: true
    });
  };

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\n';
    
    filteredBookings.forEach(b => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'Name') val = b.name;
        else if (col === 'Package') val = b.package;
        else if (col === 'Room Type') val = b.roomType;
        else if (col === 'Status') val = b.status;
        else if (col === 'Check In') val = b.checkIn;
        else if (col === 'Check Out') val = b.checkOut;
        else if (col === 'Payment') val = b.payment;
        else if (col === 'Email') val = b.email;
        else if (col === 'Mobile') val = b.mobile;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bookings.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = `
      <html>
        <head>
          <title>Bookings Report</title>
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
          <h2>Bookings Report</h2>
          <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;
    
    filteredBookings.forEach(b => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
        if (col === 'Name') val = b.name;
        else if (col === 'Package') val = b.package;
        else if (col === 'Room Type') val = b.roomType;
        else if (col === 'Status') val = b.status;
        else if (col === 'Check In') val = b.checkIn;
        else if (col === 'Check Out') val = b.checkOut;
        else if (col === 'Payment') val = b.payment;
        else if (col === 'Email') val = b.email;
        else if (col === 'Mobile') val = b.mobile;
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
            </tbody>
          </table>
          <script>
            window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    b.email.toLowerCase().includes(search.toLowerCase()) ||
    b.mobile.includes(search)
  );

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const openViewModal = (booking) => {
    setViewingBooking(booking);
    setIsViewModalOpen(true);
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm({
      firstName: '', lastName: '', package: 'All inclusive', roomType: 'Delux',
      payment: 'Paid', status: 'Booked', dates: '', email: '', mobile: ''
    });
    setIsBookingModalOpen(true);
  };

  const openEditModal = (booking) => {
    setEditingId(booking.id);
    const [firstName, ...lastNames] = booking.name.split(' ');
    setForm({
      firstName,
      lastName: lastNames.join(' '),
      package: booking.package,
      roomType: booking.roomType,
      payment: booking.payment,
      status: booking.status,
      dates: `${booking.checkIn} - ${booking.checkOut}`,
      email: booking.email,
      mobile: booking.mobile
    });
    setIsBookingModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveBooking = () => {
    if (!isFormValid) return;
    
    // Naive split for dates assuming format "MM/DD/YYYY - MM/DD/YYYY"
    const datesSplit = form.dates.split(' - ');
    const checkIn = datesSplit[0] || '';
    const checkOut = datesSplit[1] || '';
    const fullName = `${form.firstName} ${form.lastName}`;

    if (editingId) {
      setBookings(bookings.map(b => 
        b.id === editingId ? {
          ...b,
          name: fullName,
          package: form.package,
          roomType: form.roomType,
          payment: form.payment,
          status: form.status,
          checkIn,
          checkOut,
          email: form.email,
          mobile: form.mobile
        } : b
      ));
    } else {
      const newId = bookings.length ? Math.max(...bookings.map(b => b.id)) + 1 : 1;
      setBookings([
        {
          id: newId,
          name: fullName,
          avatar: 'https://i.pravatar.cc/150?img=1', // dummy avatar
          package: form.package,
          roomType: form.roomType,
          status: form.status,
          checkIn,
          checkOut,
          payment: form.payment,
          email: form.email,
          mobile: form.mobile
        },
        ...bookings
      ]);
    }
    setIsBookingModalOpen(false);
  };

  const confirmDelete = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = () => {
    if (bookingToDelete) {
      setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    }
  };

  const confirmCancel = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
    setActiveMenuId(null);
  };

  const handleCancelBooking = () => {
    if (bookingToCancel) {
      setBookings(bookings.map(b => b.id === bookingToCancel.id ? { ...b, status: 'Cancelled' } : b));
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCheckout = (id) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CheckOut' } : b));
    setActiveMenuId(null);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 min-h-screen">
      
      {/* Top Header */}
      <div className="bg-white rounded-t-xl p-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h1 className="text-[16px] font-bold text-gray-700">Bookings</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[250px] pl-4 pr-10 py-1.5 border border-gray-400 rounded-md text-[13px] text-gray-700 focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" sx={{ fontSize: 18 }} />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative" ref={filterMenuRef}>
            <button onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Filter">
              <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            {showColumnsMenu && (
              <div className="absolute right-0 top-10 w-48 bg-[#f8f9fa] shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-50 py-2 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100 text-[12px] font-bold text-gray-700">Show/Hide Column</div>
                <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {Object.keys(visibleColumns).map(col => (
                    <label key={col} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer gap-3 text-[13px] text-gray-700 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={visibleColumns[col]} 
                        onChange={() => toggleColumn(col)} 
                        className="w-4 h-4 accent-[#1b7f43] cursor-pointer rounded-sm" 
                      />
                      {col}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={openNewModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Add Booking">
            <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[#1b7f43]" />
          </button>
          <button onClick={handleRefresh} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
            <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
          </button>
          <button onClick={handleExportCSV} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
            <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
          </button>
          <button onClick={handleExportPDF} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
            <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-b-xl shadow-sm flex-1 flex flex-col">
        <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                {visibleColumns['Name'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Name</th>}
                {visibleColumns['Package'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Package</th>}
                {visibleColumns['Room Type'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Room Type</th>}
                {visibleColumns['Status'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Status</th>}
                {visibleColumns['Check In'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Check In</th>}
                {visibleColumns['Check Out'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Check Out</th>}
                {visibleColumns['Payment'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Payment</th>}
                {visibleColumns['Email'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Email</th>}
                {visibleColumns['Mobile'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b]">Mobile</th>}
                {visibleColumns['Actions'] && <th className="py-4 px-6 text-[13px] font-bold text-[#1e293b] text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} onClick={() => openViewModal(booking)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                  {visibleColumns['Name'] && (
                    <td className="py-3 px-6 flex items-center gap-3">
                      <img src={booking.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                      <span className="text-[13px] text-gray-700 font-medium">{booking.name}</span>
                    </td>
                  )}
                  {visibleColumns['Package'] && <td className="py-3 px-6 text-[13px] text-gray-600">{booking.package}</td>}
                  {visibleColumns['Room Type'] && <td className="py-3 px-6 text-[13px] text-gray-600">{booking.roomType}</td>}
                  {visibleColumns['Status'] && (
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-[4px] text-[11px] font-bold ${statusStyles[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Check In'] && (
                    <td className="py-3 px-6 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                        {booking.checkIn}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Check Out'] && (
                    <td className="py-3 px-6 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                        {booking.checkOut}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Payment'] && (
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-[4px] text-[11px] font-bold ${paymentStyles[booking.payment]}`}>
                        {booking.payment}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Email'] && (
                    <td className="py-3 px-6 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <EmailOutlined sx={{ fontSize: 14 }} className="text-red-400" />
                        {booking.email}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Mobile'] && (
                    <td className="py-3 px-6 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <PhoneOutlined sx={{ fontSize: 14 }} className="text-green-500" />
                        {booking.mobile}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Actions'] && (
                    <td className="py-3 px-6 relative text-center">
                      <button onClick={(e) => toggleMenu(e, booking.id)} className="text-gray-700 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto transition-colors">
                        <MoreHoriz sx={{ fontSize: 20 }} />
                      </button>
                      
                      {/* Action Dropdown */}
                      {activeMenuId === booking.id && (
                        <div ref={menuRef} onClick={(e) => e.stopPropagation()} className="absolute right-8 top-10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-20 py-2 w-48 text-left animate-fade-in">
                          <button onClick={() => openEditModal(booking)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors">
                            <EditOutlined className="text-[var(--primary-main)]" sx={{ fontSize: 18 }} /> Edit Booking
                          </button>
                          <button onClick={() => confirmDelete(booking)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors">
                            <DeleteOutlined className="text-[#ef4444]" sx={{ fontSize: 18 }} /> Delete Booking
                          </button>
                          <button onClick={() => handleCheckout(booking.id)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors">
                            <LogoutOutlined className="text-[#64748b]" sx={{ fontSize: 18 }} /> Check Out
                          </button>
                          <button onClick={() => confirmCancel(booking)} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-[13px] text-[#1e293b] font-medium transition-colors">
                            <CancelOutlined className="text-[#64748b]" sx={{ fontSize: 18 }} /> Cancel Booking
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400 text-[14px]">
                    No bookings found.
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
          <Edit sx={{ fontSize: 16, mr: 1.5, color: '#3b82f6' }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', mb: 0.5 }}>
          <CheckCircle sx={{ fontSize: 16, mr: 1.5, color: '#1b7f43' }} /> Check In
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', mb: 0.5 }}>
          <Logout sx={{ fontSize: 16, mr: 1.5, color: '#f59e0b' }} /> Check Out
        </MenuItem>
        <MenuItem onClick={handleActionClose} sx={{ fontSize: '13px', py: 1, borderRadius: '8px', color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
          <Delete sx={{ fontSize: 16, mr: 1.5 }} /> Delete
        </MenuItem>
      </Menu>
    </div>
  );
}
        {/* Pagination bar - Simple dummy matching image */}
        <div className="p-4 mt-auto flex items-center justify-end gap-6 text-[12px] text-gray-600 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select className="border border-gray-300 rounded px-2 py-1 outline-none text-[12px]">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <span>1 - {Math.min(10, filteredBookings.length)} of {filteredBookings.length}</span>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 cursor-not-allowed">{'<'}</span>
            <span className="cursor-pointer hover:text-gray-900">{'>'}</span>
          </div>
        </div>
      </div>

            {/* View Booking Modal */}
      {isViewModalOpen && viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[var(--primary-main)] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={viewingBooking.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                <div className="flex flex-col">
                  <h2 className="text-white text-[20px] font-bold leading-tight">{viewingBooking.name}</h2>
                  <span className="text-white/80 text-[13px]">{viewingBooking.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewingBooking); }} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit Booking"
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
                {/* Package */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <SubjectOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Package</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingBooking.package}</span>
                  </div>
                </div>
                
                {/* Room Type */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <SubjectOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Room Type</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingBooking.roomType}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <LocalOfferOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Status</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${statusStyles[viewingBooking.status]}`}>
                      {viewingBooking.status}
                    </span>
                  </div>
                </div>

                {/* Check In */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarTodayOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check In</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingBooking.checkIn}</span>
                  </div>
                </div>

                {/* Check Out */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarTodayOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check Out</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingBooking.checkOut}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <LocalOfferOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Payment</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${paymentStyles[viewingBooking.payment]}`}>
                      {viewingBooking.payment}
                    </span>
                  </div>
                </div>

                {/* Mobile */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <PhoneOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Mobile</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingBooking.mobile}</span>
                  </div>
                </div>

                {/* Email (not in screenshot but essential) */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <EmailOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email</span>
                    <span className="text-[14px] font-bold text-gray-800 break-all">{viewingBooking.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/New Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsBookingModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[750px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {editingId ? (
                  <img src={bookings.find(b=>b.id===editingId)?.avatar || 'https://i.pravatar.cc/150'} alt="guest" className="w-8 h-8 rounded-full border border-white" />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-white bg-[var(--primary-main)] flex items-center justify-center text-white">
                    <Person sx={{ fontSize: 20 }} />
                  </div>
                )}
                <h2 className="text-white text-[17px] font-bold">{editingId ? form.firstName + ' ' + form.lastName : 'New Record'}</h2>
              </div>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 bg-white overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">First Name*</label>
                  <input 
                    type="text" 
                    value={form.firstName}
                    onChange={(e) => setForm({...form, firstName: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <FaceOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>
                {/* Last Name */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Last Name*</label>
                  <input 
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({...form, lastName: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <FaceOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>
                {/* Package */}
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '& .MuiInputLabel-root.Mui-focused': { color: 'var(--primary-main)' } }}>
                  <InputLabel id="package-label">Package*</InputLabel>
                  <Select
                    labelId="package-label"
                    value={form.package}
                    label="Package*"
                    onChange={(e) => setForm({...form, package: e.target.value})}
                  >
                    <MenuItem value="All inclusive">All inclusive</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Wedding">Wedding</MenuItem>
                  </Select>
                </FormControl>
                {/* Room Type (Country in img but values match room type) */}
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '& .MuiInputLabel-root.Mui-focused': { color: 'var(--primary-main)' } }}>
                  <InputLabel id="room-type-label">Country*</InputLabel>
                  <Select
                    labelId="room-type-label"
                    value={form.roomType}
                    label="Country*"
                    onChange={(e) => setForm({...form, roomType: e.target.value})}
                  >
                    <MenuItem value="Delux">Delux</MenuItem>
                    <MenuItem value="Super Delux">Super Delux</MenuItem>
                    <MenuItem value="Vila">Vila</MenuItem>
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Double">Double</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Payment Radio */}
                <div className="flex flex-col col-span-1 md:col-span-2">
                  <div className="flex items-center gap-6 text-[14px] text-gray-700">
                    <span className="font-medium">Payment:</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="payment" value="Paid" checked={form.payment === 'Paid'} onChange={(e)=>setForm({...form, payment: e.target.value})} className="w-4 h-4 text-[#1b7f43] focus:ring-[#1b7f43]" />
                      Paid
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="payment" value="Unpaid" checked={form.payment === 'Unpaid'} onChange={(e)=>setForm({...form, payment: e.target.value})} className="w-4 h-4 text-[#1b7f43] focus:ring-[#1b7f43]" />
                      Unpaid
                    </label>
                  </div>
                  {!form.payment && <span className="text-red-500 text-[12px] mt-2">Select payment</span>}
                </div>

                {/* Status */}
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary-main)' }, '& .MuiInputLabel-root.Mui-focused': { color: 'var(--primary-main)' } }}>
                  <InputLabel id="status-label">Status*</InputLabel>
                  <Select
                    labelId="status-label"
                    value={form.status}
                    label="Status*"
                    onChange={(e) => setForm({...form, status: e.target.value})}
                  >
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                    <MenuItem value="Booked">Booked</MenuItem>
                    <MenuItem value="CheckIn">CheckIn</MenuItem>
                    <MenuItem value="CheckOut">CheckOut</MenuItem>
                  </Select>
                </FormControl>

                {/* Dates */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Enter Check In & Check Out Date*</label>
                  <input 
                    type="text" 
                    placeholder="MM-DD-YYYY - MM-DD-YYYY"
                    value={form.dates}
                    onChange={(e) => setForm({...form, dates: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <CalendarTodayOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>
                
                {/* Email */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Email*</label>
                  <input 
                    type="email" 
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <EmailOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>

                {/* Mobile */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-[12px] text-gray-600 font-medium z-10">Mobile*</label>
                  <input 
                    type="text" 
                    value={form.mobile}
                    onChange={(e) => setForm({...form, mobile: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md text-[14px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all" 
                  />
                  <PhoneOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700" sx={{ fontSize: 20 }} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 flex gap-3 border-t border-gray-100">
              <button 
                onClick={handleSaveBooking}
                disabled={!isFormValid}
                className="px-6 py-2 rounded-full text-[13.5px] font-bold shadow-sm transition-colors cursor-pointer border"
                style={isFormValid ? { backgroundColor: '#ffffff', color: '#1b7f43', borderColor: '#e2e8f0' } : { backgroundColor: '#e2e8f0', color: '#94a3b8', borderColor: 'transparent', cursor: 'not-allowed' }}
              >
                Save
              </button>
              <button onClick={() => setIsBookingModalOpen(false)} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fcf8fa] rounded-xl shadow-2xl w-[320px] p-6 text-center animate-scale-in border border-gray-100">
            <h2 className="text-[22px] font-medium text-gray-800 mb-6 text-left">Are you sure?</h2>
            
            <div className="text-left space-y-3 mb-8 text-[14px] text-gray-700">
              <p>Name: <span className="text-gray-600">{bookingToDelete?.name}</span></p>
              <p>Email: <span className="text-gray-600">{bookingToDelete?.email}</span></p>
              <p>Mobile: <span className="text-gray-600">{bookingToDelete?.mobile}</span></p>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={handleDelete} className="px-6 py-2 rounded-full bg-[#c23e3e] hover:bg-red-700 text-white font-bold text-[14px] transition-colors shadow-sm">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-full bg-[#0a6c32] hover:bg-green-800 text-white font-bold text-[14px] transition-colors shadow-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsCancelModalOpen(false)}>
          <div className="bg-[#fcf8fa] rounded-lg shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">Cancel Booking</h2>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 16 }} />
              </button>
            </div>
            
            <div className="p-5 bg-white">
              <p className="text-[13px] text-gray-600 mb-3">Please provide a reason for cancelling the booking:</p>
              <textarea 
                rows="3" 
                placeholder="Reason"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-[13px] text-gray-700 focus:border-[var(--primary-main)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-main)] transition-all resize-y"
              ></textarea>
            </div>
            
            <div className="px-5 py-4 bg-white flex gap-4">
              <button onClick={() => setIsCancelModalOpen(false)} className="text-[#e11d48] font-medium text-[14px] hover:text-red-700 transition-colors">
                Cancel
              </button>
              <button onClick={handleCancelBooking} className="text-[#1b7f43] font-medium text-[14px] hover:text-green-800 transition-colors">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



