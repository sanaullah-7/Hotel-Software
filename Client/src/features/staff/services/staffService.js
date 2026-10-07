import api from '../../../api/client.js';

export const staffService = {
  getEmployees: (params) => api.get('/hotel/employees', params),
  getEmployeeById: (id) => api.get(`/hotel/employees/${id}`),
  createEmployee: (data) => api.post('/hotel/employees', data),
  updateEmployee: (id, data) => api.put(`/hotel/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/hotel/employees/${id}`),
  getDepartments: (params) => api.get('/hotel/departments', params),

  // Leave Requests API
  getLeaveRequests: (params) => api.get('/hotel/leave-requests', params),
  getLeaveRequestById: (id) => api.get(`/hotel/leave-requests/${id}`),
  createLeaveRequest: (data) => api.post('/hotel/leave-requests', data),
  updateLeaveRequest: (id, data) => api.put(`/hotel/leave-requests/${id}`, data),
  deleteLeaveRequest: (id) => api.delete(`/hotel/leave-requests/${id}`),

  // Attendance API
  getAttendance: (params) => api.get('/hotel/attendance', params),
  getAttendanceById: (id) => api.get(`/hotel/attendance/${id}`),
  createAttendance: (data) => api.post('/hotel/attendance', data),
  updateAttendance: (id, data) => api.put(`/hotel/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/hotel/attendance/${id}`),
};

export default staffService;
