import { FilterList, AddCircleOutlined, Refresh, TableChart, PictureAsPdf, HourglassEmpty, Autorenew, CheckCircle, Warning } from '@mui/icons-material';
import React, { useState, useRef, useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment, TablePagination } from '@mui/material';
import { getRooms, saveRooms } from './hkStore';
import { getRoomByRoomNo } from '../../rooms/state/roomStore';

function mapRoomToTask(r) {
  const roomNo = String(r.roomNo || r.id || '');
  let status = 'Pending';
  if (r.status === 'Clean / Ready' || r.cleaningStatus === 'Completed') status = 'Completed';
  else if (r.status === 'Cleaning' || r.cleaningStatus === 'In Progress') status = 'In Progress';
  else if (r.status === 'Delayed') status = 'Delayed';
  else status = 'Pending';

  let priority = r.priority || 'Medium';
  if (priority === 'Standard' || priority === 'Normal') priority = 'Medium';
  if (priority === 'Urgent') priority = 'High';

  let taskType = r.taskType || r.cleaningType || 'Full Clean';
  if (!['Full Clean', 'Quick Clean', 'Turn Down', 'Deep Clean'].includes(taskType)) {
    taskType = 'Full Clean';
  }

  return {
    ...r,
    id: r.id || roomNo,
    roomNo,
    taskType,
    assignedStaff: r.assignedStaff !== undefined ? r.assignedStaff : (r.assignee && r.assignee !== '-' ? r.assignee : ''),
    startTime: r.startTime || (r.started && r.started !== '-' ? r.started : '09:00'),
    endTime: r.endTime || (r.completed && r.completed !== '-' ? r.completed : '10:00'),
    priority,
    status,
    notes: r.notes || ''
  };
}

