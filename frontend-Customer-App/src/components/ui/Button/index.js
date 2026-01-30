import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { colors } from '../../../theme/colors';

// Variants: primary, secondary, outline, ghost
// Sizes: sm, md, lg

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  className = '',
  textClassName = '',
  ...props
}) {
  // Base styles
  const baseStyles = 'flex-row items-center justify-center rounded-2xl active:opacity-80';

  // Size styles
  const sizeStyles = {
    sm: 'py-2 px-4',
    md: 'py-3.5 px-6',
    lg: 'py-4 px-8',
  };

  // Text size styles
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 shadow-md shadow-primary-200';
      case 'secondary':
        return 'bg-gray-800';
      case 'outline':
        return 'bg-transparent border border-gray-300';
      case 'ghost':
        return 'bg-transparent';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-primary-600';
    }
  };

  // Text color styles
  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return 'text-white font-semibold';
      case 'outline':
        return 'text-gray-900 font-medium';
      case 'ghost':
        return 'text-primary-600 font-medium';
      default:
        return 'text-white font-semibold';
    }
  };

  const buttonStyles = [
    baseStyles,
    sizeStyles[size],
    getVariantStyles(),
    disabled ? 'opacity-50' : '',
    className
  ].join(' ');

  const textStyles = [
    textSizeStyles[size],
    getTextStyles(),
    textClassName
  ].join(' ');

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={buttonStyles}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary[600] : '#ffffff'}
        />
      ) : (
        <>
          {iconLeft && <View className="mr-2">{iconLeft}</View>}
          <Text className={textStyles}>{title}</Text>
          {iconRight && <View className="ml-2">{iconRight}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
