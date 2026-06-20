import api from './api.js';

export const setBudget = (data) => api.post('/budget/set', data);
export const getBudget = (month) => api.get(`/budget/${month}`);
export const getBudgetInsights = (month) => api.get(`/budget/insights/${month}`);
