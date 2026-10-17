import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

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
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const NotificationService = {
  /**
   * Fetch paginated platform notifications with optional filter criteria
   */
  async getNotifications({ page = 1, limit = 20, read = '', category = '', type = '' } = {}) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (read !== '') params.append('read', read);
    if (category) params.append('category', category);
    if (type) params.append('type', type);

    return request('GET', `/notifications?${params.toString()}`);
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id) {
    return request('PATCH', `/notifications/${id}/read`);
  },

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead() {
    return request('PATCH', '/notifications/read-all');
  },

  /**
   * Get unread count for notifications badge
   */
  async getUnreadCount() {
    return request('GET', '/notifications/unread-count');
  },

  /**
   * Delete / dismiss a notification permanently
   */
  async deleteNotification(id) {
    return request('DELETE', `/notifications/${id}`);
  },

  /**
   * Create a platform notification / announcement
   */
  async createNotification(data) {
    return request('POST', '/notifications', data);
  },
};

export default NotificationService;
