import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants';

// Import screens
import OrdersListScreen from '../features/orders/screens/OrdersListScreen.js';
import OrderDetailScreen from '../features/orders/screens/OrderDetailScreen.js';

const Stack = createNativeStackNavigator();

export default function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.ORDERS_LIST} component={OrdersListScreen} />
      <Stack.Screen name={ROUTES.ORDER_DETAIL} component={OrderDetailScreen} />
    </Stack.Navigator>
  );
}