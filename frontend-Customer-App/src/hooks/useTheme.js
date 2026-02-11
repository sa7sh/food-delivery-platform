import { useThemeStore } from '../store/themeStore';
import { useEffect } from 'react';

export const useTheme = () => {
  const { mode, theme, toggleTheme, initializeTheme } = useThemeStore();

  useEffect(() => {
    // Ensure theme is initialized on app mount (if not already)
    // This effect might run multiple times if used in multiple components,
    // but initializeTheme usually reads from storage once or check state.
    // For better performance, initializeTheme should be called once at root, 
    // but calling here ensures individual components work.
    initializeTheme();
  }, []);

  return {
    colors: theme,
    isDark: mode === 'dark',
    toggleTheme,
    mode,
  };
};
