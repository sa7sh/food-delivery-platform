import axios from 'axios';
import { ENV } from '../../config/env';
import { secureStorage } from '../storage';
import { MESSAGES } from '../../constants';

// Create axios instance
const httpClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies
});

// Request interceptor - Add auth token
httpClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
httpClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - Clear token and redirect to login
        await secureStorage.clearAll();
        // You can emit an event here to trigger navigation to login
        return Promise.reject({
          message: MESSAGES.ERROR.UNAUTHORIZED,
          status,
        });
      }

      return Promise.reject({
        message: data.message || MESSAGES.ERROR.UNKNOWN,
        status,
        data,
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        message: MESSAGES.ERROR.NETWORK,
      });
    } else {
      // Other errors
      return Promise.reject({
        message: error.message || MESSAGES.ERROR.UNKNOWN,
      });
    }
  }
);

export default httpClient;