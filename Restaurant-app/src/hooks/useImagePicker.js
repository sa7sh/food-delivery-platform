import { Alert, InteractionManager } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadFoodImage } from '../services/api';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const useImagePicker = (onImagePicked) => {
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

  const pickImageFromGallery = async (imageType) => {
    try {
      const hasPermission = await requestPermissions('gallery');

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
            // Compress image before uploading
            const compressedImage = await manipulateAsync(
              result.assets[0].uri,
              [{ resize: { width: 800 } }], // Resize width to 800px (keeps aspect ratio)
              { compress: 0.7, format: SaveFormat.JPEG } // 70% quality JPEG
            );

            // Simulate upload or just use local URI
            const uploadResult = await uploadFoodImage(compressedImage.uri);
            const fieldName = imageType === 'profile' ? 'profileImage' : 'restaurantImage';
            console.log(`[useImagePicker] Image selected. Type: ${imageType}, Field: ${fieldName}, URI: ${uploadResult.data.imageUrl?.substring(0, 50)}...`);

            onImagePicked(fieldName, uploadResult.data.imageUrl);
          }
        } catch (pickerError) {
          console.error('Gallery picker launch error:', pickerError);
        }
      });
    } catch (error) {
      console.error('Gallery picker error:', error);
      Alert.alert('Error', `Failed to open gallery: ${error.message}`);
    }
  };

  const takePhoto = async (imageType) => {
    try {
      const hasPermission = await requestPermissions('camera');

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
            // Compress image before uploading
            const compressedImage = await manipulateAsync(
              result.assets[0].uri,
              [{ resize: { width: 800 } }],
              { compress: 0.7, format: SaveFormat.JPEG }
            );

            // Simulate upload
            const uploadResult = await uploadFoodImage(compressedImage.uri);
            const fieldName = imageType === 'profile' ? 'profileImage' : 'restaurantImage';
            onImagePicked(fieldName, uploadResult.data.imageUrl);
          }
        } catch (pickerError) {
          console.error('Camera launch error:', pickerError);
        }
      });
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', `Failed to open camera: ${error.message}`);
    }
  };

  return { pickImageFromGallery, takePhoto };
};
