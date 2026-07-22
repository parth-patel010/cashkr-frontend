import api from './api';

export const repairService = {
  getIssueCatalog: () => api.get('/repair/issues-catalog'),
  getBrands: (category = 'mobile') => api.get('/repair/brands', { params: { category } }),
  getServices: (params = {}) => api.get('/repair/services', { params }),
  getServiceBySlug: (slug) => api.get(`/repair/services/${slug}`),
  getMyOrders: () => api.get('/repair/orders'),
  createOrder: (data) => api.post('/repair/orders', data),
  getOrder: (orderId) => api.get(`/repair/orders/${orderId}`),
};
