import api from '../api/client';

/**
 * Service to communicate with Hotel Car Parking backend APIs.
 */
export const parkingService = {
  // SPACES
  getSpaces: async () => {
    const res = await api.get('/hotel/parking/spaces');
    return res.data || [];
  },

  createSpace: async (spaceData) => {
    const res = await api.post('/hotel/parking/spaces', spaceData);
    return res.data;
  },

  updateSpaceStatus: async (idOrNumber, status) => {
    const res = await api.patch(`/hotel/parking/spaces/${idOrNumber}/status`, { status });
    return res.data;
  },

  deleteSpace: async (idOrNumber) => {
    const res = await api.delete(`/hotel/parking/spaces/${idOrNumber}`);
    return res.data;
  },

  // METRICS
  getMetrics: async () => {
    const res = await api.get('/hotel/parking/metrics');
    return res.data;
  },

  // RECORDS
  getRecords: async (params = {}) => {
    const res = await api.get('/hotel/parking/records', params);
    return res.data || [];
  },

  getRecordById: async (id) => {
    const res = await api.get(`/hotel/parking/records/${id}`);
    return res.data;
  },

  createRecord: async (recordData) => {
    const res = await api.post('/hotel/parking/records', recordData);
    return res.data;
  },

  updateRecord: async (id, recordData) => {
    const res = await api.patch(`/hotel/parking/records/${id}`, recordData);
    return res.data;
  },

  checkoutRecord: async (id, checkoutData = {}) => {
    const res = await api.post(`/hotel/parking/records/${id}/checkout`, checkoutData);
    return res.data;
  },

  deleteRecord: async (id) => {
    const res = await api.delete(`/hotel/parking/records/${id}`);
    return res.data;
  },
};

export default parkingService;
