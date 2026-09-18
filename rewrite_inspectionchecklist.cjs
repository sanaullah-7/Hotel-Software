const fs = require('fs');
let file = 'Client/src/pages/Housekeeping/InspectionChecklist.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the index of "return (" which starts the JSX
const returnIndex = content.indexOf('return (');
if (returnIndex === -1) {
  console.log("Could not find return statement");
  process.exit(1);
}

// Keep everything before the return statement, but remove the icon imports
let topPart = content.substring(0, returnIndex);
topPart = topPart.replace(/import\s*\{\s*AssignmentOutlined[\s\S]*?\}\s*from\s*'@mui\/icons-material';/, '');

// The new JSX string
const newJsx = `return (
    <div className="w-full h-full flex flex-col pt-1 min-h-screen gap-2">
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
        <div className="p-2.5 flex items-center justify-between border-b border-gray-100 gap-4 overflow-x-auto">
          <div className="flex flex-nowrap items-center gap-2 shrink-0">
             <h1 className="text-[18px] font-bold text-gray-800 whitespace-nowrap">Inspection Checklist</h1>
          </div>
          <button onClick={handleOpenNew} className="bg-[var(--primary-main)] text-white px-3 py-1.5 rounded-md text-[13px] font-bold shadow-sm hover:bg-green-700 transition-colors shrink-0 whitespace-nowrap cursor-pointer">
            New Inspection
          </button>
        </div>
        
        {/* Table */}
        <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:h-2">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Room No</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Room Type</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Inspector</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Inspection Date</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Status</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Score</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700">Comments</th>
                <th className="py-3 px-3 text-[11px] font-bold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inspections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500 text-[13px]">
                    No inspections recorded.
                  </td>
                </tr>
              ) : (
                inspections.map(record => (
                  <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 text-[13px] font-bold text-gray-800">Room {record.roomNo}</td>
                    <td className="py-3 px-3 text-[12px] font-medium text-gray-600">{record.roomType}</td>
                    <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{record.inspector}</td>
                    <td className="py-3 px-3 text-[13px] font-bold text-gray-700">{record.inspectionDate || '-'}</td>
                    <td className="py-3 px-3">
                      <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 \${getStatusStyles(record.status)}\`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={\`text-[13px] font-bold \${getScoreColor(record.status)}\`}>{record.score}%</span>
                    </td>
                    <td className="py-3 px-3 text-[13px] font-medium text-gray-500 italic max-w-[200px] truncate" title={record.comments}>{record.comments || 'No comments'}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenEdit(record)} className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer">
                          Edit
                        </button>
                        <button onClick={() => handleOpenDelete(record)} className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer">
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
                {editingId ? \`Edit Inspection: Room \${form.roomNo}\` : 'New Inspection'}
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
`;

fs.writeFileSync(file, topPart + newJsx, 'utf8');
console.log('InspectionChecklist written successfully');
