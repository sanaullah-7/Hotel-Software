import { useState, useEffect, useCallback } from 'react';
import { AuditLogService } from '../Services/AuditLogService.js';

export function useAuditLog(initialParams = {}) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuditLogService.getLogs(params);
      setLogs(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchLogs,
  };
}

export default useAuditLog;
