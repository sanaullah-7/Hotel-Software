import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';
import { HotelService } from './HotelService.js';
import { SubscriptionService } from './SubscriptionService.js';

function getHeaders() {
  const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const AnalyticsService = {
  /**
   * Comprehensive telemetry for superadmin dashboard
   */
  async getDashboardStats() {
    try {
      return await request('GET', '/analytics/dashboard');
    } catch {
      // Graceful fallback to HotelService aggregation
      try {
        const stats = await HotelService.getStats();
        return stats;
      } catch {
        return {
          totalHotels: 0,
          activeHotels: 0,
          pendingApprovals: 0,
          suspendedHotels: 0,
          totalManagers: 0,
          totalReceptionists: 0,
          activeSubscriptions: 0,
          monthlyRevenue: 0,
          revenueGrowth: 0,
          hotelGrowth: 0,
          userGrowth: 0,
          subscriptionGrowth: 0,
        };
      }
    }
  },

  /**
   * Monthly hotel registration and active trends
   */
  async getHotelGrowth() {
    return request('GET', '/analytics/hotel-growth');
  },

  /**
   * Monthly user growth (managers and staff)
   */
  async getUserGrowth() {
    return request('GET', '/analytics/user-growth');
  },

  /**
   * 12-Month revenue trend data for charts
   */
  async getRevenueData() {
    return request('GET', '/analytics/revenue');
  },

  /**
   * Revenue KPI summary
   */
  async getRevenueOverview() {
    return request('GET', '/analytics/overview');
  },

  /**
   * Active subscription tier breakdown for pie chart
   */
  async getSubscriptionDistribution() {
    try {
      const stats = await SubscriptionService.getSubscriptionStats();
      return stats.distribution || [];
    } catch {
      return [
        { name: 'Enterprise', value: 0, color: '#6366f1' },
        { name: 'Business Pro', value: 0, color: '#8b5cf6' },
        { name: 'Premium Suite', value: 0, color: '#ec4899' },
        { name: 'Basic Starter', value: 0, color: '#06b6d4' },
      ];
    }
  },

  /**
   * Real platform recent activity stream
   */
  async getRecentActivity() {
    return request('GET', '/analytics/recent-activity');
  },

  /**
   * Latest hotel registrations
   */
  async getRecentRegistrations() {
    try {
      const res = await HotelService.getHotels({ page: 1, limit: 5 });
      return res?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Historical monthly revenue list
   */
  async getRevenueHistory() {
    return request('GET', '/analytics/revenue');
  },

  /**
   * Recent ledger transactions for dashboard tables
   */
  async getRecentTransactions() {
    try {
      const res = await this.getTransactions({ page: 1, limit: 10 });
      return res?.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Full paginated transaction query with status, search, and timeframe filters
   */
  async getTransactions({ page = 1, limit = 10, status = '', search = '', period = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    if (period) params.append('period', period);

    return request('GET', `/finance/transactions?${params.toString()}`);
  },

  /**
   * Record a new transaction in the platform ledger
   */
  async recordTransaction(data) {
    return request('POST', '/finance/transactions', data);
  },
};

export default AnalyticsService;
