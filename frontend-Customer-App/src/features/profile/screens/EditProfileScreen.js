import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../store/authStore';
import { useUserStore } from '../../../store/userStore';
import { useTheme } from '../../../hooks/useTheme';

const CustomInput = ({ label, icon, value, onChangeText, error, placeholder, colors, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.textSub }]}>{label}</Text>
      <View style={[
        styles.inputContainer,
        { borderColor: colors.border, backgroundColor: colors.surfaceHighlight },
        isFocused && { borderColor: colors.primary[500], backgroundColor: colors.surface },
        error && { borderColor: colors.error }
      ]}>
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? colors.primary[500] : colors.icon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSub}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          selectionColor={colors.primary[500]}
          {...props}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { updateProfile, isLoading, profile, fetchProfile } = useUserStore();
  const { colors, isDark } = useTheme();

  const [formData, setFormData] = useState({
    name: profile?.name || user?.name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || user?.phone || '',
    profileImage: profile?.profileImage || user?.profileImage || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditPhoto = async () => {
    const showImagePicker = async (sourceType) => {
      try {
        // Request permissions
        if (sourceType === 'camera') {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
            return;
          }
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
            return;
          }
        }

        // Launch picker
        const result = sourceType === 'camera'
          ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
          })
          : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
          });

        if (!result.canceled && result.assets[0]) {
          const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
          setFormData({ ...formData, profileImage: base64Img });
        }
      } catch (error) {
        console.error('Image picker error:', error);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    };

    // Show options for iOS and Android
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            showImagePicker('camera');
          } else if (buttonIndex === 2) {
            showImagePicker('gallery');
          }
        }
      );
    } else {
      Alert.alert(
        'Update Profile Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => showImagePicker('camera') },
          { text: 'Choose from Gallery', onPress: () => showImagePicker('gallery') },
        ],
        { cancelable: true }
      );
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    const result = await updateProfile(formData);

    if (result.success) {
      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'Great', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Update Failed', result.error || 'Something went wrong.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.headerArea, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={isLoading} style={styles.headerAction}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={[styles.saveText, { color: colors.primary[500] }]}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Modern Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              {formData.profileImage ? (
                <Image source={{ uri: formData.profileImage }} style={[styles.avatarSquircle, { borderColor: colors.surface }]} />
              ) : (
                <View style={[styles.avatarSquircle, { backgroundColor: colors.primary[100], borderColor: colors.surface }]}>
                  <Text style={[styles.avatarLetter, { color: colors.primary[500] }]}>
                    {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={[styles.cameraFab, { backgroundColor: colors.primary[500], borderColor: colors.surface }]} activeOpacity={0.9} onPress={handleEditPhoto}>
                <Ionicons name="camera-reverse" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.changePhotoText, { color: colors.primary[500] }]}>Change Profile Photo</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
            <CustomInput
              label="Full Name"
              icon="person-outline"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="John Doe"
              error={errors.name}
              colors={colors}
            />

            <CustomInput
              label="Email Address"
              icon="mail-outline"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              colors={colors}
            />

            <CustomInput
              label="Phone Number"
              icon="call-outline"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              error={errors.phone}
              colors={colors}
            />
          </View>

          <TouchableOpacity
            style={[styles.mainSubmitBtn, { backgroundColor: colors.primary[500], shadowColor: colors.primary[500] }]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  saveText: { fontSize: 16, fontWeight: '700' },
  scrollContent: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrapper: { position: 'relative' },
  avatarSquircle: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  avatarLetter: { fontSize: 42, fontWeight: '900' },
  cameraFab: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  changePhotoText: { marginTop: 12, fontSize: 14, fontWeight: '600' },
  formCard: {
    borderRadius: 24,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 56,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600' },
  errorText: { fontSize: 12, marginTop: 6, fontWeight: '500', marginLeft: 4 },
  mainSubmitBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});