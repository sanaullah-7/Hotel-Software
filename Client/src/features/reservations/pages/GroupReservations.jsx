import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Box, Typography, Popover } from '@mui/material';
import {
  Search, AddCircleOutlined, Refresh,
  TableChart, PictureAsPdf, Close,
  EditOutlined, DeleteOutlined,
  CalendarTodayOutlined, PhoneOutlined, EmailOutlined,
  BusinessOutlined, PersonOutlined, MeetingRoomOutlined,
  GroupsOutlined, LocalOfferOutlined, AttachMoneyOutlined
} from '@mui/icons-material';

const initialGroups = [
  { id: 1, groupName: 'Corporate Conference', contactPerson: 'John Smith', email: 'john.smith@company.com', phone: '1234567890', checkIn: '02/15/2024', checkOut: '02/20/2024', rooms: 15, guests: 30, status: 'Confirmed', totalPrice: '15000', roomTypes: '', specialRequests: 'Meeting room required, early check-in' },
  { id: 2, groupName: 'Wedding Party', contactPerson: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '9987654321', checkIn: '03/10/2024', checkOut: '03/12/2024', rooms: 8, guests: 20, status: 'Pending', totalPrice: '8000', roomTypes: '', specialRequests: '' },
  { id: 3, groupName: 'Family Reunion', contactPerson: 'Robert Davis', email: 'robert.davis@email.com', phone: '1122334455', checkIn: '04/05/2024', checkOut: '04/08/2024', rooms: 5, guests: 12, status: 'Confirmed', totalPrice: '4500', roomTypes: '', specialRequests: '' },
  { id: 4, groupName: 'Business Trip', contactPerson: 'Emily Chen', email: 'emily.chen@email.com', phone: '2233445566', checkIn: '02/25/2024', checkOut: '03/02/2024', rooms: 3, guests: 3, status: 'Confirmed', totalPrice: '2100', roomTypes: '', specialRequests: '' },
  { id: 5, groupName: 'Graduation Celebration', contactPerson: 'Michael Wilson', email: 'michael.wilson@email.com', phone: '3344556677', checkIn: '05/15/2024', checkOut: '05/18/2024', rooms: 6, guests: 15, status: 'Pending', totalPrice: '3600', roomTypes: '', specialRequests: '' },
  { id: 6, groupName: 'Anniversary Trip', contactPerson: 'Jennifer Brown', email: 'jennifer.brown@email.com', phone: '4455667788', checkIn: '06/10/2024', checkOut: '06/15/2024', rooms: 2, guests: 2, status: 'Confirmed', totalPrice: '3200', roomTypes: '', specialRequests: '' },
  { id: 7, groupName: 'Team Building', contactPerson: 'David Taylor', email: 'david.taylor@email.com', phone: '5566778899', checkIn: '03/20/2024', checkOut: '03/24/2024', rooms: 10, guests: 20, status: 'Confirmed', totalPrice: '6800', roomTypes: '', specialRequests: '' },
  { id: 8, groupName: 'Music Festival', contactPerson: 'Lisa Anderson', email: 'lisa.anderson@email.com', phone: '6677889900', checkIn: '07/01/2024', checkOut: '07/05/2024', rooms: 12, guests: 24, status: 'Pending', totalPrice: '7200', roomTypes: '', specialRequests: '' },
  { id: 9, groupName: 'Educational Tour', contactPerson: 'Thomas Moore', email: 'thomas.moore@email.com', phone: '7788990011', checkIn: '04/22/2024', checkOut: '04/28/2024', rooms: 20, guests: 40, status: 'Confirmed', totalPrice: '12000', roomTypes: '', specialRequests: '' },
  { id: 10, groupName: 'Retreat Workshop', contactPerson: 'Amanda White', email: 'amanda.white@email.com', phone: '8899001122', checkIn: '05/01/2024', checkOut: '05/05/2024', rooms: 7, guests: 14, status: 'Pending', totalPrice: '5600', roomTypes: '', specialRequests: '' },
];

