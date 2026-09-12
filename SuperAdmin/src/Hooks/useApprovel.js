import { useState, useEffect, useCallback } from 'react';
import { ApprovalService } from '../Services/ApprovlService.js';

export function useApprovel(initialParams = {}) {
  const [approvals, setApprovals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApprovalService.getApprovals(params);
      setApprovals(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch approval requests');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const approve = async (id) => {
    await ApprovalService.approveRequest(id);
    fetchApprovals();
  };

  const reject = async (id, reason) => {
    await ApprovalService.rejectRequest(id, reason);
    fetchApprovals();
  };

  return {
    approvals,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchApprovals,
    approve,
    reject,
  };
}

export default useApprovel;
