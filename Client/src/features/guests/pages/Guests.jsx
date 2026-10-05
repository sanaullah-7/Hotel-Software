import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon,
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
import { getGuests, resolveGuestForBooking, updateGuest, GUESTS_UPDATED_EVENT, RESERVATIONS_UPDATED_EVENT } from '../state/guestStore';
import { getReservations } from '../../reservations/state/reservationStore';
import SearchInput from '../../../components/common/SearchInput';

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
    const res = reservations.find((reservation) => String(resolveGuestForBooking(reservation)?.id || '') === String(guest.id));
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
      g.name.toLowerCase().includes(query) ||
      (g.email && g.email.toLowerCase().includes(query)) ||
      (g.phone && g.phone.toLowerCase().includes(query)) ||
      (g.city && g.city.toLowerCase().includes(query)) ||
      (g.id && String(g.id).toLowerCase().includes(query));

    const matchesDate = filterByDate(g);
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
  const currentGuests = filteredGuests.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleRefresh = () => {
    setAllGuests(getGuests());
    setSearchQuery('');
    setDateFilter('Daily');
    setCustomStartDate('');
    setCustomEndDate('');
    setPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Guest ID', 'Full Name', 'Email', 'Phone', 'City', 'Total Stays', 'Status'];
    const rows = filteredGuests.map(g => [
      g.id,
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.email || ''}"`,
      `"${g.phone || ''}"`,
      `"${g.city || ''}"`,
      g.totalStays || 0,
      g.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'guests_export.csv');
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
      fontSize: '11.5px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '12px',
      color: '#64748b',
      '&.Mui-focused': { color: 'var(--primary-main)' }
    }
  };

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">
      {/* MAIN CARD */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Card Header */}
        <div className="p-2 sm:p-2.5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h2 className="text-xs sm:text-sm font-bold text-gray-800 whitespace-nowrap">
              Guests
            </h2>
            
            {/* Search Bar */}
            <SearchInput
              placeholder="Search..."
              value={searchQuery}
              onChange={(value) => { setSearchQuery(value); setPage(1); }}
              iconPosition="left"
              size="sm"
              width="w-36 sm:w-48 xl:w-56"
              inputClassName="border-gray-200 text-xs py-1"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Date Filters with Custom Popup Wrapper */}
            <div className="relative shrink-0 flex items-center">
              <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
                {['Daily', 'Weekly', 'Monthly', 'Yearly', 'Custom'].map(tab => (
                  <button
                    key={tab}
                    type="button"
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
                    className={`px-2 py-1 text-[10px] sm:text-[10.5px] font-medium transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer ${
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
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white shadow-lg border border-gray-100 rounded-xl p-2.5 flex flex-col gap-1.5 min-w-[200px] animate-fade-in">
                  <p className="text-[11px] font-bold text-gray-700">Custom Date Range</p>
                  <div className="flex flex-col gap-1.5">
                    <input 
                      type="date" 
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-[10.5px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
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
                    <span className="text-gray-400 text-[9.5px] font-bold text-center">TO</span>
                    <input 
                      type="date" 
                      className="w-full px-2 py-1 border border-gray-200 rounded-md text-[10.5px] font-medium text-gray-600 focus:outline-none focus:border-[#1b7f43]"
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
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" 
              title="Refresh"
              aria-label="Refresh guests"
            >
              <Refresh sx={{ fontSize: 18 }} className="text-[var(--primary-main)]" />
            </button>

            {/* CSV Export Icon Button */}
            <button 
              onClick={handleExportCSV} 
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" 
              title="Export CSV"
              aria-label="Export CSV"
            >
              <TableChart sx={{ fontSize: 16 }} className="text-[#0ea5e9]" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full flex-1 overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Guest ID</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">City</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Total Stays</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-2 px-1.5 text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentGuests.map((guest) => (
                <tr 
                  key={guest.id} 
                  onClick={() => navigate(`/guests/${guest.id}`)}
                  className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                  title="Click anywhere on the row to view Guest Profile"
                >
                  <td className="py-1.5 px-1.5 text-[11px] font-bold text-gray-900 truncate">{guest.id}</td>
                  <td className="py-1.5 px-1.5">
                    <div className="flex items-center min-w-0">
                      <img src={guest.avatar} alt={guest.name} className="w-5.5 h-5.5 rounded-full object-cover mr-1.5 bg-gray-200 shrink-0 border border-gray-200" />
                      <Link 
                        to={`/guests/${guest.id}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] font-bold text-gray-800 hover:text-[#1b7f43] hover:underline transition-colors truncate" 
                        title="View Guest Profile"
                      >
                        {guest.name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-1.5 px-1.5">
                    <div className="flex items-center text-[11px] text-gray-600 min-w-0">
                      <EmailOutlined className="text-rose-500 mr-1 shrink-0" sx={{ fontSize: 13 }} />
                      <span className="truncate" title={guest.email}>{guest.email}</span>
                    </div>
                  </td>
                  <td className="py-1.5 px-1.5">
                    <div className="flex items-center text-[10.5px] text-gray-600 whitespace-nowrap">
                      <PhoneOutlined className="text-emerald-600 mr-1 shrink-0" sx={{ fontSize: 13 }} />
                      {guest.phone}
                    </div>
                  </td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate">{guest.city}</td>
                  <td className="py-1.5 px-1.5 text-[11px] text-gray-600 text-center font-semibold">{guest.totalStays}</td>
                  <td className="py-1.5 px-1.5 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#e5f4eb] text-[#1b7f43]">
                      {guest.status}
                    </span>
                  </td>
                  <td className="py-1.5 px-1.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => openEditModal(guest)} 
                      className="text-[var(--primary-main)] hover:text-green-700 transition-colors p-0.5 rounded-md hover:bg-[#e5f4eb] cursor-pointer"
                      title="Edit Guest"
                      aria-label="Edit guest"
                    >
                      <EditOutlined fontSize="small" sx={{ fontSize: 15 }} />
                    </button>
                  </td>
                </tr>
              ))}
              {currentGuests.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500 text-xs">No guests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 px-3 py-1.5 sm:py-2 border-t border-gray-100 bg-white text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>Items per page:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-200 rounded px-1.5 py-0.5 outline-none text-xs text-gray-700 bg-white cursor-pointer focus:border-[var(--primary-main)]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span>
            {filteredGuests.length === 0 ? '0 of 0' : `${(page - 1) * itemsPerPage + 1} - ${Math.min(page * itemsPerPage, filteredGuests.length)} of ${filteredGuests.length}`}
          </span>
          <div className="flex items-center gap-0.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              aria-label="Previous page"
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft sx={{ fontSize: 17 }} />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages || totalPages === 0}
              aria-label="Next page"
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight sx={{ fontSize: 17 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Guest Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">
                Edit Guest: {editingGuest?.name}
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} aria-label="Close" className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 16 }} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
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

              <div className="flex items-center justify-end gap-2.5 mt-5">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-1.5 rounded-lg border border-transparent bg-rose-50 text-rose-600 font-semibold text-xs hover:bg-rose-100 transition-colors cursor-pointer shadow-xs">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg border border-green-200 bg-green-50 text-[var(--primary-main)] font-semibold text-xs hover:bg-green-100 transition-colors cursor-pointer shadow-xs">
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
