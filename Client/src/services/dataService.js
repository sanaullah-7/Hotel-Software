import api from '../api/client.js';

export const dataService = {
  list: (resource, params) => api.get(`/hotel/data/${resource}`, params),
  get: (resource, id) => api.get(`/hotel/data/${resource}/${id}`),
  create: (resource, data) => api.post(`/hotel/data/${resource}`, data),
  update: (resource, id, data) => api.put(`/hotel/data/${resource}/${id}`, data),
  remove: (resource, id) => api.delete(`/hotel/data/${resource}/${id}`),
};

export const settingsService = {
  getProfile: () => api.get('/hotel/profile'),
  updateProfile: (data) => api.put('/hotel/profile', data),
  getPolicies: () => api.get('/hotel/policies'),
  updatePolicies: (data) => api.put('/hotel/policies', data),
};

export default dataService;

