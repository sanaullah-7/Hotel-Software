/**
 * @typedef {'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED'} PaymentStatus
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - Transaction reference number
 * @property {string} hotelId - Hotel ID
 * @property {string} hotelName - Hotel business name
 * @property {string} planName - Subscription plan
 * @property {number} amount - Amount in PKR
 * @property {PaymentStatus} status - Payment status
 * @property {string} paymentMethod - Bank Transfer, Visa/Mastercard, etc.
 * @property {string} date - ISO date string
 */

/**
 * @typedef {Object} RevenueStats
 * @property {number} totalRevenue - All-time revenue in PKR
 * @property {number} monthlyRevenue - Current month revenue
 * @property {number} annualRevenue - Current year revenue
 * @property {number} growthPercentage - MoM growth
 * @property {Array<{ month: string, revenue: number, subscriptions: number }>} history - Monthly trends
 */
