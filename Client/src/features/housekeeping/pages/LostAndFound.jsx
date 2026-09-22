import { FilterList, AddCircleOutlined, Refresh, TableChart, PictureAsPdf, Category, Inventory, CheckCircle, Delete } from'@mui/icons-material';
import React, { useState, useRef, useEffect } from'react';

import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment , TablePagination, Typography, Box } from'@mui/material';

const initialItems = [
 {
 id: 1,
 itemName:'iPhone 13 Charger',
 location:'101',
 status:'Found',
 foundDate:'2026-02-01',
 finderName:'John Doe',
 description:'White color Apple charger'
 },
 {
 id: 2,
 itemName:'Gold Bracelet',
 location:'205',
 status:'Returned',
 foundDate:'2026-01-28',
 finderName:'Jane Smith',
 description:'Thin gold bracelet'
 },
 {
 id: 3,
 itemName:'Blue Sunglasses',
 location:'Pool Area',
 status:'Found',
 foundDate:'2026-02-02',
 finderName:'Robert Brown',
 description:'Ray-Ban sunglasses'
 },
 {
 id: 4,
 itemName:'Leather Wallet',
 location:'Lobby',
 status:'Claimed',
 foundDate:'2026-01-30',
 finderName:'Maria Garcia',
 description:'Brown leather wallet with ID cards'
 },
 {
 id: 5,
 itemName:'Silver Watch',
 location:'Gym',
 status:'Found',
 foundDate:'2026-02-05',
 finderName:'Alice Green',
 description:'Men\'s silver wristwatch'
 },
 {
 id: 6,
 itemName:'Black Backpack',
 location:'Lobby',
 status:'Claimed',
 foundDate:'2026-02-04',
 finderName:'David Lee',
 description:'Contains books and a water bottle'
 },
 {
 id: 7,
 itemName:'Diamond Ring',
 location:'402',
 status:'Returned',
 foundDate:'2026-02-01',
 finderName:'Sarah Connor',
 description:'Gold ring with small diamond'
 },
 {
 id: 8,
 itemName:'Winter Coat',
 location:'Restaurant',
 status:'Disposed',
 foundDate:'2025-11-20',
 finderName:'Tom White',
 description:'Unclaimed over 60 days'
 },
 {
 id: 9,
 itemName:'Laptop Charger',
 location:'Conference Room',
 status:'Found',
 foundDate:'2026-02-06',
 finderName:'Maria Garcia',
 description:'Black Dell 65W charger'
 },
 {
 id: 10,
 itemName:'AirPods Pro',
 location:'Pool Area',
 status:'Claimed',
 foundDate:'2026-02-05',
 finderName:'John Doe',
 description:'White case with blue cover'
 },
 {
 id: 11,
 itemName:'Umbrella',
 location:'Lobby',
 status:'Returned',
 foundDate:'2026-02-03',
 finderName:'Alice Green',
 description:'Large black golf umbrella'
 },
 {
 id: 12,
 itemName:'Reading Glasses',
 location:'Restaurant',
 status:'Found',
 foundDate:'2026-02-07',
 finderName:'Tom White',
 description:'Black frame, left on table 12'
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
 itemName:'',
 location:'',
 status:'Found',
 foundDate:'',
 finderName:'',
 description:''
 });

 // Derived Summary Stats
 const totalCount = items.length;
 const unclaimedCount = items.filter(t => t.status ==='Found').length;
 const claimedReturnedCount = items.filter(t => t.status ==='Claimed' || t.status ==='Returned').length;
 const disposedCount = items.filter(t => t.status ==='Disposed').length;

 
 const filteredItems = items.filter(item => 
 (item.itemName ||'').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
 (item.location ||'').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
 (item.finderName ||'').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
 (item.status ||'').toString().toLowerCase().includes(searchTerm.toLowerCase())
 );
 
 const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

 const handleChangePage = (event, newPage) => {
 setPage(newPage);
 };

 const handleChangeRowsPerPage = (event) => {
 setRowsPerPage(parseInt(event.target.value, 10));
 setPage(0);
 };

 
 const [visibleColumns, setVisibleColumns] = useState({'Item Name': true,'Location': true,'Found Date': true,'Finder': true,'Status': true,'Description': true,'Actions': true
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
 setVisibleColumns({'Item Name': true,'Location': true,'Found Date': true,'Finder': true,'Status': true,'Description': true,'Actions': true
 });
 };

 const handleExportCSV = () => {
 const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !=='Actions');
 let csvContent = activeCols.join(',') +'\n';
 
 filteredItems.forEach(r => {
 const row = activeCols.map(col => {
 let val ='';
 if (col ==='Item Name') val = r.itemName;
 if (col ==='Location') val = r.location;
 if (col ==='Found Date') val = r.foundDate;
 if (col ==='Finder') val = r.finderName;
 if (col ==='Status') val = r.status;
 if (col ==='Description') val = r.description;
 return`"${(val ||'').toString().replace(/"/g,'""')}"`;
 });
 csvContent += row.join(',') +'\n';
 });
 
 const blob = new Blob([csvContent], { type:'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.download ='lost_and_found.csv';
 link.click();
 };

 const handleExportPDF = () => {
 const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !=='Actions');
 let html =`
 <html>
 <head>
 <title>Lost and Found Report</title>
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
 <h2>Lost and Found Report</h2>
 <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
 <table>
 <thead>
 <tr>${activeCols.map(c =>`<th>${c}</th>`).join('')}</tr>
 </thead>
 <tbody>`;
 
 filteredItems.forEach(r => {
 html +='<tr>';
 activeCols.forEach(col => {
 let val ='';
 if (col ==='Item Name') val = r.itemName;
 if (col ==='Location') val = r.location;
 if (col ==='Found Date') val = r.foundDate;
 if (col ==='Finder') val = r.finderName;
 if (col ==='Status') val = r.status;
 if (col ==='Description') val = r.description;
 html +=`<td>${val}</td>`;
 });
 html +='</tr>';
 });
 
 html +=`
 </tbody>
 </table>
 <script>
 window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };
 </script>
 </body>
 </html>`;
 
 const printWindow = window.open('','_blank');
 printWindow.document.write(html);
 printWindow.document.close();
 };

 const handleOpenNew = () => {
 setEditingId(null);
 setForm({ itemName:'', location:'', status:'Found', foundDate:'', finderName:'', description:'' });
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

 const getStatusBorderColor = (status) => {
 switch (status) {
 case'Found': return'#3b82f6';
 case'Returned': return'#16a34a';
 case'Claimed': return'#ea580c';
 case'Disposed': return'#64748b';
 default: return'#9ca3af';
 }
 };

 const getStatusStyles = (status) => {
 switch (status) {
 case'Found': return'bg-[#eff6ff] text-[#3b82f6]';
 case'Returned': return'bg-[#f0fdf4] text-[#16a34a]';
 case'Claimed': return'bg-[#fff7ed] text-[#ea580c]';
 case'Disposed': return'bg-[#f1f5f9] text-[#64748b]';
 default: return'bg-gray-100 text-gray-600';
 }
 };

 const muiInputSx = {'& .MuiOutlinedInput-root': {
 borderRadius:'8px',
 backgroundColor:'#ffffff',
 fontSize:'13px',
 color:'#1f2937','& fieldset': { borderColor:'#e2e8f0', borderWidth:'1px' },'&:hover fieldset': { borderColor:'#cbd5e1' },'&.Mui-focused fieldset': { borderColor:'var(--primary-main)', borderWidth:'1.5px' },
 },'& .MuiInputLabel-root': {
 fontSize:'13px',
 color:'#64748b','&.Mui-focused': { color:'var(--primary-main)' }
 }
 };

 return (
 <div className="w-full h-full flex flex-col pt-1 min-h-screen gap-1">
 {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[12px] font-bold text-gray-500">Total Items</p>
              <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{totalCount}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
              <Category sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[12px] font-bold text-gray-500">Unclaimed</p>
              <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{unclaimedCount}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">
              <Inventory sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[12px] font-bold text-gray-500">Returned/Claimed</p>
              <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{claimedReturnedCount}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
              <CheckCircle sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[12px] font-bold text-gray-500">Disposed</p>
              <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{disposedCount}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600">
              <Delete sx={{ fontSize: 18 }} />
            </div>
          </div>
        </div>

        {/* Table Section */}
 <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5 flex-1">
 {/* Table Header with Title & Button */}
 <div className="p-2.5 flex items-center justify-between border-b border-gray-100 gap-4">
 <div className="flex flex-nowrap items-center gap-4 shrink-0">
 <h1 className="text-[18px] font-bold text-gray-800">Lost & Found Management</h1>
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
 <div className="flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:h-2">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-gray-50/50 border-b border-gray-100">
 {visibleColumns['Item Name'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Item Name</th>}
 {visibleColumns['Location'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Location</th>}
 {visibleColumns['Found Date'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Found Date</th>}
 {visibleColumns['Finder'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Finder</th>}
 {visibleColumns['Status'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Status</th>}
 {visibleColumns['Description'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Description</th>}
 {visibleColumns['Actions'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700 text-center">Actions</th>}
 </tr>
 </thead>
 <tbody>
 {filteredItems.length === 0 ? (
 <tr>
 <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-10 text-center text-gray-500 text-[13px]">
 No lost and found items recorded.
 </td>
 </tr>
 ) : (
 paginatedItems.map(item => (
 <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
 {visibleColumns['Item Name'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-800">{item.itemName}</td>}
 {visibleColumns['Location'] && <td className="py-3 px-3 text-[12px] font-medium text-gray-600">{item.location}</td>}
 {visibleColumns['Found Date'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{item.foundDate}</td>}
 {visibleColumns['Finder'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{item.finderName ||'-'}</td>}
 {visibleColumns['Status'] && <td className="py-3 px-3">
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${getStatusStyles(item.status)}`}>
 {item.status}
 </span>
 </td>}
 {visibleColumns['Description'] && <td className="py-3 px-3 text-[13px] font-medium text-gray-500 italic max-w-[200px] truncate" title={item.description}>{item.description ||'No description available'}</td>}
 {visibleColumns['Actions'] && <td className="py-3 px-3">
 <div className="flex items-center justify-center gap-3">
 <button onClick={() => handleOpenEdit(item)} className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
 Edit
 </button>
 <button onClick={() => handleOpenDelete(item)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">
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
 count={filteredItems.length}
 page={page}
 onPageChange={handleChangePage}
 rowsPerPage={rowsPerPage}
 onRowsPerPageChange={handleChangeRowsPerPage}
 labelRowsPerPage="Items per page:"
 sx={{'.MuiTablePagination-toolbar': { minHeight:'40px', padding:'0 16px' },'.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize:'13px', color:'#64748b', margin: 0 },'.MuiTablePagination-select': { fontSize:'13px', color:'#1f2937' },
 }}
 />
 </div>

 {/* Add / Edit Task Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
 <div className="bg-white rounded-lg shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
 <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
 <h2 className="text-white text-[16px] font-bold">
 {editingId ?`Edit Item: ${form.itemName}` :'New Lost & Found Item'}
 </h2>
 <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-[12px] font-bold">
 X
 </button>
 </div>
 
 <form onSubmit={handleSave} className="p-6 overflow-y-auto max-h-[80vh]">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
 
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

<Box>
  <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
    Date Found*
  </Typography>
  <TextField
    type="date"
    label=""
    required
    value={form.foundDate}
    onChange={e => setForm({ ...form, foundDate: e.target.value })}
    sx={muiInputSx}
    size="small"
    fullWidth
    InputLabelProps={{ shrink: true }}
  />
</Box> <FormControl size="small" fullWidth sx={muiInputSx}>
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

 <div className="md:col-span-2">
 <TextField 
 label="Finder Name" 
 value={form.finderName} 
 onChange={e => setForm({...form, finderName: e.target.value})} 
 sx={muiInputSx} 
 size="small" 
 fullWidth 
 />
 </div>

 <div className="md:col-span-2">
 <TextField 
 label="Description & Details" 
 value={form.description} 
 onChange={e => setForm({...form, description: e.target.value})} 
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
 {isDeleteModalOpen && itemToDelete && (
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
 Are you sure you want to delete the record for <b>{itemToDelete.itemName}</b>?
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
