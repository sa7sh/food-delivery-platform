import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions,
  ActivityIndicator, Alert, Image, StatusBar, Animated, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDeliveryAuthStore } from '../store/authStore';
import { API_URL } from '../constants/Config';

const { width, height } = Dimensions.get('window');
const AUTH_URL = `${API_URL}/auth/delivery`;

// ─── Progress Bar for Registration ───────────────────────────────────────────
const ProgressBar = ({ step }) => (
  <View style={styles.progressContainer}>
    {[1, 2, 3].map((item, index) => (
      <React.Fragment key={item}>
        <View style={[styles.stepNode, step >= item ? styles.stepNodeActive : styles.stepNodeInactive]}>
          <Text style={[styles.stepNodeText, step >= item ? { color: '#fff' } : { color: '#b2bec3' }]}>{item}</Text>
        </View>
        {index < 2 && <View style={[styles.stepLine, step > item ? styles.stepLineActive : styles.stepLineInactive]} />}
      </React.Fragment>
    ))}
  </View>
);

// ─── Form Input for Registration ─────────────────────────────────────────────
const FormInput = ({ label, icon, placeholder, value, field, updateField, keyboardType = 'default' }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputBox}>
      <MaterialCommunityIcons name={icon} size={20} color="#9139BA" />
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        placeholderTextColor="#b2bec3"
        value={value}
        onChangeText={(val) => updateField(field, val)}
        keyboardType={keyboardType}
        autoCorrect={false}
      />
    </View>
  </View>
);

// ─── Upload Card ──────────────────────────────────────────────────────────────
const UploadCard = ({ label, field, icon, subtext, imageUri, onPick }) => (
  <TouchableOpacity style={[styles.uploadCard, imageUri && styles.uploadCardActive]} onPress={() => onPick(field)}>
    <View style={[styles.uploadIconCircle, imageUri && { backgroundColor: '#9139BA' }]}>
      <MaterialCommunityIcons name={icon} size={24} color={imageUri ? "#fff" : "#9139BA"} />
    </View>
    <View style={{ flex: 1, marginLeft: 15 }}>
      <Text style={styles.uploadTitle}>{label}</Text>
      <Text style={styles.uploadSubtext}>{imageUri ? "Image Selected ✓" : subtext}</Text>
    </View>
    <MaterialCommunityIcons
      name={imageUri ? "check-circle" : "plus-circle"}
      size={24}
      color={imageUri ? "#27ae60" : "#dfe6e9"}
    />
  </TouchableOpacity>
);

// ─── COUNTRIES ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
];

