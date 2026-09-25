import { useState, useEffect } from 'react';
import { Search, Warning, CheckCircle, Info } from '@mui/icons-material';
import { TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { getAuditLogs, AUDIT_UPDATED_EVENT } from '../state/auditStore';

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

export default function AuditLog() {
  const [logs, setLogs] = useState(getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [importanceFilter, setImportanceFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    const syncLogs = () => setLogs(getAuditLogs());
    window.addEventListener(AUDIT_UPDATED_EVENT, syncLogs);
    window.addEventListener('storage', syncLogs);
    return () => {
      window.removeEventListener(AUDIT_UPDATED_EVENT, syncLogs);
      window.removeEventListener('storage', syncLogs);
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.recordId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    const matchesImportance = importanceFilter === 'All' || log.importance === importanceFilter;
    
    let matchesTime = true;
    if (timeFilter !== 'All') {
      const logDate = new Date(log.dateTime);
      const now = new Date();
      if (timeFilter === 'Daily') {
        matchesTime = logDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'Weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesTime = logDate >= weekAgo;
      } else if (timeFilter === 'Monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesTime = logDate >= monthAgo;
      } else if (timeFilter === 'Yearly') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        matchesTime = logDate >= yearAgo;
      }
    }
    
    return matchesSearch && matchesModule && matchesImportance && matchesTime;
  });
  
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const currentLogs = filteredLogs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getImportanceBadge = (importance) => {
    switch (importance) {
      case 'Critical':
        return <span style={{ color: '#ef4444' }} className="flex items-center gap-1 text-[10px] font-bold"><Warning sx={{ fontSize: 14 }} /> Critical</span>;
      case 'Important':
        return <span style={{ color: '#f59e0b' }} className="flex items-center gap-1 text-[10px] font-bold"><Info sx={{ fontSize: 14 }} /> Important</span>;
      default:
        return <span style={{ color: '#1b7f43' }} className="flex items-center gap-1 text-[10px] font-bold"><CheckCircle sx={{ fontSize: 14 }} /> Normal</span>;
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  return (
    <div className="animate-fade-in font-sans mt-1">
      <div className="bg-white rounded-[6px] flex flex-col border border-gray-100 shadow-sm h-[calc(100vh-90px)]">
        
        {/* Table Header with Filters */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex flex-wrap items-end gap-2.5 w-full">
            <TextField
              variant="outlined" size="small" placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.secondary', ml: -0.5, mr: 0.5 }} /></InputAdornment> }}
              sx={{ minWidth: 140, flexGrow: 1, maxWidth: { xs: '100%', sm: 180 }, '& .MuiInputBase-root': { height: '32px', backgroundColor: 'white', fontSize: '12px', borderRadius: '8px' }, '& .MuiOutlinedInput-input': { padding: '0 8px' }, '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' }, '&:hover fieldset': { borderColor: '#9ca3af' }, '& .Mui-focused fieldset': { borderColor: '#1b7f43 !important', borderWidth: '1.5px !important' } }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Module</InputLabel>
              <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} label="Module">
                <MenuItem value="All" sx={{ fontSize: 12 }}>All Modules</MenuItem>
                <MenuItem value="Reservation" sx={{ fontSize: 12 }}>Reservation</MenuItem>
                <MenuItem value="Rooms" sx={{ fontSize: 12 }}>Rooms</MenuItem>
                <MenuItem value="Guests" sx={{ fontSize: 12 }}>Guests</MenuItem>
                <MenuItem value="Front Office" sx={{ fontSize: 12 }}>Front Office</MenuItem>
                <MenuItem value="Payment & Billing" sx={{ fontSize: 12 }}>Payment & Billing</MenuItem>
                <MenuItem value="Inventory" sx={{ fontSize: 12 }}>Inventory</MenuItem>
                <MenuItem value="Housekeeping" sx={{ fontSize: 12 }}>Housekeeping</MenuItem>
                <MenuItem value="Restaurant" sx={{ fontSize: 12 }}>Restaurant</MenuItem>
                <MenuItem value="Events & Banquets" sx={{ fontSize: 12 }}>Events & Banquets</MenuItem>
                <MenuItem value="Rate & Pricing" sx={{ fontSize: 12 }}>Rate & Pricing</MenuItem>
                <MenuItem value="Human Resources" sx={{ fontSize: 12 }}>Human Resources</MenuItem>
                <MenuItem value="Hotel Settings" sx={{ fontSize: 12 }}>Hotel Settings</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 110, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Importance</InputLabel>
              <Select value={importanceFilter} onChange={(e) => setImportanceFilter(e.target.value)} label="Importance">
                <MenuItem value="All" sx={{ fontSize: 12 }}>All</MenuItem>
                <MenuItem value="Normal" sx={{ fontSize: 12 }}>Normal</MenuItem>
                <MenuItem value="Important" sx={{ fontSize: 12 }}>Important</MenuItem>
                <MenuItem value="Critical" sx={{ fontSize: 12 }}>Critical</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 110, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Time Filter</InputLabel>
              <Select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} label="Time Filter">
                <MenuItem value="All" sx={{ fontSize: 12 }}>All Time</MenuItem>
                <MenuItem value="Daily" sx={{ fontSize: 12 }}>Daily</MenuItem>
                <MenuItem value="Weekly" sx={{ fontSize: 12 }}>Weekly</MenuItem>
                <MenuItem value="Monthly" sx={{ fontSize: 12 }}>Monthly</MenuItem>
                <MenuItem value="Yearly" sx={{ fontSize: 12 }}>Yearly</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined"
              onClick={() => {
                setSearchTerm(''); setModuleFilter('All'); setImportanceFilter('All'); setTimeFilter('All');
              }}
              sx={{ height: '32px', textTransform: 'none', fontSize: '12px', minWidth: 80, px: 1.5, backgroundColor: 'white', borderRadius: '8px', borderColor: '#e5e7eb', color: '#ef4444', flexShrink: 0, '&:hover': { backgroundColor: '#fef2f2', borderColor: '#ef4444' } }}
            >Clear</Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="w-full flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700 w-32">Date & Time</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">User</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Module</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Action</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700">Description</th>
                <th className="py-3 px-3 text-[12px] font-bold text-gray-700 text-right">Importance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentLogs.length > 0 ? currentLogs.map((log) => {
                const { date, time } = formatDate(log.dateTime);
                return (
                  <tr key={log.id} className="hover:bg-gray-50/30 transition-colors cursor-default">
                    <td className="py-2 px-3">
                      <div className="text-[12px] font-bold text-gray-800">{date}</div>
                      <div className="text-[11px] text-gray-500">{time}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-[12px] font-bold text-gray-900">{log.userName}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-[12px] font-bold text-gray-800">{log.module}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="text-[12px] font-bold text-gray-800">{log.action}</div>
                      {log.recordId && <div className="text-[11px] text-gray-500">{log.recordId}</div>}
                    </td>
                    <td className="py-2 px-3 text-[12px] text-gray-600 max-w-[250px] truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="py-2 px-3 text-right flex justify-end">
                      {getImportanceBadge(log.importance)}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    <p className="text-[12px]">No audit logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3 mt-auto shrink-0 flex items-center justify-between text-[12px] text-gray-600 border-t border-gray-100 bg-gray-50/30 rounded-b-[6px]">
          <span>Showing {currentLogs.length} of {filteredLogs.length} logs</span>
          <div className="flex items-center gap-4">
            <span 
              className={`cursor-pointer ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:text-gray-900'}`}
              onClick={() => page > 1 && setPage(p => p - 1)}
            >{'< Prev'}</span>
            <span 
              className={`cursor-pointer ${page >= totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:text-gray-900'}`}
              onClick={() => page < totalPages && setPage(p => p + 1)}
            >{'Next >'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
