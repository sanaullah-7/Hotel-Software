import api from "../api/client.js";

export const restaurantService = {
  // Categories CRUD
  getCategories: (params) => api.get("/hotel/restaurant/categories", params),
  getCategory: (id) => api.get(`/hotel/restaurant/categories/${id}`),
  createCategory: (data) => api.post("/hotel/restaurant/categories", data),
  updateCategory: (id, data) => api.put(`/hotel/restaurant/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/hotel/restaurant/categories/${id}`),

  // Menu Items CRUD
  getMenuItems: (params) => api.get("/hotel/restaurant/menu", params),
  getMenuItem: (id) => api.get(`/hotel/restaurant/menu/${id}`),
  createMenuItem: (data) => api.post("/hotel/restaurant/menu", data),
  updateMenuItem: (id, data) => api.put(`/hotel/restaurant/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/hotel/restaurant/menu/${id}`),

  // Tables CRUD
  getTables: (params) => api.get("/hotel/restaurant/tables", params),
  getTable: (id) => api.get(`/hotel/restaurant/tables/${id}`),
  createTable: (data) => api.post("/hotel/restaurant/tables", data),
  updateTable: (id, data) => api.put(`/hotel/restaurant/tables/${id}`, data),
  deleteTable: (id) => api.delete(`/hotel/restaurant/tables/${id}`),

  // Orders & Lifecycle
  getOrders: (params) => api.get("/hotel/restaurant/orders", params),
  getOrder: (id) => api.get(`/hotel/restaurant/orders/${id}`),
  createOrder: (data) => api.post("/hotel/restaurant/orders", data),
  updateOrderStatus: (id, data) => api.patch(`/hotel/restaurant/orders/${id}/status`, data),
  deleteOrder: (id) => api.delete(`/hotel/restaurant/orders/${id}`),
};

export default restaurantService;
