import Delete from'@mui/icons-material/Delete';
import Search from'@mui/icons-material/Search';
import FilterList from'@mui/icons-material/FilterList';
import ContentCopy from'@mui/icons-material/ContentCopy';
import PictureAsPdf from'@mui/icons-material/PictureAsPdf';
import CheckBox from'@mui/icons-material/CheckBox';
import IndeterminateCheckBox from'@mui/icons-material/IndeterminateCheckBox';
import CheckBoxOutlineBlank from'@mui/icons-material/CheckBoxOutlineBlank';
import CalendarToday from'@mui/icons-material/CalendarToday';
import Edit from'@mui/icons-material/Edit';
import React, { useState, useEffect, useMemo } from'react';
// Humne Outline ko Outlined (d ke sath) kar diya hai
import AddCircleOutlined from"@mui/icons-material/AddCircleOutlined"; 
import { Popover, Checkbox, FormControlLabel, FormGroup } from'@mui/material';
import {
 CATEGORIES,
 getMenuItems, subscribeMenuItems,
 addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability,
} from'../restaurantStore';
import MenuItemModal from'../components/MenuItemModal';
import ViewItemModal from'../components/ViewItemModal';

/* ── tiny helpers ─────────────────────────────────────────── */
function DietaryBadge({ dietary }) {
 const isVeg = dietary ==='Veg';
 return (
 <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
 isVeg
 ?'bg-[#e5f4eb] text-[var(--primary-main)] border-green-200'
 :'bg-red-50 text-red-600 border-red-200'
 }`}>
 {dietary}
 </span>
 );
}

function AvailabilityBadge({ availability, onClick, itemId }) {
 const isAvail = availability ==='Available';
 return (
 <button
 onClick={() => onClick(itemId)}
 title="Click to toggle availability"
 className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition-all hover:scale-105 active:scale-95 ${
 isAvail
 ?'bg-[#e5f4eb] text-[var(--primary-main)] border-green-200 hover:brightness-95'
 :'bg-orange-50 text-orange-600 border-orange-200 hover:brightness-95'
 }`}
 >
 <span className={`w-1.5 h-1.5 rounded-full ${isAvail ?'bg-[var(--primary-main)]' :'bg-orange-500'}`} />
 {availability}
 </button>
 );
}

