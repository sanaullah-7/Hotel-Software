import api from "../api/client.js";

export const inspectionService = {
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

export default inspectionService;
