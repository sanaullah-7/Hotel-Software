import React, { useState, useRef, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import {
  Search, FilterList, AddCircleOutlined, Refresh,
  TableChart, PictureAsPdf, Close,
  EditOutlined, DeleteOutlined,
  CalendarTodayOutlined,
  Person,
  HotelOutlined,
  LocalOfferOutlined,
  CreditCardOutlined,
  MoneyOffOutlined
} from '@mui/icons-material';

const initialBookings = [
  { id: 1, firstName: 'John', lastName: 'Doe', avatar: 'https://i.pravatar.cc/150?img=11', package: 'All inclusive', roomType: 'Delux', status: 'Cancelled', checkIn: '02/10/2024', payment: 'Paid', cancellationDate: '02/05/2024', refundStatus: 'Processed', cancellationFee: '50.00', email: 'john.doe@email.com', mobile: '1234567890', reason: 'Changed travel plans' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', avatar: 'https://i.pravatar.cc/150?img=5', package: 'Breakfast incl...', roomType: 'Suite', status: 'Cancelled', checkIn: '03/05/2024', payment: 'Paid', cancellationDate: '03/01/2024', refundStatus: 'Pending', cancellationFee: '100.00', email: 'jane.smith@email.com', mobile: '1234567890', reason: '' },
  { id: 3, firstName: 'Alice', lastName: 'Johnson', avatar: 'https://i.pravatar.cc/150?img=12', package: 'Half board', roomType: 'Standard', status: 'Cancelled', checkIn: '04/01/2024', payment: 'Not Paid', cancellationDate: '03/28/2024', refundStatus: 'Cancelled', cancellationFee: '0.00', email: 'alice.j@email.com', mobile: '1234567890', reason: '' },
  { id: 4, firstName: 'Michael', lastName: 'Brown', avatar: 'https://i.pravatar.cc/150?img=33', package: 'Room only', roomType: 'Superior', status: 'Cancelled', checkIn: '05/12/2024', payment: 'Paid', cancellationDate: '05/08/2024', refundStatus: 'Processed', cancellationFee: '30.00', email: 'mbrown@email.com', mobile: '1234567890', reason: '' },
  { id: 5, firstName: 'Emily', lastName: 'White', avatar: 'https://i.pravatar.cc/150?img=44', package: 'Full board', roomType: 'Family', status: 'Cancelled', checkIn: '06/20/2024', payment: 'Paid', cancellationDate: '06/15/2024', refundStatus: 'Pending', cancellationFee: '70.00', email: 'ewhite@email.com', mobile: '1234567890', reason: '' },
];

const statusStyles = {
  Cancelled: 'bg-orange-100 text-orange-500'
};

const refundStyles = {
  Processed: 'bg-green-100 text-green-600',
  Pending: 'bg-orange-100 text-orange-500',
  Cancelled: 'bg-red-100 text-red-500'
};

export default function CancelledBookings() {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState('');
  
  // Columns Menu state
  const [visibleColumns, setVisibleColumns] = useState({
    'First Name': true, Package: true, 'Room Type': true, Status: true,
    'Check In': true, Payment: true, 'Cancellation Date': true,
    'Refund Status': true, 'Cancellation Fee': true, Actions: true
  });
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const filterMenuRef = useRef(null);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    firstName: '', lastName: '', package: 'All inclusive', roomType: 'Delux',
    status: 'Cancelled', cancellationDate: '', payment: 'Paid', refundStatus: 'Pending',
    email: '', mobile: '', reason: '', cancellationFee: '0.00'
  });

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
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
      'First Name': true, Package: true, 'Room Type': true, Status: true,
      'Check In': true, Payment: true, 'Cancellation Date': true,
      'Refund Status': true, 'Cancellation Fee': true, Actions: true
    });
  };

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\n';
    
    filteredBookings.forEach(b => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'First Name') val = b.firstName + ' ' + b.lastName;
        else if (col === 'Package') val = b.package;
        else if (col === 'Room Type') val = b.roomType;
        else if (col === 'Status') val = b.status;
        else if (col === 'Check In') val = b.checkIn;
        else if (col === 'Payment') val = b.payment;
        else if (col === 'Cancellation Date') val = b.cancellationDate;
        else if (col === 'Refund Status') val = b.refundStatus;
        else if (col === 'Cancellation Fee') val = b.cancellationFee;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cancelled_bookings.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = `
      <html>
        <head>
          <title>Cancelled Bookings</title>
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
          <h2>Cancelled Bookings Report</h2>
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
        if (col === 'First Name') val = b.firstName + ' ' + b.lastName;
        else if (col === 'Package') val = b.package;
        else if (col === 'Room Type') val = b.roomType;
        else if (col === 'Status') val = b.status;
        else if (col === 'Check In') val = b.checkIn;
        else if (col === 'Payment') val = b.payment;
        else if (col === 'Cancellation Date') val = b.cancellationDate;
        else if (col === 'Refund Status') val = b.refundStatus;
        else if (col === 'Cancellation Fee') val = b.cancellationFee;
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

  const filteredBookings = bookings.filter(b => 
    b.firstName.toLowerCase().includes(search.toLowerCase()) ||
    b.lastName.toLowerCase().includes(search.toLowerCase()) || 
    b.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm({
      firstName: '', lastName: '', package: 'All inclusive', roomType: 'Delux',
      status: 'Cancelled', cancellationDate: new Date().toISOString().split('T')[0], 
      payment: 'Paid', refundStatus: 'Pending', email: '', mobile: '', reason: '', cancellationFee: '0.00'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (booking) => {
    setEditingId(booking.id);
    setForm({
      firstName: booking.firstName,
      lastName: booking.lastName,
      package: booking.package,
      roomType: booking.roomType,
      status: booking.status,
      cancellationDate: booking.cancellationDate,
      payment: booking.payment,
      refundStatus: booking.refundStatus,
      email: booking.email,
      mobile: booking.mobile,
      reason: booking.reason || '',
      cancellationFee: booking.cancellationFee || '0.00'
    });
    setIsModalOpen(true);
  };
  
  const openViewModal = (booking) => {
    setViewingBooking(booking);
    setIsViewModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (editingId) {
      setBookings(bookings.map(b => b.id === editingId ? { ...b, ...form } : b));
    } else {
      setBookings([...bookings, { ...form, id: bookings.length + 1, avatar: 'https://i.pravatar.cc/150' }]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setBookings(bookings.filter(b => b.id !== bookingToDelete.id));
    setIsDeleteModalOpen(false);
    setBookingToDelete(null);
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      fontSize: '13px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '13px',
      color: '#64748b',
      '&.Mui-focused': { color: 'var(--primary-main)' }
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-1 min-h-screen">
      
      {/* Top Header */}
      <div className="bg-white rounded-[6px] p-2 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <h1 className="text-[16px] font-bold text-gray-700 whitespace-nowrap">Cancelled Bookings</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-10 py-1.5 border border-gray-200 rounded-md text-[13px] w-[200px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors"
            />
            <Search className="absolute right-2.5 top-2 text-gray-400" sx={{ fontSize: 18 }} />
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
          <button onClick={openNewModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Cancelled Booking">
            <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
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

      {/* Table Section */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                {visibleColumns['First Name'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">First Name</th>}
                {visibleColumns['Package'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Package</th>}
                {visibleColumns['Room Type'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Room Type</th>}
                {visibleColumns['Status'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Status</th>}
                {visibleColumns['Check In'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Check In</th>}
                {visibleColumns['Payment'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Payment</th>}
                {visibleColumns['Cancellation Date'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Cancellation Date</th>}
                {visibleColumns['Refund Status'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Refund Status</th>}
                {visibleColumns['Cancellation Fee'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Cancellation Fee</th>}
                {visibleColumns['Actions'] && <th className="py-4 px-2 text-[13px] font-bold text-[#1e293b]">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} onClick={() => openViewModal(booking)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                  {visibleColumns['First Name'] && (
                    <td className="py-3 px-2 flex items-center gap-3">
                      <img src={booking.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                      <span className="text-[13px] text-gray-700 font-medium">{booking.firstName} {booking.lastName}</span>
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
                  {visibleColumns['Payment'] && (
                    <td className="py-3 px-2 text-[13px] text-gray-600 font-medium">
                      {booking.payment}
                    </td>
                  )}
                  {visibleColumns['Cancellation Date'] && (
                    <td className="py-3 px-2 text-[13px] text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarTodayOutlined sx={{ fontSize: 14 }} className="text-gray-400" />
                        {booking.cancellationDate}
                      </div>
                    </td>
                  )}
                  {visibleColumns['Refund Status'] && (
                    <td className="py-3 px-2">
                      <span className={`px-3 py-1 rounded-[4px] text-[11px] font-bold ${refundStyles[booking.refundStatus]}`}>
                        {booking.refundStatus}
                      </span>
                    </td>
                  )}
                  {visibleColumns['Cancellation Fee'] && <td className="py-3 px-2 text-[13px] text-gray-600">{booking.cancellationFee}</td>}
                  {visibleColumns['Actions'] && (
                    <td className="py-3 px-2 relative">
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(booking); }} className="text-[var(--primary-main)] hover:text-green-700 transition-colors" title="Edit">
                          <EditOutlined sx={{ fontSize: 18 }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); confirmDelete(booking); }} className="text-orange-500 hover:text-orange-600 transition-colors" title="Delete">
                          <DeleteOutlined sx={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-gray-500 text-sm">
                    No cancelled bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="flex items-center justify-end px-2 py-4 border-t border-gray-100 bg-white gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500">Items per page:</span>
            <select className="border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-700 outline-none">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <span className="text-[12px] text-gray-500">1 - {filteredBookings.length} of {filteredBookings.length}</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50">&lt;</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50">&gt;</button>
          </div>
        </div>
      </div>

      {/* Edit/New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[750px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {editingId ? (
                  <img src={bookings.find(b=>b.id===editingId)?.avatar || 'https://i.pravatar.cc/150'} alt="guest" className="w-8 h-8 rounded-full border border-white" />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-white bg-[var(--primary-main)] brightness-110 flex items-center justify-center text-white">
                    <Person sx={{ fontSize: 20 }} />
                  </div>
                )}
                <h2 className="text-white text-[17px] font-bold">{editingId ? form.firstName + ' ' + form.lastName : 'New Cancelled Booking'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
                <TextField required label="First Name" name="firstName" value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required label="Last Name" name="lastName" value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Package*</InputLabel>
                  <Select name="package" value={form.package} label="Package*" onChange={(e)=>setForm({...form, package: e.target.value})}>
                    <MenuItem value="All inclusive">All inclusive</MenuItem>
                    <MenuItem value="Breakfast incl...">Breakfast incl...</MenuItem>
                    <MenuItem value="Half board">Half board</MenuItem>
                    <MenuItem value="Full board">Full board</MenuItem>
                    <MenuItem value="Room only">Room only</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Room Type*</InputLabel>
                  <Select name="roomType" value={form.roomType} label="Room Type*" onChange={(e)=>setForm({...form, roomType: e.target.value})}>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Delux">Delux</MenuItem>
                    <MenuItem value="Superior">Superior</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
                    <MenuItem value="Family">Family</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select name="status" value={form.status} label="Status*" onChange={(e)=>setForm({...form, status: e.target.value})}>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>

                <TextField required type="date" label="Cancellation Date" name="cancellationDate" value={form.cancellationDate} onChange={(e)=>setForm({...form, cancellationDate: e.target.value})} sx={muiInputSx} size="small" fullWidth InputLabelProps={{ shrink: true }} />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Payment*</InputLabel>
                  <Select name="payment" value={form.payment} label="Payment*" onChange={(e)=>setForm({...form, payment: e.target.value})}>
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Refund Status*</InputLabel>
                  <Select name="refundStatus" value={form.refundStatus} label="Refund Status*" onChange={(e)=>setForm({...form, refundStatus: e.target.value})}>
                    <MenuItem value="Processed">Processed</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>

                <TextField required label="Email" type="email" name="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required label="Mobile" name="mobile" value={form.mobile} onChange={(e)=>setForm({...form, mobile: e.target.value})} sx={muiInputSx} size="small" fullWidth />

                <div className="col-span-1 md:col-span-2 mt-2">
                  <TextField label="Reason" name="reason" value={form.reason} onChange={(e)=>setForm({...form, reason: e.target.value})} sx={muiInputSx} size="small" fullWidth multiline rows={3} />
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <button type="submit" disabled={!form.firstName || !form.lastName || !form.email || !form.mobile} className="px-2 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Save
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-2 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] p-6 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-left">Are you sure?</h3>
            <div className="text-left space-y-3 mb-8">
              <p className="text-sm text-gray-600 font-medium">Name: <span className="text-gray-800">{bookingToDelete.firstName} {bookingToDelete.lastName}</span></p>
              <p className="text-sm text-gray-600 font-medium">Email: <span className="text-gray-800">{bookingToDelete.email}</span></p>
              <p className="text-sm text-gray-600 font-medium">Mobile: <span className="text-gray-800">{bookingToDelete.mobile}</span></p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button onClick={handleDelete} className="px-2 py-2.5 rounded-full bg-[#c0392b] text-white font-bold text-sm hover:bg-[#a93226] transition-colors cursor-pointer">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-2 py-2.5 rounded-full bg-[#1b7f43] text-white font-bold text-sm hover:bg-[#156736] transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[var(--primary-main)] px-2 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={viewingBooking.avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-white object-cover" />
                <div className="flex flex-col">
                  <h2 className="text-white text-[20px] font-bold leading-tight">{viewingBooking.firstName} {viewingBooking.lastName}</h2>
                  <span className="text-white/80 text-[13px]">{viewingBooking.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewingBooking); }} 
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Edit"
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
                
                {/* Room Type */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <HotelOutlined sx={{ fontSize: 20 }} />
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
                
                {/* Payment */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CreditCardOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Payment</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingBooking.payment}</span>
                  </div>
                </div>

                {/* Cancellation Date */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarTodayOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Cancellation Date</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingBooking.cancellationDate}</span>
                  </div>
                </div>
                
                {/* Refund Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <LocalOfferOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Refund Status</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${refundStyles[viewingBooking.refundStatus]}`}>
                      {viewingBooking.refundStatus}
                    </span>
                  </div>
                </div>

                {/* Cancellation Fee */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <MoneyOffOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Cancellation Fee</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingBooking.cancellationFee}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
