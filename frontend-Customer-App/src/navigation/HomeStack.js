import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants';

// Import screens (we'll create these later)
import HomeScreen from '../features/home/screens/HomeScreen';
import RestaurantDetailScreen from '../features/restaurant/screens/RestaurantDetailScreen.js';
import CategoriesScreen from '../features/home/screens/CategoriesScreen.js';

const Stack = createNativeStackNavigator();

import { useTheme } from '../hooks/useTheme';

export default function HomeStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.HOME_SCREEN} component={HomeScreen} />
      <Stack.Screen
        name={ROUTES.RESTAURANT_DETAIL}
        component={RestaurantDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name={ROUTES.CATEGORIES}
        component={CategoriesScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}