import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const FormInput = ({ label, icon, placeholder, value, field, updateField, keyboardType = 'default', styles }) => (
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