// ─── MAIN AUTH SCREEN ─────────────────────────────────────────────────────────
export default function AuthScreen({ navigation }) {
  const login = useDeliveryAuthStore((s) => s.login);
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('phone');
  const [showPassword, setShowPassword] = useState(false);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpMode, setOtpMode] = useState('password'); // 'password' or 'otp'
  const [otp, setOtp] = useState('');

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', vehicle: '',
    aadhaar: '', pan: '',
    bankName: '', accountNum: '', ifsc: '',
    aadhaarImage: null, panImage: null, rcImage: null
  });

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const pickImage = async (field) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) updateField(field, result.assets[0].uri);
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleRegister = async () => {
    if (!formData.pan || !formData.bankName || !formData.accountNum) {
      Alert.alert("Error", "Please fill all required bank and PAN details.");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      if (formData.email) data.append('email', formData.email);
      if (formData.password) data.append('password', formData.password);
      data.append('vehicle', formData.vehicle);
      data.append('aadhaarNumber', formData.aadhaar);
      data.append('panNumber', formData.pan);
      data.append('bankName', formData.bankName);
      data.append('accountNumber', formData.accountNum);
      data.append('ifscCode', formData.ifsc);

      if (formData.aadhaarImage) data.append('aadhaarImage', { uri: formData.aadhaarImage, name: 'aadhaar.jpg', type: 'image/jpeg' });
      if (formData.panImage) data.append('panImage', { uri: formData.panImage, name: 'pan.jpg', type: 'image/jpeg' });
      if (formData.rcImage) data.append('rcImage', { uri: formData.rcImage, name: 'rc.jpg', type: 'image/jpeg' });

      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
        body: data,
      });
      const result = await response.json();
      if (result.success) {
        login(result.token, result.partner);
        setStep(4);
      } else {
        Alert.alert("Registration Failed", result.message || "Please check your details");
      }
    } catch (e) {
      Alert.alert("Connection Error", "Cannot reach the server. Ensure your backend is running and you're on the same Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) return Alert.alert("Error", "Please enter your email");
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const result = await response.json();
      if (result.success) {
        setIsOtpSent(true);
        Alert.alert("Success", "OTP sent to your email");
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (e) {
      Alert.alert("Error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return Alert.alert("Error", "Please enter the OTP");
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });
      const result = await response.json();
      if (result.success) {
        login(result.token, result.partner);
        navigation.replace('Main');
      } else {
        Alert.alert("Verification Failed", result.message);
      }
    } catch (e) {
      Alert.alert("Error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    animatePress();
    if (loginMethod === 'email' && otpMode === 'otp') {
      if (isOtpSent) {
        return handleVerifyOtp();
      } else {
        return handleSendOtp();
      }
    }

    let payload = {};
    if (loginMethod === 'phone') {
      if (!formData.phone) return Alert.alert("Error", "Please enter your phone number");
      payload = { phone: formData.phone };
    } else {
      if (!formData.email || !formData.password) return Alert.alert("Error", "Please enter email and password");
      payload = { email: formData.email, password: formData.password };
    }
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        login(result.token, result.partner);
        navigation.replace('Main');
      } else {
        Alert.alert("Login Failed", result.message);
      }
    } catch (e) {
      Alert.alert("Error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER LOGIN ───────────────────────────────────────────────────────────
  const renderLogin = () => (
    <>
      {/* Hero Section */}
      <View style={styles.loginHero}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.logoCircle}>
          <Image source={require('../assets/logo.png')} style={styles.heroLogo} resizeMode="cover" />
        </View>
        <Text style={styles.heroTitle}>Partner Login</Text>
        <Text style={styles.heroSub}>Driving with Treato Go</Text>
      </View>

      {/* Bottom Card */}
      <View style={styles.loginCard}>
        {/* Method Toggle */}
        <View style={styles.methodToggleWrapper}>
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[styles.methodTab, loginMethod === 'phone' && styles.methodTabActive]}
              onPress={() => setLoginMethod('phone')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="phone" size={15} color={loginMethod === 'phone' ? '#fff' : '#888'} />
              <Text style={[styles.methodTabText, loginMethod === 'phone' && styles.methodTabTextActive]}>Phone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodTab, loginMethod === 'email' && styles.methodTabActive]}
              onPress={() => setLoginMethod('email')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="email" size={15} color={loginMethod === 'email' ? '#fff' : '#888'} />
              <Text style={[styles.methodTabText, loginMethod === 'email' && styles.methodTabTextActive]}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loginMethod === 'phone' ? (
          <>
            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <View style={styles.phoneInputRow}>
              {/* Country Code Pill — tappable */}
              <TouchableOpacity style={styles.countryCodePill} onPress={() => setCountryPickerVisible(true)} activeOpacity={0.7}>
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                <MaterialCommunityIcons name="chevron-down" size={14} color="#888" />
              </TouchableOpacity>
              <View style={styles.phoneDivider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="Mobile number"
                placeholderTextColor="#c4b5d6"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(val) => updateField('phone', val)}
                maxLength={10}
              />
            </View>
            <Text style={styles.loginHint}>
              <MaterialCommunityIcons name="shield-check-outline" size={12} color="#9139BA" /> Your number is safe with us
            </Text>

            {/* Country Picker Modal */}
            <Modal
              visible={countryPickerVisible}
              transparent
              animationType="slide"
              onRequestClose={() => setCountryPickerVisible(false)}
            >
              <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCountryPickerVisible(false)}>
                <View style={styles.pickerSheet}>
                  <View style={styles.pickerHandle} />
                  <Text style={styles.pickerTitle}>Select Country</Text>
                  <FlatList
                    data={COUNTRIES}
                    keyExtractor={(item) => item.code}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.countryRow, selectedCountry.code === item.code && styles.countryRowSelected]}
                        onPress={() => { setSelectedCountry(item); setCountryPickerVisible(false); }}
                      >
                        <Text style={styles.countryRowFlag}>{item.flag}</Text>
                        <Text style={styles.countryRowName}>{item.name}</Text>
                        <Text style={styles.countryRowCode}>{item.code}</Text>
                        {selectedCountry.code === item.code && (
                          <MaterialCommunityIcons name="check-circle" size={18} color="#9139BA" />
                        )}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.darkInput}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#9139BA" />
              <TextInput
                style={styles.darkInputField}
                placeholder="name@example.com"
                placeholderTextColor="#555"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(val) => {
                  updateField('email', val);
                  if (isOtpSent) setIsOtpSent(false); // Reset if email changes
                }}
                editable={!isOtpSent}
              />
            </View>

            {otpMode === 'password' ? (
              <>
                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Password</Text>
                <View style={styles.darkInput}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#9139BA" />
                  <TextInput
                    style={styles.darkInputField}
                    placeholder="Enter password"
                    placeholderTextColor="#555"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={(val) => updateField('password', val)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                    <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#555" />
                  </TouchableOpacity>
                </View>
                <View style={styles.emailOptionsRow}>
                  <TouchableOpacity onPress={() => setOtpMode('otp')}>
                    <Text style={styles.otpToggleText}>Login with OTP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {isOtpSent && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Enter OTP</Text>
                    <View style={styles.darkInput}>
                      <MaterialCommunityIcons name="shield-check-outline" size={20} color="#9139BA" />
                      <TextInput
                        style={styles.darkInputField}
                        placeholder="6-digit OTP"
                        placeholderTextColor="#555"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                      />
                    </View>
                  </>
                )}
                <View style={styles.emailOptionsRow}>
                  <TouchableOpacity onPress={() => {
                    setOtpMode('password');
                    setIsOtpSent(false);
                  }}>
                    <Text style={styles.otpToggleText}>Login with Password</Text>
                  </TouchableOpacity>
                  {isOtpSent && (
                    <TouchableOpacity onPress={handleSendOtp}>
                      <Text style={styles.forgotText}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </>
        )}

        {/* Login Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 28 }}>
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>
                  {loginMethod === 'phone' ? 'Continue' :
                    (otpMode === 'otp' ? (isOtpSent ? 'Verify & Login' : 'Send OTP') : 'Log In')}
                </Text>
                <View style={styles.loginBtnArrow}>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#9139BA" />
                </View>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>New partner?</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.registerLink} onPress={() => { setIsLogin(false); setStep(1); }}>
          <Text style={styles.registerLinkText}>Register with Treato Go</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#9139BA" />
        </TouchableOpacity>
      </View>
    </>
  );

  // ─── FULL SCREEN ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {isLogin ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.loginScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {renderLogin()}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <SafeAreaView style={styles.regContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Registration Header */}
              <View style={styles.header}>
                <View style={styles.headerTop}>
                  <Image source={require('../assets/logo.png')} style={[styles.logoImage, { width: 160, height: 60 }]} resizeMode="contain" />
                </View>
                {step < 4 && <ProgressBar step={step} />}
              </View>

              <View>
                {step === 1 && (
                  <View style={styles.card}>
                    <Text style={styles.stepTitle}>Let's get started</Text>
                    <Text style={styles.stepSub}>Basic info for your account</Text>
                    <FormInput label="Full Name" icon="account-tie-outline" placeholder="Enter full name" value={formData.name} field="name" updateField={updateField} />
                    <FormInput label="Phone" icon="phone-outline" placeholder="Mobile number" keyboardType="phone-pad" value={formData.phone} field="phone" updateField={updateField} />
                    <FormInput label="Email" icon="email-outline" placeholder="Email Address" keyboardType="email-address" value={formData.email} field="email" updateField={updateField} />
                    <FormInput label="Password" icon="lock-outline" placeholder="Create Password" value={formData.password} field="password" updateField={updateField} />
                    <FormInput label="Vehicle" icon="moped-outline" placeholder="e.g. Activa 6G" value={formData.vehicle} field="vehicle" updateField={updateField} />
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep(2)}>
                      <Text style={styles.primaryBtnText}>Continue</Text>
                      <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                  </View>
                )}

                {step === 2 && (
                  <View style={styles.card}>
                    <Text style={styles.stepTitle}>Verification</Text>
                    <Text style={styles.stepSub}>Step 2: Legal Documents</Text>
                    <FormInput label="Aadhaar Number" icon="numeric" placeholder="12-digit number" keyboardType="numeric" value={formData.aadhaar} field="aadhaar" updateField={updateField} />
                    <UploadCard label="Aadhaar Photo" field="aadhaarImage" imageUri={formData.aadhaarImage} onPick={pickImage} subtext="Upload front view" icon="card-account-details-outline" />
                    <UploadCard label="PAN Photo" field="panImage" imageUri={formData.panImage} onPick={pickImage} subtext="Clear front image" icon="file-image-outline" />
                    <UploadCard label="Vehicle RC" field="rcImage" imageUri={formData.rcImage} onPick={pickImage} subtext="Registration Certificate" icon="book-open-outline" />
                    <View style={styles.btnRow}>
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(1)}>
                        <Text style={styles.secondaryBtnText}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.primaryBtn, { flex: 2, marginTop: 0 }]} onPress={() => setStep(3)}>
                        <Text style={styles.primaryBtnText}>Next Step</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {step === 3 && (
                  <View style={styles.card}>
                    <Text style={styles.stepTitle}>Payout Details</Text>
                    <Text style={styles.stepSub}>Final step for registration</Text>
                    <FormInput label="PAN Card Number" icon="card-bulleted-outline" placeholder="ABCDE1234F" value={formData.pan} field="pan" updateField={updateField} />
                    <FormInput label="Bank Name" icon="bank-outline" placeholder="HDFC, SBI, etc." value={formData.bankName} field="bankName" updateField={updateField} />
                    <FormInput label="Account Number" icon="numeric" placeholder="Enter number" keyboardType="numeric" value={formData.accountNum} field="accountNum" updateField={updateField} />
                    <FormInput label="IFSC Code" icon="alphabetical" placeholder="IFSC Code" value={formData.ifsc} field="ifsc" updateField={updateField} />
                    <View style={styles.btnRow}>
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStep(2)}>
                        <Text style={styles.secondaryBtnText}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.primaryBtn, { flex: 2, marginTop: 0, backgroundColor: '#1A1A1A' }]} onPress={handleRegister}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Submit Application</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {step === 4 && (
                  <View style={styles.pendingContainer}>
                    <View style={styles.premiumStatusBox}>
                      <MaterialCommunityIcons name="shield-check" size={80} color="#9139BA" />
                    </View>
                    <Text style={styles.pendingTitle}>Under Review</Text>
                    <Text style={styles.pendingDescription}>We've received your application. Our team will verify it within 24 hours.</Text>
                    <TouchableOpacity style={styles.doneBtn} onPress={() => { setIsLogin(true); setStep(1) }}>
                      <Text style={styles.doneBtnText}>Finish</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {step < 4 && (
                <TouchableOpacity style={styles.footerLink} onPress={() => { setIsLogin(true); setStep(1); }}>
                  <Text style={styles.footerLinkText}>
                    Already registered? <Text style={styles.footerLinkBold}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

  // ─── LOGIN ──────────────────────────────────────────────────────────────────
  loginScroll: { flexGrow: 1 },

  loginHero: {
    height: height * 0.38,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#9139BA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  heroLogo: {
    width: 140,
    height: 140,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  loginCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: '#ede8f5',
    shadowColor: '#9139BA',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },

  // Method toggle
  methodToggleWrapper: { alignItems: 'center', marginBottom: 24 },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f2f6',
    borderRadius: 14,
    padding: 4,
    width: '74%',
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  methodTabActive: {
    backgroundColor: '#9139BA',
  },
  methodTabText: { fontSize: 14, fontWeight: '700', color: '#aaa' },
  methodTabTextActive: { color: '#fff' },

  // Field label
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9139BA',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },

  // Phone Input
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#eee',
    paddingHorizontal: 14,
    height: 64,
  },
  phoneInputRowFocused: {
    borderColor: '#9139BA',
    shadowColor: '#9139BA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  countryCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingRight: 12,
  },
  countryFlag: { fontSize: 22 },
  countryCode: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  phoneDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e0d4f0',
    marginRight: 14,
  },
  phoneInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 1.5,
  },
  loginHint: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 10,
    fontWeight: '500',
  },

  // Light input (email/pass)
  darkInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#eee',
    paddingHorizontal: 16,
    height: 58,
    gap: 12,
  },
  darkInputField: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  forgotText: {
    color: '#9139BA',
    fontWeight: '600',
    fontSize: 13,
  },
  emailOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  otpToggleText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 13,
  },

  // Login button
  loginBtn: {
    height: 62,
    backgroundColor: '#9139BA',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#9139BA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginRight: 10,
  },
  loginBtnArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ede8f5' },
  dividerText: { fontSize: 12, color: '#aaa', fontWeight: '600' },

  // Register link
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 54,
    borderWidth: 1,
    borderColor: '#eee',
  },
  registerLinkText: {
    color: '#9139BA',
    fontWeight: '700',
    fontSize: 14,
  },

  // ─── REGISTRATION ───────────────────────────────────────────────────────────
  regContainer: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollContent: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: 240, height: 100 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25 },
  stepNode: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNodeActive: { backgroundColor: '#9139BA' },
  stepNodeInactive: { backgroundColor: '#f1f2f6' },
  stepNodeText: { fontSize: 12, fontWeight: '900' },
  stepLine: { width: 40, height: 3, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#9139BA' },
  stepLineInactive: { backgroundColor: '#f1f2f6' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#b1adad', shadowOpacity: 0.05, shadowRadius: 10 },
  stepTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
  stepSub: { fontSize: 14, color: '#95a5a6', marginBottom: 25, marginTop: 4 },
  inputWrapper: { marginBottom: 18 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#9139BA', marginBottom: 8, marginLeft: 4 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdfbff', borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: '#f5f0fa' },
  inputField: { flex: 1, marginLeft: 12, fontSize: 16, color: '#2d3436', fontWeight: '600' },
  uploadCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f0fa', padding: 15, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: '#9139BA', marginBottom: 15 },
  uploadCardActive: { borderStyle: 'solid', backgroundColor: '#fff' },
  uploadIconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f5f0fa', justifyContent: 'center', alignItems: 'center' },
  uploadTitle: { fontSize: 14, fontWeight: '700', color: '#2d3436' },
  uploadSubtext: { fontSize: 12, color: '#95a5a6' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  primaryBtn: { backgroundColor: '#9139BA', height: 60, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { flex: 1, backgroundColor: '#fdfbff', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f5f0fa' },
  secondaryBtnText: { color: '#9139BA', fontSize: 16, fontWeight: '800' },
  footerLink: { marginTop: 30, alignItems: 'center' },
  footerLinkText: { color: '#95a5a6' },
  footerLinkBold: { color: '#9139BA', fontWeight: '900' },
  pendingContainer: { alignItems: 'center', marginTop: 50 },
  premiumStatusBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#6C63FF', shadowOpacity: 0.2, shadowRadius: 15, marginBottom: 25 },
  pendingTitle: { fontSize: 28, fontWeight: '900', color: '#1A1A1A' },
  pendingDescription: { textAlign: 'center', color: '#7f8c8d', paddingHorizontal: 30, marginTop: 10, lineHeight: 22 },
  doneBtn: { width: '100%', backgroundColor: '#1A1A1A', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // ─── Country Picker Modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 34,
    maxHeight: '65%',
  },
  pickerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f0fa',
    gap: 12,
  },
  countryRowSelected: {
    backgroundColor: '#faf7ff',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  countryRowFlag: { fontSize: 24 },
  countryRowName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  countryRowCode: { fontSize: 14, color: '#9139BA', fontWeight: '700' },
});
