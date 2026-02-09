import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import './global.css';

import { AuthProvider } from './src/context/AuthContext';
import { FoodProvider } from './src/context/FoodContext';
import { OrderProvider } from './src/context/OrderContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent = () => {
  const { isDarkMode } = useTheme();
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
};

import { registerRootComponent } from 'expo';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FoodProvider>
          <OrderProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </OrderProvider>
        </FoodProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default registerRootComponent(App);
