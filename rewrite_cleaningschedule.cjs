const fs = require('fs');
let file = 'Client/src/pages/Housekeeping/CleaningSchedule.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the index of "return (" which starts the JSX for the CleaningSchedule component
const returnIndex = content.indexOf('return (');
if (returnIndex === -1) {
  console.log("Could not find return statement");
  process.exit(1);
}

// Keep everything before the return statement, but remove the icon imports
let topPart = content.substring(0, returnIndex);
topPart = topPart.replace(/import\s*\{\s*AccessTimeOutlined[\s\S]*?\}\s*from\s*'@mui\/icons-material';/, '');

// The new JSX string
const newJsx = `return (
    <div className="w-full h-full flex flex-col pt-1 min-h-screen gap-2">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-[12px] font-bold text-gray-500">Pending</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-[12px] font-bold text-gray-500">In Progress</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{inProgressCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-[12px] font-bold text-gray-500">Completed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{completedCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-[6px] shadow-sm border border-gray-100 flex items-center justify-center gap-4 text-center">
          <div>
            <p className="text-[12px] font-bold text-gray-500">Delayed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{delayedCount}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm mt-1.5 flex-1">
        {/* Table Header with Title & Button */}
        <div className="p-2.5 flex items-center justify-between border-b border-gray-100 gap-4 overflow-x-auto">
          <div className="flex flex-nowrap items-center gap-2 shrink-0">
             <h1 className="text-[18px] font-bold text-gray-800 whitespace-nowrap">Today's Cleaning Schedule</h1>
          </div>
          <button onClick={handleOpenNew} className="bg-[var(--primary-main)] text-white px-3 py-1.5 rounded-md text-[13px] font-bold shadow-sm hover:bg-green-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer">
            Add New Task
          </button>
        </div>
        
        {/* Table */}
        <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:h-2">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Room No</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Task Type</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Assigned Staff</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Time Slot</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Priority</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Status</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Notes</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500 text-[13px]">
                    No cleaning tasks scheduled for today.
                  </td>
                </tr>
              ) : (
                tasks.map(task => (
                  <tr key={task.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 text-[13px] font-bold text-gray-800">Room {task.roomNo}</td>
                    <td className="py-3 px-3 text-[12px] font-medium text-gray-600">{task.taskType}</td>
                    <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{task.assignedStaff || 'Unassigned'}</td>
                    <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{formatTime(task.startTime)} - {formatTime(task.endTime)}</td>
                    <td className={\`py-3 px-3 text-[13px] font-bold \${getPriorityColor(task.priority)}\`}>{task.priority}</td>
                    <td className="py-3 px-3">
                      <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 \${getStatusStyles(task.status)}\`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[13px] font-medium text-gray-500 italic max-w-[200px] truncate" title={task.notes}>{task.notes || 'No notes available'}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenEdit(task)} className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => handleOpenDelete(task)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">
                {editingId ? \`Edit Task for Room \${form.roomNo}\` : 'New Cleaning Task'}
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
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
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
`;

fs.writeFileSync(file, topPart + newJsx, 'utf8');
console.log('CleaningSchedule written successfully');
