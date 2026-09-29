import React, { useState, useEffect } from'react';
import { useNavigate } from'react-router-dom';
import { 
  Search, Add, Download, Refresh, FilterList, 
  Receipt, AttachMoney, RoomService, Warning, 
  CheckCircle, MoreVert, Visibility, Delete, Clear, 
  ChevronLeft, ChevronRight, MeetingRoom, Person,
  LocalShipping, AddCircleOutlined, TableChart, HourglassEmpty, Build
} from '@mui/icons-material';
import { 
 Menu, MenuItem, IconButton, FormControl, InputLabel, Select, Chip, Tooltip, Snackbar, Alert 
} from'@mui/material';
import { 
 getGuestCharges, deleteGuestCharge, updateGuestCharge, computeGuestChargeMetrics, 
 CHARGE_TYPES, CHARGE_STATUSES, ROOM_NUMBERS 
} from'./inventoryStore';
import AddGuestChargeModal from'./components/AddGuestChargeModal';
import ChargeDetailModal from'./components/ChargeDetailModal';

const muiSelectSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'8px',
 backgroundColor:'var(--bg-paper)',
 fontSize:'12px',
 color:'var(--text-primary)','& fieldset': { borderColor:'#e5e7eb', borderWidth:'1.2px' },'&:hover fieldset': { borderColor:'#9ca3af' },'&.Mui-focused fieldset': { borderColor:'var(--primary-main)', borderWidth:'1.5px' },
 },'& .MuiSelect-select': {
 padding:'6px 12px',
 },'& .MuiInputLabel-root': {
 fontSize:'12px',
 color:'var(--text-secondary)','&.Mui-focused': { color:'var(--primary-main)' }
 }
};

