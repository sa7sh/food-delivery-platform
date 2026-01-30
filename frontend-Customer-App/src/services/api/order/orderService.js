import httpClient from '../httpClient';
import { API_ENDPOINTS } from '../../../constants';

export const orderService = {
  // Place order
  async placeOrder(orderData) {
    // orderData: { cartId, addressId, paymentMethod }
    // TODO: Replace with actual API call
    return httpClient.post(API_ENDPOINTS.ORDERS, orderData);
  },

  // Get orders
  async getOrders(params) {
    // params: { page, limit, status }
    // TODO: Replace with actual API call
    return httpClient.get(API_ENDPOINTS.ORDERS, { params });
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
};