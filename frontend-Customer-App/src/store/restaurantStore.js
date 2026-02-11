import { create } from 'zustand';
import { restaurantService } from '../services/api';

export const useRestaurantStore = create((set, get) => ({
  // State
  currentRestaurant: null,
  menu: [],
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Fetch restaurant detail
  fetchRestaurantDetail: async (restaurantId) => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Replace with actual API call
      // const response = await restaurantService.getRestaurantDetail(restaurantId);

      // Mock data for now
      const mockRestaurant = {
        id: restaurantId,
        name: 'Pizza Palace',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        rating: 4.3,
        ratingCount: 2340,
        cuisine: ['Pizza', 'Italian', 'Fast Food'],
        deliveryTime: '30-35 mins',
        costForTwo: 400,
        distance: '2.5 km',
        address: '123 Main Street, Mumbai',
        isOpen: true,
        offers: [
          { id: '1', title: '50% off up to ₹100', code: 'PIZZA50' },
          { id: '2', title: 'Free delivery on orders above ₹199', code: 'FREEDEL' },
        ],
      };

      set({ currentRestaurant: mockRestaurant, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Fetch menu
  fetchMenu: async (restaurantId) => {
    try {
      set({ isLoading: true, error: null });

      // Fetch real food items from backend
      const { foodService } = await import('../services/api');
      const foods = await foodService.getFoodsByRestaurant(restaurantId);

      console.log('Fetched foods for restaurant:', restaurantId, 'Count:', foods.length);
      if (foods.length > 0) {
        console.log('First Item Image URL Length:', foods[0].imageUrl ? foods[0].imageUrl.length : 'undefined');
      }

      // Group food items by category
      // For now, we'll create a simple "All Items" category
      // You can enhance this later to support multiple categories
      const menuCategories = [
        {
          id: 'all-items',
          name: 'All Items',
          items: foods.map(food => ({
            id: food._id,
            name: food.name,
            description: food.description || 'Delicious food item',
            price: food.price,
            image: food.imageUrl || food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
            isVeg: food.isVeg !== undefined ? food.isVeg : false,
            rating: food.rating || 4.5,
            ratingCount: food.ratingCount || 100,
            restaurantId: restaurantId,
          }))
        }
      ];

      set({ menu: menuCategories, isLoading: false });
    } catch (error) {
      console.error('Error fetching menu:', error);
      set({ isLoading: false, error: error.message, menu: [] });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset
  reset: () => set({
    currentRestaurant: null,
    menu: [],
    error: null,
  }),
}));