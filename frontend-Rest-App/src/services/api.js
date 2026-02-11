import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import ENV from '../config/environment.js';
import { MOCK_DATA } from '../constants/mockData.js';

// Create Axios instance
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HttpOnly Cookies
});

// Request Interceptor - Add token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // WEB: Browser automatically sends Cookie. No header needed.
      // MOBILE: We must manually attach the token from SecureStore.
      if (Platform.OS !== 'web') {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error reading token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('authToken');
      }
      await AsyncStorage.removeItem('restaurantData'); // Non-sensitive data can stay in AsyncStorage
      // Navigation will be handled by AuthContext
    }
    return Promise.reject(error);
  }
);

// Helper function to use mock data or real API
const useMockOrReal = (mockData, apiCall) => {
  if (ENV.USE_MOCK_DATA) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ data: mockData }), 500); // Simulate network delay
    });
  }
  return apiCall();
};

// ============================================
// AUTH APIs
// ============================================

export const loginRestaurant = async (email, password) => {
  return apiClient.post('/auth/login', { email, password });
};

export const registerRestaurant = async (email, password, phone) => {
  return apiClient.post('/auth/register', {
    email,
    password,
    phone,
    role: 'restaurant',
  });
};



export const logoutRestaurant = async () => {
  // Clear local storage
  await AsyncStorage.removeItem('authToken');
  await AsyncStorage.removeItem('restaurantData');
  return { success: true };
};

// ============================================
// RESTAURANT PROFILE APIs
// ============================================

export const getRestaurantProfile = async () => {
  /* 
    BACKEND INTEGRATION POINT
    Expected Response: { 
      _id, name, email, phone, address, cuisineType, isOpen, createdAt 
    }
  */
  // 🔵 REAL API CALL
  return apiClient.get('/restaurant/profile');
};

// Helper to Create FormData
const createFormData = (data, imageFields = []) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (imageFields.includes(key) && data[key]) {
      // Append Image File
      const uri = data[key];
      // Check if it's already a remote URL, if so, send as text (optional, backend handles this check? 
      // Actually backend expects file in req.file or url in req.body.
      // If it's a file URI (file:// or content://), append as file.
      // If http/https, append as text string.
      if (uri.startsWith('http')) {
        formData.append(key, uri);
      } else {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append(key, { uri, name: filename, type }); // React Native FormData format
      }
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

export const updateRestaurantProfile = async (profileData) => {
  /* 
    Updated to use FormData for File Uploads
  */
  const formData = createFormData(profileData, ['profileImage', 'restaurantImage']);

  return apiClient.put('/restaurant/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getRestaurantStats = async () => {
  // ... (unchanged)
  return apiClient.get('/restaurant/stats');
};

export const deleteRestaurantAccount = async () => {
  // ... (unchanged)
  return apiClient.delete('/restaurant/profile');
};

// ============================================
// FOOD ITEM APIs
// ============================================

export const getFoodItems = async () => {
  return apiClient.get('/foods/my-foods');
};

export const addFoodItem = async (foodData) => {
  /* 
    Updated to use FormData
  */
  // Ensure image is passed as 'image' field for backend upload.single('image')
  // But foodData has 'imageUrl'. We need to map it.
  const payload = { ...foodData };
  if (payload.imageUrl) {
    payload.image = payload.imageUrl;
    delete payload.imageUrl; // Remove duplicated key if you want, or keep it.
  }

  const formData = createFormData(payload, ['image']);

  return apiClient.post('/foods', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateFoodItem = async (foodId, foodData) => {
  /* 
    Updated to use FormData
  */
  const payload = { ...foodData };
  if (payload.imageUrl) {
    payload.image = payload.imageUrl;
    delete payload.imageUrl;
  }

  const formData = createFormData(payload, ['image']);

  return apiClient.put(`/foods/${foodId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteFoodItem = async (foodId) => {
  return apiClient.delete(`/foods/${foodId}`);
};

export const toggleFoodAvailability = async (foodId, isAvailable) => {
  return useMockOrReal(
    { _id: foodId, isAvailable },
    () => apiClient.patch(`/foods/${foodId}/availability`, { isAvailable })
  );
};

// ============================================
// ORDER APIs
// ============================================

export const getOrders = async (status = null) => {
  /*
    BACKEND INTEGRATION POINT
    Expected Response: [{ _id, customerId, restaurantId, items, status, totalAmount, createdAt, ... }]
  */
  const params = status ? { status } : {};
  return apiClient.get('/orders/restaurant', { params });
};

export const getOrderById = async (orderId) => {
  /*
    BACKEND INTEGRATION POINT
    Expected Response: { _id, customerId, restaurantId, items, status, totalAmount, createdAt, ... }
  */
  return apiClient.get(`/orders/${orderId}`);
};

export const updateOrderStatus = async (orderId, status) => {
  /*
    BACKEND INTEGRATION POINT
    Expected Request: PATCH /orders/:id/status
    Expected Response: { _id, status, ... }
  */
  return apiClient.patch(`/orders/${orderId}/status`, { status });
};

// ============================================
// IMAGE UPLOAD (Refactored)
// ============================================

export const uploadFoodImage = async (imageUri) => {
  /* 
    Pre-process image (Compress) AND Return URI for FormData
    We NO LONGER return Base64 dataURL.
    We return the URI of the compressed file.
  */

  try {
    // Check if it's already a remote URL (http/https)
    if (imageUri.startsWith('http')) {
      return { data: { imageUrl: imageUri } }; // Just return it, addFoodItem will handle it
    }

    console.log('Compressing image:', imageUri);

    // Compress using Expo ImageManipulator
    // Resize to width 800 (height auto-scaled), compress to 0.7 quality
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // base64: true REMOVED
    );

    console.log(`Image compressed. URI: ${result.uri}`);

    // Return the URI wrapped in an object structure that your UI expects 
    // (Your UI likely expects { data: { imageUrl: ... } } from previous logic?
    // Actually, looking at previous code, it returned dataUrl.
    // If we want to be compatible with how the UI calls this *before* calling addFoodItem:
    // The UI likely takes the result and puts it into state. 
    // We should return the URI.
    return { data: { imageUrl: result.uri } };
  } catch (error) {
    console.error('Image compression error:', error);
    return { data: { imageUrl: imageUri } }; // Fallback
  }
};

export const deleteOrder = async (orderId) => {
  /* 
    BACKEND INTEGRATION POINT
    Expected Request: DELETE /orders/:id
    Expected Response: { message: "Order deleted/hidden" }
  */
  return apiClient.delete(`/orders/${orderId}`);
};

// ============================================
// REVIEWS APIs
// ============================================

export const getMyReviews = async (restaurantId) => {
  /*
    BACKEND INTEGRATION POINT
    Expected Response: { reviews: [], stats: { averageRating, totalReviews } }
  */
  return apiClient.get(`/reviews/restaurant/${restaurantId}`);
};

export const getFoodItemReviews = async (restaurantId) => {
  /*
    BACKEND INTEGRATION POINT
    Expected Response: { reviews: [] }
  */
  return apiClient.get(`/reviews/restaurant/${restaurantId}/food-items`);
};

// Send OTP
export const sendOtp = async (email) => {
  return apiClient.post('/auth/send-otp', { email });
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  return apiClient.post('/auth/verify-otp', { email, otp });
};

export default apiClient;
