import api from "../api/client.js";

export const guestService = {
  getGuests: (params) => api.get("/hotel/guests", params),
  getGuestById: (id) => api.get(`/hotel/guests/${id}`),
  createGuest: (data) => api.post("/hotel/guests", data),
  updateGuest: (id, data) => api.put(`/hotel/guests/${id}`, data),
  deleteGuest: (id) => api.delete(`/hotel/guests/${id}`),
  getGuestDocuments: (id) => api.get(`/hotel/guests/${id}/documents`),
  createGuestDocument: (id, data) => api.post(`/hotel/guests/${id}/documents`, data),
  deleteGuestDocument: (id, docId) => api.delete(`/hotel/guests/${id}/documents/${docId}`),
  getGuestActivities: (id) => api.get(`/hotel/guests/${id}/activities`),
};

export default guestService;
