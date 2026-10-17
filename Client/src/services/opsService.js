import api from "../api/client.js";

export const opsService = {
  // Housekeeping
  getHousekeepingTasks: (params) => api.get("/hotel/housekeeping/tasks", params),
  createHousekeepingTask: (data) => api.post("/hotel/housekeeping/tasks", data),
  updateHousekeepingTask: (id, data) => api.put(`/hotel/housekeeping/tasks/${id}`, data),
  deleteHousekeepingTask: (id) => api.delete(`/hotel/housekeeping/tasks/${id}`),

  // Employees
  getEmployees: (params) => api.get("/hotel/employees", params),
  getEmployeeById: (id) => api.get(`/hotel/employees/${id}`),
  deleteEmployee: (id) => api.delete(`/hotel/employees/${id}`),

  // Maintenance
  getMaintenanceTickets: (params) => api.get("/hotel/maintenance/tickets", params),
  createMaintenanceTicket: (data) => api.post("/hotel/maintenance/tickets", data),
  updateMaintenanceTicket: (id, data) => api.put(`/hotel/maintenance/tickets/${id}`, data),

  // Lost & Found
  getLostAndFoundItems: (params) => api.get("/hotel/housekeeping/lost-and-found", params),
  getLostAndFoundItemById: (id) => api.get(`/hotel/housekeeping/lost-and-found/${id}`),
  createLostAndFoundItem: (data) => api.post("/hotel/housekeeping/lost-and-found", data),
  updateLostAndFoundItem: (id, data) => api.put(`/hotel/housekeeping/lost-and-found/${id}`, data),
  deleteLostAndFoundItem: (id) => api.delete(`/hotel/housekeeping/lost-and-found/${id}`),

  // Inspections
  getInspections: (params) => api.get("/hotel/housekeeping/inspections", params),
  getInspectionById: (id) => api.get(`/hotel/housekeeping/inspections/${id}`),
  createInspection: (data) => api.post("/hotel/housekeeping/inspections", data),
  updateInspection: (id, data) => api.put(`/hotel/housekeeping/inspections/${id}`, data),
  deleteInspection: (id) => api.delete(`/hotel/housekeeping/inspections/${id}`),

  // Checklists
  getChecklists: (params) => api.get("/hotel/housekeeping/checklists", params),
  createChecklist: (data) => api.post("/hotel/housekeeping/checklists", data),
  updateChecklist: (id, data) => api.put(`/hotel/housekeeping/checklists/${id}`, data),
  deleteChecklist: (id) => api.delete(`/hotel/housekeeping/checklists/${id}`),
};

export default opsService;
