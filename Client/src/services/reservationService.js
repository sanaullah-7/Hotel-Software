import api from "../api/client.js";

const notifySync = (action) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hotel:data-updated", { detail: { domain: "reservation", action } }));
  }
};

export const reservationService = {
  checkAvailability: (params) => api.get("/hotel/reservations/availability", params),
  getReservations: (params) => api.get("/hotel/reservations", params),
  getReservationById: (id) => api.get(`/hotel/reservations/${id}`),
  createReservation: async (data) => {
    const res = await api.post("/hotel/reservations", data);
    notifySync("create");
    return res;
  },
  updateReservation: async (id, data) => {
    const res = await api.put(`/hotel/reservations/${id}`, data);
    notifySync("update");
    return res;
  },
  reassignRoom: async (id, data) => {
    const res = await api.post(`/hotel/reservations/${id}/reassign-room`, data);
    notifySync("reassignRoom");
    return res;
  },
  cancelReservation: async (id, reason) => {
    const res = await api.post(`/hotel/reservations/${id}/cancel`, { cancellation_reason: reason });
    notifySync("cancel");
    return res;
  },

  // Group Reservations
  getGroupReservations: (params) => api.get("/hotel/reservations/groups", params),
  getGroupReservationById: (id) => api.get(`/hotel/reservations/groups/${id}`),
  createGroupReservation: async (data) => {
    const res = await api.post("/hotel/reservations/groups", data);
    notifySync("createGroup");
    return res;
  },
  updateGroupReservation: async (id, data) => {
    const res = await api.put(`/hotel/reservations/groups/${id}`, data);
    notifySync("updateGroup");
    return res;
  },
  cancelGroupReservation: async (id, reason) => {
    const res = await api.post(`/hotel/reservations/groups/${id}/cancel`, { cancellation_reason: reason });
    notifySync("cancelGroup");
    return res;
  },
  deleteGroupReservation: async (id, reason) => {
    const res = await api.post(`/hotel/reservations/groups/${id}/cancel`, { cancellation_reason: reason });
    notifySync("deleteGroup");
    return res;
  },
};

export default reservationService;
