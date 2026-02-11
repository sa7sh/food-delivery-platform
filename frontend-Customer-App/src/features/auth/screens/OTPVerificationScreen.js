import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { ROUTES } from '../../../constants';
import { useAuthStore } from '../../../store';

export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { phone } = route.params || { phone: 'your phone' };

  const { verifyOTP, isLoading, error, clearError } = useAuthStore();

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (code.length < 4) return; // Simple validation

    const result = await verifyOTP({ phone, code });
    if (result.success) {
      // In a real app, verifyOTP success might set the token and log in
      // Since our mock store's register() already did that, we might just navigate home
      // But typically register -> verifies -> gets token. 
      // We'll assume successful verification leads to the main app.
      // RootNavigator will check 'isAuthenticated' and show MainTabNavigator.
      // If authStore.register was "false" for auth until OTP, then here we would set auth=true.
      // For this UI demo, we can just navigate or let the state change handle it.
      // Let's assume we need to manually go to a "Success" or Main.
      // Since RootNavigator handles Auth vs Main, lets ensure our store state is correct.
      // (The previous Register step sets isAuthenticated=true in mock, so this screen might actually require
      // tricky navigation in this specific mock state, but let's assume standard behavior).
      console.log("OTP Verified");
    }
  };

  const handleResend = () => {
    setTimer(30);
    // Call resend API here
    console.log("Resend OTP");
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
                Verification
              </Text>
              <Text className="text-gray-500 text-base">
                We've sent a verification code to {phone}
              </Text>
            </View>

            <View className="space-y-6">
              {error && (
                <Text className="text-red-500 text-center">{error}</Text>
              )}

              <Input
                label="Verification Code"
                placeholder="0000"
                value={code}
                onChangeText={(text) => {
                  setCode(text);
                  if (error) clearError();
                }}
                keyboardType="number-pad"
                maxLength={6}
                containerClassName="mb-2"
                inputClassName="text-center text-2xl tracking-widest font-bold"
              />

              <Button
                title="Verify"
                onPress={handleVerify}
                loading={isLoading}
                size="lg"
                className="w-full shadow-lg shadow-primary-200 mt-4"
                disabled={code.length < 4}
              />

              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-gray-600">
                  Didn't receive the code?{' '}
                </Text>
                {timer > 0 ? (
                  <Text className="text-gray-400 font-medium">
                    Resend in {timer}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend}>
                    <Text className="text-primary-600 font-bold">Resend</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}