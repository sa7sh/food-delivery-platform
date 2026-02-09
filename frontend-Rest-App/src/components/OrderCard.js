import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StatusBadge from './StatusBadge.js';
import { formatCurrency, formatRelativeTime } from '../utils/formatters.js';
import { useTheme } from '../context/ThemeContext.js';

const OrderCard = ({ order, onPress }) => {
  const { theme } = useTheme();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsText = `${itemCount} item${itemCount > 1 ? 's' : ''}`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => onPress(order)}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.orderNumber, { color: theme.text }]}>{order.orderNumber}</Text>
          <Text style={[styles.time, { color: theme.subtext }]}>{formatRelativeTime(order.createdAt)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>Customer:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{order.customer.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>Items:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{itemsText}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.subtext }]}>Payment:</Text>
          <Text style={[styles.value, { color: theme.text }]}>{order.paymentMethod}</Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.total, { color: theme.primary }]}>{formatCurrency(order.totalAmount)}</Text>
        <Text style={[styles.arrow, { color: theme.subtext }]}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#6C757D',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  content: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#6C757D',
  },
  value: {
    fontSize: 14,
    color: '#2D2D2D',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9139BA',
  },
  arrow: {
    fontSize: 20,
    color: '#6C757D',
  },
});

export default OrderCard;
