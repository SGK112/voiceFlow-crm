import api from './api';

export const invoiceApi = {
  // Get all invoices/estimates
  getInvoices: (params) => api.get('/invoices', { params }),

  // Get invoice statistics
  getStats: () => api.get('/invoices/stats'),

  // Get single invoice
  getInvoice: (id) => api.get(`/invoices/${id}`),

  // Create invoice/estimate
  createInvoice: (data) => api.post('/invoices', data),

  // Update invoice/estimate
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),

  // Delete invoice/estimate
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),

  // Send invoice
  sendInvoice: (id) => api.post(`/invoices/${id}/send`),

  // Record payment
  recordPayment: (id, data) => api.post(`/invoices/${id}/payment`, data),

  // Accept estimate
  acceptEstimate: (id) => api.post(`/invoices/${id}/accept`),

  // Decline estimate
  declineEstimate: (id) => api.post(`/invoices/${id}/decline`),

  // Convert estimate to invoice
  convertToInvoice: (id) => api.post(`/invoices/${id}/convert`),

  // Duplicate invoice/estimate
  duplicateInvoice: (id) => api.post(`/invoices/${id}/duplicate`)
};

export const extensionApi = {
  // Get marketplace extensions
  getMarketplace: (params) => api.get('/extensions/marketplace', { params }),

  // Get categories
  getCategories: () => api.get('/extensions/categories'),

  // Get extension details
  getExtension: (slug) => api.get(`/extensions/marketplace/${slug}`),

  // Get installed extensions
  getInstalled: () => api.get('/extensions/installed'),

  // Install extension
  install: (extensionId) => api.post(`/extensions/${extensionId}/install`),

  // Configure extension
  configure: (extensionId, data) => api.post(`/extensions/${extensionId}/configure`, data),

  // Update settings
  updateSettings: (extensionId, data) => api.put(`/extensions/${extensionId}/settings`, data),

  // Activate extension
  activate: (extensionId) => api.post(`/extensions/${extensionId}/activate`),

  // Deactivate extension
  deactivate: (extensionId) => api.post(`/extensions/${extensionId}/deactivate`),

  // Uninstall extension
  uninstall: (extensionId) => api.delete(`/extensions/${extensionId}`),

  // Trigger sync
  sync: (extensionId) => api.post(`/extensions/${extensionId}/sync`)
};
