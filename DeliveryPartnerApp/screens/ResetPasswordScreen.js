import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../constants/Config';

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params || { email: '' };
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (result.success) {
        Alert.alert('Success', 'Your password has been reset successfully.', [
          {
            text: 'Login',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to reset password');
      }
    } catch (e) {
      console.log('Reset Password Error:', e);
      Alert.alert('Connection Error', 'Cannot reach the server.');
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
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be at least 8 characters long.
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputBox}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#9139BA" />
                <TextInput
                  style={styles.inputField}
                  placeholder="••••••••"
                  placeholderTextColor="#b2bec3"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (validationError) setValidationError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#b2bec3" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputBox}>
                <MaterialCommunityIcons name="lock-check-outline" size={20} color="#9139BA" />
                <TextInput
                  style={styles.inputField}
                  placeholder="••••••••"
                  placeholderTextColor="#b2bec3"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (validationError) setValidationError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            {validationError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{validationError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryBtn, (loading || password.length < 8 || password !== confirmPassword) && styles.btnDisabled]}
              onPress={handleReset}
              disabled={loading || password.length < 8 || password !== confirmPassword}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Reset Password</Text>}
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
  eyeIcon: { padding: 5 },
  errorContainer: { backgroundColor: '#FEE', borderWidth: 1, borderColor: '#FCC', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  errorText: { color: '#DC3545', fontSize: 14 },
  primaryBtn: { backgroundColor: '#9139BA', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  btnDisabled: { opacity: 0.7 },
});
