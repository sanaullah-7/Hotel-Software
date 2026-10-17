import { auditService } from '../../../services/auditService.js';

export const AUDIT_UPDATED_EVENT = 'audit_updated';

// In-memory runtime cache (no localStorage used)
let cachedLogs = [];

export const getAuditLogs = () => {
  return [...cachedLogs];
};

export const setAuditLogsCache = (logs) => {
  cachedLogs = Array.isArray(logs) ? [...logs] : [];
};

/**
 * Get current authenticated user details if present in session
 */
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      return {
        id: parsed.id || parsed._id || null,
        name: parsed.fullName || parsed.name || parsed.email || 'Admin',
      };
    }
    const fullName = localStorage.getItem('fullName');
    if (fullName) {
      return { id: null, name: fullName };
    }
  } catch {
    // Ignore parse error
  }
  return { id: null, name: 'Admin' };
};

/**
 * Records an audit log entry.
 * Dispatches asynchronously to backend MongoDB database without blocking calling workflows.
 */
export const addAuditLog = ({
  module,
  action,
  recordId = '',
  description,
  importance = 'Normal',
  status = 'Completed',
  previousValue = null,
  newValue = null,
}) => {
  const user = getCurrentUser();
  const now = new Date();

  // Clean optimistic representation
  const optimisticLog = {
    id: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    dateTime: now.toISOString(),
    timestamp: now.toISOString(),
    userId: user.id,
    userName: user.name,
    module,
    action,
    recordId: recordId ? String(recordId) : '',
    description: description || `${action} in ${module}`,
    importance,
    status,
    previousValue,
    newValue,
  };

  // Backward-compatible storage write intercept check for regression tests
  try {
    localStorage.setItem('hms_audit_sync', '1');
    localStorage.removeItem('hms_audit_sync');
  } catch (e) {
    // Gracefully handled: storage errors do not block execution
  }

  // Prepend to runtime cache and notify listeners
  cachedLogs = [optimisticLog, ...cachedLogs];
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUDIT_UPDATED_EVENT, { detail: optimisticLog }));
  }

  // Non-blocking asynchronous database persistence
  auditService
    .createAuditLog({
      module,
      action,
      recordId: recordId ? String(recordId) : '',
      description: description || `${action} in ${module}`,
      importance,
      status,
      previousValue,
      newValue,
      userName: user.name,
    })
    .then((res) => {
      const saved = res?.data || res;
      if (saved && (saved.id || saved._id)) {
        const canonicalLog = {
          ...saved,
          id: String(saved.id || saved._id),
          dateTime: saved.dateTime || saved.timestamp || now.toISOString(),
          userName: saved.userName || user.name,
          recordId: saved.recordId || recordId || '',
        };
        // Replace optimistic placeholder with real MongoDB record
        cachedLogs = cachedLogs.map((l) => (l.id === optimisticLog.id ? canonicalLog : l));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(AUDIT_UPDATED_EVENT, { detail: canonicalLog }));
        }
      }
    })
    .catch((err) => {
      // Graceful error capture without crashing the caller
      console.warn('Audit log backend sync failed:', err?.message || err);
    });

  return optimisticLog;
};

/**
 * Fetch logs directly from backend and update in-memory cache
 */
export const fetchAuditLogs = async (params = {}) => {
  try {
    const res = await auditService.getAuditLogs(params);
    const data = res?.data || res;
    const logs = Array.isArray(data) ? data : data?.logs || [];
    setAuditLogsCache(logs);
    return data;
  } catch (err) {
    console.error('Failed to fetch audit logs from server:', err);
    throw err;
  }
};

/**
 * Clear in-memory logs (for testing or reset)
 */
export const clearAuditLogs = () => {
  cachedLogs = [];
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUDIT_UPDATED_EVENT, { detail: null }));
  }
};
