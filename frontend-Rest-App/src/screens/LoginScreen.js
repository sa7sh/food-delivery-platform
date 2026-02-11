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
import { sendOtp, verifyOtp } from '../services/api'; // Direct import if context doesn't expose it yet (but checking context first)
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';

const LoginScreen = ({ navigation }) => {
  const { login, sendOTP, verifyOTP, loading, error } = useAuth();
  const { theme, isDarkMode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendEnabled, setResendEnabled] = useState(true);

  // Timer logic
  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setResendEnabled(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (loginMode === 'password') {
      if (!password.trim()) {
        Alert.alert('Error', 'Please enter your password');
        return;
      }

      const result = await login(email, password);
      if (!result.success) {
        Alert.alert('Login Failed', result.error);
      }

    } else {
      // OTP Mode
      if (!otpSent) {
        // Send OTP
        const result = await sendOTP(email);
        if (result.success) {
          setOtpSent(true);
          setTimer(30);
          setResendEnabled(false);
          Alert.alert('OTP Sent', 'Please check your email.');
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        // Verify OTP
        if (!otp.trim() || otp.length !== 6) {
          Alert.alert('Error', 'Please enter a valid 6-digit OTP');
          return;
        }
        const result = await verifyOTP(email, otp);
        if (!result.success) {
          Alert.alert('Verification Failed', result.error);
        }
      }
    }
  };

  const handleResendOtp = async () => {
    const result = await sendOTP(email);
    if (result.success) {
      setTimer(30);
      setResendEnabled(false);
      Alert.alert('OTP Resent', 'Please check your email.');
    } else {
      Alert.alert('Error', result.error);
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
            {/* Login Mode Toggle */}
            <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: theme.inputBg, borderRadius: 8, padding: 4 }}>
              <TouchableOpacity
                onPress={() => { setLoginMode('password'); setOtpSent(false); }}
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: loginMode === 'password' ? theme.background : 'transparent', borderRadius: 6, opacity: loginMode === 'password' ? 1 : 0.6 }}
              >
                <Text style={{ fontWeight: '600', color: theme.text }}>Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setLoginMode('otp'); }}
                style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: loginMode === 'otp' ? theme.background : 'transparent', borderRadius: 6, opacity: loginMode === 'otp' ? 1 : 0.6 }}
              >
                <Text style={{ fontWeight: '600', color: theme.text }}>OTP Login</Text>
              </TouchableOpacity>
            </View>

            {/* Email/Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text }]}
                placeholder="Enter email address"
                placeholderTextColor={theme.subtext}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading && (!otpSent || loginMode === 'password')}
              />
            </View>

            {loginMode === 'password' ? (
              /* Password Input */
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
            ) : (
              /* OTP Input */
              <>
                {otpSent && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Enter OTP</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, letterSpacing: 4, fontWeight: 'bold' }]}
                      placeholder="XXXXXX"
                      placeholderTextColor={theme.subtext}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="numeric"
                      maxLength={6}
                      editable={!loading}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                      {timer > 0 ? (
                        <Text style={{ color: theme.subtext }}>Resend in {timer}s</Text>
                      ) : (
                        <TouchableOpacity onPress={handleResendOtp} disabled={!resendEnabled || loading}>
                          <Text style={{ color: theme.primary, fontWeight: '600' }}>Resend OTP</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}

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
                <Text style={styles.loginButtonText}>
                  {loginMode === 'password' ? "Login" : (otpSent ? "Verify & Login" : "Send OTP")}
                </Text>
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