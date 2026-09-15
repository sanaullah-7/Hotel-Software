import { UserService } from './UserService.js';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const USE_MOCK = true;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export const ReceptionistService = {
  /**
   * Get paginated receptionists
   * @param {Object} params
   */
  async getReceptionists(params = {}) {
    return UserService.getUsers({ ...params, role: 'RECEPTIONIST' });
  },

  /**
   * Get receptionist by ID
   * @param {string} id
   */
  async getReceptionistById(id) {
    return UserService.getUserById(id);
  },

  /**
   * Suspend a receptionist account
   * @param {string} id
   * @param {string} reason
   */
  async suspendReceptionist(id, reason = '') {
    return UserService.suspendUser(id, reason);
  },

  /**
   * Activate a receptionist account
   * @param {string} id
   */
  async activateReceptionist(id) {
    return UserService.activateUser(id);
  },

  /**
   * Get receptionist stats
   */
  async getReceptionistStats() {
    if (USE_MOCK) {
      await delay(400);
      return {
        totalReceptionists: 4,
        activeReceptionists: 3,
        pendingReceptionists: 1,
        suspendedReceptionists: 0,
      };
    }
    const res = await fetch(`${API_BASE_URL}/receptionists/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch receptionist stats');
    return res.json();
  }
};
