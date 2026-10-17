import api from "../api/client.js";

export const dashboardService = {
  getDashboardMetrics: () => api.get("/hotel/dashboard/metrics"),
};

export default dashboardService;
