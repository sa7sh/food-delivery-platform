import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ImagesSection = ({ formData, handleRemoveImage, setShowImagePicker, setImagePickerType, theme, styles }) => (
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
);
