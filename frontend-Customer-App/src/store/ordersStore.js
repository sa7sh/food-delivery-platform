import { create } from 'zustand';
import { orderService } from '../services/api';
import { ORDER_STATUS } from '../constants';

export const useOrdersStore = create((set, get) => ({
  // State
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setCurrentOrder: (order) => set({ currentOrder: order }),

  // Fetch orders
  fetchOrders: async (params = {}) => {
    try {
      set({ isLoading: true, error: null });

      const response = await orderService.getOrders(params);

      // httpClient interceptor already returns response.data, so response IS the data
      const rawOrders = Array.isArray(response) ? response : (response?.orders || []);

      const orders = rawOrders.map(o => ({
        ...o,
        id: o._id, // Map _id to id
        total: o.totalAmount, // Map totalAmount to total
        // Map populated restaurantId to restaurant object expected by UI
        restaurant: o.restaurantId ? {
          id: o.restaurantId._id,
          name: o.restaurantId.name,
          image: o.restaurantId.profileImage || 'https://via.placeholder.com/100'
        } : { name: 'Unknown Restaurant', image: 'https://via.placeholder.com/100' }
      }));

      set({ orders: orders, isLoading: false });
    } catch (error) {
      console.error('[ordersStore] Error fetching orders:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch order detail
  fetchOrderDetail: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await orderService.getOrderDetail(orderId);

      // httpClient already returns response.data
      const rawOrder = response;

      if (!rawOrder) {
        throw new Error('Order not found or empty response');
      }

      const order = {
        ...rawOrder,
        id: rawOrder._id,
        total: rawOrder.totalAmount,
        restaurant: rawOrder.restaurantId ? {
          id: rawOrder.restaurantId._id,
          name: rawOrder.restaurantId.name,
          image: rawOrder.restaurantId.profileImage || 'https://via.placeholder.com/100'
        } : { name: 'Unknown Restaurant', image: 'https://via.placeholder.com/100' }
      };

      set({ currentOrder: order, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Place order
  placeOrder: async (orderData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await orderService.placeOrder(orderData);

      // httpClient already returns response.data
      const newOrder = response;

      set({
        orders: [newOrder, ...get().orders],
        currentOrder: newOrder,
        isLoading: false,
      });

      return { success: true, order: newOrder };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      set({ isLoading: true, error: null });

      const response = await orderService.cancelOrder(orderId);

      // Update local state
      const orders = get().orders.map((order) =>
        order.id === orderId
          ? { ...order, status: ORDER_STATUS.CANCELLED }
          : order
      );

      // Also update currentOrder if it matches
      if (get().currentOrder?.id === orderId) {
        set({ currentOrder: { ...get().currentOrder, status: ORDER_STATUS.CANCELLED } });
      }

      set({ orders, isLoading: false });

      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    orders: [],
    currentOrder: null,
    error: null,
  }),
}));