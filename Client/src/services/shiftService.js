import api from '../api/client.js';

/**
 * Service for cash drawer shifts and end-of-shift Z-Reports.
 * Connects directly to authoritative backend /api/v1/hotel/shifts routes.
 */
export const shiftService = {
  /**
   * Retrieves current active drawer shift for authenticated cashier.
   * Note: Pre-count financial values are server-sanitized for regular cashiers.
   */
  getActiveShift: () => api.get('/hotel/shifts/active'),

  /**
   * Opens a new cash shift with opening float and drawer name.
   */
  openShift: (data) => api.post('/hotel/shifts/open', data),

  /**
   * Closes an active cash shift with physical blind counted cash.
   * Generates authoritative reconciliation and sealed Z-Report.
   */
  closeShift: (data) => api.post('/hotel/shifts/close', data),

  /**
   * Retrieves list of shifts with pagination, date, and status filters.
   */
  getShifts: (params) => api.get('/hotel/shifts', params),

  /**
   * Retrieves details and sealed Z-report data for a specific shift.
   */
  getShiftById: (id) => api.get(`/hotel/shifts/${id}`),
};

export default shiftService;
