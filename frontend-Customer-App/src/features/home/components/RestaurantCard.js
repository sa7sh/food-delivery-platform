import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

export default function RestaurantCard({ restaurant, onPress, isFavorite, onFavoritePress }) {
  const { colors, isDark } = useTheme();
  const {
    name,
    restaurantImage: customRestaurantImage,
    profileImage,
    image,
    rating,
    ratingCount,
    cuisine,
    cuisineType,
    deliveryTime,
    costForTwo,
    distance,
    offers,
    isOpen = true,
  } = restaurant;

  const displayImage = customRestaurantImage || profileImage || image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
  const cuisineArray = Array.isArray(cuisine) ? cuisine : (cuisineType ? [cuisineType] : ['Restaurant']);

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Restaurant Image */}
      <View style={[styles.imageContainer, { backgroundColor: colors.surfaceHighlight }]}>
        <Image
          source={{ uri: displayImage }}
          style={styles.image}
          resizeMode="cover"
        />
        {!isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
        {offers && offers.length > 0 && (
          <View style={[styles.offerBadge, { backgroundColor: isDark ? colors.surface : colors.white }]}>
            <Text style={[styles.offerText, { color: colors.primary[600] }]}>🎉 {offers[0]}</Text>
          </View>
        )}
        {/* Favorite Icon */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? "#E23744" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      {/* Restaurant Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>

        <View style={styles.row}>
          <View style={styles.rating}>
            <Text style={styles.star}>⭐</Text>
            <Text style={[styles.ratingText, { color: colors.textSub }]}>
              {rating || 4.5} ({ratingCount || 0})
            </Text>
          </View>
          <Text style={[styles.dot, { color: colors.border }]}>•</Text>
          <Text style={[styles.deliveryTime, { color: colors.textSub }]}>{deliveryTime || '25-35 min'}</Text>
        </View>

        <Text style={[styles.cuisine, { color: colors.textSub }]} numberOfLines={1}>
          {cuisineArray.join(', ')}
        </Text>

        <View style={styles.footer}>
          {distance && (
            <Text style={[styles.distance, { color: colors.textSub }]}>{distance}</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  offerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  offerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dot: {
    fontSize: 13,
    marginHorizontal: 6,
  },
  deliveryTime: {
    fontSize: 13,
  },
  cuisine: {
    fontSize: 13,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 13,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  }
});
