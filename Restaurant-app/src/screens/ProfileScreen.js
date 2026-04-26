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
import { updateRestaurantProfile } from '../services/api.js';
import CustomButton from '../components/CustomButton.js';
import CustomToggle from '../components/CustomToggle.js';
import { validateProfile } from '../utils/validators.js';
import { useImagePicker } from '../hooks/useImagePicker.js';
import { ImagesSection } from '../components/ImagesSection.js';
import { BasicInfoSection } from '../components/BasicInfoSection.js';

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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const { pickImageFromGallery, takePhoto } = useImagePicker(handleChange);

  const handleGalleryPick = () => {
    setShowImagePicker(false);
    pickImageFromGallery(imagePickerType);
  };

  const handleCameraPick = () => {
    setShowImagePicker(false);
    takePhoto(imagePickerType);
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
            <ImagesSection
              formData={formData}
              handleRemoveImage={handleRemoveImage}
              setShowImagePicker={setShowImagePicker}
              setImagePickerType={setImagePickerType}
              theme={theme}
              styles={styles}
            />

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
            <BasicInfoSection
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              theme={theme}
              styles={styles}
            />


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
                onPress={handleGalleryPick}
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
                onPress={handleCameraPick}
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
