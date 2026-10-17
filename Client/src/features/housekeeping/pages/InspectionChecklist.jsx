import { FilterList, AddCircleOutlined, TableChart, PictureAsPdf, Assignment, CheckCircle, Cancel, Star } from '@mui/icons-material';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import RefreshButton from '../../../components/common/RefreshButton';
import { TextField, FormControl, InputLabel, Select, MenuItem, TablePagination, Box, Typography } from '@mui/material';
import inspectionService from '../../../services/inspectionService';
import opsService from '../../../services/opsService';
import inspectionChecklistAdapter from '../adapters/inspectionChecklistAdapter';

export default function InspectionChecklist() {
  const [inspections, setInspections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    roomNo: '',
    roomType: 'Deluxe',
    inspector: '',
    inspectionDate: '',
    status: 'Pending',
    score: 0,
    comments: '',
    roomId: null,
    taskId: null,
    inspectorId: null,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, empRes] = await Promise.all([
        inspectionService.getInspections({ limit: 200 }),
        opsService.getEmployees({ limit: 100 }).catch(() => ({ data: [] })),
      ]);
      const rawInspections = res.data?.inspections || res.data || [];
      const adapted = inspectionChecklistAdapter.toFrontendInspectionList(rawInspections);
      setInspections(adapted);
      const rawEmps = empRes.data?.employees || empRes.data || [];
      setEmployees(rawEmps);
    } catch (err) {
      console.error('[InspectionChecklist] Load error:', err);
      setError(err.message || 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Summary Stats
  const totalInspections = inspections.length;
  const passedCount = inspections.filter(t => t.status === 'Passed').length;
  const failedCount = inspections.filter(t => t.status === 'Failed').length;
  const pendingCount = inspections.filter(t => t.status === 'Pending').length;
  const avgScore = totalInspections ? Math.round(inspections.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / totalInspections) : 0;

  const filteredInspections = inspections.filter(item => 
    (item.roomNo || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.roomType || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.inspector || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.status || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedInspections = filteredInspections.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [visibleColumns, setVisibleColumns] = useState({
    'Room No': true,
    'Room Type': true,
    'Inspector': true,
    'Inspection Date': true,
    'Status': true,
    'Score': true,
    'Comments': true,
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
    setVisibleColumns({
      'Room No': true,
      'Room Type': true,
      'Inspector': true,
      'Inspection Date': true,
      'Status': true,
      'Score': true,
      'Comments': true,
      'Actions': true
    });
  };

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\n';
    
    filteredInspections.forEach(r => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'Room No') val = r.roomNo;
        if (col === 'Room Type') val = r.roomType;
        if (col === 'Inspector') val = r.inspector;
        if (col === 'Inspection Date') val = r.inspectionDate;
        if (col === 'Status') val = r.status;
        if (col === 'Score') val = r.score;
        if (col === 'Comments') val = r.comments;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'inspection_checklist.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = `
      <html>
      <head>
        <title>Inspection Checklist Report</title>
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
        <h2>Inspection Checklist Report</h2>
        <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
        <table>
          <thead>
            <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
          </thead>
          <tbody>`;
    
    filteredInspections.forEach(r => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
        if (col === 'Room No') val = r.roomNo;
        if (col === 'Room Type') val = r.roomType;
        if (col === 'Inspector') val = r.inspector;
        if (col === 'Inspection Date') val = r.inspectionDate;
        if (col === 'Status') val = r.status;
        if (col === 'Score') val = r.score;
        if (col === 'Comments') val = r.comments;
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
      roomNo: '',
      roomType: 'Deluxe',
      inspector: '',
      inspectionDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
      score: 0,
      comments: '',
      roomId: null,
      taskId: null,
      inspectorId: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingId(record.id);
    setForm({
      roomNo: record.roomNo,
      roomType: record.roomType,
      inspector: record.inspector,
      inspectionDate: record.inspectionDate || '',
      status: record.status,
      score: record.score,
      comments: record.comments,
      roomId: record.roomId || null,
      taskId: record.taskId || null,
      inspectorId: record.inspectorId || null,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = inspectionChecklistAdapter.toBackendPayload(form);
      if (editingId) {
        await inspectionService.updateInspection(editingId, payload);
      } else {
        await inspectionService.createInspection(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('[InspectionChecklist] Save error:', err);
      alert(err.message || 'Failed to save inspection');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await inspectionService.deleteInspection(recordToDelete.id);
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      await loadData();
    } catch (err) {
      console.error('[InspectionChecklist] Delete error:', err);
      alert(err.message || 'Failed to delete inspection');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Passed': return 'bg-[#f0fdf4] text-[#16a34a]';
      case 'Failed': return 'bg-[#fef2f2] text-[#ef4444]';
      case 'Pending': return 'bg-[#fff7ed] text-[#ea580c]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getScoreColor = (status) => {
    switch (status) {
      case 'Passed': return 'text-[#16a34a]';
      case 'Failed': return 'text-[#ef4444]';
      case 'Pending': return 'text-[#f97316]';
      default: return 'text-gray-600';
    }
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      backgroundColor: '#ffffff',
      fontSize: '11px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '11px',
      color: '#64748b',
      '&.Mui-focused': { color: 'var(--primary-main)' }
    }
  };

  return (
    <div className="w-full space-y-2.5 pb-3 flex flex-col">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Inspections</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{totalInspections}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <Assignment sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Passed</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{passedCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
            <CheckCircle sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Failed</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{failedCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-600">
            <Cancel sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-[10.5px] sm:text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Average Score</p>
            <p className="text-lg sm:text-xl font-bold text-gray-800 leading-none mt-1">{avgScore}%</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
            <Star sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* Error Alert */}
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
        <div className="p-2 sm:p-2.5 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xs sm:text-sm font-bold text-gray-800">Inspection Checklist</h1>
            <input 
              type="text" 
              placeholder="Search room, type, inspector..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2.5 py-1 border border-gray-200 rounded-md text-xs w-[160px] sm:w-[220px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="relative" ref={filterMenuRef}>
              <button onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50" title="Filter Columns">
                <FilterList sx={{ fontSize: 16 }} className="text-[var(--primary-main)]" />
              </button>
              {showColumnsMenu && (
                <div className="absolute right-0 top-8 w-44 bg-white shadow-lg rounded-md border border-gray-100 z-50 py-1.5 animate-fade-in">
                  <div className="px-3 py-1.5 border-b border-gray-100 text-[10.5px] font-bold text-gray-700">Show/Hide Column</div>
                  <div className="max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[var(--primary-main)] [&::-webkit-scrollbar-thumb]:rounded-full">
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer gap-2 text-[11px] text-gray-700 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col]} 
                          onChange={() => toggleColumn(col)} 
                          className="w-3.5 h-3.5 accent-[var(--primary-main)] cursor-pointer rounded-sm" 
                        />
                        {col}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleOpenNew} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50" title="New Record">
              <AddCircleOutlined sx={{ fontSize: 17 }} className="text-[var(--primary-main)]" />
            </button>
            <RefreshButton onClick={handleRefresh} />
            <button onClick={handleExportCSV} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer border border-gray-100 bg-gray-50/50" title="Export CSV">
              <TableChart sx={{ fontSize: 15 }} className="text-[#0ea5e9]" />
            </button>
            <button onClick={handleExportPDF} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer border border-gray-100 bg-gray-50/50" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 15 }} className="text-[#ef4444]" />
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="w-full overflow-hidden">
          <table className="table-fixed w-full text-left border-collapse">
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '21%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                {visibleColumns['Room No'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Room No</th>}
                {visibleColumns['Room Type'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Room Type</th>}
                {visibleColumns['Inspector'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Inspector</th>}
                {visibleColumns['Inspection Date'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Inspection Date</th>}
                {visibleColumns['Status'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>}
                {visibleColumns['Score'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Score</th>}
                {visibleColumns['Comments'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Comments</th>}
                {visibleColumns['Actions'] && <th className="py-2 px-1 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && inspections.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-6 text-center text-gray-500 text-[11.5px]">
                    Loading inspections...
                  </td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-6 text-center text-gray-500 text-[11.5px]">
                    No inspections recorded.
                  </td>
                </tr>
              ) : (
                paginatedInspections.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50/60">
                    {visibleColumns['Room No'] && <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-900 whitespace-nowrap">Room {record.roomNo}</td>}
                    {visibleColumns['Room Type'] && <td className="py-1.5 px-1.5 text-[11px] font-medium text-gray-800 whitespace-nowrap">{record.roomType}</td>}
                    {visibleColumns['Inspector'] && <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate">{record.inspector}</td>}
                    {visibleColumns['Inspection Date'] && <td className="py-1.5 px-1.5 text-[11px] text-gray-600 whitespace-nowrap">{record.inspectionDate || '-'}</td>}
                    {visibleColumns['Status'] && <td className="py-1.5 px-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold uppercase tracking-wide inline-flex items-center gap-1 ${getStatusStyles(record.status)}`}>
                        {record.status}
                      </span>
                    </td>}
                    {visibleColumns['Score'] && <td className="py-1.5 px-1.5">
                      <span className={`text-[11px] font-bold ${getScoreColor(record.status)}`}>{record.score}%</span>
                    </td>}
                    {visibleColumns['Comments'] && <td className="py-1.5 px-1.5 text-[11px] text-gray-500 truncate" title={record.comments}>{record.comments || 'No comments'}</td>}
                    {visibleColumns['Actions'] && <td className="py-1.5 px-1">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleOpenEdit(record)} className="text-[10.5px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => handleOpenDelete(record)} className="text-[10.5px] font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component="div"
          count={filteredInspections.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Items per page:"
          sx={{
            '.MuiTablePagination-toolbar': { minHeight: '34px', padding: '0 8px' },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '11px', color: '#64748b', margin: 0 },
            '.MuiTablePagination-select': { fontSize: '11px', color: '#1f2937' },
            '.MuiTablePagination-actions button': { padding: '4px' }
          }}
        />
      </div>

      {/* Add / Edit Inspection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => !formSubmitting && setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[540px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-3.5 py-2 flex items-center justify-between">
              <h2 className="text-white text-xs sm:text-sm font-semibold">
                {editingId ? `Edit Inspection: Room ${form.roomNo}` : 'New Inspection'}
              </h2>
              <button disabled={formSubmitting} onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-[11px] font-bold">
                X
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-3.5 sm:p-4 overflow-y-auto max-h-[85vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2.5">
                <TextField 
                  required 
                  label="Room No*" 
                  value={form.roomNo} 
                  onChange={e => setForm({...form, roomNo: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Room Type*</InputLabel>
                  <Select 
                    value={form.roomType} 
                    label="Room Type*" 
                    onChange={e => setForm({...form, roomType: e.target.value})}
                  >
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Deluxe">Deluxe</MenuItem>
                    <MenuItem value="Suite">Suite</MenuItem>
                    <MenuItem value="Penthouse">Penthouse</MenuItem>
                  </Select>
                </FormControl>

                <div className="flex flex-col gap-1.5">
                  {employees.length > 0 && (
                    <FormControl size="small" fullWidth sx={muiInputSx}>
                      <InputLabel>Staff Inspector</InputLabel>
                      <Select
                        value={form.inspectorId || ''}
                        label="Staff Inspector"
                        onChange={e => {
                          const empId = e.target.value;
                          const emp = employees.find(ep => (ep._id || ep.id) === empId);
                          setForm({
                            ...form,
                            inspectorId: empId,
                            inspector: emp ? `${emp.first_name} ${emp.last_name}` : form.inspector,
                          });
                        }}
                      >
                        <MenuItem value=""><em>Select Staff Inspector</em></MenuItem>
                        {employees.map(emp => (
                          <MenuItem key={emp._id || emp.id} value={emp._id || emp.id}>
                            {emp.first_name} {emp.last_name} ({emp.employee_ref || 'Staff'})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <TextField 
                    required 
                    label="Inspector Name*" 
                    value={form.inspector} 
                    onChange={e => {
                      const val = e.target.value;
                      const matched = employees.find(emp => 
                        `${emp.first_name} ${emp.last_name}`.toLowerCase() === val.trim().toLowerCase() ||
                        emp.first_name?.toLowerCase() === val.trim().toLowerCase()
                      );
                      setForm({
                        ...form,
                        inspector: val,
                        inspectorId: matched ? (matched._id || matched.id) : form.inspectorId,
                      });
                    }} 
                    sx={muiInputSx} 
                    size="small" 
                    fullWidth
                    placeholder="Enter or select staff name"
                  />
                </div>
                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, fontSize: '10.5px' }}>
                    Inspection Date*
                  </Typography>
                  <TextField
                    type="date"
                    label=""
                    required
                    value={form.inspectionDate}
                    onChange={e => setForm({ ...form, inspectionDate: e.target.value })}
                    sx={muiInputSx}
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <FormControl size="small" fullWidth sx={muiInputSx}>
                  <InputLabel>Status*</InputLabel>
                  <Select 
                    value={form.status} 
                    label="Status*" 
                    onChange={e => setForm({...form, status: e.target.value})}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Passed">Passed</MenuItem>
                    <MenuItem value="Failed">Failed</MenuItem>
                  </Select>
                </FormControl>

                <TextField 
                  type="number" 
                  label="Score (0-100)*" 
                  required
                  value={form.score} 
                  onChange={e => setForm({...form, score: Number(e.target.value)})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  inputProps={{ min: 0, max: 100 }}
                />

                <div className="md:col-span-2">
                  <TextField 
                    label="Comments / Issues Found" 
                    value={form.comments} 
                    onChange={e => setForm({...form, comments: e.target.value})} 
                    sx={muiInputSx} 
                    size="small" 
                    fullWidth 
                    multiline 
                    rows={2} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-gray-100">
                <button type="button" disabled={formSubmitting} onClick={() => setIsModalOpen(false)} className="px-3.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className="px-3.5 py-1 text-xs font-semibold text-white bg-[var(--primary-main)] hover:bg-[#156334] rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50">
                  {formSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => !deleting && setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[340px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-3.5 py-2 flex items-center justify-between">
              <h2 className="text-white text-xs sm:text-sm font-semibold">Confirm Delete?</h2>
              <button disabled={deleting} onClick={() => setIsDeleteModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-[11px] font-bold">
                X
              </button>
            </div>
            
            <div className="p-3.5 sm:p-4">
              <p className="text-xs text-gray-700 font-medium">
                Are you sure you want to delete the inspection record for Room <span className="font-bold text-gray-900">{recordToDelete.roomNo}</span>?
              </p>
              
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-gray-100">
                <button disabled={deleting} onClick={() => setIsDeleteModalOpen(false)} className="px-3.5 py-1 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50">
                  Cancel
                </button>
                <button disabled={deleting} onClick={handleDelete} className="px-3.5 py-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors cursor-pointer shadow-xs disabled:opacity-50">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
