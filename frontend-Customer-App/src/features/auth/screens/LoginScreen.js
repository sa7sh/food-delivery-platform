import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
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
import { colors } from '../../../theme';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field specific error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    // Clear global error
    if (error) clearError();
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';

    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      const result = await login(formData);
      if (result.success) {
        // Navigation is handled automatically by RootNavigator based on auth state
        console.log('Login successful');
      }
    }
  };

  const navigateToRegister = () => {
    navigation.navigate(ROUTES.REGISTER);
  };

  const navigateToForgotPassword = () => {
    navigation.navigate(ROUTES.FORGOT_PASSWORD);
  };

  // Pre-fill for demo purposes (optional, good for testing)
  // useEffect(() => {
  //   setFormData({ email: 'user@example.com', password: 'password123' });
  // }, []);

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
            {/* Header / Branding */}
            <View className="items-center mb-10">
              <View className="mb-4">
                <Image
                  source={require('../../../../assets/logo.png')}
                  style={{ width: 150, height: 150 }}
                  resizeMode="contain"
                />
              </View>
              <Text className="text-3xl font-bold text-gray-900 text-center">
                Welcome Back
              </Text>
              <Text className="text-gray-500 text-center mt-2 text-base">
                Sign in to continue your delicious journey
              </Text>
            </View>

            {/* Form */}
            <View className="w-full space-y-4">
              {error && (
                <View className="bg-primary-50 p-4 rounded-xl mb-4 border border-primary-100 flex-row items-center">
                  <Text className="text-primary-600 flex-1 text-sm font-medium">
                    {error}
                  </Text>
                </View>
              )}

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
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry
                error={formErrors.password}
              />

              <TouchableOpacity
                onPress={navigateToForgotPassword}
                className="self-end pt-2"
              >
                <Text className="text-primary-600 font-semibold text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <View className="mt-6">
                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={isLoading}
                  size="lg"
                  className="w-full shadow-lg shadow-primary-200"
                />
              </View>

              {/* Social Login Divider (Optional Future) */}
              <View className="flex-row items-center justify-center mt-8 mb-6">
                <View className="h-[1px] flex-1 bg-gray-200" />
                <Text className="mx-4 text-gray-400 text-sm">Or continue with</Text>
                <View className="h-[1px] flex-1 bg-gray-200" />
              </View>

              <View className="flex-row space-x-4 mb-6">
                <Button
                  variant="outline"
                  title="Google"
                  className="flex-1 border-gray-200 bg-white"
                  textClassName="text-gray-700 font-semibold"
                />
                <Button
                  variant="outline"
                  title="Apple"
                  className="flex-1 border-gray-200 bg-white"
                  textClassName="text-gray-700 font-semibold"
                />
              </View>

            </View>

            {/* Footer */}
            <View className="flex-row justify-center items-center mt-auto py-6">
              <Text className="text-gray-600 text-base">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text className="text-primary-600 font-bold text-base">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}