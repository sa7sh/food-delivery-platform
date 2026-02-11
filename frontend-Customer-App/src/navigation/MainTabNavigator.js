import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, Text, Platform } from 'react-native';
import { ROUTES } from '../constants';
import { colors } from '../theme';
import { useCartStore } from '../store';

// Import stack navigators
import HomeStack from './HomeStack';
import OrdersStack from './OrdersStack';
import ProfileStack from './ProfileStack';

// Import screens
import SearchScreen from '../features/home/screens/SearchScreen.js';
import CartScreen from '../features/cart/screens/CartScreen.js';

// Import custom tab bar
import FloatingTabBar from './FloatingTabBar';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const totalItems = useCartStore((state) => state.totalItems);

  // Helper function to determine if tab bar should be shown
  const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route);

    // Hide tab bar on these screens
    const screensToHideTabBar = [
      ROUTES.RESTAURANT_DETAIL,
      ROUTES.ORDER_DETAIL,
      // Add other detail screens here as needed
    ];

    return !screensToHideTabBar.includes(routeName);
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeStack}
        options={({ route }) => ({
          tabBarLabel: 'Home',
          tabBarStyle: {
            display: getTabBarVisibility(route) ? 'flex' : 'none'
          },
        })}
      />
      <Tab.Screen
        name={ROUTES.SEARCH}
        component={SearchScreen}
        options={{ tabBarLabel: 'Search' }}
      />
      <Tab.Screen
        name={ROUTES.CART}
        component={CartScreen}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen
        name={ROUTES.ORDERS}
        component={OrdersStack}
        options={({ route }) => ({
          tabBarLabel: 'Orders',
          tabBarStyle: {
            display: getTabBarVisibility(route) ? 'flex' : 'none'
          },
        })}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileStack}
        options={({ route }) => ({
          tabBarLabel: 'Profile',
          tabBarStyle: {
            display: getTabBarVisibility(route) ? 'flex' : 'none'
          },
        })}
      />
    </Tab.Navigator>
  );
}