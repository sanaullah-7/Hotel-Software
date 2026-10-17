import api from "../api/client.js";

/**
 * Service to communicate with Hotel Reports and Expenses backend APIs.
 */
export const reportService = {
  // EXPENSES
  getExpenses: (params) => api.get("/hotel/expenses", params),
  getExpenseSummary: () => api.get("/hotel/expenses/summary"),
  getExpenseById: (id) => api.get(`/hotel/expenses/${id}`),
  createExpense: (data) => api.post("/hotel/expenses", data),
  updateExpense: (id, data) => api.put(`/hotel/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/hotel/expenses/${id}`),
  bulkDeleteExpenses: (ids) => api.post("/hotel/expenses/bulk-delete", { ids }),

  // REPORT AGGREGATIONS
  getRevenueReport: (params) => api.get("/hotel/reports/revenue", params),
  getOccupancyReport: (params) => api.get("/hotel/reports/occupancy", params),
  getExpenseVsRevenueReport: (params) => api.get("/hotel/reports/expense-vs-revenue", params),
  getReportsSummary: () => api.get("/hotel/reports/summary"),
};

export default reportService;
