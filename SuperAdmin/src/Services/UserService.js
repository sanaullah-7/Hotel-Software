import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  return { 
    'Content-Type': 'application/json', 
    ...(token ? { Authorization: `Bearer ${token}` } : {}) 
  };
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, { 
    method, 
    headers: getHeaders(), 
    ...(body ? { body: JSON.stringify(body) } : {}) 
  });
  
  const json = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) { 
    throw new Error(json.message || 'Request failed'); 
  }
  return json;
}

// ---------------------------------------------------------------------------
// Platform User Service (Live Database Connection)
// ---------------------------------------------------------------------------
export const UserService = {
  /**
   * Fetches paginated platform users (Managers, Receptionists, Staff) with filters.
   * @returns {Promise<{ data: object[], total: number, page: number, totalPages: number }>}
   */
  async getUsers({ role = '', status = '', page = 1, limit = 10, search = '' } = {}) {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search ? { search: search.trim() } : {}),
    });

    const res = await request('GET', `/users?${query.toString()}`);
    return res?.data || res;
  },

  /**
   * Retrieves single user details.
   */
  async getUserById(id) {
    const res = await request('GET', `/users/${id}`);
    return res?.data || res;
  },

  /**
   * Activates a user account.
   */
  async activateUser(id) {
    const res = await request('PATCH', `/users/${id}/activate`);
    return res?.data || res;
  },

  /**
   * Suspends a user account and invalidates sessions.
   */
  async suspendUser(id, reason = '') {
    const res = await request('PATCH', `/users/${id}/suspend`, { reason });
    return res?.data || res;
  },

  /**
   * Retrieves system-wide user statistics.
   */
  async getStats() {
    const res = await request('GET', '/users/stats');
    return res?.data || res;
  },
};
