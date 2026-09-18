/**
 * @typedef {'PENDING' | 'APPROVED' | 'REJECTED'} ApprovalStatus
 */

/**
 * @typedef {Object} ApprovalRequest
 * @property {string} id - Approval request ID
 * @property {string} hotelId - Associated hotel ID
 * @property {string} hotelName - Hotel business name
 * @property {string} managerName - Submitting manager name
 * @property {string} managerEmail - Manager email
 * @property {string} managerPhone - Manager phone
 * @property {string} city - Hotel location city
 * @property {number} roomsCount - Total rooms submitted
 * @property {string} registrationNumber - NTN / legal registration number
 * @property {string[]} documents - URLs to submitted documents (NTN, CNIC, License)
 * @property {ApprovalStatus} status - Approval status
 * @property {string} submittedAt - ISO date string
 * @property {string} [reviewedAt] - ISO date string
 * @property {string} [reviewedBy] - SuperAdmin ID who handled the review
 * @property {string} [rejectionReason] - Reason provided if rejected
 * @property {string} [notes] - Internal admin notes
 */

export const ApprovalStatuses = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};
