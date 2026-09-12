import { useState, useEffect, useCallback } from 'react';
import { AuditLogService } from '../../Services/AuditLogService.js';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import SearchBar from '../../Components/Common/SearchBar.jsx';
import FilterDropdown from '../../Components/Common/FilterDropdown.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import { formatDateTime } from '../../utils/ForamteDate.js';
import { Shield, CheckCircle, XCircle, AlertTriangle, LogIn, User, Star } from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants.js';

const ACTION_ICONS = {
  LOGIN:              { icon: LogIn,        color: '#3b82f6' },
  LOGOUT:             { icon: LogIn,        color: '#94a3b8' },
  HOTEL_APPROVED:     { icon: CheckCircle,  color: '#10b981' },
  HOTEL_REJECTED:     { icon: XCircle,      color: '#ef4444' },
  HOTEL_SUSPENDED:    { icon: AlertTriangle,color: '#f59e0b' },
  HOTEL_REACTIVATED:  { icon: CheckCircle,  color: '#10b981' },
  USER_ACTIVATED:     { icon: User,         color: '#10b981' },
  USER_SUSPENDED:     { icon: User,         color: '#f59e0b' },
  SUBSCRIPTION_CHANGED:{ icon: Star,        color: '#8b5cf6' },
  SETTINGS_CHANGED:   { icon: Shield,       color: '#6366f1' },
};

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN',           label: 'Login' },
  { value: 'HOTEL_APPROVED',  label: 'Hotel Approved' },
  { value: 'HOTEL_REJECTED',  label: 'Hotel Rejected' },
  { value: 'HOTEL_SUSPENDED', label: 'Hotel Suspended' },
  { value: 'USER_ACTIVATED',  label: 'User Activated' },
  { value: 'USER_SUSPENDED',  label: 'User Suspended' },
];

const ENTITY_OPTIONS = [
  { value: '',      label: 'All Types'  },
  { value: 'hotel', label: 'Hotels'     },
  { value: 'user',  label: 'Users'      },
];

export default function AuditLogs() {
  const [data,       setData]       = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [action,     setAction]     = useState('');
  const [entityType, setEntityType] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  const fetchData = useCallback(async () => {
     
    setLoading(true); setError('');
    try {
      const res = await AuditLogService.getLogs({ page, limit: DEFAULT_PAGE_SIZE, action, entityType, search });
      setData(res.data); setTotal(res.total);
    } catch (e) { setError(e.message || 'Failed to load audit logs.'); }
    finally { setLoading(false); }
  }, [page, action, entityType, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [action, entityType, search]);

  return (
    <div className="animate-fadein">
      <PageHeader title="Audit Logs" subtitle="Track all administrative actions performed on the platform." />

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search entity or user…" />
        <FilterDropdown label="Action"      value={action}     onChange={setAction}     options={ACTION_OPTIONS}  />
        <FilterDropdown label="Entity Type" value={entityType} onChange={setEntityType} options={ENTITY_OPTIONS}  />
      </div>

      {error ? <ErrorState message={error} onRetry={fetchData} /> :
       data.length === 0 && !loading ? (
        <EmptyState icon={Shield} title="No audit logs" description="No audit log entries match your current filters." />
      ) : (
        <>
          <div className="sa-card" style={{ padding: 0 }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Type</th>
                  <th>Performed By</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: 13, borderRadius: 6 }} /></td>
                    ))}</tr>
                  ))
                ) : data.map((log) => {
                  const conf = ACTION_ICONS[log.action] || { icon: Shield, color: 'var(--color-text-muted)' };
                  const Icon = conf.icon;
                  return (
                    <tr key={log.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${conf.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={14} style={{ color: conf.color }} />
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>{log.entity}</td>
                      <td>
                        <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', fontWeight: 500, textTransform: 'capitalize' }}>
                          {log.entityType}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{log.performedBy}</td>
                      <td style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{log.ip}</td>
                      <td style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>{formatDateTime(log.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={total} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
