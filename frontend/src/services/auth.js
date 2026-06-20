import api from './api.js';

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const verifyEmail = (data) => api.post('/auth/verify-email', data);
export const resendOtp = (data) => api.post('/auth/resend-otp', data);
export const updateProfile = (data) => api.put('/auth/profile', data);
export const updatePassword = (data) => api.put('/auth/password', data);
export const updateSettings = (data) => api.put('/auth/settings', data);
