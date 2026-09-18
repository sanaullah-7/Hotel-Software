import { FilterList, AddCircleOutlined, Refresh, TableChart, PictureAsPdf } from '@mui/icons-material';
import React, { useState, useRef, useEffect } from 'react';

import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment , TablePagination } from '@mui/material';

const initialInspections = [
  {
    id: 1,
    roomNo: '101',
    roomType: 'Deluxe',
    inspector: 'John Smith',
    status: 'Passed',
    inspectionDate: '2026-02-02',
    score: 95,
    comments: 'Room is in excellent condition.'
  },
  {
    id: 2,
    roomNo: '102',
    roomType: 'Deluxe',
    inspector: 'Jane Doe',
    status: 'Failed',
    inspectionDate: '2026-02-01',
    score: 65,
    comments: 'Dust found under the bed.'
  },
  {
    id: 3,
    roomNo: '201',
    roomType: 'Suite',
    inspector: 'Mike Ross',
    status: 'Pending',
    inspectionDate: '2026-02-02',
    score: 0,
    comments: 'Scheduled for afternoon.'
  },
  {
    id: 4,
    roomNo: '205',
    roomType: 'Standard',
    inspector: 'Sarah Connor',
    status: 'Pending',
    inspectionDate: '2026-02-03',
    score: 0,
    comments: 'Awaiting inspector availability.'
  },
  {
    id: 5,
    roomNo: '305',
    roomType: 'Suite',
    inspector: 'John Smith',
    status: 'Passed',
    inspectionDate: '2026-02-04',
    score: 98,
    comments: 'Perfect condition.'
  },
  {
    id: 6,
    roomNo: '110',
    roomType: 'Deluxe',
    inspector: 'Jane Doe',
    status: 'Failed',
    inspectionDate: '2026-02-03',
    score: 55,
    comments: 'Carpet needs vacuuming.'
  },
  {
    id: 7,
    roomNo: '402',
    roomType: 'Standard',
    inspector: 'Mike Ross',
    status: 'Pending',
    inspectionDate: '2026-02-05',
    score: 0,
    comments: 'Scheduled for tomorrow morning.'
  },
  {
    id: 8,
    roomNo: '215',
    roomType: 'Suite',
    inspector: 'Sarah Connor',
    status: 'Passed',
    inspectionDate: '2026-02-01',
    score: 92,
    comments: 'Very clean, all amenities present.'
  },
  {
    id: 9,
    roomNo: '501',
    roomType: 'Penthous',
    inspector: 'John Smith',
    status: 'Pending',
    inspectionDate: '2026-02-06',
    score: 0,
    comments: 'VIP arrival tomorrow.'
  },
  {
    id: 10,
    roomNo: '105',
    roomType: 'Deluxe',
    inspector: 'Jane Doe',
    status: 'Passed',
    inspectionDate: '2026-02-02',
    score: 96,
    comments: 'Immaculate condition.'
  },
  {
    id: 11,
    roomNo: '312',
    roomType: 'Standard',
    inspector: 'Sarah Connor',
    status: 'Failed',
    inspectionDate: '2026-02-04',
    score: 45,
    comments: 'AC not working, bathroom lights.'
  },
  {
    id: 12,
    roomNo: '418',
    roomType: 'Suite',
    inspector: 'Mike Ross',
    status: 'Passed',
    inspectionDate: '2026-02-01',
    score: 90,
    comments: 'Passed with minor marks.'
  }
];

