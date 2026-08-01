import api from './api';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const buyService = {
  getProducts: ({ category = 'mobile', brand } = {}) => {
    const params = new URLSearchParams({ category });
    if (brand) params.set('brand', brand);
    return api.get(`/buy/products?${params.toString()}`);
  },
  getProduct: (slug) => api.get(`/buy/products/${encodeURIComponent(slug)}`),
  placeOrder: (payload) => api.post('/buy/orders', payload),
  createRazorpayOrder: (payload) => api.post('/buy/orders/create-razorpay', payload),
  verifyPayment: (payload) => api.post('/buy/orders/verify-payment', payload),
  getMyOrders: () => api.get('/buy/orders'),
  getOrder: (orderId) => api.get(`/buy/orders/${encodeURIComponent(orderId)}`),
  loadRazorpayScript,
};
