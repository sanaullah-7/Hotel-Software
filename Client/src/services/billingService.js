import api from "../api/client.js";

export const billingService = {
  // Folios
  getFolios: (params) => api.get("/hotel/folios", params),
  getFolioById: (id) => api.get(`/hotel/folios/${id}`),
  createFolio: (data) => api.post("/hotel/folios", data),

  // Invoices
  getInvoices: (params) => api.get("/hotel/invoices", params),
  getInvoiceById: (id) => api.get(`/hotel/invoices/${id}`),
  createInvoice: (data) => api.post("/hotel/invoices", data),

  // Payments
  getPayments: (params) => api.get("/hotel/payments", params),
  getPaymentById: (id) => api.get(`/hotel/payments/${id}`),
  createPayment: (data) => api.post("/hotel/payments", data),

  // Refunds
  getRefunds: (params) => api.get("/hotel/refunds", params),
  getRefundById: (id) => api.get(`/hotel/refunds/${id}`),
  createRefund: (data) => api.post("/hotel/refunds", data),

  // Guest Charges
  getGuestCharges: (params) => api.get("/hotel/guest-charges", params),
  getGuestChargeById: (id) => api.get(`/hotel/guest-charges/${id}`),
  createGuestCharge: (data) => api.post("/hotel/guest-charges", data),
  voidGuestCharge: (id) => api.patch(`/hotel/guest-charges/${id}/void`),
};

export default billingService;
