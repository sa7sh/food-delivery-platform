import { create } from 'zustand';
import { secureStorage } from '../services/storage';
import { authService } from '../services/api';

export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => set({ token }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // OTP Verification
  verifyOTP: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.verifyOTP(data);

      set({ isLoading: false });
      return { success: true, data: response };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      await authService.forgotPassword({ email });

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Login
  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login(credentials);
      console.log('Login response:', response);

      // Check for success in response (adjust based on actual backend response structure)
      // Assuming backend returns { user, token } or similar inside response
      const { user, token } = response;
      console.log('User data:', user);
      console.log('Token:', token);

      // Save to secure storage only if values exist
      if (token) {
        await secureStorage.saveToken(token);
      }
      if (user) {
        await secureStorage.saveUserData(user);
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Register
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.register(userData);
      console.log('Registration response:', response);

      const { user, token } = response;
      console.log('User data:', user);
      console.log('Token:', token);

      // Save to secure storage only if values exist
      if (token) {
        await secureStorage.saveToken(token);
      }
      if (user) {
        await secureStorage.saveUserData(user);
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    try {
      // Clear secure storage
      await secureStorage.clearAll();

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // Handle Session Expiry (called by interceptors)
  handleSessionExpiry: async () => {
    console.log('Handling session expiry...');
    await secureStorage.clearAll();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: 'Session expired. Please login again.',
    });
  },

  // Initialize auth (check if user is already logged in)
  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      const token = await secureStorage.getToken();
      const user = await secureStorage.getUserData();

      if (token && user) {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // WEB FALLBACK: Check if we have a valid cookie
        // Note: We need to import Platform and userService at the top of the file, or use require here
        // For simplicity/robustness, we'll try to fetch profile if we are in a likely web environment (no token)
        try {
          // Dynamically import Platform to avoid issues if not available (though standard in RN projects)
          const { Platform } = require('react-native');
          if (Platform.OS === 'web') {
            const { userService } = require('../services/api');
            const userProfile = await userService.getProfile();
            if (userProfile) {
              set({
                user: userProfile,
                token: null, // No token string needed on client, cookie handles it
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
        } catch (e) {
          // Cookie invalid or not on web
        }
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      set({ isLoading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));