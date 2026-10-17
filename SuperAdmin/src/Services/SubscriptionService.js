import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const SubscriptionService = {
  /**
   * Get all subscription plans
   */
  async getPlans() {
    const res = await fetch(`${API_BASE_URL}/subscriptions/plans`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subscription plans');
    const json = await res.json();
    return json.data || json;
  },

  /**
   * Get hotel subscriptions with filter and pagination
   */
  async getSubscriptions({ status = '', plan = '', page = 1, limit = 10, search = '' } = {}) {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (plan) query.append('plan', plan);
    if (page) query.append('page', page);
    if (limit) query.append('limit', limit);
    if (search) query.append('search', search);

    const res = await fetch(`${API_BASE_URL}/subscriptions?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch subscriptions');
    const json = await res.json();
    return json.data || json;
  },

  /**
   * Get summary statistics and plan distribution
   */
  async getSubscriptionStats() {
    const res = await fetch(`${API_BASE_URL}/subscriptions/stats`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch subscription stats');
    const json = await res.json();
    return json.data || json;
  },

  /**
   * Update or renew subscription status, tier, or dates
   */
  async updateSubscription(id, updateData) {
    const res = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Failed to update subscription');
    const json = await res.json();
    return json.data || json;
  },

  /**
   * Update plan pricing, rooms limit, or features
   */
  async updatePlan(id, updateData) {
    const res = await fetch(`${API_BASE_URL}/subscriptions/plans/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error('Failed to update subscription plan');
    const json = await res.json();
    return json.data || json;
  },
};

export default SubscriptionService;
