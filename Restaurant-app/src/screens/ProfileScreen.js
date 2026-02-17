import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  InteractionManager,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { updateRestaurantProfile, uploadFoodImage } from '../services/api.js';
import CustomButton from '../components/CustomButton.js';
import CustomToggle from '../components/CustomToggle.js';
import { validateProfile } from '../utils/validators.js';

const ProfileScreen = ({ navigation }) => {
  const { restaurant, updateRestaurantData, logout, deleteAccount } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    phone: restaurant?.phone || '',
    address: restaurant?.address || '',
    cuisineType: restaurant?.cuisineType || '',
    isOpen: restaurant?.isOpen || false,
    profileImage: restaurant?.profileImage || null,        // Personal
    restaurantImage: restaurant?.restaurantImage || null,  // Business
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerType, setImagePickerType] = useState(null); // 'profile' or 'restaurant'

  const requestPermissions = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to take photos');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return false;
      }
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions('gallery');
      setShowImagePicker(false);

      if (!hasPermission) return;

      InteractionManager.runAfterInteractions(async () => {
        try {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio for profile
            quality: 0.8,
          });

          if (!result.canceled && result.assets && result.assets[0]) {
            // Simulate upload or just use local URI
            const uploadResult = await uploadFoodImage(result.assets[0].uri);
            // Update the correct field based on imagePickerType
            const fieldName = imagePickerType === 'profile' ? 'profileImage' : 'restaurantImage';
            console.log(`[ProfileScreen] Image selected. Type: ${imagePickerType}, Field: ${fieldName}, URI: ${uploadResult.data.imageUrl?.substring(0, 50)}...`);

            handleChange(fieldName, uploadResult.data.imageUrl);
          }
        } catch (pickerError) {
          console.error('Gallery picker launch error:', pickerError);
        }
      });
    } catch (error) {
      setShowImagePicker(false);
      console.error('Gallery picker error:', error);
      Alert.alert('Error', `Failed to open gallery: ${error.message}`);
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestPermissions('camera');
      setShowImagePicker(false);

      if (!hasPermission) return;

      InteractionManager.runAfterInteractions(async () => {
        try {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square aspect ratio for profile
            quality: 0.8,
          });

          if (!result.canceled && result.assets && result.assets[0]) {
            // Simulate upload
            const uploadResult = await uploadFoodImage(result.assets[0].uri);
            // Update the correct field based on imagePickerType
            const fieldName = imagePickerType === 'profile' ? 'profileImage' : 'restaurantImage';
            handleChange(fieldName, uploadResult.data.imageUrl);
          }
        } catch (pickerError) {
          console.error('Camera launch error:', pickerError);
        }
      });
    } catch (error) {
      setShowImagePicker(false);
      console.error('Camera error:', error);
      Alert.alert('Error', `Failed to open camera: ${error.message}`);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSave = async () => {
    console.log('[ProfileScreen] handleSave called');
    console.log('[ProfileScreen] Current formData keys:', Object.keys(formData));
    console.log('[ProfileScreen] profileImage length:', formData.profileImage?.length);
    console.log('[ProfileScreen] restaurantImage length:', formData.restaurantImage?.length);

    // Validate
    const validation = validateProfile(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Validation Error', 'Please fix the errors and try again');
      return;
    }

    try {
      setLoading(true);
      console.log('[ProfileScreen] Sending update request...');
      const response = await updateRestaurantProfile(formData);
      console.log('[ProfileScreen] Update success, response keys:', Object.keys(response.data));

      // Extract the updated user data from response
      const updatedUser = response.data;

      // Update context with both images
      await updateRestaurantData({
        ...formData,
        profileImage: updatedUser.profileImage,
        restaurantImage: updatedUser.restaurantImage,
      });

      // Update local form state to reflect saved images
      setFormData(prev => ({
        ...prev,
        profileImage: updatedUser.profileImage,
        restaurantImage: updatedUser.restaurantImage,
      }));

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            const result = await deleteAccount();
            if (result.success) {
              Alert.alert('Success', 'Your account has been deleted');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete account');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const handleRemoveImage = (field) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => handleChange(field, ''), // Send empty string to remove
          style: 'destructive'
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Header */}
          <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 8 }]}>Profile Image</Text>
            <Text style={[styles.hint, { color: theme.subtext, textAlign: 'center', marginBottom: 12 }]}>
              Personal account image (private)
            </Text>
            <View style={{ position: 'relative' }}>
              <TouchableOpacity onPress={() => { setImagePickerType('profile'); setShowImagePicker(true); }} activeOpacity={0.7}>
                <View style={[styles.avatar, { backgroundColor: theme.primary, overflow: 'hidden' }]}>
                  {formData.profileImage ? (
                    <Image source={{ uri: formData.profileImage }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {restaurant?.name?.charAt(0).toUpperCase()}
                    </Text>
                  )}
                  {/* Camera Overlay */}
                  <View style={styles.cameraOverlay}>
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
              {formData.profileImage ? (
                <TouchableOpacity
                  style={styles.removeButtonSmall}
                  onPress={() => handleRemoveImage('profileImage')}
                >
                  <Ionicons name="trash" size={16} color="#FFF" />
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={[styles.email, { color: theme.subtext, marginTop: 12 }]}>{restaurant?.email}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Restaurant Image Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Restaurant Image</Text>
              <Text style={[styles.hint, { color: theme.subtext, marginBottom: 12 }]}>
                Business storefront/logo (visible to customers)
              </Text>
              <View>
                <TouchableOpacity
                  onPress={() => { setImagePickerType('restaurant'); setShowImagePicker(true); }}
                  activeOpacity={0.7}
                  style={[styles.restaurantImageContainer, { borderColor: theme.border }]}
                >
                  {formData.restaurantImage ? (
                    <Image source={{ uri: formData.restaurantImage }} style={styles.restaurantImagePreview} />
                  ) : (
                    <View style={[styles.restaurantImagePlaceholder, { backgroundColor: theme.inputBg }]}>
                      <Ionicons name="storefront-outline" size={48} color={theme.subtext} />
                      <Text style={[styles.placeholderText, { color: theme.subtext }]}>
                        Add Restaurant Photo
                      </Text>
                    </View>
                  )}
                  <View style={styles.restaurantImageOverlay}>
                    <Ionicons name="camera" size={24} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                {formData.restaurantImage ? (
                  <TouchableOpacity
                    style={styles.removeButtonLarge}
                    onPress={() => handleRemoveImage('restaurantImage')}
                  >
                    <Ionicons name="trash" size={20} color="#FFF" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
              <View style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View>
                  <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Dark Mode</Text>
                  <Text style={[styles.hint, { color: theme.subtext }]}>
                    {isDarkMode ? 'Enable light theme' : 'Enable dark theme'}
                  </Text>
                </View>
                <CustomToggle
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                />
              </View>
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance</Text>
              <TouchableOpacity
                style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => navigation.navigate('Reviews')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#E9D5FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Ionicons name="star" size={18} color="#9139BA" />
                  </View>
                  <View>
                    <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>My Reviews</Text>
                    <Text style={[styles.hint, { color: theme.subtext }]}>
                      View customer ratings and feedback
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            {/* Restaurant Details Section */}
            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>Restaurant Details</Text>

            {/* Restaurant Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Restaurant Name</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
                  errors.name && { borderColor: theme.error }
                ]}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Enter restaurant name"
                placeholderTextColor={theme.subtext}
              />
              {errors.name && <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
                  errors.phone && { borderColor: theme.error }
                ]}
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                placeholder="Enter phone number"
                placeholderTextColor={theme.subtext}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={[styles.errorText, { color: theme.error }]}>{errors.phone}</Text>}
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Address</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
                  errors.address && { borderColor: theme.error }
                ]}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder="Enter complete address"
                placeholderTextColor={theme.subtext}
                multiline
                numberOfLines={3}
              />
              {errors.address && <Text style={[styles.errorText, { color: theme.error }]}>{errors.address}</Text>}
            </View>

            {/* Cuisine Type */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Cuisine Type</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border },
                  errors.cuisineType && { borderColor: theme.error }
                ]}
                value={formData.cuisineType}
                onChangeText={(value) => handleChange('cuisineType', value)}
                placeholder="e.g., Indian, Chinese, Continental"
                placeholderTextColor={theme.subtext}
              />
              {errors.cuisineType && (
                <Text style={[styles.errorText, { color: theme.error }]}>{errors.cuisineType}</Text>
              )}
            </View>

            {/* Restaurant Status */}
            <View style={styles.inputGroup}>
              <View style={[styles.switchRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View>
                  <Text style={[styles.label, { color: theme.text, marginBottom: 0 }]}>Restaurant Status</Text>
                  <Text style={[styles.hint, { color: theme.subtext }]}>
                    {formData.isOpen ? 'Currently accepting orders' : 'Not accepting orders'}
                  </Text>
                </View>
                <CustomToggle
                  value={formData.isOpen}
                  onValueChange={(value) => handleChange('isOpen', value)}
                />
              </View>
            </View>

            {/* Save Button */}
            <CustomButton
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />

            {/* Logout Button */}
            <CustomButton
              title="Logout"
              onPress={handleLogout}
              variant="secondary"
              style={[styles.logoutButton, isDarkMode && { backgroundColor: theme.secondary, borderColor: theme.border }]}
            />

            {/* Delete Account Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView >

      {/* Image Picker Overlay */}
      {
        showImagePicker && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowImagePicker(false)}
            />
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {imagePickerType === 'profile' ? 'Change Profile Photo' : 'Change Restaurant Photo'}
              </Text>

              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: theme.background }]}
                onPress={pickImageFromGallery}
              >
                <View style={[styles.modalIconContainer, { backgroundColor: '#3B82F610' }]}>
                  <Ionicons name="images" size={24} color="#3B82F6" />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={[styles.modalOptionTitle, { color: theme.text }]}>Gallery</Text>
                  <Text style={[styles.modalOptionSubtitle, { color: theme.subtext }]}>Choose from your photos</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: theme.background }]}
                onPress={takePhoto}
              >
                <View style={[styles.modalIconContainer, { backgroundColor: '#9139BA10' }]}>
                  <Ionicons name="camera" size={24} color="#9139BA" />
                </View>
                <View style={styles.modalOptionText}>
                  <Text style={[styles.modalOptionTitle, { color: theme.text }]}>Camera</Text>
                  <Text style={[styles.modalOptionSubtitle, { color: theme.subtext }]}>Take a new photo</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowImagePicker(false)}
              >
                <Text style={[styles.modalCancelText, { color: theme.subtext }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      }
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 14,
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  hint: {
    fontSize: 12,
    marginTop: 2,
  },
  saveButton: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 12,
  },
  deleteButton: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButtonText: {
    color: '#9139BA',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '35%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontSize: 13,
  },
  modalCancel: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  restaurantImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
    position: 'relative',
  },
  restaurantImagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  restaurantImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  restaurantImageOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonSmall: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  removeButtonLarge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default ProfileScreen;
