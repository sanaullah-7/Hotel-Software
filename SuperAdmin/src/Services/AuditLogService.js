import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';
function getHeaders() { const t = localStorage.getItem(AUTH_TOKEN_KEY); return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }; }
async function request(method, path, body) { const res = await fetch(`${API_BASE_URL}${path}`, { method, headers: getHeaders(), ...(body ? { body: JSON.stringify(body) } : {}) }); if (!res.ok) { const e = await res.json().catch(() => ({ message: res.statusText })); throw new Error(e.message || 'Request failed'); } return res.json(); }
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
const USE_MOCK = true;

const MOCK_LOGS = [
  { id: 'l1', action: 'HOTEL_APPROVED', entity: 'Pearl Continental Lahore', entityType: 'hotel', performedBy: 'Super Admin', ip: '192.168.1.1', createdAt: new Date(Date.now() - 2*3600000).toISOString() },
  { id: 'l2', action: 'LOGIN',          entity: 'Super Admin',               entityType: 'user',  performedBy: 'Super Admin', ip: '192.168.1.1', createdAt: new Date(Date.now() - 4*3600000).toISOString() },
  { id: 'l3', action: 'HOTEL_SUSPENDED',entity: 'Ramada Multan',             entityType: 'hotel', performedBy: 'Super Admin', ip: '192.168.1.1', createdAt: new Date(Date.now() - 24*3600000).toISOString() },
  { id: 'l4', action: 'HOTEL_REJECTED', entity: 'Sunfort Hotel Peshawar',    entityType: 'hotel', performedBy: 'Super Admin', ip: '192.168.1.1', createdAt: new Date(Date.now() - 36*3600000).toISOString() },
  { id: 'l5', action: 'USER_ACTIVATED', entity: 'Sara Ali',                  entityType: 'user',  performedBy: 'Super Admin', ip: '192.168.1.2', createdAt: new Date(Date.now() - 72*3600000).toISOString() },
];

// ---------------------------------------------------------------------------
// Audit Log Service
// Expected backend endpoints:
//   GET /audit-logs?page=&limit=&action=&entityType=&search=
// ---------------------------------------------------------------------------

export const AuditLogService = {
  async getLogs({ page = 1, limit = 10, action = '', entityType = '', search = '' } = {}) {
    if (USE_MOCK) {
      await delay(600);
      let data = [...MOCK_LOGS];
      if (action)     data = data.filter((l) => l.action === action);
      if (entityType) data = data.filter((l) => l.entityType === entityType);
      if (search)     data = data.filter((l) => l.entity.toLowerCase().includes(search.toLowerCase()) || l.performedBy.toLowerCase().includes(search.toLowerCase()));
      const total = data.length;
      data = data.slice((page - 1) * limit, page * limit);
      return { data, total, page };
    }
    return request('GET', `/audit-logs?page=${page}&limit=${limit}&action=${action}&entityType=${entityType}&search=${search}`);
  },
};
