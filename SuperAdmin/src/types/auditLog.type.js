/**
 * @typedef {'HOTEL_APPROVED' | 'HOTEL_REJECTED' | 'HOTEL_SUSPENDED' | 'HOTEL_ACTIVATED' | 'USER_SUSPENDED' | 'USER_ACTIVATED' | 'SETTINGS_CHANGED' | 'LOGIN'} AuditAction
 */

/**
 * @typedef {Object} AuditLog
 * @property {string} id - Unique log entry ID
 * @property {AuditAction} action - Action performed
 * @property {string} performedBy - Admin name
 * @property {string} performedById - Admin user ID
 * @property {string} targetEntity - 'Hotel' | 'User' | 'Subscription' | 'System'
 * @property {string} targetId - ID of entity affected
 * @property {string} targetName - Name of entity affected
 * @property {string} ipAddress - Client IP address
 * @property {string} timestamp - ISO timestamp
 * @property {Record<string, any>} [details] - Extra metadata or change delta
 */

export const AuditActions = {
  HOTEL_APPROVED: 'HOTEL_APPROVED',
  HOTEL_REJECTED: 'HOTEL_REJECTED',
  HOTEL_SUSPENDED: 'HOTEL_SUSPENDED',
  HOTEL_ACTIVATED: 'HOTEL_ACTIVATED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  LOGIN: 'LOGIN',
};
