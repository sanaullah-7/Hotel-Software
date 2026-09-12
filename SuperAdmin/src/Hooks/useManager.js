import { useState, useEffect, useCallback } from 'react';
import { ManagerService } from '../Services/ManagerService.js';

export function useManager(initialParams = {}) {
  const [managers, setManagers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ManagerService.getManagers(params);
      setManagers(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch managers');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const activateManager = async (id) => {
    await ManagerService.activateManager(id);
    fetchManagers();
  };

  const suspendManager = async (id, reason) => {
    await ManagerService.suspendManager(id, reason);
    fetchManagers();
  };

  return {
    managers,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchManagers,
    activateManager,
    suspendManager,
  };
}

export default useManager;
