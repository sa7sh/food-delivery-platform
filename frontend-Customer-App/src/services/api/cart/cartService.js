// Cart is handled entirely client-side via Zustand store.
// No HTTP API calls — cart data lives in local state only.

export const cartService = {
  // Get cart — returns empty (handled by Zustand store)
  async getCart() {
    return { items: [], total: 0 };
  },

  // Add to cart — no-op (handled by Zustand store)
  async addToCart(item) {
    return { success: true };
  },

  // Update cart item — no-op (handled by Zustand store)
  async updateCartItem(itemId, quantity) {
    return { success: true };
  },

  // Remove from cart — no-op (handled by Zustand store)
  async removeFromCart(itemId) {
    return { success: true };
  },

  // Clear cart — no-op (handled by Zustand store)
  async clearCart() {
    return { success: true };
  },
};