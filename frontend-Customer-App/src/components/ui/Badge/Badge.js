import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme';

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  style 
}) {
  return (
    <View style={[
      styles.badge,
      styles[variant],
      styles[size],
      style
    ]}>
      <Text style={[
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`]
      ]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  // Variants
  default: {
    backgroundColor: colors.gray[100],
  },
  primary: {
    backgroundColor: colors.primary[50],
  },
  success: {
    backgroundColor: '#d1fae5',
  },
  warning: {
    backgroundColor: '#fef3c7',
  },
  error: {
    backgroundColor: colors.primary[50],
  },
  // Sizes
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // Text styles
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  defaultText: {
    color: colors.gray[700],
  },
  primaryText: {
    color: colors.primary[700],
  },
  successText: {
    color: '#065f46',
  },
  warningText: {
    color: '#92400e',
  },
  errorText: {
    color: colors.primary[700],
  },
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
  lgText: {
    fontSize: 14,
  },
});