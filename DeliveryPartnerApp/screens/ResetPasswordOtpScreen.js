import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../constants/Config';

export default function ResetPasswordOtpScreen({ navigation, route }) {
  const { email } = route.params || { email: '' };
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (code.length < 6) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const result = await response.json();

      if (result.success) {
        navigation.navigate('ResetPassword', { email });
      } else {
        Alert.alert('Error', result.message || 'Invalid OTP');
      }
    } catch (e) {
      console.log('Verify OTP Error:', e);
      Alert.alert('Connection Error', 'Cannot reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (result.success) {
        setTimer(300);
        Alert.alert('Success', 'A new OTP has been sent to your email.');
      } else {
        Alert.alert('Error', result.message || 'Failed to resend OTP');
      }
    } catch (e) {
      console.log('Resend OTP Error:', e);
      Alert.alert('Connection Error', 'Cannot reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit verification code to {email}
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.inputField}
                  placeholder="000000"
                  placeholderTextColor="#b2bec3"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, (loading || code.length < 6) && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={loading || code.length < 6}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Verify OTP</Text>}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {formatTime(timer)}</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={loading}>
                  <Text style={styles.resendLink}>Resend</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 40 },
  header: { marginBottom: 30 },
  backBtn: { padding: 10, borderRadius: 12, backgroundColor: '#f5f0fa', alignSelf: 'flex-start' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#b1adad', shadowOpacity: 0.05, shadowRadius: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#95a5a6', marginBottom: 25, marginTop: 4, lineHeight: 20 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#9139BA', marginBottom: 8, marginLeft: 4, textAlign: 'center' },
  inputBox: { alignItems: 'center', backgroundColor: '#fdfbff', borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: '#f5f0fa' },
  inputField: { flex: 1, fontSize: 24, color: '#2d3436', fontWeight: 'bold', letterSpacing: 8, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#9139BA', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  btnDisabled: { opacity: 0.7 },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  resendText: { fontSize: 14, color: '#95a5a6' },
  timerText: { fontSize: 14, fontWeight: '500', color: '#95a5a6' },
  resendLink: { fontSize: 14, fontWeight: '700', color: '#9139BA' },
});
