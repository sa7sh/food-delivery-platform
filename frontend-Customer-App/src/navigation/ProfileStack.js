import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants';

// Import screens
import ProfileScreen from '../features/profile/screens/ProfileScreen.js';
import EditProfileScreen from '../features/profile/screens/EditProfileScreen.js';
import SavedAddressesScreen from '../features/profile/screens/SavedAddressesScreen.js';
import OrderHistoryScreen from '../features/profile/screens/OrderHistoryScreen.js';
import AddAddressScreen from '../features/profile/screens/AddAddressScreen.js';
import TermsScreen from '../features/profile/screens/TermsScreen.js';
import PrivacyPolicyScreen from '../features/profile/screens/PrivacyPolicyScreen.js';
import HelpSupportScreen from '../features/profile/screens/HelpSupportScreen.js';

import FavoritesScreen from '../features/profile/screens/FavoritesScreen.js';

const Stack = createNativeStackNavigator();

import { useTheme } from '../hooks/useTheme';

export default function ProfileStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name={ROUTES.PROFILE_SCREEN} component={ProfileScreen} />
      <Stack.Screen name={ROUTES.EDIT_PROFILE} component={EditProfileScreen} />
      <Stack.Screen name={ROUTES.FAVORITES} component={FavoritesScreen} />
      <Stack.Screen
        name={ROUTES.SAVED_ADDRESSES}
        component={SavedAddressesScreen}
      />
      <Stack.Screen
        name={ROUTES.ORDER_HISTORY}
        component={OrderHistoryScreen}
      />
      <Stack.Screen
        name={ROUTES.ADD_ADDRESS}
        component={AddAddressScreen}
      />
      <Stack.Screen
        name={ROUTES.TERMS}
        component={TermsScreen}
      />
      <Stack.Screen
        name={ROUTES.PRIVACY_POLICY}
        component={PrivacyPolicyScreen}
      />
      <Stack.Screen
        name={ROUTES.HELP_SUPPORT}
        component={HelpSupportScreen}
      />
    </Stack.Navigator>
  );
}