import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Clear, Visibility, MeetingRoom, ReportProblem, Delete
} from '@mui/icons-material';
import { 
  Menu, MenuItem, FormControl, InputLabel, Select, Snackbar, Alert 
} from '@mui/material';
import { 
  getInventoryItems, deleteInventoryItem, computeInventoryMetrics, 
  INVENTORY_CATEGORIES, INVENTORY_STATUSES, ROOM_NUMBERS 
} from './inventoryStore';
import RoomInventoryModal from './components/RoomInventoryModal';
import ItemDetailModal from './components/ItemDetailModal';
import ReportIncidentModal from './components/ReportIncidentModal';
import AddStockItemModal from './components/AddStockItemModal';
import InventoryKpiCards from '../components/InventoryKpiCards';
import InventoryTable from '../components/InventoryTable';

const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'var(--bg-paper)',
    fontSize: '12px',
    color: 'var(--text-primary)',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '6px 12px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    '&.Mui-focused': { color: 'var(--primary-main)' }
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
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);

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

  const handleExportCSV = () => {
    const headers = ['ID','SKU','Item Name','Category','Location Type','Room / Area','Location Detail','Quantity','Unit Price ($)','Total Value ($)','Condition','Status','Last Updated'];
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
    <div className="space-y-2 max-w-[1600px] mx-auto pb-2 animate-fade-in pt-1">
      {/* KPI SUMMARY CARDS */}
      <InventoryKpiCards metrics={metrics} />

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-2.5 rounded-lg shadow-xs border border-gray-100 space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          
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
              onClick={() => {
                setPrefilledItemForIncident(null);
                setIncidentModalOpen(true);
              }}
              className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-medium transition cursor-pointer"
            >
              Report Missing
            </button>

            <button 
              onClick={() => setAddStockModalOpen(true)}
              className="px-3 py-1 bg-[#1b7f43] hover:bg-[#166b37] text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              + Add Stock
            </button>
          </div>

        </div>

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-2 border-t border-gray-100 items-center">
          
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
                className="w-full flex items-center justify-center py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>
      </div>

      {/* INVENTORY DATA TABLE */}
      <InventoryTable
        filteredItems={filteredItems}
        paginatedItems={paginatedItems}
        selectedRoom={selectedRoom}
        setSelectedRoomForModal={setSelectedRoomForModal}
        setSelectedItemForDetail={setSelectedItemForDetail}
        handleMenuClick={handleMenuClick}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
      />

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

      {/* ADD STOCK ITEM MODAL */}
      <AddStockItemModal
        open={addStockModalOpen}
        onClose={() => setAddStockModalOpen(false)}
        onItemAdded={reloadData}
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
