import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ORDER_STATUS } from '../../../constants';
import { useTheme } from '../../../hooks/useTheme';

export default function OrderCard({ order, onPress, onReorder }) {
  const { colors, isDark } = useTheme();
  const [imageError, setImageError] = useState(false);
  const {
    id,
    restaurant,
    items,
    total,
    status,
    createdAt,
  } = order;

  // Determine status color/text
  const getStatusInfo = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case ORDER_STATUS.PLACED:
      case 'PENDING':
        return { text: 'Placed', color: '#F59E0B', bg: '#FEF3C7' }; // Amber
      case ORDER_STATUS.CONFIRMED:
      case 'ACCEPTED':
        return { text: 'Confirmed', color: '#3B82F6', bg: '#DBEAFE' }; // Blue
      case ORDER_STATUS.PREPARING:
        return { text: 'Preparing', color: '#8B5CF6', bg: '#EDE9FE' }; // Violet
      case ORDER_STATUS.READY:
      case 'READY':
        return { text: 'Order Ready', color: '#10B981', bg: '#D1FAE5' }; // Emerald
      case ORDER_STATUS.OUT_FOR_DELIVERY:
        return { text: 'Out for Delivery', color: '#F59E0B', bg: '#FEF3C7' }; // Amber/Orange for transit? Or keep Green?
      case ORDER_STATUS.DELIVERED:
      case 'COMPLETED':
        return { text: 'Delivered', color: '#6B7280', bg: '#F3F4F6' }; // Gray
      case ORDER_STATUS.CANCELLED:
        return { text: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' }; // Red
      case 'REACHED_RESTAURANT':
        return { text: 'Reached Restaurant', color: '#0D9488', bg: '#CCFBF1' }; // Teal
      default:
        return { text: status || 'Unknown', color: colors.textSub, bg: colors.surfaceHighlight };
    }
  };

  const statusInfo = getStatusInfo(status);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const imageUrl = restaurant?.image || restaurant?.profileImage;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          shadowColor: '#000',
          borderColor: isDark ? colors.border : 'transparent',
          borderWidth: isDark ? 1 : 0
        }
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Header: Image + Name + Date */}
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {(items?.[0]?.foodId?.image || items?.[0]?.image) ? (
            <>
              <Image
                source={{ uri: items[0].foodId?.image || items[0].image }}
                placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                contentFit="cover"
                transition={1000}
                style={styles.foodImage}
              />
              {items.length > 1 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>+{items.length - 1}</Text>
                </View>
              )}
            </>
          ) : (
            imageUrl && !imageError ? (
              <Image
                source={{ uri: imageUrl }}
                placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                contentFit="cover"
                transition={1000}
                style={styles.foodImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={[styles.placeholderContainer, { backgroundColor: colors.surfaceHighlight }]}>
                <Ionicons name="restaurant" size={24} color={colors.primary[500]} />
              </View>
            )
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={[styles.restaurantName, { color: colors.text }]} numberOfLines={1}>
            {restaurant?.name || 'Unknown Restaurant'}
          </Text>
          <Text style={[styles.orderDate, { color: colors.textSub }]}>
            {formatDate(createdAt)}
          </Text>
        </View>

        {/* Status Pill */}
        <View style={[styles.statusBadge, { backgroundColor: isDark ? colors.surfaceHighlight : statusInfo.bg }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Items List (Brief) */}
      <View style={styles.content}>
        <Text style={[styles.itemsText, { color: colors.textSub }]} numberOfLines={2}>
          {items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
        </Text>
      </View>

      {/* Footer: Total + Actions */}
      <View style={styles.footer}>
        <View>
          <Text style={[styles.totalLabel, { color: colors.textSub }]}>TOTAL</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>₹{total?.toFixed(2)}</Text>
        </View>

        {/* Reorder Button (Only if delivered) */}
        {status === ORDER_STATUS.DELIVERED && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.rateButton, { borderColor: colors.primary[500] }]}
              onPress={onPress} // Navigate to details to rate
              activeOpacity={0.8}
            >
              <Text style={[styles.rateText, { color: colors.primary[500] }]}>Rate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reorderButton, { backgroundColor: colors.primary[500] }]}
              onPress={onReorder}
              activeOpacity={0.8}
            >
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    width: 60, // Slight increase for better visibility
    height: 60,
    borderRadius: 12,
    position: 'relative',
    // Removed background color here to let images handle it or placeholder
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#1E1E2E', // Dark background for contrast
    borderWidth: 2,
    borderColor: '#2D2D44',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
    opacity: 0.5,
  },
  content: {
    marginBottom: 16,
  },
  itemsText: {
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  reorderButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  reorderText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rateButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  rateText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
