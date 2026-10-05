import api from "../api/client.js";

export const reservationService = {
  checkAvailability: (params) => api.get("/hotel/reservations/availability", params),
  getReservations: (params) => api.get("/hotel/reservations", params),
  getReservationById: (id) => api.get(`/hotel/reservations/${id}`),
  createReservation: (data) => api.post("/hotel/reservations", data),
  updateReservation: (id, data) => api.put(`/hotel/reservations/${id}`, data),
  cancelReservation: (id, reason) => api.post(`/hotel/reservations/${id}/cancel`, { cancellation_reason: reason }),
};

export default reservationService;
