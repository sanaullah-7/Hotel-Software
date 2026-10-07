import api from "../api/client.js";

/**
 * Service for managing hotel configuration (Profile and Policies).
 * Connects directly to backend endpoints /api/v1/hotel/profile and /api/v1/hotel/policies.
 */
export const hotelConfigService = {
  /**
   * Fetches the singleton Hotel Profile for the current authenticated tenant.
   * @returns {Promise<Object>} API response containing hotel profile document.
   */
  getProfile: async () => {
    return api.get("/hotel/profile");
  },

  /**
   * Updates the singleton Hotel Profile for the current authenticated tenant.
   * @param {Object} payload Partial or full hotel profile data conforming to updateProfileSchema.
   * @returns {Promise<Object>} API response containing updated hotel profile document.
   */
  updateProfile: async (payload) => {
    return api.put("/hotel/profile", payload);
  },

  /**
   * Fetches the singleton Hotel Policies for the current authenticated tenant.
   * @returns {Promise<Object>} API response containing hotel policies document.
   */
  getPolicies: async () => {
    return api.get("/hotel/policies");
  },

  /**
   * Updates the singleton Hotel Policies for the current authenticated tenant.
   * @param {Object} payload Partial or full hotel policies data conforming to updatePoliciesSchema.
   * @returns {Promise<Object>} API response containing updated hotel policies document.
   */
  updatePolicies: async (payload) => {
    return api.put("/hotel/policies", payload);
  },
};

export default hotelConfigService;
