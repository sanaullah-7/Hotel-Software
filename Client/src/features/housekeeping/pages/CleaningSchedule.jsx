import { FilterList, AddCircleOutlined, Refresh, TableChart, PictureAsPdf,HourglassEmpty , Autorenew ,CheckCircle, Warning  } from'@mui/icons-material';
import React, { useState, useRef, useEffect } from'react';

import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment , TablePagination } from'@mui/material';

const initialTasks = [
 {
 id: 1,
 roomNo:'101',
 taskType:'Full Clean',
 assignedStaff:'John Doe',
 startTime:'09:00',
 endTime:'10:00',
 priority:'High',
 status:'In Progress',
 notes:'Guest checked out late'
 },
 {
 id: 2,
 roomNo:'205',
 taskType:'Quick Clean',
 assignedStaff:'Jane Smith',
 startTime:'10:30',
 endTime:'11:00',
 priority:'Medium',
 status:'Pending',
 notes:'Stay-over cleaning'
 },
 {
 id: 3,
 roomNo:'302',
 taskType:'Turn Down',
 assignedStaff:'Robert Brown',
 startTime:'18:00',
 endTime:'18:30',
 priority:'Low',
 status:'Completed',
 notes:'No notes available'
 },
 {
 id: 4,
 roomNo:'401',
 taskType:'Deep Clean',
 assignedStaff:'Emily Davis',
 startTime:'11:00',
 endTime:'12:30',
 priority:'High',
 status:'Pending',
 notes:'VIP guest arrival'
 },
 {
 id: 5,
 roomNo:'110',
 taskType:'Quick Clean',
 assignedStaff:'Michael Lee',
 startTime:'13:00',
 endTime:'13:30',
 priority:'Low',
 status:'In Progress',
 notes:'Towel refresh'
 },
 {
 id: 6,
 roomNo:'215',
 taskType:'Full Clean',
 assignedStaff:'Sarah Wilson',
 startTime:'14:00',
 endTime:'15:00',
 priority:'Medium',
 status:'Pending',
 notes:'Regular check-out'
 },
 {
 id: 7,
 roomNo:'305',
 taskType:'Turn Down',
 assignedStaff:'John Doe',
 startTime:'19:00',
 endTime:'19:30',
 priority:'Low',
 status:'Completed',
 notes:'Evening service'
 },
 {
 id: 8,
 roomNo:'105',
 taskType:'Full Clean',
 assignedStaff:'Jane Smith',
 startTime:'15:30',
 endTime:'16:30',
 priority:'High',
 status:'Delayed',
 notes:'Guest requested later time'
 },
 {
 id: 9,
 roomNo:'501',
 taskType:'Deep Clean',
 assignedStaff:'Emily Davis',
 startTime:'08:00',
 endTime:'10:00',
 priority:'High',
 status:'In Progress',
 notes:'VIP check-in today'
 },
 {
 id: 10,
 roomNo:'312',
 taskType:'Full Clean',
 assignedStaff:'Robert Brown',
 startTime:'10:00',
 endTime:'11:00',
 priority:'Medium',
 status:'Pending',
 notes:'Standard service'
 },
 {
 id: 11,
 roomNo:'418',
 taskType:'Turn Down',
 assignedStaff:'Jane Smith',
 startTime:'18:30',
 endTime:'19:00',
 priority:'Low',
 status:'Completed',
 notes:'Refresh towels'
 },
 {
 id: 12,
 roomNo:'108',
 taskType:'Quick Clean',
 assignedStaff:'Michael Lee',
 startTime:'12:00',
 endTime:'12:30',
 priority:'Medium',
 status:'Pending',
 notes:'Guest requested early'
 }
];

const formatTime = (time24) => {
 if (!time24) return'';
 const [hour, minute] = time24.split(':');
 const h = parseInt(hour, 10);
 const ampm = h >= 12 ?'PM' :'AM';
 const formattedHour = h % 12 || 12;
 return`${formattedHour.toString().padStart(2,'0')}:${minute} ${ampm}`;
};

