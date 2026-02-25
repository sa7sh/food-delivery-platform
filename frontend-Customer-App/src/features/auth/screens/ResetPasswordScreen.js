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
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { ROUTES } from '../../../constants';
import { useAuthStore } from '../../../store';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || { email: '' };

  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleReset = async () => {
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const result = await resetPassword({ email, password });
    if (result.success) {
      Alert.alert(
        'Success',
        'Your password has been reset successfully.',
        [{
          text: 'Login', onPress: () => {
            // Reset navigation stack to Login to prevent going back to reset flow
            navigation.reset({
              index: 0,
              routes: [{ name: ROUTES.LOGIN }]
            });
          }
        }]
      );
    } else {
      Alert.alert('Error', result.error || 'Failed to reset password');
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
              <Text className="text-gray-600 font-medium">← Back</Text>
            </TouchableOpacity>

            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 mb-2">
                Create New Password
              </Text>
              <Text className="text-gray-500 text-base">
                Your new password must be securely formed and at least 8 characters.
              </Text>
            </View>

            <View className="space-y-6">
              {(error || validationError) && (
                <Text className="text-red-500 text-center">{error || validationError}</Text>
              )}

              <Input
                label="New Password"
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationError) setValidationError('');
                  if (error) clearError();
                }}
                secureTextEntry
                autoCapitalize="none"
              />

              <Input
                label="Confirm New Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (validationError) setValidationError('');
                  if (error) clearError();
                }}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                title="Reset Password"
                onPress={handleReset}
                loading={isLoading}
                size="lg"
                className="w-full shadow-lg shadow-primary-200 mt-4"
                disabled={password.length < 8 || password !== confirmPassword}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
