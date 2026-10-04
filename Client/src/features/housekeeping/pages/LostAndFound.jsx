import { FilterList, AddCircleOutlined, TableChart, PictureAsPdf, Category, Inventory, CheckCircle, Delete } from '@mui/icons-material';
import React, { useState, useRef, useEffect } from 'react';
import RefreshButton from '../../../components/common/RefreshButton';

import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, TablePagination, Typography, Box } from '@mui/material';

const initialItems = [
  {
    id: 1,
    itemName: 'iPhone 13 Charger',
    location: '101',
    status: 'Found',
    foundDate: '2026-02-01',
    finderName: 'John Doe',
    description: 'White color Apple charger'
  },
  {
    id: 2,
    itemName: 'Gold Bracelet',
    location: '205',
    status: 'Returned',
    foundDate: '2026-01-28',
    finderName: 'Jane Smith',
    description: 'Thin gold bracelet'
  },
  {
    id: 3,
    itemName: 'Blue Sunglasses',
    location: 'Pool Area',
    status: 'Found',
    foundDate: '2026-02-02',
    finderName: 'Robert Brown',
    description: 'Ray-Ban sunglasses'
  },
  {
    id: 4,
    itemName: 'Leather Wallet',
    location: 'Lobby',
    status: 'Claimed',
    foundDate: '2026-01-30',
    finderName: 'Maria Garcia',
    description: 'Brown leather wallet with ID cards'
  },
  {
    id: 5,
    itemName: 'Silver Watch',
    location: 'Gym',
    status: 'Found',
    foundDate: '2026-02-05',
    finderName: 'Alice Green',
    description: 'Men\'s silver wristwatch'
  },
  {
    id: 6,
    itemName: 'Black Backpack',
    location: 'Lobby',
    status: 'Claimed',
    foundDate: '2026-02-04',
    finderName: 'David Lee',
    description: 'Contains books and a water bottle'
  },
  {
    id: 7,
    itemName: 'Diamond Ring',
    location: '402',
    status: 'Returned',
    foundDate: '2026-02-01',
    finderName: 'Sarah Connor',
    description: 'Gold ring with small diamond'
  },
  {
    id: 8,
    itemName: 'Winter Coat',
    location: 'Restaurant',
    status: 'Disposed',
    foundDate: '2025-11-20',
    finderName: 'Tom White',
    description: 'Unclaimed over 60 days'
  },
  {
    id: 9,
    itemName: 'Laptop Charger',
    location: 'Conference Room',
    status: 'Found',
    foundDate: '2026-02-06',
    finderName: 'Maria Garcia',
    description: 'Black Dell 65W charger'
  },
  {
    id: 10,
    itemName: 'AirPods Pro',
    location: 'Pool Area',
    status: 'Claimed',
    foundDate: '2026-02-05',
    finderName: 'John Doe',
    description: 'White case with blue cover'
  },
  {
    id: 11,
    itemName: 'Umbrella',
    location: 'Lobby',
    status: 'Returned',
    foundDate: '2026-02-03',
    finderName: 'Alice Green',
    description: 'Large black golf umbrella'
  },
  {
    id: 12,
    itemName: 'Reading Glasses',
    location: 'Restaurant',
    status: 'Found',
    foundDate: '2026-02-07',
    finderName: 'Tom White',
    description: 'Black frame, left on table 12'
  }
];