function CategoryChip({ cat, isActive, onClick }) {
 return (
 <button
 onClick={onClick}
 className={`menu-category-chip px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition-all duration-200 ${
 isActive ?'is-active' :''
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
 <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all">
 Cancel
 </button>
 <button onClick={() => onConfirm(item.id)} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-all active:scale-[0.97]">
 Delete
 </button>
 </div>
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

 // Subscribe to store changes
 useEffect(() => {
 return subscribeMenuItems(() => setItems(getMenuItems()));
 }, []);

 // Reset page on filter change
 useEffect(() => { setCurrentPage(1); }, [activeCategoryFilter, dietaryFilter, search, rowsPerPage]);

 // ── Filtered items ────────────────────────────────────────
 const filtered = useMemo(() => {
 return items.filter(item => {
 const matchCat = activeCategoryFilter ==='all' || item.categoryId === activeCategoryFilter;
 const matchDiet = dietaryFilter ==='all' || item.dietary === dietaryFilter;
 const q = search.toLowerCase().trim();
 const matchSearch = !q ||
 item.name.toLowerCase().includes(q) ||
 (item.description ||'').toLowerCase().includes(q);
 return matchCat && matchDiet && matchSearch;
 });
 }, [items, activeCategoryFilter, dietaryFilter, search]);

 // Pagination
 const totalPages = Math.ceil(filtered.length / rowsPerPage);
 const paginatedItems = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

 // ── Stats ─────────────────────────────────────────────────
 const stats = useMemo(() => ({
 total: items.length,
 available: items.filter(i => i.availability ==='Available').length,
 veg: items.filter(i => i.dietary ==='Veg').length,
 nonVeg: items.filter(i => i.dietary ==='Non-Veg').length,
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
 const handleSave = (data) => {
 if (editingItem) {
 updateMenuItem(editingItem.id, data);
 } else {
 addMenuItem(data);
 }
 setEditingItem(null);
 };

 const handleEdit = (item) => {
 setEditingItem(item);
 setModalOpen(true);
 };

 const handleDeleteConfirm = (id) => {
 deleteMenuItem(id);
 setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
 setDeleteTarget(null);
 };

 const handleBulkDelete = () => {
 [...selectedIds].forEach(id => deleteMenuItem(id));
 setSelectedIds(new Set());
 };

 // ── CSV Export ────────────────────────────────────────────
 const handleExportCSV = () => {
 const headers = ['ID','Name','Category','Price (PKR)','Dietary','Availability','Last Updated','Description'];
 const rows = filtered.map(item => [
 item.id,`"${item.name}"`,
 CATEGORIES.find(c => c.id === item.categoryId)?.label || item.categoryId,
 item.price,
 item.dietary,
 item.availability,
 item.lastUpdated,`"${item.description ||''}"`,
 ]);
 const csv ='data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
 const a = document.createElement('a'); a.href = encodeURI(csv);
 a.download ='menu_items.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
 };

 const getCategoryName = (id) => CATEGORIES.find(c => c.id === id)?.label || id;

 const handleColToggle = (col) => {
 setCols(prev => ({ ...prev, [col]: !prev[col] }));
 };

 return (
 <div className="flex flex-col gap-4 pb-6 animate-fade-in">

 {/* ── Stats Strip ─────────────────────────────────────── */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 {[
 { label:'Total Items', value: stats.total, color:'text-gray-800' },
 { label:'Available', value: stats.available, color:'text-gray-800' },
 { label:'Veg Items', value: stats.veg, color:'text-gray-800' },
 { label:'Non-Veg Items', value: stats.nonVeg, color:'text-gray-800' },
 ].map(s => (
 <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col gap-0.5">
 <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
 <span className={`text-[22px] font-bold ${s.color}`}>{s.value}</span>
 </div>
 ))}
 </div>

 {/* ── Main Card ───────────────────────────────────────── */}
 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

 {/* ── Toolbar ─────────────────────────────────────── */}
 <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 
 <div className="flex items-center gap-3">
 {/* Search */}
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" sx={{ fontSize: 16 }} />
 <input
 id="menu-search"
 type="text"
 placeholder="Search items..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-2 focus:ring-[var(--primary-main)]/20 transition-all w-44 bg-gray-50 focus:bg-white"
 />
 </div>
 
 {/* Dietary filter */}
 <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
 {['all','Veg','Non-Veg'].map(d => (
 <button
 key={d}
 onClick={() => setDietaryFilter(d)}
 className={`px-3 py-2 text-[11px] font-semibold transition-colors border-r border-gray-200 last:border-0 ${
 dietaryFilter === d
 ?'bg-[var(--primary-main)] text-white'
 :'text-gray-500 hover:bg-gray-100'
 }`}
 >
 {d ==='all' ?'All' : d}
 </button>
 ))}
 </div>

 {selectedIds.size > 0 && (
 <button
 onClick={handleBulkDelete}
 className="ml-2 flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-100 transition-all"
 >
 <Delete sx={{ fontSize: 13 }} /> Delete Selected ({selectedIds.size})
 </button>
 )}
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
 onClick={() => { setEditingItem(null); setModalOpen(true); }}
 title="Add Item"
 className="w-10 h-10 flex items-center justify-center rounded-full text-green-600 hover:bg-gray-100 transition-colors"
 >
 <AddCircleOutlined sx={{ fontSize: 24 }} />
 </button>



 <button
 onClick={handleExportCSV}
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

 {/* ── Category Chips ──────────────────────────────── */}
 <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 hide-scrollbar">
 <button
 onClick={() => setActiveCategoryFilter('all')}
 className={`menu-category-chip px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition-all ${
 activeCategoryFilter ==='all' ?'is-active' :''
 }`}
 >
 All Categories
 </button>
 {CATEGORIES.map(cat => (
 <CategoryChip
 key={cat.id}
 cat={cat}
 isActive={activeCategoryFilter === cat.id}
 onClick={() => setActiveCategoryFilter(cat.id)}
 />
 ))}
 </div>

 {/* ── Table ───────────────────────────────────────── */}
 <div className="hide-scrollbar">
 <table className="w-full text-left border-collapse min-w-[700px]">
 <thead>
 <tr className="bg-gray-50/80 border-b border-gray-100">
 {cols.checkbox && (
 <th className="py-3 px-4 w-10">
 <button onClick={toggleAll} className="text-gray-400 hover:text-[var(--primary-main)] transition-colors">
 {allSelected
 ? <CheckBox sx={{ fontSize: 18 }} className="text-[var(--primary-main)]" />
 : someSelected
 ? <IndeterminateCheckBox sx={{ fontSize: 18 }} className="text-[var(--primary-main)]" />
 : <CheckBoxOutlineBlank sx={{ fontSize: 18 }} />
 }
 </button>
 </th>
 )}
 {cols.rowNum && <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">#</th>}
 {cols.itemName && <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Item Name</th>}
 {cols.category && <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category</th>}
 {cols.price && <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Price</th>}
 {cols.dietary && <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Dietary</th>}
 {cols.lastUpdated && <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>}
 {cols.availability && <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Availability</th>}
 {cols.actions && <th className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>}
 </tr>
 </thead>
 <tbody>
 {filtered.length === 0 ? (
 <tr>
 <td colSpan={9} className="py-16 text-center text-gray-400">
 <div className="flex flex-col items-center gap-2">
 <p className="text-[14px] font-semibold text-gray-500">No items found</p>
 <p className="text-[12px]">Try adjusting your search or category filter</p>
 </div>
 </td>
 </tr>
 ) : (
 paginatedItems.map((item, idx) => {
 const isSelected = selectedIds.has(item.id);
 const cat = CATEGORIES.find(c => c.id === item.categoryId);
 const isEven = idx % 2 === 0;
 return (
 <tr
 key={item.id}
 className="border-b border-gray-100 transition-colors hover:bg-[#f6fbf8]"
 style={{ backgroundColor: isSelected ?'#edf7f2' : isEven ?'#ffffff' :'var(--bg-default)' }}
 >
 {cols.checkbox && (
 <td className="py-3.5 px-4">
 <button onClick={() => toggleOne(item.id)} className="text-gray-300 hover:text-[var(--primary-main)] transition-colors">
 {isSelected
 ? <CheckBox sx={{ fontSize: 18 }} className="text-[var(--primary-main)]" />
 : <CheckBoxOutlineBlank sx={{ fontSize: 18 }} />
 }
 </button>
 </td>
 )}

 {cols.rowNum && (
 <td className="py-3.5 px-3 text-[11px] font-bold text-gray-400">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
 )}

 {cols.itemName && (
 <td className="py-3.5 px-3">
 <button
 onClick={() => setViewItem(item)}
 className="text-[13px] font-semibold text-gray-800 hover:text-[var(--primary-main)] hover:underline leading-tight text-left transition-colors"
 >
 {item.name}
 </button>
 {item.description && (
 <p className="text-[10.5px] text-gray-400 mt-0.5 truncate max-w-[180px]" title={item.description}>
 {item.description}
 </p>
 )}
 </td>
 )}

 {cols.category && (
 <td className="py-3.5 px-3">
 {cat && (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-[var(--text-secondary)] border border-gray-200">
 {cat.label}
 </span>
 )}
 </td>
 )}

 {cols.price && (
 <td className="py-3.5 px-3">
 <span className="text-[13.5px] font-bold text-gray-900">PKR {item.price.toLocaleString()}</span>
 </td>
 )}

 {cols.dietary && (
 <td className="py-3.5 px-3">
 <DietaryBadge dietary={item.dietary} />
 </td>
 )}

 {cols.lastUpdated && (
 <td className="py-3.5 px-3">
 <div className="flex items-center gap-1 text-[11px] text-gray-400">
 <CalendarToday sx={{ fontSize: 12 }} />
 <span>{item.lastUpdated}</span>
 </div>
 </td>
 )}

 {cols.availability && (
 <td className="py-3.5 px-3">
 <AvailabilityBadge
 availability={item.availability}
 itemId={item.id}
 onClick={toggleMenuItemAvailability}
 />
 </td>
 )}

 {cols.actions && (
 <td className="py-3.5 px-3">
 <div className="flex items-center justify-center gap-1.5">
 <button
 onClick={() => handleEdit(item)}
 title="Edit item"
 className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90"
 >
 <Edit sx={{ fontSize: 16 }} />
 </button>
 <button
 onClick={() => setDeleteTarget(item)}
 title="Delete item"
 className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-all active:scale-90"
 >
 <Delete sx={{ fontSize: 16 }} />
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
 <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ background:'var(--bg-default)' }}>
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
 {selectedIds.size > 0 && <span className="text-[var(--primary-main)] font-bold ml-2">· {selectedIds.size} selected</span>}
 </span>
 </div>

 {totalPages > 1 && (
 <div className="flex items-center gap-1">
 <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
 className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] transition-all font-bold text-[13px]">
 ‹
 </button>
 {[...Array(Math.min(totalPages, 7))].map((_, i) => {
 const pg = i + 1;
 return (
 <button key={pg} onClick={() => setCurrentPage(pg)}
 className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold transition-all border ${
 currentPage === pg
 ?'bg-[var(--primary-main)] text-white border-[var(--primary-main)] shadow-sm'
 :'bg-white text-[var(--text-secondary)] border-gray-200 hover:border-[var(--primary-main)] hover:text-[var(--primary-main)]'
 }`}
 >{pg}</button>
 );
 })}
 <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
 className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--primary-main)] hover:text-[var(--primary-main)] transition-all font-bold text-[13px]">
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
 control={<Checkbox checked={cols.checkbox} onChange={() => handleColToggle('checkbox')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Checkbox</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.rowNum} onChange={() => handleColToggle('rowNum')} size="small" />}
 label={<span className="text-[13px] text-gray-700"># (Row Number)</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.itemName} onChange={() => handleColToggle('itemName')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Item Name</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.category} onChange={() => handleColToggle('category')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Category</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.price} onChange={() => handleColToggle('price')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Price</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.dietary} onChange={() => handleColToggle('dietary')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Dietary</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.lastUpdated} onChange={() => handleColToggle('lastUpdated')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Last Updated</span>}
 className="m-0"
 />
 <FormControlLabel
 control={<Checkbox checked={cols.availability} onChange={() => handleColToggle('availability')} size="small" />}
 label={<span className="text-[13px] text-gray-700">Availability</span>}
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
 </div>
 );
}
