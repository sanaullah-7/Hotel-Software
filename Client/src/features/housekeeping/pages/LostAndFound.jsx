import { FilterList, AddCircleOutlined, TableChart, PictureAsPdf, Category, Inventory, CheckCircle, Delete } from '@mui/icons-material';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import RefreshButton from '../../../components/common/RefreshButton';
import { TextField, FormControl, InputLabel, Select, MenuItem, TablePagination } from '@mui/material';
import lostAndFoundService from '../../../services/lostAndFoundService';
import opsService from '../../../services/opsService';
import lostAndFoundAdapter from '../adapters/lostAndFoundAdapter';

export default function LostAndFound() {
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    itemName: '',
    location: '',
    status: 'Found',
    foundDate: '',
    foundBy: '',
    finderName: '',
    description: '',
    claimant: '',
    claimedDate: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, empRes] = await Promise.all([
        lostAndFoundService.getItems({ limit: 200 }),
        opsService.getEmployees({ limit: 100 }).catch(() => ({ data: [] }))
      ]);
      const rawItems = itemsRes.data?.items || itemsRes.data || [];
      const adapted = lostAndFoundAdapter.toFrontendItemList(rawItems);
      setItems(adapted);
      const rawEmps = empRes.data?.employees || empRes.data || [];
      setEmployees(rawEmps);
    } catch (err) {
      console.error('[LostAndFound] Load error:', err);
      setError(err.message || 'Failed to load lost and found items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    loadData();
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
    setForm({
      itemName: '',
      location: '',
      status: 'Found',
      foundDate: new Date().toISOString().slice(0, 10),
      foundBy: '',
      finderName: '',
      description: '',
      claimant: '',
      claimedDate: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setForm({
      itemName: item.itemName,
      location: item.location,
      status: item.status,
      foundDate: item.foundDate,
      foundBy: item.foundBy || '',
      finderName: item.finderName !== '-' ? item.finderName : '',
      description: item.description,
      claimant: item.claimant || '',
      claimedDate: item.claimedDate || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = lostAndFoundAdapter.toBackendPayload(form);
      if (editingId) {
        await lostAndFoundService.updateItem(editingId, payload);
      } else {
        await lostAndFoundService.createItem(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('[LostAndFound] Save error:', err);
      alert(err.message || 'Failed to save item');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await lostAndFoundService.deleteItem(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (err) {
      console.error('[LostAndFound] Delete error:', err);
      alert(err.message || 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
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

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadData}
            className="font-semibold underline hover:text-rose-900 cursor-pointer text-xs ml-3"
          >
            Retry
          </button>
        </div>
      )}

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
              {loading ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-8 text-center text-gray-500 text-xs">
                    Loading lost and found items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
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

      {/* Add / Edit Item Modal */}
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

                <div className="sm:col-span-1">
                  <FormControl size="small" fullWidth sx={muiInputSx}>
                    <InputLabel>Finder (Staff)</InputLabel>
                    <Select
                      value={form.foundBy || ''}
                      label="Finder (Staff)"
                      onChange={e => {
                        const empId = e.target.value;
                        const foundEmp = employees.find(emp => (emp._id || emp.id) === empId);
                        setForm({
                          ...form,
                          foundBy: empId,
                          finderName: foundEmp ? `${foundEmp.first_name} ${foundEmp.last_name}` : form.finderName
                        });
                      }}
                    >
                      <MenuItem value=""><em>Select Employee (Optional)</em></MenuItem>
                      {employees.map(emp => (
                        <MenuItem key={emp._id || emp.id} value={emp._id || emp.id}>
                          {emp.first_name} {emp.last_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="sm:col-span-1">
                  <TextField 
                    label="Finder Name" 
                    value={form.finderName} 
                    onChange={e => setForm({...form, finderName: e.target.value})} 
                    sx={muiInputSx} 
                    size="small" 
                    fullWidth 
                    placeholder="Or enter name manually"
                  />
                </div>

                {(form.status === 'Claimed' || form.status === 'Returned') && (
                  <>
                    <div className="sm:col-span-1">
                      <TextField
                        label="Claimant / Guest"
                        value={form.claimant}
                        onChange={e => setForm({ ...form, claimant: e.target.value })}
                        sx={muiInputSx}
                        size="small"
                        fullWidth
                        placeholder="Name of guest who claimed"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <TextField
                        type="date"
                        label="Date Claimed"
                        value={form.claimedDate}
                        onChange={e => setForm({ ...form, claimedDate: e.target.value })}
                        sx={muiInputSx}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </div>
                  </>
                )}

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
                <button type="submit" disabled={formSubmitting} className="px-4 py-1.5 rounded-lg bg-[#1b7f43] text-white font-semibold text-xs hover:bg-[#166534] transition-colors cursor-pointer shadow-xs disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save'}
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
              <button onClick={handleDelete} disabled={deleting} className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
