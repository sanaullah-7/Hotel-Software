import { useState, useEffect, useCallback } from 'react';
import { SubscriptionService } from '../Services/SubscriptionService.js';

export function useSubscription(initialParams = {}) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subsRes, plansRes, statsRes] = await Promise.all([
        SubscriptionService.getSubscriptions(params),
        SubscriptionService.getPlans(),
        SubscriptionService.getSubscriptionStats(),
      ]);
      setSubscriptions(subsRes.data || []);
      setTotal(subsRes.total || 0);
      setPlans(plansRes || []);
      setStats(statsRes || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch subscriptions data');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSubscription = async (id, updateData) => {
    await SubscriptionService.updateSubscription(id, updateData);
    fetchData();
  };

  return {
    subscriptions,
    plans,
    stats,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchData,
    updateSubscription,
  };
}

export default useSubscription;