const statusStyles = {
  Confirmed: 'bg-[#e5f4eb] text-[#1b7f43]',
  Pending: 'bg-orange-100 text-orange-500'
};

export default function GroupReservations() {
  const [groups, setGroups] = useState(initialGroups);
  const [search, setSearch] = useState('');
  
  // Date filter state
  const [dateFilter, setDateFilter] = useState('Daily');
  const [customAnchorEl, setCustomAnchorEl] = useState(null);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingGroup, setViewingGroup] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    groupName: '', contactPerson: '', email: '', phone: '',
    checkIn: '', checkOut: '', rooms: 0, guests: 0,
    roomTypes: '', status: 'Pending', totalPrice: 0, specialRequests: ''
  });

  const getRecordDate = (res) => {
    const str = res.checkIn;
    if (!str) return null;
    if (str.includes('/')) {
      const [m, d, y] = str.split('/');
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    if (str.includes('-')) {
      const parts = str.split('T')[0].split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  const maxDatasetTime = Math.max(...groups.map(r => getRecordDate(r)?.getTime() || 0));
  const anchorDate = new Date(maxDatasetTime > 0 ? maxDatasetTime : Date.now());

  const filterByDate = (res) => {
    if (!dateFilter || dateFilter === 'All') return true;
    const recDate = getRecordDate(res);
    if (!recDate) return true;

    if (dateFilter === 'Daily') {
      const now = new Date();
      const isToday = recDate.getFullYear() === now.getFullYear() &&
                      recDate.getMonth() === now.getMonth() &&
                      recDate.getDate() === now.getDate();
      const isAnchorDay = recDate.getFullYear() === anchorDate.getFullYear() &&
                          recDate.getMonth() === anchorDate.getMonth() &&
                          recDate.getDate() === anchorDate.getDate();
      return isToday || isAnchorDay;
    }

    if (dateFilter === 'Weekly') {
      const now = new Date();
      const diffAnchor = Math.abs(anchorDate.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24);
      const diffNow = Math.abs(now.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffAnchor <= 7 || diffNow <= 7;
    }

    if (dateFilter === 'Monthly') {
      const now = new Date();
      const isAnchorMonth = recDate.getFullYear() === anchorDate.getFullYear() &&
                            recDate.getMonth() === anchorDate.getMonth();
      const isNowMonth = recDate.getFullYear() === now.getFullYear() &&
                          recDate.getMonth() === now.getMonth();
      return isAnchorMonth || isNowMonth;
    }

    if (dateFilter === 'Yearly') {
      const now = new Date();
      return recDate.getFullYear() === anchorDate.getFullYear() || recDate.getFullYear() === now.getFullYear();
    }

    if (dateFilter === 'Custom') {
      if (!customStartDate && !customEndDate) return true;
      const recTime = recDate.getTime();
      if (customStartDate) {
        const start = new Date(customStartDate + 'T00:00:00').getTime();
        if (recTime < start) return false;
      }
      if (customEndDate) {
        const end = new Date(customEndDate + 'T23:59:59').getTime();
        if (recTime > end) return false;
      }
      return true;
    }

    return true;
  };

  const handleRefresh = () => {
    setSearch('');
    setDateFilter('Daily');
    setCustomStartDate('');
    setCustomEndDate('');
    setGroups(initialGroups);
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = 
      g.groupName.toLowerCase().includes(search.toLowerCase()) || 
      g.contactPerson.toLowerCase().includes(search.toLowerCase()) || 
      g.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && filterByDate(g);
  });

  const handleExportCSV = () => {
    const cols = ['Group Name', 'Contact Person', 'Email', 'Phone', 'Check In', 'Check Out', 'Rooms', 'Guests', 'Status', 'Total Price'];
    let csvContent = cols.join(',') + '\n';
    
    filteredGroups.forEach(g => {
      const row = [
        `"${(g.groupName || '').replace(/"/g, '""')}"`,
        `"${(g.contactPerson || '').replace(/"/g, '""')}"`,
        `"${(g.email || '').replace(/"/g, '""')}"`,
        `"${(g.phone || '').replace(/"/g, '""')}"`,
        `"${(g.checkIn || '').replace(/"/g, '""')}"`,
        `"${(g.checkOut || '').replace(/"/g, '""')}"`,
        `"${g.rooms ?? ''}"`,
        `"${g.guests ?? ''}"`,
        `"${(g.status || '').replace(/"/g, '""')}"`,
        `"${(g.totalPrice || '').toString().replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'group_reservations.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const cols = ['Group Name', 'Contact Person', 'Email', 'Phone', 'Check In', 'Check Out', 'Rooms', 'Guests', 'Status', 'Total Price'];
    let html = `
    <html>
    <head>
      <title>Group Reservations</title>
      <style>
        body { font-family: sans-serif; padding: 20px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
        th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
        h2 { color: #0f172a; margin-bottom: 5px; }
        .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h2>Group Reservations Report</h2>
      <div class="meta">Filter: ${dateFilter} | Generated on: ${new Date().toLocaleDateString()}</div>
      <table>
        <thead>
          <tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>`;
        
    filteredGroups.forEach(g => {
      html += `<tr>
        <td>${g.groupName || ''}</td>
        <td>${g.contactPerson || ''}</td>
        <td>${g.email || ''}</td>
        <td>${g.phone || ''}</td>
        <td>${g.checkIn || ''}</td>
        <td>${g.checkOut || ''}</td>
        <td>${g.rooms ?? ''}</td>
        <td>${g.guests ?? ''}</td>
        <td>${g.status || ''}</td>
        <td>$${Number(g.totalPrice || 0).toLocaleString()}</td>
      </tr>`;
    });
    
    html += `
        </tbody>
      </table>
      <script>
        window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
      </script>
    </body>
    </html>`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const openNewModal = () => {
    setEditingId(null);
    setForm({
      groupName: '', contactPerson: '', email: '', phone: '',
      checkIn: new Date().toISOString().split('T')[0], 
      checkOut: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      rooms: 1, guests: 2, roomTypes: 'Standard', status: 'Pending', totalPrice: 500, specialRequests: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (group) => {
    setEditingId(group.id);
    setForm({
      groupName: group.groupName,
      contactPerson: group.contactPerson,
      email: group.email,
      phone: group.phone,
      checkIn: group.checkIn,
      checkOut: group.checkOut,
      rooms: group.rooms,
      guests: group.guests,
      roomTypes: group.roomTypes || '',
      status: group.status,
      totalPrice: group.totalPrice,
      specialRequests: group.specialRequests || ''
    });
    setIsModalOpen(true);
  };
  
  const openViewModal = (group) => {
    setViewingGroup(group);
    setIsViewModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (editingId) {
      setGroups(groups.map(g => g.id === editingId ? { ...g, ...form } : g));
    } else {
      setGroups([...groups, { ...form, id: groups.length + 1 }]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setGroups(groups.filter(g => g.id !== groupToDelete.id));
    setIsDeleteModalOpen(false);
    setGroupToDelete(null);
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
    <div className="w-full flex flex-col pt-1">
      
      {/* Top Header */}
      <div className="bg-white rounded-[6px] p-2 flex flex-col xl:flex-row xl:items-center justify-between border-b border-gray-100 gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[16px] font-bold text-gray-700 whitespace-nowrap">Group Booking</h1>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-3 pr-10 py-1.5 border border-gray-200 rounded-md text-[13px] w-[180px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors"
            />
            <Search className="absolute right-2.5 top-2 text-gray-400" sx={{ fontSize: 18 }} />
          </div>

          {/* Daily / Weekly / Monthly Date Filter */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map((filter) => (
              <button
                key={filter}
                onClick={(e) => {
                  if (filter === 'Custom') {
                    setDateFilter('Custom');
                    setCustomAnchorEl(e.currentTarget);
                  } else {
                    setDateFilter(filter);
                    setCustomAnchorEl(null);
                  }
                }}
                className={`px-3 py-1.5 text-[12px] md:text-[13px] font-medium transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
                  dateFilter === filter
                    ? 'bg-[#e5f4eb] text-[#1b7f43] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filter}
              </button>
            ))}
            <Popover
              open={Boolean(customAnchorEl)}
              anchorEl={customAnchorEl}
              onClose={() => setCustomAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <div className="p-4 w-[280px]">
                <h3 className="font-bold text-gray-700 text-sm mb-3">Custom Date Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 text-gray-700 focus:outline-none focus:border-[#1b7f43]"
                    />
                  </div>
                  <div className="text-center text-gray-400 font-semibold text-xs">TO</div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 text-gray-700 focus:outline-none focus:border-[#1b7f43]"
                    />
                  </div>
                </div>
              </div>
            </Popover>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={openNewModal} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Group Booking">
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
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Group Name</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Contact Person</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Email</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Phone</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Check In</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Check Out</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap text-center">Rooms</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap text-center">Guests</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Status</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap">Total Price</th>
              <th className="py-2.5 px-2 text-[11.5px] font-bold text-[#1e293b] whitespace-nowrap text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <tr key={group.id} onClick={() => openViewModal(group)} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                <td className="py-2 px-2 text-[12px] font-semibold text-gray-800 whitespace-nowrap">
                  {group.groupName}
                </td>
                <td className="py-2 px-2 text-[12px] text-gray-700 whitespace-nowrap">
                  {group.contactPerson}
                </td>
                <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <EmailOutlined sx={{ fontSize: 13 }} className="text-[#ef4444] shrink-0" />
                    <span>{group.email}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <PhoneOutlined sx={{ fontSize: 13 }} className="text-[var(--primary-main)] shrink-0" />
                    <span>{group.phone}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap">
                  {group.checkIn}
                </td>
                <td className="py-2 px-2 text-[11.5px] text-gray-600 whitespace-nowrap">
                  {group.checkOut}
                </td>
                <td className="py-2 px-2 text-[12px] text-gray-700 whitespace-nowrap text-center">
                  {group.rooms}
                </td>
                <td className="py-2 px-2 text-[12px] text-gray-700 whitespace-nowrap text-center">
                  {group.guests}
                </td>
                <td className="py-2 px-2 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10.5px] font-bold inline-block ${statusStyles[group.status]}`}>
                    {group.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-[12px] font-semibold text-gray-800 whitespace-nowrap">
                  ${Number(group.totalPrice).toLocaleString()}
                </td>
                <td className="py-2 px-2 relative whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(group); }} className="text-[var(--primary-main)] hover:text-green-700 transition-colors cursor-pointer" title="Edit">
                      <EditOutlined sx={{ fontSize: 16 }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(group); }} className="text-orange-500 hover:text-orange-600 transition-colors cursor-pointer" title="Delete">
                      <DeleteOutlined sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredGroups.length === 0 && (
              <tr>
                <td colSpan="11" className="py-8 text-center text-gray-500 text-sm">
                  No group reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="flex items-center justify-end px-2 py-4 border-t border-gray-100 bg-white gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-500">Items per page:</span>
            <select className="border border-gray-200 rounded px-2 py-1 text-[12px] text-gray-700 outline-none cursor-pointer">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          <span className="text-[12px] text-gray-500">1 - {filteredGroups.length} of {filteredGroups.length}</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">&lt;</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">&gt;</button>
          </div>
        </div>
      </div>

      {/* Edit/New Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[17px] font-bold">
                {editingId ? `Edit Group Reservation ${form.groupName}` : 'New Group Reservation'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
                <TextField required label="Group Name" name="groupName" value={form.groupName} onChange={(e)=>setForm({...form, groupName: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={(e)=>setForm({...form, contactPerson: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                
                <TextField required label="Email" type="email" name="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required label="Phone" name="phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} sx={muiInputSx} size="small" fullWidth />

                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    Check In Date
                  </Typography>
                  <TextField
                    required
                    type="date"
                    label=""
                    name="checkIn"
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    sx={muiInputSx}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
                    Check Out Date
                  </Typography>
                  <TextField
                    required
                    type="date"
                    label=""
                    name="checkOut"
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    sx={muiInputSx}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <TextField required type="number" label="Number of Rooms" name="rooms" value={form.rooms} onChange={(e)=>setForm({...form, rooms: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                <TextField required type="number" label="Number of Guests" name="guests" value={form.guests} onChange={(e)=>setForm({...form, guests: e.target.value})} sx={muiInputSx} size="small" fullWidth />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Room Types</InputLabel>
                  <Select name="roomTypes" value={form.roomTypes} label="Room Types" onChange={(e)=>setForm({...form, roomTypes: e.target.value})}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Delux">Delux</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select name="status" value={form.status} label="Status*" onChange={(e)=>setForm({...form, status: e.target.value})}>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                  </Select>
                </FormControl>

                <TextField label="Total Price" type="number" name="totalPrice" value={form.totalPrice} onChange={(e)=>setForm({...form, totalPrice: e.target.value})} sx={muiInputSx} size="small" fullWidth />
                
                <TextField label="Special Requests" name="specialRequests" value={form.specialRequests} onChange={(e)=>setForm({...form, specialRequests: e.target.value})} sx={muiInputSx} size="small" fullWidth multiline rows={2} />
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <button type="submit" disabled={!form.groupName || !form.contactPerson} className="px-5 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Save
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[360px] p-6 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-left">Are you sure?</h3>
            <div className="text-left space-y-3 mb-8">
              <p className="text-sm text-gray-600 font-medium grid grid-cols-[100px_1fr]"><span className="text-gray-500">Group Name:</span> <span className="text-gray-800">{groupToDelete.groupName}</span></p>
              <p className="text-sm text-gray-600 font-medium grid grid-cols-[100px_1fr]"><span className="text-gray-500">Contact Person:</span> <span className="text-gray-800">{groupToDelete.contactPerson}</span></p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button onClick={handleDelete} className="px-5 py-2.5 rounded-full bg-[#c0392b] text-white font-bold text-sm hover:bg-[#a93226] transition-colors cursor-pointer">
                Delete
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-5 py-2.5 rounded-full bg-[#1b7f43] text-white font-bold text-sm hover:bg-[#156736] transition-colors cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsViewModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-[var(--primary-main)] px-5 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-transparent flex items-center justify-center text-white text-xl font-bold">
                  {viewingGroup.groupName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white text-[20px] font-bold leading-tight">Group Reservations</h2>
                  <span className="text-white/80 text-[13px]">{viewingGroup.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(viewingGroup); }} 
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
                
                {/* Group Name */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <BusinessOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Group Name</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.groupName}</span>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <PersonOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Contact Person</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.contactPerson}</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <EmailOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.email}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <PhoneOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Phone</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.phone}</span>
                  </div>
                </div>

                {/* Check In */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarTodayOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check In</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.checkIn}</span>
                  </div>
                </div>

                {/* Check Out */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <CalendarTodayOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Check Out</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.checkOut}</span>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <MeetingRoomOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Rooms</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.rooms}</span>
                  </div>
                </div>

                {/* Guests */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <GroupsOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Guests</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.guests}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <LocalOfferOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Status</span>
                    <span className={`px-2 py-0.5 rounded-[4px] text-[12px] font-bold mt-0.5 ${statusStyles[viewingGroup.status]}`}>
                      {viewingGroup.status}
                    </span>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-full bg-[#e5f4eb] text-[var(--primary-main)] flex items-center justify-center shrink-0">
                    <AttachMoneyOutlined sx={{ fontSize: 20 }} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Price</span>
                    <span className="text-[14px] font-bold text-gray-800">{viewingGroup.totalPrice}</span>
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
