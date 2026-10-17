import api from "../api/client.js";

export const stayService = {
  checkIn: (data) => api.post("/hotel/stays/check-in", data),
  checkOut: (stayIdOrData, data = {}) => {
    if (typeof stayIdOrData === 'object' && stayIdOrData !== null) {
      const stayId = stayIdOrData.stay_id || stayIdOrData.stayId || stayIdOrData._id || stayIdOrData.id;
      if (stayId && /^[0-9a-fA-F]{24}$/.test(String(stayId).trim())) {
        return api.post(`/hotel/stays/${stayId}/check-out`, stayIdOrData);
      }
      return api.post("/hotel/stays/check-out", stayIdOrData);
    }
    return api.post(`/hotel/stays/${stayIdOrData}/check-out`, data);
  },
  getStays: (params) => api.get("/hotel/stays", params),
  getStayById: (id) => api.get(`/hotel/stays/${id}`),
  transferRoom: (stayId, data) => api.post(`/hotel/stays/${stayId}/transfer-room`, data),
};

export default stayService;
