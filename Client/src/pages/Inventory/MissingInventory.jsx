import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Add, Download, Refresh, FilterList, 
  ReportProblem, CheckCircle, Warning, SwapHoriz, 
  DeleteForever, Visibility, Clear, ChevronLeft, ChevronRight,
  MeetingRoom, Person, CalendarToday, MoreVert, Timeline,
  Receipt
} from '@mui/icons-material';
import { 
  Menu, MenuItem, IconButton, FormControl, InputLabel, Select, Snackbar, Alert 
} from '@mui/material';
import { 
  getMissingIncidents, computeIncidentMetrics, ROOM_NUMBERS, INVENTORY_CATEGORIES 
} from './inventoryStore';
import IncidentDetailModal from './components/IncidentDetailModal';
import ReportIncidentModal from './components/ReportIncidentModal';
import AddGuestChargeModal from './components/AddGuestChargeModal';

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
  const [guestChargeModalOpen, setGuestChargeModalOpen] = useState(false);
  const [chargePrefillData, setChargePrefillData] = useState(null);

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

  const handleCreateChargeFromIncident = (incident) => {
    // Extract guest name if formatted like "Ahmed Khan (Res #...)"
    let cleanGuestName = incident.guestName || 'Ahmed Khan';
    if (cleanGuestName.includes('(')) {
      cleanGuestName = cleanGuestName.split('(')[0].trim();
    }

    setChargePrefillData({
      guestName: cleanGuestName,
      roomNumber: incident.roomNumber,
      chargeType: 'Damage',
      itemName: incident.itemName,
      inventoryItemId: incident.inventoryItemId || null,
      quantity: incident.missingQty || incident.quantity || 1,
      unitPrice: incident.unitValue || 500,
      status: 'Added to Folio',
      notes: `Missing item charge for ${incident.itemName} from Room ${incident.roomNumber} (Incident ${incident.incidentNumber || incident.id}).`
    });
    setGuestChargeModalOpen(true);
  };

  const getConditionStatusBadge = (status) => {
    switch (status) {
      case 'Reported':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">Missing</span>;
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
    const headers = ['Incident ID', 'Item Name', 'Category', 'Room/Location', 'Expected Qty', 'Missing Qty', 'Condition/Status', 'Guest', 'Date', 'Unit Loss Value ($)', 'Reported By'];
    const rows = filteredIncidents.map(i => [
      i.id,
      `"${i.itemName.replace(/"/g, '""')}"`,
      i.category,
      `"Room ${i.roomNumber}"`,
      i.expectedQty || (i.quantity + 1),
      i.missingQty || i.quantity,
      i.status,
      `"${(i.guestName || 'Ahmed Khan').replace(/"/g, '""')}"`,
      i.reportedDate,
      i.unitValue,
      `"${(i.reportedBy || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `missing_hotel_items_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-2 max-w-[1600px] mx-auto pb-2 animate-fade-in">
      
      {/* Top Actions Bar */}
      <div className="flex items-center justify-end gap-1.5 flex-wrap">
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          title="Refresh Data & Reset Filters"
          className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium transition cursor-pointer shadow-xs"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>

        <button 
          onClick={handleExportCSV}
          className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-xs font-medium transition shadow-xs cursor-pointer"
        >
          Export CSV
        </button>

        <button 
          onClick={() => setCreateModalOpen(true)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          + Report Missing Item
        </button>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Open Incidents */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Missing Items</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-red-600 leading-none">{metrics.openIncidents}</span>
            <span className="text-[10px] text-amber-600 font-medium">Active Loss</span>
          </div>
        </div>

        {/* Under Investigation */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Investigating</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-blue-600 leading-none">{metrics.underInvestigation}</span>
            <span className="text-[10px] text-blue-600 font-medium">Room Audits</span>
          </div>
        </div>

        {/* Recovered */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Recovered</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-emerald-700 leading-none">{metrics.recovered}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Restocked</span>
          </div>
        </div>

        {/* Replaced */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Replaced</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-bold text-gray-900 leading-none">{metrics.replaced}</span>
            <span className="text-[10px] text-purple-600 font-medium">From Reserve</span>
          </div>
        </div>

        {/* Written Off / Total Loss */}
        <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-gray-500 font-semibold text-[10.5px] uppercase tracking-wider truncate">Written Off</span>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-base font-bold text-rose-600 leading-none">${metrics.totalLoss.toFixed(2)}</span>
            <span className="text-[10px] text-rose-500 font-medium">{metrics.writtenOff} Items</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 16 }} />
            <input 
              type="text" 
              placeholder="Search missing item, room, staff..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-7 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] placeholder-gray-400 text-gray-800"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  className={`px-2.5 py-1 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-r-0 cursor-pointer whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#e5f4eb] text-[#1b7f43] border-[#1b7f43]/20 relative z-10 font-bold' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {st === 'Under Investigation' ? 'Investigating' : st === 'Reported' ? 'Missing' : st}
                </button>
              );
            })}
          </div>

        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 items-center">
          
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
                className="w-full flex items-center justify-center py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>
      </div>

      {/* MISSING ITEMS DATA TABLE */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden w-full">
        
        <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight">Missing Hotel Items</h3>
            <span className="text-[10.5px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded-full">
              {filteredIncidents.length} {filteredIncidents.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <span className="text-[11px] text-gray-500 font-medium">
            Workflow: <span className="text-amber-800 font-semibold">Missing Item → Audit → (If guest responsible) → Guest Charge → Folio</span>
          </span>
        </div>

        {/* Table Container - Strictly 100% width with NO horizontal scroll */}
        <div className="w-full">
          <table className="w-full table-fixed text-left border-collapse">
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                <th className="py-2.5 px-2.5">
                  Item
                </th>
                <th className="py-2.5 px-1.5">
                  Category
                </th>
                <th className="py-2.5 px-1.5">
                  Room / Location
                </th>
                <th className="py-2.5 px-1 text-center">
                  Expected Qty
                </th>
                <th className="py-2.5 px-1 text-center">
                  Missing Qty
                </th>
                <th className="py-2.5 px-1 text-center">
                  Condition / Status
                </th>
                <th className="py-2.5 px-1.5">
                  Guest
                </th>
                <th className="py-2.5 px-1.5">
                  Date
                </th>
                <th className="py-2.5 px-1 text-center">
                  Action
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
                  {/* Item */}
                  <td className="py-2 px-2.5">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-gray-900 group-hover:text-[#1b7f43] transition-colors leading-tight break-words">
                        {inc.itemName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                        {inc.incidentNumber || inc.id}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-2 px-1.5">
                    <span className="text-[10.5px] font-semibold text-gray-700 bg-gray-100/80 px-1.5 py-0.5 rounded inline-block truncate max-w-full">
                      {inc.category}
                    </span>
                  </td>

                  {/* Room / Location */}
                  <td className="py-2 px-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[#1b7f43] text-[10.5px] font-bold inline-block truncate max-w-full border border-emerald-100">
                      Room {inc.roomNumber}
                    </span>
                  </td>

                  {/* Expected Qty */}
                  <td className="py-2 px-1 text-center font-bold text-gray-700">
                    {inc.expectedQty || (Number(inc.quantity) + 1)}
                  </td>

                  {/* Missing Qty */}
                  <td className="py-2 px-1 text-center">
                    <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {inc.missingQty || inc.quantity}
                    </span>
                  </td>

                  {/* Condition / Status */}
                  <td className="py-2 px-1 text-center">
                    {getConditionStatusBadge(inc.status)}
                  </td>

                  {/* Guest */}
                  <td className="py-2 px-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#1b7f43] flex items-center justify-center font-bold text-[9.5px] shrink-0 border border-emerald-100">
                        {inc.guestName ? inc.guestName.charAt(0) : 'G'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-gray-900 truncate" title={inc.guestName}>
                          {inc.guestName ? (inc.guestName.includes('(') ? inc.guestName.split('(')[0].trim() : inc.guestName) : 'Ahmed Khan'}
                        </span>
                        {inc.reportedBy && (
                          <span className="text-[9.5px] text-gray-400 truncate">
                            By {inc.reportedBy.split('(')[0].trim()}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-2 px-1.5 text-[10px] font-medium text-gray-500 font-mono truncate">
                    {inc.reportedDate}
                  </td>

                  {/* Action */}
                  <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
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
                  <td colSpan={9} className="py-12 text-center text-gray-400 text-xs">
                    <ReportProblem sx={{ fontSize: 32, color: '#d1d5db', mb: 1 }} />
                    <p className="font-semibold text-gray-600 text-sm">No missing hotel items found.</p>
                    <p className="text-gray-400 mt-0.5">All expected in-room hotel inventory is accounted for.</p>
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
              Showing <span className="font-bold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredIncidents.length)}</span> of <span className="font-bold text-gray-800">{filteredIncidents.length}</span> items
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
        PaperProps={{ elevation: 3, sx: { borderRadius: '12px', minWidth: '190px', mt: 0.5, border: '1px solid #f3f4f6' } }}
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
              <Timeline sx={{ fontSize: 16, mr: 1.5, color: '#2563eb' }} /> View Incident & Timeline
            </MenuItem>,

            <MenuItem 
              key="charge" 
              onClick={() => {
                handleMenuClose();
                handleCreateChargeFromIncident(incident);
              }} 
              sx={{ fontSize: '12.5px', fontWeight: 700, color: '#b45309' }}
            >
              <Receipt sx={{ fontSize: 16, mr: 1.5, color: '#b45309' }} /> Create Guest Charge
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
        onCreateGuestCharge={handleCreateChargeFromIncident}
      />

      {/* CREATE NEW INCIDENT MODAL */}
      <ReportIncidentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onIncidentCreated={reloadData}
      />

      {/* ADD GUEST CHARGE MODAL (Triggered from Missing Item when Guest is Responsible) */}
      <AddGuestChargeModal
        open={guestChargeModalOpen}
        onClose={() => {
          setGuestChargeModalOpen(false);
          setChargePrefillData(null);
        }}
        prefilledData={chargePrefillData}
        onChargeAdded={() => {
          reloadData();
          setRefreshToastOpen(true);
        }}
      />

      {/* REFRESH NOTIFICATION SNACKBAR */}
      <Snackbar
        open={refreshToastOpen}
        autoHideDuration={1800}
        onClose={() => setRefreshToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: '12px', fontWeight: 'bold' }}>
          Missing items audit log refreshed.
        </Alert>
      </Snackbar>

    </div>
  );
}
