import { useState, useEffect, useCallback } from 'react';
import { ReportService } from '../Services/ReportService.js';

export function useReports() {
  const [hotelReport, setHotelReport] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [userReport, setUserReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
     
    setLoading(true);
    setError(null);
    try {
      const [hotels, revenue, users] = await Promise.all([
        ReportService.getHotelReport(),
        ReportService.getRevenueReport(),
        ReportService.getUserReport(),
      ]);
      setHotelReport(hotels);
      setRevenueReport(revenue);
      setUserReport(users);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReports();
  }, [fetchReports]);

  return {
    hotelReport,
    revenueReport,
    userReport,
    loading,
    error,
    refetch: fetchReports,
  };
}

export default useReports;
