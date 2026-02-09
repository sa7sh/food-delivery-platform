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
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

const LoginScreen = ({ navigation }) => {
  const { login, loading, error } = useAuth();
  const { theme, isDarkMode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    // Simple validation
    if (!email.includes('@') && email.length < 3) {
      // Very basic check, mainly relying on backend
      // or we could just skip client side validation for format
    }

    // Call login
    const result = await login(email, password);

    console.log("Login result:", result);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.jpg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Restaurant Partner</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Manage your restaurant with ease</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email/Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email or Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                placeholder="Enter email or phone number"
                placeholderTextColor={theme.subtext}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, { backgroundColor: theme.inputBg, color: theme.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.subtext}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={[styles.eyeIconText, { color: theme.subtext }]}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.primary }, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Registration Link - Outside form, more prominent */}
          <View style={styles.registerLinkContainer}>
            <Text style={[styles.registerLinkText, { color: theme.subtext }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Registration')}
              disabled={loading}
            >
              <Text style={[styles.registerLink, { color: theme.primary }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* OR Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.subtext }]} />
            <Text style={[styles.dividerText, { color: theme.subtext }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.subtext }]} />
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.createAccountButton, { borderColor: theme.primary }]}
            onPress={() => navigation.navigate('Registration')}
            disabled={loading}
          >
            <Text style={[styles.createAccountButtonText, { color: theme.primary }]}>Create New Account</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>By logging in, you agree to our</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.linkText}>Terms & Conditions</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> and </Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Text */}
          <View style={styles.help}>
            <Text style={styles.helpText}>Need help? Contact support</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#2D2D2D',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#2D2D2D',
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    color: '#2D2D2D',
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  eyeIconText: {
    fontSize: 14,
    color: '#6C757D',
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderWidth: 1,
    borderColor: '#FCC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC3545',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#9139BA',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerLinkText: {
    color: '#6C757D',
    fontSize: 14,
  },
  registerLink: {
    color: '#9139BA',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6C757D',
    fontSize: 14,
    fontWeight: '500',
  },
  createAccountButton: {
    borderWidth: 2,
    borderColor: '#9139BA',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  createAccountButtonText: {
    color: '#9139BA',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#6C757D',
    fontSize: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: 4,
  },
  linkText: {
    color: '#9139BA',
    fontSize: 12,
    fontWeight: '600',
  },
  help: {
    alignItems: 'center',
    marginTop: 24,
  },
  helpText: {
    color: '#ADB5BD',
    fontSize: 12,
  },
});

export default LoginScreen;