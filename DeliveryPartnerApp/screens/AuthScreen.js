import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Dimensions, ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDeliveryAuthStore } from '../store/authStore';
import { API_URL } from '../constants/Config';

const { width } = Dimensions.get('window');
// API_URL is now imported
const AUTH_URL = `${API_URL}/auth/delivery`;

// --- EXTERNAL COMPONENTS (Prevents keyboard focus loss on re-render) ---

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

// --- MAIN AUTH SCREEN ---

export default function AuthScreen({ navigation }) {
  const login = useDeliveryAuthStore((s) => s.login);
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'

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

  const handleRegister = async () => {
    // Basic validation
    if (!formData.pan || !formData.bankName || !formData.accountNum) {
      Alert.alert("Error", "Please fill all required bank and PAN details.");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      // EXPLICIT MAPPING: This ensures the backend gets the keys it expects
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      if (formData.email) data.append('email', formData.email);
      if (formData.password) data.append('password', formData.password);
      data.append('vehicle', formData.vehicle);
      data.append('aadhaarNumber', formData.aadhaar);
      data.append('panNumber', formData.pan); // Matches backend req.body.panNumber
      data.append('bankName', formData.bankName);
      data.append('accountNumber', formData.accountNum);
      data.append('ifscCode', formData.ifsc);

      // Add Images with correct structure for Multer
      if (formData.aadhaarImage) {
        data.append('aadhaarImage', {
          uri: formData.aadhaarImage,
          name: 'aadhaar.jpg',
          type: 'image/jpeg'
        });
      }
      if (formData.panImage) {
        data.append('panImage', {
          uri: formData.panImage,
          name: 'pan.jpg',
          type: 'image/jpeg'
        });
      }
      if (formData.rcImage) {
        data.append('rcImage', {
          uri: formData.rcImage,
          name: 'rc.jpg',
          type: 'image/jpeg'
        });
      }

      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        // Persist auth state via Zustand store (handles AsyncStorage automatically)
        login(result.token, result.partner);
        setStep(4);
      } else {
        Alert.alert("Registration Failed", result.message || "Please check your details");
      }
    } catch (e) {
      console.log("Fetch Error:", e);
      Alert.alert("Connection Error", "Cannot reach the server. Ensure your backend is running and you're on the same Wi-Fi.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    let payload = {};
    if (loginMethod === 'phone') {
      if (!formData.phone) return Alert.alert("Error", "Please enter phone number");
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            {!isLogin && step < 4 && <ProgressBar step={step} />}
          </View>

          {isLogin ? (
            <View style={styles.card}>
              <Text style={styles.stepTitle}>Welcome Back</Text>
              <Text style={styles.stepSub}>Sign in to your partner dashboard</Text>

              {/* Login Method Toggle */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleBtn, loginMethod === 'phone' && styles.toggleBtnActive]}
                  onPress={() => setLoginMethod('phone')}
                >
                  <Text style={[styles.toggleText, loginMethod === 'phone' && styles.toggleTextActive]}>Phone</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, loginMethod === 'email' && styles.toggleBtnActive]}
                  onPress={() => setLoginMethod('email')}
                >
                  <Text style={[styles.toggleText, loginMethod === 'email' && styles.toggleTextActive]}>Email</Text>
                </TouchableOpacity>
              </View>

              {loginMethod === 'phone' ? (
                <FormInput label="Phone Number" icon="phone-outline" placeholder="+91 00000 00000" keyboardType="phone-pad" value={formData.phone} field="phone" updateField={updateField} />
              ) : (
                <>
                  <FormInput label="Email Address" icon="email-outline" placeholder="name@example.com" keyboardType="email-address" value={formData.email} field="email" updateField={updateField} />
                  <FormInput label="Password" icon="lock-outline" placeholder="Enter password" value={formData.password} field="password" updateField={updateField} />
                </>
              )}

              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Log In</Text>}
              </TouchableOpacity>
            </View>
          ) : (
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
          )}

          {step < 4 && (
            <TouchableOpacity style={styles.footerLink} onPress={() => { setIsLogin(!isLogin); setStep(1); }}>
              <Text style={styles.footerLinkText}>
                {isLogin ? "New to Treato? " : "Already registered? "}
                <Text style={styles.footerLinkBold}>{isLogin ? 'Register Now' : 'Sign In'}</Text>
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  scrollContent: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // This centers the group horizontally
    width: '100%',            // Ensures it takes full width to find the center
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#9139BA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoImage: {
    width: 180,
    height: 120,
  },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#f5f0fa' },
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
  toggleRow: { flexDirection: 'row', backgroundColor: '#f5f0fa', borderRadius: 12, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleBtnActive: { backgroundColor: '#fff', elevation: 2 },
  toggleText: { fontWeight: '700', color: '#95a5a6' },
  toggleTextActive: { color: '#9139BA' }
});