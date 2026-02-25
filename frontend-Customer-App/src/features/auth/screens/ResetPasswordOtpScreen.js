import React, { useState, useEffect } from 'react';
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

export default function ResetPasswordOtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || { email: '' };

  const { verifyResetOTP, forgotPassword, isLoading, error, clearError } = useAuthStore();

  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (code.length < 6) return;

    const result = await verifyResetOTP({ email, otp: code });
    if (result.success) {
      navigation.navigate(ROUTES.RESET_PASSWORD, { email });
    } else {
      Alert.alert('Error', result.error || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    setTimer(300);
    await forgotPassword(email);
    Alert.alert('Success', 'A new OTP has been sent to your email.');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
                Verify Email
              </Text>
              <Text className="text-gray-500 text-base">
                We've sent a 6-digit verification code to {email}
              </Text>
            </View>

            <View className="space-y-6">
              {error && (
                <Text className="text-red-500 text-center">{error}</Text>
              )}

              <Input
                label="Verification Code"
                placeholder="000000"
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
                title="Verify OTP"
                onPress={handleVerify}
                loading={isLoading}
                size="lg"
                className="w-full shadow-lg shadow-primary-200 mt-4"
                disabled={code.length < 6}
              />

              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-gray-600">
                  Didn't receive the code?{' '}
                </Text>
                {timer > 0 ? (
                  <Text className="text-gray-400 font-medium">
                    Resend in {formatTime(timer)}
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
