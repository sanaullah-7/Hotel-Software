/**
 * @typedef {'SUPER_ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'GUEST'} UserRole
 */

/**
 * @typedef {'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'INACTIVE'} UserStatus
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user ID
 * @property {string} name - User full name
 * @property {string} email - Email address
 * @property {string} phone - Contact phone number
 * @property {UserRole} role - User role
 * @property {UserStatus} status - Account status
 * @property {string} [hotelId] - Associated hotel ID (for Manager & Receptionist)
 * @property {string} [hotelName] - Associated hotel name
 * @property {string} createdAt - Account creation date ISO string
 * @property {string} lastLogin - Last login timestamp ISO string
 * @property {string} [avatar] - Profile picture URL
 */

export const UserRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  RECEPTIONIST: 'RECEPTIONIST',
  GUEST: 'GUEST',
};

export const UserStatuses = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
  INACTIVE: 'INACTIVE',
};
