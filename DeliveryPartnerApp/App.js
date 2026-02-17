import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Screen Imports
import AuthScreen from './screens/AuthScreen'; // NEW: Import Auth
import HomeScreen from './screens/HomeScreen';
import ActiveOrderScreen from './screens/ActiveOrderScreen';
import EarningsScreen from './screens/EarningsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#9139BA',
        tabBarInactiveTintColor: '#95a5a6',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f2f6',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      <Tab.Screen
        name="Orders"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="moped" size={26} color={color} />
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="currency-inr" size={26} color={color} />
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={26} color={color} />
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth" // Explicitly setting Auth as the start
          screenOptions={{ headerShown: false }}
        >
          {/* 1. AUTH SCREEN - App loads this first */}
          <Stack.Screen name="Auth" component={AuthScreen} />

          {/* 2. MAIN TABS - App goes here after login */}
          <Stack.Screen name="Main" component={MainTabs} />

          {/* 3. ACTIVE ORDER - Full screen task view */}
          <Stack.Screen name="ActiveOrder" component={ActiveOrderScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}