const formatTime = (time24) => {
  if (!time24) return '';
  const [hour, minute] = time24.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHour = h % 12 || 12;
  return `${formattedHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
};

export default function CleaningSchedule() {
  const [tasks, setTasks] = useState(() => getRooms().map(mapRoomToTask));
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [form, setForm] = useState({
    roomNo: '',
    taskType: '',
    priority: 'Medium',
    status: 'Pending',
    assignedStaff: '',
    startTime: '',
    endTime: '',
    notes: ''
  });

  // Derived Summary Stats
  const pendingCount = tasks.filter(t => t.status === 'Pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const delayedCount = tasks.filter(t => t.status === 'Delayed').length;

  const filteredTasks = tasks.filter(item => 
    (item.roomNo || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.taskType || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.assignedStaff || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.status || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedTasks = filteredTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [visibleColumns, setVisibleColumns] = useState({
    'Room No': true, 'Task Type': true, 'Assigned Staff': true, 'Time Slot': true, 'Priority': true, 'Status': true, 'Notes': true, 'Actions': true
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
      'Room No': true, 'Task Type': true, 'Assigned Staff': true, 'Time Slot': true, 'Priority': true, 'Status': true, 'Notes': true, 'Actions': true
    });
  };

  const handleExportCSV = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let csvContent = activeCols.join(',') + '\n';
    
    filteredTasks.forEach(r => {
      const row = activeCols.map(col => {
        let val = '';
        if (col === 'Room No') val = r.roomNo;
        if (col === 'Task Type') val = r.taskType;
        if (col === 'Assigned Staff') val = r.assignedStaff;
        if (col === 'Time Slot') val = r.startTime + " - " + r.endTime;
        if (col === 'Priority') val = r.priority;
        if (col === 'Status') val = r.status;
        if (col === 'Notes') val = r.notes;
        return `"${(val || '').toString().replace(/"/g, '""')}"`;
      });
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cleaning_schedule.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const activeCols = Object.keys(visibleColumns).filter(col => visibleColumns[col] && col !== 'Actions');
    let html = `
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
          <tr>${activeCols.map(c => `<th>${c}</th>`).join('')}</tr>
        </thead>
        <tbody>`;
        
    filteredTasks.forEach(r => {
      html += '<tr>';
      activeCols.forEach(col => {
        let val = '';
        if (col === 'Room No') val = r.roomNo;
        if (col === 'Task Type') val = r.taskType;
        if (col === 'Assigned Staff') val = r.assignedStaff;
        if (col === 'Time Slot') val = r.startTime + " - " + r.endTime;
        if (col === 'Priority') val = r.priority;
        if (col === 'Status') val = r.status;
        if (col === 'Notes') val = r.notes;
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
    setForm({ roomNo: '', taskType: '', priority: 'Medium', status: 'Pending', assignedStaff: '', startTime: '', endTime: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingId(task.id);
    setForm({ ...task });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const currentCanonicalRooms = getRooms();
    let updatedRooms;
    if (editingId) {
      updatedRooms = currentCanonicalRooms.map(r => {
        if (r.id === editingId || r.roomNo === editingId) {
          const status = form.status === 'Completed' ? 'Clean / Ready' : (form.status === 'In Progress' ? 'Cleaning' : (form.status === 'Delayed' ? 'Delayed' : 'Pending'));
          const cleaningStatus = form.status === 'Completed' ? 'Completed' : (form.status === 'In Progress' ? 'In Progress' : 'Scheduled');
          return {
            ...r,
            roomNo: form.roomNo,
            cleaningType: form.taskType,
            taskType: form.taskType,
            priority: form.priority,
            assignedStaff: form.assignedStaff,
            assignee: form.assignedStaff && form.assignedStaff.trim() ? form.assignedStaff : (r.assignee || '-'),
            startTime: form.startTime,
            started: form.startTime || r.started || '-',
            endTime: form.endTime,
            completed: form.endTime || r.completed || '-',
            status,
            cleaningStatus,
            notes: form.notes
          };
        }
        return r;
      });
    } else {
      const newRoom = {
        id: form.roomNo,
        roomNo: form.roomNo,
        roomType: 'Delux',
        acNonAc: 'AC',
        meal: 'All',
        capacity: '2',
        rent: '100',
        mobile: '',
        roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&h=100&fit=crop',
        cleaningType: form.taskType,
        taskType: form.taskType,
        priority: form.priority,
        assignedStaff: form.assignedStaff,
        assignee: form.assignedStaff && form.assignedStaff.trim() ? form.assignedStaff : '-',
        startTime: form.startTime,
        started: form.startTime || '-',
        endTime: form.endTime,
        completed: form.endTime || '-',
        status: form.status === 'Completed' ? 'Clean / Ready' : (form.status === 'In Progress' ? 'Cleaning' : (form.status === 'Delayed' ? 'Delayed' : 'Pending')),
        cleaningStatus: form.status === 'Completed' ? 'Completed' : (form.status === 'In Progress' ? 'In Progress' : 'Scheduled'),
        notes: form.notes
      };
      updatedRooms = [...currentCanonicalRooms, newRoom];
    }
    saveRooms(updatedRooms);
    setTasks(getRooms().map(mapRoomToTask));
    setIsModalOpen(false);
  };

  const handleOpenDelete = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    const currentCanonicalRooms = getRooms();
    const updatedRooms = currentCanonicalRooms.filter(r => r.id !== taskToDelete.id && r.roomNo !== taskToDelete.roomNo);
    saveRooms(updatedRooms);
    setTasks(getRooms().map(mapRoomToTask));
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending': return 'bg-[#fff7ed] text-[#ea580c]';
      case 'In Progress': return 'bg-[#eff6ff] text-[#3b82f6]';
      case 'Completed': return 'bg-[#f0fdf4] text-[#16a34a]';
      case 'Delayed': return 'bg-[#fef2f2] text-[#dc2626]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-[#ef4444]';
      case 'Medium': return 'text-[#f59e0b]';
      case 'Low': return 'text-[#10b981]';
      default: return 'text-gray-500';
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
            <p className="text-[11px] font-medium text-gray-500">Pending</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{pendingCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600">
            <HourglassEmpty sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div className="text-left">
            <p className="text-[11px] font-medium text-gray-500">In Progress</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{inProgressCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
            <Autorenew sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div className="text-left">
            <p className="text-[11px] font-medium text-gray-500">Completed</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{completedCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
            <CheckCircle sx={{ fontSize: 16 }} />
          </div>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-lg shadow-xs border border-gray-100 flex items-center justify-between gap-2.5">
          <div className="text-left">
            <p className="text-[11px] font-medium text-gray-500">Delayed</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-0.5">{delayedCount}</p>
          </div>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600">
            <Warning sx={{ fontSize: 16 }} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-xs border border-gray-100 flex-1 flex flex-col overflow-hidden">
        {/* Table Header with Title & Button */}
        <div className="p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-sm font-bold text-gray-800 whitespace-nowrap">Today's Cleaning Schedule</h1>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2.5 py-1 border border-gray-200 rounded-md text-xs w-[140px] sm:w-[180px] focus:outline-none focus:border-[#1b7f43] focus:ring-1 focus:ring-[#1b7f43] transition-colors"
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
            <button onClick={handleRefresh} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#e5f4eb] transition-colors cursor-pointer" title="Refresh">
              <Refresh sx={{ fontSize: 18 }} className="text-[#1b7f43]" />
            </button>
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
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/50">
                {visibleColumns['Room No'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Room No</th>}
                {visibleColumns['Task Type'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Task Type</th>}
                {visibleColumns['Assigned Staff'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Assigned Staff</th>}
                {visibleColumns['Time Slot'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Time Slot</th>}
                {visibleColumns['Priority'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Priority</th>}
                {visibleColumns['Status'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>}
                {visibleColumns['Notes'] && <th className="py-2 px-1.5 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Notes</th>}
                {visibleColumns['Actions'] && <th className="py-2 px-1 text-[10px] sm:text-[10.5px] font-bold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-8 text-center text-gray-400 text-xs">
                    No cleaning tasks scheduled for today.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors border-b border-gray-50">
                    {visibleColumns['Room No'] && <td className="py-1.5 px-1.5 text-[11px] font-bold text-gray-900 whitespace-nowrap">Room {task.roomNo}</td>}
                    {visibleColumns['Task Type'] && <td className="py-1.5 px-1.5 text-[11px] font-semibold text-gray-800 whitespace-nowrap">{task.taskType}</td>}
                    {visibleColumns['Assigned Staff'] && <td className="py-1.5 px-1.5 text-[11px] text-gray-600 truncate" title={task.assignedStaff}>{task.assignedStaff || 'Unassigned'}</td>}
                    {visibleColumns['Time Slot'] && <td className="py-1.5 px-1.5 text-[10.5px] text-gray-600 whitespace-nowrap">{formatTime(task.startTime)} - {formatTime(task.endTime)}</td>}
                    {visibleColumns['Priority'] && (
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <span className={`text-[10.5px] font-bold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                    )}
                    {visibleColumns['Status'] && (
                      <td className="py-1.5 px-1.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold inline-block ${getStatusStyles(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns['Notes'] && <td className="py-1.5 px-1.5 text-[10.5px] text-gray-500 italic truncate" title={task.notes}>{task.notes || '-'}</td>}
                    {visibleColumns['Actions'] && (
                      <td className="py-1.5 px-1 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenEdit(task)} className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                            Edit
                          </button>
                          <button onClick={() => handleOpenDelete(task)} className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer">
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
          count={filteredTasks.length}
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
                {editingId ? `Edit Task for Room ${form.roomNo}` : 'New Cleaning Task'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center text-xs font-bold">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="sm:col-span-2">
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

                <div className="sm:col-span-2">
                  <TextField 
                    label="Notes" 
                    value={form.notes} 
                    onChange={e => setForm({...form, notes: e.target.value})} 
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
      {isDeleteModalOpen && taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[340px] p-5 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-800 mb-3 text-left">Confirm Delete</h3>
            
            <p className="text-xs text-gray-600 text-left mb-4 bg-slate-50 p-3 rounded-lg">
              Are you sure you want to delete the cleaning task for <strong className="text-gray-900">Room {taskToDelete.roomNo}</strong>?
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
