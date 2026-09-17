import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Add, Download, Refresh, FilterList, 
  Inventory2, CheckCircle, Warning, 
  ReportProblem, MeetingRoom, Category, MonetizationOn,
  MoreVert, Edit, Delete, Visibility, Clear, ChevronLeft, ChevronRight,
  ProductionQuantityLimits, LocationOn, Warehouse
} from '@mui/icons-material';
import { 
  Menu, MenuItem, IconButton, FormControl, InputLabel, Select, Chip, Tooltip, Snackbar, Alert 
} from '@mui/material';
import { 
  getInventoryItems, deleteInventoryItem, computeInventoryMetrics, 
  INVENTORY_CATEGORIES, INVENTORY_STATUSES, ROOM_NUMBERS 
} from './inventoryStore';
import RoomInventoryModal from './components/RoomInventoryModal';
import ItemDetailModal from './components/ItemDetailModal';
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

export default function AllInventory() {
  const navigate = useNavigate();

  // State
  const [items, setItems] = useState(getInventoryItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedLocationType, setSelectedLocationType] = useState('All');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToastOpen, setRefreshToastOpen] = useState(false);

  // Modal states
  const [selectedRoomForModal, setSelectedRoomForModal] = useState(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [prefilledItemForIncident, setPrefilledItemForIncident] = useState(null);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);

  // Table action menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMenuRowId, setActiveMenuRowId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const reloadData = () => {
    setItems([...getInventoryItems()]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    const freshItems = getInventoryItems();
    setItems([...freshItems]);
    setSearchQuery('');
    setSelectedRoom('All');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
    setSelectedLocationType('All');
    setCurrentPage(1);
    setRefreshToastOpen(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  useEffect(() => {
    window.addEventListener('inventory_update', reloadData);
    return () => window.removeEventListener('inventory_update', reloadData);
  }, []);

  const metrics = computeInventoryMetrics(items);

  // Multi-parameter filtering
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.roomNumber && item.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRoom = 
      selectedRoom === 'All' ||
      (selectedRoom === 'Storage' ? item.locationType === 'Storage' : item.roomNumber === selectedRoom);

    const matchesCategory = 
      selectedCategory === 'All Categories' || item.category === selectedCategory;

    const matchesStatus = 
      selectedStatus === 'All Statuses' || item.status === selectedStatus;

    const matchesLocationType = 
      selectedLocationType === 'All' || item.locationType === selectedLocationType;

    return matchesSearch && matchesRoom && matchesCategory && matchesStatus && matchesLocationType;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRoom('All');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
    setSelectedLocationType('All');
    setCurrentPage(1);
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedRoom !== 'All' || 
    selectedCategory !== 'All Categories' || 
    selectedStatus !== 'All Statuses' || 
    selectedLocationType !== 'All';

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuRowId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20 whitespace-nowrap">Available</span>;
      case 'Low Stock':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">Low Stock</span>;
      case 'Missing':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">Missing</span>;
      case 'Out of Stock':
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap">Out of Stock</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700 whitespace-nowrap">{status}</span>;
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'New':
        return <span className="text-[10.5px] font-bold text-emerald-600 whitespace-nowrap">New</span>;
      case 'Good':
        return <span className="text-[10.5px] font-semibold text-gray-700 whitespace-nowrap">Good</span>;
      case 'Fair':
        return <span className="text-[10.5px] font-semibold text-amber-600 whitespace-nowrap">Fair</span>;
      case 'Damaged':
      case 'Broken':
        return <span className="text-[10.5px] font-bold text-red-600 whitespace-nowrap">{condition}</span>;
      default:
        return <span className="text-[10.5px] text-gray-500 whitespace-nowrap">{condition || 'Good'}</span>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'SKU', 'Item Name', 'Category', 'Location Type', 'Room / Area', 'Location Detail', 'Quantity', 'Unit Price ($)', 'Total Value ($)', 'Condition', 'Status', 'Last Updated'];
    const rows = filteredItems.map(i => [
      i.id,
      i.sku,
      `"${i.itemName.replace(/"/g, '""')}"`,
      i.category,
      i.locationType,
      i.roomNumber || '-',
      `"${i.location.replace(/"/g, '""')}"`,
      i.quantity,
      i.unitPrice,
      i.totalValue,
      i.condition,
      i.status,
      i.lastUpdated
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotel_inventory_${new Date().toISOString().split('T')[0]}.csv`);
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

        {/* Header Action Buttons */}
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
            onClick={() => {
              setPrefilledItemForIncident(null);
              setIncidentModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <ReportProblem sx={{ fontSize: 16 }} />
            <span>Report Missing</span>
          </button>

          <button 
            onClick={() => navigate('/inventory/add')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1b7f43] hover:bg-[#166b37] text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Add sx={{ fontSize: 17 }} />
            <span>+ Add Inventory</span>
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Items */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Total Items</span>
            <Inventory2 className="text-slate-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{metrics.totalCount}</span>
            <span className="text-[10px] text-gray-400 font-medium">{metrics.totalQuantity} Units</span>
          </div>
        </div>

        {/* Available Stock */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Available Stock</span>
            <CheckCircle className="text-emerald-600 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-700">{metrics.availableStock}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Ready</span>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Low Stock</span>
            <Warning className="text-amber-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{metrics.lowStock}</span>
            <span className="text-[10px] text-amber-600 font-medium">Below Min</span>
          </div>
        </div>

        {/* Missing Items */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Missing Items</span>
            <ReportProblem className="text-red-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">{metrics.missingItems}</span>
            <span className="text-[10px] text-red-600 font-medium">Active Loss</span>
          </div>
        </div>

        {/* Total Valuation */}
        <div className="bg-white p-3.5 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 font-semibold text-[11px] truncate">Valuation</span>
            <MonetizationOn className="text-blue-500 shrink-0" sx={{ fontSize: 17 }} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-gray-900">
              ${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Assets</span>
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
              placeholder="Search item, SKU, room, category..." 
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

          {/* Quick Room Fast-Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar shrink-0 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase mr-1 whitespace-nowrap">Quick Rooms:</span>
            {['All', '101', '102', '201', '203', '205', '301', 'Storage'].map((r) => {
              const isActive = selectedRoom === r;
              return (
                <button
                  key={r}
                  onClick={() => {
                    setSelectedRoom(r);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-[#1b7f43] text-white shadow-xs' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r === 'All' ? 'All Rooms' : r === 'Storage' ? 'Storage Only' : `Rm ${r}`}
                </button>
              );
            })}
          </div>

        </div>

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2 border-t border-gray-100 items-center">
          
          {/* Room Filter Dropdown */}
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
                <MenuItem value="All">All Rooms & Areas</MenuItem>
                <MenuItem value="Storage">Hotel Storage Only</MenuItem>
                {ROOM_NUMBERS.map(r => (
                  <MenuItem key={r} value={r}>Room {r}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Category Dropdown */}
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

          {/* Status Dropdown */}
          <div>
            <FormControl fullWidth size="small" sx={muiSelectSx}>
              <InputLabel>Status</InputLabel>
              <Select 
                label="Status" 
                value={selectedStatus} 
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {INVENTORY_STATUSES.map(st => (
                  <MenuItem key={st} value={st}>{st}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Location Type */}
          <div>
            <FormControl fullWidth size="small" sx={muiSelectSx}>
              <InputLabel>Location Type</InputLabel>
              <Select 
                label="Location Type" 
                value={selectedLocationType} 
                onChange={(e) => {
                  setSelectedLocationType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="Room">Room Specific</MenuItem>
                <MenuItem value="Storage">Hotel Storage</MenuItem>
              </Select>
            </FormControl>
          </div>

          {/* Reset Filters */}
          <div className="col-span-2 sm:col-span-4 md:col-span-1 flex justify-end">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Clear sx={{ fontSize: 14 }} /> Reset
              </button>
            )}
          </div>

        </div>
      </div>

      {/* INVENTORY DATA TABLE WITH COMFORTABLE COLUMN WIDTHS & HORIZONTAL SCROLLING */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        
        {/* Table Top Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-gray-900">Inventory Items</h3>
            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {selectedRoom !== 'All' && selectedRoom !== 'Storage' && (
            <button
              onClick={() => setSelectedRoomForModal(selectedRoom)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#e5f4eb] text-[#1b7f43] hover:bg-[#d5ecd9] rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <MeetingRoom sx={{ fontSize: 16 }} />
              <span>Inspect Room {selectedRoom} Inventory</span>
            </button>
          )}
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">
                  Item & SKU
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">
                  Category
                </th>
                <th className="py-2.5 px-2.5">
                  Room / Location
                </th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">
                  Stock / Qty
                </th>
                <th className="py-2.5 px-2 whitespace-nowrap">
                  Unit Price
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">
                  Total Value
                </th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">
                  Condition
                </th>
                <th className="py-2.5 px-2.5 text-center whitespace-nowrap">
                  Status
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">
                  Last Updated
                </th>
                <th className="py-2.5 px-2 text-center w-12 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginatedItems.map((item) => {
                const isRoomItem = item.locationType === 'Room' && item.roomNumber && item.roomNumber !== '-';

                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                    onClick={() => setSelectedItemForDetail(item)}
                  >
                    {/* Item & SKU */}
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#1b7f43] transition-colors leading-snug">
                          {item.itemName}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
                          <span className="text-[10.5px] font-mono text-gray-500 whitespace-nowrap">{item.sku}</span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">{item.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2 px-2.5 whitespace-nowrap">
                      <span className="text-[11.5px] font-semibold text-gray-700 bg-gray-100/80 px-2 py-0.5 rounded-md inline-block">
                        {item.category}
                      </span>
                    </td>

                    {/* Room / Location */}
                    <td className="py-2 px-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {isRoomItem ? (
                        <button
                          onClick={() => setSelectedRoomForModal(item.roomNumber)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[#1b7f43] hover:bg-emerald-100 text-[11px] font-bold transition border border-emerald-200/50 cursor-pointer whitespace-nowrap"
                          title={`Click to view all inventory assigned to Room ${item.roomNumber}`}
                        >
                          <MeetingRoom sx={{ fontSize: 14 }} />
                          <span className="whitespace-nowrap">Room {item.roomNumber}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-[11.5px] text-gray-600 font-medium truncate max-w-[130px]" title={item.location}>
                          <Warehouse sx={{ fontSize: 14, color: '#9ca3af' }} />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`text-xs font-bold leading-tight ${item.quantity === 0 ? 'text-red-500' : item.quantity <= item.minimumStock ? 'text-amber-600' : 'text-gray-900'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-[9.5px] text-gray-400 font-medium leading-none mt-0.5">
                          {item.locationType === 'Room' ? 'in room' : 'in store'}
                        </span>
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="py-2 px-2 text-xs font-medium text-gray-600 whitespace-nowrap font-mono">
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>

                    {/* Total Value */}
                    <td className="py-2 px-2.5 text-xs font-bold text-gray-900 whitespace-nowrap font-mono">
                      ${Number(item.totalValue).toFixed(2)}
                    </td>

                    {/* Condition */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      {getConditionBadge(item.condition)}
                    </td>

                    {/* Status */}
                    <td className="py-2 px-2.5 text-center whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Last Updated */}
                    <td className="py-2 px-2.5 text-[11px] font-medium text-gray-500 whitespace-nowrap">
                      {item.lastUpdated}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-2 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuClick(e, item.id)}
                        sx={{ padding: '2px', '&:hover': { backgroundColor: '#f3f4f6' } }}
                      >
                        <MoreVert sx={{ fontSize: 16 }} />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}

              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 text-xs">
                    <Inventory2 sx={{ fontSize: 32, color: '#d1d5db', mb: 1 }} />
                    <p className="font-semibold text-gray-600 text-sm">No inventory records match your filters.</p>
                    <p className="text-gray-400 mt-0.5">Try clearing search terms or resetting the room/category filters.</p>
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
              Showing <span className="font-bold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of <span className="font-bold text-gray-800">{filteredItems.length}</span> items
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
          const item = items.find(i => i.id === activeMenuRowId);
          if (!item) return null;

          return [
            <MenuItem 
              key="view" 
              onClick={() => {
                handleMenuClose();
                setSelectedItemForDetail(item);
              }} 
              sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}
            >
              <Visibility sx={{ fontSize: 16, mr: 1.5, color: '#2563eb' }} /> View Details
            </MenuItem>,

            item.locationType === 'Room' && item.roomNumber && item.roomNumber !== '-' ? (
              <MenuItem 
                key="room" 
                onClick={() => {
                  handleMenuClose();
                  setSelectedRoomForModal(item.roomNumber);
                }} 
                sx={{ fontSize: '12.5px', fontWeight: 600, color: '#374151' }}
              >
                <MeetingRoom sx={{ fontSize: 16, mr: 1.5, color: '#1b7f43' }} /> Room {item.roomNumber} Stock
              </MenuItem>
            ) : null,

            <MenuItem 
              key="report" 
              onClick={() => {
                handleMenuClose();
                setPrefilledItemForIncident(item);
                setIncidentModalOpen(true);
              }} 
              sx={{ fontSize: '12.5px', fontWeight: 600, color: '#d97706' }}
            >
              <ReportProblem sx={{ fontSize: 16, mr: 1.5, color: '#d97706' }} /> Report Missing
            </MenuItem>,

            <MenuItem 
              key="delete" 
              onClick={() => {
                handleMenuClose();
                if (window.confirm(`Delete "${item.itemName}" from inventory records?`)) {
                  deleteInventoryItem(item.id);
                  reloadData();
                }
              }} 
              sx={{ fontSize: '12.5px', fontWeight: 600, color: '#ef4444' }}
            >
              <Delete sx={{ fontSize: 16, mr: 1.5, color: '#ef4444' }} /> Delete Item
            </MenuItem>
          ];
        })()}
      </Menu>

      {/* ROOM INVENTORY BREAKDOWN MODAL */}
      <RoomInventoryModal
        open={Boolean(selectedRoomForModal)}
        onClose={() => setSelectedRoomForModal(null)}
        roomNumber={selectedRoomForModal}
        inventoryItems={items}
      />

      {/* ITEM DETAIL & EDIT MODAL */}
      <ItemDetailModal
        open={Boolean(selectedItemForDetail)}
        onClose={() => setSelectedItemForDetail(null)}
        item={selectedItemForDetail}
        onItemUpdated={reloadData}
        onReportMissing={(it) => {
          setPrefilledItemForIncident(it);
          setIncidentModalOpen(true);
        }}
      />

      {/* REPORT MISSING INCIDENT MODAL */}
      <ReportIncidentModal
        open={incidentModalOpen}
        onClose={() => {
          setIncidentModalOpen(false);
          setPrefilledItemForIncident(null);
        }}
        prefilledItem={prefilledItemForIncident}
        onIncidentCreated={() => {
          reloadData();
          navigate('/inventory/missing');
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
          Inventory stock & filters refreshed.
        </Alert>
      </Snackbar>

    </div>
  );
}
