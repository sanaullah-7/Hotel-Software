
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }

const USE_MOCK = true;

const MOCK_APPROVALS = [
  { id: 'a1', hotelId: '3', hotelName: 'Avari Hotel Karachi', managerName: 'Bilal Hussain', managerEmail: 'bilal.h@example.com', managerPhone: '+92-300-1234567', city: 'Karachi', province: 'Sindh', address: 'Fatima Jinnah Road', phone: '+92-21-111-585-585', email: 'avari@example.com', status: 'PENDING', registeredAt: '2024-09-01', totalRooms: 194, subscriptionPlan: 'STANDARD' }
];

// Helper to get data from localStorage (shared if same domain, or just mock)

const getSharedReqs = () => {
  try {
    const match = document.cookie.match(new RegExp('(^| )hotel_registration_requests=([^;]+)'));
    if (match) return JSON.parse(decodeURIComponent(match[2]));
  } catch(e) {}
  return JSON.parse(localStorage.getItem('hotel_registration_requests') || '[]');
};

const setSharedReqs = (reqs) => {
  const val = JSON.stringify(reqs);
  localStorage.setItem('hotel_registration_requests', val);
  document.cookie = "hotel_registration_requests=" + encodeURIComponent(val) + "; path=/; max-age=31536000";
};

const getLocalApprovals = () => getSharedReqs();

const saveLocalApprovals = (data) => setSharedReqs(data);

export const ApprovalService = {
  async getApprovals({ status = '', page = 1, limit = 10, search = '' } = {}) {
    if (USE_MOCK) {
      await delay(400);
      let data = getLocalApprovals();
      if (status) data = data.filter((a) => a.status === status);
      if (search) data = data.filter((a) =>
        (a.hotelName || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.managerName || '').toLowerCase().includes(search.toLowerCase())
      );
      const total = data.length;
      data = data.slice((page - 1) * limit, page * limit);
      return { data, total, page };
    }
  },

  async getApprovalById(id) {
    if (USE_MOCK) {
      await delay(200);
      const item = getLocalApprovals().find((a) => a.id === id);
      if (!item) throw new Error('Approval request not found');
      return item;
    }
  },

  async approveRequest(id) {
    if (USE_MOCK) {
      await delay(400);
      const data = getLocalApprovals();
      const idx = data.findIndex((a) => a.id === id);
      if (idx !== -1) { 
        data[idx].status = 'APPROVED'; 
        data[idx].approvedAt = new Date().toISOString(); 
        saveLocalApprovals(data);
      }
      return { success: true };
    }
  },

  async getPendingApprovals(params = {}) {
    return this.getApprovals({ ...params, status: 'PENDING' });
  },

  async rejectRequest(id, reason) {
    if (USE_MOCK) {
      await delay(400);
      const data = getLocalApprovals();
      const idx = data.findIndex((a) => a.id === id);
      if (idx !== -1) {
        data[idx].status = 'REJECTED';
        data[idx].rejectionReason = reason;
        data[idx].rejectedAt = new Date().toISOString();
        saveLocalApprovals(data);
      }
      return { success: true, rejectionReason: reason };
    }
  },

  async getPendingCount() {
    if (USE_MOCK) {
      await delay(100);
      return { count: getLocalApprovals().filter((a) => a.status === 'PENDING').length };
    }
  },
};
