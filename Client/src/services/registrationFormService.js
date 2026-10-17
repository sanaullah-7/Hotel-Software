import api from '../api/client.js';

export const registrationFormService = {
  getRegistrationForms: (params) => api.get('/hotel/registration-forms', params),
  getRegistrationFormById: (id) => api.get(`/hotel/registration-forms/${id}`),
  createRegistrationForm: (data) => api.post('/hotel/registration-forms', data),
  deleteRegistrationForm: (id) => api.delete(`/hotel/registration-forms/${id}`),
};

export default registrationFormService;
