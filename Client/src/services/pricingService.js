import api from '../api/client.js';

export const pricingService = {
  // Rate Plans
  getRatePlans: (params) => api.get('/hotel/pricing/rate-plans', params),
  createRatePlan: (data) => api.post('/hotel/pricing/rate-plans', data),
  updateRatePlan: (id, data) => api.put(`/hotel/pricing/rate-plans/${id}`, data),
  deleteRatePlan: (id) => api.delete(`/hotel/pricing/rate-plans/${id}`),
  toggleRatePlanStatus: (id) => api.patch(`/hotel/pricing/rate-plans/${id}/status`),

  // Discounts
  getDiscounts: (params) => api.get('/hotel/pricing/discounts', params),
  createDiscount: (data) => api.post('/hotel/pricing/discounts', data),
  updateDiscount: (id, data) => api.put(`/hotel/pricing/discounts/${id}`, data),
  deleteDiscount: (id) => api.delete(`/hotel/pricing/discounts/${id}`),
  toggleDiscountStatus: (id) => api.patch(`/hotel/pricing/discounts/${id}/status`),

  // Taxes
  getTaxes: (params) => api.get('/hotel/pricing/taxes', params),
  createTax: (data) => api.post('/hotel/pricing/taxes', data),
  updateTax: (id, data) => api.put(`/hotel/pricing/taxes/${id}`, data),
  deleteTax: (id) => api.delete(`/hotel/pricing/taxes/${id}`),
  toggleTaxStatus: (id) => api.patch(`/hotel/pricing/taxes/${id}/status`),

  // Fees
  getFees: (params) => api.get('/hotel/pricing/fees', params),
  createFee: (data) => api.post('/hotel/pricing/fees', data),
  updateFee: (id, data) => api.put(`/hotel/pricing/fees/${id}`, data),
  deleteFee: (id) => api.delete(`/hotel/pricing/fees/${id}`),
  toggleFeeStatus: (id) => api.patch(`/hotel/pricing/fees/${id}/status`),
};

export default pricingService;
