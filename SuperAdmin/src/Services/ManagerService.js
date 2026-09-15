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

export const ManagerService = {
  /**
   * Get paginated list of managers with filters
   * @param {Object} params
   */
  async getManagers(params = {}) {
    return UserService.getUsers({ ...params, role: 'MANAGER' });
  },

  /**
   * Get manager by ID
   * @param {string} id
   */
  async getManagerById(id) {
    return UserService.getUserById(id);
  },

  /**
   * Suspend a manager account
   * @param {string} id
   * @param {string} reason
   */
  async suspendManager(id, reason = '') {
    return UserService.suspendUser(id, reason);
  },

  /**
   * Reactivate a manager account
   * @param {string} id
   */
  async activateManager(id) {
    return UserService.activateUser(id);
  },

  /**
   * Assign manager to a hotel
   * @param {string} managerId
   * @param {string} hotelId
   */
  async assignHotel(managerId, hotelId) {
    if (USE_MOCK) {
      await delay(500);
      return { success: true, managerId, hotelId, message: 'Hotel assigned successfully' };
    }
    const res = await fetch(`${API_BASE_URL}/managers/${managerId}/assign-hotel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ hotelId }),
    });
    if (!res.ok) throw new Error('Failed to assign hotel to manager');
    return res.json();
  },

  /**
   * Get manager metrics / overview stats
   */
  async getManagerStats() {
    if (USE_MOCK) {
      await delay(400);
      return {
        totalManagers: 6,
        activeManagers: 4,
        pendingManagers: 2,
        suspendedManagers: 1,
      };
    }
    const res = await fetch(`${API_BASE_URL}/managers/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch manager stats');
    return res.json();
  }
};
