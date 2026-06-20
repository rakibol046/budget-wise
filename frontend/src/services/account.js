import api from './api.js';

export const getAccounts = () => api.get('/accounts');
export const createAccount = (data) => api.post('/accounts', data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);
export const adjustBalance = (id, data) => api.post(`/accounts/${id}/adjust`, data);