export default function InspectionChecklist() {
  const [inspections, setInspections] = useState(initialInspections);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const [form, setForm] = useState({
    roomNo: '',
    roomType: 'Deluxe',
    inspector: '',
    inspectionDate: '',
    status: 'Pending',
    score: 0,
    comments: ''
  });

  // Derived Summary Stats
  const totalInspections = inspections.length;
  const passedCount = inspections.filter(t => t.status === 'Passed').length;
  const failedCount = inspections.filter(t => t.status === 'Failed').length;
  const avgScore = totalInspections === 0 ? 0 : Math.round(inspections.reduce((acc, curr) => acc + Number(curr.score || 0), 0) / totalInspections);

  
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
    'Room No': true, 'Room Type': true, 'Inspector': true, 'Inspection Date': true, 'Status': true, 'Score': true, 'Comments': true, 'Actions': true
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
      'Room No': true, 'Room Type': true, 'Inspector': true, 'Inspection Date': true, 'Status': true, 'Score': true, 'Comments': true, 'Actions': true
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
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; color: #1e293b; }
            h2 { color: #0f172a; margin-bottom: 5px; }
            .meta { color: #64748b; font-size: 13px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h2>Inspection Checklist Report</h2>
          <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
    `;
    
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
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({ roomNo: '', roomType: 'Deluxe', inspector: '', inspectionDate: '', status: 'Pending', score: 0, comments: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingId(record.id);
    setForm({ ...record });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      setInspections(paginatedInspections.map(t => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setInspections([...inspections, { ...form, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenDelete = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setInspections(inspections.filter(t => t.id !== recordToDelete.id));
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
  };

    const getStatusBorderColor = (status) => {
    switch (status) {
      case 'Passed': return '#16a34a';
      case 'Failed': return '#ef4444';
      case 'Pending': return '#f97316';
      default: return '#9ca3af';
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Passed': return 'bg-[#dcfce7] text-[#16a34a]';
      case 'Failed': return 'bg-[#fee2e2] text-[#ef4444]';
      case 'Pending': return 'bg-[#ffedd5] text-[#f97316]';
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

  const getProgressBarColor = (status) => {
    switch (status) {
      case 'Passed': return 'bg-[#16a34a]';
      case 'Failed': return 'bg-[#1f2937]'; // In screenshot, failed progress bar is dark grey/black
      case 'Pending': return 'bg-[#e5e7eb]'; // Very light gray for pending
      default: return 'bg-gray-200';
    }
  };

  const muiInputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      fontSize: '13px',
      color: '#1f2937',
      '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: 'var(--primary-main)', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      fontSize: '13px',
      color: '#64748b',
      '&.Mui-focused': { color: 'var(--primary-main)' }
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-1 min-h-screen gap-1">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-[12px] font-bold text-gray-500">Total Inspections</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{totalInspections}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-[12px] font-bold text-gray-500">Passed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{passedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-[12px] font-bold text-gray-500">Failed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{failedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-[12px] font-bold text-gray-500">Average Score</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{avgScore}%</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5 flex-1">
        {/* Table Header with Title & Button */}
        <div className="p-2.5 flex items-center justify-between border-b border-gray-100 gap-4">
          <div className="flex flex-nowrap items-center gap-4 shrink-0">
             <h1 className="text-[18px] font-bold text-gray-800 whitespace-nowrap">Inspection Checklist</h1>
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="px-3 py-1.5 border border-gray-200 rounded-md text-[13px] w-[250px] focus:outline-none focus:border-[var(--primary-main)] focus:ring-1 focus:ring-[var(--primary-main)] transition-colors"
             />
          </div>
          
          
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterMenuRef}>
              <button onClick={() => setShowColumnsMenu(!showColumnsMenu)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Filter">
                <FilterList sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
              </button>
              {showColumnsMenu && (
                <div className="absolute right-0 top-10 w-48 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-md border border-gray-100 z-50 py-2 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 text-[11px] font-bold text-gray-700">Show/Hide Column</div>
                  <div className="max-h-[250px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-[var(--primary-main)] [&::-webkit-scrollbar-thumb]:rounded-full">
                    {Object.keys(visibleColumns).map(col => (
                      <label key={col} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer gap-3 text-[13px] text-gray-700 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col]} 
                          onChange={() => toggleColumn(col)} 
                          className="w-4 h-4 accent-[var(--primary-main)] cursor-pointer rounded-sm" 
                        />
                        {col}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleOpenNew} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="New Record">
              <AddCircleOutlined sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <button onClick={handleRefresh} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
              <Refresh sx={{ fontSize: 20 }} className="text-[var(--primary-main)]" />
            </button>
            <button onClick={handleExportCSV} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Export CSV">
              <TableChart sx={{ fontSize: 18 }} className="text-[#0ea5e9]" />
            </button>
            <button onClick={handleExportPDF} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors cursor-pointer" title="Export PDF">
              <PictureAsPdf sx={{ fontSize: 18 }} className="text-[#ef4444]" />
            </button>
          </div>

        </div>
        
        {/* Table */}
        <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:h-2">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                {visibleColumns['Room No'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Room No</th>}
                {visibleColumns['Room Type'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Room Type</th>}
                {visibleColumns['Inspector'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Inspector</th>}
                {visibleColumns['Inspection Date'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Inspection Date</th>}
                {visibleColumns['Status'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Status</th>}
                {visibleColumns['Score'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Score</th>}
                {visibleColumns['Comments'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Comments</th>}
                {visibleColumns['Actions'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-10 text-center text-gray-500 text-[13px]">
                    No inspections recorded.
                  </td>
                </tr>
              ) : (
                paginatedInspections.map(record => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {visibleColumns['Room No'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-800">Room {record.roomNo}</td>}
                    {visibleColumns['Room Type'] && <td className="py-3 px-3 text-[12px] font-medium text-gray-600">{record.roomType}</td>}
                    {visibleColumns['Inspector'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{record.inspector}</td>}
                    {visibleColumns['Inspection Date'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{record.inspectionDate || '-'}</td>}
                    {visibleColumns['Status'] && <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${getStatusStyles(record.status)}`}>
                        {record.status}
                      </span>
                    </td>}
                    {visibleColumns['Score'] && <td className="py-3 px-3">
                      <span className={`text-[13px] font-bold ${getScoreColor(record.status)}`}>{record.score}%</span>
                    </td>}
                    {visibleColumns['Comments'] && <td className="py-3 px-3 text-[13px] font-medium text-gray-500 italic max-w-[200px] truncate" title={record.comments}>{record.comments || 'No comments'}</td>}
                    {visibleColumns['Actions'] && <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenEdit(record)} className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => handleOpenDelete(record)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">
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
            '.MuiTablePagination-toolbar': { minHeight: '40px', padding: '0 16px' },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '13px', color: '#64748b', margin: 0 },
            '.MuiTablePagination-select': { fontSize: '13px', color: '#1f2937' },
          }}
        />
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">
                {editingId ? `Edit Inspection: Room ${form.roomNo}` : 'New Inspection'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-[12px] font-bold">
                X
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                
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

                <TextField 
                  required 
                  label="Inspector Name*" 
                  value={form.inspector} 
                  onChange={e => setForm({...form, inspector: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth
                />

                <TextField 
                  type="date" 
                  label="Inspection Date*" 
                  required
                  value={form.inspectionDate} 
                  onChange={e => setForm({...form, inspectionDate: e.target.value})} 
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
                    rows={3} 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-8">
                <button type="submit" className="px-6 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
                  Save
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">Confirm Delete?</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-[12px] font-bold">
                X
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[14px] text-gray-700 font-medium">
                Are you sure you want to delete the inspection record for Room <b>{recordToDelete.roomNo}</b>?
              </p>
              
              <div className="flex justify-center gap-3 mt-8">
                <button onClick={handleDelete} className="px-6 py-2 rounded-full border border-transparent bg-[#fce7f3] text-[#e11d48] font-bold text-[13.5px] hover:bg-[#fbcfe8] transition-colors cursor-pointer shadow-sm">
                  Delete
                </button>
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 rounded-full bg-green-50 text-[var(--primary-main)] border border-green-200 font-bold text-[13.5px] hover:bg-green-100 transition-colors cursor-pointer shadow-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
