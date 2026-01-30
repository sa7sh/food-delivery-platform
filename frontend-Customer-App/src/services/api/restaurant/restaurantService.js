import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../../../constants';

export const restaurantService = {
  // Get all restaurants
  async getRestaurants(params) {
    // Fetch all restaurants from backend
    // Base URL already includes /api, so just use /public/restaurants
    return httpClient.get('/public/restaurants', { params });
  },

  // Get restaurant detail
  async getRestaurantDetail(restaurantId) {
    // TODO: Replace with actual API call
    const url = API_ENDPOINTS.RESTAURANT_DETAIL.replace(':id', restaurantId);
    return httpClient.get(url);
  },

  // Get restaurant menu
  async getRestaurantMenu(restaurantId) {
    // TODO: Replace with actual API call
    return httpClient.get(`/restaurants/${restaurantId}/menu`);
  },
};