import api from './api';

export const buyService = {
  getProducts: ({ category = 'mobile', brand } = {}) => {
    const params = new URLSearchParams({ category });
    if (brand) params.set('brand', brand);
    return api.get(`/buy/products?${params.toString()}`);
  },
  getProduct: (slug) => api.get(`/buy/products/${encodeURIComponent(slug)}`),
  placeOrder: (payload) => api.post('/buy/orders', payload),
  getMyOrders: () => api.get('/buy/orders'),
  getOrder: (orderId) => api.get(`/buy/orders/${encodeURIComponent(orderId)}`),
};
