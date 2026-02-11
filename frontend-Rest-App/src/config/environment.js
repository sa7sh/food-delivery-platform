// Environment Configuration
// TODO: Replace with actual backend URL when ready
const ENV = {
  development: {
    API_BASE_URL: 'http://192.168.29.228:5000/api', // Change to your backend URL
    SOCKET_URL: 'http://192.168.29.228:5000',
    USE_MOCK_DATA: false, // Set to false when backend is ready
  },
  production: {
    API_BASE_URL: 'https://your-production-api.com/api',
    SOCKET_URL: 'https://your-production-api.com',
    USE_MOCK_DATA: false,
  },
};

const getEnvVars = () => {
  // Default to development
  return __DEV__ ? ENV.development : ENV.production;
};

export default getEnvVars();