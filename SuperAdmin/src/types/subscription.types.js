/**
 * @typedef {'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'TRIAL'} SubscriptionStatus
 */

/**
 * @typedef {'BASIC' | 'PRO' | 'ENTERPRISE'} PlanTier
 */

/**
 * @typedef {Object} SubscriptionPlan
 * @property {string} id - Plan ID
 * @property {string} name - Plan Name
 * @property {PlanTier} tier - Tier
 * @property {number} price - Monthly price in PKR
 * @property {number} maxRooms - Max rooms allowed
 * @property {string[]} features - Feature list
 * @property {boolean} isPopular - Highlight tag
 */

/**
 * @typedef {Object} HotelSubscription
 * @property {string} id - Subscription record ID
 * @property {string} hotelId - Associated hotel ID
 * @property {string} hotelName - Associated hotel name
 * @property {string} planId - Associated plan ID
 * @property {string} planName - Plan name
 * @property {SubscriptionStatus} status - Current subscription status
 * @property {string} startDate - Start date ISO string
 * @property {string} endDate - Renewal/expiry date ISO string
 * @property {number} amount - Amount billed in PKR
 * @property {string} paymentMethod - Payment method (Bank Transfer / Card / JazzCash / EasyPaisa)
 */

export const SubscriptionStatuses = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  TRIAL: 'TRIAL',
};
