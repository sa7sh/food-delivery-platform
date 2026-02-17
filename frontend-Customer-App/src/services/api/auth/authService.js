import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../../../constants';

export const authService = {
  // Login
  async login(credentials) {
    // credentials: { email, password }
    // TODO: Replace with actual API call
    return httpClient.post(API_ENDPOINTS.LOGIN, credentials);
  },

  // Register
  async register(userData) {
    // userData: { name, email, phone, password }
    // TODO: Replace with actual API call
    return httpClient.post(API_ENDPOINTS.REGISTER, userData);
  },

  // Send OTP
  async sendOTP(email) {
    return httpClient.post(API_ENDPOINTS.SEND_OTP, { email });
  },

  // Verify OTP
  async verifyOTP(data) {
    // data: { email, otp }
    return httpClient.post(API_ENDPOINTS.VERIFY_OTP, data);
  },

  // Forgot Password
  async forgotPassword(data) {
    // data: { email }
    // TODO: Replace with actual API call
    return httpClient.post(API_ENDPOINTS.FORGOT_PASSWORD, data);
  },

  // Delete Account
  async deleteAccount() {
    return httpClient.delete(API_ENDPOINTS.DELETE_ACCOUNT);
  },
};