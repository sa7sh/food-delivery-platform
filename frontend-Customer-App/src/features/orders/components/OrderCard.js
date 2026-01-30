import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ORDER_STATUS } from '../../../constants';
import { useTheme } from '../../../hooks/useTheme';

export default function OrderCard({ order, onPress }) {
  const { colors, isDark } = useTheme();
  const {
    id,
    restaurant,
    items,
    total,
    status,
    createdAt,
  } = order;

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.DELIVERED:
        return colors.success;
      case ORDER_STATUS.CANCELLED:
        return colors.error;
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return '#3b82f6';
      case ORDER_STATUS.PREPARING:
        return '#f59e0b';
      default:
        return colors.textSub;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case ORDER_STATUS.PLACED:
        return 'Order Placed';
      case ORDER_STATUS.CONFIRMED:
        return 'Confirmed';
      case ORDER_STATUS.PREPARING:
        return 'Preparing';
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return 'Out for Delivery';
      case ORDER_STATUS.DELIVERED:
        return 'Delivered';
      case ORDER_STATUS.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-IN', options);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          shadowColor: isDark ? '#000' : '#000',
          borderColor: isDark ? colors.border : 'transparent',
          borderWidth: isDark ? 1 : 0
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Restaurant Info */}
      <View style={styles.header}>
        <Image
          source={{ uri: restaurant.image }}
          style={[styles.restaurantImage, { backgroundColor: colors.surfaceHighlight }]}
          resizeMode="cover"
        />
        <View style={styles.headerInfo}>
          <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
          <Text style={[styles.orderDate, { color: colors.textSub }]}>{formatDate(createdAt)}</Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.items}>
        <Text style={[styles.itemsText, { color: colors.textSub }]}>
          {items.map((item) => item.name).join(', ')}
        </Text>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.totalLabel, { color: colors.textSub }]}>Total</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>₹{total.toFixed(2)}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(status) },
            ]}
          />
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {getStatusText(status)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {status === ORDER_STATUS.DELIVERED && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.primary[500] }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: colors.primary[500] }]}>Reorder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: colors.text }]}>Rate Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16, // More rounded
    padding: 16,
    marginBottom: 16, // More spacing
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 12, // Match card flow
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700', // Bolder
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  items: {
    marginBottom: 16,
  },
  itemsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)', // Subtle pill background
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});