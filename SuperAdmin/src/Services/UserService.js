import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function request(method, path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, { method, headers: getHeaders(), ...(body ? { body: JSON.stringify(body) } : {}) });
  if (!res.ok) { const err = await res.json().catch(() => ({ message: res.statusText })); throw new Error(err.message || 'Request failed'); }
  return res.json();
}
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
const USE_MOCK = true;

const MOCK_USERS = [
  { id: 'u1', name: 'Ahmed Khan', email: 'ahmed.khan@example.com', phone: '+92-300-0001111', role: 'MANAGER', status: 'ACTIVE', hotelId: '1', hotelName: 'Pearl Continental Lahore', createdAt: '2024-01-10', lastLogin: '2024-09-08' },
  { id: 'u2', name: 'Sara Ali', email: 'sara.ali@example.com', phone: '+92-321-0002222', role: 'MANAGER', status: 'ACTIVE', hotelId: '2', hotelName: 'Serena Hotel Islamabad', createdAt: '2024-02-15', lastLogin: '2024-09-09' },
  { id: 'u3', name: 'Bilal Hussain', email: 'bilal.h@example.com', phone: '+92-300-1234567', role: 'MANAGER', status: 'PENDING', hotelId: '3', hotelName: 'Avari Hotel Karachi', createdAt: '2024-09-01', lastLogin: null },
  { id: 'u4', name: 'Fatima Sheikh', email: 'fatima.s@example.com', phone: '+92-321-9876543', role: 'MANAGER', status: 'PENDING', hotelId: '4', hotelName: 'Mövenpick Hotel Karachi', createdAt: '2024-09-05', lastLogin: null },
  { id: 'u5', name: 'Usman Raza', email: 'usman.r@example.com', phone: '+92-333-5556666', role: 'MANAGER', status: 'SUSPENDED', hotelId: '5', hotelName: 'Ramada Multan', createdAt: '2023-11-01', lastLogin: '2024-07-15' },
  { id: 'u6', name: 'Naveed Iqbal', email: 'naveed.i@example.com', phone: '+92-300-7778888', role: 'MANAGER', status: 'ACTIVE', hotelId: '7', hotelName: 'Hotel One Faisalabad', createdAt: '2024-03-10', lastLogin: '2024-09-07' },
  { id: 'u7', name: 'Khalid Mehmood', email: 'khalid.m@example.com', phone: '+92-321-1112223', role: 'RECEPTIONIST', status: 'ACTIVE', hotelId: '1', hotelName: 'Pearl Continental Lahore', createdAt: '2024-01-20', lastLogin: '2024-09-10' },
  { id: 'u8', name: 'Nadia Tariq', email: 'nadia.t@example.com', phone: '+92-300-4445556', role: 'RECEPTIONIST', status: 'ACTIVE', hotelId: '2', hotelName: 'Serena Hotel Islamabad', createdAt: '2024-02-28', lastLogin: '2024-09-09' },
  { id: 'u9', name: 'Asim Farooq', email: 'asim.f@example.com', phone: '+92-312-7778889', role: 'RECEPTIONIST', status: 'PENDING', hotelId: '3', hotelName: 'Avari Hotel Karachi', createdAt: '2024-09-02', lastLogin: null },
  { id: 'u10', name: 'Hina Malik', email: 'hina.m@example.com', phone: '+92-333-2223334', role: 'RECEPTIONIST', status: 'ACTIVE', hotelId: '7', hotelName: 'Hotel One Faisalabad', createdAt: '2024-03-20', lastLogin: '2024-09-08' },
];

// ---------------------------------------------------------------------------
// User Service
// Expected backend endpoints:
//   GET   /users?role=&status=&page=&limit=&search=
//   GET   /users/:id
//   PATCH /users/:id/activate
//   PATCH /users/:id/suspend
// ---------------------------------------------------------------------------

export const UserService = {
  async getUsers({ role = '', status = '', page = 1, limit = 10, search = '' } = {}) {
    if (USE_MOCK) {
      await delay(600);
      let data = [...MOCK_USERS];
      if (role)   data = data.filter((u) => u.role === role);
      if (status) data = data.filter((u) => u.status === status);
      if (search) data = data.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.hotelName?.toLowerCase().includes(search.toLowerCase())
      );
      const total = data.length;
      data = data.slice((page - 1) * limit, page * limit);
      return { data, total, page };
    }
    return request('GET', `/users?role=${role}&status=${status}&page=${page}&limit=${limit}&search=${search}`);
  },

  async getUserById(id) {
    if (USE_MOCK) { await delay(400); const u = MOCK_USERS.find((u) => u.id === id); if (!u) throw new Error('User not found'); return u; }
    return request('GET', `/users/${id}`);
  },

  async activateUser(id) {
    if (USE_MOCK) { await delay(800); const idx = MOCK_USERS.findIndex((u) => u.id === id); if (idx !== -1) MOCK_USERS[idx].status = 'ACTIVE'; return { success: true }; }
    return request('PATCH', `/users/${id}/activate`);
  },

  async suspendUser(id) {
    if (USE_MOCK) { await delay(800); const idx = MOCK_USERS.findIndex((u) => u.id === id); if (idx !== -1) MOCK_USERS[idx].status = 'SUSPENDED'; return { success: true }; }
    return request('PATCH', `/users/${id}/suspend`);
  },

  async getStats() {
    if (USE_MOCK) {
      await delay(400);
      return {
        totalManagers:       MOCK_USERS.filter((u) => u.role === 'MANAGER').length,
        totalReceptionists:  MOCK_USERS.filter((u) => u.role === 'RECEPTIONIST').length,
        activeUsers:         MOCK_USERS.filter((u) => u.status === 'ACTIVE').length,
        pendingUsers:        MOCK_USERS.filter((u) => u.status === 'PENDING').length,
        suspendedUsers:      MOCK_USERS.filter((u) => u.status === 'SUSPENDED').length,
      };
    }
    return request('GET', '/users/stats');
  },
};
