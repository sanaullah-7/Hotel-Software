import React, { useState } from 'react';
import { 
  AssignmentOutlined, CheckCircleOutlined, CancelOutlined, BarChartOutlined,
  MeetingRoomOutlined, CalendarTodayOutlined, PersonOutlined, CommentOutlined, 
  FormatListNumberedOutlined, EditOutlined, DeleteOutlined, Close,
  AccessTimeOutlined
} from '@mui/icons-material';
import { TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';

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
    comments: 'Dust found under the bed. Bathroom mirror not cleaned properly.'
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
  }
];

export default function InspectionChecklist() {
  const [inspections, setInspections] = useState(initialInspections);
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
      setInspections(inspections.map(t => t.id === editingId ? { ...t, ...form } : t));
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
    <div className="w-full min-h-screen bg-transparent p-6 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-gray-800">Inspection Checklist</h1>
          <p className="text-[13px] text-gray-500 mt-1">Manage room inspection tasks and scores</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="bg-[var(--primary-main)] text-white px-4 py-2.5 rounded-md text-[13px] font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span> New Inspection
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Inspections */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#ede9fe] flex items-center justify-center text-[#8b5cf6]">
            <AssignmentOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Total Inspections</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{totalInspections}</p>
          </div>
        </div>

        {/* Passed */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#dcfce7] flex items-center justify-center text-[#16a34a]">
            <CheckCircleOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Passed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{passedCount}</p>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#fee2e2] flex items-center justify-center text-[#ef4444]">
            <CancelOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Failed</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{failedCount}</p>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#ffedd5] flex items-center justify-center text-[#f97316]">
            <BarChartOutlined />
          </div>
          <div>
            <p className="text-[12px] font-bold text-gray-500">Average Score</p>
            <p className="text-[24px] font-bold text-gray-800 leading-none mt-1">{avgScore}%</p>
          </div>
        </div>

      </div>

      {/* Inspection Cards Grid - 4 per row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {inspections.map((record) => (
          <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative">
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-gray-800">Room {record.roomNo} ({record.roomType})</h3>
                <p className="text-[12px] text-gray-500 mt-1">Inspector: {record.inspector}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${getStatusStyles(record.status)}`}>
                {record.status === 'Passed' && <CheckCircleOutlined sx={{ fontSize: 12 }} />}
                {record.status === 'Failed' && <CancelOutlined sx={{ fontSize: 12 }} />}
                {record.status === 'Pending' && <AccessTimeOutlined sx={{ fontSize: 12 }} />}
                {record.status}
              </span>
            </div>

            <div className="border-t border-gray-50 pt-4 space-y-4 flex-1">
              
              <div className="flex gap-3 items-start">
                <CalendarTodayOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inspection Date</p>
                  <p className="text-[13px] font-bold text-gray-700 mt-0.5">{record.inspectionDate || '-'}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start w-full pr-2">
                <FormatListNumberedOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div className="w-full">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                  <p className={`text-[16px] font-bold mt-0.5 ${getScoreColor(record.status)}`}>
                    {record.score}%
                  </p>
                  <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(record.status)}`} 
                      style={{ width: `${record.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <CommentOutlined className="text-gray-400" sx={{ fontSize: 18 }} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comments</p>
                  <p className="text-[13px] font-medium text-gray-600 italic mt-0.5 line-clamp-3">
                    {record.comments || 'No comments'}
                  </p>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-50">
              <button onClick={() => handleOpenEdit(record)} className="text-gray-400 hover:text-blue-500 transition-colors cursor-pointer">
                <EditOutlined sx={{ fontSize: 20 }} />
              </button>
              <button onClick={() => handleOpenDelete(record)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                <DeleteOutlined sx={{ fontSize: 20 }} />
              </button>
            </div>
            
          </div>
        ))}
        {inspections.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500 text-[14px]">
            No inspections found.
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[700px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[var(--primary-main)] px-5 py-3.5 flex items-center justify-between">
              <h2 className="text-white text-[16px] font-bold">
                {editingId ? `Edit Inspection: Room ${form.roomNo}` : 'New Inspection'}
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
                  label="Inspector*" 
                  value={form.inspector} 
                  onChange={e => setForm({...form, inspector: e.target.value})} 
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

                <TextField 
                  required
                  type="date" 
                  label="Inspection Date*" 
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
                  required
                  type="number"
                  label="Score (0-100)" 
                  value={form.score} 
                  onChange={e => setForm({...form, score: e.target.value})} 
                  sx={muiInputSx} 
                  size="small" 
                  fullWidth 
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />

                <div className="md:col-span-2">
                  <TextField 
                    label="Comments" 
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

      {/* Styled Delete Confirmation Modal */}
      {isDeleteModalOpen && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[450px] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#ef4444] px-5 py-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white bg-white/10">
                  <DeleteOutlined />
                </div>
                <div>
                  <h2 className="text-white text-[18px] font-bold">Delete Inspection</h2>
                  <p className="text-white/90 text-[13px] mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-white hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer flex items-center justify-center">
                <Close sx={{ fontSize: 18 }} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-[14.5px] text-gray-700 font-medium mb-4">
                Are you sure you want to delete the inspection record for the following room?
              </p>
              
              <div className="border border-red-100 bg-red-50/50 rounded-lg p-3 flex items-center gap-3">
                <MeetingRoomOutlined className="text-[#ef4444]" sx={{ fontSize: 20 }} />
                <span className="text-[15px] font-bold text-[#1f2937]">Room {recordToDelete.roomNo}</span>
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-[var(--primary-main)] font-bold text-[14px] hover:underline cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleDelete} className="px-6 py-2 rounded-md bg-[#b91c1c] text-white font-bold text-[14px] hover:bg-[#991b1b] transition-colors cursor-pointer flex items-center gap-2">
                  <DeleteOutlined sx={{ fontSize: 16 }} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

