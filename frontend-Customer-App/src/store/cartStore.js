import { create } from 'zustand';
import { cartService } from '../services/api';

export const useCartStore = create((set, get) => ({
  // State
  items: [],
  restaurant: null, // Current restaurant in cart
  totalItems: 0,
  subtotal: 0,
  deliveryFee: 40,
  taxes: 0,
  total: 0,
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Calculate totals
  calculateTotals: () => {
    const { items, deliveryFee } = get();
    
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const customizationsTotal = (item.selectedCustomizations || [])
        .reduce((cusSum, cus) => cusSum + cus.price, 0) * item.quantity;
      return sum + itemTotal + customizationsTotal;
    }, 0);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const taxes = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + taxes;

    set({
      totalItems,
      subtotal,
      taxes,
      total,
    });
  },

  // Add item to cart
  addItem: (item) => {
    const { items, restaurant } = get();

    // Check if item is from a different restaurant
    if (restaurant && restaurant.id !== item.restaurantId) {
      // In production, show a modal asking if user wants to clear cart
      set({
        error: 'Items from multiple restaurants cannot be added. Clear cart first.',
      });
      return { success: false };
    }

    // Check if item already exists
    const existingItemIndex = items.findIndex(
      (cartItem) => 
        cartItem.id === item.id &&
        JSON.stringify(cartItem.selectedCustomizations) === 
        JSON.stringify(item.selectedCustomizations)
    );

    let newItems;
    if (existingItemIndex > -1) {
      // Update quantity
      newItems = [...items];
      newItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      newItems = [...items, { ...item, cartItemId: Date.now().toString() }];
    }

    set({
      items: newItems,
      restaurant: restaurant || {
        id: item.restaurantId,
        name: item.restaurantName,
      },
      error: null,
    });

    get().calculateTotals();
    return { success: true };
  },

  // Update item quantity
  updateItemQuantity: (cartItemId, quantity) => {
    const { items } = get();

    if (quantity <= 0) {
      // Remove item
      get().removeItem(cartItemId);
      return;
    }

    const newItems = items.map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity }
        : item
    );

    set({ items: newItems });
    get().calculateTotals();
  },

  // Remove item
  removeItem: (cartItemId) => {
    const { items } = get();
    const newItems = items.filter((item) => item.cartItemId !== cartItemId);

    set({
      items: newItems,
      restaurant: newItems.length === 0 ? null : get().restaurant,
    });

    get().calculateTotals();
  },

  // Clear cart
  clearCart: () => {
    set({
      items: [],
      restaurant: null,
      totalItems: 0,
      subtotal: 0,
      taxes: 0,
      total: 0,
      error: null,
    });
  },

  // Fetch cart from backend (when integrated)
  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      // const response = await cartService.getCart();
      
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));