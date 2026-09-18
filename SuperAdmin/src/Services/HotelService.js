import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function getHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Mock data — remove and replace with real API calls when backend is ready
// ---------------------------------------------------------------------------

const MOCK_HOTELS = [
  { id: '1', name: 'Pearl Continental Lahore', city: 'Lahore', province: 'Punjab', country: 'Pakistan', address: '65 Shahrah-e-Quaid-e-Azam', phone: '+92-42-111-505-505', email: 'pc.lahore@example.com', managerName: 'Ahmed Khan', managerEmail: 'ahmed.khan@example.com', status: 'ACTIVE', subscriptionPlan: 'PREMIUM', createdAt: '2024-01-15', totalRooms: 420, rating: 4.7, revenue: 125000 },
  { id: '2', name: 'Serena Hotel Islamabad', city: 'Islamabad', province: 'ICT', country: 'Pakistan', address: 'Khayaban-e-Suharwardy', phone: '+92-51-111-133-133', email: 'serena.isb@example.com', managerName: 'Sara Ali', managerEmail: 'sara.ali@example.com', status: 'ACTIVE', subscriptionPlan: 'ENTERPRISE', createdAt: '2024-02-20', totalRooms: 260, rating: 4.8, revenue: 210000 },
  { id: '3', name: 'Avari Hotel Karachi', city: 'Karachi', province: 'Sindh', country: 'Pakistan', address: 'Fatima Jinnah Road', phone: '+92-21-111-585-585', email: 'avari@example.com', managerName: 'Bilal Hussain', managerEmail: 'bilal.h@example.com', status: 'PENDING', subscriptionPlan: 'STANDARD', createdAt: '2024-09-01', totalRooms: 194, rating: 4.3, revenue: 85000 },
  { id: '4', name: 'Mövenpick Hotel Karachi', city: 'Karachi', province: 'Sindh', country: 'Pakistan', address: 'Club Road', phone: '+92-21-111-606-606', email: 'movenpick.khi@example.com', managerName: 'Fatima Sheikh', managerEmail: 'fatima.s@example.com', status: 'PENDING', subscriptionPlan: 'PREMIUM', createdAt: '2024-09-05', totalRooms: 312, rating: 4.5, revenue: 95000 },
  { id: '5', name: 'Ramada Multan', city: 'Multan', province: 'Punjab', country: 'Pakistan', address: 'Abdali Road', phone: '+92-61-4511-234', email: 'ramada.multan@example.com', managerName: 'Usman Raza', managerEmail: 'usman.r@example.com', status: 'SUSPENDED', subscriptionPlan: 'BASIC', createdAt: '2023-11-10', totalRooms: 88, rating: 3.9, revenue: 32000 },
  { id: '6', name: 'Sunfort Hotel Peshawar', city: 'Peshawar', province: 'KPK', country: 'Pakistan', address: 'University Road', phone: '+92-91-5844-100', email: 'sunfort@example.com', managerName: 'Imran Khattak', managerEmail: 'imran.k@example.com', status: 'REJECTED', subscriptionPlan: 'BASIC', createdAt: '2024-08-22', totalRooms: 55, rating: 3.4, rejectionReason: 'Incomplete documentation provided.', revenue: 0 },
  { id: '7', name: 'Hotel One Faisalabad', city: 'Faisalabad', province: 'Punjab', country: 'Pakistan', address: 'Susan Road', phone: '+92-41-8732-100', email: 'hotelone.fsd@example.com', managerName: 'Naveed Iqbal', managerEmail: 'naveed.i@example.com', status: 'ACTIVE', subscriptionPlan: 'STANDARD', createdAt: '2024-03-18', totalRooms: 112, rating: 4.1, revenue: 45000 },
  { id: '8', name: 'Crown Plaza Quetta', city: 'Quetta', province: 'Balochistan', country: 'Pakistan', address: 'Jinnah Road', phone: '+92-81-2820-100', email: 'crown.quetta@example.com', managerName: 'Zara Baloch', managerEmail: 'zara.b@example.com', status: 'PENDING', subscriptionPlan: 'STANDARD', createdAt: '2024-09-08', totalRooms: 78, rating: 3.8, revenue: 21000 },
];

