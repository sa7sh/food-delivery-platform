import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { lightTheme, darkTheme } from '../theme/colors';

// Simple persistence helper
const saveTheme = async (mode) => {
  try {
    await SecureStore.setItemAsync('user_theme_preference', mode);
  } catch (error) {
    console.warn('Failed to save theme preference', error);
  }
};

export const useThemeStore = create((set) => ({
  mode: 'light',
  theme: lightTheme,

  initializeTheme: async () => {
    try {
      const storedMode = await SecureStore.getItemAsync('user_theme_preference');
      if (storedMode === 'dark') {
        set({ mode: 'dark', theme: darkTheme });
      } else {
        set({ mode: 'light', theme: lightTheme });
      }
    } catch (error) {
      console.warn('Failed to load theme preference', error);
      set({ mode: 'light', theme: lightTheme });
    }
  },

  toggleTheme: () => set((state) => {
    const newMode = state.mode === 'light' ? 'dark' : 'light';
    const newTheme = newMode === 'dark' ? darkTheme : lightTheme;

    saveTheme(newMode);

    return {
      mode: newMode,
      theme: newTheme
    };
  }),

  setTheme: (mode) => {
    const newTheme = mode === 'dark' ? darkTheme : lightTheme;
    saveTheme(mode);
    set({ mode, theme: newTheme });
  },
}));
