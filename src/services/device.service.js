import api from "./api";

export const deviceService = {
  getBrands: (category = 'mobile', offer = 'sell') =>
    api.get(`/devices/brands?category=${category}&offer=${offer}`),
  getModels: (brand, category = 'mobile') =>
    api.get(`/devices/models?brand=${brand}&category=${category}`),
  getDevice: (slug) => api.get(`/devices/${slug}`),
  calculatePrice: (data) => api.post('/devices/calculate-price', data),
  searchDevices: (query, category = 'all') =>
    api.get(`/devices/search?q=${encodeURIComponent(query)}&category=${category}`),
  getMostQuoted: (limit = 8, category = 'all') =>
    api.get(`/devices/most-quoted?limit=${limit}&category=${encodeURIComponent(category)}`),
  /** Fire-and-forget: count a quiz start for ranking "Most Quoted" */
  recordQuiz: (slug) => api.post(`/devices/${encodeURIComponent(slug)}/record-quiz`),
};