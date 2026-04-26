import ENV from '../config/environment';
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import {
  loginRestaurant,
  logoutRestaurant,
  registerRestaurant,
  deleteRestaurantAccount,
  getRestaurantProfile, // Validate session via API
  sendOtp,
  verifyOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from '../services/api';


// Create Auth Context
// Context for managing authentication state
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false); // Changed default to false for general requests
  const [isInitialLoading, setIsInitialLoading] = useState(true); // New state for splash screen
  const [error, setError] = useState(null);

  // Check if user is already logged in (on app startup)
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsInitialLoading(true);

      // Create a timeout promise that rejects after 5 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timed out')), 5000)
      );

      // Race the API call against the timeout
      const response = await Promise.race([
        getRestaurantProfile(),
        timeoutPromise
      ]);

      if (response && response.data) {
        setIsAuthenticated(true);
        setRestaurant(response.data);

        // Update local cache of user data
        await AsyncStorage.setItem('restaurantData', JSON.stringify(response.data));
      } else {
        throw new Error("No session");
      }

    } catch (err) {
      console.log('Auth check failed:', err.message);
      setIsAuthenticated(false);
      setRestaurant(null);

      // Clear legacy storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('restaurantData');
    } finally {
      // Ensure specific delay to prevent flicker, then stop loading
      setIsInitialLoading(false);
    }
  };

  // Login Function
  const login = async (email, password) => {
    console.log("USE_MOCK_DATA =", ENV.USE_MOCK_DATA);

    try {
      setLoading(true);
      setError(null);

      // ✅ DEMO LOGIN (TEMPORARY – REMOVE LATER)
      if (ENV.USE_MOCK_DATA) {

        const demoRestaurant = {
          id: 'demo-1',
          name: 'Demo Restaurant',
          email: email,
        };

        await AsyncStorage.setItem('authToken', 'demo-token');
        await AsyncStorage.setItem(
          'restaurantData',
          JSON.stringify(demoRestaurant)
        );

        setIsAuthenticated(true);
        setRestaurant(demoRestaurant);

        return { success: true };
      }

      // 🔵 REAL API LOGIN (future)
      const response = await loginRestaurant(email, password);
      // Backend returns { token, user } + Sets HttpOnly Cookie
      const { token, user: restaurantData } = response.data;


      // WEB: Do NOT store token (Cookie handles it)
      // MOBILE: Store token in SecureStore
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('authToken', token);
      } else {
        // Just for safety, ensure we don't have a stale token in AsyncStorage
        await AsyncStorage.removeItem('authToken');
      }

      // Store non-sensitive user data for UI
      await AsyncStorage.setItem(
        'restaurantData',
        JSON.stringify(restaurantData)
      );

      setIsAuthenticated(true);
      setRestaurant(restaurantData);

      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };


  // Logout Function
  const logout = async () => {
    try {
      setLoading(true);
      // Call backend to revoke token (and clear cookie)
      await logoutRestaurant();

      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('authToken');
      }
      await AsyncStorage.removeItem('restaurantData');

      setIsAuthenticated(false);
      setRestaurant(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback cleanup
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('authToken');
      }
      await AsyncStorage.removeItem('restaurantData');

      setIsAuthenticated(false);
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, phone }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await registerRestaurant(name, email, password, phone);

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  };


  // Update Restaurant Profile in Context
  const updateRestaurantData = async (updatedData) => {
    try {
      const updatedRestaurant = { ...restaurant, ...updatedData };
      await AsyncStorage.setItem('restaurantData', JSON.stringify(updatedRestaurant));
      setRestaurant(updatedRestaurant);
    } catch (err) {
      console.error('Update restaurant data error:', err);
    }
  };



  const deleteAccount = async () => {
    try {
      setLoading(true);
      await deleteRestaurantAccount();
      // After successful deletion from backend, clear local state similar to logout
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('restaurantData');
      setIsAuthenticated(false);
      setRestaurant(null);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Delete account error:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const sendOTP = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await sendOtp(email); // From api.js
      return { success: true };
    } catch (err) {
      console.error('Send OTP error:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Login
  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);

      const response = await verifyOtp(email, otp); // From api.js
      const { token, user: restaurantData } = response.data;

      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('authToken', token);
      } else {
        await AsyncStorage.removeItem('authToken');
      }

      await AsyncStorage.setItem('restaurantData', JSON.stringify(restaurantData));
      setIsAuthenticated(true);
      setRestaurant(restaurantData);

      return { success: true };
    } catch (err) {
      console.error('Verify OTP error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Flow
  const handleForgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      await forgotPassword(email);
      return { success: true };
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send reset link';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async (email, otp) => {
    try {
      setLoading(true);
      setError(null);
      await verifyResetOtp(email, otp);
      return { success: true };
    } catch (err) {
      console.error('Verify reset OTP error:', err);
      const errorMessage = err.response?.data?.message || 'Invalid OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      await resetPassword(email, password);
      return { success: true };
    } catch (err) {
      console.error('Reset password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    restaurant,
    loading,
    isInitialLoading,
    error,
    login,
    register,
    logout,
    deleteAccount,
    updateRestaurantData,
    sendOTP,
    verifyOTP,
    handleForgotPassword,
    handleVerifyResetOtp,
    handleResetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};