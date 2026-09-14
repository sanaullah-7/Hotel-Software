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

const MOCK_PLANS = [
  {
    id: 'plan_basic',
    name: 'Basic Starter',
    tier: 'BASIC',
    price: 4999,
    billingPeriod: 'month',
    maxRooms: 20,
    features: ['Up to 20 rooms', 'Basic guest registration', 'Standard daily reports', 'Email support'],
    isPopular: false,
    activeSubscribers: 18,
  },
  {
    id: 'plan_pro',
    name: 'Business Pro',
    tier: 'PRO',
    price: 12999,
    billingPeriod: 'month',
    maxRooms: 100,
    features: ['Up to 100 rooms', 'Multi-user receptionist logins', 'Advanced financial analytics', 'Export to Excel / PDF', 'Priority WhatsApp support'],
    isPopular: true,
    activeSubscribers: 42,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise Elite',
    tier: 'ENTERPRISE',
    price: 29999,
    billingPeriod: 'month',
    maxRooms: 500,
    features: ['Unlimited rooms & branches', 'Custom roles & permissions', 'Real-time multi-branch sync', 'Dedicated account manager', '24/7 Phone & on-site support', 'API Integrations'],
    isPopular: false,
    activeSubscribers: 9,
  },
];

const MOCK_SUBSCRIPTIONS = [
  { id: 'sub_1', hotelId: '1', hotelName: 'Pearl Continental Lahore', planId: 'plan_enterprise', planName: 'Enterprise Elite', status: 'ACTIVE', startDate: '2024-01-01', endDate: '2025-01-01', amount: 29999, paymentMethod: 'Direct Bank Transfer' },
  { id: 'sub_2', hotelId: '2', hotelName: 'Serena Hotel Islamabad', planId: 'plan_enterprise', planName: 'Enterprise Elite', status: 'ACTIVE', startDate: '2024-02-01', endDate: '2025-02-01', amount: 29999, paymentMethod: 'Corporate Visa Card' },
  { id: 'sub_3', hotelId: '3', hotelName: 'Avari Hotel Karachi', planId: 'plan_pro', planName: 'Business Pro', status: 'TRIAL', startDate: '2024-09-01', endDate: '2024-09-30', amount: 12999, paymentMethod: 'Pending Verification' },
  { id: 'sub_4', hotelId: '4', hotelName: 'Mövenpick Hotel Karachi', planId: 'plan_pro', planName: 'Business Pro', status: 'TRIAL', startDate: '2024-09-05', endDate: '2024-10-05', amount: 12999, paymentMethod: 'Pending Verification' },
  { id: 'sub_5', hotelId: '5', hotelName: 'Ramada Multan', planId: 'plan_basic', planName: 'Basic Starter', status: 'EXPIRED', startDate: '2023-11-01', endDate: '2024-08-01', amount: 4999, paymentMethod: 'JazzCash' },
  { id: 'sub_6', hotelId: '7', hotelName: 'Hotel One Faisalabad', planId: 'plan_basic', planName: 'Basic Starter', status: 'ACTIVE', startDate: '2024-03-01', endDate: '2024-11-01', amount: 4999, paymentMethod: 'EasyPaisa' },
];

export const SubscriptionService = {
  /**
   * Get all subscription plans
   */
  async getPlans() {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_PLANS;
    }
    const res = await fetch(`${API_BASE_URL}/subscriptions/plans`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subscription plans');
    return res.json();
  },

  /**
   * Get hotel subscriptions with filter
   */
  async getSubscriptions({ status = '', plan = '', page = 1, limit = 10, search = '' } = {}) {
    if (USE_MOCK) {
      await delay(450);
      let data = [...MOCK_SUBSCRIPTIONS];
      if (status) data = data.filter((s) => s.status === status);
      if (plan) data = data.filter((s) => s.planId === plan);
      if (search) data = data.filter((s) => s.hotelName.toLowerCase().includes(search.toLowerCase()));
      const total = data.length;
      data = data.slice((page - 1) * limit, page * limit);
      return { data, total, page };
    }
    const res = await fetch(`${API_BASE_URL}/subscriptions?status=${status}&plan=${plan}&page=${page}&limit=${limit}&search=${search}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    return res.json();
  },

  /**
   * Get summary statistics
   */
  async getSubscriptionStats() {
    if (USE_MOCK) {
      await delay(350);
      return {
        active: 4,
        trial: 2,
        expired: 1,
        totalRevenueMonthly: 82996,
        distribution: [
          { name: 'Enterprise', value: 2, color: '#6366f1' },
          { name: 'Business Pro', value: 2, color: '#8b5cf6' },
          { name: 'Basic Starter', value: 2, color: '#06b6d4' },
          { name: 'Expired', value: 1, color: '#ef4444' },
        ],
      };
    }
    const res = await fetch(`${API_BASE_URL}/subscriptions/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subscription stats');
    return res.json();
  },

  /**
   * Update or renew subscription status
   */
  async updateSubscription(id, updateData) {
    if (USE_MOCK) {
      await delay(400);
      const sub = MOCK_SUBSCRIPTIONS.find((s) => s.id === id);
      if (sub) Object.assign(sub, updateData);
      return { success: true, message: 'Subscription updated', subscription: sub };
    }
    const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Failed to update subscription');
    return res.json();
  },
};
