import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const UploadCard = ({ label, field, icon, subtext, imageUri, onPick, styles }) => (
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