const USE_MOCK = true; // Set to false when real backend is available

// ---------------------------------------------------------------------------
// Hotel Service
// Expected backend endpoints:
//   GET    /hotels?page=&limit=&status=&city=&search=
//   GET    /hotels/:id
//   PATCH  /hotels/:id/approve
//   PATCH  /hotels/:id/reject   { reason }
//   PATCH  /hotels/:id/suspend  { reason }
//   PATCH  /hotels/:id/reactivate
// ---------------------------------------------------------------------------

export const HotelService = {
  /** @returns {{ data: object[], total: number, page: number }} */
  async getHotels({ page = 1, limit = 10, status = '', search = '', city = '' } = {}) {
    if (USE_MOCK) {
      await delay(600);
      let data = [...MOCK_HOTELS];
      if (status) data = data.filter((h) => h.status === status);
      if (city)   data = data.filter((h) => h.city.toLowerCase().includes(city.toLowerCase()));
      if (search) data = data.filter((h) =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.managerName.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
      );
      const total = data.length;
      data = data.slice((page - 1) * limit, page * limit);
      return { data, total, page };
    }
    return request('GET', `/hotels?page=${page}&limit=${limit}&status=${status}&search=${search}&city=${city}`);
  },

  /** @returns {object} */
  async getHotelById(id) {
    if (USE_MOCK) {
      await delay(400);
      const hotel = MOCK_HOTELS.find((h) => h.id === id);
      if (!hotel) throw new Error('Hotel not found');
      return hotel;
    }
    return request('GET', `/hotels/${id}`);
  },

  async approveHotel(id) {
    if (USE_MOCK) {
      await delay(800);
      const idx = MOCK_HOTELS.findIndex((h) => h.id === id);
      if (idx !== -1) MOCK_HOTELS[idx].status = 'ACTIVE';
      return { success: true };
    }
    return request('PATCH', `/hotels/${id}/approve`);
  },

  async rejectHotel(id, reason) {
    if (USE_MOCK) {
      await delay(800);
      const idx = MOCK_HOTELS.findIndex((h) => h.id === id);
      if (idx !== -1) { MOCK_HOTELS[idx].status = 'REJECTED'; MOCK_HOTELS[idx].rejectionReason = reason; }
      return { success: true };
    }
    return request('PATCH', `/hotels/${id}/reject`, { reason });
  },

  async suspendHotel(id, reason) {
    if (USE_MOCK) {
      await delay(800);
      const idx = MOCK_HOTELS.findIndex((h) => h.id === id);
      if (idx !== -1) MOCK_HOTELS[idx].status = 'SUSPENDED';
      return { success: true };
    }
    return request('PATCH', `/hotels/${id}/suspend`, { reason });
  },

  async reactivateHotel(id) {
    if (USE_MOCK) {
      await delay(800);
      const idx = MOCK_HOTELS.findIndex((h) => h.id === id);
      if (idx !== -1) MOCK_HOTELS[idx].status = 'ACTIVE';
      return { success: true };
    }
    return request('PATCH', `/hotels/${id}/reactivate`);
  },

  async getStats() {
    if (USE_MOCK) {
      await delay(400);
      return {
        total:     MOCK_HOTELS.length,
        active:    MOCK_HOTELS.filter((h) => h.status === 'ACTIVE').length,
        pending:   MOCK_HOTELS.filter((h) => h.status === 'PENDING').length,
        suspended: MOCK_HOTELS.filter((h) => h.status === 'SUSPENDED').length,
        rejected:  MOCK_HOTELS.filter((h) => h.status === 'REJECTED').length,
      };
    }
    return request('GET', '/hotels/stats');
  },
};

// Delay helper for mock simulation
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
