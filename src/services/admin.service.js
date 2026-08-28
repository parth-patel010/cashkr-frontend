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
  exportUsers: (params) => adminApi.get('/admin/users/export', { params, responseType: 'blob' }),

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
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return adminApi.post('/admin/media/upload-image', formData, {
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
  getRepairTemplates: (params) => adminApi.get('/admin/repair-templates', { params }),
  createRepairTemplate: (data) => adminApi.post('/admin/repair-templates', data),
  updateRepairTemplate: (id, data) => adminApi.put(`/admin/repair-templates/${id}`, data),
  deleteRepairTemplate: (id) => adminApi.delete(`/admin/repair-templates/${id}`),
  applyRepairTemplate: (id, data) => adminApi.post(`/admin/repair-templates/${id}/apply`, data),

  // Partners
  getPartners: (params) => adminApi.get('/admin/partners', { params }),
  approvePartnerAsVendor: (id) => adminApi.post(`/admin/partners/${id}/approve-vendor`),

  // Vendors
  getVendors: (params) => adminApi.get('/admin/vendors', { params }),
  getVendor: (id, params) => adminApi.get(`/admin/vendors/${id}`, { params }),
  createVendor: (data) => adminApi.post('/admin/vendors', data),
  updateVendor: (id, data) => adminApi.put(`/admin/vendors/${id}`, data),
  adjustVendorWallet: (id, data) => adminApi.post(`/admin/vendors/${id}/adjust-wallet`, data),
  assignOrderVendor: (orderId, vendorId) =>
    adminApi.patch(`/admin/orders/${orderId}/assign-vendor`, { vendorId }),

  getAppSettings: () => adminApi.get('/admin/app-settings'),
  saveAppSettings: (data) => adminApi.put('/admin/app-settings', data),

  // Offers
  getOffers: () => adminApi.get('/admin/offers'),
  createOffer: (data) => adminApi.post('/admin/offers', data),
  updateOffer: (id, data) => adminApi.put(`/admin/offers/${id}`, data),
  deleteOffer: (id) => adminApi.delete(`/admin/offers/${id}`),

  // Category quizzes
  getCategoryQuizzes: () => adminApi.get('/admin/category-quizzes'),
  getCategoryQuiz: (id) => adminApi.get(`/admin/category-quizzes/${id}`),
  createCategoryQuiz: (data) => adminApi.post('/admin/category-quizzes', data),
  updateCategoryQuiz: (id, data) => adminApi.put(`/admin/category-quizzes/${id}`, data),
  deleteCategoryQuiz: (id) => adminApi.delete(`/admin/category-quizzes/${id}`),

  // Notifications
  getNotifications: (params) => adminApi.get('/admin/notifications', { params }),
  sendNotification: (data) => adminApi.post('/admin/notifications/send', data),

  // Security
  getSecurityAudit: () => adminApi.get('/admin/security-audit'),

  // Orders
  getOrders: (params) => adminApi.get('/admin/orders', { params }),
  exportOrders: (params) => adminApi.get('/admin/orders/export', { params, responseType: 'blob' }),
  updateOrderStatus: (id, status) => adminApi.patch(`/admin/orders/${id}/status`, { status }),
  laterAdjustOrder: (id, data) => adminApi.patch(`/admin/orders/${id}/later-adjustment`, data),
  getBuyOrders: (params) => adminApi.get('/admin/buy-orders', { params }),
  updateBuyOrderStatus: (id, status) => adminApi.patch(`/admin/buy-orders/${id}/status`, { status }),
  getRepairOrders: (params) => adminApi.get('/admin/repair-orders', { params }),
  updateRepairOrderStatus: (id, status) => adminApi.patch(`/admin/repair-orders/${id}/status`, { status }),

  // Leads (TV / Fridge / Repair forms)
  getLeads: (params) => adminApi.get('/admin/leads', { params }),
  updateLeadStatus: (id, status) => adminApi.patch(`/admin/leads/${id}/status`, { status }),

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

  // Valuation test (Cashify agent)
  getValuationTestModels: () => adminApi.get('/admin/valuation-test/models'),
  getValuationTestDevices: (params) => adminApi.get('/admin/valuation-test/devices', { params }),
  valuationCashifyStatus: () => adminApi.get('/admin/valuation-test/cashify/status'),
  valuationVerifyCashifySession: () => adminApi.post('/admin/valuation-test/cashify/verify-session'),
  valuationRequestOtp: (data) => adminApi.post('/admin/valuation-test/cashify/request-otp', data),
  valuationVerifyOtp: (data) => adminApi.post('/admin/valuation-test/cashify/verify-otp', data),
  valuationCashifyLogout: () => adminApi.post('/admin/valuation-test/cashify/logout'),
  runValuationTestQuote: (data) => adminApi.post('/admin/valuation-test/quote', data),
  getValuationLastRun: () => adminApi.get('/admin/valuation-test/last-run'),
  downloadValuationLastRun: () => adminApi.get('/admin/valuation-test/last-run/download', { responseType: 'blob' }),

  // Pricing agent (Cashify batch)
  getPricingAgentStats: () => adminApi.get('/admin/pricing-agent/stats'),
  getPricingAgentRecords: (params) => adminApi.get('/admin/pricing-agent/records', { params }),
  syncPricingAgent: () => adminApi.post('/admin/pricing-agent/sync'),
  runAllPricingAgent: () => adminApi.post('/admin/pricing-agent/run-all'),
  downloadPricingAgent: (format) => adminApi.get('/admin/pricing-agent/export', {
    params: { format },
    responseType: 'blob',
  }),
};

export default adminApi;
