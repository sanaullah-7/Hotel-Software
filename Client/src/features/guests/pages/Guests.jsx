import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon,
  Search,
  EmailOutlined,
  PhoneOutlined,
  EditOutlined,
  ChevronLeft,
  ChevronRight,
  TableChart,
  Refresh,
  Close
} from '@mui/icons-material';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getGuests, updateGuest, GUESTS_UPDATED_EVENT, RESERVATIONS_UPDATED_EVENT } from '../state/guestStore';
import { getReservations } from '../../reservations/state/reservationStore';

export default function Guests() {
  const navigate = useNavigate();
  const [allGuests, setAllGuests] = useState(getGuests());
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustomPopupOpen, setIsCustomPopupOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    totalStays: 0,
    status: 'Active'
  });

  useEffect(() => {
    const syncGuests = () => setAllGuests(getGuests());
    window.addEventListener(GUESTS_UPDATED_EVENT, syncGuests);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, syncGuests);
    window.addEventListener('storage', syncGuests);
    return () => {
      window.removeEventListener(GUESTS_UPDATED_EVENT, syncGuests);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, syncGuests);
      window.removeEventListener('storage', syncGuests);
    };
  }, []);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const [m, d, y] = dateStr.split('/');
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    if (dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split(' ')[0].split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const getGuestDate = (guest) => {
    if (guest.checkIn) return parseDate(guest.checkIn);
    if (guest.createdAt) return parseDate(guest.createdAt);
    const reservations = getReservations();
    const res = reservations.find(r => 
      (guest.email && r.email && r.email.toLowerCase() === guest.email.toLowerCase()) ||
      (guest.name && r.name && r.name.toLowerCase() === guest.name.toLowerCase()) ||
      `GST-${r.id}`.toLowerCase() === String(guest.id).toLowerCase() ||
      String(r.id) === String(guest.id)
    );
    if (res?.checkIn) return parseDate(res.checkIn);
    return null;
  };

  const allGuestDates = allGuests.map(g => getGuestDate(g)?.getTime()).filter(Boolean);
  const maxDatasetTime = allGuestDates.length > 0 ? Math.max(...allGuestDates) : Date.now();
  const anchorDate = new Date(maxDatasetTime);

  const filterByDate = (guest) => {
    if (!dateFilter || dateFilter === 'All') return true;
    const recDate = getGuestDate(guest);
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

  const filteredGuests = allGuests.filter(g => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (g.id && g.id.toLowerCase().includes(query)) ||
      (g.name && g.name.toLowerCase().includes(query)) ||
      (g.email && g.email.toLowerCase().includes(query)) ||
      (g.phone && g.phone.toLowerCase().includes(query)) ||
      (g.city && g.city.toLowerCase().includes(query));
    return matchesSearch && filterByDate(g);
  });

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage) || 1;
  const currentGuests = filteredGuests.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleRefresh = () => {
    setSearchQuery('');
    setDateFilter('Daily');
    setCustomStartDate('');
    setCustomEndDate('');
    setPage(1);
    setAllGuests(getGuests());
  };

  const handleExportCSV = () => {
    const headers = ['Guest ID', 'Full Name', 'Email', 'Phone', 'City', 'Total Stays', 'Status'];
    const rows = [headers.join(',')];
    filteredGuests.forEach(g => {
      rows.push([
        `"${(g.id || '').replace(/"/g, '""')}"`,
        `"${(g.name || '').replace(/"/g, '""')}"`,
        `"${(g.email || '').replace(/"/g, '""')}"`,
        `"${(g.phone || '').replace(/"/g, '""')}"`,
        `"${(g.city || '').replace(/"/g, '""')}"`,
        `"${g.totalStays ?? 0}"`,
        `"${(g.status || '').replace(/"/g, '""')}"`
      ].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Guests.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openEditModal = (guest) => {
    setEditingGuest(guest);
    setEditForm({
      name: guest.name || '',
      email: guest.email || '',
      phone: guest.phone || '',
      city: guest.city || '',
      totalStays: guest.totalStays || 0,
      status: guest.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingGuest) {
      updateGuest(editingGuest.id, {
        ...editForm,
        totalStays: Number(editForm.totalStays) || 0
      });
      setAllGuests(getGuests());
    }
    setIsEditModalOpen(false);
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
    <div className="w-full flex flex-col pt-[2px] animate-fade-in pb-8">
      {/* MAIN CARD */}
      <div className="bg-white rounded-[6px] shadow-sm border border-gray-100 flex flex-col w-full overflow-hidden">
        {/* Card Header */}
        <div className="p-2 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-[16px] font-bold text-gray-700 whitespace-nowrap">
              Guests
            </h2>
            
            {/* Search Bar */}
            <div className="relative w-40 xl:w-56">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" sx={{ fontSize: 18 }} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-md text-[13px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow bg-gray-50/50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Filters with Custom Popup Wrapper */}
            <div className="relative shrink-0 flex items-center">
              <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
                {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      if (tab === 'Custom') {
                        if (dateFilter === 'Custom') {
                          setIsCustomPopupOpen(!isCustomPopupOpen);
                        } else {
                          setDateFilter(tab);
                          setIsCustomPopupOpen(true);
                        }
                      } else {
                        setDateFilter(tab);
                        setIsCustomPopupOpen(false);
                      }
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 text-[12px] md:text-[13px] font-medium transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
                      dateFilter === tab 
                        ? 'bg-[#e5f4eb] text-[#1b7f43] font-bold' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Floating Custom Date Picker Popup */}
              {dateFilter === 'Custom' && isCustomPopupOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 rounded-xl p-3 flex flex-col gap-2 min-w-[200px] animate-fade-in">
                  <p className="text-[13px] font-bold text-gray-700">Custom Date Range</p>
                  <div className="flex flex-col gap-1.5">
                    <input 
                      type="date" 
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[13px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={customStartDate}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomStartDate(val);
                        setPage(1);
                        if (val && customEndDate) {
                          setTimeout(() => setIsCustomPopupOpen(false), 150);
                        }
                      }}
                    />
                    <span className="text-gray-400 text-[11px] font-bold text-center">TO</span>
                    <input 
                      type="date" 
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-[13px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
                      value={customEndDate}
                      onChange={e => {
                        const val = e.target.value;
                        setCustomEndDate(val);
                        setPage(1);
                        if (customStartDate && val) {
                          setTimeout(() => setIsCustomPopupOpen(false), 150);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button 
              onClick={handleRefresh} 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" 
              title="Refresh"
            >
              <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>

            {/* CSV Export Icon Button */}
            <button 
              onClick={handleExportCSV} 
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" 
              title="Export CSV"
            >
              <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Guest ID</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Full Name</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Email</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Phone</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">City</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700 text-center">Total Stays</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700">Status</th>
                <th className="py-4 px-4 text-[13px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentGuests.map((guest) => (
                <tr 
                  key={guest.id} 
                  onClick={() => navigate(`/guests/${guest.id}`)}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  title="Click anywhere on the row to view Guest Profile"
                >
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium">{guest.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img src={guest.avatar} alt={guest.name} className="w-8 h-8 rounded-full object-cover mr-3 bg-gray-200 shrink-0" />
                      <Link 
                        to={`/guests/${guest.id}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="text-[13px] font-bold text-gray-800 hover:text-[#1b7f43] hover:underline transition-colors" 
                        title="View Guest Profile"
                      >
                        {guest.name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-[13px] text-gray-600 font-medium">
                      <EmailOutlined className="text-red-500 mr-2 shrink-0" sx={{ fontSize: 16 }} />
                      <span className="truncate max-w-[180px]">{guest.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-[13px] text-gray-600 font-medium whitespace-nowrap">
                      <PhoneOutlined className="text-green-500 mr-2 shrink-0" sx={{ fontSize: 16 }} />
                      {guest.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium whitespace-nowrap">{guest.city}</td>
                  <td className="py-3 px-4 text-[13px] text-gray-600 font-medium text-center">{guest.totalStays}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-[11px] font-bold rounded-md bg-[#e5f4eb] text-[#1b7f43]">
                      {guest.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => openEditModal(guest)} 
                      className="text-[var(--primary-main)] hover:text-green-700 transition-colors p-1.5 rounded-lg hover:bg-[#e5f4eb] cursor-pointer"
                      title="Edit Guest"
                    >
                      <EditOutlined fontSize="small" sx={{ fontSize: 18 }} />
                    </button>
                  </td>
                </tr>
              ))}
              {currentGuests.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500 text-[14px]">No guests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-end space-x-6 text-gray-500 text-[13px]">
          <div className="flex items-center">
            <span className="mr-2 font-medium">Items per page:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-200 rounded px-2 py-1 outline-none font-medium text-gray-700 bg-white cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="font-medium">
            {filteredGuests.length === 0 ? '0 of 0' : `${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, filteredGuests.length)} of ${filteredGuests.length}`}
          </span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft fontSize="small" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Guest Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-white">
                Edit Guest: {editingGuest?.name}
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField 
                  required 
                  label="Full Name" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
                <TextField 
                  required 
                  type="email"
                  label="Email" 
                  value={editForm.email} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
                <TextField 
                  label="Phone" 
                  value={editForm.phone} 
                  onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
                <TextField 
                  label="City" 
                  value={editForm.city} 
                  onChange={e => setEditForm({...editForm, city: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
                <TextField 
                  type="number"
                  label="Total Stays" 
                  value={editForm.totalStays} 
                  onChange={e => setEditForm({...editForm, totalStays: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                />
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status</InputLabel>
                  <Select 
                    value={editForm.status} 
                    label="Status" 
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-full border border-green-200 bg-green-50 text-[var(--primary-main)] font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
