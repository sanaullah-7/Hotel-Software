import api from "../api/client.js";

/**
 * Service to communicate with Hotel Audit Log backend APIs.
 */
export const auditService = {
  getAuditLogs: (params) => api.get("/hotel/audit-logs", params),
  getAuditMetrics: () => api.get("/hotel/audit-logs/metrics"),
  getAuditLogById: (id) => api.get(`/hotel/audit-logs/${id}`),
  createAuditLog: (data) => api.post("/hotel/audit-logs", data),
};

export default auditService;
