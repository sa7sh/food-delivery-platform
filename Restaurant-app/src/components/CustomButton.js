import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import triggerHaptic from '../utils/haptics.js';
import { useTheme } from '../context/ThemeContext.js';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, danger
  loading = false,
  disabled = false,
  style,
}) => {
  const { theme, isDarkMode } = useTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [
          styles.secondaryButton,
          {
            backgroundColor: isDarkMode ? theme.secondary : theme.card,
            borderColor: theme.primary
          }
        ];
      case 'danger':
        return [styles.dangerButton, { backgroundColor: theme.error }];
      default:
        return [styles.primaryButton, { backgroundColor: theme.primary }];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.secondaryText, { color: theme.primary }];
      default:
        return [styles.primaryText, { color: '#FFFFFF' }]; // Always white for primary/danger
    }
  };

  // Scale animation removed

  const handlePressIn = () => {
    // scale effect removed
  };

  const handlePressOut = () => {
    // scale effect removed
  };

  const handlePress = () => {
    if (disabled || loading) return;
    triggerHaptic('light');
    onPress();
  };

  return (
    <Pressable
      style={[
        styles.button,
        getButtonStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#9139BA' : '#FFFFFF'} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#9139BA',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#9139BA',
  },
  dangerButton: {
    backgroundColor: '#DC3545',
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#9139BA',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomButton;
