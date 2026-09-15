import { useState, useEffect, useCallback } from 'react';
import { AnalyticsService } from '../Services/RevenueService.js';
import { HotelService } from '../Services/HotelService.js';
import { ApprovalService } from '../Services/ApprovlService.js';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentHotels, setRecentHotels] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const fetchDashboardData = useCallback(async () => {
     
    setLoading(true);
    setError(null);
    try {
      const [analyticsData, hotelsData, approvalsData] = await Promise.all([
        AnalyticsService.getDashboardStats().catch(() => null),
        HotelService.getHotels({ limit: 5 }).catch(() => ({ data: [] })),
        ApprovalService.getPendingApprovals({ limit: 5 }).catch(() => ({ data: [] })),
      ]);

      setStats(analyticsData);
      setRecentHotels(hotelsData?.data || []);
      setPendingApprovals(approvalsData?.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    loading,
    error,
    stats,
    recentHotels,
    pendingApprovals,
    refetch: fetchDashboardData,
  };
}

export default useDashboard;
