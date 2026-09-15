import { ROLES } from './constants.js';

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [
    'approve_hotel',
    'reject_hotel',
    'suspend_hotel',
    'activate_hotel',
    'view_hotels',
    'manage_users',
    'manage_subscriptions',
    'view_revenue',
    'view_reports',
    'manage_settings',
    'view_audit_logs',
    'manage_support',
  ],
  [ROLES.MANAGER]: [
    'view_hotels',
    'manage_rooms',
    'manage_receptionists',
    'view_hotel_revenue',
  ],
  [ROLES.RECEPTIONIST]: [
    'check_in',
    'check_out',
    'view_rooms',
    'register_guest',
  ],
  [ROLES.GUEST]: [
    'search_hotels',
    'book_room',
    'view_own_booking',
  ],
};

/**
 * Check if a role has a specific permission.
 * @param {string} role
 * @param {string} permission
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

/**
 * Check if a user has the Super Admin role.
 * @param {object} user
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
  return user?.role === ROLES.SUPER_ADMIN;
}

/**
 * Check if a user has a given role.
 * @param {object} user
 * @param {string} role
 * @returns {boolean}
 */
export function hasRole(user, role) {
  return user?.role === role;
}

/**
 * Get the display label for a role.
 * @param {string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  const labels = {
    [ROLES.SUPER_ADMIN]:  'Super Admin',
    [ROLES.MANAGER]:      'Manager',
    [ROLES.RECEPTIONIST]: 'Receptionist',
  };
  return labels[role] || role;
}
