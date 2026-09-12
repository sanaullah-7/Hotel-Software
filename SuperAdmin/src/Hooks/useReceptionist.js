import { useState, useEffect, useCallback } from 'react';
import { ReceptionistService } from '../Services/receptionistService.js';

export function useReceptionist(initialParams = {}) {
  const [receptionists, setReceptionists] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchReceptionists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ReceptionistService.getReceptionists(params);
      setReceptionists(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch receptionists');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchReceptionists();
  }, [fetchReceptionists]);

  const activateReceptionist = async (id) => {
    await ReceptionistService.activateReceptionist(id);
    fetchReceptionists();
  };

  const suspendReceptionist = async (id, reason) => {
    await ReceptionistService.suspendReceptionist(id, reason);
    fetchReceptionists();
  };

  return {
    receptionists,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchReceptionists,
    activateReceptionist,
    suspendReceptionist,
  };
}

export default useReceptionist;
