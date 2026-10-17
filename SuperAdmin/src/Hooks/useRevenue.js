import { useState, useEffect, useCallback } from 'react';
import { AnalyticsService } from '../Services/RevenueService.js';

export function useRevenue(initialParams = {}) {
  const [overview, setOverview] = useState(null);
  const [stats, setStats] = useState(null);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, statsData, historyData, txData] = await Promise.all([
        AnalyticsService.getRevenueOverview(),
        AnalyticsService.getDashboardStats(),
        AnalyticsService.getRevenueHistory(),
        AnalyticsService.getTransactions(params),
      ]);
      setOverview(overviewData);
      setStats(statsData);
      setRevenueHistory(historyData || []);
      setTransactions(txData?.data || (Array.isArray(txData) ? txData : []));
      setTotal(txData?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch revenue analytics');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return {
    overview,
    stats,
    revenueHistory,
    transactions,
    total,
    loading,
    error,
    params,
    setParams,
    refetch: fetchRevenue,
  };
}

export default useRevenue;
