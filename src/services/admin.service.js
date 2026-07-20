import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api';

const adminApi = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin token to every request
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, redirect to admin login (except on the login request itself)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/admin/login');
    if ((error.response?.status === 401 || error.response?.status === 403) && !isLoginRequest) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  // Auth
  login: (credentials) => adminApi.post('/admin/login', credentials),

  // Dashboard
  getStats: () => adminApi.get('/admin/stats'),

  // Users
  getUsers: (params) => adminApi.get('/admin/users', { params }),
  getUserById: (id) => adminApi.get(`/admin/users/${id}`),

  // Devices
  getDevices: (params) => adminApi.get('/admin/devices', { params }),
  getDeviceById: (id) => adminApi.get(`/admin/devices/${id}`),
  createDevice: (data) => adminApi.post('/admin/devices', data),
  updateDevice: (id, data) => adminApi.put(`/admin/devices/${id}`, data),
  deleteDevice: (id) => adminApi.delete(`/admin/devices/${id}`),

  // Brands
  getBrands: (params) => adminApi.get('/admin/brands', { params }),
  getBrandLogos: () => adminApi.get('/admin/brands/logos'),
  getBrandById: (id) => adminApi.get(`/admin/brands/${id}`),
  createBrand: (data) => adminApi.post('/admin/brands', data),
  updateBrand: (id, data) => adminApi.put(`/admin/brands/${id}`, data),
  deleteBrand: (id) => adminApi.delete(`/admin/brands/${id}`),
  uploadBrandLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return adminApi.post('/admin/brands/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return adminApi.post('/admin/media/upload-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Buy inventory products
  getBuyProducts: (params) => adminApi.get('/admin/buy-products', { params }),
  createBuyProduct: (data) => adminApi.post('/admin/buy-products', data),
  updateBuyProduct: (id, data) => adminApi.put(`/admin/buy-products/${id}`, data),
  deleteBuyProduct: (id) => adminApi.delete(`/admin/buy-products/${id}`),
  uploadBuyVideo: (file) => {
    const formData = new FormData();
    formData.append('video', file);
    return adminApi.post('/admin/buy-products/upload-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Repair services
  getRepairServices: (params) => adminApi.get('/admin/repair-services', { params }),
  createRepairService: (data) => adminApi.post('/admin/repair-services', data),
  updateRepairService: (id, data) => adminApi.put(`/admin/repair-services/${id}`, data),
  deleteRepairService: (id) => adminApi.delete(`/admin/repair-services/${id}`),

  // Partners
  getPartners: (params) => adminApi.get('/admin/partners', { params }),
  approvePartnerAsVendor: (id) => adminApi.post(`/admin/partners/${id}/approve-vendor`),

  // Vendors
  getVendors: (params) => adminApi.get('/admin/vendors', { params }),
  getVendor: (id) => adminApi.get(`/admin/vendors/${id}`),
  createVendor: (data) => adminApi.post('/admin/vendors', data),
  updateVendor: (id, data) => adminApi.put(`/admin/vendors/${id}`, data),
  adjustVendorWallet: (id, data) => adminApi.post(`/admin/vendors/${id}/adjust-wallet`, data),
  assignOrderVendor: (orderId, vendorId) =>
    adminApi.patch(`/admin/orders/${orderId}/assign-vendor`, { vendorId }),

  getAppSettings: () => adminApi.get('/admin/app-settings'),
  saveAppSettings: (data) => adminApi.put('/admin/app-settings', data),

  // Orders
  getOrders: (params) => adminApi.get('/admin/orders', { params }),
  exportOrders: (params) => adminApi.get('/admin/orders/export', { params, responseType: 'blob' }),
  updateOrderStatus: (id, status) => adminApi.patch(`/admin/orders/${id}/status`, { status }),
  getBuyOrders: (params) => adminApi.get('/admin/buy-orders', { params }),
  updateBuyOrderStatus: (id, status) => adminApi.patch(`/admin/buy-orders/${id}/status`, { status }),
  getRepairOrders: (params) => adminApi.get('/admin/repair-orders', { params }),
  updateRepairOrderStatus: (id, status) => adminApi.patch(`/admin/repair-orders/${id}/status`, { status }),

  // Live chat
  getChatConversations: (params) => adminApi.get('/admin/chat/conversations', { params }),
  getChatMessages: (id) => adminApi.get(`/admin/chat/conversations/${id}/messages`),
  sendChatMessage: (id, text) => adminApi.post(`/admin/chat/conversations/${id}/messages`, { text }),
  closeChat: (id) => adminApi.patch(`/admin/chat/conversations/${id}/close`),

  // Pincodes
  getPincodes: (params) => adminApi.get('/admin/pincodes', { params }),
  createPincode: (data) => adminApi.post('/admin/pincodes', data),
  updatePincode: (id, data) => adminApi.put(`/admin/pincodes/${id}`, data),
  deletePincode: (id) => adminApi.delete(`/admin/pincodes/${id}`),

  // Analytics
  getAnalytics: (params) => adminApi.get('/admin/analytics', { params }),
  updateMetaSpend: (data) => adminApi.put('/admin/analytics/meta-spend', data),
};

export default adminApi;
