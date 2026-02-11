import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../../../constants';

export const userService = {
  // Get profile
  async getProfile() {
    // TODO: Replace with actual API call
    return httpClient.get(API_ENDPOINTS.PROFILE);
  },

  // Update profile
  async updateProfile(userData) {
    const { profileImage } = userData;
    // Check if we need to upload an image (is local URI?)
    const isImageUpload = profileImage && !profileImage.startsWith('http');

    if (isImageUpload) {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => {
        if (key === 'profileImage') {
          const uri = userData[key];
          const filename = uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('profileImage', { uri, name: filename, type });
        } else if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      return httpClient.put(API_ENDPOINTS.PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    // Standard JSON update
    return httpClient.put(API_ENDPOINTS.PROFILE, userData);
  },

  // Get addresses
  async getAddresses() {
    // TODO: Replace with actual API call
    return httpClient.get(API_ENDPOINTS.ADDRESSES);
  },

  // Add address
  async addAddress(addressData) {
    // TODO: Replace with actual API call
    return httpClient.post(API_ENDPOINTS.ADDRESSES, addressData);
  },

  // Update address
  async updateAddress(addressId, addressData) {
    // TODO: Replace with actual API call
    return httpClient.patch(`${API_ENDPOINTS.ADDRESSES}/${addressId}`, addressData);
  },

  // Delete address
  async deleteAddress(addressId) {
    // TODO: Replace with actual API call
    return httpClient.delete(`${API_ENDPOINTS.ADDRESSES}/${addressId}`);
  },

  // Get Favorites
  async getFavorites() {
    return httpClient.get('/user/favorites');
  },

  // Toggle Favorite
  async toggleFavorite(restaurantId) {
    return httpClient.post(`/user/favorites/${restaurantId}`);
  },
};