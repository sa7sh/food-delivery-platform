import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { LayoutAnimation, Platform, UIManager, useColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@restaurant_app_theme';

if (Platform.OS === 'android' && UIManager && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const Colors = {
  light: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#2D2D2D',
    subtext: '#6C757D',
    border: '#E5E7EB',
    primary: '#9139BA', // Replaced Red with Purple
    primaryLight: '#DBC0E8B5', // Added light purple
    secondary: '#FFFFFF',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#DC3545',
    inputBg: '#FFFFFF',
    statusCard: 'rgba(255, 255, 255, 0.2)',
  },
  dark: {
    background: '#222222',
    card: '#1E1E1E',
    text: '#F3F4F6',
    subtext: '#9CA3AF',
    border: '#333333',
    primary: '#9139BA', // Replaced Red with Purple
    primaryLight: '#DBC0E8B5', // Added light purple
    secondary: '#2D2D2D',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    inputBg: '#2D2D2D',
    statusCard: 'rgba(0, 0, 0, 0.3)',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Force default to Light mode, ignore system preference initially
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      if (LayoutAnimation) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
