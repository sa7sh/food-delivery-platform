const baseColors = {
  primary: {
    50: '#f5f0fa',
    100: '#ead9f5',
    200: '#d5b3eb',
    300: '#c08de1',
    400: '#ab67d7',
    500: '#9139BA',
    600: '#7a2e9e',
    700: '#632477',
    800: '#4c1a5a',
    900: '#35103d',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  white: '#ffffff',
  black: '#000000',
};

export const lightTheme = {
  ...baseColors,
  mode: 'light',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHighlight: '#F1F5F9',
  text: '#0F172A',
  textSub: '#64748B',
  border: '#E2E8F0',
  glass: 'rgba(255,255,255,0.85)',
  nav: '#FFFFFF',
  icon: '#64748B',
};

export const darkTheme = {
  ...baseColors,
  mode: 'dark',
  background: '#141414', // User requested
  surface: '#222222',    // User requested
  surfaceHighlight: '#2A2A2A',
  text: '#F8FAFC',
  textSub: '#94A3B8',
  border: '#333333',
  glass: 'rgba(20,20,20,0.85)',
  nav: '#222222',
  icon: '#94A3B8',
};

// Default export for backward compatibility
export const colors = lightTheme;