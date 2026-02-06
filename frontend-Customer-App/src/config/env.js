import Constants from 'expo-constants';

export const ENV = {
  API_BASE_URL: __DEV__ ? 'http://192.168.29.228:5000/api' : (process.env.API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl || ''),
  API_TIMEOUT: Number(process.env.API_TIMEOUT) || 30000,
  isDevelopment: __DEV__,
};