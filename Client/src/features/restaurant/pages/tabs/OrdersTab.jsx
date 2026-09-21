import Search from'@mui/icons-material/Search';
import FilterList from'@mui/icons-material/FilterList';
import AddCircleOutlined from'@mui/icons-material/AddCircleOutlined';
import ContentCopy from'@mui/icons-material/ContentCopy';
import PictureAsPdf from'@mui/icons-material/PictureAsPdf';
import Receipt from'@mui/icons-material/Receipt';
import Bed from'@mui/icons-material/Bed';
import AttachMoney from'@mui/icons-material/AttachMoney';
import CreditCard from'@mui/icons-material/CreditCard';
import AccessTime from'@mui/icons-material/AccessTime';
import MoreVert from'@mui/icons-material/MoreVert';
import Edit from'@mui/icons-material/Edit';
import PlayCircle from'@mui/icons-material/PlayCircle';
import CheckCircle from'@mui/icons-material/CheckCircle';
import Cancel from'@mui/icons-material/Cancel';
import Delete from'@mui/icons-material/Delete';
import React, { useState, useEffect, useMemo } from'react';

import { Popover, Checkbox, FormControlLabel, FormGroup, Menu, MenuItem, ListItemIcon, ListItemText } from'@mui/material';
import { getOrders, subscribeOrders, deleteOrder, updateOrderStatus } from'../restaurantStore';
import CreateOrderModal from'../components/CreateOrderModal';

