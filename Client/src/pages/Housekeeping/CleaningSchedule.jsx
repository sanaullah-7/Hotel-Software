import React, { useState } from 'react';
import { 
  AccessTimeOutlined, SyncOutlined, CheckCircleOutlined, WarningAmberOutlined, 
  PersonOutlined, EventNoteOutlined, PriorityHighOutlined, EditOutlined, 
  DeleteOutlined, Close, MeetingRoomOutlined
} from '@mui/icons-material';
import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';

const initialTasks = [
  {
    id: 1,
    roomNo: '101',
    taskType: 'Full Clean',
    assignedStaff: 'John Doe',
    startTime: '09:00',
    endTime: '10:00',
    priority: 'High',
    status: 'In Progress',
    notes: 'Guest checked out late'
  },
  {
    id: 2,
    roomNo: '205',
    taskType: 'Quick Clean',
    assignedStaff: 'Jane Smith',
    startTime: '10:30',
    endTime: '11:00',
    priority: 'Medium',
    status: 'Pending',
    notes: 'Stay-over cleaning'
  },
  {
    id: 3,
    roomNo: '302',
    taskType: 'Turn Down',
    assignedStaff: 'Robert Brown',
    startTime: '18:00',
    endTime: '18:30',
    priority: 'Low',
    status: 'Completed',
    notes: 'No notes available'
  },
  {
    id: 4,
    roomNo: '401',
    taskType: 'Deep Clean',
    assignedStaff: 'Emily Davis',
    startTime: '11:00',
    endTime: '12:30',
    priority: 'High',
    status: 'Pending',
    notes: 'VIP guest arrival'
  },
  {
    id: 5,
    roomNo: '110',
    taskType: 'Quick Clean',
    assignedStaff: 'Michael Lee',
    startTime: '13:00',
    endTime: '13:30',
    priority: 'Low',
    status: 'In Progress',
    notes: 'Towel refresh'
  },
  {
    id: 6,
    roomNo: '215',
    taskType: 'Full Clean',
    assignedStaff: 'Sarah Wilson',
    startTime: '14:00',
    endTime: '15:00',
    priority: 'Medium',
    status: 'Pending',
    notes: 'Regular check-out'
  },
  {
    id: 7,
    roomNo: '305',
    taskType: 'Turn Down',
    assignedStaff: 'John Doe',
    startTime: '19:00',
    endTime: '19:30',
    priority: 'Low',
    status: 'Completed',
    notes: 'Evening service'
  },
  {
    id: 8,
    roomNo: '105',
    taskType: 'Full Clean',
    assignedStaff: 'Jane Smith',
    startTime: '15:30',
    endTime: '16:30',
    priority: 'High',
    status: 'Delayed',
    notes: 'Guest requested later time'
  },
  {
    id: 9,
    roomNo: '501',
    taskType: 'Deep Clean',
    assignedStaff: 'Emily Davis',
    startTime: '08:00',
    endTime: '10:00',
    priority: 'High',
    status: 'In Progress',
    notes: 'VIP check-in today'
  },
  {
    id: 10,
    roomNo: '312',
    taskType: 'Full Clean',
    assignedStaff: 'Robert Brown',
    startTime: '10:00',
    endTime: '11:00',
    priority: 'Medium',
    status: 'Pending',
    notes: 'Standard service'
  },
  {
    id: 11,
    roomNo: '418',
    taskType: 'Turn Down',
    assignedStaff: 'Jane Smith',
    startTime: '18:30',
    endTime: '19:00',
    priority: 'Low',
    status: 'Completed',
    notes: 'Refresh towels'
  },
  {
    id: 12,
    roomNo: '108',
    taskType: 'Quick Clean',
    assignedStaff: 'Michael Lee',
    startTime: '12:00',
    endTime: '12:30',
    priority: 'Medium',
    status: 'Pending',
    notes: 'Guest requested early'
  }
];

const formatTime = (time24) => {
  if (!time24) return '';
  const [hour, minute] = time24.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHour = h % 12 || 12;
  return `${formattedHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
};

export default function CleaningSchedule() {
  const [tasks, setTasks] = useState(initialTasks);
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
    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? { ...t, ...form } : t));
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
      case 'Pending': return '#ea580c';
      case 'In Progress': return '#3b82f6';
      case 'Completed': return '#16a34a';
      case 'Delayed': return '#dc2626';
      default: return '#9ca3af';
    }
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
    <div className="w-full bg-transparent pt-1 flex flex-col gap-1.5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-800">Today's Cleaning Schedule</h1>
        </div>
        <button 
          onClick={handleOpenNew}
          className="bg-[var(--primary-main)] text-white px-2 py-1.5 rounded-md text-[13px] font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span> Add New Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        
        {/* Pending */}
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#fff7ed] flex items-center justify-center text-[#ea580c]">
            <AccessTimeOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Pending</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#3b82f6]">
            <SyncOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">In Progress</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{inProgressCount}</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#16a34a]">
            <CheckCircleOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Completed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{completedCount}</p>
          </div>
        </div>

        {/* Delayed */}
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#fef2f2] flex items-center justify-center text-[#dc2626]">
            <WarningAmberOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Delayed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{delayedCount}</p>
          </div>
        </div>

      </div>

      {/* Task Cards Grid */}   
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-[6px] shadow-sm border border-gray-100 p-3.5 flex flex-col relative h-fit border-t-[4px]" style={{ borderTopColor: getStatusBorderColor(task.status) }}>
            
            <div className="flex items-start justify-between mb-2.5">
              <div>
                <h3 className="text-[16px] font-bold text-gray-800">Room {task.roomNo}</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">{task.taskType}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${getStatusStyles(task.status)}`}>
                {task.status === 'Pending' && <AccessTimeOutlined sx={{ fontSize: 12 }} />}
                {task.status === 'In Progress' && <SyncOutlined sx={{ fontSize: 12 }} />}
                {task.status === 'Completed' && <CheckCircleOutlined sx={{ fontSize: 12 }} />}
                {task.status === 'Delayed' && <WarningAmberOutlined sx={{ fontSize: 12 }} />}
                {task.status}
              </span>
            </div>

            <div className="border-t border-gray-50 pt-2.5 space-y-2.5 ">
              
              <div className="flex gap-2.5 items-start">
                <PersonOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned Staff</p>
                  <p className="text-[13px] font-bold text-gray-700">{task.assignedStaff || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <AccessTimeOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Time Slot</p>
                  <p className="text-[13px] font-bold text-gray-700">
                    {formatTime(task.startTime)} - {formatTime(task.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <PriorityHighOutlined className={getPriorityColor(task.priority)} sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</p>
                  <p className={`text-[13px] font-bold mt-0.5 ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <EventNoteOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes</p>
                  <p className="text-[13px] font-medium text-gray-500 italic line-clamp-2">
                    {task.notes || 'No notes available'}
                  </p>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 mt-2.5 pt-2.5 border-t border-gray-50">
              <button onClick={() => handleOpenEdit(task)} className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                <EditOutlined sx={{ fontSize: 20 }} />
              </button>
              <button onClick={() => handleOpenDelete(task)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                <DeleteOutlined sx={{ fontSize: 20 }} />
              </button>
            </div>
            
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 text-[14px]">
            No cleaning tasks scheduled for today.
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">
                {editingId ? `Edit Task for Room ${form.roomNo}` : 'New Cleaning Task'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <MeetingRoomOutlined sx={{ fontSize: 18, color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <PersonOutlined sx={{ fontSize: 18, color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
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
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">Confirm Delete?</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
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


