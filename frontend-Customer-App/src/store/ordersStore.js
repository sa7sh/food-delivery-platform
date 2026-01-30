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
      
      // TODO: Replace with actual API call
      // const response = await orderService.getOrders(params);
      
      // Mock data for now
      const mockOrders = [
        {
          id: '1',
          restaurant: {
            id: 'r1',
            name: 'Pizza Palace',
            image: 'https://via.placeholder.com/100',
          },
          items: [
            {
              id: 'i1',
              name: 'Margherita Pizza',
              quantity: 1,
              price: 299,
            },
            {
              id: 'i2',
              name: 'Garlic Bread',
              quantity: 2,
              price: 99,
            },
          ],
          total: 537,
          status: ORDER_STATUS.DELIVERED,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryAddress: {
            street: '123 Main Street',
            city: 'Mumbai',
          },
        },
        {
          id: '2',
          restaurant: {
            id: 'r2',
            name: 'Burger House',
            image: 'https://via.placeholder.com/100',
          },
          items: [
            {
              id: 'i3',
              name: 'Chicken Burger',
              quantity: 2,
              price: 199,
            },
          ],
          total: 438,
          status: ORDER_STATUS.OUT_FOR_DELIVERY,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          deliveryAddress: {
            street: '123 Main Street',
            city: 'Mumbai',
          },
        },
      ];

      set({ orders: mockOrders, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch order detail
  fetchOrderDetail: async (orderId) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      // const response = await orderService.getOrderDetail(orderId);
      
      // Find from existing orders or mock
      const order = get().orders.find((o) => o.id === orderId) || {
        id: orderId,
        restaurant: {
          id: 'r1',
          name: 'Pizza Palace',
          image: 'https://via.placeholder.com/100',
        },
        items: [
          {
            id: 'i1',
            name: 'Margherita Pizza',
            quantity: 1,
            price: 299,
          },
        ],
        total: 339,
        status: ORDER_STATUS.PREPARING,
        createdAt: new Date().toISOString(),
        deliveryAddress: {
          street: '123 Main Street',
          city: 'Mumbai',
        },
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
      
      // TODO: Replace with actual API call
      // const response = await orderService.placeOrder(orderData);
      
      const newOrder = {
        id: Date.now().toString(),
        ...orderData,
        status: ORDER_STATUS.PLACED,
        createdAt: new Date().toISOString(),
      };

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
      
      // TODO: Replace with actual API call
      // const response = await orderService.cancelOrder(orderId);
      
      const orders = get().orders.map((order) =>
        order.id === orderId
          ? { ...order, status: ORDER_STATUS.CANCELLED }
          : order
      );

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