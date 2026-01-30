import Constants from 'expo-constants';

export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl || '',
  API_TIMEOUT: Number(process.env.API_TIMEOUT) || 30000,
  isDevelopment: __DEV__,
};