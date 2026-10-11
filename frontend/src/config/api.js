/**
 * AquaLedger - Standardized Frontend API & Socket Configuration (JavaScript)
 */

import axios from 'axios';
import { io } from 'socket.io-client';

const isProduction = import.meta.env.PROD;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isProduction ? '/api/v1' : 'http://localhost:5000/api/v1');

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (isProduction ? '/' : 'http://localhost:5000');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('aqualedger_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[AquaLedger API] Unauthorized 401: Token expired or invalid.');
    }
    return Promise.reject(error);
  }
);

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on('connect', () => {
  console.log(`[AquaLedger Socket] Connected successfully (ID: ${socket.id})`);
});

socket.on('connect_error', (error) => {
  console.warn('[AquaLedger Socket] Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('[AquaLedger Socket] Disconnected:', reason);
});

export default api;
