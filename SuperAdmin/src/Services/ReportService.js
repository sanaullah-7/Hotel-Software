import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const ReportService = {
  /**
   * Get comprehensive hotel report statistics & regional breakdown
   */
  async getHotelReport() {
    return request('/reports/hotels');
  },

  /**
   * Get revenue report metrics, MRR, ARR, and city earnings
   */
  async getRevenueReport() {
    return request('/reports/revenue');
  },

  /**
   * Get user demographic & role report
   */
  async getUserReport() {
    return request('/reports/users');
  },
};

export default ReportService;
