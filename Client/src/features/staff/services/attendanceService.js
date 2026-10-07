import api from '../../../api/client.js';

export const attendanceService = {
  getAttendance: (params) => api.get('/hotel/attendance', params),
  getAttendanceById: (id) => api.get(`/hotel/attendance/${id}`),
  createAttendance: (data) => api.post('/hotel/attendance', data),
  updateAttendance: (id, data) => api.put(`/hotel/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/hotel/attendance/${id}`),
};

export default attendanceService;
