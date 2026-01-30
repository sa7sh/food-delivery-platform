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

      const addresses = response.data || response || [];
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
        id: response.data?.id || response.id || Date.now().toString(),
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

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    profile: null,
    addresses: [],
    selectedAddress: null,
    error: null,
  }),
}));