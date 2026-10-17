import Delete from '@mui/icons-material/Delete';
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import ContentCopy from '@mui/icons-material/ContentCopy';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import CheckBox from '@mui/icons-material/CheckBox';
import IndeterminateCheckBox from '@mui/icons-material/IndeterminateCheckBox';
import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import CalendarToday from '@mui/icons-material/CalendarToday';
import Edit from '@mui/icons-material/Edit';
import React, { useState, useEffect, useMemo } from 'react';
import AddCircleOutlined from "@mui/icons-material/AddCircleOutlined"; 
import RestaurantMenu from "@mui/icons-material/RestaurantMenu";
import Spa from "@mui/icons-material/Spa";
import Restaurant from "@mui/icons-material/Restaurant";
import TableChart from "@mui/icons-material/TableChart";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { Popover, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import {
  CATEGORIES,
  getCategories, subscribeCategories,
  getMenuItems, subscribeMenuItems,
  addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability,
  addCategory,
} from '../restaurantStore';
import MenuItemModal from '../components/MenuItemModal';
import ViewItemModal from '../components/ViewItemModal';

/* ── tiny helpers ─────────────────────────────────────────── */
function DietaryBadge({ dietary }) {
  const isVeg = dietary === 'Veg';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
      isVeg
        ? 'bg-[#e5f4eb] text-[var(--primary-main)] border-green-200'
        : 'bg-red-50 text-red-600 border-red-200'
    }`}>
      {dietary}
    </span>
  );
}

function AvailabilityBadge({ availability, onClick, itemId }) {
  const isAvail = availability === 'Available';
  return (
    <button
      onClick={() => onClick(itemId)}
      title="Click to toggle availability"
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
        isAvail
          ? 'bg-[#e5f4eb] text-[var(--primary-main)] border-green-200 hover:brightness-95'
          : 'bg-orange-50 text-orange-600 border-orange-200 hover:brightness-95'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-[var(--primary-main)]' : 'bg-orange-500'}`} />
      {availability}
    </button>
  );
}

function CategoryChip({ cat, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`menu-category-chip px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-200 ${
        isActive ? 'is-active' : ''
      }`}
    >
      {cat.label}
    </button>
  );
}

