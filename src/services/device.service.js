import api from "./api";

export const deviceService = {
  getBrands: (category = "mobile") =>
    api.get(`/devices/brands?category=${category}`),
  getModels: (brand, category = "mobile") =>
    api.get(`/devices/models?brand=${brand}&category=${category}`),
  getDevice: (slug) => api.get(`/devices/${slug}`),
  calculatePrice: (data) => api.post("/devices/calculate-price", data),
  searchDevices: (query, category = "all") =>
    api.get(`/devices/search?q=${encodeURIComponent(query)}&category=${category}`),
};