export default function GuestCharges() {
 const navigate = useNavigate();

 // State
 const [charges, setCharges] = useState(getGuestCharges());
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedRoom, setSelectedRoom] = useState('All');
 const [selectedType, setSelectedType] = useState('All Types');
 const [selectedStatus, setSelectedStatus] = useState('All Statuses');

 const [isRefreshing, setIsRefreshing] = useState(false);
 const [refreshToastOpen, setRefreshToastOpen] = useState(false);

 // Modals
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [selectedChargeForDetail, setSelectedChargeForDetail] = useState(null);
 const [prefilledChargeData, setPrefilledChargeData] = useState(null);

 // Table action menu
 const [anchorEl, setAnchorEl] = useState(null);
 const [activeMenuChargeId, setActiveMenuChargeId] = useState(null);

 // Pagination
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 const reloadData = () => {
 setCharges([...getGuestCharges()]);
 };

 const handleRefresh = () => {
 setIsRefreshing(true);
 const freshCharges = getGuestCharges();
 setCharges([...freshCharges]);
 setSearchQuery('');
 setSelectedRoom('All');
 setSelectedType('All Types');
 setSelectedStatus('All Statuses');
 setCurrentPage(1);
 setRefreshToastOpen(true);
 setTimeout(() => {
 setIsRefreshing(false);
 }, 450);
 };

 useEffect(() => {
 window.addEventListener('guest_charges_update', reloadData);
 return () => window.removeEventListener('guest_charges_update', reloadData);
 }, []);

 const metrics = computeGuestChargeMetrics(charges);

 // Multi-parameter filtering
 const filteredCharges = charges.filter(charge => {
 const matchesSearch = 
 charge.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (charge.roomNumber && charge.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
 charge.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 charge.chargeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (charge.folioId && charge.folioId.toLowerCase().includes(searchQuery.toLowerCase())) ||
 (charge.notes && charge.notes.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesRoom = 
 selectedRoom ==='All' || charge.roomNumber === selectedRoom;

 const matchesType = 
 selectedType ==='All Types' || charge.chargeType === selectedType;

 const matchesStatus = 
 selectedStatus ==='All Statuses' || charge.status === selectedStatus;

 return matchesSearch && matchesRoom && matchesType && matchesStatus;
 });

 const totalPages = Math.ceil(filteredCharges.length / itemsPerPage);
 const paginatedCharges = filteredCharges.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

 const handleResetFilters = () => {
 setSearchQuery('');
 setSelectedRoom('All');
 setSelectedType('All Types');
 setSelectedStatus('All Statuses');
 setCurrentPage(1);
 };

 const hasActiveFilters = 
 searchQuery !=='' || 
 selectedRoom !=='All' || 
 selectedType !=='All Types' || 
 selectedStatus !=='All Statuses';

 const handleMenuClick = (event, id) => {
 setAnchorEl(event.currentTarget);
 setActiveMenuChargeId(id);
 };

 const handleMenuClose = () => {
 setAnchorEl(null);
 setActiveMenuChargeId(null);
 };

 const getTypeBadge = (type) => {
 switch (type) {
 case'Consumption':
 return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Consumption</span>;
 case'Damage':
 return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Damage</span>;
 case'External Order':
 return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">External Order</span>;
 default:
 return <span className="px-1.5 py-0.5 rounded text-[10.5px] font-bold bg-gray-100 text-gray-700">{type}</span>;
 }
 };

 const getStatusBadge = (status) => {
 switch (status) {
 case'Added to Folio':
 return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Added to Folio</span>;
 case'Pending':
 return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
 case'Paid':
 return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Paid</span>;
 case'Invoiced':
 return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Invoiced</span>;
 default:
 return <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-700">{status}</span>;
 }
 };

 const handleExportCSV = () => {
 const headers = ['Charge ID','Guest Name','Room','Charge Item','Type','Quantity','Unit Price','Amount','Status','Date','Folio ID','Notes'];
 const rows = filteredCharges.map(c => [
 c.id,`"${c.guestName.replace(/"/g,'""')}"`,
 c.roomNumber,`"${c.itemName.replace(/"/g,'""')}"`,
 c.chargeType,
 c.quantity,
 c.unitPrice,
 c.amount,
 c.status,
 c.date,
 c.folioId ||'',`"${(c.notes ||'').replace(/"/g,'""')}"`
 ]);

 const csvContent ='data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
 const encodedUri = encodeURI(csvContent);
 const link = document.createElement('a');
 link.setAttribute('href', encodedUri);
 link.setAttribute('download',`guest_charges_${new Date().toISOString().split('T')[0]}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 };

 return (
 <div className="space-y-2 max-w-[1600px] mx-auto pb-2 animate-fade-in">
 
 {/* KPI SUMMARY CARDS */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mt-1">
    {/* Total Charges */}
    <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.totalCount}</div>
        <div className="text-[13px] text-gray-500 font-medium">Charges (Rs. {metrics.totalAmount.toLocaleString()})</div>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
        <Receipt sx={{ fontSize: 18 }} />
      </div>
    </div>

    {/* Added to Folio */}
    <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.addedToFolioCount}</div>
        <div className="text-[13px] text-gray-500 font-medium">Folio (Rs. {metrics.addedToFolioAmount.toLocaleString()})</div>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
        <CheckCircle sx={{ fontSize: 18 }} />
      </div>
    </div>

    {/* Pending Charges */}
    <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.pendingCount}</div>
        <div className="text-[13px] text-gray-500 font-medium">Pending (Rs. {metrics.pendingAmount.toLocaleString()})</div>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 text-amber-600">
        <HourglassEmpty sx={{ fontSize: 18 }} />
      </div>
    </div>

    {/* Consumption Charges */}
    <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">{metrics.consumptionCount}</div>
        <div className="text-[13px] text-gray-500 font-medium">Cons. (Rs. {metrics.consumptionAmount.toLocaleString()})</div>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-sky-50 text-sky-600">
        <RoomService sx={{ fontSize: 18 }} />
      </div>
    </div>

    {/* Damage & External */}
    <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
          Rs. {(metrics.damageAmount + metrics.externalOrderAmount).toLocaleString()}
        </div>
        <div className="text-[13px] text-gray-500 font-medium">Ext/Damage ({metrics.damageCount + metrics.externalOrderCount})</div>
      </div>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
        <Build sx={{ fontSize: 18 }} />
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
 placeholder="Search guest, room, item, folio..." 
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

 {/* Quick Charge Type Fast-Filter Pills */}
 <div className="flex items-center gap-1 shrink-0 py-0.5 flex-wrap">
 <span className="text-[10.5px] font-bold text-gray-400 uppercase mr-1">Charge Type:</span>
 {CHARGE_TYPES.map((t) => {
 const isActive = selectedType === t;
 return (
 <button
 key={t}
 onClick={() => {
 setSelectedType(t);
 setCurrentPage(1);
 }}
 className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition cursor-pointer ${
 isActive 
 ?'bg-[#1b7f43] text-white shadow-xs' 
 :'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 {t ==='All Types' ?'All Types' : t}
 </button>
 );
 })}
 </div>

 </div>

 {/* Detailed Dropdown Filters */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 items-center">
 
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
 <MenuItem value="All">All Guest Rooms</MenuItem>
 {ROOM_NUMBERS.map(r => (
 <MenuItem key={r} value={r}>Room {r}</MenuItem>
 ))}
 </Select>
 </FormControl>
 </div>

 {/* Status Dropdown */}
 <div>
 <FormControl fullWidth size="small" sx={muiSelectSx}>
 <InputLabel>Folio Status</InputLabel>
 <Select 
 label="Folio Status" 
 value={selectedStatus} 
 onChange={(e) => {
 setSelectedStatus(e.target.value);
 setCurrentPage(1);
 }}
 >
 {CHARGE_STATUSES.map(st => (
 <MenuItem key={st} value={st}>{st}</MenuItem>
 ))}
 </Select>
 </FormControl>
 </div>

 {/* Filter Actions */}
 <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-2 flex-wrap">
 <button 
 onClick={() => {
 setPrefilledChargeData(null);
 setIsAddModalOpen(true);
 }}
 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" 
 title="Add Guest Charge"
 >
 <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
 </button>

 <button 
 onClick={handleRefresh} 
 disabled={isRefreshing}
 title="Refresh Data & Reset Filters"
 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer disabled:opacity-50"
 >
 <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
 </button>

 <button 
 onClick={handleExportCSV}
 className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" 
 title="Export CSV"
 >
 <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
 </button>
 </div>

 {/* Reset Filters */}
 <div className="col-span-2 sm:col-span-4 flex justify-end">
 {hasActiveFilters && (
 <button
 onClick={handleResetFilters}
 className="w-full sm:w-auto flex items-center justify-center py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer"
 >
 Reset Filters
 </button>
 )}
 </div>

 </div>
 </div>

 {/* GUEST CHARGES DATA TABLE */}
 <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden w-full">
 
 {/* Table Top Header */}
 <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight">Guest Folio Charges</h3>
 <span className="text-[10.5px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded-full">
 {filteredCharges.length} {filteredCharges.length === 1 ?'charge' :'charges'}
 </span>
 </div>

 <span className="text-[11px] text-gray-500 font-medium">
 Folio Pipeline: <span className="text-[#1b7f43] font-semibold">Charge → Folio → Invoice → Settlement</span>
 </span>
 </div>

 {/* Table Container - Strictly 100% width with NO horizontal scroll */}
 <div className="w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
 <table className="w-full text-left">
 <colgroup>
 <col style={{ width:'16%' }} />
 <col style={{ width:'8%' }} />
 <col style={{ width:'22%' }} />
 <col style={{ width:'12%' }} />
 <col style={{ width:'6%' }} />
 <col style={{ width:'11%' }} />
 <col style={{ width:'12%' }} />
 <col style={{ width:'9%' }} />
 <col style={{ width:'4%' }} />
 </colgroup>
 <thead>
 <tr className="bg-gray-50/50">
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
 Guest
 </th>
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
 Room
 </th>
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
 Charge / Item
 </th>
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
 Type
 </th>
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">
 Qty
 </th>
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-right">
 Amount
 </th>
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">
 Status
 </th>
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700">
 Date
 </th>
 <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-center">
 Action
 </th>
 </tr>
 </thead>
 <tbody>
 {paginatedCharges.map((charge) => (
 <tr 
 key={charge.id} 
 className="hover:bg-gray-50/30 transition-colors group cursor-pointer"
 onClick={() => setSelectedChargeForDetail(charge)}
 >
 {/* Guest */}
 <td className="py-2 px-3">
 <div className="flex items-center gap-2 min-w-0">
 <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#1b7f43] flex items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-100">
 {charge.guestName ? charge.guestName.charAt(0) :'G'}
 </div>
 <div className="flex flex-col min-w-0">
 <span className="text-[13px] font-bold text-gray-900 group-hover:text-[#1b7f43] transition-colors truncate">
 {charge.guestName}
 </span>
 <span className="text-[12px] text-gray-600 font-mono truncate">
 {charge.folioId ||`FOL-${charge.roomNumber}`}
 </span>
 </div>
 </div>
 </td>

 {/* Room */}
 <td className="py-2 px-3">
 <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-[12px] font-bold">
 <MeetingRoom sx={{ fontSize: 13, color:'#6b7280' }} />
 <span>{charge.roomNumber}</span>
 </span>
 </td>

 {/* Charge / Item */}
 <td className="py-2 px-2">
 <div className="flex flex-col min-w-0">
 <span className="text-[13px] font-bold text-gray-900 leading-tight break-words">
 {charge.itemName}
 </span>
 {charge.notes && (
 <span className="text-[12px] text-gray-500 italic truncate mt-0.5" title={charge.notes}>
 {charge.notes}
 </span>
 )}
 </div>
 </td>

 {/* Type */}
 <td className="py-2 px-3">
 {getTypeBadge(charge.chargeType)}
 </td>

 {/* Qty */}
 <td className="py-2 px-3 text-center font-bold text-gray-800">
 {charge.quantity}
 </td>

 {/* Amount */}
 <td className="py-2 px-3 text-right font-mono text-xs font-bold text-gray-900">
 Rs. {Number(charge.amount || (charge.unitPrice * charge.quantity) || 0).toLocaleString()}
 </td>

 {/* Status */}
 <td className="py-2 px-3 text-center">
 {getStatusBadge(charge.status)}
 </td>

 {/* Date */}
 <td className="py-2 px-3 text-[10px] font-medium text-gray-500 font-mono truncate">
 {charge.date}
 </td>

 {/* Action */}
 <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
 <IconButton 
 size="small" 
 onClick={(e) => handleMenuClick(e, charge.id)}
 sx={{ padding:'2px','&:hover': { backgroundColor:'#f3f4f6' } }}
 >
 <MoreVert sx={{ fontSize: 16 }} />
 </IconButton>
 </td>
 </tr>
 ))}

 {paginatedCharges.length === 0 && (
 <tr>
 <td colSpan={9} className="py-12 text-center text-gray-400 text-xs">
 <Receipt sx={{ fontSize: 32, color:'#d1d5db', mb: 1 }} />
 <p className="font-semibold text-gray-600 text-sm">No guest charges found.</p>
 <p className="text-gray-400 mt-0.5">Try adjusting filters or click"+ Add Guest Charge" to record a new charge.</p>
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
 Showing <span className="font-bold text-gray-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-800">{Math.min(currentPage * itemsPerPage, filteredCharges.length)}</span> of <span className="font-bold text-gray-800">{filteredCharges.length}</span> charges
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
 ?'bg-[#1b7f43] text-white shadow-xs' 
 :'text-gray-600 hover:bg-gray-100'
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
 transformOrigin={{ horizontal:'right', vertical:'top' }}
 anchorOrigin={{ horizontal:'right', vertical:'bottom' }}
 PaperProps={{ elevation: 3, sx: { borderRadius:'12px', minWidth:'180px', mt: 0.5, border:'1px solid #f3f4f6' } }}
 >
 {(() => {
 const charge = charges.find(c => c.id === activeMenuChargeId);
 if (!charge) return null;

 return [
 <MenuItem 
 key="view" 
 onClick={() => {
 handleMenuClose();
 setSelectedChargeForDetail(charge);
 }} 
 sx={{ fontSize:'12.5px', fontWeight: 600, color:'#374151' }}
 >
 <Visibility sx={{ fontSize: 16, mr: 1.5, color:'#2563eb' }} /> View Folio Receipt
 </MenuItem>,

 charge.status !=='Added to Folio' ? (
 <MenuItem 
 key="folio" 
 onClick={() => {
 handleMenuClose();
 updateGuestCharge(charge.id, { status:'Added to Folio' });
 reloadData();
 }} 
 sx={{ fontSize:'12.5px', fontWeight: 600, color:'#1b7f43' }}
 >
 <CheckCircle sx={{ fontSize: 16, mr: 1.5, color:'#1b7f43' }} /> Post to Folio
 </MenuItem>
 ) : null,

 charge.status !=='Paid' ? (
 <MenuItem 
 key="paid" 
 onClick={() => {
 handleMenuClose();
 updateGuestCharge(charge.id, { status:'Paid' });
 reloadData();
 }} 
 sx={{ fontSize:'12.5px', fontWeight: 600, color:'#2563eb' }}
 >
 <AttachMoney sx={{ fontSize: 16, mr: 1.5, color:'#2563eb' }} /> Mark as Paid
 </MenuItem>
 ) : null,

 <MenuItem 
 key="delete" 
 onClick={() => {
 handleMenuClose();
 if (window.confirm(`Remove charge"${charge.itemName}" for ${charge.guestName}?`)) {
 deleteGuestCharge(charge.id);
 reloadData();
 }
 }} 
 sx={{ fontSize:'12.5px', fontWeight: 600, color:'#ef4444' }}
 >
 <Delete sx={{ fontSize: 16, mr: 1.5, color:'#ef4444' }} /> Void / Delete Charge
 </MenuItem>
 ];
 })()}
 </Menu>

 {/* ADD GUEST CHARGE MODAL */}
 <AddGuestChargeModal
 open={isAddModalOpen}
 onClose={() => {
 setIsAddModalOpen(false);
 setPrefilledChargeData(null);
 }}
 prefilledData={prefilledChargeData}
 onChargeAdded={reloadData}
 />

 {/* CHARGE DETAIL & FOLIO BREAKDOWN MODAL */}
 <ChargeDetailModal
 open={Boolean(selectedChargeForDetail)}
 onClose={() => setSelectedChargeForDetail(null)}
 charge={selectedChargeForDetail}
 onChargeUpdated={reloadData}
 />

 {/* REFRESH NOTIFICATION SNACKBAR */}
 <Snackbar
 open={refreshToastOpen}
 autoHideDuration={1800}
 onClose={() => setRefreshToastOpen(false)}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 >
 <Alert severity="success" sx={{ width:'100%', borderRadius:'12px', fontWeight:'bold' }}>
 Guest charges and folio ledger refreshed.
 </Alert>
 </Snackbar>

 </div>
 );
}
