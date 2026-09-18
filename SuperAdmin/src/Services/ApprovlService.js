import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
async function request(method, path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method, headers: getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

const USE_MOCK = true;

// Mock pending approval requests (hotels awaiting review)
const MOCK_APPROVALS = [
  { id: 'a1', hotelId: '3', hotelName: 'Avari Hotel Karachi', managerName: 'Bilal Hussain', managerEmail: 'bilal.h@example.com', managerPhone: '+92-300-1234567', city: 'Karachi', province: 'Sindh', address: 'Fatima Jinnah Road', phone: '+92-21-111-585-585', email: 'avari@example.com', status: 'PENDING', registeredAt: '2024-09-01', totalRooms: 194, subscriptionPlan: 'STANDARD' },
  { id: 'a2', hotelId: '4', hotelName: 'Mövenpick Hotel Karachi', managerName: 'Fatima Sheikh', managerEmail: 'fatima.s@example.com', managerPhone: '+92-321-9876543', city: 'Karachi', province: 'Sindh', address: 'Club Road', phone: '+92-21-111-606-606', email: 'movenpick.khi@example.com', status: 'PENDING', registeredAt: '2024-09-05', totalRooms: 312, subscriptionPlan: 'PREMIUM' },
  { id: 'a3', hotelId: '8', hotelName: 'Crown Plaza Quetta', managerName: 'Zara Baloch', managerEmail: 'zara.b@example.com', managerPhone: '+92-333-1122334', city: 'Quetta', province: 'Balochistan', address: 'Jinnah Road', phone: '+92-81-2820-100', email: 'crown.quetta@example.com', status: 'PENDING', registeredAt: '2024-09-08', totalRooms: 78, subscriptionPlan: 'STANDARD' },
  { id: 'a4', hotelId: '1', hotelName: 'Pearl Continental Lahore', managerName: 'Ahmed Khan', managerEmail: 'ahmed.khan@example.com', managerPhone: '+92-300-0001111', city: 'Lahore', province: 'Punjab', address: '65 Shahrah-e-Quaid-e-Azam', phone: '+92-42-111-505-505', email: 'pc.lahore@example.com', status: 'APPROVED', registeredAt: '2024-01-15', approvedAt: '2024-01-20', totalRooms: 420, subscriptionPlan: 'PREMIUM' },
  { id: 'a5', hotelId: '6', hotelName: 'Sunfort Hotel Peshawar', managerName: 'Imran Khattak', managerEmail: 'imran.k@example.com', managerPhone: '+92-312-5556667', city: 'Peshawar', province: 'KPK', address: 'University Road', phone: '+92-91-5844-100', email: 'sunfort@example.com', status: 'REJECTED', registeredAt: '2024-08-22', rejectedAt: '2024-08-30', rejectionReason: 'Incomplete documentation provided.', totalRooms: 55, subscriptionPlan: 'BASIC' },
];

// ---------------------------------------------------------------------------
// Approval Service
// Expected backend endpoints:
//   GET   /approvals?status=&page=&limit=
//   GET   /approvals/:id
//   PATCH /approvals/:id/approve
//   PATCH /approvals/:id/reject { reason }
// ---------------------------------------------------------------------------

export const ApprovalService = {
  async getApprovals({ status = '', page = 1, limit = 10, search = '' } = {}) {
    if (USE_MOCK) {
      await delay(600);
      let data = [...MOCK_APPROVALS];
      if (status) data = data.filter((a) => a.status === status);
      if (search) data = data.filter((a) =>
        a.hotelName.toLowerCase().includes(search.toLowerCase()) ||
        a.managerName.toLowerCase().includes(search.toLowerCase())
      );
      const total = data.length;
      data = data.slice((page - 1) * limit, page * limit);
      return { data, total, page };
    }
    return request('GET', `/approvals?status=${status}&page=${page}&limit=${limit}&search=${search}`);
  },

  async getApprovalById(id) {
    if (USE_MOCK) {
      await delay(400);
      const item = MOCK_APPROVALS.find((a) => a.id === id);
      if (!item) throw new Error('Approval request not found');
      return item;
    }
    return request('GET', `/approvals/${id}`);
  },

  async approveRequest(id) {
    if (USE_MOCK) {
      await delay(900);
      const idx = MOCK_APPROVALS.findIndex((a) => a.id === id);
      if (idx !== -1) { MOCK_APPROVALS[idx].status = 'APPROVED'; MOCK_APPROVALS[idx].approvedAt = new Date().toISOString(); }
      return { success: true };
    }
    return request('PATCH', `/approvals/${id}/approve`);
  },

  async getPendingApprovals(params = {}) {
    return this.getApprovals({ ...params, status: 'PENDING' });
  },

  async rejectRequest(id, reason) {
    if (USE_MOCK) {
      await delay(900);
      const idx = MOCK_APPROVALS.findIndex((a) => a.id === id);
      if (idx !== -1) {
        MOCK_APPROVALS[idx].status = 'REJECTED';
        MOCK_APPROVALS[idx].rejectionReason = reason;
        MOCK_APPROVALS[idx].rejectedAt = new Date().toISOString();
      }
      return { success: true, rejectionReason: reason };
    }
    return request('PATCH', `/approvals/${id}/reject`, { reason });
  },

  async getPendingCount() {
    if (USE_MOCK) {
      await delay(200);
      return { count: MOCK_APPROVALS.filter((a) => a.status === 'PENDING').length };
    }
    return request('GET', '/approvals/pending/count');
  },
};