/* ── Delete confirmation modal ─────────────────────────────── */
function DeleteConfirmModal({ item, onConfirm, onCancel }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Delete className="text-red-500" sx={{ fontSize: 22 }} />
        </div>
        <h3 className="text-[15px] font-bold text-gray-900 text-center">Delete Item?</h3>
        <p className="text-[12px] text-gray-500 text-center mt-1">"<span className="font-semibold text-gray-700">{item.name}</span>" will be permanently removed from the menu.
        </p>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={() => onConfirm(item.id)} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold transition-all active:scale-[0.97]">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave({ name: name.trim(), description: desc.trim() });
      setName('');
      setDesc('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
        <h3 className="text-[15px] font-bold text-gray-900 mb-3">Add Menu Category</h3>
        {error && <p className="text-[11px] text-red-500 mb-2">⚠ {error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] text-gray-500 font-semibold block mb-1">Category Name *</label>
            <input
              type="text"
              placeholder="e.g. Seafood, Mocktails, BBQ"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[var(--primary-main)]"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 font-semibold block mb-1">Description (Optional)</label>
            <input
              type="text"
              placeholder="Brief description"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-[var(--primary-main)]"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-1.5 rounded-lg bg-[var(--primary-main)] text-white text-xs font-semibold hover:brightness-110 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 100];

/* ══════════════════════════════════════════════════════════
   Main MenuTab component
══════════════════════════════════════════════════════════ */
export default function MenuTab() {
  const [items, setItems] = useState(getMenuItems());
  const [categories, setCategories] = useState(getCategories());
  const [search, setSearch] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // all | Veg | Non-Veg
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Column Visibility State
  const [columnAnchorEl, setColumnAnchorEl] = useState(null);
  const [cols, setCols] = useState({
    checkbox: true,
    rowNum: true,
    itemName: true,
    category: true,
    price: true,
    dietary: true,
    lastUpdated: true,
    availability: true,
    actions: true
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // View item state
  const [viewItem, setViewItem] = useState(null);

  // Category modal state
  const [catModalOpen, setCatModalOpen] = useState(false);

  // Subscribe to store changes
  useEffect(() => {
    const unsubItems = subscribeMenuItems(() => setItems(getMenuItems()));
    const unsubCats = subscribeCategories(() => setCategories(getCategories()));
    return () => {
      unsubItems();
      unsubCats();
    };
  }, []);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [activeCategoryFilter, dietaryFilter, search, rowsPerPage]);

  // ── Filtered items ────────────────────────────────────────
  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchCat = activeCategoryFilter === 'all' ||
        item.categoryId === activeCategoryFilter ||
        categories.some(c => (c.id === activeCategoryFilter || c._id === activeCategoryFilter) && (c.id === item.categoryId || c._id === item.categoryId));
      const matchDiet = dietaryFilter === 'all' || item.dietary === dietaryFilter;
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q);
      return matchCat && matchDiet && matchSearch;
    });
  }, [items, categories, activeCategoryFilter, dietaryFilter, search]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedItems = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: items.length,
    available: items.filter(i => i.availability === 'Available').length,
    veg: items.filter(i => i.dietary === 'Veg').length,
    nonVeg: items.filter(i => i.dietary === 'Non-Veg').length,
  }), [items]);

  // ── Checkbox helpers ──────────────────────────────────────
  const allSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i.id));
  const someSelected = filtered.some(i => selectedIds.has(i.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(i => n.delete(i.id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(i => n.add(i.id)); return n; });
    }
  };
  const toggleOne = (id) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // ── CRUD handlers ─────────────────────────────────────────
  const handleSave = async (data) => {
    if (editingItem) {
      await updateMenuItem(editingItem.id, data);
    } else {
      await addMenuItem(data);
    }
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteMenuItem(id);
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete menu item:', err);
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      try { await deleteMenuItem(id); } catch(e){}
    }
    setSelectedIds(new Set());
  };

  const handleSaveCategory = async (catData) => {
    await addCategory(catData);
  };

  // ── CSV Export ────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Price (PKR)', 'Dietary', 'Availability', 'Last Updated', 'Description'];
    const rows = filtered.map(item => [
      item.id, `"${item.name}"`,
      categories.find(c => c.id === item.categoryId || c._id === item.categoryId)?.label || item.categoryId,
      item.price,
      item.dietary,
      item.availability,
      item.lastUpdated, `"${item.description || ''}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a'); a.href = encodeURI(csv);
    a.download = 'menu_items.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const getCategoryName = (id) => CATEGORIES.find(c => c.id === id)?.label || id;

  const handleColToggle = (col) => {
    setCols(prev => ({ ...prev, [col]: !prev[col] }));
  };

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">

      {/* ── Stats Strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
          <div className="text-left min-w-0">
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Total Items</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{stats.total}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <RestaurantMenu sx={{ fontSize: 16 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
          <div className="text-left min-w-0">
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Available</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{stats.available}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-50 text-green-600 shrink-0">
            <CheckCircle sx={{ fontSize: 16 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
          <div className="text-left min-w-0">
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Veg Items</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{stats.veg}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
            <Spa sx={{ fontSize: 16 }} />
          </div>
        </div>
        
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
          <div className="text-left min-w-0">
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider truncate">Non-Veg Items</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{stats.nonVeg}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-600 shrink-0">
            <Restaurant sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* ── Main Card ───────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-xs overflow-hidden flex flex-col flex-1">

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className="p-2 sm:p-2.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 15 }} />
              <input
                id="menu-search"
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-7 pr-3 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors w-36 sm:w-48 placeholder:text-gray-400"
              />
            </div>
            
            {/* Dietary filter */}
            <div className="flex bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
              {['all', 'Veg', 'Non-Veg'].map(d => (
                <button
                  key={d}
                  onClick={() => setDietaryFilter(d)}
                  className={`px-2.5 py-1 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-0 cursor-pointer ${
                    dietaryFilter === d
                      ? 'bg-[var(--primary-main)] text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {d === 'all' ? 'All' : d}
                </button>
              ))}
            </div>

            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 text-[10.5px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-1 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Delete sx={{ fontSize: 13 }} /> Delete ({selectedIds.size})
              </button>
            )}
          </div>

          {/* ── Quick Action Icons (Right Side) ───────────── */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => { setEditingItem(null); setModalOpen(true); }}
              title="Add Item"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50"
            >
              <AddCircleOutlined sx={{ fontSize: 17 }} className="text-[var(--primary-main)]" />
            </button>

            <button
              onClick={(e) => setColumnAnchorEl(e.currentTarget)}
              title="Show/Hide Column"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50"
            >
              <FilterList sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
            </button>

            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50"
            >
              <TableChart sx={{ fontSize: 15 }} className="text-[#0ea5e9]" />
            </button>

            <button
              onClick={() => alert("PDF Download coming soon")}
              title="Export PDF"
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer border border-gray-100 bg-gray-50/50"
            >
              <PictureAsPdf sx={{ fontSize: 15 }} className="text-[#ef4444]" />
            </button>
          </div>
        </div>

        {/* ── Category Chips ──────────────────────────────── */}
        <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
              activeCategoryFilter === 'all' ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id || cat._id}
              onClick={() => setActiveCategoryFilter(cat.id || cat._id)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                activeCategoryFilter === (cat.id || cat._id) ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat.label || cat.name}
            </button>
          ))}
          <button
            onClick={() => setCatModalOpen(true)}
            title="Create New Menu Category"
            className="px-2.5 py-0.5 rounded-md text-[11px] font-bold text-[var(--primary-main)] bg-[var(--primary-main)]/10 hover:bg-[var(--primary-main)]/20 transition-colors cursor-pointer whitespace-nowrap shrink-0 border border-[var(--primary-main)]/20"
          >
            + Add Category
          </button>
        </div>

        {/* ── Table ───────────────────────────────────────── */}
        <div className="w-full overflow-hidden">
          <table className="table-fixed w-full text-left border-collapse">
            <colgroup>
              {cols.checkbox && <col style={{ width: '4%' }} />}
              {cols.rowNum && <col style={{ width: '5%' }} />}
              {cols.itemName && <col style={{ width: '24%' }} />}
              {cols.category && <col style={{ width: '14%' }} />}
              {cols.price && <col style={{ width: '11%' }} />}
              {cols.dietary && <col style={{ width: '11%' }} />}
              {cols.lastUpdated && <col style={{ width: '12%' }} />}
              {cols.availability && <col style={{ width: '11%' }} />}
              {cols.actions && <col style={{ width: '8%' }} />}
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                {cols.checkbox && (
                  <th className="py-2 px-1.5 text-center">
                    <button onClick={toggleAll} className="text-gray-400 hover:text-[var(--primary-main)] transition-colors cursor-pointer">
                      {allSelected
                        ? <CheckBox sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                        : someSelected
                        ? <IndeterminateCheckBox sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                        : <CheckBoxOutlineBlank sx={{ fontSize: 16 }} />
                      }
                    </button>
                  </th>
                )}
                {cols.rowNum && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>}
                {cols.itemName && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Item Name</th>}
                {cols.category && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Category</th>}
                {cols.price && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Price</th>}
                {cols.dietary && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Dietary</th>}
                {cols.lastUpdated && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Updated</th>}
                {cols.availability && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Availability</th>}
                {cols.actions && <th className="py-2 px-1 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-500">No items found</p>
                      <p className="text-[11px]">Try adjusting your search or category filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const isSelected = selectedIds.has(item.id);
                  const cat = categories.find(c => c.id === item.categoryId || c._id === item.categoryId);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/30 transition-colors cursor-pointer"
                      style={{ backgroundColor: isSelected ? '#edf7f2' : '' }}
                    >
                      {cols.checkbox && (
                        <td className="py-1.5 px-2.5">
                          <button onClick={() => toggleOne(item.id)} className="text-gray-300 hover:text-[var(--primary-main)] transition-colors">
                            {isSelected
                              ? <CheckBox sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
                              : <CheckBoxOutlineBlank sx={{ fontSize: 16 }} />
                            }
                          </button>
                        </td>
                      )}

                      {cols.rowNum && (
                        <td className="py-1.5 px-2.5 text-[10.5px] font-bold text-gray-400">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                      )}

                      {cols.itemName && (
                        <td className="py-1.5 px-2.5">
                          <button
                            onClick={() => setViewItem(item)}
                            className="text-xs font-bold text-gray-900 hover:text-[var(--primary-main)] hover:underline leading-tight text-left transition-colors"
                          >
                            {item.name}
                          </button>
                          {item.description && (
                            <p className="text-[10.5px] text-gray-500 italic mt-0.5 truncate max-w-[180px]" title={item.description}>
                              {item.description}
                            </p>
                          )}
                        </td>
                      )}

                      {cols.category && (
                        <td className="py-1.5 px-2.5">
                          {cat && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                              {cat.label}
                            </span>
                          )}
                        </td>
                      )}

                      {cols.price && (
                        <td className="py-1.5 px-2.5">
                          <span className="text-xs font-bold text-gray-900 font-mono">PKR {item.price.toLocaleString()}</span>
                        </td>
                      )}

                      {cols.dietary && (
                        <td className="py-1.5 px-2.5">
                          <DietaryBadge dietary={item.dietary} />
                        </td>
                      )}

                      {cols.lastUpdated && (
                        <td className="py-1.5 px-2.5">
                          <div className="flex items-center gap-1 text-[11px] text-gray-600">
                            <CalendarToday sx={{ fontSize: 11 }} />
                            <span>{item.lastUpdated}</span>
                          </div>
                        </td>
                      )}

                      {cols.availability && (
                        <td className="py-1.5 px-2.5">
                          <AvailabilityBadge
                            availability={item.availability}
                            itemId={item.id}
                            onClick={toggleMenuItemAvailability}
                          />
                        </td>
                      )}

                      {cols.actions && (
                        <td className="py-1.5 px-2.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(item)}
                              title="Edit item"
                              className="w-6 h-6 rounded flex items-center justify-center text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90"
                            >
                              <Edit sx={{ fontSize: 14 }} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              title="Delete item"
                              className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
                            >
                              <Delete sx={{ fontSize: 14 }} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer / Pagination ─────────────────── */}
        <div className="p-2.5 mt-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-gray-600 border-t border-gray-100 bg-gray-50/30 rounded-b-[6px]">
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
              {selectedIds.size > 0 && <span className="text-[var(--primary-main)] font-bold ml-1.5">· {selectedIds.size} selected</span>}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-secondary)] border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] transition-all font-bold text-xs">
                ‹
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const pg = i + 1;
                return (
                  <button key={pg} onClick={() => setCurrentPage(pg)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold transition-all border ${
                      currentPage === pg
                        ? 'bg-[var(--primary-main)] text-white border-[var(--primary-main)] shadow-sm'
                        : 'bg-white text-[var(--text-secondary)] border-gray-200 hover:border-[var(--primary-main)] hover:text-[var(--primary-main)]'
                    }`}
                  >{pg}</button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="w-6 h-6 rounded flex items-center justify-center text-[var(--text-secondary)] border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] transition-all font-bold text-xs">
                ›
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Modals & Popovers ──────────────────────────────────────────── */}
      <MenuItemModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        onSave={handleSave}
        initialData={editingItem}
        categories={categories}
      />

      <DeleteConfirmModal
        item={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ViewItemModal
        isOpen={!!viewItem}
        item={viewItem}
        onClose={() => setViewItem(null)}
        onEdit={(item) => { setEditingItem(item); setModalOpen(true); }}
      />

      <AddCategoryModal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onSave={handleSaveCategory}
      />

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
              control={<Checkbox checked={cols.checkbox} onChange={() => handleColToggle('checkbox')} size="small" />}
              label={<span className="text-xs text-gray-700">Checkbox</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.rowNum} onChange={() => handleColToggle('rowNum')} size="small" />}
              label={<span className="text-xs text-gray-700"># (Row Number)</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.itemName} onChange={() => handleColToggle('itemName')} size="small" />}
              label={<span className="text-xs text-gray-700">Item Name</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.category} onChange={() => handleColToggle('category')} size="small" />}
              label={<span className="text-xs text-gray-700">Category</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.price} onChange={() => handleColToggle('price')} size="small" />}
              label={<span className="text-xs text-gray-700">Price</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.dietary} onChange={() => handleColToggle('dietary')} size="small" />}
              label={<span className="text-xs text-gray-700">Dietary</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.lastUpdated} onChange={() => handleColToggle('lastUpdated')} size="small" />}
              label={<span className="text-xs text-gray-700">Last Updated</span>}
              className="m-0"
            />
            <FormControlLabel
              control={<Checkbox checked={cols.availability} onChange={() => handleColToggle('availability')} size="small" />}
              label={<span className="text-xs text-gray-700">Availability</span>}
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
    </div>
  );
}
