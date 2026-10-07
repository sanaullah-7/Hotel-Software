import api from "../api/client.js";

/**
 * Frontend Complaint Service
 * Communicates with the backend /api/v1/hotel/complaints endpoints.
 */
export const complaintService = {
  /**
   * List complaints with optional query filters and pagination.
   * @param {Object} [params={}] - Filter parameters (page, limit, status, severity, category, guest_id, room_id, search, etc.)
   * @returns {Promise<Object>} API response envelope { success, data, meta }
   */
  getComplaints: (params = {}) => api.get("/hotel/complaints", params),

  /**
   * Retrieve a single complaint by ID.
   * @param {string} id - Complaint MongoDB ObjectId
   * @returns {Promise<Object>} API response envelope { success, data }
   */
  getComplaintById: (id) => api.get(`/hotel/complaints/${id}`),

  /**
   * Create a new complaint.
   * @param {Object} data - Clean backend payload
   * @returns {Promise<Object>} API response envelope { success, data }
   */
  createComplaint: (data) => api.post("/hotel/complaints", data),

  /**
   * Update an existing complaint.
   * @param {string} id - Complaint MongoDB ObjectId
   * @param {Object} data - Clean backend update payload
   * @returns {Promise<Object>} API response envelope { success, data }
   */
  updateComplaint: (id, data) => api.patch(`/hotel/complaints/${id}`, data),

  /**
   * Delete a complaint (Requires Admin privileges).
   * @param {string} id - Complaint MongoDB ObjectId
   * @returns {Promise<Object>} API response envelope { success, data }
   */
  deleteComplaint: (id) => api.delete(`/hotel/complaints/${id}`),
};

export default complaintService;
