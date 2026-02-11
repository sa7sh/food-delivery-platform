import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../../../constants';

export const orderService = {
  // Place order
  async placeOrder(orderData) {
    console.log("[OrderService] placeOrder called with:", JSON.stringify(orderData, null, 2));
    console.log("[OrderService] Sending URL:", API_ENDPOINTS.ORDERS);
    return httpClient.post(API_ENDPOINTS.ORDERS, orderData);
  },

  // Get orders
  async getOrders(params) {
    // params: { page, limit, status }
    return httpClient.get(`${API_ENDPOINTS.ORDERS}/my-orders`, { params });
  },

  // Get order detail
  async getOrderDetail(orderId) {
    // TODO: Replace with actual API call
    const url = API_ENDPOINTS.ORDER_DETAIL.replace(':id', orderId);
    return httpClient.get(url);
  },

  // Cancel order
  async cancelOrder(orderId) {
    // TODO: Replace with actual API call
    return httpClient.post(`${API_ENDPOINTS.ORDERS}/${orderId}/cancel`);
  },

  // Submit Review
  async submitReview(reviewData) {
    try {
      console.log('[OrderService] submitReview called with:', JSON.stringify(reviewData, null, 2));
      const response = await httpClient.post('/reviews', reviewData);
      console.log('[OrderService] submitReview response:', response);
      return response;
    } catch (error) {
      console.error('[OrderService] submitReview error:', error);
      throw error;
    }
  },
};
