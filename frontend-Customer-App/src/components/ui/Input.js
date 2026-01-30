import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../../theme';

export default function Input({
  label,
  error,
  containerClassName,
  labelClassName,
  inputClassName,
  ...props
}) {
  return (
    <View className={`w-full ${containerClassName || ''}`}>
      {label && (
        <Text className={`text-sm font-semibold text-gray-700 mb-2 ${labelClassName || ''}`}>
          {label}
        </Text>
      )}
      <View
        className={`w-full bg-gray-50 border rounded-xl px-4 py-3 ${error ? 'border-primary-500' : 'border-gray-200'
          }`}
      >
        <TextInput
          placeholderTextColor={colors.gray[400]}
          className={`text-gray-900 text-base ${inputClassName || ''}`}
          style={{ paddingVertical: 0 }}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-xs text-primary-600 mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
