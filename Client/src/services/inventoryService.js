import api from "../api/client.js";

export const inventoryService = {
  // Inventory Items CRUD & Stock
  getInventoryItems: (params) => api.get("/hotel/inventory", params),
  getInventoryItem: (id) => api.get(`/hotel/inventory/${id}`),
  createInventoryItem: (data) => api.post("/hotel/inventory", data),
  updateInventoryItem: (id, data) => api.patch(`/hotel/inventory/${id}`, data),
  deactivateInventoryItem: (id) => api.delete(`/hotel/inventory/${id}`),

  // Stock Mutation & Movement Ledger
  adjustStock: (id, data) => api.post(`/hotel/inventory/${id}/adjust`, data),
  getItemMovements: (id, params) => api.get(`/hotel/inventory/${id}/movements`, params),
  getInventoryMovements: (params) => api.get("/hotel/inventory/movements", params),

  // Missing Inventory & Incidents Lifecycle
  getIncidents: (params) => api.get("/hotel/inventory/incidents", params),
  getIncident: (id) => api.get(`/hotel/inventory/incidents/${id}`),
  createIncident: (data) => api.post("/hotel/inventory/incidents", data),
  updateIncident: (id, data) => api.patch(`/hotel/inventory/incidents/${id}`, data),
};

export default inventoryService;
