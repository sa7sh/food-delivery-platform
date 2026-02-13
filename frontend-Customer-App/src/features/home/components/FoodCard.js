import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';

export default function FoodCard({ food, onPress }) {
  const { colors, isDark } = useTheme();

  // Safe defaults
  const {
    image = 'https://via.placeholder.com/300',
    discount,
    rating = '4.5',
    time = '25-30 min',
    name = 'Food Item',
    type = 'General',
    restaurantId,
    isVeg = true,
    isAvailable = true,
  } = food || {};

  // Extract restaurant info if populated
  const restaurantName = restaurantId?.name || 'Restaurant';
  const cuisineType = restaurantId?.cuisineType || type;

  // Blurhash for placeholder
  const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

  return (
    <TouchableOpacity
      onPress={isAvailable ? onPress : null}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1E1E2E' : colors.surface,
          borderColor: isDark ? '#2D2D44' : colors.border,
          shadowColor: isDark ? '#000' : '#64748B',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4
        },
        !isAvailable && styles.cardDisabled
      ]}
      activeOpacity={isAvailable ? 0.9 : 1}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          placeholder={blurhash}
          contentFit="cover"
          transition={1000}
          style={[styles.image, !isAvailable && styles.imageDisabled]}
        />
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />

        {/* Sold Out Overlay */}
        {!isAvailable && (
          <View style={styles.soldOutContainer}>
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>Sold Out</Text>
            </View>
          </View>
        )}

        {/* Discount Badge - Only if available */}
        {isAvailable && discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {discount}
            </Text>
          </View>
        )}

        {/* Like Button */}
        <TouchableOpacity style={styles.likeBtn} disabled={!isAvailable}>
          <Ionicons name="heart-outline" size={14} color="white" />
        </TouchableOpacity>

        {/* Rating Badge */}
        <BlurView intensity={30} tint="dark" style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{rating}</Text>
          <Ionicons name="star" size={10} color="#FFD700" />
        </BlurView>

        {/* Time Badge */}
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={[styles.content, !isAvailable && styles.contentDisabled]}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {name}
        </Text>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Ionicons name="restaurant-outline" size={12} color={!isAvailable ? colors.textSub : colors.primary[500]} />
          <Text style={[styles.restaurantName, { color: !isAvailable ? colors.textSub : colors.primary[500] }]} numberOfLines={1}>
            {restaurantName}
          </Text>
          <View style={[styles.vegIcon, { borderColor: isVeg ? '#22C55E' : '#EF4444', opacity: isAvailable ? 1 : 0.5 }]}>
            <View style={[styles.vegDot, { backgroundColor: isVeg ? '#22C55E' : '#EF4444' }]} />
          </View>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSub }]} numberOfLines={1}>
          {cuisineType}
        </Text>

        {/* Action/Delivery Text */}
        <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border }]}>
          <View style={styles.deliveryInfo}>
            <Ionicons name="bicycle" size={12} color={!isAvailable ? colors.textSub : colors.primary[500]} style={{ marginRight: 4 }} />
            <Text style={[styles.deliveryText, { color: colors.textSub }]}>Free Delivery</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: '#1E1E2E', // Dark card bg
    borderWidth: 1,
    borderColor: '#2D2D44',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomRightRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  likeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ratingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginRight: 4,
  },
  timeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  restaurantName: {
    color: '#9139BA',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
  },
  vegIcon: {
    width: 12,
    height: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Sold Out Styles
  cardDisabled: {
    opacity: 0.8,
  },
  imageDisabled: {
    opacity: 0.4,
  },
  contentDisabled: {
    opacity: 0.6,
  },
  soldOutContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  soldOutBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  soldOutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
