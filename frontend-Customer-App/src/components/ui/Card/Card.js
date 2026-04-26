import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export default function Card({ children, onPress, style, elevated = true }) {
  const Container = onPress ? TouchableOpacity : View;
  const { colors } = useTheme();

  return (
    <Container
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        elevated && styles.elevated,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});