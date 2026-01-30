import { useCartStore } from '../store';

export const useCart = () => {
  const {
    items,
    restaurant,
    totalItems,
    subtotal,
    deliveryFee,
    taxes,
    total,
    isLoading,
    error,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    clearError,
  } = useCartStore();

  return {
    items,
    restaurant,
    totalItems,
    subtotal,
    deliveryFee,
    taxes,
    total,
    isLoading,
    error,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    clearError,
  };
};