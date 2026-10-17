import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import AddCircleOutlined from '@mui/icons-material/AddCircleOutlined';
import ContentCopy from '@mui/icons-material/ContentCopy';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import Receipt from '@mui/icons-material/Receipt';
import Bed from '@mui/icons-material/Bed';
import AttachMoney from '@mui/icons-material/AttachMoney';
import CreditCard from '@mui/icons-material/CreditCard';
import AccessTime from '@mui/icons-material/AccessTime';
import MoreVert from '@mui/icons-material/MoreVert';
import Edit from '@mui/icons-material/Edit';
import PlayCircle from '@mui/icons-material/PlayCircle';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import Delete from '@mui/icons-material/Delete';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUp from '@mui/icons-material/TrendingUp';
import React, { useState, useEffect, useMemo } from 'react';

import { Popover, Checkbox, FormControlLabel, FormGroup, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { getOrders, subscribeOrders, deleteOrder, updateOrderStatus } from '../restaurantStore';
import CreateOrderModal from '../components/CreateOrderModal';

// ─── Status chip (minimal 2-color feel) ──────────────────────
function StatusChip({ status }) {
  const styles = {
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Completed': 'bg-[#edf7f2] text-[var(--primary-main)] border-green-200',
    'Cancelled': 'bg-red-50 text-red-600 border-red-200',
  };
  const dots = {
    'In Progress': 'bg-amber-400',
    'Completed': 'bg-[var(--primary-main)]',
    'Cancelled': 'bg-red-400',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

const FILTER_TABS = ['All', 'In Progress', 'Completed', 'Cancelled'];
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
    setTimeout(() => setSelectedOrder(null), 200);
  };

  const handleEditOrder = () => {
    if (selectedOrder) {
      setOrderToEdit(selectedOrder);
      setCreateOpen(true);
    }
    setActionAnchorEl(null);
  };

  const handleStatusUpdate = async (status) => {
    if (selectedOrder) {
      try {
        await updateOrderStatus(selectedOrder.id, status);
      } catch (err) {
        console.error('Status update error:', err);
      }
    }
    handleActionMenuClose();
  };

  const handleDelete = async () => {
    if (selectedOrder) {
      try {
        await deleteOrder(selectedOrder.id);
      } catch (err) {
        console.error('Delete order error:', err);
      }
    }
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
    All: orders.length,
    'In Progress': orders.filter(o => o.status === 'In Progress').length,
    Completed: orders.filter(o => o.status === 'Completed').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  }), [orders]);

  const todayRevenue = useMemo(() =>
    orders.filter(o => o.status === 'Completed').reduce((s, o) => s + o.total, 0), [orders]);

  const avgOrder = useMemo(() =>
    orders.length ? +(orders.reduce((s, o) => s + o.total, 0) / orders.length).toFixed(0) : 0, [orders]);

  const totalItems = useMemo(() =>
    orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0), [orders]);

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchFilter = activeFilter === 'All' || o.status === activeFilter;
      const q = search.toLowerCase().trim();
      const matchSearch = !q || o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) || String(o.roomNo || '').includes(q);
      return matchFilter && matchSearch;
    });
  }, [orders, activeFilter, search]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedOrders = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // ── CSV export ─────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Order ID', 'Customer', 'Room', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment', 'Status', 'Placed At'];
    const rows = filtered.map(o => [
      o.id, `"${o.customer}"`, o.roomNo || 'N/A', `"${o.items.map(i => `${i.name}x${i.qty}`).join(',')}"`,
      o.subtotal, o.tax, o.total, o.paymentMode, o.status,
      new Date(o.placedAt).toLocaleString(),
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a'); a.href = encodeURI(csv);
    a.download = `orders_${activeFilter.replace(' ', '_').toLowerCase()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleColToggle = (col) => {
    setCols(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const STAT_CARDS = [
    { label: 'Total Orders', value: counts.All, suffix: '', sub: 'All time', iconBg: 'bg-gray-100', iconColor: 'text-gray-600', icon: ReceiptLong },
    { label: 'In Progress', value: counts['In Progress'], suffix: '', sub: 'Currently cooking', iconBg: 'bg-amber-50', iconColor: 'text-amber-600', icon: AccessTime },
    { label: 'Completed', value: counts.Completed, suffix: '', sub: 'Served', iconBg: 'bg-[#edf7f2]', iconColor: 'text-[var(--primary-main)]', icon: CheckCircleOutlined },
    { label: 'Cancelled', value: counts.Cancelled, suffix: '', sub: 'Cancelled', iconBg: 'bg-red-50', iconColor: 'text-red-600', icon: CancelOutlined },
    { label: "Today's Revenue", value: `PKR ${todayRevenue.toLocaleString()}`, suffix: '', sub: 'From completed', iconBg: 'bg-[#edf7f2]', iconColor: 'text-[var(--primary-main)]', icon: AccountBalanceWalletOutlined },
    { label: 'Avg Order Value', value: `PKR ${avgOrder.toLocaleString()}`, suffix: '', sub: 'Per order', iconBg: 'bg-gray-100', iconColor: 'text-gray-600', icon: TrendingUp },
  ];

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {STAT_CARDS.map((card, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-100 p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-xs">
            <div className="text-left min-w-0">
              <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">{card.label}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1 truncate">{card.value}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">{card.sub}</p>
            </div>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}>
              <card.icon sx={{ fontSize: 15 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Table Card ──────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-xs overflow-hidden flex flex-col flex-1">

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="p-2 sm:p-2.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 15 }} />
              <input
                type="text"
                placeholder="Search order, customer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors w-36 sm:w-48 placeholder:text-gray-400"
              />
            </div>
            
            {/* Filter tabs */}
            <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-md p-0.5 overflow-hidden">
              {FILTER_TABS.map(tab => {
                const isActive = activeFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[var(--primary-main)] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Quick Action Icons (Right Side) ───────────── */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={(e) => setColumnAnchorEl(e.currentTarget)}
              title="Show/Hide Column"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50"
            >
              <FilterList sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
            </button>
            
            <button
              onClick={() => setCreateOpen(true)}
              title="New Order"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50"
            >
              <AddCircleOutlined sx={{ fontSize: 17 }} className="text-[var(--primary-main)]" />
            </button>

            <button
              onClick={handleExport}
              title="CSV Download"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50"
            >
              <ContentCopy sx={{ fontSize: 15 }} className="text-[#0ea5e9]" />
            </button>

            <button
              onClick={() => alert("PDF Download coming soon")}
              title="PDF Download"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer border border-gray-100 bg-gray-50/50"
            >
              <PictureAsPdf sx={{ fontSize: 15 }} className="text-[#ef4444]" />
            </button>
          </div>
        </div>

        {/* ── Orders Table ─────────────────────────────────── */}
        <div className="w-full overflow-hidden">
          <table className="table-fixed w-full text-left border-collapse">
            <colgroup>
              {cols.orderId && <col style={{ width: '12%' }} />}
              {cols.customer && <col style={{ width: '16%' }} />}
              {cols.room && <col style={{ width: '10%' }} />}
              {cols.items && <col style={{ width: '18%' }} />}
              {cols.amount && <col style={{ width: '11%' }} />}
              {cols.payment && <col style={{ width: '11%' }} />}
              {cols.time && <col style={{ width: '11%' }} />}
              {cols.status && <col style={{ width: '11%' }} />}
              {cols.actions && <col style={{ width: '7%' }} />}
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                {cols.orderId && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Order ID</th>}
                {cols.customer && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Customer</th>}
                {cols.room && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Room</th>}
                {cols.items && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Items</th>}
                {cols.amount && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Amount</th>}
                {cols.payment && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Payment</th>}
                {cols.time && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Time</th>}
                {cols.status && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>}
                {cols.actions && <th className="py-2 px-1 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-1.5 text-gray-400">
                      <Receipt sx={{ fontSize: 32 }} className="opacity-30" />
                      <p className="text-xs font-semibold text-gray-500">No orders found</p>
                      <p className="text-[11px]">{activeFilter === 'All' ? 'Create a new order to get started' : `No ${activeFilter.toLowerCase()} orders`}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const initials = order.customer.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                  const placedAt = new Date(order.placedAt);
                  const timeStr = placedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  const dateStr = placedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                  const totalQty = order.items.reduce((s, i) => s + i.qty, 0);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/30 transition-colors cursor-pointer"
                    >
                      {/* Order ID */}
                      {cols.orderId && (
                        <td className="py-1.5 px-2.5">
                          <span className="text-xs font-bold text-[var(--primary-main)] font-mono">{order.id}</span>
                        </td>
                      )}

                      {/* Customer */}
                      {cols.customer && (
                        <td className="py-1.5 px-2.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded bg-[var(--primary-main)] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                              {initials}
                            </div>
                            <span className="text-xs font-semibold text-[var(--text-primary)]">{order.customer}</span>
                          </div>
                        </td>
                      )}

                      {/* Room */}
                      {cols.room && (
                        <td className="py-1.5 px-2.5">
                          <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                            <Bed sx={{ fontSize: 13 }} />
                            <span className="font-semibold">{order.roomNo || 'N/A'}</span>
                          </div>
                        </td>
                      )}

                      {/* Items */}
                      {cols.items && (
                        <td className="py-1.5 px-2.5">
                          <div>
                            <p className="text-[11px] text-[var(--text-primary)] font-medium truncate max-w-[160px]" title={order.items.map(i => i.name).join(', ')}>
                              {order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                            </p>
                            <p className="text-[10px] text-[var(--text-secondary)]">{totalQty} pcs total</p>
                          </div>
                        </td>
                      )}

                      {/* Amount */}
                      {cols.amount && (
                        <td className="py-1.5 px-2.5">
                          <p className="text-xs font-bold text-[var(--text-primary)]">PKR {order.total.toLocaleString()}</p>
                          <p className="text-[9.5px] text-[var(--text-secondary)]">incl. tax</p>
                        </td>
                      )}

                      {/* Payment */}
                      {cols.payment && (
                        <td className="py-1.5 px-2.5">
                          <div className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                            {order.paymentMode === 'Cash'
                              ? <AttachMoney sx={{ fontSize: 13 }} className="text-[var(--primary-main)]" />
                              : <CreditCard sx={{ fontSize: 13 }} className="text-[var(--primary-main)]" />}
                            <span className="font-medium">{order.paymentMode}</span>
                          </div>
                        </td>
                      )}

                      {/* Time */}
                      {cols.time && (
                        <td className="py-1.5 px-2.5">
                          <div className="flex items-center gap-1 text-[10.5px] text-[var(--text-secondary)]">
                            <AccessTime sx={{ fontSize: 11 }} />
                            <div>
                              <p className="font-medium">{timeStr}</p>
                              <p>{dateStr}</p>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Status */}
                      {cols.status && (
                        <td className="py-1.5 px-2.5">
                          <StatusChip status={order.status} />
                        </td>
                      )}

                      {/* Actions */}
                      {cols.actions && (
                        <td className="py-1.5 px-2.5 text-center">
                          <button
                            onClick={(e) => handleActionMenuOpen(e, order)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                          >
                            <MoreVert sx={{ fontSize: 16 }} />
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
        <div className="p-2.5 mt-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-gray-600 border-t border-gray-100 bg-gray-50/30 rounded-b-[6px]">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-secondary)]">Rows per page:</span>
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={e => setRowsPerPage(Number(e.target.value))}
                className="appearance-none pl-2.5 pr-6 py-1 border border-gray-200 rounded text-[11px] font-semibold bg-white focus:outline-none focus:border-[var(--primary-main)] cursor-pointer text-[var(--text-primary)]"
              >
                {ROWS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)]">
              {filtered.length === 0 ? '0' : `${(currentPage - 1) * rowsPerPage + 1}–${Math.min(currentPage * rowsPerPage, filtered.length)}`} of {filtered.length}
            </span>
          </div>

          {/* Page buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-white border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs"
              >
                ‹
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold transition-all border ${
                      currentPage === pg
                        ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)] shadow-sm'
                        : 'bg-white text-[var(--text-secondary)] border-gray-200 hover:border-[var(--primary-main)] hover:text-[var(--primary-main)]'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-white border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-xs"
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { mt: 1, borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', minWidth: 180 }
        }}
      >
        <div className="p-3 flex flex-col">
          <h3 className="text-xs font-bold text-gray-800 mb-2 pb-1.5 border-b border-gray-100">Show/Hide Column</h3>
          <FormGroup className="gap-0.5">
            <FormControlLabel
              control={<Checkbox checked={cols.orderId} onChange={() => handleColToggle('orderId')} size="small" />}
              label={<span className="text-xs text-gray-700">Order ID</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.customer} onChange={() => handleColToggle('customer')} size="small" />}
              label={<span className="text-xs text-gray-700">Customer</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.room} onChange={() => handleColToggle('room')} size="small" />}
              label={<span className="text-xs text-gray-700">Room</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.items} onChange={() => handleColToggle('items')} size="small" />}
              label={<span className="text-xs text-gray-700">Items</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.amount} onChange={() => handleColToggle('amount')} size="small" />}
              label={<span className="text-xs text-gray-700">Amount</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.payment} onChange={() => handleColToggle('payment')} size="small" />}
              label={<span className="text-xs text-gray-700">Payment</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.time} onChange={() => handleColToggle('time')} size="small" />}
              label={<span className="text-xs text-gray-700">Time</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.status} onChange={() => handleColToggle('status')} size="small" />}
              label={<span className="text-xs text-gray-700">Status</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.actions} onChange={() => handleColToggle('actions')} size="small" />}
              label={<span className="text-xs text-gray-700">Actions</span>}
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
          sx: { mt: 0.5, ml: 2, borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', minWidth: 130 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEditOrder} sx={{ fontSize: 11, py: 0.5 }}>
          <ListItemIcon><Edit sx={{ fontSize: 14 }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 11, fontWeight: 500 }}>Edit Order</ListItemText>
        </MenuItem>
        
        {selectedOrder?.status !== 'In Progress' && (
          <MenuItem onClick={() => handleStatusUpdate('In Progress')} sx={{ fontSize: 11, py: 0.5 }}>
            <ListItemIcon><PlayCircle sx={{ fontSize: 14, color: '#f59e0b' }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 11, fontWeight: 500 }}>Mark In Progress</ListItemText>
          </MenuItem>
        )}
        
        {selectedOrder?.status !== 'Completed' && (
          <MenuItem onClick={() => handleStatusUpdate('Completed')} sx={{ fontSize: 11, py: 0.5 }}>
            <ListItemIcon><CheckCircle sx={{ fontSize: 14, color: '#10b981' }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 11, fontWeight: 500 }}>Mark Completed</ListItemText>
          </MenuItem>
        )}
        
        {selectedOrder?.status !== 'Cancelled' && (
          <MenuItem onClick={() => handleStatusUpdate('Cancelled')} sx={{ fontSize: 11, py: 0.5 }}>
            <ListItemIcon><Cancel sx={{ fontSize: 14, color: '#ef4444' }} /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 11, fontWeight: 500 }}>Mark Cancelled</ListItemText>
          </MenuItem>
        )}

        <div className="h-px bg-gray-100 my-0.5 mx-2" />
        
        <MenuItem onClick={handleDelete} sx={{ fontSize: 11, py: 0.5, color: '#ef4444' }}>
          <ListItemIcon><Delete sx={{ fontSize: 14, color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primaryTypographyProps={{ fontSize: 11, fontWeight: 600 }}>Delete Order</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}