export default function CleaningSchedule() {
 const [tasks, setTasks] = useState(initialTasks);
 const [searchTerm, setSearchTerm] = useState('');
 const [page, setPage] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(10);

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [editingId, setEditingId] = useState(null);
 const [taskToDelete, setTaskToDelete] = useState(null);

 const [form, setForm] = useState({
 roomNo:'',
 taskType:'',
 priority:'Medium',
 status:'Pending',
 assignedStaff:'',
 startTime:'',
 endTime:'',
 notes:''
 });

 // Derived Summary Stats
 const pendingCount = tasks.filter(t => t.status ==='Pending').length;
 const inProgressCount = tasks.filter(t => t.status ==='In Progress').length;
 const completedCount = tasks.filter(t => t.status ==='Completed').length;
 const delayedCount = tasks.filter(t => t.status ==='Delayed').length;

 
 const filteredTasks = tasks.filter(item => 
 (item.roomNo ||'').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
 (item.taskType ||'').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
 (item.assignedStaff ||'').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
 (item.status ||'').toString().toLowerCase().includes(searchTerm.toLowerCase())
 );
 
 const paginatedTasks = filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

 const handleChangePage = (event, newPage) => {
 setPage(newPage);
 };

 const handleChangeRowsPerPage = (event) => {
 setRowsPerPage(parseInt(event.target.value, 10));
 setPage(0);
 };

 
 const [visibleColumns, setVisibleColumns] = useState({'Room No': true,'Task Type': true,'Assigned Staff': true,'Time Slot': true,'Priority': true,'Status': true,'Notes': true,'Actions': true
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
 setVisibleColumns({'Room No': true,'Task Type': true,'Assigned Staff': true,'Time Slot': true,'Priority': true,'Status': true,'Notes': true,'Actions': true
 });
 };

 const handleExportCSV = () => {
 const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !=='Actions');
 let csvContent = activeCols.join(',') +'\n';
 
 filteredTasks.forEach(r => {
 const row = activeCols.map(col => {
 let val ='';
 if (col ==='Room No') val = r.roomNo;
 if (col ==='Task Type') val = r.taskType;
 if (col ==='Assigned Staff') val = r.assignedStaff;
 if (col ==='Time Slot') val = r.startTime +" -" + r.endTime;
 if (col ==='Priority') val = r.priority;
 if (col ==='Status') val = r.status;
 if (col ==='Notes') val = r.notes;
 return`"${(val ||'').toString().replace(/"/g,'""')}"`;
 });
 csvContent += row.join(',') +'\n';
 });
 
 const blob = new Blob([csvContent], { type:'text/csv;charset=utf-8;' });
 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.download ='cleaning_schedule.csv';
 link.click();
 };

 const handleExportPDF = () => {
 const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !=='Actions');
 let html =`
 <html>
 <head>
 <title>Cleaning Schedule Report</title>
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
 <h2>Cleaning Schedule Report</h2>
 <div class="meta">Generated on: ${new Date().toLocaleDateString()}</div>
 <table>
 <thead>
 <tr>${activeCols.map(c =>`<th>${c}</th>`).join('')}</tr>
 </thead>
 <tbody>`;
 
 filteredTasks.forEach(r => {
 html +='<tr>';
 activeCols.forEach(col => {
 let val ='';
 if (col ==='Room No') val = r.roomNo;
 if (col ==='Task Type') val = r.taskType;
 if (col ==='Assigned Staff') val = r.assignedStaff;
 if (col ==='Time Slot') val = r.startTime +" -" + r.endTime;
 if (col ==='Priority') val = r.priority;
 if (col ==='Status') val = r.status;
 if (col ==='Notes') val = r.notes;
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
 setForm({ roomNo:'', taskType:'', priority:'Medium', status:'Pending', assignedStaff:'', startTime:'', endTime:'', notes:'' });
 setIsModalOpen(true);
 };

 const handleOpenEdit = (task) => {
 setEditingId(task.id);
 setForm({ ...task });
 setIsModalOpen(true);
 };

 const handleSave = (e) => {
 e.preventDefault();
 if (editingId) {
 setTasks(paginatedTasks.map(t => t.id === editingId ? { ...t, ...form } : t));
 } else {
 setTasks([...tasks, { ...form, id: Date.now() }]);
 }
 setIsModalOpen(false);
 };

 const handleOpenDelete = (task) => {
 setTaskToDelete(task);
 setIsDeleteModalOpen(true);
 };

 const handleDelete = () => {
 setTasks(tasks.filter(t => t.id !== taskToDelete.id));
 setIsDeleteModalOpen(false);
 setTaskToDelete(null);
 };

 const getStatusBorderColor = (status) => {
 switch (status) {
 case'Pending': return'#ea580c';
 case'In Progress': return'#3b82f6';
 case'Completed': return'#16a34a';
 case'Delayed': return'#dc2626';
 default: return'#9ca3af';
 }
 };

 const getStatusStyles = (status) => {
 switch (status) {
 case'Pending': return'bg-[#fff7ed] text-[#ea580c]';
 case'In Progress': return'bg-[#eff6ff] text-[#3b82f6]';
 case'Completed': return'bg-[#f0fdf4] text-[#16a34a]';
 case'Delayed': return'bg-[#fef2f2] text-[#dc2626]';
 default: return'bg-gray-100 text-gray-600';
 }
 };

 const getPriorityColor = (priority) => {
 switch (priority) {
 case'High': return'text-[#ef4444]';
 case'Medium': return'text-[#f59e0b]';
 case'Low': return'text-[#10b981]';
 default: return'text-gray-500';
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
              <p className="text-[12px] font-bold text-gray-500">Pending</p>
              <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{pendingCount}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-50 text-orange-600">
              <HourglassEmpty sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[12px] font-bold text-gray-500">In Progress</p>
              <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{inProgressCount}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
              <Autorenew sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[12px] font-bold text-gray-500">Completed</p>
              <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{completedCount}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
              <CheckCircle sx={{ fontSize: 18 }} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
            <div className="text-left">
              <p className="text-[12px] font-bold text-gray-500">Delayed</p>
              <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{delayedCount}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-600">
              <Warning sx={{ fontSize: 18 }} />
            </div>
          </div>
        </div>

        {/* Table Section */}
 <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5 flex-1">
 {/* Table Header with Title & Button */}
 <div className="p-2.5 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 gap-3">
 <div className="flex flex-wrap items-center gap-3">
 <h1 className="text-[18px] font-bold text-gray-800">Today's Cleaning Schedule</h1>
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
 <div className="flex-1 w-full overflow-x-auto min-w-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:h-2">
 <table className="w-full text-left min-w-[700px]">
 <thead>
 <tr className="bg-gray-50/50 border-b border-gray-100">
 {visibleColumns['Room No'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Room No</th>}
 {visibleColumns['Task Type'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Task Type</th>}
 {visibleColumns['Assigned Staff'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Assigned Staff</th>}
 {visibleColumns['Time Slot'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Time Slot</th>}
 {visibleColumns['Priority'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Priority</th>}
 {visibleColumns['Status'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Status</th>}
 {visibleColumns['Notes'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Notes</th>}
 {visibleColumns['Actions'] && <th className="py-3 px-3 text-[11px] font-bold text-gray-700 text-center">Actions</th>}
 </tr>
 </thead>
 <tbody>
 {filteredTasks.length === 0 ? (
 <tr>
 <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-10 text-center text-gray-500 text-[13px]">
 No cleaning tasks scheduled for today.
 </td>
 </tr>
 ) : (
 paginatedTasks.map(task => (
 <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
 {visibleColumns['Room No'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-800">Room {task.roomNo}</td>}
 {visibleColumns['Task Type'] && <td className="py-3 px-3 text-[12px] font-medium text-gray-600">{task.taskType}</td>}
 {visibleColumns['Assigned Staff'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{task.assignedStaff ||'Unassigned'}</td>}
 {visibleColumns['Time Slot'] && <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{formatTime(task.startTime)} - {formatTime(task.endTime)}</td>}
 {visibleColumns['Priority'] && <td className={`py-3 px-3 text-[13px] font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</td>}
 {visibleColumns['Status'] && <td className="py-3 px-3">
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${getStatusStyles(task.status)}`}>
 {task.status}
 </span>
 </td>}
 {visibleColumns['Notes'] && <td className="py-3 px-3 text-[13px] font-medium text-gray-500 italic max-w-[200px] truncate" title={task.notes}>{task.notes ||'No notes available'}</td>}
 {visibleColumns['Actions'] && <td className="py-3 px-3">
 <div className="flex items-center justify-center gap-3">
 <button onClick={() => handleOpenEdit(task)} className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
 Edit
 </button>
 <button onClick={() => handleOpenDelete(task)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">
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
 count={filteredTasks.length}
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
 {editingId ?`Edit Task for Room ${form.roomNo}` :'New Cleaning Task'}
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
 <InputLabel>Task Type*</InputLabel>
 <Select 
 value={form.taskType} 
 label="Task Type*" 
 onChange={e => setForm({...form, taskType: e.target.value})}
 >
 <MenuItem value="Full Clean">Full Clean</MenuItem>
 <MenuItem value="Quick Clean">Quick Clean</MenuItem>
 <MenuItem value="Turn Down">Turn Down</MenuItem>
 <MenuItem value="Deep Clean">Deep Clean</MenuItem>
 </Select>
 </FormControl>

 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Priority*</InputLabel>
 <Select 
 value={form.priority} 
 label="Priority*" 
 onChange={e => setForm({...form, priority: e.target.value})}
 >
 <MenuItem value="High">High</MenuItem>
 <MenuItem value="Medium">Medium</MenuItem>
 <MenuItem value="Low">Low</MenuItem>
 </Select>
 </FormControl>

 <FormControl size="small" fullWidth sx={muiInputSx}>
 <InputLabel>Status*</InputLabel>
 <Select 
 value={form.status} 
 label="Status*" 
 onChange={e => setForm({...form, status: e.target.value})}
 >
 <MenuItem value="Pending">Pending</MenuItem>
 <MenuItem value="In Progress">In Progress</MenuItem>
 <MenuItem value="Completed">Completed</MenuItem>
 <MenuItem value="Delayed">Delayed</MenuItem>
 </Select>
 </FormControl>

 <div className="md:col-span-2">
 <TextField 
 label="Assigned Staff" 
 value={form.assignedStaff} 
 onChange={e => setForm({...form, assignedStaff: e.target.value})} 
 sx={muiInputSx} 
 size="small" 
 fullWidth 
 />
 </div>

 <TextField 
 type="time" 
 label="Start Time" 
 value={form.startTime} 
 onChange={e => setForm({...form, startTime: e.target.value})} 
 sx={muiInputSx} 
 size="small" 
 fullWidth 
 InputLabelProps={{ shrink: true }} 
 />

 <TextField 
 type="time" 
 label="End Time" 
 value={form.endTime} 
 onChange={e => setForm({...form, endTime: e.target.value})} 
 sx={muiInputSx} 
 size="small" 
 fullWidth 
 InputLabelProps={{ shrink: true }} 
 />

 <div className="md:col-span-2">
 <TextField 
 label="Notes" 
 value={form.notes} 
 onChange={e => setForm({...form, notes: e.target.value})} 
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
 {isDeleteModalOpen && taskToDelete && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
 <div className="bg-white rounded-xl shadow-xl w-full max-w-[400px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
 <div className="bg-red-500 px-5 py-3.5 flex items-center justify-between">
 <h2 className="text-white text-[16px] font-bold">Confirm Delete?</h2>
 <button onClick={() => setIsDeleteModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center text-[12px] font-bold">
 X
 </button>
 </div>
 
 <div className="p-6">
 <p className="text-[14px] text-gray-700 font-medium">
 Are you sure you want to delete cleaning task for Room {taskToDelete.roomNo}?
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
