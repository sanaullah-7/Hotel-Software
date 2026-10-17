import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function getHeaders() {
  const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

let refreshPromise = null;

async function request(method, path, body, retry = true) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401 && retry) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' }, body: '{}',
        });
        const json = await refreshed.json();
        if (!refreshed.ok || !json.data?.accessToken) {
          window.dispatchEvent(new Event('sa-session-expired'));
          throw new Error('Your session has expired. Please sign in again.');
        }
        localStorage.setItem(AUTH_TOKEN_KEY, json.data.accessToken);
      })().finally(() => { refreshPromise = null; });
    }
    await refreshPromise;
    return request(method, path, body, false);
  }

  const json = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

// ---------------------------------------------------------------------------
// Hotel Service (Live Database Connection)
// ---------------------------------------------------------------------------

export const HotelService = {
  /** @returns {{ data: object[], total: number, page: number }} */
  async getHotels({ page = 1, limit = 10, status = '', search = '', city = '' } = {}) {
    const res = await request(
      'GET',
      `/hotels?page=${page}&limit=${limit}&status=${encodeURIComponent(status)}&search=${encodeURIComponent(search)}&city=${encodeURIComponent(city)}`
    );
    return res?.data || res;
  },

  /** @returns {object} */
  async getHotelById(id) {
    const res = await request('GET', `/hotels/${id}`);
    return res?.data || res;
  },

  async approveHotel(id) {
    const res = await request('PATCH', `/hotels/${id}/approve`);
    return res?.data || res;
  },

  async rejectHotel(id, reason) {
    const res = await request('PATCH', `/hotels/${id}/reject`, { reason });
    return res?.data || res;
  },

  async suspendHotel(id, reason) {
    const res = await request('PATCH', `/hotels/${id}/suspend`, { reason });
    return res?.data || res;
  },

  async reactivateHotel(id) {
    const res = await request('PATCH', `/hotels/${id}/reactivate`);
    return res?.data || res;
  },

  async getStats() {
    const res = await request('GET', '/hotels/stats');
    return res?.data || res;
  },
};
