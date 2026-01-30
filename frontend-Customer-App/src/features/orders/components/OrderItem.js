import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export default function OrderItem({ item }) {
  const { name, quantity, price } = item;
  const total = quantity * price;
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.quantity, { color: colors.textSub }]}>x{quantity}</Text>
      </View>
      <Text style={[styles.price, { color: colors.text }]}>₹{total.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  info: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  quantity: {
    fontSize: 13,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
  },
});