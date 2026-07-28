import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendOtp: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp, sessionId, name, quizContext) =>
    api.post('/auth/verify-otp', { phone, otp, sessionId, name, quizContext }),
  reportLastQuiz: (data) => api.post('/users/me/last-quiz', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};
