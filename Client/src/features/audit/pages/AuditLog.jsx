import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Warning, CheckCircle, Info, Refresh } from '@mui/icons-material';
import { TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Button, CircularProgress } from '@mui/material';
import { auditService } from '../../../services/auditService';
import { AUDIT_UPDATED_EVENT, setAuditLogsCache } from '../state/auditStore';

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
    '&.Mui-focused': { color: '#1b7f43' },
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  },
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [importanceFilter, setImportanceFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const isMountedRef = useRef(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await auditService.getAuditLogs({
        page,
        limit: itemsPerPage,
        search: debouncedSearch,
        module: moduleFilter !== 'All' ? moduleFilter : undefined,
        importance: importanceFilter !== 'All' ? importanceFilter : undefined,
        timeFilter: timeFilter !== 'All' ? timeFilter : undefined,
      });

      const data = res?.data || res;
      const fetchedLogs = Array.isArray(data) ? data : data?.logs || [];
      const total = typeof data?.totalCount === 'number' ? data.totalCount : fetchedLogs.length;
      const pages = typeof data?.totalPages === 'number' ? data.totalPages : Math.ceil(total / itemsPerPage) || 1;

      if (isMountedRef.current) {
        setLogs(fetchedLogs);
        setTotalCount(total);
        setTotalPages(pages);
        setAuditLogsCache(fetchedLogs);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Failed to load audit logs:', err);
        setError(err.message || 'Failed to load audit logs');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [page, debouncedSearch, moduleFilter, importanceFilter, timeFilter]);

  // Fetch when filters or page changes
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Subscribe to real-time audit updates dispatched within the app
  useEffect(() => {
    isMountedRef.current = true;
    const handleAuditUpdate = () => {
      loadLogs();
    };
    window.addEventListener(AUDIT_UPDATED_EVENT, handleAuditUpdate);
    return () => {
      isMountedRef.current = false;
      window.removeEventListener(AUDIT_UPDATED_EVENT, handleAuditUpdate);
    };
  }, [loadLogs]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setModuleFilter('All');
    setImportanceFilter('All');
    setTimeFilter('All');
    setPage(1);
  };

  const getImportanceBadge = (importance) => {
    switch (importance) {
      case 'Critical':
        return (
          <span style={{ color: '#ef4444' }} className="flex items-center gap-1 text-[10px] font-bold">
            <Warning sx={{ fontSize: 14 }} /> Critical
          </span>
        );
      case 'Important':
        return (
          <span style={{ color: '#f59e0b' }} className="flex items-center gap-1 text-[10px] font-bold">
            <Info sx={{ fontSize: 14 }} /> Important
          </span>
        );
      default:
        return (
          <span style={{ color: '#1b7f43' }} className="flex items-center gap-1 text-[10px] font-bold">
            <CheckCircle sx={{ fontSize: 14 }} /> Normal
          </span>
        );
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return { date: '—', time: '—' };
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: '—', time: '—' };
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
              variant="outlined"
              size="small"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: 'text.secondary', ml: -0.5, mr: 0.5 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 140,
                flexGrow: 1,
                maxWidth: { xs: '100%', sm: 180 },
                '& .MuiInputBase-root': {
                  height: '32px',
                  backgroundColor: 'white',
                  fontSize: '12px',
                  borderRadius: '8px',
                },
                '& .MuiOutlinedInput-input': { padding: '0 8px' },
                '& fieldset': { borderColor: '#e5e7eb', borderWidth: '1.2px' },
                '&:hover fieldset': { borderColor: '#9ca3af' },
                '& .Mui-focused fieldset': {
                  borderColor: '#1b7f43 !important',
                  borderWidth: '1.5px !important',
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 120, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Module</InputLabel>
              <Select value={moduleFilter} onChange={handleFilterChange(setModuleFilter)} label="Module">
                <MenuItem value="All" sx={{ fontSize: 12 }}>
                  All Modules
                </MenuItem>
                <MenuItem value="Reservation" sx={{ fontSize: 12 }}>
                  Reservation
                </MenuItem>
                <MenuItem value="Rooms" sx={{ fontSize: 12 }}>
                  Rooms
                </MenuItem>
                <MenuItem value="Guests" sx={{ fontSize: 12 }}>
                  Guests
                </MenuItem>
                <MenuItem value="Front Office" sx={{ fontSize: 12 }}>
                  Front Office
                </MenuItem>
                <MenuItem value="Payment & Billing" sx={{ fontSize: 12 }}>
                  Payment & Billing
                </MenuItem>
                <MenuItem value="Inventory" sx={{ fontSize: 12 }}>
                  Inventory
                </MenuItem>
                <MenuItem value="Housekeeping" sx={{ fontSize: 12 }}>
                  Housekeeping
                </MenuItem>
                <MenuItem value="Restaurant" sx={{ fontSize: 12 }}>
                  Restaurant
                </MenuItem>
                <MenuItem value="Events & Banquets" sx={{ fontSize: 12 }}>
                  Events & Banquets
                </MenuItem>
                <MenuItem value="Rate & Pricing" sx={{ fontSize: 12 }}>
                  Rate & Pricing
                </MenuItem>
                <MenuItem value="Human Resources" sx={{ fontSize: 12 }}>
                  Human Resources
                </MenuItem>
                <MenuItem value="Hotel Settings" sx={{ fontSize: 12 }}>
                  Hotel Settings
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 110, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Importance</InputLabel>
              <Select value={importanceFilter} onChange={handleFilterChange(setImportanceFilter)} label="Importance">
                <MenuItem value="All" sx={{ fontSize: 12 }}>
                  All
                </MenuItem>
                <MenuItem value="Normal" sx={{ fontSize: 12 }}>
                  Normal
                </MenuItem>
                <MenuItem value="Important" sx={{ fontSize: 12 }}>
                  Important
                </MenuItem>
                <MenuItem value="Critical" sx={{ fontSize: 12 }}>
                  Critical
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 110, flexGrow: { xs: 1, sm: 0 }, ...muiSelectSx }}>
              <InputLabel>Time Filter</InputLabel>
              <Select value={timeFilter} onChange={handleFilterChange(setTimeFilter)} label="Time Filter">
                <MenuItem value="All" sx={{ fontSize: 12 }}>
                  All Time
                </MenuItem>
                <MenuItem value="Daily" sx={{ fontSize: 12 }}>
                  Daily
                </MenuItem>
                <MenuItem value="Weekly" sx={{ fontSize: 12 }}>
                  Weekly
                </MenuItem>
                <MenuItem value="Monthly" sx={{ fontSize: 12 }}>
                  Monthly
                </MenuItem>
                <MenuItem value="Yearly" sx={{ fontSize: 12 }}>
                  Yearly
                </MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                height: '32px',
                textTransform: 'none',
                fontSize: '12px',
                minWidth: 70,
                px: 1.5,
                backgroundColor: 'white',
                borderRadius: '8px',
                borderColor: '#e5e7eb',
                color: '#ef4444',
                flexShrink: 0,
                '&:hover': { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
              }}
            >
              Clear
            </Button>

            <Button
              variant="outlined"
              onClick={loadLogs}
              title="Refresh"
              sx={{
                height: '32px',
                minWidth: '36px',
                px: 1,
                backgroundColor: 'white',
                borderRadius: '8px',
                borderColor: '#e5e7eb',
                color: '#4b5563',
                flexShrink: 0,
                '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#9ca3af' },
              }}
            >
              <Refresh sx={{ fontSize: 16 }} />
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="w-full flex-1 overflow-x-auto min-w-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left min-w-[750px]">
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <CircularProgress size={24} sx={{ color: '#1b7f43', mb: 1 }} />
                    <p className="text-[12px]">Loading audit records from database...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-red-500">
                    <p className="text-[12px]">{error}</p>
                    <Button
                      size="small"
                      onClick={loadLogs}
                      sx={{ mt: 1, fontSize: '11px', textTransform: 'none', color: '#1b7f43' }}
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  const { date, time } = formatDate(log.dateTime || log.timestamp);
                  return (
                    <tr key={log.id || log._id} className="hover:bg-gray-50/30 transition-colors cursor-default">
                      <td className="py-2 px-3">
                        <div className="text-[12px] font-bold text-gray-800">{date}</div>
                        <div className="text-[11px] text-gray-500">{time}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="text-[12px] font-bold text-gray-900">{log.userName || 'Admin'}</div>
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
                })
              ) : (
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
          <span>
            Showing {logs.length} of {totalCount} logs
          </span>
          <div className="flex items-center gap-4">
            <span
              className={`cursor-pointer ${page === 1 || loading ? 'text-gray-400 cursor-not-allowed' : 'hover:text-gray-900'}`}
              onClick={() => !loading && page > 1 && setPage((p) => p - 1)}
            >
              {'< Prev'}
            </span>
            <span className="text-[11px] text-gray-500">
              Page {page} of {totalPages}
            </span>
            <span
              className={`cursor-pointer ${page >= totalPages || loading ? 'text-gray-400 cursor-not-allowed' : 'hover:text-gray-900'}`}
              onClick={() => !loading && page < totalPages && setPage((p) => p + 1)}
            >
              {'Next >'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
