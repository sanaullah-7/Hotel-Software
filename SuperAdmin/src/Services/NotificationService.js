import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';
function getHeaders() { const t = localStorage.getItem(AUTH_TOKEN_KEY); return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }; }
async function request(method, path, body) { const res = await fetch(`${API_BASE_URL}${path}`, { method, headers: getHeaders(), ...(body ? { body: JSON.stringify(body) } : {}) }); if (!res.ok) { const e = await res.json().catch(() => ({ message: res.statusText })); throw new Error(e.message || 'Request failed'); } return res.json(); }
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
const USE_MOCK = true;

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'warning', title: 'New Hotel Registration', message: 'Crown Plaza Quetta submitted a registration request.', read: false, createdAt: new Date(Date.now() - 1*3600000).toISOString(), entityId: '8', entityType: 'hotel' },
  { id: 'n2', type: 'warning', title: 'New Hotel Registration', message: 'Mövenpick Hotel Karachi submitted a registration request.', read: false, createdAt: new Date(Date.now() - 4*3600000).toISOString(), entityId: '4', entityType: 'hotel' },
  { id: 'n3', type: 'info',    title: 'New Manager Registered', message: 'Bilal Hussain (Avari Hotel) has registered as a manager.', read: false, createdAt: new Date(Date.now() - 8*3600000).toISOString(), entityId: 'u3', entityType: 'user' },
  { id: 'n4', type: 'error',   title: 'Hotel Suspended', message: 'Ramada Multan has been suspended by admin.', read: true, createdAt: new Date(Date.now() - 24*3600000).toISOString(), entityId: '5', entityType: 'hotel' },
  { id: 'n5', type: 'success', title: 'Hotel Approved', message: 'Pearl Continental Lahore registration has been approved.', read: true, createdAt: new Date(Date.now() - 48*3600000).toISOString(), entityId: '1', entityType: 'hotel' },
];

// ---------------------------------------------------------------------------
// Notification Service
// Expected backend endpoints:
//   GET   /notifications?page=&limit=&read=
//   PATCH /notifications/:id/read
//   PATCH /notifications/read-all
//   GET   /notifications/count
// ---------------------------------------------------------------------------

export const NotificationService = {
  async getNotifications({ page = 1, limit = 10, read = '' } = {}) {
    if (USE_MOCK) {
      await delay(500);
      let data = [...MOCK_NOTIFICATIONS];
      if (read !== '') data = data.filter((n) => String(n.read) === String(read));
      const total = data.length;
      data = data.slice((page - 1) * limit, page * limit);
      return { data, total, page };
    }
    return request('GET', `/notifications?page=${page}&limit=${limit}&read=${read}`);
  },

  async markAsRead(id) {
    if (USE_MOCK) { await delay(300); const idx = MOCK_NOTIFICATIONS.findIndex((n) => n.id === id); if (idx !== -1) MOCK_NOTIFICATIONS[idx].read = true; return { success: true }; }
    return request('PATCH', `/notifications/${id}/read`);
  },

  async markAllAsRead() {
    if (USE_MOCK) { await delay(500); MOCK_NOTIFICATIONS.forEach((n) => { n.read = true; }); return { success: true }; }
    return request('PATCH', '/notifications/read-all');
  },

  async getUnreadCount() {
    if (USE_MOCK) { await delay(200); return { count: MOCK_NOTIFICATIONS.filter((n) => !n.read).length }; }
    return request('GET', '/notifications/count');
  },
};
