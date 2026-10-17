import { UserService } from './UserService.js';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

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
    const res = await fetch(`${API_BASE_URL}/users/${managerId}/assign-hotel`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ hotelId }),
    });
    const json = await res.json().catch(() => ({ message: res.statusText }));
    if (!res.ok) throw new Error(json.message || 'Failed to assign hotel to manager');
    return json?.data || json;
  },

  /**
   * Get manager metrics from live database
   */
  async getManagerStats() {
    const stats = await UserService.getStats();
    return {
      totalManagers: stats?.totalManagers || 0,
      activeManagers: stats?.activeUsers || 0,
      pendingManagers: stats?.pendingUsers || 0,
      suspendedManagers: stats?.suspendedUsers || 0,
    };
  }
};
