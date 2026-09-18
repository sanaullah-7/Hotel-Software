const fs = require('fs');
let content = fs.readFileSync('src/pages/FrontOffice/OperationsAlerts.jsx', 'utf8');

const muiSelectSx = 
const muiSelectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontSize: '12px',
    height: '32px',
    color: '#1f2937',
    '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#1b7f43', borderWidth: '1.5px' },
  },
  '& .MuiSelect-select': {
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    height: '32px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '13px',
    color: '#6b7280',
    transform: 'translate(14px, 7px) scale(1)',
    '&.Mui-focused': { color: '#1b7f43' }
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  },
};
;

// Insert muiSelectSx after initialAlerts array definition
content = content.replace(/const initialAlerts = \[[\s\S]*?\];/, match => match + '\n' + muiSelectSx);

const oldPriority = <div className="flex flex-col gap-0.5">
              <span className="text-[9.5px] font-bold text-gray-400 uppercase pl-1">Priority</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white focus:outline-none focus:border-[#2e7d32] cursor-pointer"
              >
                {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>;

const newPriority = <FormControl size="small" sx={{ minWidth: 100, ...muiSelectSx }}>
              <InputLabel>Priority</InputLabel>
              <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
                {PRIORITY_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>;

const oldStatus = <div className="flex flex-col gap-0.5">
              <span className="text-[9.5px] font-bold text-gray-400 uppercase pl-1">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white focus:outline-none focus:border-[#2e7d32] cursor-pointer"
              >
                {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>;

const newStatus = <FormControl size="small" sx={{ minWidth: 100, ...muiSelectSx }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
                {STATUS_OPTIONS.map(opt => <MenuItem key={opt} value={opt} sx={{ fontSize: 12 }}>{opt}</MenuItem>)}
              </Select>
            </FormControl>;

content = content.replace(oldPriority, newPriority);
content = content.replace(oldStatus, newStatus);

fs.writeFileSync('src/pages/FrontOffice/OperationsAlerts.jsx', content);
console.log('Updated OperationsAlerts.jsx');
