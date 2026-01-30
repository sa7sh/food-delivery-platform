import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export default function FoodCard({ food, onPress }) {
  // Safe defaults
  const {
    image = 'https://via.placeholder.com/300',
    discount,
    rating = '4.5',
    time = '25-30 min',
    name = 'Food Item',
    type = 'General',
    restaurantId,
  } = food || {};

  // Extract restaurant info if populated
  const restaurantName = restaurantId?.name || 'Restaurant';
  const cuisineType = restaurantId?.cuisineType || type;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />

        {/* Discount Badge */}
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {discount}
            </Text>
          </View>
        )}

        {/* Like Button */}
        <TouchableOpacity style={styles.likeBtn}>
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
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {name}
        </Text>

        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Ionicons name="restaurant-outline" size={12} color="#9139BA" />
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurantName}
          </Text>
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          {cuisineType}
        </Text>

        {/* Action/Delivery Text */}
        <View style={styles.footer}>
          <View style={styles.deliveryInfo}>
            <Ionicons name="bicycle" size={12} color="#9139BA" style={{ marginRight: 4 }} />
            <Text style={styles.deliveryText}>Free Delivery</Text>
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
});
