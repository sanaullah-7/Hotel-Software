import api from '../api/client.js';

/**
 * Frontend service for the Quick Search API.
 * Calls GET /api/v1/hotel/quick-search?q=query&limit=5
 */
export const quickSearchService = {
  /**
   * Search rooms, guests, and reservations in the hotel.
   *
   * @param {string} query - Search term (min 2 characters)
   * @param {number} [limit=5] - Bounded limit per entity category
   * @param {object} [options={}] - Additional fetch options (e.g. { signal })
   * @returns {Promise<{ success: boolean, statusCode: number, data: { rooms: Array, guests: Array, reservations: Array } }>}
   */
  quickSearch: (query, limit = 5, options = {}) => {
    return api.get('/hotel/quick-search', { q: query, limit }, options);
  },
};

export default quickSearchService;
