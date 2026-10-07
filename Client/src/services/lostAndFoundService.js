import api from "../api/client.js";

export const lostAndFoundService = {
  getItems: (params) => api.get("/hotel/housekeeping/lost-and-found", params),
  getItemById: (id) => api.get(`/hotel/housekeeping/lost-and-found/${id}`),
  createItem: (data) => api.post("/hotel/housekeeping/lost-and-found", data),
  updateItem: (id, data) => api.put(`/hotel/housekeeping/lost-and-found/${id}`, data),
  deleteItem: (id) => api.delete(`/hotel/housekeeping/lost-and-found/${id}`),
};

export default lostAndFoundService;
