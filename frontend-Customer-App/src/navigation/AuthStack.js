import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants';

// Import screens (we'll create these later)
import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import OTPVerificationScreen from '../features/auth/screens/OTPVerificationScreen';
import ForgotPasswordScreen from '../features/auth/screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
      <Stack.Screen 
        name={ROUTES.OTP_VERIFICATION} 
        component={OTPVerificationScreen} 
      />
      <Stack.Screen 
        name={ROUTES.FORGOT_PASSWORD} 
        component={ForgotPasswordScreen} 
      />
    </Stack.Navigator>
  );
}