export default function LostAndFound() {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [form, setForm] = useState({
    itemName: '',
    location: '',
    status: 'Found',
    foundDate: '',
    finderName: '',
    description: ''
  });

  // Derived Summary Stats
  const totalCount = items.length;
  const unclaimedCount = items.filter(t => t.status === 'Found').length;
  const claimedReturnedCount = items.filter(t => t.status === 'Claimed' || t.status === 'Returned').length;
  const disposedCount = items.filter(t => t.status === 'Disposed').length;

  const filteredItems = items.filter(item => 
    (item.itemName || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.location || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.finderName || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.status || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [visibleColumns, setVisibleColumns] = useState({
    'Item Name': true,
    'Location': true,
    'Found Date': true,
    'Finder': true,
    'Status': true,
    'Description': true,
    'Actions': true
  });
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowColumnsMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setPage(0);
    setVisibleColumns({
      'Item Name': true,
      'Location': true,
      'Found Date': true,
      'Finder': true,
      'Status': true,
      'Description': true,
      'Actions': true
    });
  };

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\n';
    
    filteredItems.forEach(r => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'Item Name') val = r.itemName;
        if (col === 'Location') val = r.location;
        if (col === 'Found Date') val = r.foundDate;
        if (col === 'Finder') val = r.finderName;
        if (col === 'Status') val = r.status;
        if (col === 'Description') val = r.description;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lost_and_found.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = `
      <html>
      <head>
        <title>Lost and Found Report</title>
        <style>
          body { font-family: sans-serif; padding: 20px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th, td { border: 1px solid #e2e8f0; padding: 6px; text-align: left; }
          th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
          h2 { color: #0f172a; margin-bottom: 5px; }
          .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h2>Lost and Found Report</h2>
        <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
        <table>
          <thead>
            <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
          </thead>
          <tbody>`;
    
    filteredItems.forEach(r => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
        if (col === 'Item Name') val = r.itemName;
        if (col === 'Location') val = r.location;
        if (col === 'Found Date') val = r.foundDate;
        if (col === 'Finder') val = r.finderName;
        if (col === 'Status') val = r.status;
        if (col === 'Description') val = r.description;
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });
    
    html += `
          </tbody>
        </table>
        <script>
          window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
        </script>
      </body>
      </html>`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({ itemName: '', location: '', status: 'Found', foundDate: '', finderName: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setItems(paginatedItems.map(t => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setItems([...items, { ...form, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setItems(items.filter(t => t.id !== itemToDelete.id));
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Found': return 'bg-[#eff6ff] text-[#3b82f6]';
      case 'Returned': return 'bg-[#f0fdf4] text-[#16a34a]';
      case 'Claimed': return 'bg-[#fff7ed] text-[#ea580c]';
      case 'Disposed': return 'bg-[#f1f5f9] text-[#64748b]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      backgroundColor: '#ffffff',
      fontSize: '12px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '12px',
      color: '#64748b',
      '&.Mui-focused': { color: '#1b7f43' }
    }
  };

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div className="text-left">
            <p className="text-[11px] font-medium text-gray-500">Total Items</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{totalCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <Category sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div className="text-left">
            <p className="text-[11px] font-medium text-gray-500">Unclaimed</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{unclaimedCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600">
            <Inventory sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div className="text-left">
            <p className="text-[11px] font-medium text-gray-500">Returned/Claimed</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{claimedReturnedCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
            <CheckCircle sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div className="text-left">
            <p className="text-[11px] font-medium text-gray-500">Disposed</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{disposedCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
            <Delete sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Table Header with Title & Button */}
        <div className="p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-sm font-bold text-gray-800 whitespace-nowrap">Lost & Found Management</h1>
            <input 
              type="text" 
              placeholder="Search items, locations, finders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2.5 py-1 border border-gray-200 rounded-md text-xs w-[160px] sm:w-[220px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="relative" ref={filterMenuRef}>
              <button onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Filter Columns">
                <FilterList sx={{ fontSize: 17 }} className="text-[#1b7f43]" />
              </button>
              {showColumnsMenu && (
                <div className="absolute right-0 top-8 w-44 bg-white shadow-lg rounded-lg border border-gray-100 z-50 py-1.5 animate-fade-in">
                  <div className="px-3 py-1 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Show/Hide Columns</div>
                  <div className="max-h-[220px] overflow-y-auto">
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center px-3 py-1 hover:bg-gray-50 cursor-pointer gap-2 text-xs text-gray-700 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col]} 
                          onChange={() => toggleColumn(col)} 
                          className="w-3.5 h-3.5 accent-[#1b7f43] cursor-pointer rounded-xs" 
                        />
                        {col}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleOpenNew} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Record">
              <AddCircleOutlined sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
            </button>
            <RefreshButton onClick={handleRefresh} />
            <button onClick={handleExportCSV} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sky-50 transition-colors cursor-pointer" title="Export CSV">
              <TableChart sx={{ fontSize: 16 }} className="text-sky-600" />
            </button>
            <button onClick={handleExportPDF} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50 transition-colors cursor-pointer" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 16 }} className="text-rose-600" />
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="w-full overflow-hidden">
          <table className="table-fixed w-full text-left border-collapse">
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                {visibleColumns['Item Name'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Item Name</th>}
                {visibleColumns['Location'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Location</th>}
                {visibleColumns['Found Date'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Found Date</th>}
                {visibleColumns['Finder'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Finder</th>}
                {visibleColumns['Status'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>}
                {visibleColumns['Description'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Description</th>}
                {visibleColumns['Actions'] && <th className="py-2 px-1 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-8 text-center text-gray-400 text-xs">
                    No lost and found items recorded.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors border-b border-gray-50">
                    {visibleColumns['Item Name'] && <td className="py-1.5 px-1.5 text-[11px] font-bold text-gray-900 truncate" title={item.itemName}>{item.itemName}</td>}
                    {visibleColumns['Location'] && <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-700 whitespace-nowrap">{item.location}</td>}
                    {visibleColumns['Found Date'] && <td className="py-1.5 px-1.5 text-[10.5px] text-gray-600 whitespace-nowrap">{item.foundDate}</td>}
                    {visibleColumns['Finder'] && <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate" title={item.finderName}>{item.finderName || '-'}</td>}
                    {visibleColumns['Status'] && (
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold inline-block ${getStatusStyles(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns['Description'] && <td className="py-1.5 px-1.5 text-[10.5px] text-gray-500 italic truncate" title={item.description}>{item.description || '-'}</td>}
                    {visibleColumns['Actions'] && (
                      <td className="py-1.5 px-1 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEdit(item)} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => handleOpenDelete(item)} className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer">
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component="div"
          count={filteredItems.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Items per page:"
          sx={{
            '.MuiTablePagination-toolbar': { minHeight: '32px', padding: '0 12px' },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '11px', color: '#64748b', margin: 0 },
            '.MuiTablePagination-select': { fontSize: '11px', color: '#1f2937' },
          }}
        />
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[560px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#1b7f43] px-4 py-2.5 flex items-center justify-between text-white">
              <h2 className="text-sm font-bold">
                {editingId ? `Edit Item: ${form.itemName}` : 'New Lost & Found Item'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center text-xs font-bold">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField 
                  required 
                  label="Item Name*" 
                  value={form.itemName} 
                  onChange={e => setForm({...form, itemName: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <TextField 
                  required 
                  label="Location Found*" 
                  value={form.location} 
                  onChange={e => setForm({...form, location: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <TextField
                  type="date"
                  label="Date Found*"
                  required
                  value={form.foundDate}
                  onChange={e => setForm({ ...form, foundDate: e.target.value })}
                  sx={muiInputSx}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select 
                    value={form.status} 
                    label="Status*" 
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    <MenuItem value="Found">Found (Unclaimed)</MenuItem>
                    <MenuItem value="Claimed">Claimed</MenuItem>
                    <MenuItem value="Returned">Returned to Guest</MenuItem>
                    <MenuItem value="Disposed">Disposed/Donated</MenuItem>
                  </Select>
                </FormControl>

                <div className="sm:col-span-2">
                  <TextField 
                    label="Finder Name" 
                    value={form.finderName} 
                    onChange={e => setForm({...form, finderName: e.target.value})} 
                    sx={muiInputSx} 
                    size="small" 
                    fullWidth 
                  />
                </div>

                <div className="sm:col-span-2">
                  <TextField 
                    label="Description & Details" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    sx={muiInputSx} 
                    size="small" 
                    fullWidth 
                    multiline 
                    rows={2} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-[#1b7f43] text-white font-semibold text-xs hover:bg-[#166534] transition-colors cursor-pointer shadow-xs">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[340px] p-5 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-800 mb-3 text-left">Confirm Delete</h3>
            
            <p className="text-xs text-gray-600 text-left mb-4 bg-slate-50 p-3 rounded-lg">
              Are you sure you want to delete the record for <strong className="text-gray-900">{itemToDelete.itemName}</strong>?
            </p>
            
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-semibold text-xs hover:bg-gray-100 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
