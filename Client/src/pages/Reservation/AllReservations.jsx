import React, { useState, useRef, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import {
  Search, FilterList, AddCircleOutlined, Refresh,
  TableChart, PictureAsPdf, MoreHoriz,
  EditOutlined, DeleteOutlined, LogoutOutlined, CancelOutlined,
  Close, FaceOutlined, CalendarTodayOutlined,
  EmailOutlined, PhoneOutlined, Person, SubjectOutlined, LocalOfferOutlined
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
    <div className="w-full h-full flex flex-col pt-1">
      
      {/* Top Header */}
      <div className="bg-white rounded-[6px] p-2 flex items-center justify-between border-b border-gray-100">
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
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                {visibleColumns['Name'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Name</th>}
                {visibleColumns['Package'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Package</th>}
                {visibleColumns['Room Type'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Room Type</th>}
                {visibleColumns['Status'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Status</th>}
                {visibleColumns['Check In'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Check In</th>}
                {visibleColumns['Check Out'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Check Out</th>}
                {visibleColumns['Payment'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Payment</th>}
                {visibleColumns['Email'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Email</th>}
                {visibleColumns['Mobile'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Mobile</th>}
                {visibleColumns['Actions'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b] text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} onClick={() => openViewModal(booking)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                  {visibleColumns['Name'] && (
                    <td className="py-3 px-2 flex items-center gap-3">
                      <img src={booking.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                      <span className="text-[13px] text-gray-700 font-medium">{booking.name}</span>
                    </td>
                  )}
                  {visibleColumns['Package'] && <td className="py-3 px-2 text-[13px] text-gray-600">{booking.package}</td>}
                  {visibleColumns['Room Type'] && <td className="py-3 px-2 text-[13px] text-gray-600">{booking.roomType}</td>}
                  {visibleColumns['Status'] && (
                    <td className="py-3 px-2">
                      <span className={`px-3 py-1 rounded-[4px] text-[11px] font-bold ${statusStyles[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Check In'] && (
                    <td className="py-3 px-2 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                        {booking.checkIn}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Check Out'] && (
                    <td className="py-3 px-2 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                        {booking.checkOut}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Payment'] && (
                    <td className="py-3 px-2">
                      <span className={`px-3 py-1 rounded-[4px] text-[11px] font-bold ${paymentStyles[booking.payment]}`}>
                        {booking.payment}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Email'] && (
                    <td className="py-3 px-2 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <EmailOutlined sx={{ fontSize: 14 }} className="text-red-400" />
                        {booking.email}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Mobile'] && (
                    <td className="py-3 px-2 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <PhoneOutlined sx={{ fontSize: 14 }} className="text-green-500" />
                        {booking.mobile}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Actions'] && (
                    <td className="py-3 px-2 relative text-center">
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
            <div className="bg-[var(--primary-main)] px-2 py-5 flex items-center justify-between">
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
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[850px] overflow-hidden flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bg-[var(--primary-main)] px-5 py-4 flex items-center justify-between shrink-0">
              <h2 className="text-white text-[16px] font-bold">
                {editingId ? 'Edit Booking' : 'Add Booking'}
              </h2>
              <button onClick={() => setIsBookingModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-[12px] font-bold">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            {/* Form Body */}
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBooking(); }} className="overflow-y-auto flex-1 p-6 bg-gray-50/30">
              
              {/* Section 1: Guest Information */}
              <div className="mb-8">
                <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Guest Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">First Name *</label>
                    <input type="text" value={form.firstName || ''} onChange={e => setForm({...form, firstName: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="Pooja" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Last Name</label>
                    <input type="text" value={form.lastName || ''} onChange={e => setForm({...form, lastName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="Sarma" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Email Address</label>
                    <input type="email" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="test@example.com" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Gender</label>
                    <select value={form.gender || ''} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]">
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Mobile</label>
                    <input type="text" value={form.mobile || ''} onChange={e => setForm({...form, mobile: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="123456789" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">City</label>
                    <input type="text" value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="Surat" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">ID/Passport Number</label>
                    <input type="text" value={form.passport || ''} onChange={e => setForm({...form, passport: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="P123456789" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Nationality</label>
                    <input type="text" value={form.nationality || ''} onChange={e => setForm({...form, nationality: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="Indian" />
                  </div>
                </div>
              </div>

              {/* Section 2: Stay Details */}
              <div className="mb-8">
                <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Stay Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Check In Date</label>
                    <input type="date" value={form.checkIn || ''} onChange={e => setForm({...form, checkIn: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Check Out Date</label>
                    <input type="date" value={form.checkOut || ''} onChange={e => setForm({...form, checkOut: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Select Package Type</label>
                    <select value={form.package || ''} onChange={e => setForm({...form, package: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]">
                      <option value="">Select</option>
                      <option value="Business">Business</option>
                      <option value="All inclusive">All inclusive</option>
                      <option value="Wedding">Wedding</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Total Person *</label>
                    <input type="number" required value={form.totalPerson || ''} onChange={e => setForm({...form, totalPerson: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="3" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Number of Rooms</label>
                    <input type="number" value={form.numRooms || ''} onChange={e => setForm({...form, numRooms: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="2" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Select Room Type</label>
                    <select value={form.roomType || ''} onChange={e => setForm({...form, roomType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]">
                      <option value="">Select</option>
                      <option value="Delux">Delux</option>
                      <option value="Super Delux">Super Delux</option>
                      <option value="Vila">Vila</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Arrival Time</label>
                    <select value={form.arrivalTime || ''} onChange={e => setForm({...form, arrivalTime: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]">
                      <option value="">Select</option>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening (6:00 PM - 10:00 PM)">Evening (6:00 PM - 10:00 PM)</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Purpose of Stay</label>
                    <select value={form.purpose || ''} onChange={e => setForm({...form, purpose: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]">
                      <option value="">Select</option>
                      <option value="Business">Business</option>
                      <option value="Leisure">Leisure</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment & Booking */}
              <div className="mb-8">
                <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Payment & Booking</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Payment Method</label>
                    <select value={form.paymentMethod || ''} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]">
                      <option value="">Select</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Discount Code</label>
                    <input type="text" value={form.discountCode || ''} onChange={e => setForm({...form, discountCode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="SAVE10" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Booking Reference</label>
                    <input type="text" value={form.bookingRef || ''} onChange={e => setForm({...form, bookingRef: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="BK123456ABCD" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Emergency Contact Name</label>
                    <input type="text" value={form.emergencyName || ''} onChange={e => setForm({...form, emergencyName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="John Doe" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Emergency Contact Phone</label>
                    <input type="text" value={form.emergencyPhone || ''} onChange={e => setForm({...form, emergencyPhone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="987654321" />
                  </div>
                </div>
              </div>

              {/* Section 4: Additional Details */}
              <div className="mb-8">
                <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Address</label>
                    <input type="text" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="101, Elanxa, New Yourk" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Special Requests</label>
                    <input type="text" value={form.specialRequests || ''} onChange={e => setForm({...form, specialRequests: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="Non-smoking room, late check-in" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Upload or drag and drop file here</label>
                    <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-md bg-white text-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <p className="text-[13px] text-gray-500 mb-2">No file chosen</p>
                      <input type="file" className="text-[12px] text-gray-500" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[12px] text-gray-600 font-medium mb-1">Note</label>
                    <textarea rows="3" value={form.note || ''} onChange={e => setForm({...form, note: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-[13px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)]" placeholder="test commit fields"></textarea>
                  </div>
                </div>
              </div>

            </form>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-5 py-2 rounded text-[13.5px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSaveBooking} className="px-5 py-2 rounded text-[13.5px] font-bold text-white bg-[var(--primary-main)] hover:bg-green-700 transition-colors">
                Save Changes
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
              <button onClick={handleDelete} className="px-2 py-2 rounded-full bg-[#c23e3e] hover:bg-red-700 text-white font-bold text-[14px] transition-colors shadow-sm">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-2 py-2 rounded-full bg-[#0a6c32] hover:bg-green-800 text-white font-bold text-[14px] transition-colors shadow-sm">
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



