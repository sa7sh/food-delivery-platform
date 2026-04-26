import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';

export default function FoodCard({ food, onPress }) {
  const { colors, isDark } = useTheme();

  const {
    image = 'https://via.placeholder.com/300',
    discount,
    offers,
    rating = '4.5',
    time = '25-30 min',
    name = 'Food Item',
    type = 'General',
    restaurantId,
    isVeg = true,
  } = food || {};

  const restaurantName = restaurantId?.name || 'Restaurant';
  const cuisineType = restaurantId?.cuisineType || type;
  const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          placeholder={blurhash}
          contentFit="cover"
          transition={1000}
          style={styles.image}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />

        {offers && offers.length > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{offers[0]}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.likeBtn}>
          <Ionicons name="heart-outline" size={14} color="white" />
        </TouchableOpacity>

        <BlurView intensity={30} tint="dark" style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{rating}</Text>
          <Ionicons name="star" size={10} color="#FFD700" />
        </BlurView>

        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {name}
        </Text>

        <View style={styles.restaurantInfo}>
          <Ionicons name="restaurant-outline" size={12} color={colors.primary[500]} />
          <Text style={[styles.restaurantName, { color: colors.primary[500] }]} numberOfLines={1}>
            {restaurantName}
          </Text>
          <View style={[styles.vegIcon, { borderColor: isVeg ? '#22C55E' : '#EF4444' }]}>
            <View style={[styles.vegDot, { backgroundColor: isVeg ? '#22C55E' : '#EF4444' }]} />
          </View>
        </View>

        <Text style={[styles.subtitle, { color: colors.textSub }]} numberOfLines={1}>
          {cuisineType}
        </Text>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.deliveryInfo}>
            <Ionicons name="bicycle" size={12} color={colors.primary[500]} style={{ marginRight: 4 }} />
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
    borderWidth: 1,
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
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
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
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
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
});
