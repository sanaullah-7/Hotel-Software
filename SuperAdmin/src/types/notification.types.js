/**
 * @typedef {'HOTEL_REGISTRATION' | 'APPROVAL_REQUEST' | 'SUBSCRIPTION_EXPIRING' | 'PAYMENT_RECEIVED' | 'USER_REPORT' | 'SYSTEM'} NotificationType
 */

/**
 * @typedef {Object} SystemNotification
 * @property {string} id - Notification ID
 * @property {string} title - Short notification heading
 * @property {string} message - Full message body
 * @property {NotificationType} type - Notification category
 * @property {boolean} isRead - Read state
 * @property {string} [link] - Deep link URL
 * @property {string} createdAt - ISO timestamp
 */

export const NotificationTypes = {
  HOTEL_REGISTRATION: 'HOTEL_REGISTRATION',
  APPROVAL_REQUEST: 'APPROVAL_REQUEST',
  SUBSCRIPTION_EXPIRING: 'SUBSCRIPTION_EXPIRING',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  USER_REPORT: 'USER_REPORT',
  SYSTEM: 'SYSTEM',
};
