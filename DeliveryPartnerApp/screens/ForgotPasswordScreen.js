import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../constants/Config';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (result.success) {
        Alert.alert('Email Sent', 'If an account exists with this email, you will receive a verification code.', [
          { text: 'OK', onPress: () => navigation.navigate('ResetPasswordOtp', { email }) },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to send reset email');
      }
    } catch (e) {
      console.log('Forgot Password Error:', e);
      Alert.alert('Connection Error', 'Cannot reach the server. Ensure your backend is running.');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered email address to receive a verification code.
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputBox}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#9139BA" />
                <TextInput
                  style={styles.inputField}
                  placeholder="name@example.com"
                  placeholderTextColor="#b2bec3"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Send Instructions</Text>}
            </TouchableOpacity>
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
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#9139BA', marginBottom: 8, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdfbff', borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: '#f5f0fa' },
  inputField: { flex: 1, marginLeft: 12, fontSize: 16, color: '#2d3436', fontWeight: '600' },
  primaryBtn: { backgroundColor: '#9139BA', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  btnDisabled: { opacity: 0.7 },
});
