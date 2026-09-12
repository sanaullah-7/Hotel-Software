import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';
function getHeaders() { const t = localStorage.getItem(AUTH_TOKEN_KEY); return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }; }
async function request(method, path, body) { const res = await fetch(`${API_BASE_URL}${path}`, { method, headers: getHeaders(), ...(body ? { body: JSON.stringify(body) } : {}) }); if (!res.ok) { const e = await res.json().catch(() => ({ message: res.statusText })); throw new Error(e.message || 'Request failed'); } return res.json(); }
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
const USE_MOCK = true;

// ---------------------------------------------------------------------------
// Dashboard Analytics Service
// Expected backend endpoints:
//   GET /analytics/dashboard   — summary stats + chart data
//   GET /analytics/hotel-growth
//   GET /analytics/user-growth
//   GET /analytics/revenue
//   GET /analytics/subscriptions
// ---------------------------------------------------------------------------

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const AnalyticsService = {
  async getDashboardStats() {
    if (USE_MOCK) {
      await delay(700);
      return {
        totalHotels:          8,
        activeHotels:         3,
        pendingApprovals:     3,
        suspendedHotels:      1,
        totalManagers:        6,
        totalReceptionists:   4,
        activeSubscriptions:  3,
        monthlyRevenue:       485000,
        revenueGrowth:        12.4,
        hotelGrowth:          8.3,
        userGrowth:           15.2,
        subscriptionGrowth:   5.8,
      };
    }
    return request('GET', '/analytics/dashboard');
  },

  async getHotelGrowth() {
    if (USE_MOCK) {
      await delay(500);
      return MONTHS.map((month, i) => ({
        month,
        registrations: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][i] ?? Math.floor(Math.random() * 3),
        active:        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 5][i] ?? Math.floor(Math.random() * 5),
      }));
    }
    return request('GET', '/analytics/hotel-growth');
  },

  async getUserGrowth() {
    if (USE_MOCK) {
      await delay(500);
      return MONTHS.map((month, i) => ({
        month,
        managers:      [0,0,0,0,0,0,0,0,0,0,1,1,2,3,4,5,6,6,6,7,7,8,8,8][i] ?? 0,
        receptionists: [0,0,0,0,0,0,0,0,0,0,0,1,1,2,2,3,3,4,4,4,5,5,5,6][i] ?? 0,
      }));
    }
    return request('GET', '/analytics/user-growth');
  },

  async getRevenueData() {
    if (USE_MOCK) {
      await delay(500);
      return MONTHS.map((month) => ({
        month,
        revenue:       Math.floor(Math.random() * 300000 + 200000),
        subscriptions: Math.floor(Math.random() * 200000 + 100000),
        oneTime:       Math.floor(Math.random() * 100000 + 50000),
      }));
    }
    return request('GET', '/analytics/revenue');
  },

  async getSubscriptionDistribution() {
    if (USE_MOCK) {
      await delay(400);
      return [
        { name: 'Active',   value: 3, color: '#10b981' },
        { name: 'Trial',    value: 1, color: '#6366f1' },
        { name: 'Expired',  value: 2, color: '#ef4444' },
        { name: 'Canceled', value: 1, color: '#f59e0b' },
      ];
    }
    return request('GET', '/analytics/subscriptions');
  },

  async getRecentActivity() {
    if (USE_MOCK) {
      await delay(400);
      return [
        { id: 1, type: 'approval',    message: 'Pearl Continental Lahore approved',         time: new Date(Date.now() - 2*3600000).toISOString(),  icon: 'check' },
        { id: 2, type: 'registration',message: 'New registration: Crown Plaza Quetta',       time: new Date(Date.now() - 5*3600000).toISOString(),  icon: 'building' },
        { id: 3, type: 'user',        message: 'Manager Bilal Hussain registered',            time: new Date(Date.now() - 8*3600000).toISOString(),  icon: 'user' },
        { id: 4, type: 'suspension',  message: 'Ramada Multan account suspended',             time: new Date(Date.now() - 24*3600000).toISOString(), icon: 'alert' },
        { id: 5, type: 'subscription',message: 'Serena Hotel upgraded to Enterprise plan',    time: new Date(Date.now() - 48*3600000).toISOString(), icon: 'star' },
      ];
    }
    return request('GET', '/analytics/recent-activity');
  },

  async getRecentRegistrations() {
    if (USE_MOCK) {
      await delay(400);
      return [
        { id: 'r1', name: 'Crown Plaza Quetta',    managerName: 'Zara Baloch',  city: 'Quetta',  status: 'PENDING',  registeredAt: new Date(Date.now() - 1*24*3600000).toISOString() },
        { id: 'r2', name: 'Mövenpick Hotel Karachi',managerName: 'Fatima Sheikh',city: 'Karachi', status: 'PENDING',  registeredAt: new Date(Date.now() - 4*24*3600000).toISOString() },
        { id: 'r3', name: 'Avari Hotel Karachi',   managerName: 'Bilal Hussain',city: 'Karachi', status: 'PENDING',  registeredAt: new Date(Date.now() - 8*24*3600000).toISOString() },
        { id: 'r4', name: 'Hotel One Faisalabad',  managerName: 'Naveed Iqbal', city: 'Faisalabad',status:'ACTIVE',  registeredAt: new Date(Date.now() - 20*24*3600000).toISOString() },
      ];
    }
    return request('GET', '/analytics/recent-registrations');
  },
};
