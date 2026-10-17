import api from '../../../api/client.js';

export const payrollService = {
  getPayrollRoster: (params) => api.get('/hotel/payroll/roster', params),
  getPayrollRuns: (params) => api.get('/hotel/payroll/runs', params),
  getPayrollRunById: (id) => api.get(`/hotel/payroll/runs/${id}`),
  createPayrollRun: (data) => api.post('/hotel/payroll/runs', data),
  updatePayrollRun: (id, data) => api.put(`/hotel/payroll/runs/${id}`, data),
  deletePayrollRun: (id) => api.delete(`/hotel/payroll/runs/${id}`),
  getPayrollItems: (params) => api.get('/hotel/payroll/items', params),
  getPayrollItemById: (id) => api.get(`/hotel/payroll/items/${id}`),
  createPayrollItem: (runId, data) => api.post(`/hotel/payroll/runs/${runId}/items`, data),
  updatePayrollItem: (id, data) => api.put(`/hotel/payroll/items/${id}`, data),
  deletePayrollItem: (id) => api.delete(`/hotel/payroll/items/${id}`),
  updateEmployeeSalary: (employeeId, salary) =>
    api.put(`/hotel/payroll/employees/${employeeId}/salary`, { salary: Number(salary) }),
};

export default payrollService;
