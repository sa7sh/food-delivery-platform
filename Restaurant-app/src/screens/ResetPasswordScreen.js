import React, { useState } from 'react';
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

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params || { email: '' };
  const { handleResetPassword, loading, error } = useAuth();
  const { theme, isDarkMode } = useTheme();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    const result = await handleResetPassword(email, password);
    if (result.success) {
      Alert.alert('Success', 'Your password has been reset successfully.', [
        {
          text: 'Login',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]);
    } else {
      Alert.alert('Error', result.error || 'Failed to reset password');
    }
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
            <Text style={[styles.title, { color: theme.text }]}>Create New Password</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Your new password must be at least 8 characters long and different from previous passwords.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.subtext}
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
                  <Text style={[styles.eyeIconText, { color: theme.subtext }]}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.subtext}
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

            {(error || validationError) ? (
              <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#7F1D1D33' : '#FEE', borderColor: isDarkMode ? '#7F1D1D' : '#FCC' }]}>
                <Text style={[styles.errorText, { color: isDarkMode ? '#FCA5A5' : '#DC3545' }]}>{error || validationError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }, (loading || password.length < 8 || password !== confirmPassword) && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading || password.length < 8 || password !== confirmPassword}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
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
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  passwordContainer: { position: 'relative' },
  passwordInput: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, paddingRight: 48, fontSize: 16 },
  eyeIcon: { position: 'absolute', right: 16, top: 14 },
  eyeIconText: { fontSize: 14 },
  errorContainer: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16 },
  errorText: { fontSize: 14 },
  button: { borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default ResetPasswordScreen;
