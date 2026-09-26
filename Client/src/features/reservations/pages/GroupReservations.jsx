import React, { useState } from 'react';
import { Popover } from '@mui/material';
import {
  Search, AddCircleOutlined, Refresh,
  TableChart, PictureAsPdf
} from '@mui/icons-material';

import { initialGroups } from '../data/groupReservationsDemoData';
import GroupReservationsTable from '../components/GroupReservationsTable';
import GroupReservationModal from '../components/GroupReservationModal';

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
      <GroupReservationsTable
        filteredGroups={filteredGroups}
        openViewModal={openViewModal}
        openEditModal={openEditModal}
        confirmDelete={confirmDelete}
      />

      {/* Modals */}
      <GroupReservationModal
        isModalOpen={isModalOpen}
        editingId={editingId}
        form={form}
        setForm={setForm}
        setIsModalOpen={setIsModalOpen}
        handleSaveModal={handleSaveModal}
        isDeleteModalOpen={isDeleteModalOpen}
        groupToDelete={groupToDelete}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        handleDelete={handleDelete}
        isViewModalOpen={isViewModalOpen}
        viewingGroup={viewingGroup}
        setIsViewModalOpen={setIsViewModalOpen}
        openEditModal={openEditModal}
      />
    </div>
  );
}
