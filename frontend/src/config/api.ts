/**
 * AquaLedger - Standardized Frontend API & Socket Configuration
 * 
 * Provides:
 * 1. Configured Axios client with dynamic base URL, credentials, and JWT auth interceptors.
 * 2. Pre-configured Socket.IO client instance with automatic reconnection and fallback transports.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { io, Socket } from 'socket.io-client';

// ---------------------------------------------------------------------------
// 1. URL Resolution (Development vs. Production Single-Server)
// ---------------------------------------------------------------------------
const isProduction = import.meta.env.PROD;

// In development: defaults to Express server on port 5000
// In production: Express serves React statically, so relative '/api/v1' connects to same origin
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ||
  (isProduction ? '/api/v1' : 'http://localhost:5000/api/v1');

// Socket.IO server endpoint (root or custom origin)
export const SOCKET_URL: string =
  import.meta.env.VITE_SOCKET_URL ||
  (isProduction ? '/' : 'http://localhost:5000');

// ---------------------------------------------------------------------------
// 2. Axios Instance Configuration
// ---------------------------------------------------------------------------
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Inject JWT token into Authorization header if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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

// Response Interceptor: Standardized error logging and session expiry handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[AquaLedger API] Unauthorized 401: Token expired or invalid.');
      // Optional: Clear expired token
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// 3. Socket.IO Client Configuration
// ---------------------------------------------------------------------------
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'], // Prioritize WebSocket, fallback to polling
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
