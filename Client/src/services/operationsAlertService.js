import api from "../api/client.js";

/**
 * Frontend Operations Alert Service
 * Communicates with the authoritative backend /api/v1/hotel/operations-alerts endpoints.
 */
export const operationsAlertService = {
  /**
   * List operations alerts with optional query filters and pagination.
   * @param {Object} [params={}] - Query filters (status, department, severity, is_active, search, page, limit, sortBy, sortOrder)
   * @returns {Promise<Object>} API response envelope { success, data, meta }
   */
  getOperationsAlerts: (params = {}) => api.get("/hotel/operations-alerts", params),

  /**
   * Alias for getOperationsAlerts
   */
  getAlerts: (params = {}) => api.get("/hotel/operations-alerts", params),

  /**
   * Retrieve a single operations alert by MongoDB ObjectId.
   * @param {string} id - Alert ObjectId
   * @returns {Promise<Object>} API response envelope { success, data }
   */
  getOperationsAlertById: (id) => api.get(`/hotel/operations-alerts/${id}`),

  /**
   * Alias for getOperationsAlertById
   */
  getAlertById: (id) => api.get(`/hotel/operations-alerts/${id}`),

  /**
   * Create (broadcast) a new operations alert.
   * @param {Object} data - Clean backend payload
   * @returns {Promise<Object>} API response envelope { success, data }
   */
  createOperationsAlert: (data) => api.post("/hotel/operations-alerts", data),

  /**
   * Alias for createOperationsAlert
   */
  createAlert: (data) => api.post("/hotel/operations-alerts", data),

  /**
   * Update an existing operations alert (lifecycle transition, urgency escalation, edits).
   * @param {string} id - Alert ObjectId
   * @param {Object} data - Clean backend update payload
   * @returns {Promise<Object>} API response envelope { success, data }
   */
  updateOperationsAlert: (id, data) => api.patch(`/hotel/operations-alerts/${id}`, data),

  /**
   * Alias for updateOperationsAlert
   */
  updateAlert: (id, data) => api.patch(`/hotel/operations-alerts/${id}`, data),

  /**
   * Delete an operations alert (Requires HOTEL_ADMIN role).
   * @param {string} id - Alert ObjectId
   * @returns {Promise<Object>} API response envelope { success, data: null }
   */
  deleteOperationsAlert: (id) => api.delete(`/hotel/operations-alerts/${id}`),

  /**
   * Alias for deleteOperationsAlert
   */
  deleteAlert: (id) => api.delete(`/hotel/operations-alerts/${id}`),
};

export default operationsAlertService;
