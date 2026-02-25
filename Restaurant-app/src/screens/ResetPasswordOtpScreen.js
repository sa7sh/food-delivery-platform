import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

const ResetPasswordOtpScreen = ({ navigation, route }) => {
  const { email } = route.params || { email: '' };
  const { handleVerifyResetOtp, handleForgotPassword, loading, error } = useAuth();
  const { theme, isDarkMode } = useTheme();

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

    const result = await handleVerifyResetOtp(email, code);
    if (result.success) {
      navigation.navigate('ResetPassword', { email });
    } else {
      Alert.alert('Error', result.error || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    setTimer(300);
    await handleForgotPassword(email);
    Alert.alert('Success', 'A new OTP has been sent to your email.');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backText, { color: theme.subtext }]}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Verify Email</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              We've sent a 6-digit verification code to {email}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Verification Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, letterSpacing: 8, textAlign: 'center', fontSize: 24, fontWeight: 'bold' }]}
                placeholder="000000"
                placeholderTextColor={theme.subtext}
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={6}
                editable={!loading}
              />
            </View>

            {error && (
              <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#7F1D1D33' : '#FEE', borderColor: isDarkMode ? '#7F1D1D' : '#FCC' }]}>
                <Text style={[styles.errorText, { color: isDarkMode ? '#FCA5A5' : '#DC3545' }]}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }, (loading || code.length < 6) && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading || code.length < 6}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Verify OTP</Text>}
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={[styles.resendText, { color: theme.subtext }]}>Didn't receive the code? </Text>
              {timer > 0 ? (
                <Text style={[styles.timerText, { color: theme.subtext }]}>Resend in {formatTime(timer)}</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={loading}>
                  <Text style={[styles.resendLink, { color: theme.primary }]}>Resend</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  backButton: { marginBottom: 30, paddingVertical: 8, paddingRight: 16, alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontWeight: '500' },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  form: { marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  input: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 16 },
  errorContainer: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  errorText: { fontSize: 14 },
  button: { borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  resendText: { fontSize: 14 },
  timerText: { fontSize: 14, fontWeight: '500' },
  resendLink: { fontSize: 14, fontWeight: '700' },
});

export default ResetPasswordOtpScreen;
