import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Add, Download, Refresh, FilterList, 
  ReportProblem, CheckCircle, Warning, SwapHoriz, 
  DeleteForever, Visibility, Clear, ChevronLeft, ChevronRight,
  MeetingRoom, Person, CalendarToday, MoreVert, Timeline
} from '@mui/icons-material';
import { 
  Menu, MenuItem, IconButton, FormControl, InputLabel, Select, Snackbar, Alert 
} from '@mui/material';
import { 
  getMissingIncidents, computeIncidentMetrics, ROOM_NUMBERS, INVENTORY_CATEGORIES 
} from './inventoryStore';
import IncidentDetailModal from './components/IncidentDetailModal';
import ReportIncidentModal from './components/ReportIncidentModal';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '6px 12px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '12px',
    color: '#6b7280',
    '&.Mui-focused': { color: '#1b7f43' }
  }
};

const INCIDENT_STATUSES = [
  'All Statuses',
  'Reported',
  'Under Investigation',
  'Recovered',
  'Replaced',
  'Written Off'
];

export default function MissingInventory() {
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState(getMissingIncidents());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToastOpen, setRefreshToastOpen] = useState(false);

  // Modals
  const [selectedIncidentForDetail, setSelectedIncidentForDetail] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Action Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeIncidentId, setActiveIncidentId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const reloadData = () => {
    setIncidents([...getMissingIncidents()]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const freshIncidents = getMissingIncidents();
    setIncidents([...freshIncidents]);
    setSearchQuery('');
    setSelectedRoom('All');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
    setCurrentPage(1);
    setRefreshToastOpen(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  useEffect(() => {
    window.addEventListener('inventory_incidents_update', reloadData);
    return () => window.removeEventListener('inventory_incidents_update', reloadData);
  }, []);

  const metrics = computeIncidentMetrics(incidents);

  // Filtering
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.roomNumber && inc.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.reportedBy && inc.reportedBy.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.assignedTo && inc.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inc.guestName && inc.guestName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRoom = selectedRoom === 'All' || inc.roomNumber === selectedRoom;
    const matchesCategory = selectedCategory === 'All Categories' || inc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All Statuses' || inc.status === selectedStatus;

    return matchesSearch && matchesRoom && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoom('All');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedRoom !== 'All' || 
    selectedCategory !== 'All Categories' || 
    selectedStatus !== 'All Statuses';

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActiveIncidentId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveIncidentId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reported':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">Reported</span>;
      case 'Under Investigation':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">Investigating</span>;
      case 'Recovered':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20 whitespace-nowrap">Recovered</span>;
      case 'Replaced':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">Replaced</span>;
      case 'Written Off':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">Written Off</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700 whitespace-nowrap">{status}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['Incident ID', 'Item Name', 'Category', 'Room', 'Quantity', 'Unit Value ($)', 'Total Loss ($)', 'Reported Date', 'Reported By', 'Status', 'Assigned To', 'Resolution'];
    const rows = filteredIncidents.map(i => [
      i.id,
      `"${i.itemName.replace(/"/g, '""')}"`,
      i.category,
      i.roomNumber,
      i.quantity,
      i.unitValue,
      i.totalLoss,
      i.reportedDate,
      `"${(i.reportedBy || '').replace(/"/g, '""')}"`,
      i.status,
      `"${(i.assignedTo || '').replace(/"/g, '""')}"`,
      `"${(i.resolutionNotes || i.resolutionType || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `missing_inventory_incidents_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8 animate-fade-in">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
        <div>
         
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            title="Refresh Data & Reset Filters"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Refresh sx={{ fontSize: 16 }} className={isRefreshing ? 'animate-spin text-[#1b7f43]' : 'text-gray-500'} />
            <span>Refresh</span>
          </button>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download sx={{ fontSize: 16 }} />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Add sx={{ fontSize: 17 }} />
            <span>+ Report Missing Incident</span>
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Open Incidents */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Open Incidents</span>
            <Warning className="text-amber-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{metrics.openIncidents}</span>
            <span className="text-[10px] text-amber-600 font-medium">Reported</span>
          </div>
        </div>

        {/* Under Investigation */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Investigating</span>
            <Search className="text-blue-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{metrics.underInvestigation}</span>
            <span className="text-[10px] text-blue-600 font-medium">Auditing</span>
          </div>
        </div>

        {/* Recovered */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Recovered</span>
            <CheckCircle className="text-emerald-600 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700">{metrics.recovered}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Restocked</span>
          </div>
        </div>

        {/* Replaced */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Replaced</span>
            <SwapHoriz className="text-purple-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{metrics.replaced}</span>
            <span className="text-[10px] text-purple-600 font-medium">Procured</span>
          </div>
        </div>

        {/* Written Off / Total Loss */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Written Off</span>
            <DeleteForever className="text-rose-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-rose-600">${metrics.totalLoss.toFixed(2)}</span>
            <span className="text-[10px] text-rose-500 font-medium">{metrics.writtenOff} Items</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
            <input 
              type="text" 
              placeholder="Search incident, item, room, staff..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-shadow placeholder-gray-400 text-gray-800"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Clear sx={{ fontSize: 14 }} />
              </button>
            )}
          </div>

          {/* Segmented Status Selector */}
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-x-auto hide-scrollbar shrink-0 py-0.5">
            {['All Statuses', 'Reported', 'Under Investigation', 'Recovered', 'Replaced'].map((st) => {
              const isActive = selectedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStatus(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10 font-bold' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {st === 'Under Investigation' ? 'Investigating' : st}
                </button>
              );
            })}
          </div>

        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100 items-center">
          
          {/* Room Filter */}
          <div>
            <FormControl fullWidth size="small" sx={muiSelectSx}>
              <InputLabel>Filter Room</InputLabel>
              <Select 
                label="Filter Room" 
                value={selectedRoom} 
                onChange={(e) => {
                  setSelectedRoom(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="All">All Rooms</MenuItem>
                {ROOM_NUMBERS.map(r => (
                  <MenuItem key={r} value={r}>Room {r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Category Filter */}
          <div>
            <FormControl fullWidth size="small" sx={muiSelectSx}>
              <InputLabel>Category</InputLabel>
              <Select 
                label="Category" 
                value={selectedCategory} 
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {INVENTORY_CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Status Full Selector */}
          <div>
            <FormControl fullWidth size="small" sx={muiSelectSx}>
              <InputLabel>Lifecycle Status</InputLabel>
              <Select 
                label="Lifecycle Status" 
                value={selectedStatus} 
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {INCIDENT_STATUSES.map(st => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Clear sx={{ fontSize: 14 }} /> Reset Filters
              </button>
            )}
          </div>

        </div>
      </div>

      {/* INCIDENTS TABLE WITH HORIZONTAL SCROLLING */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-gray-900">Missing Inventory Audit Log</h3>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredIncidents.length} {filteredIncidents.length === 1 ? 'incident' : 'incidents'}
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-3 whitespace-nowrap">
                  Incident ID
                </th>
                <th className="py-2.5 px-3">
                  Missing Item
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">
                  Room
                </th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">
                  Qty
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">
                  Est. Loss
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">
                  Reported Date
                </th>
                <th className="py-2.5 px-2.5">
                  Reported By
                </th>
                <th className="py-2.5 px-2.5 text-center whitespace-nowrap">
                  Status
                </th>
                <th className="py-2.5 px-2.5">
                  Assigned To
                </th>
                <th className="py-2.5 px-2 text-center w-12 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedIncidents.map((inc) => (
                <tr 
                  key={inc.id} 
                  className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                  onClick={() => setSelectedIncidentForDetail(inc)}
                >
                  {/* Incident ID */}
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="text-xs font-mono font-bold text-gray-900 group-hover:text-red-600 transition-colors whitespace-nowrap">
                      {inc.incidentNumber || inc.id}
                    </span>
                  </td>

                  {/* Item */}
                  <td className="py-2 px-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 leading-snug">
                        {inc.itemName}
                      </span>
                      <span className="text-[10.5px] text-gray-400">
                        {inc.category}
                      </span>
                    </div>
                  </td>

                  {/* Room */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[11px] font-bold inline-block whitespace-nowrap">
                      Room {inc.roomNumber}
                    </span>
                  </td>

                  {/* Qty */}
                  <td className="py-2 px-2 text-center whitespace-nowrap">
                    <span className="text-xs font-bold text-red-600">
                      {inc.quantity}
                    </span>
                  </td>

                  {/* Loss */}
                  <td className="py-2 px-2.5 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-900 font-mono">
                      ${Number(inc.totalLoss || (inc.unitValue * inc.quantity) || 0).toFixed(2)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-2 px-2.5 text-[11px] font-medium text-gray-600 whitespace-nowrap">
                    {inc.reportedDate}
                  </td>

                  {/* Reported By */}
                  <td className="py-2 px-2.5 text-xs font-medium text-gray-700">
                    <span className="truncate block max-w-[140px]">{inc.reportedBy}</span>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-2.5 text-center whitespace-nowrap">
                    {getStatusBadge(inc.status)}
                  </td>

                  {/* Assigned To */}
                  <td className="py-2 px-2.5 text-xs font-medium text-gray-600">
                    <span className="truncate block max-w-[140px]">{inc.assignedTo || 'Unassigned'}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuClick(e, inc.id)}
                      sx={{ padding: '2px', '&:hover': { backgroundColor: '#f3f4f6' } }}
                    >
                      <MoreVert sx={{ fontSize: 16 }} />
                    </IconButton>
                  </td>
                </tr>
              ))}

              {paginatedIncidents.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 text-xs">
                    <ReportProblem sx={{ fontSize: 32, color: '#d1d5db', mb: 1 }} />
                    <p className="font-semibold text-gray-600 text-sm">No missing inventory incidents found.</p>
                    <p className="text-gray-400 mt-0.5">Try changing filter parameters or report a new incident.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 0 && (
          <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[12px] text-gray-500">
              Showing <span className="font-bold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</span> of <span className="font-bold text-gray-800">{filteredIncidents.length}</span> incidents
            </span>

            <div className="flex items-center space-x-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
              >
                <ChevronLeft sx={{ fontSize: 18 }} />
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-[12px] font-bold flex items-center justify-center transition cursor-pointer ${
                    currentPage === i + 1 
                      ? 'bg-[#1b7f43] text-white shadow-xs' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition"
              >
                <ChevronRight sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* CONTEXT ACTION MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ elevation: 3, sx: { borderRadius: '12px', minWidth: '170px', mt: 0.5, border: '1px solid #f3f4f6' } }}
      >
        {(() => {
          const incident = incidents.find(i => i.id === activeIncidentId);
          if (!incident) return null;

          return [
            <MenuItem 
              key="view" 
              onClick={() => {
                handleMenuClose();
                setSelectedIncidentForDetail(incident);
              }} 
              sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}
            >
              <Timeline sx={{ fontSize: 16, mr: 1.5, color: '#2563eb' }} /> View Incident Timeline
            </MenuItem>,

            <MenuItem 
              key="update" 
              onClick={() => {
                handleMenuClose();
                setSelectedIncidentForDetail(incident);
              }} 
              sx={{ fontSize: '12.5px', fontWeight: 600, color: '#1b7f43' }}
            >
              <CheckCircle sx={{ fontSize: 16, mr: 1.5, color: '#1b7f43' }} /> Update Lifecycle Status
            </MenuItem>
          ];
        })()}
      </Menu>

      {/* INCIDENT DETAIL & AUDIT TIMELINE MODAL */}
      <IncidentDetailModal
        open={Boolean(selectedIncidentForDetail)}
        onClose={() => setSelectedIncidentForDetail(null)}
        incident={selectedIncidentForDetail}
        onIncidentUpdated={reloadData}
      />

      {/* CREATE NEW INCIDENT MODAL */}
      <ReportIncidentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onIncidentCreated={reloadData}
      />

      {/* REFRESH NOTIFICATION SNACKBAR */}
      <Snackbar
        open={refreshToastOpen}
        autoHideDuration={1800}
        onClose={() => setRefreshToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: '12px', fontWeight: 'bold' }}>
          Missing incident log & filters refreshed.
        </Alert>
      </Snackbar>

    </div>
  );
}
