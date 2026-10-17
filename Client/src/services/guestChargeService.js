import api from "../api/client.js";

export const guestChargeService = {
  getGuestCharges: (params) => api.get("/hotel/guest-charges", params),
  getGuestChargeById: (id) => api.get(`/hotel/guest-charges/${id}`),
  createGuestCharge: (data) => api.post("/hotel/guest-charges", data),
  voidGuestCharge: (id) => api.patch(`/hotel/guest-charges/${id}/void`),
};

export default guestChargeService;
