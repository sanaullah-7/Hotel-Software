import api from "../api/client.js";

export const stayService = {
  checkIn: (data) => api.post("/hotel/stays/check-in", data),
  checkOut: (stayId, data = {}) => api.post(`/hotel/stays/${stayId}/check-out`, data),
  getStays: (params) => api.get("/hotel/stays", params),
  getStayById: (id) => api.get(`/hotel/stays/${id}`),
};

export default stayService;
