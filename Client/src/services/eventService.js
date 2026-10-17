import api from "../api/client.js";

/**
 * Service to communicate with Hotel Events and Banquets (BEO) backend APIs.
 */
export const eventService = {
  // EVENTS
  getEvents: (params) => api.get("/hotel/events", params),
  getEventById: (id) => api.get(`/hotel/events/${id}`),
  createEvent: (data) => api.post("/hotel/events", data),
  updateEvent: (id, data) => api.put(`/hotel/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/hotel/events/${id}`),
  bulkDeleteEvents: (ids) => api.post("/hotel/events/bulk-delete", { ids }),
  getEventMetrics: () => api.get("/hotel/events/metrics"),

  // BEOs (BANQUET MANAGER)
  getBeos: (params) => api.get("/hotel/events/beos", params),
  getBeoById: (id) => api.get(`/hotel/events/beos/${id}`),
  createBeo: (data) => api.post("/hotel/events/beos", data),
  updateBeo: (id, data) => api.put(`/hotel/events/beos/${id}`, data),
  deleteBeo: (id) => api.delete(`/hotel/events/beos/${id}`),
  getBeoMetrics: () => api.get("/hotel/events/beos/metrics"),
};

export default eventService;
