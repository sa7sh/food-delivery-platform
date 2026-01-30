import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { ROUTES } from '../../../constants';
import { useAuthStore } from '../../../store';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    if (error) clearError();
  };

  const validate = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Full Name is required';

    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';

    if (!formData.phone) errors.phone = 'Phone Number is required';
    else if (formData.phone.length < 10) errors.phone = 'Phone Number must be valid';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (validate()) {
      // In a real app, typically we might register then go to OTP
      // For this flow, let's assume register returns success then we go to OTP
      // Or we go to OTP first to verify phone then register.
      // Based on common "delivery" apps, often OTP is first or last.
      // Let's assume Register -> OTP -> Main
      // However, authStore.register currently mocks "login" essentially.
      // Let's just mock navigation to OTP for now to demonstrate flow.

      const result = await register(formData);
      if (result.success) {
        // For demonstration, let's say we need to verify OTP next
        // In a real backend integration, we might not set "isAuthenticated" to true yet
        // But our mock store sets it to true immediately.
        // For now, let's pretend we are verified or just navigate.
        // Since store sets Auth=true, RootNavigator might switch to Main automatically.
        // If we want to show OTP, we should perhaps navigate there *before* calling the final register action that sets the token,
        // OR the register action should return "requires_otp" status.
        // For simplicity in this mock: we'll just let it go to main, OR manually navigate to OTP if we want to show it.
        // Let's Navigate to OTP Verification to show the screen as requested.
        navigation.navigate(ROUTES.OTP_VERIFICATION, { phone: formData.phone });
      }
    }
  };

  const navigateToLogin = () => {
    navigation.navigate(ROUTES.LOGIN);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          <View className="flex-1 justify-center py-8">
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900">
                Create Account
              </Text>
              <Text className="text-gray-500 mt-2 text-base">
                Sign up to start ordering your favorite food
              </Text>
            </View>

            <View className="space-y-4">
              {error && (
                <Text className="text-primary-600 mb-4 text-center font-medium">{error}</Text>
              )}

              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                autoCapitalize="words"
                error={formErrors.name}
              />

              <Input
                label="Email Address"
                placeholder="name@example.com"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
                error={formErrors.email}
              />

              <Input
                label="Phone Number"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                keyboardType="phone-pad"
                error={formErrors.phone}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry
                error={formErrors.password}
              />

              <View className="mt-6">
                <Button
                  title="Sign Up"
                  onPress={handleRegister}
                  loading={isLoading}
                  size="lg"
                  className="w-full shadow-lg shadow-primary-200"
                />
              </View>

            </View>

            <View className="flex-row justify-center items-center mt-auto py-6">
              <Text className="text-gray-600 text-base">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text className="text-primary-600 font-bold text-base">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}