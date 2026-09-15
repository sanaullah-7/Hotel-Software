/**
 * @typedef {Object} Hotel
 * @property {string} id - Unique hotel identifier
 * @property {string} name - Hotel name
 * @property {string} slug - URL slug
 * @property {string} email - Hotel contact email
 * @property {string} phone - Hotel contact phone
 * @property {string} city - Hotel location city
 * @property {string} state - Hotel province/state
 * @property {string} address - Full address
 * @property {number} roomsCount - Total rooms available
 * @property {number} starRating - Star rating (1-5)
 * @property {'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'} status - Current status
 * @property {string} managerId - Associated manager user ID
 * @property {string} managerName - Manager name
 * @property {string} managerEmail - Manager email
 * @property {string} managerPhone - Manager phone
 * @property {string} registrationNumber - Official government / NTN registration number
 * @property {string[]} amenities - List of amenities
 * @property {string[]} images - URLs of hotel images
 * @property {string} createdAt - ISO date string of registration
 * @property {string} updatedAt - ISO date string of last update
 * @property {string} [suspensionReason] - Reason if suspended
 * @property {string} [rejectionReason] - Reason if rejected
 */

export const HotelStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  ACTIVE: 'APPROVED',
};
