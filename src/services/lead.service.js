import api from './api';

export const leadService = {
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append('photo', file);
    return api.post('/leads/upload-photo', form);
  },
  createLead: (payload) => api.post('/leads', payload),
};
