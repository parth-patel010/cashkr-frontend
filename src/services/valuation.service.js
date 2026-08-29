import api from './api';

export const valuationService = {
  submitLaptopQuote: (payload) => api.post('/valuation/laptop/quote', payload),
  getLaptopStatus: (recordId) => api.get(`/valuation/laptop/status/${recordId}`),
  getAgentStatus: () => api.get('/valuation/laptop/agent-status'),

  submitMobileQuote: (payload) => api.post('/valuation/mobile/quote', payload),
  getMobileStatus: (recordId) => api.get(`/valuation/mobile/status/${recordId}`),
  getMobileAgentStatus: () => api.get('/valuation/mobile/agent-status'),
};
