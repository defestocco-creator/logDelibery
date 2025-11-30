import axios from 'axios';
import { AuthResponse, MetricsResponse, OrdersResponse } from '../types';

const BASE_URL = 'https://apidelibery.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('delibery_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', { email, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('delibery_token');
    localStorage.removeItem('delibery_user_email');
  }
};

export const dataService = {
  getMetrics: async (): Promise<MetricsResponse> => {
    const response = await api.get<MetricsResponse>('/metricas');
    return response.data;
  },
  getOrders: async (): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>('/pedidos');
    return response.data;
  },
  // Used to generate traffic for the test environment
  simulateGetOrders: async () => {
    return api.get('/pedidos');
  }
};

export default api;
