import api from "../api/client.js";

export const opsService = {
  // Housekeeping
  getHousekeepingTasks: (params) => api.get("/hotel/housekeeping/tasks", params),
  createHousekeepingTask: (data) => api.post("/hotel/housekeeping/tasks", data),
  updateHousekeepingTask: (id, data) => api.put(`/hotel/housekeeping/tasks/${id}`, data),

  // Maintenance
  getMaintenanceTickets: (params) => api.get("/hotel/maintenance/tickets", params),
  createMaintenanceTicket: (data) => api.post("/hotel/maintenance/tickets", data),
  updateMaintenanceTicket: (id, data) => api.put(`/hotel/maintenance/tickets/${id}`, data),
};

export default opsService;
