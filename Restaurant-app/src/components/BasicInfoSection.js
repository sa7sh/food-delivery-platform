import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import CustomToggle from './CustomToggle';
import CustomButton from './CustomButton';

export const BasicInfoSection = ({ formData, errors, handleChange, theme, styles }) => (
  <>
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
  </>
);
