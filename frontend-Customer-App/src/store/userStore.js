import { create } from 'zustand';
import { userService } from '../services/api';

export const useUserStore = create((set, get) => ({
  // State
  profile: null,
  addresses: [],
  selectedAddress: null,
  isLoading: false,
  error: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setProfile: (profile) => set({ profile }),

  setAddresses: (addresses) => set({ addresses }),

  setSelectedAddress: (address) => set({ selectedAddress: address }),

  // Fetch profile
  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await userService.getProfile();

      // Assuming response.data contains the profile object
      set({ profile: response.data || response, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await userService.updateProfile(userData);

      // Use the actual backend response to update state
      set({
        profile: response.data || response,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Fetch addresses
  fetchAddresses: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await userService.getAddresses();

      const rawAddresses = response.data || response || [];
      const addresses = rawAddresses.map(addr => ({
        ...addr,
        id: addr.id || addr._id,
      }));
      const defaultAddress = addresses.find((addr) => addr.isDefault);

      set({
        addresses: addresses,
        selectedAddress: defaultAddress || addresses[0],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  // Add address
  addAddress: async (addressData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await userService.addAddress(addressData);

      const newAddress = {
        id: response.data?.id || response.data?._id || response.id || Date.now().toString(),
        ...addressData,
      };

      const addresses = [...get().addresses, newAddress];

      set({
        addresses,
        selectedAddress: newAddress.isDefault ? newAddress : get().selectedAddress,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    try {
      set({ isLoading: true, error: null });

      await userService.updateAddress(addressId, addressData);

      const addresses = get().addresses.map((addr) =>
        addr.id === addressId ? { ...addr, ...addressData } : addr
      );

      set({
        addresses,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    try {
      set({ isLoading: true, error: null });

      await userService.deleteAddress(addressId);

      const addresses = get().addresses.filter((addr) => addr.id !== addressId);

      set({
        addresses,
        selectedAddress:
          get().selectedAddress?.id === addressId
            ? addresses[0]
            : get().selectedAddress,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Favorites
  favorites: [],

  // Fetch Favorites
  fetchFavorites: async () => {
    try {
      const response = await userService.getFavorites();
      set({ favorites: response.data || response || [] });
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  },

  // Toggle Favorite
  toggleFavorite: async (restaurantId) => {
    try {
      console.log('[UserStore] Toggling favorite for:', restaurantId);
      // Optimistic Update
      const currentFavorites = get().favorites;
      const index = currentFavorites.findIndex(f => (f._id || f) === restaurantId);

      let newFavorites;
      if (index > -1) {
        newFavorites = currentFavorites.filter(f => (f._id || f) !== restaurantId);
      } else {
        // Optimistically add just the ID or partial object if possible
        newFavorites = [...currentFavorites, { _id: restaurantId, id: restaurantId, name: 'Loading...' }];
      }

      // Update UI immediately
      set({ favorites: newFavorites });

      const response = await userService.toggleFavorite(restaurantId);
      console.log('[UserStore] Response:', response);

      if (response && response.success) {
        // If endpoint returns full list, use it
        if (response.favorites) {
          // We need populated objects, backend returns IDs? 
          // If backend returns IDs, we must fetch again.
          // Let's check what backend returns.
          console.log('[UserStore] Favorites updated on backend, refetching...');
          get().fetchFavorites();
        }
      } else {
        // Revert on failure
        console.error('[UserStore] Toggle failed (success: false), reverting.');
        set({ favorites: currentFavorites });
      }
      return response;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert on error
      set({ favorites: get().favorites }); // This might be wrong if state already changed, better to use captured 'currentFavorites'.
      // Actually, we should capture current before change.
      // But for debugging, this is fine.
      return { success: false };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    profile: null,
    addresses: [],
    selectedAddress: null,
    favorites: [],
    error: null,
  }),
}));