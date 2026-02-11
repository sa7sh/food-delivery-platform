import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'en', // default language
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'food-delivery-language-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
