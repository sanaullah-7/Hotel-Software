import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Clear, Visibility, MeetingRoom, ReportProblem, Delete,
  AddCircleOutlined, Refresh, TableChart, ErrorOutlineOutlined
} from '@mui/icons-material';
import { 
  Menu, MenuItem, FormControl, InputLabel, Select, Snackbar, Alert, CircularProgress 
} from '@mui/material';
import inventoryService from '../../../services/inventoryService';
import roomService from '../../../services/roomService';
import { 
  adaptInventoryItemToUI, 
  computeInventoryMetrics 
} from '../adapters/inventoryAdapter';
import { 
  INVENTORY_CATEGORIES, INVENTORY_STATUSES 
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
  const [items, setItems] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedLocationType, setSelectedLocationType] = useState('All');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToastOpen, setRefreshToastOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSeverity, setFeedbackSeverity] = useState('success');

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

  const fetchInventory = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [response, roomsRes] = await Promise.all([
        inventoryService.getInventoryItems({ limit: 500 }),
        roomService.getRooms({ limit: 200 }).catch(() => null)
      ]);
      const rawItems = response?.data || [];
      const adapted = rawItems.map(adaptInventoryItemToUI).filter(Boolean);
      setItems(adapted);

      if (roomsRes) {
        const loadedRooms = Array.isArray(roomsRes?.data?.rooms)
          ? roomsRes.data.rooms
          : Array.isArray(roomsRes?.data)
            ? roomsRes.data
            : [];
        setRooms(loadedRooms);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setError(err?.message || 'Failed to load inventory records. Please check your backend connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const reloadData = () => {
    fetchInventory(false);
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setSelectedRoom('All');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
    setSelectedLocationType('All');
    setCurrentPage(1);
    fetchInventory(true).then(() => {
      setFeedbackMessage('Inventory stock & filters refreshed.');
      setFeedbackSeverity('success');
      setRefreshToastOpen(true);
    });
  };

  const metrics = computeInventoryMetrics(items);

  const roomOptions = Array.from(
    new Set([
      ...rooms.map(r => String(r.room_number || r.roomNumber || '')).filter(Boolean),
      ...items.map(i => String(i.roomNumber || '')).filter(Boolean)
    ])
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Multi-parameter filtering
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.itemName && item.itemName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.roomNumber && item.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

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

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
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

  const handleDeleteItem = async (item) => {
    if (window.confirm(`Deactivate "${item.itemName}" from active inventory records?`)) {
      try {
        await inventoryService.deactivateInventoryItem(item.id);
        setFeedbackMessage(`Item "${item.itemName}" deactivated.`);
        setFeedbackSeverity('success');
        setRefreshToastOpen(true);
        reloadData();
      } catch (err) {
        setFeedbackMessage(err?.message || 'Failed to deactivate item.');
        setFeedbackSeverity('error');
        setRefreshToastOpen(true);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID','SKU','Item Name','Category','Location Type','Room / Area','Location Detail','Quantity','Unit Price ($)','Total Value ($)','Condition','Status','Last Updated'];
    const rows = filteredItems.map(i => [
      i.id,
      i.sku,
      `"${(i.itemName || '').replace(/"/g, '""')}"`,
      i.category,
      i.locationType,
      i.roomNumber || '-',
      `"${(i.location || '').replace(/"/g, '""')}"`,
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
    <div className="w-full space-y-2.5 pb-3 flex flex-col">
      {/* KPI SUMMARY CARDS */}
      <InventoryKpiCards metrics={metrics} />

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-2 sm:p-2.5 rounded-lg shadow-xs border border-gray-100 space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" sx={{ fontSize: 15 }} />
            <input 
              type="text" 
              placeholder="Search item, SKU, room, category..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-7 py-1 bg-white border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] placeholder:text-gray-400 text-gray-800"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Clear sx={{ fontSize: 13 }} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-1 sm:gap-1.5 flex-wrap">
            <button 
              onClick={() => setAddStockModalOpen(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50" 
              title="Add Stock"
            >
              <AddCircleOutlined sx={{ fontSize: 17 }} className="text-[var(--primary-main)]" />
            </button>

            <button 
              onClick={() => {
                setPrefilledItemForIncident(null);
                setIncidentModalOpen(true);
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer border border-gray-100 bg-gray-50/50" 
              title="Report Missing"
            >
              <ReportProblem sx={{ fontSize: 16 }} className="text-[#ef4444]" />
            </button>

            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              title="Refresh Data & Reset Filters"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer disabled:opacity-50 border border-gray-100 bg-gray-50/50"
            >
              <Refresh sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
            </button>

            <button 
              onClick={handleExportCSV}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50" 
              title="Export CSV"
            >
              <TableChart sx={{ fontSize: 15 }} className="text-[#0ea5e9]" />
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
                {roomOptions.map(r => (
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

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ErrorOutlineOutlined className="text-red-500" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <button
            onClick={() => fetchInventory(false)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 flex flex-col items-center justify-center space-y-3">
          <CircularProgress size={32} sx={{ color: 'var(--primary-main)' }} />
          <span className="text-xs font-medium text-gray-500">Loading inventory records...</span>
        </div>
      ) : (
        /* INVENTORY DATA TABLE */
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
      )}

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

            item.locationType === 'Room' && item.roomNumber && item.roomNumber !== '-' && item.roomNumber !== '—' ? (
              <MenuItem 
                key="room" 
                onClick={() => {
                  handleMenuClose();
                  setSelectedRoomForModal(item.roomNumber);
                }} 
                sx={{ fontSize: '12.5px', fontWeight: 600, color: '#1b7f43' }}
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
                handleDeleteItem(item);
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
        autoHideDuration={2500}
        onClose={() => setRefreshToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={feedbackSeverity} sx={{ width: '100%', borderRadius: '12px', fontWeight: 'bold' }}>
          {feedbackMessage}
        </Alert>
      </Snackbar>

    </div>
  );
}
