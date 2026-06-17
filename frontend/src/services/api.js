import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pft_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const updateTier = (tier) => API.put('/auth/tier', { tier });
export const createPayment = (plan) => API.post('/payments', { plan });
export const getPayments = () => API.get('/payments');
export const submitPaymentReference = (id, data) => API.post(`/payments/${id}/submit`, data);

// Transaction APIs
export const getTransactions = (params) => API.get('/transactions', { params });
export const addTransaction = (data) => API.post('/transactions', data);
export const updateTransaction = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getReports = () => API.get('/transactions/reports');
export const emitTransactionChange = () => {
  window.dispatchEvent(new CustomEvent('pft:transactions-changed'));
};

export default API;
