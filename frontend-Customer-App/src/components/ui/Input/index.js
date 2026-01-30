import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

// Simple SVG Icons for eye toggle since we might not have lucide/heroicons installed yet
// or to keep it simple. If vector-icons is available we could use that, but SVGs are safe.
// Assuming we can use simple text or simple shapes if needed, but for now let's use text for toggle
// or we can import Ionicons if we check package.json properly. 
// package.json didn't show vector-icons explicitly but usually it's there with expo.
// Let's use simple Text for "Show/Hide" or just rely on TextInput features.
// Actually, let's try to assume we can use a library if needed, but standard Text is safest if I'm not sure.
// Wait, I saw package.json has "expo" so @expo/vector-icons is likely available standard in Expo.
// But to be 100% safe and reduce crashes, I will use Text for the toggle button or just a simple reliable implementation.

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  inputClassName = '',
  labelClassName = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry;
  const showPassword = isPassword && isPasswordVisible;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className={`mb-2 text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
        </Text>
      )}

      <View
        className={`
          flex-row items-center bg-gray-50 border rounded-2xl px-4 py-3.5
          ${isFocused ? 'border-primary-500 bg-white' : 'border-gray-200'}
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`flex-1 text-base text-gray-900 ${inputClassName}`}
          selectionColor={colors.primary[500]}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity onPress={togglePasswordVisibility} className="ml-2">
            <Text className="text-primary-600 font-medium text-xs">
              {isPasswordVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View className="ml-2">
            {rightIcon}
          </View>
        ) : null}
      </View>

      {error && (
        <Text className="mt-1 text-sm text-red-500 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
