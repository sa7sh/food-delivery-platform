import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS } from '../constants/mockData';
import { capitalize } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

const StatusBadge = ({ status }) => {
  const { theme } = useTheme();
  const backgroundColor = STATUS_COLORS[status] || '#757575';

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: '#FFFFFF' }]}>{capitalize(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusBadge;
