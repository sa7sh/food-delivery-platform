/**
 * Delivery Partner Auth Store — Zustand with AsyncStorage persistence.
 *
 * Replaces manual AsyncStorage.getItem/setItem/clear calls scattered across
 * App.js, AuthScreen.js, and ProfileScreen.js.
 *
 * The `persist` middleware handles reading from and writing to AsyncStorage
 * automatically — no manual token checks needed on app startup.
 *
 * Usage:
 *   const { token, deliveryPartner, isAuthenticated, login, logout, updatePartner } =
 *     useDeliveryAuthStore();
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useDeliveryAuthStore = create(
  persist(
    (set) => ({
      // ─── State ──────────────────────────────────────────────────────────────
      token: null,
      deliveryPartner: null,
      isAuthenticated: false,
      hasHydrated: false, // true once AsyncStorage rehydration is complete

      // ─── Actions ────────────────────────────────────────────────────────────

      /** Called after successful login or registration */
      login: (token, partner) =>
        set({ token, deliveryPartner: partner, isAuthenticated: true }),

      /** Called on logout — clears all auth state and AsyncStorage entry */
      logout: () =>
        set({ token: null, deliveryPartner: null, isAuthenticated: false }),

      /**
       * Merge fresh profile data from the backend into the stored partner object.
       * Keeps the token and isAuthenticated flag intact.
       */
      updatePartner: (partialPartner) =>
        set((state) => ({
          deliveryPartner: state.deliveryPartner
            ? { ...state.deliveryPartner, ...partialPartner }
            : partialPartner,
        })),

      /** Internal — called by onRehydrateStorage when AsyncStorage read is done */
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'delivery-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist data fields — not actions or the hasHydrated flag
      partialize: (state) => ({
        token: state.token,
        deliveryPartner: state.deliveryPartner,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when AsyncStorage read completes (state is null on very first launch)
        useDeliveryAuthStore.getState().setHasHydrated(true);
      },
    }
  )
);
