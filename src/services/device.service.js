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
  getPopularSearches: (limit = 5, category = 'mobile') =>
    api.get(`/devices/popular-searches?limit=${limit}&category=${encodeURIComponent(category)}`),
  getTopSellingMobiles: (limit = 5) =>
    api.get(`/devices/top-selling-mobiles?limit=${limit}`),
  /** Fire-and-forget: count a quiz start for ranking "Most Quoted" */
  recordQuiz: (slug) => api.post(`/devices/${encodeURIComponent(slug)}/record-quiz`),
  /** Fire-and-forget: count a search result selection for popular searches */
  recordSearch: (slug) => api.post(`/devices/${encodeURIComponent(slug)}/record-search`),
  getCategoryQuiz: (category) => api.get(`/category-quizzes/${encodeURIComponent(category)}`),
};