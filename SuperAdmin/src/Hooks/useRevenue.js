import { useState, useEffect, useCallback } from 'react';
import { AnalyticsService } from '../Services/RevenueService.js';

export function useRevenue(initialParams = {}) {
  const [stats, setStats] = useState(null);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, historyData, txData] = await Promise.all([
        AnalyticsService.getDashboardStats(),
        AnalyticsService.getRevenueHistory(),
        AnalyticsService.getRecentTransactions(),
      ]);
      setStats(statsData);
      setRevenueHistory(historyData);
      setTransactions(txData);
    } catch (err) {
      setError(err.message || 'Failed to fetch revenue analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return {
    stats,
    revenueHistory,
    transactions,
    loading,
    error,
    refetch: fetchRevenue,
  };
}

export default useRevenue;
