import api from './api.js';

export const getCurrencies = () => api.get('/currencies');
