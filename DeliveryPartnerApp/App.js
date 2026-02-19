import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Screen Imports
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import ActiveOrderScreen from './screens/ActiveOrderScreen';
import EarningsScreen from './screens/EarningsScreen';
import ProfileScreen from './screens/ProfileScreen';
import { SocketProvider } from './context/SocketContext';
import { useDeliveryAuthStore } from './store/authStore';

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
  // Zustand persist middleware rehydrates from AsyncStorage automatically.
  // _hasHydrated tracks when the initial AsyncStorage read is complete.
  const isAuthenticated = useDeliveryAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useDeliveryAuthStore((s) => s.hasHydrated);

  // Show spinner while Zustand is reading from AsyncStorage on first mount
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#9139BA" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SocketProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={isAuthenticated ? 'Main' : 'Auth'}
            screenOptions={{ headerShown: false }}
          >
            {/* 1. AUTH SCREEN */}
            <Stack.Screen name="Auth" component={AuthScreen} />

            {/* 2. MAIN TABS */}
            <Stack.Screen name="Main" component={MainTabs} />

            {/* 3. ACTIVE ORDER - Full screen task view */}
            <Stack.Screen name="ActiveOrder" component={ActiveOrderScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SocketProvider>
    </SafeAreaProvider>
  );
}