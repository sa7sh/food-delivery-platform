import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

export const secureStorage = {
  // Save token
  async saveToken(token) {
    try {
      if (!token) {
        console.warn('Attempted to save null/undefined token');
        return false;
      }
      // WEB: Do not store token in localStorage (XSS risk). Rely on HttpOnly Cookie.
      if (Platform.OS === 'web') {
        return true;
      }
      await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      console.error('Error saving token:', error);
      return false;
    }
  },

  // Get token
  async getToken() {
    try {
      return await SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Remove token
  async removeToken() {
    try {
      await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
      return true;
    } catch (error) {
      console.error('Error removing token:', error);
      return false;
    }
  },

  // Save user data
  async saveUserData(userData) {
    try {
      if (!userData) {
        console.warn('Attempted to save null/undefined user data');
        return false;
      }
      await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  },

  // Get user data
  async getUserData() {
    try {
      const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Clear all
  async clearAll() {
    try {
      await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
};