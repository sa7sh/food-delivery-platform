import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext.js';
import LoginScreen from '../screens/LoginScreen.js';
import RegistrationScreen from '../screens/RegistrationScreen.js';
import MainTabNavigator from './MainTabNavigator.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import ReviewsScreen from '../screens/ReviewsScreen.js';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth status
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registration" component={RegistrationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
