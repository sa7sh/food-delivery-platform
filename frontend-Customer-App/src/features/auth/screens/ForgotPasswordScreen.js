import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuthStore } from '../../../store';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(null);

  const handleSend = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Invalid email address');
      return;
    }

    // Call store action
    const result = await forgotPassword(email);

    if (result.success) {
      Alert.alert(
        'Email Sent',
        'If an account exists with this email, you will receive password reset instructions.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
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
          <View className="flex-1 pt-8">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mb-6 p-2 -ml-2 self-start"
            >
              <Text className="text-gray-600 font-medium">← Back to Login</Text>
            </TouchableOpacity>

            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Reset Password
              </Text>
              <Text className="text-gray-500 text-base leading-6">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </Text>
            </View>

            <View className="space-y-6">
              {error && (
                <Text className="text-red-500 text-center">{error}</Text>
              )}

              <Input
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(null);
                  if (error) clearError();
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                error={emailError}
              />

              <Button
                title="Send Instructions"
                onPress={handleSend}
                loading={isLoading}
                size="lg"
                className="w-full shadow-lg shadow-primary-200 mt-2"
              />
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}