// ─── Status chip (minimal 2-color feel) ──────────────────────
function StatusChip({ status }) {
 const styles = {'In Progress':'bg-amber-50 text-amber-700 border-amber-200','Completed':'bg-[#edf7f2] text-[var(--primary-main)] border-green-200','Cancelled':'bg-red-50 text-red-600 border-red-200',
 };
 const dots = {'In Progress':'bg-amber-400','Completed':'bg-[var(--primary-main)]','Cancelled':'bg-red-400',
 };
 return (
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[status] ||'bg-gray-100 text-gray-600 border-gray-200'}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${dots[status] ||'bg-gray-400'}`} />
 {status}
 </span>
 );
}

const FILTER_TABS = ['All','In Progress','Completed','Cancelled'];
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

export default function OrdersTab() {
 const [orders, setOrders] = useState(getOrders());
 const [activeFilter, setActiveFilter] = useState('All');
 const [search, setSearch] = useState('');
 const [createOpen, setCreateOpen] = useState(false);
 const [orderToEdit, setOrderToEdit] = useState(null);
 const [rowsPerPage, setRowsPerPage] = useState(10);
 const [currentPage, setCurrentPage] = useState(1);

 // Column Visibility State
 const [columnAnchorEl, setColumnAnchorEl] = useState(null);
 const [cols, setCols] = useState({
 orderId: true,
 customer: true,
 room: true,
 items: true,
 amount: true,
 payment: true,
 time: true,
 status: true,
 actions: true,
 });

 // Action Menu State
 const [actionAnchorEl, setActionAnchorEl] = useState(null);
 const [selectedOrder, setSelectedOrder] = useState(null);

 const handleActionMenuOpen = (e, order) => {
 setActionAnchorEl(e.currentTarget);
 setSelectedOrder(order);
 };
 const handleActionMenuClose = () => {
 setActionAnchorEl(null);
 setActionAnchorEl(null);
 setTimeout(() => setSelectedOrder(null), 200);
 };

 const handleEditOrder = () => {
 if (selectedOrder) {
 setOrderToEdit(selectedOrder);
 setCreateOpen(true);
 }
 setActionAnchorEl(null);
 };

 const handleStatusUpdate = (status) => {
 if (selectedOrder) updateOrderStatus(selectedOrder.id, status);
 handleActionMenuClose();
 };

 const handleDelete = () => {
 if (selectedOrder) deleteOrder(selectedOrder.id);
 handleActionMenuClose();
 };

 // Subscribe to store
 useEffect(() => {
 const unsub = subscribeOrders(() => setOrders(getOrders()));
 const onStorage = () => setOrders(getOrders());
 window.addEventListener('restaurant_update', onStorage);
 return () => { unsub(); window.removeEventListener('restaurant_update', onStorage); };
 }, []);

 // Reset page on filter/search change
 useEffect(() => { setCurrentPage(1); }, [activeFilter, search, rowsPerPage]);

 // ── Derived ────────────────────────────────────────────────
 const counts = useMemo(() => ({
 All: orders.length,'In Progress': orders.filter(o => o.status ==='In Progress').length,
 Completed: orders.filter(o => o.status ==='Completed').length,
 Cancelled: orders.filter(o => o.status ==='Cancelled').length,
 }), [orders]);

 const todayRevenue = useMemo(() =>
 orders.filter(o => o.status ==='Completed').reduce((s, o) => s + o.total, 0), [orders]);

 const avgOrder = useMemo(() =>
 orders.length ? +(orders.reduce((s, o) => s + o.total, 0) / orders.length).toFixed(0) : 0, [orders]);

 const totalItems = useMemo(() =>
 orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0), [orders]);

 const filtered = useMemo(() => {
 return orders.filter(o => {
 const matchFilter = activeFilter ==='All' || o.status === activeFilter;
 const q = search.toLowerCase().trim();
 const matchSearch = !q || o.id.toLowerCase().includes(q) ||
 o.customer.toLowerCase().includes(q) || String(o.roomNo ||'').includes(q);
 return matchFilter && matchSearch;
 });
 }, [orders, activeFilter, search]);

 // Pagination
 const totalPages = Math.ceil(filtered.length / rowsPerPage);
 const paginatedOrders = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

 // ── CSV export ─────────────────────────────────────────────
 const handleExport = () => {
 const headers = ['Order ID','Customer','Room','Items','Subtotal','Tax','Total','Payment','Status','Placed At'];
 const rows = filtered.map(o => [
 o.id,`"${o.customer}"`, o.roomNo ||'N/A',`"${o.items.map(i =>`${i.name}x${i.qty}`).join(',')}"`,
 o.subtotal, o.tax, o.total, o.paymentMode, o.status,
 new Date(o.placedAt).toLocaleString(),
 ]);
 const csv ='data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
 const a = document.createElement('a'); a.href = encodeURI(csv);
 a.download =`orders_${activeFilter.replace('','_').toLowerCase()}.csv`;
 document.body.appendChild(a); a.click(); document.body.removeChild(a);
 };

 const handleColToggle = (col) => {
 setCols(prev => ({ ...prev, [col]: !prev[col] }));
 };

 const STAT_CARDS = [
 { label:'Total Orders', value: counts.All, suffix:'', sub:'All time', iconBg:'bg-gray-100', iconColor:'text-gray-500' },
 { label:'In Progress', value: counts['In Progress'], suffix:'', sub:'Currently cooking', iconBg:'bg-amber-50', iconColor:'text-amber-500' },
 { label:'Completed', value: counts.Completed, suffix:'', sub:'Served', iconBg:'bg-[#edf7f2]', iconColor:'text-[var(--primary-main)]' },
 { label:'Cancelled', value: counts.Cancelled, suffix:'', sub:'Cancelled', iconBg:'bg-red-50', iconColor:'text-red-500' },
 { label:"Today's Revenue", value:`PKR ${todayRevenue.toLocaleString()}`, suffix:'', sub:'From completed', iconBg:'bg-[#edf7f2]', iconColor:'text-[var(--primary-main)]' },
 { label:'Avg Order Value', value:`PKR ${avgOrder.toLocaleString()}`, suffix:'', sub:'Per order', iconBg:'bg-gray-100', iconColor:'text-gray-500' },
 ];

 return (
 <div className="flex flex-col gap-4 pb-6 animate-fade-in">

 {/* ── Stat Cards ───────────────────────────────────────── */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
 {STAT_CARDS.map((card, i) => (
 <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 flex flex-col gap-1">
 <span className="text-[10.5px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider leading-tight">{card.label}</span>
 <span className="text-[22px] font-bold text-[var(--text-primary)] leading-tight">{card.value}</span>
 <span className="text-[10px] text-gray-400">{card.sub}</span>
 </div>
 ))}
 </div>

 {/* ── Main Table Card ──────────────────────────────────── */}
 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

 {/* ── Toolbar ─────────────────────────────────────── */}
 <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 
 <div className="flex items-center gap-3">
 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
 <input
 type="text"
 placeholder="Search order, customer..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-2 focus:ring-[var(--primary-main)]/20 transition-all w-44 bg-gray-50 focus:bg-white"
 />
 </div>
 
 {/* Filter tabs */}
 <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 overflow-hidden">
 {FILTER_TABS.map(tab => {
 const isActive = activeFilter === tab;
 return (
 <button
 key={tab}
 onClick={() => setActiveFilter(tab)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all duration-200 ${
 isActive
 ?'bg-[var(--primary-main)] text-white shadow-sm'
 :'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100'
 }`}
 >
 {tab}
 </button>
 );
 })}
 </div>
 </div>

 {/* ── Quick Action Icons (Right Side) ───────────── */}
 <div className="flex items-center gap-1">
 <button
 onClick={(e) => setColumnAnchorEl(e.currentTarget)}
 title="Show/Hide Column"
 className="w-10 h-10 flex items-center justify-center rounded-full text-indigo-600 hover:bg-gray-100 transition-colors"
 >
 <FilterList sx={{ fontSize: 24 }} />
 </button>
 
 <button
 onClick={() => setCreateOpen(true)}
 title="New Order"
 className="w-10 h-10 flex items-center justify-center rounded-full text-green-600 hover:bg-gray-100 transition-colors"
 >
 <AddCircleOutlined sx={{ fontSize: 24 }} />
 </button>



 <button
 onClick={handleExport}
 title="Xlsx Download"
 className="w-10 h-10 flex items-center justify-center rounded-full text-blue-500 hover:bg-gray-100 transition-colors"
 >
 <ContentCopy sx={{ fontSize: 22 }} />
 </button>

 <button
 onClick={() => alert("PDF Download coming soon")}
 title="PDF Download"
 className="w-10 h-10 flex items-center justify-center rounded-full text-red-500 hover:bg-gray-100 transition-colors"
 >
 <PictureAsPdf sx={{ fontSize: 24 }} />
 </button>
 </div>
 </div>

 {/* ── Orders Table ─────────────────────────────────── */}
 <div className="hide-scrollbar">
 <table className="w-full text-left border-collapse min-w-[760px]">
 <thead>
 <tr className="bg-gray-50/80 border-b border-gray-100">
 {cols.orderId && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order ID</th>}
 {cols.customer && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>}
 {cols.room && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Room</th>}
 {cols.items && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Items</th>}
 {cols.amount && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>}
 {cols.payment && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Payment</th>}
 {cols.time && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Time</th>}
 {cols.status && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>}
 {cols.actions && <th className="py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>}
 </tr>
 </thead>
 <tbody>
 {paginatedOrders.length === 0 ? (
 <tr>
 <td colSpan={8} className="py-16 text-center">
 <div className="flex flex-col items-center gap-2 text-gray-400">
 <Receipt sx={{ fontSize: 36 }} className="opacity-30" />
 <p className="text-[14px] font-semibold text-gray-500">No orders found</p>
 <p className="text-[12px]">{activeFilter ==='All' ?'Create a new order to get started' :`No ${activeFilter.toLowerCase()} orders`}</p>
 </div>
 </td>
 </tr>
 ) : (
 paginatedOrders.map((order, idx) => {
 const initials = order.customer.split('').map(w => w[0]).slice(0, 2).join('').toUpperCase();
 const placedAt = new Date(order.placedAt);
 const timeStr = placedAt.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
 const dateStr = placedAt.toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
 const totalQty = order.items.reduce((s, i) => s + i.qty, 0);
 const isEven = idx % 2 === 0;

 return (
 <tr
 key={order.id}
 className="border-b border-gray-100 transition-colors hover:bg-[#f6fbf8]"
 style={{ backgroundColor: isEven ?'#ffffff' :'var(--bg-default)' }}
 >
 {/* Order ID */}
 {cols.orderId && (
 <td className="py-3.5 px-4">
 <span className="text-[12px] font-bold text-[var(--primary-main)] font-mono">{order.id}</span>
 </td>
 )}

 {/* Customer */}
 {cols.customer && (
 <td className="py-3.5 px-4">
 <div className="flex items-center gap-2">
 <div className="w-7 h-7 rounded-lg bg-[var(--primary-main)] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
 {initials}
 </div>
 <span className="text-[12.5px] font-semibold text-[var(--text-primary)]">{order.customer}</span>
 </div>
 </td>
 )}

 {/* Room */}
 {cols.room && (
 <td className="py-3.5 px-4">
 <div className="flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
 <Bed sx={{ fontSize: 13 }} />
 <span className="font-semibold">{order.roomNo ||'N/A'}</span>
 </div>
 </td>
 )}

 {/* Items */}
 {cols.items && (
 <td className="py-3.5 px-4">
 <div>
 <p className="text-[12px] text-[var(--text-primary)] font-medium truncate max-w-[160px]" title={order.items.map(i => i.name).join(',')}>
 {order.items[0]?.name}{order.items.length > 1 ?` +${order.items.length - 1}` :''}
 </p>
 <p className="text-[10.5px] text-[var(--text-secondary)]">{totalQty} pcs total</p>
 </div>
 </td>
 )}

 {/* Amount */}
 {cols.amount && (
 <td className="py-3.5 px-4">
 <p className="text-[13.5px] font-bold text-[var(--text-primary)]">PKR {order.total.toLocaleString()}</p>
 <p className="text-[10px] text-[var(--text-secondary)]">incl. tax</p>
 </td>
 )}

 {/* Payment */}
 {cols.payment && (
 <td className="py-3.5 px-4">
 <div className="flex items-center gap-1 text-[11.5px] text-[var(--text-secondary)]">
 {order.paymentMode ==='Cash'
 ? <AttachMoney sx={{ fontSize: 14 }} className="text-[var(--primary-main)]" />
 : <CreditCard sx={{ fontSize: 14 }} className="text-[var(--primary-main)]" />}
 <span className="font-medium">{order.paymentMode}</span>
 </div>
 </td>
 )}

 {/* Time */}
 {cols.time && (
 <td className="py-3.5 px-4">
 <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
 <AccessTime sx={{ fontSize: 12 }} />
 <div>
 <p className="font-medium">{timeStr}</p>
 <p>{dateStr}</p>
 </div>
 </div>
 </td>
 )}

 {/* Status */}
 {cols.status && (
 <td className="py-3.5 px-4">
 <StatusChip status={order.status} />
 </td>
 )}

 {/* Actions */}
 {cols.actions && (
 <td className="py-3.5 px-4 text-center">
 <button
 onClick={(e) => handleActionMenuOpen(e, order)}
 className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
 >
 <MoreVert sx={{ fontSize: 20 }} />
 </button>
 </td>
 )}
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 {/* ── Pagination Footer ────────────────────────────── */}
 <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ background:'var(--bg-default)' }}>
 {/* Items per page */}
 <div className="flex items-center gap-2">
 <span className="text-[12px] text-[var(--text-secondary)]">Rows per page:</span>
 <div className="relative">
 <select
 value={rowsPerPage}
 onChange={e => setRowsPerPage(Number(e.target.value))}
 className="appearance-none pl-3 pr-7 py-1.5 border border-gray-200 rounded-lg text-[12px] font-semibold bg-white focus:outline-none focus:border-[var(--primary-main)] cursor-pointer text-[var(--text-primary)]"
 >
 {ROWS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
 </select>
 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
 </div>
 <span className="text-[12px] text-[var(--text-secondary)]">
 {filtered.length === 0 ?'0' :`${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filtered.length)}`} of {filtered.length}
 </span>
 </div>

 {/* Page buttons */}
 {totalPages > 1 && (
 <div className="flex items-center gap-1">
 <button
 onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
 disabled={currentPage === 1}
 className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-white border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-[13px]"
 >
 ‹
 </button>
 {[...Array(Math.min(totalPages, 5))].map((_, i) => {
 const pg = i + 1;
 return (
 <button
 key={pg}
 onClick={() => setCurrentPage(pg)}
 className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold transition-all border ${
 currentPage === pg
 ?'bg-[var(--primary-main)] text-white border-[var(--primary-main)] shadow-sm'
 :'bg-white text-[var(--text-secondary)] border-gray-200 hover:border-[var(--primary-main)] hover:text-[var(--primary-main)]'
 }`}
 >
 {pg}
 </button>
 );
 })}
 <button
 onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
 disabled={currentPage === totalPages}
 className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-white border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-[13px]"
 >
 ›
 </button>
 </div>
 )}
 </div>
 </div>

 <CreateOrderModal
 isOpen={createOpen}
 initialOrder={orderToEdit}
 onClose={() => { setCreateOpen(false); setOrderToEdit(null); setSelectedOrder(null); }}
 onOrderPlaced={() => setOrders(getOrders())}
 />

 {/* ── Column Visibility Popover ────────────────────────── */}
 <Popover
 open={Boolean(columnAnchorEl)}
 anchorEl={columnAnchorEl}
 onClose={() => setColumnAnchorEl(null)}
 anchorOrigin={{ vertical:'bottom', horizontal:'right' }}
 transformOrigin={{ vertical:'top', horizontal:'right' }}
 PaperProps={{
 sx: { mt: 1, borderRadius:'12px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', minWidth: 200 }
 }}
 >
 <div className="p-4 flex flex-col">
 <h3 className="text-[13px] font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">Show/Hide Column</h3>
 <FormGroup className="gap-1">
 <FormControlLabel
 control={<Checkbox checked={cols.orderId} onChange={() => handleColToggle('orderId')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Order ID</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.customer} onChange={() => handleColToggle('customer')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Customer</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.room} onChange={() => handleColToggle('room')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Room</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.items} onChange={() => handleColToggle('items')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Items</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.amount} onChange={() => handleColToggle('amount')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Amount</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.payment} onChange={() => handleColToggle('payment')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Payment</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.time} onChange={() => handleColToggle('time')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Time</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.status} onChange={() => handleColToggle('status')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Status</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.actions} onChange={() => handleColToggle('actions')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Actions</span>}
 className="m-0"
 />
 </FormGroup>
 </div>
 </Popover>

 {/* ── Order Actions Menu (Three Dots) ────────────────── */}
 <Menu
 anchorEl={actionAnchorEl}
 open={Boolean(actionAnchorEl)}
 onClose={handleActionMenuClose}
 PaperProps={{
 sx: { mt: 0.5, ml: 2, borderRadius:'10px', boxShadow:'0 4px 15px rgba(0,0,0,0.08)', minWidth: 140 }
 }}
 transformOrigin={{ horizontal:'right', vertical:'top' }}
 anchorOrigin={{ horizontal:'right', vertical:'bottom' }}
 >
 <MenuItem onClick={handleEditOrder} sx={{ fontSize: 12, py: 1 }}>
 <ListItemIcon><Edit sx={{ fontSize: 16 }} /></ListItemIcon>
 <ListItemText primaryTypographyProps={{ fontSize: 12, fontWeight: 500 }}>Edit Order</ListItemText>
 </MenuItem>
 
 {selectedOrder?.status !=='In Progress' && (
 <MenuItem onClick={() => handleStatusUpdate('In Progress')} sx={{ fontSize: 12, py: 1 }}>
 <ListItemIcon><PlayCircle sx={{ fontSize: 16, color:'#f59e0b' }} /></ListItemIcon>
 <ListItemText primaryTypographyProps={{ fontSize: 12, fontWeight: 500 }}>Mark In Progress</ListItemText>
 </MenuItem>
 )}
 
 {selectedOrder?.status !=='Completed' && (
 <MenuItem onClick={() => handleStatusUpdate('Completed')} sx={{ fontSize: 12, py: 1 }}>
 <ListItemIcon><CheckCircle sx={{ fontSize: 16, color:'#10b981' }} /></ListItemIcon>
 <ListItemText primaryTypographyProps={{ fontSize: 12, fontWeight: 500 }}>Mark Completed</ListItemText>
 </MenuItem>
 )}
 
 {selectedOrder?.status !=='Cancelled' && (
 <MenuItem onClick={() => handleStatusUpdate('Cancelled')} sx={{ fontSize: 12, py: 1 }}>
 <ListItemIcon><Cancel sx={{ fontSize: 16, color:'#ef4444' }} /></ListItemIcon>
 <ListItemText primaryTypographyProps={{ fontSize: 12, fontWeight: 500 }}>Mark Cancelled</ListItemText>
 </MenuItem>
 )}

 <div className="h-px bg-gray-100 my-1 mx-2" />
 
 <MenuItem onClick={handleDelete} sx={{ fontSize: 12, py: 1, color:'#ef4444' }}>
 <ListItemIcon><Delete sx={{ fontSize: 16, color:'#ef4444' }} /></ListItemIcon>
 <ListItemText primaryTypographyProps={{ fontSize: 12, fontWeight: 600 }}>Delete Order</ListItemText>
 </MenuItem>
 </Menu>
 </div>
 );
}
