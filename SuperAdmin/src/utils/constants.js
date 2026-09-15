// =============================================================================
// CONSTANTS — Explore Pakistan Super Admin
// =============================================================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Auth
export const AUTH_TOKEN_KEY   = 'sa_token';
export const AUTH_USER_KEY    = 'sa_user';
export const THEME_KEY        = 'sa_theme';
export const SIDEBAR_KEY      = 'sa_sidebar_collapsed';

// Roles
export const ROLES = {
  SUPER_ADMIN:  'SUPER_ADMIN',
  MANAGER:      'MANAGER',
  RECEPTIONIST: 'RECEPTIONIST',
};

// Hotel / User Status
export const STATUS = {
  PENDING:   'PENDING',
  APPROVED:  'APPROVED',
  ACTIVE:    'ACTIVE',
  INACTIVE:  'INACTIVE',
  REJECTED:  'REJECTED',
  SUSPENDED: 'SUSPENDED',
  EXPIRED:   'EXPIRED',
};

// Subscription Plans
export const PLANS = {
  BASIC:      'BASIC',
  STANDARD:   'STANDARD',
  PREMIUM:    'PREMIUM',
  ENTERPRISE: 'ENTERPRISE',
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE:   'ACTIVE',
  EXPIRED:  'EXPIRED',
  TRIAL:    'TRIAL',
  CANCELED: 'CANCELED',
};

// Pagination defaults
export const PAGE_SIZES = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

// Route paths
export const ROUTES = {
  ROOT:              '/',
  LOGIN:             '/login',
  DASHBOARD:         '/dashboard',

  HOTELS:            '/hotels',
  HOTELS_PENDING:    '/hotels/pending',
  HOTEL_DETAIL:      '/hotels/:id',

  USERS:             '/users',
  MANAGERS:          '/users/managers',
  RECEPTIONISTS:     '/users/receptionists',

  APPROVALS:         '/approvals',
  APPROVALS_PENDING: '/approvals/pending',
  APPROVALS_APPROVED:'/approvals/approved',
  APPROVALS_REJECTED:'/approvals/rejected',

  SUBSCRIPTIONS:     '/subscriptions',
  PLANS:             '/subscriptions/plans',

  REVENUE:           '/revenue',

  REPORTS:           '/reports',

  NOTIFICATIONS:     '/notifications',

  AUDIT_LOGS:        '/audit-logs',

  SETTINGS:          '/settings',
  PROFILE:           '/profile',

  SUPPORT:           '/support',
};

// Notification types
export const NOTIFICATION_TYPE = {
  INFO:    'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR:   'error',
};

// Audit action types
export const AUDIT_ACTIONS = {
  LOGIN:              'LOGIN',
  LOGOUT:             'LOGOUT',
  HOTEL_APPROVED:     'HOTEL_APPROVED',
  HOTEL_REJECTED:     'HOTEL_REJECTED',
  HOTEL_SUSPENDED:    'HOTEL_SUSPENDED',
  HOTEL_REACTIVATED:  'HOTEL_REACTIVATED',
  USER_ACTIVATED:     'USER_ACTIVATED',
  USER_SUSPENDED:     'USER_SUSPENDED',
  SUBSCRIPTION_CHANGED: 'SUBSCRIPTION_CHANGED',
  SETTINGS_CHANGED:   'SETTINGS_CHANGED',
};
