import { useState, useEffect, useCallback } from 'react';
import { AuditLogService } from '../../Services/AuditLogService.js';
import PageHeader from '../../Components/Common/pageHeader.jsx';
import SearchBar from '../../Components/Common/SearchBar.jsx';
import FilterDropdown from '../../Components/Common/FilterDropdown.jsx';
import ErrorState from '../../Components/Common/ErrorState.jsx';
import EmptyState from '../../Components/Common/EmptyState.jsx';
import Pagination from '../../Components/Common/Pagination.jsx';
import Modal from '../../Components/Common/Model.jsx';
import ReportButton from '../../Components/Reports/ReportButton.jsx';
import { formatDateTime } from '../../utils/ForamteDate.js';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogIn,
  User,
  Star,
  Activity,
  AlertCircle,
  Eye,
  Info,
} from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants.js';

const ACTION_ICONS = {
  LOGIN:                { icon: LogIn,         color: '#3b82f6' },
  LOGOUT:               { icon: LogIn,         color: '#94a3b8' },
  HOTEL_APPROVED:       { icon: CheckCircle,   color: '#10b981' },
  HOTEL_REJECTED:       { icon: XCircle,       color: '#ef4444' },
  HOTEL_SUSPENDED:      { icon: AlertTriangle, color: '#f59e0b' },
  HOTEL_REACTIVATED:    { icon: CheckCircle,   color: '#10b981' },
  HOTEL_REGISTERED:     { icon: Activity,      color: '#06b6d4' },
  USER_ACTIVATED:       { icon: User,          color: '#10b981' },
  USER_SUSPENDED:       { icon: User,          color: '#f59e0b' },
  SUBSCRIPTION_CHANGED: { icon: Star,          color: '#8b5cf6' },
  PLAN_UPDATED:         { icon: Star,          color: '#ec4899' },
  SETTINGS_CHANGED:     { icon: Shield,        color: '#6366f1' },
};

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'HOTEL_APPROVED', label: 'Hotel Approved' },
  { value: 'HOTEL_REJECTED', label: 'Hotel Rejected' },
  { value: 'HOTEL_SUSPENDED', label: 'Hotel Suspended' },
  { value: 'HOTEL_REACTIVATED', label: 'Hotel Reactivated' },
  { value: 'USER_ACTIVATED', label: 'User Activated' },
  { value: 'USER_SUSPENDED', label: 'User Suspended' },
  { value: 'SUBSCRIPTION_CHANGED', label: 'Subscription Changed' },
];

const ENTITY_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'user', label: 'Users' },
  { value: 'subscription', label: 'Subscriptions' },
  { value: 'security', label: 'Security' },
  { value: 'system', label: 'System' },
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severities' },
  { value: 'INFO', label: 'Informational' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'CRITICAL', label: 'Critical' },
];

export default function AuditLogs() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [severity, setSeverity] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [res, statsRes] = await Promise.all([
        AuditLogService.getLogs({
          page,
          limit: DEFAULT_PAGE_SIZE,
          action,
          entityType,
          severity,
          search,
        }),
        AuditLogService.getAuditStats().catch(() => null),
      ]);
      setData(res.data || []);
      setTotal(res.total || 0);
      if (statsRes) setStats(statsRes);
    } catch (e) {
      setError(e.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [page, action, entityType, severity, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [action, entityType, severity, search]);

  const getSeverityBadge = (sev) => {
    const s = (sev || 'INFO').toUpperCase();
    if (s === 'CRITICAL') {
      return (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 6,
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          CRITICAL
        </span>
      );
    }
    if (s === 'WARNING') {
      return (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 6,
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          WARNING
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 6,
          background: 'rgba(59, 130, 246, 0.12)',
          color: '#3b82f6',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        INFO
      </span>
    );
  };

  return (
    <div className="animate-fadein">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <PageHeader
          title="Platform Security & Audit Trail"
          subtitle="Immutable chronological ledger of all administrative events, security actions, and policy modifications."
        />
        <div style={{ marginTop: 4 }}>
          <ReportButton
            data={data}
            filename={`audit_trail_${new Date().toISOString().split('T')[0]}.csv`}
            label="Export Audit CSV"
          />
        </div>
      </div>

      {/* KPI Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div className="sa-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--accent-purple, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{stats?.totalEvents ?? total}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Recorded Events</div>
          </div>
        </div>

        <div className="sa-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>
              {stats?.criticalEvents ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Critical Incidents</div>
          </div>
        </div>

        <div className="sa-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>
              {stats?.warningEvents ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Warning Events</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px', minWidth: 200 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search entity, actor, or action…" />
        </div>
        <FilterDropdown label="Action" value={action} onChange={setAction} options={ACTION_OPTIONS} />
        <FilterDropdown label="Entity Type" value={entityType} onChange={setEntityType} options={ENTITY_OPTIONS} />
        <FilterDropdown label="Severity" value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} />
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : data.length === 0 && !loading ? (
        <EmptyState
          icon={Shield}
          title="No audit logs found"
          description="No administrative audit events match your selected filters."
        />
      ) : (
        <>
          <div className="sa-card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Performed By</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j}>
                          <div className="skeleton" style={{ height: 14, borderRadius: 6 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  data.map((log) => {
                    const conf = ACTION_ICONS[log.action] || { icon: Shield, color: 'var(--color-text-muted)' };
                    const Icon = conf.icon;
                    return (
                      <tr key={log.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: `${conf.color}1a`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon size={14} style={{ color: conf.color }} />
                            </div>
                            <span
                              style={{
                                fontSize: 12.5,
                                fontWeight: 600,
                                fontFamily: 'monospace',
                                letterSpacing: '0.02em',
                              }}
                            >
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, fontWeight: 500 }}>{log.entity}</td>
                        <td>
                          <span
                            style={{
                              fontSize: 12,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: 'var(--color-surface-2)',
                              color: 'var(--color-text-secondary)',
                              fontWeight: 500,
                              textTransform: 'capitalize',
                            }}
                          >
                            {log.entityType}
                          </span>
                        </td>
                        <td>{getSeverityBadge(log.severity)}</td>
                        <td style={{ fontSize: 13 }}>{log.performedBy}</td>
                        <td style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {log.ip}
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedLog(log)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              background: 'var(--bg-card-hover)',
                              border: '1px solid var(--border-color)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11.5,
                            }}
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16 }}>
            <Pagination
              page={page}
              total={total}
              pageSize={DEFAULT_PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      {/* Audit Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={`Audit Event Details: ${selectedLog.action}`}
          maxWidth={500}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '6px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Severity Level:</span>
              {getSeverityBadge(selectedLog.severity)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Entity Target:</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedLog.entity}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Entity Category:</span>
              <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{selectedLog.entityType}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Performed By:</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedLog.performedBy}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Originating IP:</span>
              <span style={{ fontSize: 12.5, fontFamily: 'monospace' }}>{selectedLog.ip}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Timestamp:</span>
              <span style={{ fontSize: 12.5 }}>{formatDateTime(selectedLog.createdAt)}</span>
            </div>

            {selectedLog.details && (
              <div style={{ marginTop: 8 }}>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                  Event Payload & Context:
                </span>
                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 8,
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)',
                    fontSize: 12,
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                  }}
                >
                  {typeof selectedLog.details === 'string'
                    ? selectedLog.details
                    : JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="btn btn-primary"
                style={{ padding: '6px 16px' }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
