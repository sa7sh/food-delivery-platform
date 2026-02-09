import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { ROUTES } from '../constants';
import { useAuthStore } from '../store';
import { navigationRef } from './navigationRef';
import { colors } from '../theme';

// Import navigators and screens
import SplashScreen from '../features/splash/SplashScreen';
import PaymentScreen from '../features/cart/screens/PaymentScreen';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuthState();
  }, []);

  const initializeAuthState = async () => {
    try {
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          // console.warn('Auth initialization timed out'); // Suppressed for development
          resolve();
        }, 5000);
      });

      // Race between auth init and timeout
      await Promise.race([
        initializeAuth(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {showSplash ? (
          <Stack.Screen name={ROUTES.SPLASH}>
            {(props) => (
              <SplashScreen {...props} onComplete={handleSplashComplete} />
            )}
          </Stack.Screen>
        ) : isAuthenticated ? (
          <>
            <Stack.Screen name={ROUTES.MAIN} component={MainTabNavigator} />
            <Stack.Screen
              name={ROUTES.PAYMENT}
              component={PaymentScreen}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'fullScreenModal'
              }}
            />
          </>
        ) : (
          <Stack.Screen name={ROUTES.AUTH} component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}