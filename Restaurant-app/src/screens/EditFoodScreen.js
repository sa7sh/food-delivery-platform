import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Switch,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useFood } from '../context/FoodContext.js';
import { FOOD_CATEGORIES } from '../constants/mockData.js';
import CustomButton from '../components/CustomButton.js';
import { validateFoodItem } from '../utils/validators.js';
import { uploadFoodImage } from '../services/api.js';
import { useTheme } from '../context/ThemeContext.js';

const EditFoodScreen = ({ route, navigation }) => {
  const { foodItem } = route.params;
  const { theme, isDarkMode } = useTheme();
  const { updateFood, deleteFood } = useFood();

  const [formData, setFormData] = useState({
    name: foodItem.name,
    description: foodItem.description,
    price: foodItem.price.toString(),
    category: foodItem.category,
    imageUrl: foodItem.imageUrl,
    isAvailable: foodItem.isAvailable,
    isVeg: foodItem.isVeg !== undefined ? foodItem.isVeg : true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

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

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uploadResult = await uploadFoodImage(result.assets[0].uri);
        handleChange('imageUrl', uploadResult.data.imageUrl);
      }
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

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uploadResult = await uploadFoodImage(result.assets[0].uri);
        handleChange('imageUrl', uploadResult.data.imageUrl);
      }
    } catch (error) {
      setShowImagePicker(false);
      console.error('Camera error:', error);
      Alert.alert('Error', `Failed to open camera: ${error.message}`);
    }
  };

  const handleUpdate = async () => {
    const validation = validateFoodItem({
      ...formData,
      price: parseFloat(formData.price),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert('Validation Error', 'Please fix the errors and try again');
      return;
    }

    try {
      setLoading(true);
      const result = await updateFood(foodItem._id, {
        ...formData,
        price: parseFloat(formData.price),
      });

      if (result.success) {
        Alert.alert('Success', 'Food item updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update food item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Food Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await deleteFood(foodItem._id);
            setLoading(false);

            if (result.success) {
              Alert.alert('Success', 'Food item deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Image Picker */}
        <TouchableOpacity
          style={[styles.imagePicker, { backgroundColor: theme.border }]}
          onPress={() => setShowImagePicker(true)}
        >
          {formData.imageUrl ? (
            <>
              <Image source={{ uri: formData.imageUrl }} style={styles.image} />
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
                <Text style={styles.imageOverlayText}>Change Photo</Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
              <Text style={styles.imagePlaceholderText}>Add Food Image</Text>
              <Text style={styles.imagePlaceholderSubtext}>
                Tap to choose from gallery or camera
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Image Picker Modal */}
        <Modal
          visible={showImagePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Image Source</Text>

              <TouchableOpacity
                style={[styles.modalOption, { backgroundColor: theme.background }]}
                onPress={pickImageFromGallery}
              >
                <View style={[styles.modalIconContainer, { backgroundColor: '#3B82F610' }]}>
                  <Ionicons name="images" size={28} color="#3B82F6" />
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
                  <Ionicons name="camera" size={28} color="#9139BA" />
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
        </Modal>

        {/* Rest of the form */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Food Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="e.g., Butter Chicken"
            placeholderTextColor={theme.subtext}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            placeholder="Describe your dish..."
            placeholderTextColor={theme.subtext}
            multiline
            numberOfLines={3}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Price (₹) *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }, errors.price && styles.inputError]}
            value={formData.price}
            onChangeText={(value) => handleChange('price', value)}
            placeholder="0.00"
            placeholderTextColor={theme.subtext}
            keyboardType="decimal-pad"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Category *</Text>
          <TouchableOpacity
            style={[styles.input, styles.picker, { backgroundColor: theme.card, borderColor: theme.border }, errors.category && styles.inputError]}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={[formData.category ? styles.pickerText : styles.pickerPlaceholder, { color: formData.category ? theme.text : theme.subtext }]}>
              {formData.category || 'Select category'}
            </Text>
            <Ionicons
              name={showCategoryPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6C757D"
            />
          </TouchableOpacity>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          {showCategoryPicker && (
            <View style={[styles.categoryList, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {FOOD_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryItem, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    handleChange('category', category);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={[styles.categoryText, { color: theme.text }]}>{category}</Text>
                  {formData.category === category && (
                    <Ionicons name="checkmark" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={[styles.switchRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View>
              <Text style={[styles.label, { color: theme.text }]}>Available for Orders</Text>
              <Text style={[styles.switchHint, { color: theme.subtext }]}>
                Customers can order this item
              </Text>
            </View>
            <Switch
              value={formData.isAvailable}
              onValueChange={(value) => handleChange('isAvailable', value)}
              trackColor={{ false: theme.border, true: '#86EFAC' }}
              thumbColor={formData.isAvailable ? '#22C55E' : theme.background}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={[styles.switchRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View>
              <Text style={[styles.label, { color: theme.text }]}>Dietary Preference</Text>
              <Text style={[styles.switchHint, { color: theme.subtext }]}>
                {formData.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              </Text>
            </View>
            <Switch
              value={formData.isVeg}
              onValueChange={(value) => handleChange('isVeg', value)}
              trackColor={{ false: '#EF4444', true: '#22C55E' }}
              thumbColor={formData.isVeg ? '#86EFAC' : '#FCA5A5'}
            />
          </View>
        </View>

        <CustomButton
          title="Update Food Item"
          onPress={handleUpdate}
          loading={loading}
          style={styles.updateButton}
        />

        <CustomButton
          title="Delete Food Item"
          onPress={handleDelete}
          variant="danger"
          disabled={loading}
          style={styles.deleteButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
    marginTop: 12,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
    color: '#2D2D2D',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    color: '#2D2D2D',
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontSize: 13,
    color: '#6C757D',
  },
  modalCancel: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6C757D',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D2D2D',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#9139BA',
  },
  errorText: {
    color: '#9139BA',
    fontSize: 12,
    marginTop: 4,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#2D2D2D',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  categoryList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryText: {
    fontSize: 16,
    color: '#2D2D2D',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  switchHint: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 2,
  },
  updateButton: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 12,
    marginBottom: 32,
  },
});

export default EditFoodScreen;
