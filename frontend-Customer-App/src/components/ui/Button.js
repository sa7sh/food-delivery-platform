import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors } from '../../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary, outline, ghost
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  className,
  textClassName,
  children,
  ...props
}) {
  // Base styles
  const baseStyles = 'items-center justify-center rounded-xl flex-row';

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-600',
    outline: 'bg-transparent border border-gray-300',
    ghost: 'bg-transparent',
  };

  // Text generic styles
  const textBaseStyles = 'font-bold text-center';

  // Text variant styles
  const textVariantStyles = {
    primary: 'text-white',
    outline: 'text-gray-700',
    ghost: 'text-primary-600',
  };

  // Text size styles
  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const buttonClasses = [
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    disabled || loading ? 'opacity-70' : '',
    className || '',
  ].join(' ');

  const textClasses = [
    textBaseStyles,
    textVariantStyles[variant],
    textSizeStyles[size],
    textClassName || '',
  ].join(' ');

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={buttonClasses}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? 'white' : colors.primary[600]}
        />
      ) : (
        children || <Text className={textClasses}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
