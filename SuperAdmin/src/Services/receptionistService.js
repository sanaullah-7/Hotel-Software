import { UserService } from './UserService.js';

export const ReceptionistService = {
  /**
   * Get paginated receptionists from live database
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
   * Get receptionist stats from live database
   */
  async getReceptionistStats() {
    const stats = await UserService.getStats();
    return {
      totalReceptionists: stats?.totalReceptionists || 0,
      activeReceptionists: stats?.activeUsers || 0,
      pendingReceptionists: stats?.pendingUsers || 0,
      suspendedReceptionists: stats?.suspendedUsers || 0,
    };
  }
};
