import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const USE_MOCK = true;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const ReportService = {
  /**
   * Get comprehensive hotel report statistics
   */
  async getHotelReport() {
    if (USE_MOCK) {
      await delay(500);
      return {
        totalHotels: 48,
        activeHotels: 41,
        pendingApproval: 5,
        suspendedHotels: 2,
        byCity: [
          { city: 'Lahore', count: 16, percentage: 33 },
          { city: 'Islamabad', count: 12, percentage: 25 },
          { city: 'Karachi', count: 10, percentage: 21 },
          { city: 'Peshawar', count: 5, percentage: 10 },
          { city: 'Other Cities', count: 5, percentage: 10 },
        ],
        monthlyGrowth: [
          { month: 'Jan', added: 4 },
          { month: 'Feb', added: 6 },
          { month: 'Mar', added: 5 },
          { month: 'Apr', added: 8 },
          { month: 'May', added: 7 },
          { month: 'Jun', added: 9 },
          { month: 'Jul', added: 5 },
          { month: 'Aug', added: 4 },
        ],
      };
    }
    const res = await fetch(`${API_BASE_URL}/reports/hotels`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch hotel report');
    return res.json();
  },

  /**
   * Get revenue report metrics
   */
  async getRevenueReport() {
    if (USE_MOCK) {
      await delay(450);
      return {
        mrr: 245000,
        arr: 2940000,
        avgRevenuePerHotel: 5975,
        churnRate: '1.2%',
        topEarningCities: [
          { city: 'Lahore', revenue: 98000 },
          { city: 'Islamabad', revenue: 76000 },
          { city: 'Karachi', revenue: 52000 },
          { city: 'Multan', revenue: 19000 },
        ],
      };
    }
    const res = await fetch(`${API_BASE_URL}/reports/revenue`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch revenue report');
    return res.json();
  },

  /**
   * Get user demographic & role report
   */
  async getUserReport() {
    if (USE_MOCK) {
      await delay(400);
      return {
        totalUsers: 142,
        activeManagers: 48,
        activeReceptionists: 86,
        superAdmins: 8,
        activeRate: '94.2%',
        recentSignupsMonth: 19,
      };
    }
    const res = await fetch(`${API_BASE_URL}/reports/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user report');
    return res.json();
  },
};
