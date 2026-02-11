import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../../../constants';

export const cartService = {
  // Get cart
  async getCart() {
    // TODO: Replace with actual API call
    return httpClient.get(API_ENDPOINTS.CART);
  },

  // Add to cart
  async addToCart(item) {
    // item: { foodItemId, quantity, customizations, restaurantId }
    // TODO: Replace with actual API call
    return httpClient.post(API_ENDPOINTS.CART, item);
  },

  // Update cart item
  async updateCartItem(itemId, quantity) {
    // TODO: Replace with actual API call
    return httpClient.patch(`${API_ENDPOINTS.CART}/${itemId}`, { quantity });
  },

  // Remove from cart
  async removeFromCart(itemId) {
    // TODO: Replace with actual API call
    return httpClient.delete(`${API_ENDPOINTS.CART}/${itemId}`);
  },

  // Clear cart
  async clearCart() {
    // TODO: Replace with actual API call
    return httpClient.delete(API_ENDPOINTS.CART);
  },
};